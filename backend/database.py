import os
import sqlite3
import json

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "krishimitra.db")

def get_connection():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Profile Table (Legacy)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS profile (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            state TEXT NOT NULL,
            land_size REAL NOT NULL,
            primary_crop TEXT NOT NULL
        )
    """)

    # 2. Soil Logs Table (Legacy)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS soil_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            n INTEGER NOT NULL,
            p INTEGER NOT NULL,
            k INTEGER NOT NULL,
            ph REAL NOT NULL,
            moisture REAL NOT NULL
        )
    """)

    # 3. Diagnostic Scans Table (Legacy)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            crop TEXT NOT NULL,
            disease TEXT NOT NULL,
            severity TEXT NOT NULL,
            organic_remedies TEXT NOT NULL,
            chemical_remedies TEXT NOT NULL,
            leaf_condition TEXT,
            tips TEXT
        )
    """)
    
    # Run automatic ALTER TABLE migrations to support leaf_condition and tips in existing databases
    try:
        cursor.execute("ALTER TABLE scans ADD COLUMN leaf_condition TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE scans ADD COLUMN tips TEXT")
    except Exception:
        pass

    # 4. Users Table (Production Grade Profile)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            state TEXT,
            district TEXT,
            farm_size REAL,
            main_crops TEXT,
            preferred_language TEXT,
            photo_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 5. AI Chat History Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 6. Voice Conversation History Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS voice_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            transcript TEXT NOT NULL,
            duration INTEGER NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            audio_url TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 7. Weather History Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS weather_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            city TEXT NOT NULL,
            temperature REAL NOT NULL,
            humidity REAL NOT NULL,
            condition TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 8. Crop Recommendation History Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS crop_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            crop_name TEXT NOT NULL,
            input_details TEXT NOT NULL, -- JSON string of N, P, K, pH, moisture
            recommendation TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 9. Disease Detection History Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS disease_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            image_url TEXT NOT NULL,
            disease_name TEXT NOT NULL,
            confidence REAL NOT NULL,
            treatment TEXT NOT NULL, -- JSON string of remedies
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # Indexes for Performance Optimization
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_history(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_voice_user ON voice_history(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_weather_user ON weather_history(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_crop_user ON crop_history(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_disease_user ON disease_history(user_id)")

    # Seed Default Profile if empty
    cursor.execute("SELECT COUNT(*) FROM profile")
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            "INSERT INTO profile (name, state, land_size, primary_crop) VALUES (?, ?, ?, ?)",
            ("Rajesh Kumar", "Punjab", 4.5, "Wheat")
        )
        conn.commit()

    # Seed Default User if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            """INSERT INTO users 
            (name, email, phone, state, district, farm_size, main_crops, preferred_language, photo_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            ("Rajesh Kumar", "rajesh@krishimitra.com", "+91 9876543210", "Punjab", "Ludhiana", 4.5, "Wheat,Rice", "hi", "https://api.dicebear.com/7.x/adventurer/svg?seed=Rajesh")
        )
        conn.commit()

    # Seed Soil Logs if empty
    cursor.execute("SELECT COUNT(*) FROM soil_logs")
    if cursor.fetchone()[0] == 0:
        logs = [
            ('10/05/2026', 42, 28, 39, 6.8, 35.0),
            ('15/03/2026', 38, 25, 35, 6.7, 30.0),
            ('12/01/2026', 45, 30, 40, 6.5, 42.0)
        ]
        cursor.executemany(
            "INSERT INTO soil_logs (date, n, p, k, ph, moisture) VALUES (?, ?, ?, ?, ?, ?)",
            logs
        )
        conn.commit()

    # Seed Scans if empty
    cursor.execute("SELECT COUNT(*) FROM scans")
    if cursor.fetchone()[0] == 0:
        scans = [
            (
                'rep-1',
                '10/07/2026, 11:32 AM',
                'Tomato',
                'Early Blight',
                'High',
                json.dumps(["Prune lower leaves to avoid mud splash", "Spray organic copper sulfate formulation"]),
                json.dumps(["Apply Chlorothalonil or Mancozeb fungicide"])
            )
        ]
        cursor.executemany(
            "INSERT INTO scans (id, date, crop, disease, severity, organic_remedies, chemical_remedies) VALUES (?, ?, ?, ?, ?, ?, ?)",
            scans
        )
        conn.commit()

    conn.close()
    print("SQLite Database initialized successfully at:", DB_FILE)

# Legacy Profile wrapper
def get_profile():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name, state, land_size, primary_crop FROM profile ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return {"name": "Rajesh Kumar", "state": "Punjab", "land_size": 4.5, "primary_crop": "Wheat"}

def update_profile(name: str, state: str, land_size: float, primary_crop: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO profile (name, state, land_size, primary_crop) VALUES (?, ?, ?, ?)",
        (name, state, land_size, primary_crop)
    )
    conn.commit()
    conn.close()

# Legacy Soil Logs wrapper
def fetch_soil_logs():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT date, n, p, k, ph, moisture FROM soil_logs ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def insert_soil_log(date: str, n: int, p: int, k: int, ph: float, moisture: float):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO soil_logs (date, n, p, k, ph, moisture) VALUES (?, ?, ?, ?, ?, ?)",
        (date, n, p, k, ph, moisture)
    )
    conn.commit()
    conn.close()

