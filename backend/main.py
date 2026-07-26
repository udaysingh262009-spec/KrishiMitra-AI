import os
import urllib.request
import urllib.parse
import json
import re
import hashlib
import random
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

from live_session import GeminiLiveSession

# Load variables from .env file
load_dotenv()

# Import our SQLite database module
import database

app = FastAPI(title="KrishiMitra-Ai Persistence Backend")

# Initialize SQLite database tables and seed records
database.init_db()

# Enable CORS (Cross-Origin Resource Sharing)
# Isse humara React frontend (port 5173) is Python backend (port 8000) se connect ho sakega
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root health check endpoint (Diary note: homepage check)
@app.get("/")
def home():
    return {
        "status": "online",
        "message": "KrishiMitra AI Backend with SQLite Persistency Running Successfully"
    }

# Pydantic schemas for requests validation

class ChatRequest(BaseModel):
    message: str
    image: str | None = None       # Optional Base64 representation of image
    mimeType: str | None = None    # e.g., 'image/jpeg' or 'image/png'

class ScanRequest(BaseModel):
    image: str       # Base64 string of the leaf image
    mimeType: str    # e.g., 'image/jpeg' or 'image/png'

class UserProfileUpdate(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    state: str | None = None
    district: str | None = None
    farmSize: float | None = None
    mainCrops: str | None = None
    preferredLanguage: str | None = None
    photoUrl: str | None = None

class SoilLogAdd(BaseModel):
    n: int
    p: int
    k: int
    ph: float
    moisture: float

class ScanReportAdd(BaseModel):
    id: str
    date: str
    crop: str
    disease: str
    severity: str
    organicRemedies: list[str]
    chemicalRemedies: list[str]
    leafCondition: str | None = ""
    tips: list[str] | None = []

# AI Chat History Request Schema
class ChatSaveRequest(BaseModel):
    question: str
    answer: str

# Voice Conversation Request Schema
class VoiceSaveRequest(BaseModel):
    transcript: str
    duration: int
    audioUrl: str | None = None

# Weather History Request Schema
class WeatherSaveRequest(BaseModel):
    city: str
    temperature: float
    humidity: float
    condition: str

# Crop Recommendation Request Schema
class CropSaveRequest(BaseModel):
    cropName: str
    inputDetails: dict
    recommendation: str

# Disease Detection Request Schema
class DiseaseSaveRequest(BaseModel):
    imageUrl: str
    diseaseName: str
    confidence: float
    treatment: dict


# Database Endpoints

# Helper functions for multi-user profile storage
def get_profile_by_email(email: str):
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name, email, phone, state, district, farm_size, main_crops, preferred_language, photo_url 
        FROM users WHERE LOWER(email) = ?
    """, (email.lower(),))
    row = cursor.fetchone()
    conn.close()
    if row:
        d = dict(row)
        return {
            "name": d.get("name"),
            "email": d.get("email"),
            "phone": d.get("phone"),
            "state": d.get("state"),
            "district": d.get("district"),
            "farm_size": d.get("farm_size"),
            "farmSize": d.get("farm_size"),
            "main_crops": d.get("main_crops"),
            "mainCrops": d.get("main_crops"),
            "preferred_language": d.get("preferred_language"),
            "preferredLanguage": d.get("preferred_language"),
            "photo_url": d.get("photo_url"),
            "photoUrl": d.get("photo_url")
        }
    return None

def create_profile_by_email(email: str, name: str = "Farmer", state: str = "Punjab"):
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (name, email, phone, state, district, farm_size, main_crops, preferred_language, photo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (name, email.lower(), "", state, "Ludhiana", 0.0, "", "en", ""))
    conn.commit()
    conn.close()

def update_profile_by_email(email: str, name: str, phone: str, state: str, district: str, farm_size: float, main_crops: str, preferred_language: str, photo_url: str):
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users 
        SET name = ?, phone = ?, state = ?, district = ?, farm_size = ?, main_crops = ?, preferred_language = ?, photo_url = ?
        WHERE LOWER(email) = ?
    """, (name, phone, state, district, farm_size, main_crops, preferred_language, photo_url, email.lower()))
    conn.commit()
    conn.close()


