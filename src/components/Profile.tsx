import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '../App';
import { API_BASE_URL } from '../config';

interface ProfileProps {
  userName: string;
  userState: string;
  onUpdate: (name: string, state: string) => void;
  language: Language;
  onLogout?: () => void;
}

const TRANSLATIONS = {
  en: {
    personalSection: 'Farmer Dashboard Settings',
    editProfile: 'Edit Profile Settings',
    saveChanges: 'Save Profile Records',
    cancel: 'Discard Changes',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    farmSize: 'Farm Size (Acres)',
    mainCrops: 'Main Crops Grown',
    successMsg: 'Profile records synchronized successfully!',
    errorMsg: 'Failed to update records.',
    uploadPhoto: 'Upload Photo',
    takePhoto: 'Use Webcam',
    capture: 'Capture Frame',
    cancelCamera: 'Turn Off Lens',
    profileCompletion: 'Profile Completion Score',
    verifiedFarmer: 'Verified Farmer Status',
    district: 'District',
    state: 'State',
    memberSince: 'Member Since',
    soilHealth: 'Soil Health Index',
    waterEfficiency: 'Water Efficiency'
  },
  hi: {
    personalSection: 'किसान डैशबोर्ड सेटिंग्स',
    editProfile: 'प्रोफ़ाइल सेटिंग्स बदलें',
    saveChanges: 'रिकॉर्ड सहेजें',
    cancel: 'बदलाव रद्द करें',
    fullName: 'पूरा नाम',
    email: 'ईमेल पता',
    phone: 'फ़ोन नंबर',
    farmSize: 'कृषि भूमि का आकार (एकड़)',
    mainCrops: 'मुख्य फसलें',
    successMsg: 'प्रोफ़ाइल सफलतापूर्वक सहेजी गई!',
    errorMsg: 'रिकॉर्ड सहेजने में त्रुटि।',
    uploadPhoto: 'फ़ाइल अपलोड करें',
    takePhoto: 'वेबकैम फीड',
    capture: 'फोटो क्लिक करें',
    cancelCamera: 'कैमरा बंद करें',
    profileCompletion: 'प्रोफ़ाइल पूर्णता स्कोर',
    verifiedFarmer: 'सत्यापित किसान स्थिति',
    district: 'जिला',
    state: 'राज्य',
    memberSince: 'सदस्यता तिथि',
    soilHealth: 'मिट्टी स्वास्थ्य सूचकांक',
    waterEfficiency: 'जल दक्षता सूचकांक'
  },
  pb: {
    personalSection: 'ਕਿਸਾਨ ਡੈਸ਼ਬੋਰਡ ਸੈਟਿੰਗਜ਼',
    editProfile: 'ਪ੍ਰੋਫਾਈਲ ਸੈਟਿੰਗਜ਼ ਬਦਲੋ',
    saveChanges: 'ਬਦਲਾਅ ਸੁਰੱਖਿਅਤ ਕਰੋ',
    cancel: 'ਬਦਲਾਅ ਰੱਦ ਕਰੋ',
    fullName: 'ਪ੍ਰੋਫਾਈਲ ਨਾਮ',
    email: 'ਈਮੇਲ ਪਤਾ',
    phone: 'ਫੋਨ ਨੰਬਰ',
    farmSize: 'ਖੇਤੀਬਾੜੀ ਜ਼ਮੀਨ ਦਾ ਆਕਾਰ (ਏਕੜ)',
    mainCrops: 'ਮੁੱਢਲੀਆਂ ਫਸਲਾਂ',
    successMsg: 'ਪ੍ਰੋਫਾਈਲ ਸਫਲਤਾਪੂਰਵਕ ਅੱਪਡੇਟ ਹੋ ਗਈ!',
    errorMsg: 'ਬਦਲਾਅ ਸੁਰੱਖਿਅਤ ਕਰਨ ਵਿੱਚ ਅਸਫਲ।',
    uploadPhoto: 'ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ',
    takePhoto: 'ਵੈੱਬਕੈਮ ਫੀਡ',
    capture: 'ਫੋਟੋ ਕਲਿੱਕ ਕਰੋ',
    cancelCamera: 'ਕੈਮਰਾ ਬੰਦ ਕਰੋ',
    profileCompletion: 'ਪ੍ਰੋਫਾਈਲ ਪੂਰਨਤਾ ਸਕੋਰ',
    verifiedFarmer: 'ਸਤਿਆਪਿਤ ਕਿਸਾਨ ਸਥਿਤੀ',
    district: 'ਜ਼ਿਲ੍ਹਾ',
    state: 'ਰਾਜ',
    memberSince: 'ਮੈਂਬਰਸ਼ਿਪ ਮਿਤੀ',
    soilHealth: 'ਮਿੱਟੀ ਦੀ ਸਿਹਤ',
    waterEfficiency: 'ਪਾਣੀ ਦੀ ਕੁਸ਼ਲਤਾ'
  },
  mr: {
    personalSection: 'शेतकरी डॅशबोर्ड सेटिंग्ज',
    editProfile: 'प्रोफाइल सेटिंग्ज बदला',
    saveChanges: 'बदल जतन करा',
    cancel: 'बदल रद्द करा',
    fullName: 'पूर्ण नाव',
    email: 'ईमेल पत्ता',
    phone: 'फोन नंबर',
    farmSize: 'शेतीचे क्षेत्र (एकड)',
    mainCrops: 'मुख्य पिके',
    successMsg: 'प्रोफाइल यशस्वीरित्या जतन झाली!',
    errorMsg: 'बदल जतन करण्यात अयशस्वी.',
    uploadPhoto: 'फोटो अपलोड करा',
    takePhoto: 'वेबकॅम फीड',
    capture: 'फोटो कॅप्चर करा',
    cancelCamera: 'कॅमेरा बंद करा',
    profileCompletion: 'प्रोफाइल पूर्णता स्कोर',
    verifiedFarmer: 'सत्यापित शेतकरी स्थिती',
    district: 'जिल्हा',
    state: 'राज्य',
    memberSince: 'सदस्यता तारीख',
    soilHealth: 'मातीचे आरोग्य',
    waterEfficiency: 'पाणी कार्यक्षमता'
  },
  bn: {
    personalSection: 'কৃষক ড্যাশবোর্ড সেটিংস',
    editProfile: 'প্রোফাইল সেটিংস পরিবর্তন',
    saveChanges: 'রেকর্ড সংরক্ষণ করুন',
    cancel: 'বাতিল করুন',
    fullName: 'পূর্ণ নাম',
    email: 'ইমেল ঠিকানা',
    phone: 'ফোন নম্বর',
    farmSize: 'খামারের জমির পরিমাণ (একর)',
    mainCrops: 'প্রধান ফসল',
    successMsg: 'প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!',
    errorMsg: 'পরিবর্তন সংরক্ষণ করা সম্ভব হয়নি।',
    uploadPhoto: 'ছবি আপলোড করুন',
    takePhoto: 'ওয়েবক্যাম সেটিংস',
    capture: 'ছবি তুলুন',
    cancelCamera: 'ক্যামেরা বন্ধ করুন',
    profileCompletion: 'প্রোফাইল সমাপ্তি স্কোর',
    verifiedFarmer: 'যাচাইকৃত কৃষক স্ট্যাটাস',
    district: 'জেলা',
    state: 'রাজ্য',
    memberSince: 'সদস্যতার তারিখ',
    soilHealth: 'মাটির স্বাস্থ্য',
    waterEfficiency: 'জল দক্ষতা সূচক'
  }
};

