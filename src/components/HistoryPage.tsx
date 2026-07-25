import React, { useState, useEffect } from 'react';
import type { Language } from '../App';
import { API_BASE_URL } from '../config';

interface HistoryPageProps {
  language: Language;
}

// Data structures matching database tables
interface ChatHistory {
  id: number;
  question: string;
  answer: string;
  timestamp: string;
}

interface VoiceHistory {
  id: number;
  transcript: string;
  duration: number;
  timestamp: string;
  audio_url?: string;
}

interface WeatherHistory {
  id: number;
  city: string;
  temperature: number;
  humidity: number;
  condition: string;
  timestamp: string;
}

interface CropHistory {
  id: number;
  crop_name: string;
  input_details: {
    n?: number;
    p?: number;
    k?: number;
    ph?: number;
    moisture?: number;
  };
  recommendation: string;
  timestamp: string;
}

interface DiseaseHistory {
  id: number;
  image_url: string;
  disease_name: string;
  confidence: number;
  treatment: {
    organicRemedies?: string[];
    chemicalRemedies?: string[];
  };
  timestamp: string;
}

type TabType = 'chat' | 'voice' | 'weather' | 'crop' | 'disease';

const TRANSLATIONS = {
  en: {
    title: 'Operations History Log',
    subtitle: 'Review past queries, scans, and recommendations persisted in database',
    tabChat: '💬 AI Chat',
    tabVoice: '🎙️ Voice Call',
    tabWeather: '🌤️ Weather',
    tabCrop: '🌾 Crop Recommendation',
    tabDisease: '🍂 Disease Diagnosis',
    searchPlaceholder: 'Search queries...',
    clearAll: 'Clear All History',
    delete: 'Delete',
    emptyMsg: 'No records found in this section.',
    duration: 'Duration',
    sec: 'sec',
    playing: 'Playing...',
    play: 'Play Recording',
    pause: 'Pause',
    confidence: 'Confidence Score',
    remedies: 'Remedies & Remedies',
    soilParams: 'Soil Inputs'
  },
  hi: {
    title: 'संचालन इतिहास लॉग',
    subtitle: 'डेटाबेस में सहेजे गए पिछले प्रश्नों, स्कैन और सिफारिशों की समीक्षा करें',
    tabChat: '💬 एआई चैट',
    tabVoice: '🎙️ वॉयस कॉल',
    tabWeather: '🌤️ मौसम इतिहास',
    tabCrop: '🌾 फसल अनुशंसा',
    tabDisease: '🍂 रोग निदान',
    searchPlaceholder: 'खोज करें...',
    clearAll: 'समस्त इतिहास साफ करें',
    delete: 'हटाएं',
    emptyMsg: 'इस अनुभाग में कोई रिकॉर्ड नहीं मिला।',
    duration: 'अवधि',
    sec: 'सेकंड',
    playing: 'बज रहा है...',
    play: 'रिकॉर्डिंग चलाएं',
    pause: 'रोकें',
    confidence: 'आत्मविश्वास स्कोर',
    remedies: 'उपचार और उपाय',
    soilParams: 'मिट्टी इनपुट'
  },
  pb: {
    title: 'ਸੰਚਾਲਨ ਇਤਿਹਾਸ ਲੌਗ',
    subtitle: 'ਡਾਟਾਬੇਸ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਕੀਤੇ ਗਏ ਪਿਛਲੇ ਪ੍ਰਸ਼ਨਾਂ, ਸਕੈਨਾਂ ਅਤੇ ਸਿਫ਼ਾਰਸ਼ਾਂ ਦੀ ਸਮੀਖਿਆ ਕਰੋ',
    tabChat: '💬 ਏਆਈ ਚੈਟ',
    tabVoice: '🎙️ ਵੌਇਸ ਕਾਲ',
    tabWeather: '🌤️ ਮੌਸਮ ਇਤਿਹਾਸ',
    tabCrop: '🌾 ਫਸਲ ਸਿਫਾਰਸ਼',
    tabDisease: '🍂 ਰੋਗ ਨਿਦਾਨ',
    searchPlaceholder: 'ਖੋਜ ਕਰੋ...',
    clearAll: 'ਸਾਰਾ ਇਤਿਹਾਸ ਸਾਫ਼ ਕਰੋ',
    delete: 'ਹਟਾਓ',
    emptyMsg: 'ਇਸ ਭਾਗ ਵਿੱਚ ਕੋਈ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ।',
    duration: 'ਸਮਾਂ',
    sec: 'ਸਕਿੰਟ',
    playing: 'ਚੱਲ ਰਿਹਾ ਹੈ...',
    play: 'ਰਿਕਾਰਡਿੰਗ ਚਲਾਓ',
    pause: 'ਰੋਕੋ',
    confidence: 'ਭਰੋਸਾ ਸਕੋਰ',
    remedies: 'ਇਲਾਜ ਅਤੇ ਉਪਾਅ',
    soilParams: 'ਮਿੱਟੀ ਇਨਪੁਟ'
  },
  mr: {
    title: 'संचालन इतिहास लॉग',
    subtitle: 'डेटाबेसमध्ये जतन केलेल्या मागील प्रश्न, स्कॅन आणि शिफारसींचे पुनरावलोकन करा',
    tabChat: '💬 एआय चॅट',
    tabVoice: '🎙️ व्हॉइस कॉल',
    tabWeather: '🌤️ हवामान इतिहास',
    tabCrop: '🌾 पीक शिफारस',
    tabDisease: '🍂 रोग निदान',
    searchPlaceholder: 'शोध घ्या...',
    clearAll: 'सर्व इतिहास साफ करा',
    delete: 'हटवा',
    emptyMsg: 'या विभागात कोणतेही रेकॉर्ड आढळले नाहीत.',
    duration: 'कालावधी',
    sec: 'सेकंद',
    playing: 'वाजत आहे...',
    play: 'रेकॉर्डिंग प्ले करा',
    pause: 'थांबवा',
    confidence: 'आत्मविश्वास पातळी',
    remedies: 'उपाय आणि उपचार',
    soilParams: 'मातीचे घटक'
  },
  bn: {
    title: 'কার্যক্রমের ইতিহাস লগ',
    subtitle: 'ডাটাবেসে সংরক্ষিত আগের প্রশ্ন, পাতার স্ক্যান এবং আবহাওয়ার তথ্য দেখুন',
    tabChat: '💬 এআই চ্যাট',
    tabVoice: '🎙️ ভয়েস কল',
    tabWeather: '🌤️ আবহাওয়া',
    tabCrop: '🌾 ফসল সুপারিশ',
    tabDisease: '🍂 রোগ নির্ণয়',
    searchPlaceholder: 'অনুসন্ধান করুন...',
    clearAll: 'সব ইতিহাস মুছুন',
    delete: 'মুছুন',
    emptyMsg: 'এই বিভাগে কোনো তথ্য পাওয়া যায়নি।',
    duration: 'সময়সীমা',
    sec: 'সেকেন্ড',
    playing: 'চলছে...',
    play: 'রেকর্ডিং শুনুন',
    pause: 'থামুন',
    confidence: 'নির্ভরযোগ্যতা স্কোর',
    remedies: 'প্রতিকার ও সমাধান',
    soilParams: 'মাটির তথ্য'
  }
};