@app.get("/api/profile")
def get_profile_data(email: str = None):
    try:
        if email and email.strip():
            email_clean = email.strip().lower()
            profile = get_profile_by_email(email_clean)
            if not profile:
                create_profile_by_email(email_clean)
                profile = get_profile_by_email(email_clean)
            return profile

        profile = database.get_user_profile(1)
        if not profile:
            return {
                "name": "Rajesh Kumar",
                "email": "rajesh@krishimitra.com",
                "phone": "+91 9876543210",
                "state": "Punjab",
                "district": "Ludhiana",
                "farm_size": 4.5,
                "farmSize": 4.5,
                "main_crops": "Wheat,Rice",
                "mainCrops": "Wheat,Rice",
                "preferred_language": "hi",
                "preferredLanguage": "hi",
                "photo_url": "https://api.dicebear.com/7.x/adventurer/svg?seed=Rajesh",
                "photoUrl": "https://api.dicebear.com/7.x/adventurer/svg?seed=Rajesh"
            }
        return {
            "name": profile.get("name"),
            "email": profile.get("email"),
            "phone": profile.get("phone"),
            "state": profile.get("state"),
            "district": profile.get("district"),
            "farm_size": profile.get("farm_size"),
            "farmSize": profile.get("farm_size"),
            "main_crops": profile.get("main_crops"),
            "mainCrops": profile.get("main_crops"),
            "preferred_language": profile.get("preferred_language"),
            "preferredLanguage": profile.get("preferred_language"),
            "photo_url": profile.get("photo_url"),
            "photoUrl": profile.get("photo_url")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/profile")
def update_profile_data(req: UserProfileUpdate, email: str = None):
    try:
        if email and email.strip():
            email_clean = email.strip().lower()
            profile = get_profile_by_email(email_clean)
            if not profile:
                create_profile_by_email(email_clean, req.name, req.state)
            update_profile_by_email(
                email_clean,
                req.name,
                req.phone or "",
                req.state or "Punjab",
                req.district or "Ludhiana",
                req.farmSize or 0.0,
                req.mainCrops or "",
                req.preferredLanguage or "en",
                req.photoUrl or ""
            )
            # Sync with legacy table for backwards compatibility
            database.update_profile(req.name, req.state or "Punjab", req.farmSize or 4.5, (req.mainCrops or "Wheat").split(',')[0])
            return {"status": "success", "message": "Profile updated by email in SQLite database"}

        # Legacy update
        database.update_profile(req.name, req.state or "Punjab", req.farmSize or 4.5, (req.mainCrops or "Wheat").split(',')[0])
        database.update_user_profile(
            1,
            req.name,
            req.email or "",
            req.phone or "",
            req.state or "",
            req.district or "",
            req.farmSize or 0.0,
            req.mainCrops or "",
            req.preferredLanguage or "en",
            req.photoUrl or "",
        )
        return {"status": "success", "message": "Profile updated in SQLite database"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/profile/reset")
def reset_profile_data():
    try:
        database.update_profile("Farmer", "Punjab", 0.0, "")
        database.update_user_profile(
            1,
            "Farmer",
            "",
            "",
            "Punjab",
            "Ludhiana",
            0.0,
            "",
            "en",
            ""
        )
        return {"status": "success", "message": "Profile reset to defaults in SQLite database"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/soil-logs")
def get_soil_logs_data():
    try:
        return database.fetch_soil_logs()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/soil-logs")
def add_soil_log_data(req: SoilLogAdd):
    try:
        date_str = datetime.now().strftime("%d/%m/%Y")
        database.insert_soil_log(date_str, req.n, req.p, req.k, req.ph, req.moisture)
        return {"status": "success", "message": "Soil log appended to SQLite"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scans")
def get_scans_data():
    try:
        return database.fetch_scans()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scan-log")
def add_custom_scan_report(req: ScanReportAdd):
    try:
        database.insert_scan(req.id, req.date, req.crop, req.disease, req.severity, req.organicRemedies, req.chemicalRemedies, req.leafCondition or "", req.tips or [])
        return {"status": "success", "message": "Custom diagnostic report logged to SQLite"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# AI Chat History Endpoints
@app.get("/api/history/chat")
def get_chat_history():
    try:
        return database.fetch_chat_history(1)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/history/chat")
def save_chat_history(req: ChatSaveRequest):
    try:
        database.insert_chat_history(1, req.question, req.answer)
        return {"status": "success", "message": "Chat history saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/history/chat/{chat_id}")
def delete_chat_history(chat_id: int):
    try:
        database.delete_chat_history_item(chat_id)
        return {"status": "success", "message": "Chat entry deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/history/chat")
def clear_all_chat_history():
    try:
        database.clear_chat_history(1)
        return {"status": "success", "message": "All chat history cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Voice Conversation Endpoints
@app.get("/api/history/voice")
def get_voice_history():
    try:
        return database.fetch_voice_history(1)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/history/voice")
def save_voice_history(req: VoiceSaveRequest):
    try:
        database.insert_voice_history(1, req.transcript, req.duration, req.audioUrl)
        return {"status": "success", "message": "Voice history saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/history/voice/{voice_id}")
def delete_voice_history(voice_id: int):
    try:
        database.delete_voice_history_item(voice_id)
        return {"status": "success", "message": "Voice entry deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Weather History Endpoints
@app.get("/api/history/weather")
def get_weather_history():
    try:
        return database.fetch_weather_history(1)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/history/weather")
def save_weather_history(req: WeatherSaveRequest):
    try:
        database.insert_weather_history(1, req.city, req.temperature, req.humidity, req.condition)
        return {"status": "success", "message": "Weather history saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Crop Recommendation History Endpoints
@app.get("/api/history/crop")
def get_crop_history():
    try:
        return database.fetch_crop_history(1)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/history/crop")
def save_crop_history(req: CropSaveRequest):
    try:
        database.insert_crop_history(1, req.cropName, req.inputDetails, req.recommendation)
        return {"status": "success", "message": "Crop recommendation saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Disease Detection History Endpoints
@app.get("/api/history/disease")
def get_disease_history():
    try:
        return database.fetch_disease_history(1)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/history/disease")
def save_disease_history(req: DiseaseSaveRequest):
    try:
        database.insert_disease_history(1, req.imageUrl, req.diseaseName, req.confidence, req.treatment)
        return {"status": "success", "message": "Disease detection report saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_simulated_weather(state: str, district: str, mode_suffix: str = "") -> dict:
    date_str = datetime.now().strftime("%Y-%m-%d")
    seed_str = f"{state.lower()}-{district.lower()}-{date_str}"
    seed_hash = int(hashlib.sha256(seed_str.encode("utf-8")).hexdigest(), 16)
    r = random.Random(seed_hash)
    
    state_lower = state.lower()
    if "rajasthan" in state_lower or "gujarat" in state_lower:
        base_temp = r.randint(32, 41)
        humidity = r.randint(30, 60)
        rain_chance = r.randint(5, 35)
    elif "himachal" in state_lower or "uttarakhand" in state_lower or "sikkim" in state_lower:
        base_temp = r.randint(15, 24)
        humidity = r.randint(60, 90)
        rain_chance = r.randint(30, 80)
    elif "kerala" in state_lower or "karnataka" in state_lower or "tamil" in state_lower or "goa" in state_lower:
        base_temp = r.randint(25, 32)
        humidity = r.randint(75, 95)
        rain_chance = r.randint(40, 90)
    else:
        base_temp = r.randint(28, 36)
        humidity = r.randint(55, 80)
        rain_chance = r.randint(20, 65)
        
    conditions = ["Clear", "Sunny", "Mostly Cloudy", "Partly Cloudy", "Light Rain", "Heavy Rain", "Thunderstorms", "Overcast"]
    if rain_chance > 70:
        condition = r.choice(["Heavy Rain", "Thunderstorms", "Overcast"])
    elif rain_chance > 40:
        condition = r.choice(["Light Rain", "Mostly Cloudy", "Overcast"])
    else:
        condition = r.choice(["Clear", "Sunny", "Partly Cloudy"])
        
    wind_speed = r.randint(8, 28)
    visibility = r.randint(5, 10)
    sunrise = f"05:{r.randint(35, 55):02d} AM"
    sunset = f"06:{r.randint(45, 59):02d} PM" if r.choice([True, False]) else f"07:{r.randint(0, 15):02d} PM"
    
    cond_text = f"{condition} {mode_suffix}".strip()
    
    # Generate 5-day simulated forecast
    daily_forecasts = []
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    start_idx = datetime.now().weekday()
    for idx in range(1, 6):
        day_name = days[(start_idx + idx) % 7]
        f_temp_max = base_temp + r.randint(-2, 4)
        f_temp_min = base_temp - r.randint(2, 6)
        f_rain_chance = r.randint(10, 85)
        if f_rain_chance > 60:
            f_cond = "Rain"
        elif f_rain_chance > 35:
            f_cond = "Clouds"
        else:
            f_cond = "Clear"
        daily_forecasts.append({
            "day": day_name,
            "tempMax": f_temp_max,
            "tempMin": f_temp_min,
            "condition": f_cond,
            "rainChance": f"{f_rain_chance}%",
            "icon": f_cond.lower()
        })
        
    return {
        "state": state,
        "district": district,
        "temperature": base_temp,
        "humidity": f"{humidity}%",
        "wind_speed": f"{wind_speed} km/h",
        "condition": cond_text,
        "rain_chance": f"{rain_chance}%",
        "sunrise": sunrise,
        "sunset": sunset,
        "visibility": f"{visibility} km",
        "last_updated": datetime.now().strftime("%d/%m/%Y, %I:%M %p"),
        "forecast": daily_forecasts
    }

@app.get("/api/weather")
def get_weather_forecast(state: str, district: str):
    if not state or not district:
        raise HTTPException(status_code=400, detail="State and district must be provided")
    
    api_key = os.getenv("OPENWEATHERMAP_API_KEY") or "0382cb5e6f6209abbed4a9826174948e"
    
    if api_key:
        try:
            # 1. Resolve Location Coordinates via Geocoding API (with fallback search queries)
            geo_data = None
            search_queries = [
                f"{district},{state},IN",
                f"{district},IN",
                f"{state},IN",
                "Delhi,IN"
            ]
            
            for query in search_queries:
                try:
                    q_str = urllib.parse.quote(query)
                    geo_url = f"https://api.openweathermap.org/geo/1.0/direct?q={q_str}&limit=1&appid={api_key}"
                    geo_req = urllib.request.Request(geo_url, headers={"User-Agent": "Mozilla/5.0"})
                    with urllib.request.urlopen(geo_req, timeout=3) as geo_res:
                        res_data = json.loads(geo_res.read().decode("utf-8"))
                        if res_data and len(res_data) > 0:
                            geo_data = res_data
                            break
                except Exception as geo_err:
                    print(f"Geocoding query '{query}' failed: {str(geo_err)}")
                    continue
            
            if not geo_data:
                raise Exception(f"Geocoding could not locate: {district}, {state} (exhausted all search queries)")
                
            lat = geo_data[0]["lat"]
            lon = geo_data[0]["lon"]

            # 2. Get Weather via Weather endpoint
            w_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
            w_req = urllib.request.Request(w_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(w_req, timeout=4) as w_res:
                w_data = json.loads(w_res.read().decode("utf-8"))
                
                temp = int(w_data["main"]["temp"])
                humidity = w_data["main"]["humidity"]
                wind_speed_ms = w_data["wind"]["speed"]
                wind_speed_kmh = int(wind_speed_ms * 3.6)
                condition = w_data["weather"][0]["main"]
                visibility_m = w_data.get("visibility", 10000)
                visibility_km = int(visibility_m / 1000)
                
                sunrise_ts = w_data["sys"]["sunrise"]
                sunset_ts = w_data["sys"]["sunset"]
                timezone_offset = w_data.get("timezone", 19800)
                sunrise_dt = datetime.fromtimestamp(sunrise_ts, timezone.utc) + timedelta(seconds=timezone_offset)
                sunset_dt = datetime.fromtimestamp(sunset_ts, timezone.utc) + timedelta(seconds=timezone_offset)
                sunrise = sunrise_dt.strftime("%I:%M %p")
                sunset = sunset_dt.strftime("%I:%M %p")
                
                # Approximate rain chance from cloudiness
                clouds = w_data.get("clouds", {}).get("all", 0)
                rain_chance = clouds
                if "rain" in w_data:
                    rain_chance = max(rain_chance, 75)
                
            # 3. Get 5-Day Forecast
            forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
            f_req = urllib.request.Request(forecast_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(f_req, timeout=4) as f_res:
                f_data = json.loads(f_res.read().decode("utf-8"))
                
                today_date_str = datetime.now().strftime("%Y-%m-%d")
                daily_forecasts = []
                for item in f_data.get("list", []):
                    dt_txt = item.get("dt_txt", "")
                    if "12:00:00" in dt_txt:
                        # Skip today's date because it is already displayed on the main card
                        if today_date_str in dt_txt:
                            continue
                        dt_obj = datetime.strptime(dt_txt, "%Y-%m-%d %H:%M:%S")
                        day_name = dt_obj.strftime("%A")
                        
                        temp_max = int(item["main"]["temp_max"])
                        temp_min = int(item["main"]["temp_min"])
                        cond = item["weather"][0]["main"]
                        pop = int(item.get("pop", 0) * 100)
                        
                        daily_forecasts.append({
                            "day": day_name,
                            "tempMax": temp_max,
                            "tempMin": temp_min,
                            "condition": cond,
                            "rainChance": f"{pop}%",
                            "icon": cond.lower()
                        })
                
                return {
                    "state": state,
                    "district": district,
                    "temperature": temp,
                    "humidity": f"{humidity}%",
                    "wind_speed": f"{wind_speed_kmh} km/h",
                    "condition": condition,
                    "rain_chance": f"{rain_chance}%",
                    "sunrise": sunrise,
                    "sunset": sunset,
                    "visibility": f"{visibility_km} km",
                    "last_updated": datetime.now().strftime("%d/%m/%Y, %I:%M %p"),
                    "forecast": daily_forecasts
                }
        except Exception as err:
            return get_simulated_weather(state, district, "")
    else:
        return get_simulated_weather(state, district, "")


def normalize_scan_data(data: dict) -> dict:
    normalized = {}
    normalized["crop"] = data.get("crop") or data.get("cropType") or data.get("Crop") or data.get("crop_type") or "Tomato"
    normalized["disease"] = data.get("disease") or data.get("diseaseName") or data.get("Disease") or data.get("disease_name") or data.get("diagnosis") or "Healthy Crop"
    
    severity_val = data.get("severity") or data.get("Severity") or "None"
    severity_lower = str(severity_val).lower()
    if "high" in severity_lower or "critical" in severity_lower or "severe" in severity_lower:
        normalized["severity"] = "High"
    elif "medium" in severity_lower or "moderate" in severity_lower or "low" in severity_lower:
        normalized["severity"] = "Medium"
    else:
        normalized["severity"] = "None"
        
    normalized["causes"] = data.get("causes") or data.get("Causes") or data.get("cause") or ""
    
    organic = data.get("organicRemedies") or data.get("organic_remedies") or data.get("organic") or data.get("organicRemedy") or []
    if isinstance(organic, str):
        organic = [organic]
    normalized["organicRemedies"] = [str(x) for x in organic]
    
    chemical = data.get("chemicalRemedies") or data.get("chemical_remedies") or data.get("chemical") or data.get("chemicalRemedy") or []
    if isinstance(chemical, str):
        chemical = [chemical]
    normalized["chemicalRemedies"] = [str(x) for x in chemical]
    
    normalized["leafCondition"] = data.get("leafCondition") or data.get("leaf_condition") or data.get("condition") or data.get("leafSymptoms") or data.get("symptoms") or ""
    
    tips_val = data.get("tips") or data.get("Tips") or data.get("expert_tips") or data.get("agronomist_tips") or []
    if isinstance(tips_val, str):
        tips_val = [tips_val]
    normalized["tips"] = [str(x) for x in tips_val]
    
    return normalized

# Helper function to call Google Gemini API directly via HTTP REST
def call_gemini_rest_api(api_key: str, payload: dict) -> str:
    import time
    import urllib.error
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    data_bytes = json.dumps(payload).encode("utf-8")
    
    max_retries = 5
    for attempt in range(max_retries):
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as response:
                res_data = response.read().decode("utf-8")
                res_json = json.loads(res_data)
                text = res_json['candidates'][0]['content']['parts'][0]['text']
                return text
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < max_retries - 1:
                sleep_time = 5 * (attempt + 1)
                print(f"Gemini API 429 received. Retrying in {sleep_time} seconds... (attempt {attempt+1}/{max_retries})", flush=True)
                time.sleep(sleep_time)
                continue
            raise Exception(f"Failed to communicate with Google Gemini REST endpoint: {str(e)}")
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
# Helper function to synthesize text into high-quality voice audio (gTTS MP3 or Gemini WAV base64)
def synthesize_text_to_speech(api_key: str, text: str) -> str:
    import re
    import base64
    
    # Clean text to remove markdown, asterisks, bullet points, and emojis for cleaner speech
    clean_text = re.sub(r'\*\*|###|##|#|\*', '', text)
    clean_text = re.sub(r'●|•|◦|▪', '', clean_text)
    clean_text = re.sub(r'⏰|🎙️|🎤|🔊|📞|✅|❌|⚠️|💡|🌾|🌿|🍅', '', clean_text)
    clean_text = clean_text.replace('\n', '. ').strip()

    # 1. Try Google Translate Text-to-Speech (gTTS) - extremely fast, clear, and reliable
    try:
        from gtts import gTTS
        import io
        
        # Detect Indian languages
        if re.search(r'[\u0980-\u09FF]', clean_text): # Bengali
            lang = 'bn'
        elif re.search(r'[\u0a00-\u0a7f]', clean_text): # Punjabi
            lang = 'pa'
        elif re.search(r'[\u0900-\u097F]', clean_text): # Hindi/Marathi
            lang = 'hi'
        else:
            lang = 'en'
            
        tts = gTTS(text=clean_text, lang=lang, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        audio_bytes = fp.read()
        return base64.b64encode(audio_bytes).decode("utf-8")
    except Exception as e:
        print(f"gTTS synthesis failed, falling back to Gemini TTS: {e}", flush=True)

    # 2. Fallback to Gemini 3.1 TTS Model
    import urllib.request
    import json
    import struct
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key={api_key}"
    payload = {
        "contents": [{
            "parts": [{"text": clean_text}]
        }],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": "Aoede"
                    }
                }
            }
        }
    }
    headers = {"Content-Type": "application/json"}
    data_bytes = json.dumps(payload).encode("utf-8")
    
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = response.read().decode("utf-8")
            res_json = json.loads(res_data)
            part = res_json['candidates'][0]['content']['parts'][0]
            if 'inlineData' in part:
                pcm_b64 = part['inlineData']['data']
                pcm_bytes = base64.b64decode(pcm_b64)
                
                # Convert raw PCM to WAV format
                sample_rate = 24000
                channels = 1
                bits_per_sample = 16
                byte_rate = sample_rate * channels * (bits_per_sample // 8)
                block_align = channels * (bits_per_sample // 8)
                
                header = struct.pack(
                    '<4sI4s4sIHHIIHH4sI',
                    b'RIFF',
                    36 + len(pcm_bytes),
                    b'WAVE',
                    b'fmt ',
                    16,  # Subchunk1Size
                    1,   # AudioFormat (1 = PCM)
                    channels,
                    sample_rate,
                    byte_rate,
                    block_align,
                    bits_per_sample,
                    b'data',
                    len(pcm_bytes)
                )
                wav_bytes = header + pcm_bytes
                return base64.b64encode(wav_bytes).decode("utf-8")
    except Exception as e:
        print(f"Gemini native TTS fallback failed: {e}", flush=True)
    return ""

# Helper function to extract location from a query using Gemini
def extract_location_from_query(api_key: str, message: str) -> tuple:
    prompt = (
        f"Analyze this user query: '{message}'. "
        "Extract the city/district and state name in India if mentioned. "
        "Respond ONLY in a valid JSON format with keys: 'district' (string) and 'state' (string). "
        "If none are mentioned, leave them as empty strings."
    )
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    try:
        response_text = call_gemini_rest_api(api_key, payload)
        text_clean = response_text.strip()
        json_match = re.search(r'(\{.*\})', text_clean, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(1))
        else:
            data = json.loads(text_clean)
        return data.get("district", ""), data.get("state", "")
    except Exception as e:
        print(f"Location extraction failed: {str(e)}")
        return "", ""

# Helper function to fetch a brief weather summary for the assistant context
def fetch_weather_for_assistant(state: str, district: str) -> str:
    if not district:
        return ""
    api_key = os.getenv("OPENWEATHERMAP_API_KEY") or "0382cb5e6f6209abbed4a9826174948e"
    try:
        geo_data = None
        search_queries = [
            f"{district},{state},IN" if state else f"{district},IN",
            f"{district},IN",
            f"{state},IN" if state else "Delhi,IN",
            "Delhi,IN"
        ]
        for query in search_queries:
            try:
                q_str = urllib.parse.quote(query)
                geo_url = f"https://api.openweathermap.org/geo/1.0/direct?q={q_str}&limit=1&appid={api_key}"
                geo_req = urllib.request.Request(geo_url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(geo_req, timeout=3) as geo_res:
                    res_data = json.loads(geo_res.read().decode("utf-8"))
                    if res_data and len(res_data) > 0:
                        geo_data = res_data
                        break
            except:
                continue
        if not geo_data:
            return f"Could not find coordinates for {district}."
        lat = geo_data[0]["lat"]
        lon = geo_data[0]["lon"]

        w_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        w_req = urllib.request.Request(w_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(w_req, timeout=4) as w_res:
            w_data = json.loads(w_res.read().decode("utf-8"))
            temp = int(w_data["main"]["temp"])
            humidity = w_data["main"]["humidity"]
            wind_speed_kmh = int(w_data["wind"]["speed"] * 3.6)
            condition = w_data["weather"][0]["main"]
            
        return f"Real-Time Weather in {district} ({state or 'India'}): Temperature {temp}C, Humidity {humidity}%, Wind {wind_speed_kmh}km/h, Condition: {condition}."
    except Exception as e:
        return f"Error fetching live weather: {str(e)}"

# Local Mock Responses if API Key is not set
MOCK_CHAT_RESPONSES = {
    "fertilizer": "For Wheat, a standard application of N-P-K in a 120:60:40 kg/ha ratio is recommended. Organic options like vermicompost are excellent. Do a soil test to verify exact requirements.",
    "wheat": "Wheat requires cool vegetative stages and warm grain ripening conditions. Keep soil damp. Ensure CRI stage (21 days post sowing) receives adequate watering.",
    "tomato": "Early Blight in tomatoes presents as circular target spots on lower leaves. Cut lower foliage, avoid overhead watering, and spray copper fungicides or organic bio-fungicides.",
    "cotton": "Cotton bolling requires moderate irrigation. Install pheromone traps for pink bollworm management. Add organic potash to improve boll fiber quality.",
}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    weather_context = ""
    msg_lower = request.message.lower()
    
    # Check if the query is weather-related
    weather_keywords = ["weather", "mausam", "temperature", "temp", "rain", "forecast", "humidity", "wind", "baarish", "dhup", "garmi", "thand", "cloud"]
    if any(kw in msg_lower for kw in weather_keywords):
        # Extract location using Gemini model
        district, state = extract_location_from_query(gemini_key, request.message)
        # If no district was mentioned, fall back to "Ludhiana" as a default
        if not district:
            district = "Ludhiana"
            state = "Punjab"
        # Fetch live weather data
        weather_context = fetch_weather_for_assistant(state, district)
        print(f"Weather context injected: {weather_context}")

    # 1. Try Gemini
    if gemini_key:
        try:
            sys_instruction = (
                "You are KrishiMitra-Ai, an expert and friendly Agronomy AI companion for Indian farmers. "
                "Provide helpful, concise answers to questions about soil health, crop management, fertilizers, "
                "watering, plant diseases, and pest preventions. Answer directly and supportively."
            )
            if weather_context:
                sys_instruction += f"\n\nReal-Time Weather Context:\n{weather_context}\nUse this live weather information to answer the user's weather-related questions accurately."
                
            parts = [{"text": request.message}]
            if request.image:
                b64_data = request.image
                if "," in b64_data:
                    b64_data = b64_data.split(",")[1]
                parts.append({
                    "inlineData": {
                        "mimeType": request.mimeType or "image/jpeg",
                        "data": b64_data
                    }
                })

            payload = {
                "contents": [{
                    "parts": parts
                }],
                "systemInstruction": {
                    "parts": [{
                        "text": sys_instruction
                    }]
                }
            }
            response_text = call_gemini_rest_api(gemini_key, payload)
            return {"response": response_text, "audio": ""}
        except Exception as e:
            print(f"Gemini Chat failed, trying fallback: {str(e)}")
            
    # 2. Fallback to Local Mock Responses
    reply = "I understand you are asking about agricultural planning. For specific crop details, please specify if you are sowing Wheat, Paddy, Tomatoes, or Cotton so I can give precise advice."
    for key, val in MOCK_CHAT_RESPONSES.items():
        if key in msg_lower:
            reply = val
            break
    return {"response": f"[Demo Mode - API key quota exhausted]: {reply}", "audio": ""}

class SynthesizeRequest(BaseModel):
    text: str

@app.post("/api/synthesize")
async def synthesize(request: SynthesizeRequest):
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        return {"audio": ""}
    try:
        audio_b64 = synthesize_text_to_speech(gemini_key, request.text)
        return {"audio": audio_b64}
    except Exception as e:
        print(f"Synthesize endpoint failed: {e}", flush=True)
        return {"audio": ""}

# Keras Local Model Integration
keras_model = None
keras_model_loaded = False
keras_model_error = ""

# Standard 38 PlantVillage labels mapping
PLANT_VILLAGE_CLASSES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy", "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy", "Potato___Early_blight",
    "Potato___Late_blight", "Potato___healthy", "Raspberry___healthy", "Soybean___healthy",
    "Squash___Powdery_mildew", "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot", "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

def load_local_keras_model():
    global keras_model, keras_model_loaded, keras_model_error
    keras_model_loaded = False
    keras_model_error = "TensorFlow/PyTorch disabled to avoid DLL crash."
    print(keras_model_error, flush=True)
    return

joblib_model = None
joblib_model_loaded = False
joblib_model_error = ""

def load_local_joblib_model():
    global joblib_model, joblib_model_loaded, joblib_model_error
    joblib_model_loaded = False
    joblib_model_error = "Joblib model disabled to avoid TensorFlow DLL crash."
    print(joblib_model_error, flush=True)
    return

# Run model loading on startup
@app.on_event("startup")
def startup_event():
    load_local_keras_model()
    load_local_joblib_model()

def run_keras_inference(image_b64: str):
    import io
    import base64
    from PIL import Image
    import numpy as np
    
    # 1. Decode base64 image
    img_data = base64.b64decode(image_b64)
    img = Image.open(io.BytesIO(img_data)).convert('RGB')
    
    # 2. Resize to 224x224 (default input dimensions for standard CNNs)
    img = img.resize((224, 224))
    
    # 3. Convert to numpy array and normalize
    img_array = np.array(img, dtype=np.float32) / 255.0
    
    # 4. Expand dimensions to batch size 1 (1, 224, 224, 3)
    img_array = np.expand_dims(img_array, axis=0)
    
    # 5. Run prediction using Torch backend
    import torch
    tensor_input = torch.tensor(img_array)
    predictions = keras_model(tensor_input)
    pred_np = predictions.detach().cpu().numpy() if hasattr(predictions, 'detach') else np.array(predictions)
    
    class_idx = int(np.argmax(pred_np[0]))
    confidence = float(pred_np[0][class_idx])
    
    label = "Unknown Class"
    if class_idx < len(PLANT_VILLAGE_CLASSES):
        label = PLANT_VILLAGE_CLASSES[class_idx]
        
    return label, confidence

# ─── Voice Chat: Accept audio from browser MediaRecorder, send to Gemini ───
class VoiceChatRequest(BaseModel):
    audio: str  # base64 encoded audio data
    mimeType: str = "audio/webm"
    language: str = "en"

@app.post("/api/voice-chat")
async def voice_chat(request: VoiceChatRequest):
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    # Extract raw base64 data (removes "data:audio/...;base64," prefix if present)
    b64_audio = request.audio
    if "," in b64_audio:
        b64_audio = b64_audio.split(",")[1]
    
    lang_name = {
        "hi": "Hindi", "en": "English", "pb": "Punjabi", "mr": "Marathi", "bn": "Bengali"
    }.get(request.language, "Hindi")

    prompt = (
        f"You are KrishiMitra, an expert Indian agriculture AI voice assistant. "
        f"The user has sent an audio recording. Transcribe their words exactly in 'transcript'. "
        f"If the audio is silent or un-understandable background noise, set 'transcript': '' and 'response': ''. "
        f"If a real question is asked, give a clear, direct, and practical agricultural solution in 2-3 spoken sentences. "
        f"Speak warmly and naturally like a helpful farmer friend. "
        f"Do NOT use bullet points, lists, stars, markdown or any formatting. "
        f"Respond in {lang_name} language. "
        f"Format strictly as JSON with keys: 'transcript', 'response' (2-3 sentence clear spoken answer), and 'summary' (1-line short summary). "
        f"Respond ONLY with valid JSON."
    )

    try:
        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inlineData": {
                            "mimeType": request.mimeType,
                            "data": b64_audio
                        }
                    }
                ]
            }]
        }
        response_text = call_gemini_rest_api(gemini_key, payload)
        
        # Parse JSON response
        text_clean = response_text.strip()
        json_match = re.search(r'(\{.*\})', text_clean, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group(1))
        else:
            result = json.loads(text_clean)
        
        transcript = result.get("transcript", "").strip()
        reply = result.get("response", response_text).strip()
        summary = result.get("summary", reply).strip()
        
        if not transcript or not reply:
            return {"transcript": "", "response": "", "summary": "", "audio": ""}

        # Save to chat history
        try:
            database.insert_chat_history(1, f"[Voice] {transcript}", summary)
        except Exception:
            pass
        
        audio_b64 = synthesize_text_to_speech(gemini_key, summary or reply)
        
        return {"transcript": transcript, "response": reply, "summary": summary, "audio": audio_b64}
    except Exception as e:
        print(f"Voice chat Gemini API error: {str(e)}", flush=True)
        return {"transcript": "", "response": f"Voice processing error: {str(e)}", "summary": "Error"}

@app.post("/api/scan")
async def scan_leaf(request: ScanRequest):
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    # Extract raw base64 data (removes "data:image/jpeg;base64," prefix if present)
    b64_data = request.image
    if "," in b64_data:
        b64_data = b64_data.split(",")[1]
        
    date_str = datetime.now().strftime("%d/%m/%Y, %I:%M %p")
    scan_id = f"rep-{int(datetime.now().timestamp() * 1000)}"

    # 1. Try Local Keras Model if loaded successfully
    if keras_model_loaded and keras_model:
        try:
            label, confidence = run_keras_inference(b64_data)
            parts = label.split("___")
            crop = parts[0].replace("_", " ") if len(parts) > 0 else "Unknown"
            disease = parts[1].replace("_", " ") if len(parts) > 1 else "Healthy Crop"
            
            organic = ["Prune lower leaves to avoid mud splash", "Spray organic copper sulfate formulation"]
            chemical = ["Apply Chlorothalonil or Mancozeb fungicide"]
            
            if "healthy" in disease.lower():
                disease = "Healthy Crop"
                severity = "None"
                organic = ["Maintain regular watering schedule"]
                chemical = ["No chemical treatments needed"]
            else:
                severity = "Medium"
                
            data = {
                "crop": f"{crop} [Local Model]",
                "disease": disease,
                "severity": severity,
                "causes": f"Detected locally via plantVillage.keras model (Confidence: {confidence:.1%}).",
                "organicRemedies": organic,
                "chemicalRemedies": chemical,
                "leafCondition": f"The leaf is showing patterns matching {disease} under local CNN scan.",
                "tips": ["Prune lower leaves to avoid mud splash transmission", "Maintain 3-year crop rotation with non-host crops"]
            }
            
            # Log scanned results to SQLite database
            database.insert_scan(
                scan_id,
                date_str,
                data["crop"],
                data["disease"],
                data["severity"],
                data["organicRemedies"],
                data["chemicalRemedies"],
                data["leafCondition"],
                data["tips"]
            )
            return data
        except Exception as e:
            print(f"Local Keras inference failed: {str(e)}. Falling back to Gemini Vision API.")

    prompt = (
        "Analyze this crop leaf photo. Identify:\n"
        "1. The crop type.\n"
        "2. The disease name (if healthy, specify 'Healthy Crop').\n"
        "3. Severity (High, Medium, or None).\n"
        "4. Main causes.\n"
        "5. Organic remedies / medicines (list at least 2).\n"
        "6. Chemical remedies / medicines (list at least 2).\n"
        "7. Leaf condition (a 1-2 sentence description of how the leaf looks, e.g. spots, yellowing).\n"
        "8. Expert agronomist tips (list of 2-3 prevention or health tips).\n"
        "Respond ONLY in a valid JSON format with keys: "
        "'crop', 'disease', 'severity', 'causes', 'organicRemedies' (list of strings), 'chemicalRemedies' (list of strings), 'leafCondition' (string), 'tips' (list of strings)."
    )

    # 1. Try Gemini Leaf Scanner
    if gemini_key:
        try:
            payload = {
                "contents": [{
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": request.mimeType,
                                "data": b64_data
                            }
                        }
                    ]
                }]
            }
            response_text = call_gemini_rest_api(gemini_key, payload)
            
            # Clean JSON formatting
            text_clean = response_text.strip()
            json_match = re.search(r'(\{.*\})', text_clean, re.DOTALL)
            raw_data = {}
            if json_match:
                raw_data = json.loads(json_match.group(1))
            else:
                raw_data = json.loads(text_clean)
            
            data = normalize_scan_data(raw_data)
                
            # Log scanned results to SQLite database
            database.insert_scan(
                scan_id,
                date_str,
                data["crop"],
                data["disease"],
                data["severity"],
                data["organicRemedies"],
                data["chemicalRemedies"],
                data["leafCondition"],
                data["tips"]
            )
            return data
            
        except Exception as e:
            print(f"Gemini leaf scan failed, trying fallback: {str(e)}")
            
    # 2. Fallback to Local Mock Diagnostic
    data = {
        "crop": "Tomato [Demo Mode - API quota exhausted]",
        "disease": "Early Blight (Alternaria solani)",
        "severity": "High",
        "causes": "High humidity, warm temperatures, and wet leaf surface.",
        "organicRemedies": [
            "Prune lower leaves up to 1 foot high to avoid soil-mud splash.",
            "Spray organic copper sulfate formulation early in the morning."
        ],
        "chemicalRemedies": [
            "Apply Chlorothalonil or Mancozeb fungicide."
        ],
        "leafCondition": "Dark circular target spots with concentric rings surrounded by yellow margins on lower leaves.",
        "tips": [
            "Always water crops at the soil level, never overhead, to prevent leaf dampness.",
            "Maintain 3-year crop rotation with non-solanaceous crops."
        ]
    }
    # Log mock scanned results to database
    database.insert_scan(
        scan_id,
        date_str,
        data["crop"],
        data["disease"],
        data["severity"],
        data["organicRemedies"],
        data["chemicalRemedies"],
        data["leafCondition"],
        data["tips"]
    )
    return data

class TranslateRequest(BaseModel):
    crop: str
    disease: str
    organicRemedies: list
    chemicalRemedies: list
    leafCondition: str
    tips: list
    target_lang: str

@app.post("/api/translate-report")
async def translate_report(request: TranslateRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    
    prompt = (
        f"You are a professional agricultural translator. Translate the following crop diagnostic report into simple, "
        f"easy-to-understand native agricultural terms in '{request.target_lang}' language. "
        f"Do not translate scientific names (keep them in parenthesis if needed), but make the rest very simple and direct for a local farmer to read.\n\n"
        f"Report to Translate:\n"
        f"- Crop: {request.crop}\n"
        f"- Disease/Finding: {request.disease}\n"
        f"- Leaf Symptoms/Condition: {request.leafCondition}\n"
        f"- Organic Remedies: {', '.join(request.organicRemedies)}\n"
        f"- Chemical Remedies: {', '.join(request.chemicalRemedies)}\n"
        f"- Expert Tips: {', '.join(request.tips)}\n\n"
        f"Respond ONLY in a valid JSON format with keys: "
        f"'crop', 'disease', 'leafCondition', 'organicRemedies' (list of translated strings), 'chemicalRemedies' (list of translated strings), 'tips' (list of translated strings)."
    )
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        response_text = call_gemini_rest_api(api_key, payload)
        text_clean = response_text.strip()
        json_match = re.search(r'(\{.*\})', text_clean, re.DOTALL)
        data = {}
        if json_match:
            data = json.loads(json_match.group(1))
        else:
            data = json.loads(text_clean)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

@app.websocket("/api/ws/voice")
async def websocket_endpoint(websocket: WebSocket, lang: str = "hi"):
    await websocket.accept()
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    session = GeminiLiveSession(websocket, gemini_key, lang)
    await session.start()

if __name__ == "__main__":
    import uvicorn
    # Starts the ASGI server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
