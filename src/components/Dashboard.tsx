import React, { useState, useEffect } from 'react';
import type { Language, Tab } from '../App';

interface DashboardProps {
  language: Language;
  onNavigate: (tab: Tab) => void;
}

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

const AGRONOMY_TIPS = {
  en: [
    "Tip of the Day: Keep wheat fields damp but not waterlogged during the critical crown root initiation (CRI) stage (approx 21 days after sowing).",
    "Pest Alert: Check cotton leaf undersides weekly for whitefly infestation. Use yellow sticky traps for organic pest containment.",
    "Soil Nutrition: Applying well-decomposed organic farmyard manure improves moisture retention and soil aerations for subsequent cropping.",
    "Fertilizer Guide: Do not mix urea directly with single superphosphate (SSP). Apply nitrogen in split doses for maximum nitrogen uptake.",
    "Weather Advice: Plan spraying schedules during clear weather windows. Avoid pesticide applications if wind speeds exceed 15 km/h."
  ],
  hi: [
    "आज का सुझाव: बुवाई के लगभग 21 दिन बाद गेहूं की फसल में पहली सिंचाई (CRI अवस्था) जरूर करें, जलभराव न होने दें।",
    "कीट सुरक्षा: कपास की पत्तियों के नीचे सफेद मक्खी के संक्रमण की साप्ताहिक जांच करें। जैविक कीट नियंत्रण के लिए पीले चिपचिपे जाल लगाएं।",
    "मिट्टी पोषण: अच्छी तरह से सड़ी हुई जैविक खाद डालने से नमी बनाए रखने की क्षमता और मिट्टी की गुणवत्ता में सुधार होता है।",
    "उर्वरक गाइड: यूरिया को सीधे सिंगल सुपरफास्फेट (SSP) के साथ न मिलाएं। नाइट्रोजन की पूरी प्रभावशीलता के लिए इसे विभाजित खुराकों में दें।",
    "मौसम सलाह: साफ मौसम के दौरान ही छिड़काव की योजना बनाएं। यदि हवा की गति 15 किमी/घंटा से अधिक हो तो कीटनाशक न डालें।"
  ]
};

