import React, { useState, useEffect } from 'react';
import type { Language } from '../App';
import { INDIAN_STATES_DISTRICTS } from '../utils/indianStatesData';

// Helper function to return dynamic styles based on weather condition
const getAtmosphericTheme = (condition: string) => {
  const cond = condition.toLowerCase();
  if (cond.includes('sunny') || cond.includes('clear')) {
    return {
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(30, 23, 10, 0.8) 100%)',
      glowClass: 'glow-yellow',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      shadow: '0 8px 32px 0 rgba(245, 158, 11, 0.08)',
      accentColor: '#f59e0b',
      glowStyle: { top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, transparent 70%)' }
    };
  }
  if (cond.includes('rain') || cond.includes('shower') || cond.includes('drizzle')) {
    return {
      gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0.85) 100%)',
      glowClass: 'glow-blue',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      shadow: '0 8px 32px 0 rgba(59, 130, 246, 0.08)',
      accentColor: '#3b82f6',
      glowStyle: { top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, transparent 70%)' }
    };
  }
  if (cond.includes('thunder') || cond.includes('storm')) {
    return {
      gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(20, 10, 35, 0.85) 100%)',
      glowClass: 'glow-purple',
      borderColor: 'rgba(139, 92, 246, 0.3)',
      shadow: '0 8px 32px 0 rgba(139, 92, 246, 0.08)',
      accentColor: '#8b5cf6',
      glowStyle: { top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)' }
    };
  }
  // Cloudy or Overcast default
  return {
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(20, 24, 30, 0.8) 100%)',
    glowClass: 'glow-green',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadow: '0 8px 32px 0 rgba(16, 185, 129, 0.08)',
    accentColor: 'var(--primary)',
    glowStyle: { top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%)' }
  };
};

interface ForecastItem {
  day: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  rainChance: string;
  icon: string;
}

interface WeatherData {
  state: string;
  district: string;
  temperature: number;
  humidity: string;
  wind_speed: string;
  condition: string;
  rain_chance: string;
  sunrise: string;
  sunset: string;
  visibility: string;
  last_updated: string;
  forecast: ForecastItem[];
}

interface WeatherPageProps {
  userState: string;
  language: Language;
}