export const Profile: React.FC<ProfileProps> = ({ userName, userState, onUpdate, language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  // State hooks
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Field values state
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(() => localStorage.getItem('km_user_email') || '');
  const [phone, setPhone] = useState('');
  const [farmSize, setFarmSize] = useState('4.5');
  const [mainCrops, setMainCrops] = useState('Wheat');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=200&h=200');

  // Background state values
  const [stateVal, setStateVal] = useState(userState);
  const [district, setDistrict] = useState('Ludhiana');
  const [prefLang, setPrefLang] = useState<Language>(language);
  const [scanCount, setScanCount] = useState(0);

  // Refs for media devices
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchScanCount();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchScanCount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/scans`);
      if (res.ok) {
        const data = await res.json();
        setScanCount(data.length || 0);
      }
    } catch (e) {
      console.warn("Could not retrieve scans count");
    }
  };

  const fetchProfile = async () => {
    try {
      const cachedEmail = localStorage.getItem('km_user_email') || email;
      const url = cachedEmail 
        ? `${API_BASE_URL}/api/profile?email=${encodeURIComponent(cachedEmail)}`
        : `${API_BASE_URL}/api/profile`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setName(data.name || userName);
        setEmail(data.email || cachedEmail || '');
        setPhone(data.phone || '');
        setFarmSize(String(data.farm_size || data.farmSize || '4.5'));
        setMainCrops(data.main_crops || data.mainCrops || 'Wheat');
        setPhotoUrl(data.photo_url || data.photoUrl || 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=200&h=200');
        
        if (data.email) {
          localStorage.setItem('km_user_email', data.email);
        }
        
        setStateVal(data.state || userState);
        setDistrict(data.district || 'Ludhiana');
        setPrefLang((data.preferred_language as Language) || (data.preferredLanguage as Language) || language);

        onUpdate(data.name || userName, data.state || userState);
      }
    } catch (err) {
      console.warn("Using props fallback.");
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = email.trim()
        ? `${API_BASE_URL}/api/profile?email=${encodeURIComponent(email.trim())}`
        : `${API_BASE_URL}/api/profile`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          state: stateVal,
          district: district,
          farmSize: Number(farmSize) || 0.0,
          mainCrops: mainCrops,
          preferredLanguage: prefLang,
          photoUrl: photoUrl
        })
      });

      if (res.ok) {
        onUpdate(name, stateVal);
        localStorage.setItem('km_user_email', email.trim());
        setIsEditMode(false);
        showToast(t.successMsg, 'success');
      } else {
        showToast(t.errorMsg, 'error');
      }
    } catch (err) {
      showToast(t.errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setIsEditMode(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setIsEditMode(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied or webcam device not found.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 300, 300);
        setPhotoUrl(canvas.toDataURL('image/jpeg'));
      }
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const calculateCompletion = () => {
    let score = 0;
    if (name) score += 20;
    if (email) score += 20;
    if (phone) score += 20;
    if (farmSize && farmSize !== '0') score += 20;
    if (mainCrops) score += 20;
    return score;
  };

  const completionPercent = calculateCompletion();

  const getInputStyle = (isActive: boolean) => ({
    paddingLeft: '2.75rem',
    width: '100%',
    borderRadius: '16px',
    height: '48px',
    border: isActive ? '1.5px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
    background: isActive ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.01)',
    color: '#ffffff',
    cursor: isActive ? 'text' : 'default',
    boxShadow: isActive ? '0 0 15px rgba(129, 199, 132, 0.12)' : 'none',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    fontSize: '0.95rem'
  });

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: '"Outfit", sans-serif', paddingBottom: '4rem', position: 'relative' }}>
      
      {/* Toast alert popup */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: toast.type === 'success' ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : 'linear-gradient(135deg, #e74c3c, #c0392b)',
          color: '#fff',
          padding: '1.1rem 2rem',
          borderRadius: '24px',
          fontWeight: 750,
          boxShadow: '0 20px 45px rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'slide-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <span style={{ fontSize: '1.35rem' }}>{toast.type === 'success' ? '🎉' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. TOP HERO SECTION */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: '1.25rem'
      }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #fff 40%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
            🌾 Digital Kisan Portal
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Manage agricultural credentials, smart farming statistics, and localized parameters.
          </p>
        </div>

        <div>
          {!isEditMode ? (
            <button
              onClick={() => setIsEditMode(true)}
              className="primary-btn"
              style={{
                borderRadius: '28px',
                padding: '0.8rem 2rem',
                fontSize: '0.92rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, var(--primary), #4caf50)',
                color: '#060a08',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 10px 25px rgba(76, 175, 80, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              ✏️ {t.editProfile}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsEditMode(false);
                stopCamera();
                fetchProfile();
              }}
              className="secondary-btn"
              style={{
                borderRadius: '28px',
                padding: '0.8rem 1.75rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)'
              }}
            >
              {t.cancel}
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN LAYOUT GRID */}
      <div className="grid-responsive-layout">
        
        {/* Left Side Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* DIGITAL KISAN ID CARD (Highly Detailed Realistic Design) */}
          <div style={{
            background: 'linear-gradient(135deg, #112519 0%, #080f0b 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(129, 199, 132, 0.3)',
            padding: '1.75rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(129, 199, 132, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '245px'
          }}>
            {/* Holographic Chip */}
            <div style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              width: '45px',
              height: '35px',
              background: 'linear-gradient(135deg, #f39c12 0%, #f1c40f 50%, #f39c12 100%)',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 0 12px rgba(241,196,15,0.3)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', padding: '6px', height: '100%' }}>
                <div style={{ borderBottom: '1px solid rgba(0,0,0,0.2)', borderRight: '1px solid rgba(0,0,0,0.2)' }} />
                <div style={{ borderBottom: '1px solid rgba(0,0,0,0.2)' }} />
                <div style={{ borderRight: '1px solid rgba(0,0,0,0.2)' }} />
                <div />
              </div>
            </div>

            {/* Glowing organic overlay */}
            <div style={{ position: 'absolute', right: '-20%', bottom: '-20%', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(129, 199, 132, 0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🇮🇳</span>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '1px', textTransform: 'uppercase' }}>MINISTRY OF AGRICULTURE</div>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>DIGITAL KISAN IDENTITY CARD</div>
                </div>
              </div>

              {/* Photo & Identity details */}
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={photoUrl} alt="Avatar" style={{ width: '85px', height: '85px', borderRadius: '16px', objectFit: 'cover', border: '2px solid rgba(129, 199, 132, 0.5)', background: '#101c14' }} />
                  <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#2ecc71', color: '#000', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', border: '2px solid #080f0b' }}>✓</div>
                </div>

                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>{name || 'Swaraj Singh'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace', fontWeight: 'bold' }}>CARD ID: KM-{phone.slice(-4) || '7295'}-2026</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(46,204,113,0.12)', color: '#2ecc71', border: '1px solid rgba(46,204,113,0.25)', padding: '2px 8px', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Member</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom meta details */}
            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.85rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 700 }}>Farmer Contact</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{phone || 'Not Provided'}</span>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.55rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Security Seal</span>
                <div style={{ width: '80px', height: '14px', background: 'repeating-linear-gradient(90deg, #fff 0px, #fff 2px, #000 2px, #000 4px)', borderRadius: '2px' }} />
              </div>
            </div>
          </div>

        </div>

        {/* Right Side Column: Editable Form / Biometric Camera */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Biometric camera block (show only when camera active or editing photo) */}
          {isCameraActive && (
            <div className="glass-card" style={{ border: '1.5px solid var(--primary)', borderRadius: '24px', padding: '1.5rem', background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                📸 Biometric Photo Capture Lens
              </div>
              <div style={{ position: 'relative', width: '100%', maxWidth: '300px', height: '300px', borderRadius: '20px', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute',
                  inset: '30px',
                  border: '2px dashed rgba(129, 199, 132, 0.5)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  animation: 'spin 12s linear infinite'
                }} />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '300px' }}>
                <button 
                  type="button" 
                  onClick={capturePhoto} 
                  className="primary-btn" 
                  style={{ flex: 1, background: 'linear-gradient(135deg, #2ecc71, #27ae60)', borderRadius: '16px', padding: '0.75rem', border: 'none', color: '#060a08', fontWeight: 800, cursor: 'pointer' }}
                >
                  Capture Frame
                </button>
                <button 
                  type="button" 
                  onClick={stopCamera} 
                  className="secondary-btn" 
                  style={{ flex: 1, border: '1px solid #ef4444', color: '#ef4444', borderRadius: '16px', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.05)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Turn Off
                </button>
              </div>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleProfileSave} className="glass-card" style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.85rem' }}>
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#fff',
                marginBottom: '1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>⚙️</span> {t.personalSection}
              </h3>
              
              {/* Photo Options Panel (Interactive triggers) */}
              {isEditMode && (
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img src={photoUrl} alt="Preview" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--primary)' }} />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 750, color: '#fff' }}>Profile Avatar</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Change your dashboard portrait</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="primary-btn" 
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.5rem 1rem', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      📤 Upload Photo
                    </button>
                    <button 
                      type="button" 
                      onClick={startCamera} 
                      className="primary-btn" 
                      style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', border: 'none', borderRadius: '12px', padding: '0.5rem 1rem', color: '#060a08', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      📷 Use Webcam
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-responsive-1col">
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 750, color: 'var(--text-secondary)' }}>{t.fullName}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '13px', fontSize: '1.15rem', opacity: 0.6 }}>👤</span>
                    <input 
                      type="text" 
                      className="search-input" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditMode}
                      required
                      style={getInputStyle(isEditMode)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 750, color: 'var(--text-secondary)' }}>{t.email}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '13px', fontSize: '1.15rem', opacity: 0.6 }}>✉️</span>
                    <input 
                      type="email" 
                      className="search-input" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="farmer@krishimitra.com"
                      disabled={!isEditMode}
                      style={getInputStyle(isEditMode)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }} className="grid-responsive-1col">
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 750, color: 'var(--text-secondary)' }}>{t.phone}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '13px', fontSize: '1.15rem', opacity: 0.6 }}>📞</span>
                    <input 
                      type="tel" 
                      className="search-input" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      disabled={!isEditMode}
                      style={getInputStyle(isEditMode)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 750, color: 'var(--text-secondary)' }}>{t.farmSize}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '13px', fontSize: '1.15rem', opacity: 0.6 }}>🚜</span>
                    <input 
                      type="number" 
                      step="0.1"
                      className="search-input" 
                      value={farmSize} 
                      onChange={(e) => setFarmSize(e.target.value)}
                      disabled={!isEditMode}
                      required
                      style={getInputStyle(isEditMode)}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Action buttons */}
            {isEditMode && (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditMode(false);
                    stopCamera();
                    fetchProfile();
                  }}
                  className="secondary-btn"
                  style={{ paddingInline: '2rem', borderRadius: '24px', fontSize: '0.92rem', height: '42px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="primary-btn"
                  style={{
                    paddingInline: '2.5rem',
                    borderRadius: '24px',
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--primary)',
                    color: '#060a08',
                    border: 'none',
                    fontWeight: 800,
                    height: '42px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(129,199,132,0.2)'
                  }}
                  disabled={loading}
                >
                  {loading && <span className="logo-ring" style={{ width: '16px', height: '16px', animation: 'spin 2s linear infinite', borderStyle: 'solid' }} />}
                  <span>{t.saveChanges}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
      
    </div>
  );
};
