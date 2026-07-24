import React, { useEffect, useState } from 'react';
import type { Language } from '../App';

interface SplashScreenProps {
  language: Language;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ language, onFinish }) => {
  const [pulse, setPulse] = useState(true);
  const [typedText, setTypedText] = useState('');

  const brandingText = {
    en: 'Your AI Farming Companion',
    hi: 'आपका एआई कृषि साथी',
    pb: 'ਤੁਹਾਡਾ ਏਆਈ ਖੇਤੀਬਾੜੀ ਸਾਥੀ',
    mr: 'तुमचा एआय शेती सोबती',
    bn: 'আপনার এআই কৃষি সঙ্গী'
  };

  useEffect(() => {
    // Typing text animation
    const fullText = brandingText[language] || brandingText['en'];
    let index = 0;
    const interval = setInterval(() => {
      setTypedText((prev) => prev + fullText.charAt(index));
      index++;
      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, 45);

    // Timeout to finish splash screen
    const timer = setTimeout(() => {
      setPulse(false);
      onFinish();
    }, 2400);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [language]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(circle at center, #0b1c11 0%, #040806 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      color: '#fff',
      fontFamily: '"Outfit", sans-serif'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        animation: pulse ? 'pulseContainer 2s infinite ease-in-out' : 'fadeOut 0.4s forwards'
      }}>
        {/* Animated Leaf Logo Ring */}
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'rgba(129, 199, 132, 0.06)',
          border: '2px dashed var(--primary, #81c784)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 40px rgba(129, 199, 132, 0.2)',
          animation: 'spin 12s linear infinite'
        }}>
          <span style={{ fontSize: '3rem', transform: 'rotate(-15deg) scaleX(-1)' }}>🌱</span>
        </div>

        {/* Branding Name */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #ffffff 40%, #81c784 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            KrishiMitra-Ai
          </h1>
          <p style={{
            fontSize: '0.9rem',
            color: '#a5d6a7',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginTop: '4px',
            opacity: 0.8
          }}>
            कृषि मित्र एआई
          </p>
        </div>

        {/* Dynamic Typing Tagline */}
        <div style={{
          minHeight: '24px',
          fontSize: '1rem',
          color: '#cbd5e1',
          fontWeight: 500,
          textAlign: 'center',
          marginTop: '0.5rem',
          fontStyle: 'italic'
        }}>
          {typedText}
          <span style={{ animation: 'blink 0.8s infinite', marginLeft: '2px', fontWeight: 'bold', color: 'var(--primary)' }}>|</span>
        </div>
      </div>

      {/* Styled Animations */}
      <style>{`
        @keyframes pulseContainer {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fadeOut {
          to { opacity: 0; transform: scale(0.95); }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
