import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Diagnostics } from './components/Diagnostics';
import { ChatAssistant } from './components/ChatAssistant';
import { Profile } from './components/Profile';
import { WeatherPage } from './components/WeatherPage';
import { SplashScreen } from './components/SplashScreen';
import { API_BASE_URL } from './config';

export type Tab = 'dashboard' | 'weather' | 'diagnostics' | 'chat' | 'profile';
export type Language = 'en' | 'hi' | 'pb' | 'mr' | 'bn';

const TRANSLATIONS: Record<Language, {
  logout: string;
  dashboard: string;
  weather: string;
  recommendation: string;
  diagnostics: string;
  chat: string;
  profile: string;
  history: string;
  schemes: string;
  mandi: string;
  version: string;
  welcome: string;
  overview: string;
  regionalWeather: string;
  weatherSubtitle: string;
  engineTitle: string;
  engineSubtitle: string;
  detectionTitle: string;
  detectionSubtitle: string;
  assistantTitle: string;
  assistantSubtitle: string;
  profileTitle: string;
  profileSubtitle: string;
  historyTitle: string;
  historySubtitle: string;
  schemesTitle: string;
  schemesSubtitle: string;
  mandiTitle: string;
  mandiSubtitle: string;
}> = {
  en: {
    logout: 'Logout Profile',
    dashboard: 'Home',
    weather: 'Weather Forecast',
    recommendation: 'Crop Advisor',
    diagnostics: 'Disease Detection',
    chat: 'AI Assistant',
    profile: 'My Profile',
    history: 'Farming Logs',
    schemes: 'Govt Schemes',
    mandi: 'Mandi Prices',
    version: 'Version 1.3.0',
    welcome: 'Welcome back, Farmer',
    overview: 'Overview for your farm in',
    regionalWeather: 'Regional Weather Center',
    weatherSubtitle: 'Live agricultural forecasts and warnings for',
    engineTitle: 'Crop Recommendation Engine',
    engineSubtitle: 'Enter soil and seasonal values to calculate recommended crops.',
    detectionTitle: 'Plant Disease Diagnostics',
    detectionSubtitle: 'Scan crop leaves to detect structural health and get remedies.',
    assistantTitle: 'KrishiMitra AI Assistant',
    assistantSubtitle: 'Chat or talk to our agronomist AI about crop protection.',
    profileTitle: 'Farmer Profile & Records',
    profileSubtitle: 'Manage land size, contact records, and active crops.',
    historyTitle: 'Farming Logs & History',
    historySubtitle: 'Review your past diagnostics reports and crop searches.',
    schemesTitle: 'Government Schemes Portal',
    schemesSubtitle: 'Explore benefits, subsidies, and calculate eligibility.',
    mandiTitle: 'Mandi Market Index',
    mandiSubtitle: 'Real-time commodity rates & historical price charts.'
  },
  hi: {
    logout: 'प्रोफ़ाइल लॉगआउट',
    dashboard: 'मुख्य पृष्ठ',
    weather: 'मौसम पूर्वानुमान',
    recommendation: 'फसल सलाहकार',
    diagnostics: 'रोग जांच',
    chat: 'एआई सहायक',
    profile: 'मेरी प्रोफ़ाइल',
    history: 'कृषि लॉग',
    schemes: 'सरकारी योजनाएं',
    mandi: 'मंडी भाव',
    version: 'संस्करण 1.3.0',
    welcome: 'स्वागत है, किसान',
    overview: 'आपके खेत की जानकारी, राज्य:',
    regionalWeather: 'क्षेत्रीय मौसम केंद्र',
    weatherSubtitle: 'कृषि मौसम पूर्वानुमान और चेतावनियां, क्षेत्र:',
    engineTitle: 'फ़सल अनुशंसा इंजन',
    engineSubtitle: 'मिट्टी और मौसम के अनुसार सही फ़सल की गणना करें।',
    detectionTitle: 'पौधे रोग जांच',
    detectionSubtitle: 'पौधे की पत्ती को स्कैन करके रोग और उपचार का पता लगाएं।',
    assistantTitle: 'कृषि मित्र एआई सहायक',
    assistantSubtitle: 'फ़सल सुरक्षा के बारे में हमारे एआई से बात या चैट करें।',
    profileTitle: 'किसान प्रोफ़ाइल और रिकॉर्ड',
    profileSubtitle: 'खेत का आकार और सक्रिय फ़सलें प्रबंधित करें।',
    historyTitle: 'कृषि लॉग और इतिहास',
    historySubtitle: 'अपनी पिछली जांच रिपोर्ट और फ़सल खोजों की समीक्षा करें।',
    schemesTitle: 'सरकारी योजना पोर्टल',
    schemesSubtitle: 'लाभों, सब्सिडी का पता लगाएं और पात्रता की गणना करें।',
    mandiTitle: 'मंडी बाजार सूचकांक',
    mandiSubtitle: 'वास्तविक समय की वस्तु दरें और ऐतिहासिक मूल्य चार्ट।'
  },
  pb: {
    logout: 'ਪ੍ਰੋਫਾਈਲ ਲੌਗਆਉਟ',
    dashboard: 'ਮੁੱਖ ਪੰਨਾ',
    weather: 'ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ',
    recommendation: 'ਫਸਲ ਸਲਾਹਕਾਰ',
    diagnostics: 'ਫਸਲ ਰੋਗ ਜਾਂਚ',
    chat: 'ਏਆਈ ਸਹਾਇਕ',
    profile: 'ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ',
    history: 'ਖੇਤੀ ਰਿਕਾਰਡ',
    schemes: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ',
    mandi: 'ਮੰਡੀ ਦੇ ਭਾਅ',
    version: 'ਸੰਸਕਰਣ 1.3.0',
    welcome: 'ਜੀ ਆਇਆਂ ਨੂੰ, ਕਿਸਾਨ',
    overview: 'ਤੁਹਾਡੇ ਖੇਤ ਦੀ ਜਾਣਕਾਰੀ, ਰਾਜ:',
    regionalWeather: 'ਖੇਤਰੀ ਮੌਸਮ ਕੇਂਦਰ',
    weatherSubtitle: 'ਖੇਤੀ ਮੌਸਮ ਪੂਰਵ-ਅਨੁਮਾਨ ਅਤੇ ਚੇਤਾਵਨੀਆਂ, ਖੇਤਰ:',
    engineTitle: 'ਫਸਲ ਸਿਫਾਰਸ਼ ਇੰਜਣ',
    engineSubtitle: 'ਮਿੱਟੀ ਅਤੇ ਮੌਸਮ ਅਨੁਸਾਰ ਸਹੀ ਫਸਲ ਦੀ ਗਣਨਾ ਕਰੋ।',
    detectionTitle: 'ਪੌਦਾ ਰੋਗ ਨਿਦਾਨ',
    detectionSubtitle: 'ਪੌਦੇ ਦੇ ਪੱਤੇ ਨੂੰ ਸਕੈਨ ਕਰਕੇ ਰੋਗ ਅਤੇ ਇਲਾਜ ਦਾ ਪਤਾ ਲਗਾਓ।',
    assistantTitle: 'ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ ਏਆਈ ਸਹਾਇक',
    assistantSubtitle: 'ਫਸਲ ਸੁਰੱਖਿਆ ਬਾਰੇ ਸਾਡੇ ਏਆਈ ਨਾਲ ਗੱਲਬਾਤ ਕਰੋ।',
    profileTitle: 'ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਰਿਕਾਰਡ',
    profileSubtitle: 'ਖੇਤ ਦਾ ਆਕਾਰ ਅਤੇ ਫਸਲਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ।',
    historyTitle: 'ਖੇਤੀਬਾੜੀ ਲੌਗ ਅਤੇ ਇਤਿਹਾਸ',
    historySubtitle: 'ਆਪਣੀ ਪਿਛਲੀ ਜਾਂਚ ਰਿਪੋਰਟ ਅਤੇ ਫਸਲਾਂ ਦੀਆਂ ਖੋਜਾਂ ਦੀ ਸਮੀਖਿਆ ਕਰੋ।',
    schemesTitle: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਪੋਰਟਲ',
    schemesSubtitle: 'ਲਾਭ, ਸਬਸਿਡੀਆਂ ਦੀ ਖੋਜ ਕਰੋ ਅਤੇ ਯੋਗਤਾ ਦੀ ਗਣਨਾ ਕਰੋ।',
    mandiTitle: 'ਮੰਡੀ ਮਾਰਕੀਟ ਸੂਚਕਾਂਕ',
    mandiSubtitle: 'ਰੀਅਲ-ਟਾਈਮ ਜਿਣਸ ਦਰਾਂ ਅਤੇ ਇਤਿਹਾਸਕ ਕੀਮਤ ਚਾਰਟ।'
  },
  mr: {
    logout: 'प्रोफाइल लॉगआउट',
    dashboard: 'मुख्य पृष्ठ',
    weather: 'हवामान अंदाज',
    recommendation: 'पीक सल्लागार',
    diagnostics: 'पीक रोग तपासणी',
    chat: 'एआय सहाय्यक',
    profile: 'माझी प्रोफाइल',
    history: 'कृषी लॉग',
    schemes: 'शासकीय योजना',
    mandi: 'मंडी भाव',
    version: 'आवृत्ती 1.3.0',
    welcome: 'पुन्हा स्वागत आहे, शेतकरी',
    overview: 'तुमच्या शेताची माहिती, राज्य:',
    regionalWeather: 'प्रादेशिक हवामान केंद्र',
    weatherSubtitle: 'कृषी हवामान अंदाज आणि इशारे, क्षेत्र:',
    engineTitle: 'पीक शिफारस इंजिन',
    engineSubtitle: 'माती आणि हंगामानुसार योग्य पिकाची शिफारस.',
    detectionTitle: 'वनस्पती रोग निदान',
    detectionSubtitle: 'पानांचा फोटो स्कॅन करून रोगाचे निदान आणि उपाय शोधा.',
    assistantTitle: 'कृषी मित्र एआय सहाय्यक',
    assistantSubtitle: 'पीक संरक्षणाबद्दल आमच्या एआय सहाय्यकाशी गप्पा मारा.',
    profileTitle: 'शेतकरी प्रोफाइल आणि रेकॉर्ड',
    profileSubtitle: 'शेत जमीन आणि पिके व्यवस्थापित करा.',
    historyTitle: 'कृषी इतिहास लॉग',
    historySubtitle: 'तुमचे मागील निदान आणि पीक शोधांचे पुनरावलोकन करा.',
    schemesTitle: 'शासकीय योजना पोर्टल',
    schemesSubtitle: 'फायदे, अनुदाने आणि पात्रता मोजा.',
    mandiTitle: 'मंडी बाजार निर्देशांक',
    mandiSubtitle: 'रिअल-टाइम कमोडिटी दर आणि ऐतिहासिक किंमत चार्ट।'
  },
  bn: {
    logout: 'প্রোফাইল লগআউট',
    dashboard: 'মূল পাতা',
    weather: 'আবহাওয়ার পূর্বাভাস',
    recommendation: 'ফসল উপদেষ্টা',
    diagnostics: 'ফসল রোগ নির্ণয়',
    chat: 'এআই অ্যাসিস্ট্যান্ট',
    profile: 'আমার প্রোফাইল',
    history: 'ইতিহাস লগ',
    schemes: 'সরকারি প্রকল্প',
    mandi: 'মন্ডির বাজার দর',
    version: 'সংস্করণ 1.3.0',
    welcome: 'স্বাগতম, কৃষক',
    overview: 'আপনার খামারের বিবরণ, রাজ্য:',
    regionalWeather: 'আঞ্চলিক আবহাওয়া কেন্দ্র',
    weatherSubtitle: 'কৃষি আবহাওয়ার পূর্বাভাস এবং সতর্কবার্তা, অঞ্চল:',
    engineTitle: 'ফসল সুপারিশ ইঞ্জিন',
    engineSubtitle: 'মাটি ও ঋতু অনুযায়ী উপযুক্ত ফসল নির্ধারণ করুন।',
    detectionTitle: 'উদ্ভিদ রোগ নির্ণয়',
    detectionSubtitle: 'পাতার ফটো স্ক্যান করে রোগের লক্ষণ ও প্রতিকার খুঁজুন।',
    assistantTitle: 'কৃষি মিত্র এআই অ্যাসিস্ট্যান্ট',
    assistantSubtitle: 'ফসল সুরক্ষা সম্পর্কে আমাদের এআই এর সাথে চ্যাট করুন।',
    profileTitle: 'কৃষক প্রোফাইল ও রেকর্ড',
    profileSubtitle: 'জমির আকার ও ফসলের বিবরণ পরিচালনা করুন।',
    historyTitle: 'কৃষি ইতিহাস লগ',
    historySubtitle: 'আপনার আগের পরীক্ষার রিপোর্ট এবং ফসল অনুসন্ধানগুলি দেখুন।',
    schemesTitle: 'সরকারি প্রকল্প পোর্টাল',
    schemesSubtitle: 'সুবিধা, ভর্তুকি এবং যোগ্যতার নিয়ম জানুন।',
    mandiTitle: 'মন্ডি বাজার সূচক',
    mandiSubtitle: 'রিয়েল-টাইম কমোডিটি রেট এবং ঐতিহাসিক মূল্য চার্ট।'
  }
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('km_is_logged_in') === 'true');
  const [userName, setUserName] = useState(() => localStorage.getItem('km_user_name') || '');
  const [userState, setUserState] = useState(() => localStorage.getItem('km_user_state') || 'Punjab');
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileSubTab, setProfileSubTab] = useState<'profile' | 'history'>('profile');

  // Load database profile details whenever the user logs in
  useEffect(() => {
    if (isLoggedIn) {
      const loadProfile = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/profile`);
          if (res.ok) {
            const data = await res.json();
            if (data.name) setUserName(data.name);
            if (data.state) setUserState(data.state);
          }
        } catch (err) {
          console.warn("Could not fetch profile on login initialization.");
        }
      };
      loadProfile();
    }
  }, [isLoggedIn]);

  if (showSplash) {
    return <SplashScreen language={language} onFinish={() => setShowSplash(false)} />;
  }

  if (!isLoggedIn) {
    return (
      <Auth 
        onLogin={async (name, state, email) => {
          setUserName(name);
          setUserState(state);
          setIsLoggedIn(true);
          localStorage.setItem('km_is_logged_in', 'true');
          localStorage.setItem('km_user_name', name);
          localStorage.setItem('km_user_state', state);
          localStorage.setItem('km_user_email', email);
          try {
            await fetch(`${API_BASE_URL}/api/profile`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name,
                email,
                state,
                farmSize: 4.5,
                mainCrops: 'Wheat',
                preferredLanguage: 'en',
                photoUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + encodeURIComponent(name)
              })
            });
          } catch (e) {
            console.warn("Could not save login details to backend database.");
          }
        }} 
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard language={language} onNavigate={setActiveTab} />;
      case 'weather':
        return <WeatherPage userState={userState} language={language} />;
      case 'diagnostics':
        return <Diagnostics language={language} />;
      case 'chat':
        return <ChatAssistant language={language} />;
      case 'profile':
        return (
          <Profile 
            userName={userName} 
            userState={userState} 
            onUpdate={(name, state) => {
              setUserName(name);
              setUserState(state);
              localStorage.setItem('km_user_name', name);
              localStorage.setItem('km_user_state', state);
            }} 
            language={language}
            onLogout={() => setShowLogoutConfirm(true)}
          />
        );
      default:
        return <Dashboard language={language} onNavigate={setActiveTab} />;
    }
  };

  const getHeaderInfo = () => {
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    switch (activeTab) {
      case 'dashboard':
        return {
          title: t.dashboard,
          subtitle: `${t.welcome}, ${userName}! ${t.overview} ${userState}.`
        };
      case 'weather':
        return {
          title: t.regionalWeather,
          subtitle: `${t.weatherSubtitle} ${userState}.`
        };
      case 'diagnostics':
        return {
          title: t.detectionTitle,
          subtitle: t.detectionSubtitle
        };
      case 'chat':
        return {
          title: t.assistantTitle,
          subtitle: t.assistantSubtitle
        };
      case 'profile':
        return profileSubTab === 'profile' ? {
          title: t.profileTitle,
          subtitle: t.profileSubtitle
        } : {
          title: t.historyTitle,
          subtitle: t.historySubtitle
        };
      default:
        return { title: 'KrishiMitra-Ai', subtitle: 'Farming Cockpit' };
    }
  };

  const header = getHeaderInfo();
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  return (
    <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Premium Ambient Background Glows */}
      <div className="ambient-glow glow-green"></div>
      <div className="ambient-glow glow-blue"></div>

      {/* 1. DESKTOP Collapsible Sidebar Navigation */}
      <aside className="sidebar" style={{ minHeight: '100vh' }}>
        <div>
          <div className="logo-container">
            <div className="logo-ring">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="var(--primary)" strokeWidth="2.5" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="logo-text">
              <h1>KrishiMitra-Ai</h1>
              <p>कृषि मित्र</p>
            </div>
          </div>

          <nav className="nav-links">
            <button 
              className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              🏠 {t.dashboard}
            </button>

            <button 
              className={`nav-button ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              💬 {t.chat}
            </button>

            <button 
              className={`nav-button ${activeTab === 'diagnostics' ? 'active' : ''}`}
              onClick={() => setActiveTab('diagnostics')}
            >
              🍂 {t.diagnostics}
            </button>

            <button 
              className={`nav-button ${activeTab === 'weather' ? 'active' : ''}`}
              onClick={() => setActiveTab('weather')}
            >
              🌦️ {t.weather}
            </button>

            <button 
              className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => { setActiveTab('profile'); setProfileSubTab('profile'); }}
            >
              👤 {t.profile}
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div>{t.version}</div>
          <div style={{ color: 'var(--primary)', cursor: 'pointer', marginTop: '0.25rem' }} onClick={() => setShowLogoutConfirm(true)}>
            🚪 {t.logout}
          </div>
        </div>
      </aside>

      {/* 2. MOBILE Material Design 3 Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button 
          className={`mobile-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="icon">🏠</span>
          <span className="label">{language === 'hi' ? 'मुख्य' : language === 'pb' ? 'ਮੁੱਖ' : 'Home'}</span>
        </button>

        <button 
          className={`mobile-nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <span className="icon">💬</span>
          <span className="label">{language === 'hi' ? 'एआई चैट' : language === 'pb' ? 'ਏਆਈ ਚੈਟ' : 'AI Chat'}</span>
        </button>

        <button 
          className={`mobile-nav-btn ${activeTab === 'diagnostics' ? 'active' : ''}`}
          onClick={() => setActiveTab('diagnostics')}
        >
          <span className="icon">🍂</span>
          <span className="label">{language === 'hi' ? 'स्कैन' : language === 'pb' ? 'ਸਕੈਨ' : 'Scan'}</span>
        </button>

        <button 
          className={`mobile-nav-btn ${activeTab === 'weather' ? 'active' : ''}`}
          onClick={() => setActiveTab('weather')}
        >
          <span className="icon">🌦️</span>
          <span className="label">{language === 'hi' ? 'मौसम' : language === 'pb' ? 'ਮੌਸਮ' : 'Weather'}</span>
        </button>

        <button 
          className={`mobile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => { setActiveTab('profile'); setProfileSubTab('profile'); }}
        >
          <span className="icon">👤</span>
          <span className="label">{language === 'hi' ? 'प्रोफ़ाइल' : language === 'pb' ? 'ਪ੍ਰੋਫਾਈਲ' : 'Profile'}</span>
        </button>
      </nav>

      {/* Main Content Pane */}
      <main className="main-content">
        <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
          {/* Brand Icon and page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="logo-ring" style={{
              width: '38px',
              height: '38px',
              borderStyle: 'solid',
              animation: 'spin 12s linear infinite',
              fontSize: '1.15rem',
              flexShrink: 0
            }}>
              🌱
            </div>
            <div className="header-title">
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{header.title}</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>{header.subtitle}</p>
            </div>
          </div>

          {/* Right side controls */}
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              📍 {userState}
            </span>

            {/* Language Selector Dropdown */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.35rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <option value="en">🌐 English</option>
              <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
              <option value="pb">🌾 ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="mr">🚩 मराठी (Marathi)</option>
              <option value="bn">🌱 বাংলা (Bengali)</option>
            </select>

            {/* Logout Action Button */}
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#f43f5e',
                borderRadius: '12px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.82rem',
                fontWeight: 750,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.25s'
              }}
              title="Logout from app"
            >
              🚪 {language === 'hi' ? 'लॉगआउट' : language === 'pb' ? 'ਬਾਹਰ ਜਾਓ' : 'Logout'}
            </button>
          </div>
        </header>

        {/* Dynamic page content */}
        <div style={{ flexGrow: 1 }} className="page-view-wrapper">
          {renderContent()}
        </div>
      </main>

      {/* Premium Logout Confirmation Modal Overlay */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(6, 9, 12, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-card fade-in" style={{
            maxWidth: '380px',
            width: '90%',
            textAlign: 'center',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-glow)',
            borderRadius: '24px'
          }}>
            <div style={{ fontSize: '2.5rem' }}>🚪</div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'en' ? 'Confirm Logout' : language === 'hi' ? 'लॉगआउट की पुष्टि करें' : language === 'pb' ? 'ਲੌਗਆਉਟ ਦੀ ਪੁਸ਼ਟੀ' : language === 'mr' ? 'लॉगआउटची खात्री करा' : 'লগআউট নিশ্চিত করুন'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.45 }}>
                {language === 'en' 
                  ? 'Are you sure you want to logout?' 
                  : language === 'hi' 
                    ? 'क्या आप वास्तव में लॉगआउट करना चाहते हैं?' 
                    : language === 'pb'
                      ? 'ਕੀ ਤੁਸੀਂ ਸੱਚਮੁੱਚ ਲੌਗਆਉਟ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?'
                      : language === 'mr'
                        ? 'तुम्हाला खात्री आहे की तुम्हाला लॉगआउट करायचे आहे?'
                        : 'আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="primary-btn" 
                style={{ background: 'var(--danger)', border: 'none', minWidth: '100px', color: '#fff', fontWeight: 700, borderRadius: '20px' }}
                onClick={async () => {
                  setIsLoggedIn(false);
                  setShowLogoutConfirm(false);
                  
                  // 1. Clear all cached local storage values
                  localStorage.clear();
                  
                  // 2. Reset backend SQLite profile to blank defaults
                  try {
                    await fetch(`${API_BASE_URL}/api/profile/reset`, { method: 'POST' });
                  } catch (e) {
                    console.warn("Could not reset database profile on logout:", e);
                  }
                }}
              >
                {language === 'en' ? 'Yes' : language === 'hi' ? 'हाँ' : language === 'pb' ? 'ਹਾਂ' : language === 'mr' ? 'होय' : 'হ্যাঁ'}
              </button>
              <button 
                className="primary-btn" 
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', minWidth: '100px', borderRadius: '20px' }}
                onClick={() => setShowLogoutConfirm(false)}
              >
                {language === 'en' ? 'No' : language === 'hi' ? 'नहीं' : language === 'pb' ? 'ਨਾ' : language === 'mr' ? 'नाही' : 'না'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