const TRANSLATIONS: Record<Language, {
  title: string;
  selectState: string;
  selectDistrict: string;
  getWeather: string;
  temp: string;
  humidity: string;
  wind: string;
  condition: string;
  rainChance: string;
  sunrise: string;
  sunset: string;
  visibility: string;
  updated: string;
  chooseStateFirst: string;
  errorSelect: string;
  errorFetch: string;
  searchTitle: string;
  alertsTitle: string;
  bulletinDesc: string;
  outlook: string;
  calendarTitle: string;
  currentSeason: string;
  sowingPhase: string;
}> = {
  en: {
    title: 'Weather Forecast',
    selectState: 'Select State',
    selectDistrict: 'Select District / City',
    getWeather: 'Get Weather',
    temp: 'Temperature',
    humidity: 'Humidity',
    wind: 'Wind Speed',
    condition: 'Condition',
    rainChance: 'Rain Probability',
    sunrise: 'Sunrise Time',
    sunset: 'Sunset Time',
    visibility: 'Visibility',
    updated: 'Last Updated',
    chooseStateFirst: 'Choose a state first...',
    errorSelect: 'Please select both a State and a District / City.',
    errorFetch: 'Weather data currently unavailable. Ensure backend server is running.',
    searchTitle: 'Agricultural Weather Center',
    alertsTitle: 'Weather & Agrometeorology Advisory',
    bulletinDesc: 'Advisory alerts based on temperature and precipitation forecasts.',
    outlook: '5-Day Agronomy Outlook',
    calendarTitle: 'Agronomy Calendar',
    currentSeason: 'Current Season: Kharif',
    sowingPhase: 'Sowing & Land Preparation Phase'
  },
  hi: {
    title: 'मौसम पूर्वानुमान',
    selectState: 'राज्य चुनें',
    selectDistrict: 'जिला / शहर चुनें',
    getWeather: 'मौसम की जानकारी प्राप्त करें',
    temp: 'तापमान',
    humidity: 'आर्द्रता (नमी)',
    wind: 'हवा की गति',
    condition: 'मौसम की स्थिति',
    rainChance: 'बारिश की संभावना',
    sunrise: 'सूर्योदय का समय',
    sunset: 'सूर्यास्त का समय',
    visibility: 'दृश्यता',
    updated: 'अंतिम अपडेट',
    chooseStateFirst: 'पहले एक राज्य चुनें...',
    errorSelect: 'कृपया मौसम की जानकारी के लिए राज्य और जिला दोनों चुनें।',
    errorFetch: 'मौसम डेटा वर्तमान में अनुपलब्ध है। सुनिश्चित करें कि बैकएंड सर्वर चल रहा है।',
    searchTitle: 'कृषि मौसम केंद्र',
    alertsTitle: 'मौसम एवं कृषि मौसम विज्ञान सलाह',
    bulletinDesc: 'तापमान और वर्षा के पूर्वानुमानों के आधार पर सलाह अलर्ट।',
    outlook: '5-दिवसीय कृषि मौसम पूर्वानुमान',
    calendarTitle: 'कृषि कैलेंडर',
    currentSeason: 'वर्तमान सीजन: खरीफ',
    sowingPhase: 'बुवाई और भूमि तैयारी चरण'
  },
  pb: {
    title: 'ਮੌਸਮ ਦਾ ਪੂਰਵ-ਅਨੁਮਾਨ',
    selectState: 'ਰਾਜ ਚੁਣੋ',
    selectDistrict: 'ਜ਼ਿਲ੍ਹਾ / ਸ਼ਹਿਰ ਚੁਣੋ',
    getWeather: 'ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ ਲਵੋ',
    temp: 'ਤਾਪਮਾਨ',
    humidity: 'ਨਮੀ',
    wind: 'ਹਵਾ ਦੀ ਗਤੀ',
    condition: 'ਮੌਸਮ ਦੀ ਸਥਿਤੀ',
    rainChance: 'ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ',
    sunrise: 'ਸੂਰਜ ਚੜ੍ਹਨ ਦਾ ਸਮਾਂ',
    sunset: 'ਸੂਰਜ ਡੁੱਬਣ ਦਾ ਸਮਾਂ',
    visibility: 'ਦ੍ਰਿਸ਼ਟੀ',
    updated: 'ਆਖਰੀ ਅਪਡੇਟ',
    chooseStateFirst: 'ਪਹਿਲਾਂ ਇੱਕ ਰਾਜ ਚੁਣੋ...',
    errorSelect: 'ਕਿਰਪਾ ਕਰਕੇ ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ ਲਈ ਰਾਜ ਅਤੇ ਜ਼ਿਲ੍ਹਾ ਦੋਵੇਂ ਚੁਣੋ।',
    errorFetch: 'ਮੌਸਮ ਦਾ ਡਾਟਾ ਇਸ ਵੇਲੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਯਕੀਨੀ ਬਣਾਓ ਕਿ ਬੈਕਐਂਡ ਸਰਵਰ ਚੱਲ ਰਿਹਾ ਹੈ।',
    searchTitle: 'ਖੇਤੀਬਾੜੀ ਮੌਸਮ ਕੇਂਦਰ',
    alertsTitle: 'ਮੌਸਮ ਅਤੇ ਖੇਤੀ ਮੌਸਮ ਵਿਗਿਆਨ ਸਲਾਹ',
    bulletinDesc: 'ਤਾਪਮਾਨ ਅਤੇ ਮੀਂਹ ਦੇ ਪੂਰਵ-ਅਨੁਮਾਨਾਂ ਦੇ ਅਧਾਰ ਤੇ ਸਲਾਹਕਾਰੀ ਚੇਤਾਵਨੀਆਂ।',
    outlook: '5-ਦਿਨਾ ਖੇਤੀਬਾੜੀ ਮੌਸਮ ਦਾ ਅਨੁਮਾਨ',
    calendarTitle: 'ਖੇਤੀਬਾੜੀ ਕੈਲੰਡਰ',
    currentSeason: 'ਮੌਜੂਦਾ ਸੀਜ਼ਨ: ਸਾਉਣੀ (ਖਰੀਫ)',
    sowingPhase: 'ਬਿਜਾਈ ਅਤੇ ਜ਼ਮੀਨ ਤਿਆਰੀ ਪੜਾਅ'
  },
  mr: {
    title: 'हवामान अंदाज',
    selectState: 'राज्य निवडा',
    selectDistrict: 'जिल्हा / शहर निवडा',
    getWeather: 'हवामान मिळवा',
    temp: 'तापमान',
    humidity: 'आर्द्रता (ओलावा)',
    wind: 'वाऱ्याचा वेग',
    condition: 'हवामान स्थिती',
    rainChance: 'पावसाची शक्यता',
    sunrise: 'सूर्योदय वेळ',
    sunset: 'सूर्यास्त वेळ',
    visibility: 'दृश्यमानता',
    updated: 'शेवटचे अद्यतन',
    chooseStateFirst: 'प्रथम राज्य निवडा...',
    errorSelect: 'कृपया हवामान अंदाज मिळवण्यासाठी राज्य आणि जिल्हा दोन्ही निवडा.',
    errorFetch: 'हवामान डेटा सध्या उपलब्ध नाही. कृपया बॅकएंड सर्व्हर सुरू असल्याची खात्री करा.',
    searchTitle: 'कृषी हवामान केंद्र',
    alertsTitle: 'हवामान आणि कृषी सल्ला bulletin',
    bulletinDesc: 'तापमान आणि पावसाच्या अंदाजानुसार शेती विषयक इशारे.',
    outlook: '5-दिवसीय कृषी हवामान अंदाज',
    calendarTitle: 'कृषी दिनदर्शिका',
    currentSeason: 'चालू हंगाम: खरीप',
    sowingPhase: 'पेरणी आणि जमीन तयारीचा टप्पा'
  },
  bn: {
    title: 'আবহাওয়ার পূর্বাভাস',
    selectState: 'রাজ্য নির্বাচন করুন',
    selectDistrict: 'জেলা / শহর নির্বাচন করুন',
    getWeather: 'আবহাওয়ার তথ্য খুঁজুন',
    temp: 'তাপমাত্রা',
    humidity: 'আর্দ্রতা',
    wind: 'বাতাসের গতিবেগ',
    condition: 'আবহাওয়ার অবস্থা',
    rainChance: 'বৃষ্টির সম্ভাবনা',
    sunrise: 'সূর্যোদয়',
    sunset: 'সূর্যাস্ত',
    visibility: 'দৃশ্যমানতা',
    updated: 'সর্বশেষ আপডেট',
    chooseStateFirst: 'প্রথমে একটি রাজ্য নির্বাচন করুন...',
    errorSelect: 'আবহাওয়ার পূর্বাভাসের জন্য অনুগ্রহ করে রাজ্য এবং জেলা উভয়ই নির্বাচন করুন।',
    errorFetch: 'আবহাওয়ার তথ্য এই মুহূর্তে পাওয়া যাচ্ছে না। ব্যাকএন্ড সার্ভার সচল আছে কিনা দেখুন।',
    searchTitle: 'কৃষি আবহাওয়া কেন্দ্র',
    alertsTitle: 'আবহাওয়া ও কৃষি আবহাওয়া বুলেটিন',
    bulletinDesc: 'তাপমাত্রা এবং বৃষ্টিপাতের পূর্বাভাসের উপর ভিত্তি করে কৃষি বিষয়ক সতর্কতা।',
    outlook: '৫-দিনের কৃষি আবহাওয়ার পূর্বাভাস',
    calendarTitle: 'কৃষি ক্যালেন্ডার',
    currentSeason: 'বর্তমান ঋতু: খরিফ',
    sowingPhase: 'রোপণ ও জমি প্রস্তুতকরণ পর্যায়'
  }
};

