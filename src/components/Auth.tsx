import React, { useState } from 'react';

interface AuthProps {
  onLogin: (userName: string, userState: string, userEmail: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1: Send OTP, 2: Enter OTP & New Password
  
  // Field values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [farmState, setFarmState] = useState('Punjab');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (isSignUp && !name) {
      setError('Please enter your name.');
      return;
    }

    // Simulate login
    const userName = isSignUp ? name : email.split('@')[0];
    onLogin(userName, farmState, email);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (forgotStep === 1) {
      // Simulate sending OTP
      setSuccessMsg('Simulated: Verification code "123456" sent to your email!');
      setForgotStep(2);
    } else {
      // Step 2: Validate OTP & Save New Password
      if (otp !== '123456') {
        setError('Incorrect verification code. Please enter "123456" for demo.');
        return;
      }
      if (newPassword.length < 6) {
        setError('New passcode must be at least 6 characters.');
        return;
      }

      // Success
      setSuccessMsg('Passcode reset successfully! Please sign in with your new password.');
      setPassword(newPassword);
      setForgotStep(1);
      setIsForgotPassword(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'var(--bg-base) var(--bg-dots)',
      backgroundSize: '24px 24px'
    }}>
      <div className="glass-card fade-in" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-premium), 0 0 45px rgba(129, 199, 132, 0.1)',
        border: '1px solid var(--border-color-hover)',
        borderRadius: '24px',
        background: 'rgba(11, 18, 14, 0.85)'
      }}>
        
        {/* Branding header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
          <div className="logo-ring" style={{ width: '50px', height: '50px', borderStyle: 'solid' }}>
            <svg viewBox="0 0 24 24" width="28" height="28" stroke="var(--primary)" strokeWidth="2.5" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            KrishiMitra-Ai
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
            {isForgotPassword 
              ? 'Recover Passcode' 
              : isSignUp 
                ? 'Create Farmer Profile' 
                : 'Sign In To Cockpit'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-glow)',
            color: 'var(--danger)',
            border: '1px solid var(--danger)',
            fontSize: '0.85rem',
            padding: '0.75rem',
            borderRadius: '12px',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(46, 204, 113, 0.1)',
            color: '#2ecc71',
            border: '1px solid rgba(46, 204, 113, 0.25)',
            fontSize: '0.85rem',
            padding: '0.75rem',
            borderRadius: '12px',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {successMsg}
          </div>
        )}

        {/* FORGOT PASSWORD FORM FLOW */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {forgotStep === 1 ? (
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 650, color: 'var(--text-secondary)' }}>Registered Email</label>
                <input 
                  type="email" 
                  className="search-input" 
                  placeholder="e.g. rajesh@farm.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', borderRadius: '12px', height: '44px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)', color: '#fff', paddingInline: '1rem' }}
                />
              </div>
            ) : (
              <>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 650, color: 'var(--text-secondary)' }}>Enter 6-digit OTP</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    className="search-input" 
                    placeholder="Enter 123456" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    style={{ width: '100%', borderRadius: '12px', height: '44px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)', color: '#fff', paddingInline: '1rem', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 650, color: 'var(--text-secondary)' }}>New Secure Passcode</label>
                  <input 
                    type="password" 
                    className="search-input" 
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', borderRadius: '12px', height: '44px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)', color: '#fff', paddingInline: '1rem' }}
                  />
                </div>
              </>
            )}

            <button type="submit" className="primary-btn" style={{ marginTop: '0.5rem', padding: '0.8rem 1rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: 700, borderRadius: '30px', cursor: 'pointer' }}>
              {forgotStep === 1 ? 'Send Recovery Code' : 'Save Passcode'}
            </button>

            <button 
              type="button" 
              onClick={() => { setIsForgotPassword(false); setForgotStep(1); setError(''); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
            >
              Back to Login
            </button>
          </form>
        ) : (
          /* LOGIN / REGISTRATION FORM */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {isSignUp && (
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 650, color: 'var(--text-secondary)' }}>Full Name</label>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="e.g. Rajesh Kumar" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', borderRadius: '12px', height: '44px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)', color: '#fff', paddingInline: '1rem' }}
                />
              </div>
            )}

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 650, color: 'var(--text-secondary)' }}>Email Address</label>
              <input 
                type="email" 
                className="search-input" 
                placeholder="e.g. rajesh@farm.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', borderRadius: '12px', height: '44px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)', color: '#fff', paddingInline: '1rem' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 650, color: 'var(--text-secondary)' }}>Password</label>
                {!isSignUp && (
                  <button 
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setError(''); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary-hover)', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                className="search-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', borderRadius: '12px', height: '44px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)', color: '#fff', paddingInline: '1rem' }}
              />
            </div>



            <button type="submit" className="primary-btn" style={{ marginTop: '0.5rem', padding: '0.8rem 1rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: 700, borderRadius: '30px', cursor: 'pointer' }}>
              {isSignUp ? 'Register & Enter' : 'Secure Login'}
            </button>
          </form>
        )}

        {/* Bottom switcher link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have a profile yet?"}{' '}
          <button 
            type="button" 
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary-hover)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => { setIsSignUp(!isSignUp); setIsForgotPassword(false); setError(''); }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