# Legacy Scans wrapper
def fetch_scans():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, date, crop, disease, severity, organic_remedies, chemical_remedies, leaf_condition, tips FROM scans ORDER BY date DESC")
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        d = dict(r)
        try:
            d["organicRemedies"] = json.loads(d["organic_remedies"])
            d["chemicalRemedies"] = json.loads(d["chemical_remedies"])
        except:
            d["organicRemedies"] = []
            d["chemicalRemedies"] = []
        try:
            d["leafCondition"] = d.get("leaf_condition") or ""
            d["tips"] = json.loads(d.get("tips")) if d.get("tips") else []
        except Exception:
            d["leafCondition"] = ""
            d["tips"] = []
        result.append(d)
    return result

def insert_scan(scan_id: str, date: str, crop: str, disease: str, severity: str, organic: list, chemical: list, leaf_condition: str = "", tips: list = None):
    if tips is None:
        tips = []
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO scans (id, date, crop, disease, severity, organic_remedies, chemical_remedies, leaf_condition, tips) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (scan_id, date, crop, disease, severity, json.dumps(organic), json.dumps(chemical), leaf_condition, json.dumps(tips))
    )
    conn.commit()
    conn.close()


# NEW: Production Grade User Profile wrapper
def get_user_profile(user_id: int = 1):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name, email, phone, state, district, farm_size, main_crops, preferred_language, photo_url 
        FROM users WHERE id = ?
    """, (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def update_user_profile(user_id: int, name: str, email: str, phone: str, state: str, district: str, farm_size: float, main_crops: str, preferred_language: str, photo_url: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users 
        SET name = ?, email = ?, phone = ?, state = ?, district = ?, farm_size = ?, main_crops = ?, preferred_language = ?, photo_url = ?
        WHERE id = ?
    """, (name, email, phone, state, district, farm_size, main_crops, preferred_language, photo_url, user_id))
    conn.commit()
    conn.close()

# NEW: AI Chat History wrappers
def fetch_chat_history(user_id: int = 1):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, question, answer, timestamp FROM chat_history WHERE user_id = ? ORDER BY timestamp DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def insert_chat_history(user_id: int, question: str, answer: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO chat_history (user_id, question, answer) VALUES (?, ?, ?)", (user_id, question, answer))
    conn.commit()
    conn.close()

def delete_chat_history_item(chat_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chat_history WHERE id = ?", (chat_id,))
    conn.commit()
    conn.close()

def clear_chat_history(user_id: int = 1):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chat_history WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()

# NEW: Voice Conversation wrappers
def fetch_voice_history(user_id: int = 1):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, transcript, duration, timestamp, audio_url FROM voice_history WHERE user_id = ? ORDER BY timestamp DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def insert_voice_history(user_id: int, transcript: str, duration: int, audio_url: str = None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO voice_history (user_id, transcript, duration, audio_url) VALUES (?, ?, ?, ?)", (user_id, transcript, duration, audio_url))
    conn.commit()
    conn.close()

def delete_voice_history_item(voice_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM voice_history WHERE id = ?", (voice_id,))
    conn.commit()
    conn.close()

# NEW: Weather History wrappers
def fetch_weather_history(user_id: int = 1):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, city, temperature, humidity, condition, timestamp FROM weather_history WHERE user_id = ? ORDER BY timestamp DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def insert_weather_history(user_id: int, city: str, temp: float, humidity: float, condition: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO weather_history (user_id, city, temperature, humidity, condition) VALUES (?, ?, ?, ?, ?)", (user_id, city, temp, humidity, condition))
    conn.commit()
    conn.close()

# NEW: Crop Recommendation wrappers
def fetch_crop_history(user_id: int = 1):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, crop_name, input_details, recommendation, timestamp FROM crop_history WHERE user_id = ? ORDER BY timestamp DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        d = dict(r)
        try:
            d["input_details"] = json.loads(d["input_details"])
        except:
            d["input_details"] = {}
        result.append(d)
    return result

def insert_crop_history(user_id: int, crop_name: str, input_details: dict, recommendation: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO crop_history (user_id, crop_name, input_details, recommendation) VALUES (?, ?, ?, ?)", (user_id, crop_name, json.dumps(input_details), recommendation))
    conn.commit()
    conn.close()

# NEW: Disease Detection wrappers
def fetch_disease_history(user_id: int = 1):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, image_url, disease_name, confidence, treatment, timestamp FROM disease_history WHERE user_id = ? ORDER BY timestamp DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        d = dict(r)
        try:
            d["treatment"] = json.loads(d["treatment"])
        except:
            d["treatment"] = {}
        result.append(d)
    return result

def insert_disease_history(user_id: int, image_url: str, disease_name: str, confidence: float, treatment: dict):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO disease_history (user_id, image_url, disease_name, confidence, treatment) VALUES (?, ?, ?, ?, ?)", (user_id, image_url, disease_name, confidence, json.dumps(treatment)))
    conn.commit()
    conn.close()