export const WeatherPage: React.FC<WeatherPageProps> = ({ userState, language }) => {
  // Persistence Caching load initial values
  const [selectedState, setSelectedState] = useState(() => localStorage.getItem('km_weather_state') || userState || '');
  const [selectedDistrict, setSelectedDistrict] = useState(() => localStorage.getItem('km_weather_district') || '');
  const [weather, setWeather] = useState<WeatherData | null>(() => {
    const cached = localStorage.getItem('km_cached_weather');
    if (!cached) return null;
    try {
      const parsed = JSON.parse(cached);
      // Format today's date as DD/MM/YYYY to verify cache validity
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const todayStr = `${dd}/${mm}/${yyyy}`;
      
      if (parsed.last_updated && parsed.last_updated.startsWith(todayStr)) {
        return parsed;
      }
    } catch (e) {
      // ignore
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  const t = TRANSLATIONS[language];
  const states = Object.keys(INDIAN_STATES_DISTRICTS).sort();
  const districts = selectedState ? INDIAN_STATES_DISTRICTS[selectedState].sort() : [];

  // Auto-fetch if cache is empty/expired but location is saved
  useEffect(() => {
    if (selectedState && selectedDistrict && !weather) {
      const autoFetch = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
          const res = await fetch(`http://localhost:8000/api/weather?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`);
          if (res.ok) {
            const data = await res.json();
            setWeather(data);
            localStorage.setItem('km_weather_state', selectedState);
            localStorage.setItem('km_weather_district', selectedDistrict);
            localStorage.setItem('km_cached_weather', JSON.stringify(data));
            
            // Log to SQLite weather history
            try {
              fetch('http://localhost:8000/api/history/weather', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  city: selectedDistrict,
                  temperature: Number(data.temperature) || 0,
                  humidity: Number(data.humidity.replace('%', '')) || 0,
                  condition: data.condition
                })
              });
            } catch (e) {}
          }
        } catch (err) {
          // silent fallback
        } finally {
          setLoading(false);
        }
      };
      autoFetch();
    }
  }, []);

  // Clock tick trigger
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFetchWeather = async () => {
    if (!selectedState || !selectedDistrict) {
      setErrorMsg(t.errorSelect);
      setWeather(null);
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/api/weather?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`);
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
        
        // Cache weather data in localStorage
        localStorage.setItem('km_weather_state', selectedState);
        localStorage.setItem('km_weather_district', selectedDistrict);
        localStorage.setItem('km_cached_weather', JSON.stringify(data));

        // Log to SQLite weather history
        try {
          fetch('http://localhost:8000/api/history/weather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              city: selectedDistrict,
              temperature: Number(data.temperature) || 0,
              humidity: Number(data.humidity.replace('%', '')) || 0,
              condition: data.condition
            })
          });
        } catch (e) {}
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      setErrorMsg(t.errorFetch);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (st: string) => {
    setSelectedState(st);
    localStorage.setItem('km_weather_state', st);
    setSelectedDistrict('');
    localStorage.removeItem('km_weather_district');
  };

  const handleDistrictChange = (dt: string) => {
    setSelectedDistrict(dt);
    localStorage.setItem('km_weather_district', dt);
  };

  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('sunny') || cond.includes('clear')) return '☀️';
    if (cond.includes('thunder')) return '⛈️';
    if (cond.includes('rain') || cond.includes('shower')) return '🌧️';
    if (cond.includes('cloudy') || cond.includes('overcast')) return '☁️';
    return '⛅';
  };

  // Calendar formats
  const displayDay = currentTime.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'pb' ? 'pa-IN' : language === 'mr' ? 'mr-IN' : language === 'bn' ? 'bn-IN' : 'en-IN', { weekday: 'long' });
  const displayDate = currentTime.getDate();
  const displayMonthYear = currentTime.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'pb' ? 'pa-IN' : language === 'mr' ? 'mr-IN' : language === 'bn' ? 'bn-IN' : 'en-IN', { month: 'long', year: 'numeric' });
  const displayClock = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className="fade-in" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      
      {/* Left Column: Input and weather info (flex-grow) */}
      <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Dropdowns card */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{t.title}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t.searchTitle}</p>

          {errorMsg && (
            <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', border: '1px solid var(--danger)', fontSize: '0.85rem', padding: '0.65rem 1rem', borderRadius: 'var(--border-radius-sm)', marginBottom: '1rem' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="soil-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            
            {/* State Select */}
            <div className="form-group">
              <label style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.selectState}</label>
              <select 
                className="form-select" 
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
              >
                <option value="">-- Choose State --</option>
                {states.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* District Select */}
            <div className="form-group">
              <label style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.selectDistrict}</label>
              <select 
                className="form-select" 
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!selectedState}
              >
                <option value="">
                  {selectedState ? '-- Choose District / City --' : t.chooseStateFirst}
                </option>
                {districts.map(dt => (
                  <option key={dt} value={dt}>{dt}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button 
              className="primary-btn" 
              style={{ 
                height: '42px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem',
                fontWeight: 600
              }}
              onClick={handleFetchWeather}
              disabled={loading}
            >
              {loading ? (
                <div className="logo-ring" style={{ width: '18px', height: '18px', animation: 'spin 1.5s linear infinite', borderStyle: 'solid', borderColor: 'var(--bg-base)' }}></div>
              ) : (
                '⛅'
              )}
              {t.getWeather}
            </button>
          </div>
        </div>

        {/* Loaded Weather stats */}
        {weather && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Temperature header card */}
            {(() => {
              const theme = getAtmosphericTheme(weather.condition);
              return (
                <div className="glass-card" style={{
                  background: theme.gradient,
                  border: `1px solid ${theme.borderColor}`,
                  boxShadow: theme.shadow,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '24px',
                  transition: 'all 0.5s ease-in-out'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    width: '200px',
                    height: '200px',
                    background: theme.glowStyle.background,
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                    pointerEvents: 'none'
                  }}></div>
                  
                  <div style={{ zIndex: 10 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>📍</span>
                      <div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{weather.district}</h3>
                        <p style={{ fontSize: '0.85rem', color: theme.accentColor }}>{weather.state}</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '1.5rem' }}>
                      <span style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {weather.temperature}
                      </span>
                      <span style={{ fontSize: '2rem', fontWeight: 600, color: theme.accentColor, alignSelf: 'flex-start', marginTop: '0.5rem' }}>°C</span>
                    </div>
                    
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                      {weather.condition}
                    </p>
                  </div>

                  <div style={{ fontSize: '6.5rem', zIndex: 10, filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.15))', userSelect: 'none', animation: 'float 6s ease-in-out infinite' }}>
                    {getWeatherIcon(weather.condition)}
                  </div>
                </div>
              );
            })()}

            {/* Subcards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div className="glass-card" style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '2rem' }}>💧</div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{t.humidity}</p>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{weather.humidity}</h4>
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', padding: '1rem 1.25rem' }}>
                {/* Wind Compass Indicator */}
                <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                  <svg width="42" height="42" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="38" fill="rgba(255,255,255,0.02)" />
                    {/* Compass North Marker */}
                    <text x="50" y="24" fontSize="16" fontWeight="900" fill="#e74c3c" textAnchor="middle">N</text>
                    {/* Wind Needle rotating based on a angle derived from district name */}
                    {(() => {
                      const angle = (weather.district.charCodeAt(0) * 17) % 360;
                      return (
                        <g transform={`rotate(${angle} 50 50)`} style={{ transition: 'transform 1s ease' }}>
                          <polygon points="50,15 42,50 50,42" fill="#2ecc71" />
                          <polygon points="50,15 58,50 50,42" fill="#27ae60" />
                          <polygon points="50,85 42,50 50,42" fill="rgba(255,255,255,0.2)" />
                          <polygon points="50,85 58,50 50,42" fill="rgba(255,255,255,0.15)" />
                          <circle cx="50" cy="50" r="6" fill="var(--bg-base)" />
                        </g>
                      );
                    })()}
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{t.wind}</p>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{weather.wind_speed}</h4>
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '2rem' }}>🌧️</div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{t.rainChance}</p>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{weather.rain_chance}</h4>
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '2rem' }}>🌅</div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{t.sunrise} / {t.sunset}</p>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{weather.sunrise} / {weather.sunset}</h4>
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '2rem' }}>👁️</div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{t.visibility}</p>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{weather.visibility}</h4>
                </div>
              </div>
            </div>

            {/* 5-Day Outlook */}
            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                📊 {t.outlook}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.75rem' }}>
                {weather.forecast && weather.forecast.map((f, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '1rem 0.5rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{f.day.substring(0, 3)}</span>
                    <span style={{ fontSize: '1.75rem', filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.1))' }}>
                      {getWeatherIcon(f.condition)}
                    </span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {f.tempMax}° / <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{f.tempMin}°</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.condition}</span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.1rem' }}>
                      🌧️ {f.rainChance}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Updated */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: 'var(--text-muted)', paddingInline: '4px' }}>
              🕒 {t.updated}: {weather.last_updated}
            </div>
          </div>
        )}

        {/* Agricultural Alerts bulletin */}
        <div className="glass-card">
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>⚠️ {t.alertsTitle}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{t.bulletinDesc}</p>
          
          <div style={{
            padding: '1rem',
            background: 'rgba(230, 126, 34, 0.05)',
            border: '1px solid rgba(230, 126, 34, 0.25)',
            borderRadius: 'var(--border-radius-md)',
            display: 'flex',
            gap: '0.85rem',
            alignItems: 'flex-start',
            boxShadow: '0 0 15px rgba(230, 126, 34, 0.05)',
            animation: 'pulseAlert 3s infinite alternate'
          }}>
            <div style={{ fontSize: '1.5rem' }}>📢</div>
            <div>
              <h5 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.88rem' }}>
                {language === 'en' ? 'Sowing & Irrigation Timings Advice' : 'बुवाई और सिंचाई सलाह'}
              </h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                {language === 'en' 
                  ? 'High humidity during morning periods increases risk of fungal spores. Sowing seeds require watering only in early morning or sunset schedules. Avoid pesticide sprays if rain probability exceeds 60%.' 
                  : 'सुबह के समय अधिक आर्द्रता होने से फंगस का खतरा बढ़ जाता है। बुवाई के समय केवल सुबह जल्दी या सूर्यास्त के समय ही सिंचाई करें। यदि वर्षा की संभावना 60% से अधिक हो तो कीटनाशक छिड़काव से बचें।'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Premium Calendar Card (max-width: 320px) */}
      <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '320px', width: '100%' }}>
        
        {/* Tear-off Calendar Widget */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          
          {/* Calendar top binder bar */}
          <div style={{ 
            background: 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)', 
            height: '36px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative',
            borderBottom: '2px solid rgba(0,0,0,0.15)',
            boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.1)'
          }}>
            {/* Binder rings */}
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', position: 'absolute', top: '-8px' }}>
              <div style={{ width: '8px', height: '18px', background: 'linear-gradient(#bdc3c7, #7f8c8d)', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}></div>
              <div style={{ width: '8px', height: '18px', background: 'linear-gradient(#bdc3c7, #7f8c8d)', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}></div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px', color: '#ffffff', textShadow: '1px 1px 2px rgba(0,0,0,0.3)', marginTop: '4px' }}>
              {t.calendarTitle.toUpperCase()}
            </span>
          </div>

          {/* Calendar Inner body */}
          <div style={{ padding: '2rem 1rem 1.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {displayDay}
            </span>
            
            <div style={{ 
              fontSize: '4.5rem', 
              fontWeight: 800, 
              color: 'var(--text-primary)', 
              lineHeight: 1,
              margin: '0.25rem 0',
              fontFamily: 'Outfit, sans-serif'
            }}>
              {displayDate}
            </div>

            <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {displayMonthYear}
            </span>

            {/* Glow separator */}
            <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }}></div>

            {/* Glowing clock */}
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: 'var(--accent)', 
              fontFamily: 'monospace', 
              letterSpacing: '1px',
              textShadow: '0 0 8px var(--accent-glow)'
            }}>
              ⏰ {displayClock}
            </div>
          </div>
        </div>

        {/* Agricultural Seasonal Indicator card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🌱</span>
            <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.currentSeason}</h5>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            <strong>{t.sowingPhase}:</strong> Sowing of paddy, maize, cotton, and groundnuts. Keep monitoring soil moisture using the soil logs to optimize seed germination rates.
          </p>
        </div>

      </div>

    </div>
  );
};