export const HistoryPage: React.FC<HistoryPageProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  // UI state states
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);

  // History states
  const [chatList, setChatList] = useState<ChatHistory[]>([]);
  const [voiceList, setVoiceList] = useState<VoiceHistory[]>([]);
  const [weatherList, setWeatherList] = useState<WeatherHistory[]>([]);
  const [cropList, setCropList] = useState<CropHistory[]>([]);
  const [diseaseList, setDiseaseList] = useState<DiseaseHistory[]>([]);

  // Fetch histories on mount/tab change
  useEffect(() => {
    fetchHistoryData();
  }, [activeTab]);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/history/${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        if (activeTab === 'chat') setChatList(data);
        if (activeTab === 'voice') setVoiceList(data);
        if (activeTab === 'weather') setWeatherList(data);
        if (activeTab === 'crop') setCropList(data);
        if (activeTab === 'disease') setDiseaseList(data);
      }
    } catch (err) {
      console.warn("Could not connect to history API endpoints.");
    } finally {
      setLoading(false);
    }
  };

  // Chat actions
  const handleDeleteChat = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/history/chat/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setChatList(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllChats = async () => {
    if (!window.confirm(t.clearAll + "?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/history/chat`, { method: 'DELETE' });
      if (res.ok) {
        setChatList([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Voice actions
  const handleDeleteVoice = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/history/voice/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVoiceList(prev => prev.filter(v => v.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMockPlayback = (id: number) => {
    if (playingVoiceId === id) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(id);
      // Simulate playback auto-end after 3s
      setTimeout(() => {
        setPlayingVoiceId(prev => prev === id ? null : prev);
      }, 3500);
    }
  };

  // Helper date formatter
  const formatDate = (isoStr: string) => {
    try {
      // Handles standard ISO timestamps from database
      const date = new Date(isoStr.replace(' ', 'T'));
      if (isNaN(date.getTime())) return isoStr;
      return date.toLocaleString(language === 'en' ? 'en-US' : 'hi-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
  };

  // Filters chat items based on search keyword
  const filteredChats = chatList.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fade-in glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 'calc(100vh - 12rem)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.title}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.subtitle}</p>
        </div>

        {activeTab === 'chat' && chatList.length > 0 && (
          <button 
            onClick={handleClearAllChats} 
            className="secondary-btn" 
            style={{ border: '1px solid #e74c3c', color: '#e74c3c', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            🗑️ {t.clearAll}
          </button>
        )}
      </div>

      {/* Modern Tabs Slider Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }} className="tabs-container">
        {(['chat', 'voice', 'weather', 'crop', 'disease'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === 'chat' ? t.tabChat :
                        tab === 'voice' ? t.tabVoice :
                        tab === 'weather' ? t.tabWeather :
                        tab === 'crop' ? t.tabCrop : t.tabDisease;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchQuery('');
              }}
              style={{
                background: isActive ? 'var(--primary-glow)' : 'transparent',
                border: '1px solid ' + (isActive ? 'var(--primary)' : 'transparent'),
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '0.65rem 1.2rem',
                borderRadius: '12px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.95rem'
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Search conduction inside chat history */}
      {activeTab === 'chat' && chatList.length > 0 && (
        <div style={{ position: 'relative', width: '100%' }}>
          <input 
            type="text"
            className="search-input"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '1.25rem', borderRadius: '12px' }}
          />
        </div>
      )}

      {/* Dynamic Content Loader Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', flexGrow: 1 }} className="history-content-list">
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <span className="logo-ring" style={{ width: '40px', height: '40px', borderStyle: 'solid', animation: 'spin 1.5s linear infinite', borderColor: 'var(--primary)' }} />
          </div>
        ) : (
          <>
            {/* 1. AI Chat History Tab */}
            {activeTab === 'chat' && (
              filteredChats.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>{t.emptyMsg}</div>
              ) : (
                filteredChats.map((chat) => (
                  <div key={chat.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>⏰ {formatDate(chat.timestamp)}</span>
                      <button 
                        onClick={() => handleDeleteChat(chat.id)}
                        style={{ background: 'none', border: 'none', color: '#e74c3c', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        🗑️ {t.delete}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>ASK</span>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.98rem', fontWeight: 500 }}>{chat.question}</p>
                      </div>

                      <div style={{ background: 'rgba(46, 204, 113, 0.03)', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>AI</span>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.98rem', whiteSpace: 'pre-wrap' }}>{chat.answer}</p>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}

            {/* 2. Voice Call Tab */}
            {activeTab === 'voice' && (
              voiceList.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>{t.emptyMsg}</div>
              ) : (
                voiceList.map((voice) => (
                  <div key={voice.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem', padding: '1.25rem' }}>
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⏰ {formatDate(voice.timestamp)}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>⏱️ {t.duration}: {voice.duration} {t.sec}</span>
                      </div>
                      <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 550, fontStyle: 'italic' }}>
                        "{voice.transcript}"
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      {/* Play/Pause Button */}
                      <button
                        onClick={() => toggleMockPlayback(voice.id)}
                        className="primary-btn"
                        style={{
                          background: playingVoiceId === voice.id ? '#e67e22' : 'var(--primary)',
                          padding: '0.5rem 1rem',
                          fontSize: '0.85rem',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <span>{playingVoiceId === voice.id ? '⏸️' : '▶️'}</span>
                        <span>{playingVoiceId === voice.id ? t.pause : t.play}</span>
                      </button>

                      <button 
                        onClick={() => handleDeleteVoice(voice.id)}
                        style={{ background: 'none', border: 'none', color: '#e74c3c', fontSize: '1.1rem', cursor: 'pointer', padding: '4px' }}
                        title={t.delete}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* 3. Weather Tab */}
            {activeTab === 'weather' && (
              weatherList.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>{t.emptyMsg}</div>
              ) : (
                <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table className="mandi-table" style={{ fontSize: '0.9rem' }}>
                    <thead>
                      <tr>
                        <th>City / Area</th>
                        <th>Weather</th>
                        <th>Temperature</th>
                        <th>Humidity</th>
                        <th>Fetch Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weatherList.map((weather) => (
                        <tr key={weather.id}>
                          <td style={{ fontWeight: 650, color: 'var(--text-primary)' }}>📍 {weather.city}</td>
                          <td>
                            {weather.condition.toLowerCase().includes('rain') ? '⛈️' :
                             weather.condition.toLowerCase().includes('cloud') ? '☁️' : '☀️'} {weather.condition}
                          </td>
                          <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{weather.temperature}°C</td>
                          <td>💧 {weather.humidity}%</td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(weather.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* 4. Crop Recommendation Tab */}
            {activeTab === 'crop' && (
              cropList.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>{t.emptyMsg}</div>
              ) : (
                cropList.map((crop) => (
                  <div key={crop.id} className="glass-card crop-report-item grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-5 p-5">
                    <div className="flex flex-col gap-[0.65rem] border-b md:border-b-0 md:border-r border-[var(--border-color)] pb-5 md:pb-0 md:pr-5">
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⏰ {formatDate(crop.timestamp)}</span>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CROP RECOMMENDED</span>
                        <h4 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.15rem' }}>🌾 {crop.crop_name}</h4>
                      </div>

                      {/* Soil stats parameters */}
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.65rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>{t.soilParams}</span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.75rem' }}>
                          <div><span style={{ color: 'var(--text-muted)' }}>N:</span> <strong>{crop.input_details.n ?? '-'}</strong></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>P:</span> <strong>{crop.input_details.p ?? '-'}</strong></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>K:</span> <strong>{crop.input_details.k ?? '-'}</strong></div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '6px', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                          <span>pH: <strong>{crop.input_details.ph ?? '-'}</strong></span>
                          <span>Moisture: <strong>{crop.input_details.moisture ?? '-'}%</strong></span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AI RECOMMENDATION DETAILS</span>
                      <p style={{ color: 'var(--text-primary)', fontSize: '0.98rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {crop.recommendation}
                      </p>
                    </div>
                  </div>
                ))
              )
            )}

            {/* 5. Disease Scan Tab */}
            {activeTab === 'disease' && (
              diseaseList.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>{t.emptyMsg}</div>
              ) : (
                diseaseList.map((disease) => (
                  <div key={disease.id} className="glass-card disease-report-item flex flex-col md:flex-row gap-6 p-5">
                    {/* Thumbnail Leaf diagnostic image */}
                    <div style={{ flexShrink: 0, position: 'relative' }}>
                      <img
                        src={disease.image_url.startsWith('data:image') ? disease.image_url : 'https://api.dicebear.com/7.x/identicon/svg?seed=' + disease.disease_name}
                        alt="Leaf Diagnosis Scan"
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid var(--border-color)',
                          background: 'rgba(255,255,255,0.03)'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: '#e74c3c',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                        whiteSpace: 'nowrap'
                      }}>
                        {Math.round(disease.confidence * 100)}% Match
                      </span>
                    </div>

                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⏰ {formatDate(disease.timestamp)}</span>
                          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e74c3c', marginTop: '0.15rem' }}>🍂 {disease.disease_name}</h4>
                        </div>
                      </div>

                      {/* Remedies details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: '0.5rem' }}>
                        <div style={{ background: 'rgba(46, 204, 113, 0.03)', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '2px solid var(--primary)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>ORGANIC REMEDIES</span>
                          <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                            {disease.treatment.organicRemedies?.map((rem, i) => (
                              <li key={i}>{rem}</li>
                            )) || <li>No organic treatment specified</li>}
                          </ul>
                        </div>

                        <div style={{ background: 'rgba(231, 76, 60, 0.03)', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '2px solid #e74c3c' }}>
                          <span style={{ fontSize: '0.75rem', color: '#e74c3c', fontWeight: 700, display: 'block', marginBottom: '4px' }}>CHEMICAL REMEDIES</span>
                          <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                            {disease.treatment.chemicalRemedies?.map((rem, i) => (
                              <li key={i}>{rem}</li>
                            )) || <li>No chemical treatment specified</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </>
        )}
      </div>

    </div>
  );
};