export const Dashboard: React.FC<DashboardProps> = ({ language, onNavigate }) => {
  const [userName, setUserName] = useState('Farmer');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  useEffect(() => {
    try {
      // 1. Prioritize location from Weather page selections
      const wState = localStorage.getItem('km_weather_state');
      const wDistrict = localStorage.getItem('km_weather_district');

      // 2. Fall back to Profile configurations next
      const cachedProfile = localStorage.getItem('km_user_profile');
      let pName = 'Farmer';
      let pDistrict = '';
      let pState = '';
      
      if (cachedProfile) {
        const profile = JSON.parse(cachedProfile);
        if (profile.name && profile.name.trim()) pName = profile.name;
        pDistrict = profile.district || '';
        pState = profile.state || '';
      }

      setUserName(pName);
      setState(wState || pState || 'Punjab');
      setDistrict(wDistrict || pDistrict || 'Ludhiana');
    } catch (e) {
      console.error("Error loading location details:", e);
    }
  }, []);

  // Cycle tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % 5);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'hi') {
      if (hour < 12) return 'शुभ प्रभात';
      if (hour < 17) return 'नमस्ते';
      return 'शुभ संध्या';
    } else {
      if (hour < 12) return 'Good Morning';
      if (hour < 17) return 'Good Afternoon';
      return 'Good Evening';
    }
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tipsList = language === 'hi' ? AGRONOMY_TIPS.hi : AGRONOMY_TIPS.en;

  return (
    <div className="fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      fontFamily: '"Outfit", sans-serif',
      paddingBottom: '2.5rem',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      
      {/* 1. Header Greeting & Current Date */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <span style={{
          fontSize: '0.8rem',
          color: 'var(--primary)',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          background: 'var(--primary-glow-heavy)',
          padding: '6px 16px',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-glow)'
        }}>
          📅 {getFormattedDate()}
        </span>
        <h2 style={{
          fontSize: '2.25rem',
          fontWeight: 900,
          color: 'var(--text-primary)',
          marginTop: '1.25rem',
          marginBottom: '0.5rem',
          lineHeight: 1.2
        }}>
          {getGreeting()}, <span style={{ color: 'var(--primary)' }}>{userName}</span>!
        </h2>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          maxWidth: '480px',
          margin: '0 auto',
          lineHeight: 1.5
        }}>
          {language === 'hi' 
            ? 'कृषिमित्र डिजिटल कॉकपिट सक्रिय है। आपकी फसल सुरक्षा और स्मार्ट कृषि सलाह के लिए तैयार।' 
            : 'KrishiMitra companion active. Empowering your farm with realtime AI-powered agronomy diagnostics.'}
        </p>
      </div>

      {/* 2. Premium Animated AI Farm Orb */}
      <div className="animate-slide-up" style={{
        position: 'relative',
        width: '200px',
        height: '200px',
        margin: '0.75rem 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animationDelay: '0.22s'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '2.5px dashed #2ecc71',
          borderRadius: '50%',
          opacity: 0.85,
          animation: 'spin 20s linear infinite',
          boxShadow: '0 0 15px rgba(46, 204, 113, 0.4)'
        }} />
        <div style={{
          position: 'absolute',
          width: '170px',
          height: '170px',
          border: '2px solid #3498db',
          borderRadius: '50%',
          opacity: 0.65,
          animation: 'pulse 3s ease-in-out infinite',
          boxShadow: '0 0 20px rgba(52, 152, 219, 0.3)'
        }} />
        <div style={{
          width: '135px',
          height: '135px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,199,132,0.35) 0%, rgba(6,9,12,0.98) 80%)',
          border: '2.5px solid #2ecc71',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(46, 204, 113, 0.65), inset 0 0 15px rgba(129,199,132,0.2)',
          animation: 'float 4s ease-in-out infinite'
        }}>
          <span style={{ fontSize: '2.8rem', animation: 'pulse 2s ease-in-out infinite' }}>🌱</span>

          <span style={{
            fontSize: '0.62rem',
            color: '#2ecc71',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '0.25rem',
            textShadow: '0 0 8px rgba(46,204,113,0.8)'
          }}>
            ✦ KrishiMitra ✦
          </span>
        </div>
      </div>

      {/* 3. District / Sowing Location Status Card */}
      <div className="glass-card animate-slide-up" style={{
        width: '100%',
        maxWidth: '440px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(6,9,12,0.9) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '1rem 1.25rem',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        animationDelay: '0.34s'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(46, 204, 113, 0.08)',
          border: '1px solid rgba(46, 204, 113, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px rgba(46,204,113,0.4))' }}>
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="#2ecc71" />
            <line x1="12" y1="1" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="23" />
            <line x1="1" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="23" y2="12" />
          </svg>
        </div>
        <div style={{ flexGrow: 1 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.15rem 0' }}>
            {language === 'hi' ? 'कृषि स्थान विवरण' : 'Farm Location'}
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            {district && state 
              ? `${district}, ${state}` 
              : (language === 'hi' 
                  ? 'स्थान सेट नहीं है (लधियाना, पंजाब - डिफ़ॉल्ट)' 
                  : 'Ludhiana, Punjab (Default Location)')}
          </p>
        </div>
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--primary)',
          fontWeight: 800,
          background: 'var(--primary-glow-heavy)',
          padding: '4px 8px',
          borderRadius: '8px'
        }}>
          {language === 'hi' ? 'सक्रिय' : 'ACTIVE'}
        </div>
      </div>

      {/* 4. Dynamic Rotating Daily Agronomy Advice Card */}
      <div className="glass-card animate-slide-up" key={currentTipIndex} style={{
        width: '100%',
        maxWidth: '440px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(9, 18, 12, 0.95) 100%)',
        border: '1px solid var(--border-color-hover)',
        borderRadius: '20px',
        padding: '1.25rem',
        textAlign: 'left',
        boxShadow: 'var(--shadow-glow)',
        animationDelay: '0.46s'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>💡</span>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
            {language === 'hi' ? 'आज का कृषि सुझाव' : 'Agronomy Tip of the Day'}
          </h4>
        </div>
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
          lineHeight: 1.45,
          margin: 0,
          fontWeight: 500
        }}>
          {tipsList[currentTipIndex]}
        </p>
      </div>

    </div>
  );
};

