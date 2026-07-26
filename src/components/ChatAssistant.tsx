import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '../App';
import { API_BASE_URL, getWebSocketUrl } from '../config';
import { AudioStreamProcessor } from '../utils/audioProcessor';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  time: string;
  image?: string; // Optional attached image Base64 string
  audio?: string; // Optional base64 audio data
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

interface ChatAssistantProps {
  language: Language;
}

const TRANSLATIONS: Record<Language, {
  placeholder: string;
  typing: string;
  queries: string;
  listening: string;
  speakNow: string;
  voiceQuery: string;
  online: string;
  suggestions: string[];
  newChat: string;
  historyTitle: string;
  noHistory: string;
  deleteTooltip: string;
  toggleSidebar: string;
  voiceOn: string;
  voiceOff: string;
  replayTooltip: string;
  startCall: string;
  endCall: string;
  callListening: string;
  callThinking: string;
  callSpeaking: string;
  callInactive: string;
  micMuted: string;
}> = {
  en: {
    placeholder: 'Ask about fertilizer ratios, leaf rust treatment, watering...',
    typing: 'KrishiMitra-Ai is typing...',
    queries: 'Common Queries:',
    listening: 'Listening to Voice...',
    speakNow: 'Speak now into your microphone...',
    voiceQuery: 'What is the best fertilizer ratio for wheat?',
    online: 'Online ● AI Assistant',
    suggestions: [
      "Best fertilizer for Wheat?",
      "How to cure Early Blight on Tomatoes?",
      "What is CRI watering stage in Wheat?"
    ],
    newChat: 'New Chat',
    historyTitle: 'Chat History',
    noHistory: 'No past chats',
    deleteTooltip: 'Delete Chat',
    toggleSidebar: 'Toggle Sidebar',
    voiceOn: 'Voice On',
    voiceOff: 'Voice Muted',
    replayTooltip: 'Read Out',
    startCall: 'Voice Call',
    endCall: 'End Call',
    callListening: 'Listening...',
    callThinking: 'Thinking...',
    callSpeaking: 'Speaking...',
    callInactive: 'Call ended',
    micMuted: 'Microphone is muted'
  },
  hi: {
    placeholder: 'उर्वरक अनुपात, पत्ती के जंग के उपचार, सिंचाई के बारे में पूछें...',
    typing: 'कृषि मित्र एआई टाइप कर रहा है...',
    queries: 'सामान्य प्रश्न:',
    listening: 'आवाज सुनी जा रही है...',
    speakNow: 'अपने माइक्रोफ़ोन में बोलें...',
    voiceQuery: 'गेहूं के लिए सबसे अच्छा उर्वरक अनुपात क्या है?',
    online: 'सक्रिय ● एआई सहायक',
    suggestions: [
      "गेहूं के लिए सर्वोत्तम उर्वरक?",
      "टमाटर पर अगेती झुलसा का इलाज कैसे करें?",
      "गेहूं में CRI सिंचाई चरण क्या है?"
    ],
    newChat: 'नया चैट',
    historyTitle: 'पिछली बातचीत',
    noHistory: 'कोई इतिहास नहीं है',
    deleteTooltip: 'चैट हटाएं',
    toggleSidebar: 'साइडबार छिपाएं/दिखाएं',
    voiceOn: 'आवाज चालू',
    voiceOff: 'आवाज बंद',
    replayTooltip: 'सुनाएं',
    startCall: 'आवाज कॉल',
    endCall: 'कॉल समाप्त',
    callListening: 'सुना जा रहा है...',
    callThinking: 'कृषि मित्र विचार कर रहा है...',
    callSpeaking: 'कृषि मित्र बोल रहा है...',
    callInactive: 'कॉल समाप्त',
    micMuted: 'माइक्रोफोन बंद है'
  },
  pb: {
    placeholder: 'ਖਾਦ ਦੀ ਮਾਤਰਾ, ਪੱਤਿਆਂ ਦੇ ਰੋਗ, ਜਾਂ ਸਿੰਚਾਈ ਬਾਰੇ ਪੁੱਛੋ...',
    typing: 'ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ ਏਆਈ ਲਿਖ ਰਿਹਾ ਹੈ...',
    queries: 'ਆਮ ਸਵਾਲ:',
    listening: 'ਆਵਾਜ਼ ਸੁਣੀ ਜਾ ਰਹੀ ਹੈ...',
    speakNow: 'ਮਾਈਕ੍ਰੋਫੋਨ ਵਿੱਚ ਬੋਲੋ...',
    voiceQuery: 'ਕਣਕ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਖਾਦ ਦਾ ਅਨੁਪਾਤ ਕੀ ਹੈ?',
    online: 'ਸਰਗਰਮ ● ਏਆਈ ਸਹਾਇਕ',
    suggestions: [
      "ਕਣਕ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਖਾਦ?",
      "ਟਮਾਟਰਾਂ ਦੇ ਝੁਲਸ ਰੋਗ ਦਾ ਇਲਾਜ ਕਿਵੇਂ ਕਰੀਏ?",
      "ਕਣਕ ਵਿੱਚ ਸਿੰਚਾਈ ਦੀ CRI ਸਟੇਜ ਕੀ ਹੁੰਦੀ ਹੈ?"
    ],
    newChat: 'ਨਵਾਂ ਚੈਟ',
    historyTitle: 'ਪਿਛਲੀ ਗੱਲਬਾਤ',
    noHistory: 'ਕੋਈ ਪੁਰਾਣਾ ਚੈਟ ਨਹੀਂ',
    deleteTooltip: 'ਚੈਟ ਹਟਾਓ',
    toggleSidebar: 'ਸਾਈਡਬਾਰ ਟੌਗਲ ਕਰੋ',
    voiceOn: 'ਆਵਾਜ਼ ਚਾਲੂ',
    voiceOff: 'ਆਵਾਜ਼ ਬੰਦ',
    replayTooltip: 'ਸੁਣਾਓ',
    startCall: 'ਵੋਇਸ ਕਾਲ',
    endCall: 'ਕਾਲ ਬੰਦ',
    callListening: 'ਸੁਣ ਰਿਹਾ ਹੈ...',
    callThinking: 'ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ ਸੋਚ ਰਿਹਾ ਹੈ...',
    callSpeaking: 'ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ ਬੋਲ ਰਿਹਾ ਹੈ...',
    callInactive: 'ਕਾਲ ਸਮਾਪਤ',
    micMuted: 'ਮਾਈਕ੍ਰੋਫੋਨ ਬੰਦ ਹੈ'
  },
  mr: {
    placeholder: 'खत प्रमाण, तांबे फवारणी, सिंचन बद्दल विचारा...',
    typing: 'कृषी मित्र एआय टाईप करत आहे...',
    queries: 'सामान्य प्रश्न:',
    listening: 'आवाज ऐकत आहे...',
    speakNow: 'मायक्रोफोनमध्ये बोला...',
    voiceQuery: 'गव्हासाठी सर्वोत्तम खताचे प्रमाण काय आहे?',
    online: 'सक्रिय ● एआय सहाय्यक',
    suggestions: [
      "गव्हासाठी सर्वोत्तम खत?",
      "टोमॅटोवरील रोगावर कसा उपचार करावा?",
      "गव्हामध्ये पाणी देण्याची योग्य वेळ कोणती?"
    ],
    newChat: 'नवीन चॅट',
    historyTitle: 'मागील गप्पा',
    noHistory: 'जुनी संभाषणे नाहीत',
    deleteTooltip: 'चॅट डिलीट करा',
    toggleSidebar: 'साइडबार लपवा/दाखवा',
    voiceOn: 'आवाज चालू',
    voiceOff: 'आवाज बंद',
    replayTooltip: 'वाचा',
    startCall: 'आवाज कॉल',
    endCall: 'कॉल बंद',
    callListening: 'ऐकत आहे...',
    callThinking: 'कृषी मित्र विचार करत आहे...',
    callSpeaking: 'कृषी मित्र बोलत आहे...',
    callInactive: 'कॉल समाप्त',
    micMuted: 'मायक्रोफोन बंद आहे'
  },
  bn: {
    placeholder: 'সার প্রয়োগ, পাতার মরিচা রোগ, জল দেওয়া সম্পর্কে জিজ্ঞাসা করুন...',
    typing: 'কৃষি মিত্র এআই লিখছে...',
    queries: 'সাধারণ প্রশ্নাবলী:',
    listening: 'কণ্ঠস্বর শোনা হচ্ছে...',
    speakNow: 'মাইক্রোফোনে কথা বলুন...',
    voiceQuery: 'গমের জন্য সেরা সারের অনুপাত কী?',
    online: 'সক্রিয় ● এআই অ্যাসিস্ট্যান্ট',
    suggestions: [
      "গমের জন্য সেরা সার কোনটি?",
      "টমেটোর রোগ প্রতিকার করার উপায় কী?",
      "গমে জল দেওয়ার সঠিক সময় কখন?"
    ],
    newChat: 'নতুন চ্যাট',
    historyTitle: 'আগের চ্যাট',
    noHistory: 'কোন আগের চ্যাট নেই',
    deleteTooltip: 'মুছে ফেলুন',
    toggleSidebar: 'সাইডবার টগল করুন',
    voiceOn: 'আওয়াজ চালু',
    voiceOff: 'আওয়াজ বন্ধ',
    replayTooltip: 'শোনাও',
    startCall: 'ভয়েস কল',
    endCall: 'কল শেষ',
    callListening: 'শুনছি...',
    callThinking: 'ভাবছি...',
    callSpeaking: 'বলছি...',
    callInactive: 'কল সমাপ্ত',
    micMuted: 'মাইক্রোফোন বন্ধ'
  }
};

const TRANSLATIONS_MAPPED = TRANSLATIONS as Record<Language, typeof TRANSLATIONS['en']>;

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ language }) => {
  // Load active chat messages from localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    const cached = localStorage.getItem('km_active_chat_messages');
    if (!cached) {
      return [
        {
          sender: 'bot',
          text: 'Namaste! I am KrishiMitra-Ai, your digital agronomist assistant. You can type your agricultural queries in English, Hindi, or Punjabi. Try clicking on any suggestions below to ask!',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
      ];
    }
    try {
      const parsed = JSON.parse(cached) as Message[];
      let hasImage = false;
      const cleaned = parsed.map(msg => {
        if (msg.image && msg.image.startsWith('data:image')) {
          hasImage = true;
          return { ...msg, image: 'placeholder' };
        }
        return msg;
      });
      if (hasImage) {
        localStorage.setItem('km_active_chat_messages', JSON.stringify(cleaned));
      }
      return cleaned;
    } catch (e) {
      console.error('Failed to parse cached chat messages');
      return [];
    }
  });

  // Load saved sessions list
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const cached = localStorage.getItem('km_chat_sessions');
    if (!cached) return [];
    try {
      const parsed = JSON.parse(cached) as ChatSession[];
      let hasImage = false;
      const cleaned = parsed.map(sess => ({
        ...sess,
        messages: sess.messages ? sess.messages.map(msg => {
          if (msg.image && msg.image.startsWith('data:image')) {
            hasImage = true;
            return { ...msg, image: 'placeholder' };
          }
          return msg;
        }) : []
      }));
      if (hasImage) {
        localStorage.setItem('km_chat_sessions', JSON.stringify(cleaned));
      }
      return cleaned;
    } catch (e) {
      console.error('Failed to parse cached sessions');
      return [];
    }
  });

  // UI state states
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth > 768);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null); // Base64 data URL
  const [attachedMimeType, setAttachedMimeType] = useState<string>('image/jpeg');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Real-time Voice Call session states
  const [isCallActive, setIsCallActive] = useState(false);
  const [callState, setCallState] = useState<'listening' | 'thinking' | 'speaking' | 'inactive'>('inactive');
  const [isMuted, setIsMuted] = useState(false);
  const [callErrorMessage, setCallErrorMessage] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS_MAPPED[language] || TRANSLATIONS_MAPPED['en'];

  // Ref trackers for call execution context
  const isCallActiveRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isMutedRef = useRef(false);
  
  // Refs for Gemini Live WebSocket and Audio Processing
  const wsRef = useRef<WebSocket | null>(null);
  const audioProcessorRef = useRef<AudioStreamProcessor | null>(null);
  const liveTranscriptRef = useRef('');

  // Sync refs to prevent react stale closures in Web Speech API handlers
  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

  // Auto-scroll to bottom whenever messages or typing indicator changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Pre-load browser speech synthesis voices to prevent empty array on page load
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  // Save active messages whenever they update (stripping heavy base64 images to prevent QuotaExceededError)
  useEffect(() => {
    try {
      const cleanMessages = messages.map(msg => {
        if (msg.image) {
          return { ...msg, image: 'placeholder' };
        }
        return msg;
      });
      localStorage.setItem('km_active_chat_messages', JSON.stringify(cleanMessages));
    } catch (e) {
      console.warn("LocalStorage save failed for active messages:", e);
    }
  }, [messages]);

  // Save sessions list whenever it updates (stripping heavy base64 images to prevent QuotaExceededError)
  useEffect(() => {
    try {
      const cleanSessions = sessions.map(sess => ({
        ...sess,
        messages: sess.messages ? sess.messages.map(msg => msg.image ? { ...msg, image: 'placeholder' } : msg) : []
      }));
      localStorage.setItem('km_chat_sessions', JSON.stringify(cleanSessions));
    } catch (e) {
      console.warn("LocalStorage save failed for sessions:", e);
    }
  }, [sessions]);

  // Handler for image attachment selections (both camera and file picker)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setAttachmentError(language === 'en' ? 'File size exceeds 10MB limit' : 'ਫ਼ਾਈਲ ਦਾ ਸਾਈਜ਼ 10MB ਤੋਂ ਜ਼ਿਆਦਾ ਹੈ।');
      return;
    }

    setAttachedMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        setAttachedImage(event.target.result as string);
        setShowAttachmentMenu(false); // Hide overlay bottom sheet on success
      }
    };
    reader.onerror = () => {
      setAttachmentError(language === 'en' ? 'Error loading image file' : 'ਫ਼ਾਈਲ ਲੋਡ ਕਰਨ ਵਿੱਚ ਸਮੱਸਿਆ ਆਈ।');
    };
    reader.readAsDataURL(file);
  };

  // Start the device camera streaming session (supports front/back toggle)
  const startCamera = async () => {
    setAttachmentError(null);
    setCameraError(null);
    setIsCameraActive(true);
    setShowAttachmentMenu(false); // Hide selection modal
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer rear camera on mobile
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait a small tick to ensure the stream is bound
        setTimeout(() => {
          videoRef.current?.play().catch(e => console.error("Play failed:", e));
        }, 150);
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError(language === 'en' ? 'Camera access denied or unavailable' : 'ਕੈਮਰਾ ਵਰਤਣ ਦੀ ਇਜਾਜ਼ਤ ਨਹੀਂ ਮਿਲੀ।');
    }
  };

  // Capture static image from active video stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setAttachedImage(dataUrl);
        setAttachedMimeType('image/jpeg');
        stopCamera();
      }
    }
  };

  // Close camera track and stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-cancel speaking and connections on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (audioProcessorRef.current) {
        audioProcessorRef.current.destroy();
      }
    };
  }, []);

  // Text-To-Speech function with safety recovery timeout to bypass browser hang bugs (for text chat mode replay)
  // Text-To-Speech function with native audio playback support
  const speakText = (text: string, onSpeechDone?: () => void, audioBase64?: string) => {
    // Stop any existing speech synthesis and native audio playbacks
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const currentAudio = (window as any)._currentAudioPlayback;
    if (currentAudio) {
      try { currentAudio.pause(); } catch(e) {}
      (window as any)._currentAudioPlayback = null;
    }

    if (audioBase64) {
      // Play native high-quality voice audio
      try {
        const mime = audioBase64.startsWith("UklGR") ? "audio/wav" : "audio/mpeg";
        const audioUrl = `data:${mime};base64,` + audioBase64;
        const audio = new Audio(audioUrl);
        (window as any)._currentAudioPlayback = audio;
        
        isSpeakingRef.current = true;
        if (isCallActiveRef.current) {
          setCallState('speaking');
        }
        
        audio.onended = () => {
          isSpeakingRef.current = false;
          if (isCallActiveRef.current) {
            setCallState('listening');
          }
          if (onSpeechDone) onSpeechDone();
        };
        
        audio.onerror = (e) => {
          console.warn("Native audio playback failed, falling back to browser synthesis:", e);
          speakTextFallback(text, onSpeechDone);
        };
        
        audio.play();
        return;
      } catch (err) {
        console.warn("Native audio play invocation failed, falling back:", err);
      }
    }
    
    speakTextFallback(text, onSpeechDone);
  };

  const speakTextFallback = (text: string, onSpeechDone?: () => void) => {
    if (!('speechSynthesis' in window)) {
      if (onSpeechDone) onSpeechDone();
      return;
    }
    
    isSpeakingRef.current = true;

    if (isCallActiveRef.current) {
      setCallState('speaking');
    }

    const cleanText = text
      .replace(/\*\*|###|##|#|\*/g, '')
      .replace(/●|•|◦|▪/g, '')
      .replace(/⏰|🎙️|🎤|🔊|📞|✅|❌|⚠️|💡|🌾|🌿|🍅/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Adjusted to a more natural and clear speaking rate
    utterance.pitch = 1.15; // Set higher pitch for natural female tone by default
    utterance.volume = 1.0; // Full volume
    
    // Check available system voices to determine if localized voice package is installed
    const voices = window.speechSynthesis.getVoices();
    const targetLang = language === 'hi' ? 'hi-IN' :
                        language === 'pb' ? 'pa-IN' :
                        language === 'mr' ? 'mr-IN' :
                        language === 'bn' ? 'bn-IN' : 'en-IN';

    const hasMatchingVoice = voices.some(v => v.lang.toLowerCase().startsWith(targetLang.toLowerCase()));
    
    // Set target language, or fallback to the browser's default native locale to guarantee sound
    const defaultBrowserLang = window.navigator.language || 'en-US';
    utterance.lang = hasMatchingVoice ? targetLang : defaultBrowserLang;

    // Female voice filtering logic to avoid male voices
    const targetLangLower = utterance.lang.toLowerCase();
    const femaleKeywords = [
      'female', 'woman', 'girl', 'swara', 'zira', 'aria', 'natasha', 'heera', 
      'kalpana', 'kiran', 'neerja', 'latha', 'geeta', 'shruti', 'shriya', 
      'ananya', 'sangeeta', 'हिन्दी', 'google'
    ];
    const maleKeywords = [
      'male', 'man', 'boy', 'guy', 'david', 'ravi', 'hemant', 'harish', 
      'george', 'mark', 'zayn', 'prakash', 'madhur'
    ];
    const premiumKeywords = ['natural', 'online', 'google', 'neural', 'cloud'];
    
    // Filter voices matching the target language
    const langMatchingVoices = voices.filter(v => {
      const langLower = v.lang.toLowerCase();
      return langLower.startsWith(targetLangLower) || targetLangLower.startsWith(langLower);
    });

    const isPremium = (v: any) => {
      const nameLower = v.name.toLowerCase();
      return premiumKeywords.some(keyword => nameLower.includes(keyword)) || v.localService === false;
    };

    const isFemale = (v: any) => {
      const nameLower = v.name.toLowerCase();
      const isMaleVoice = maleKeywords.some(keyword => nameLower.includes(keyword));
      if (isMaleVoice) return false;
      return femaleKeywords.some(keyword => nameLower.includes(keyword));
    };

    const isMale = (v: any) => {
      const nameLower = v.name.toLowerCase();
      return maleKeywords.some(keyword => nameLower.includes(keyword));
    };

    let matchingVoice = null;

    // Priority 1: Premium + Female (e.g. Microsoft Swara Online Natural, Google Hindi Female)
    matchingVoice = langMatchingVoices.find(v => isPremium(v) && isFemale(v));

    // Priority 2: Premium (non-male)
    if (!matchingVoice) {
      matchingVoice = langMatchingVoices.find(v => isPremium(v) && !isMale(v));
    }

    // Priority 3: Offline + Female (e.g. Microsoft Kalpana, Microsoft Zira)
    if (!matchingVoice) {
      matchingVoice = langMatchingVoices.find(v => isFemale(v));
    }

    // Priority 4: Offline (non-male)
    if (!matchingVoice) {
      matchingVoice = langMatchingVoices.find(v => !isMale(v));
    }

    // Priority 5: Absolute fallback to any language matching voice
    if (!matchingVoice && langMatchingVoices.length > 0) {
      matchingVoice = langMatchingVoices[0];
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
      // Adjust pitch slightly higher if we had to fall back to a male voice
      const nameLower = matchingVoice.name.toLowerCase();
      const isActuallyMale = maleKeywords.some(keyword => nameLower.includes(keyword));
      utterance.pitch = isActuallyMale ? 1.3 : 1.15;
      
      // If we got a premium online/neural voice, reset pitch/rate to standard natural defaults
      if (isPremium(matchingVoice)) {
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
      }
    } else {
      utterance.pitch = 1.15;
    }

    // Safety Timeout: Recover automatically if Chrome's speech engine freezes (famous browser bug)
    const wordCount = cleanText.split(/\s+/).length;
    const estimatedDurationMs = Math.max(3000, (wordCount / 2.2) * 1000 + 2500);

    let isFinished = false;
    const safetyTimeout = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        isSpeakingRef.current = false;
        if (isCallActiveRef.current) {
          setCallState('listening');
        }
        if (onSpeechDone) {
          onSpeechDone();
        }
      }
    }, estimatedDurationMs);

    utterance.onend = () => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(safetyTimeout);
        isSpeakingRef.current = false;
        if (isCallActiveRef.current) {
          setCallState('listening');
        }
        if (onSpeechDone) {
          onSpeechDone();
        }
      }
    };

    utterance.onerror = (e) => {
      const errStr = String(e.error);
      if (errStr !== 'interrupted' && errStr !== 'interrupted-speak' && errStr !== 'canceled') {
        console.error("Speech Synthesis Error:", e);
      } else {
        console.log("Speech Synthesis ended or was deliberately stopped:", e.error);
      }
      if (!isFinished) {
        isFinished = true;
        clearTimeout(safetyTimeout);
        isSpeakingRef.current = false;
        if (isCallActiveRef.current) {
          setCallState('listening');
        }
        if (onSpeechDone) {
          onSpeechDone();
        }
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Speech synthesis execution failed:", err);
      if (!isFinished) {
        isFinished = true;
        clearTimeout(safetyTimeout);
        isSpeakingRef.current = false;
        if (isCallActiveRef.current) {
          setCallState('listening');
        }
        if (onSpeechDone) {
          onSpeechDone();
        }
      }
    }
  };

  // Speaks a message by fetching synthesized audio in background if not already cached
  const handleSpeakMessage = async (msg: Message, index: number) => {
    if (msg.audio) {
      speakText(msg.text, undefined, msg.audio);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.text })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          // Cache the audio in this message so subsequent plays are instant
          setMessages(prev => {
            const updated = [...prev];
            if (updated[index]) {
              updated[index] = { ...updated[index], audio: data.audio };
            }
            return updated;
          });
          speakText(msg.text, undefined, data.audio);
        } else {
          speakText(msg.text);
        }
      } else {
        speakText(msg.text);
      }
    } catch (e) {
      speakText(msg.text);
    }
  };

  // Base API message sender (for standard text chat)
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() && !attachedImage) return;

    // Capture dynamic image attachments
    const currentImage = attachedImage;
    const currentMime = attachedMimeType;

    const userMessage: Message = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      image: currentImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedImage(null); // Clear preview instantly
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: textToSend,
          image: currentImage,
          mimeType: currentMime
        }),
      });
      
      if (!res.ok) {
        throw new Error('Server error');
      }

      const data = await res.json();
      setIsTyping(false);
      
      const botReply = data.response || 'Sorry, I encountered an issue.';
      
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        audio: data.audio || ''
      }]);
    } catch (err) {
      setIsTyping(false);
      const errorMsg = language === 'en' 
        ? `Could not connect to the Python backend (${API_BASE_URL}). Please ensure uvicorn main:app is running.`
        : 'ਪਾਇਥਨ ਬੈਕਐਂਡ ਨਾਲ ਕਨੈਕਟ ਨਹੀਂ ਹੋ ਸਕਿਆ।';
      
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: errorMsg,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  // Single-use trigger (Standard text interface mic) with alert diagnostics
  const handleVoiceTrigger = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition (Speech to Text) is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'hi' ? 'hi-IN' :
                       language === 'pb' ? 'pa-IN' :
                       language === 'mr' ? 'mr-IN' :
                       language === 'bn' ? 'bn-IN' : 'en-IN';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        handleSend(transcript);
      }
    };
    
    recognition.onerror = (e: any) => {
      console.warn("Speech Recognition Error:", e.error);
      if (e.error === 'not-allowed') {
        alert("Microphone permission denied. Please click the camera/mic icon in your address bar and allow microphone permissions.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Fallback handler for native voice input
  const handleNativeVoiceInputSend = async (spokenText: string) => {
    if (!spokenText.trim()) return;
    
    setCallState('thinking');
    
    const userMsg: Message = {
      sender: 'user',
      text: spokenText,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: spokenText })
      });
      
      if (res.ok) {
        const data = await res.json();
        const botReply = data.response || "No response";
        setLiveTranscript(botReply);
        
        const botMsg: Message = {
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          audio: data.audio || ''
        };
        setMessages(prev => [...prev, botMsg]);
        
        // Speak it aloud using browser Text-to-Speech
        speakText(botReply, () => {
          setCallState('listening');
          setLiveTranscript('');
        }, data.audio || '');
      } else {
        throw new Error("HTTP error");
      }
    } catch (e) {
      console.warn("Native Voice chat API error:", e);
      setCallState('listening');
      setLiveTranscript('');
      
      // Restart recognition loop
      const rec = (window as any).nativeRecognitionInstance;
      if (rec && isCallActiveRef.current && !isSpeakingRef.current && !isMutedRef.current) {
        try { rec.start(); } catch(err) {}
      }
    }
  };

  // Browser MediaRecorder voice call session (bypasses Chrome SpeechRecognition entirely)
  const startNativeVoiceCallSession = () => {
    console.log("Starting MediaRecorder-based voice call session...");
    setCallErrorMessage('');
    setIsMuted(false);
    setIsCallActive(true);
    isCallActiveRef.current = true; // Synchronize ref immediately!
    setCallState('listening');
    setLiveTranscript('');
    liveTranscriptRef.current = '';

    // Check browser support for MediaRecorder
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCallErrorMessage("Microphone access is not available. Please use Chrome or Edge on localhost.");
      setIsCallActive(false);
      setCallState('inactive');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      (window as any)._voiceStream = stream;

      const startRecordingCycle = () => {
        if (!isCallActiveRef.current || isMutedRef.current) return;

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm';
        
        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(stream, { mimeType });
        } catch {
          recorder = new MediaRecorder(stream);
        }
        
        (window as any)._voiceRecorder = recorder;
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
          if (chunks.length === 0 || !isCallActiveRef.current) return;

          setCallState('thinking');
          setLiveTranscript(language === 'hi' ? 'सोच रहा हूँ...' : 'Processing...');

          const audioBlob = new Blob(chunks, { type: mimeType });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string);
            
            try {
              const res = await fetch(`${API_BASE_URL}/api/voice-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audio: base64Audio,
                  mimeType: mimeType,
                  language: language
                })
              });

              if (!res.ok) throw new Error('Server error');

              const data = await res.json();
              const transcript = data.transcript || '';
              const botReply = data.response || 'No response';
              const botSummary = data.summary || botReply;

              // Check if Gemini returned a rate limit error specifically
              const isRateLimited = botReply.toLowerCase().includes('429') || 
                                    botReply.toLowerCase().includes('rate limit') || 
                                    botReply.toLowerCase().includes('quota exceeded') ||
                                    botReply.toLowerCase().includes('too many requests');

              // Show user's spoken text
              if (transcript) {
                setMessages(prev => [...prev, {
                  sender: 'user',
                  text: transcript,
                  time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }]);
              }

              if (isRateLimited) {
                // Rate limited - show wait message and pause for 60 seconds
                const waitMsg = language === 'hi' 
                  ? '⏳ API सीमा पार हो गई है। कृपया 1 मिनट रुकें, फिर अपने आप शुरू हो जाएगा...'
                  : '⏳ API rate limit reached. Please wait 1 minute, it will auto-resume...';
                setLiveTranscript(waitMsg);
                setCallState('thinking');
                // Wait 60 seconds then retry
                if (isCallActiveRef.current) {
                  setTimeout(() => {
                    if (isCallActiveRef.current && !isMutedRef.current) {
                      setCallState('listening');
                      setLiveTranscript('');
                      startRecordingCycle();
                    }
                  }, 60000);
                }
                return;
              }

              // Show bot reply summary in text list
              setLiveTranscript(botSummary);
              setMessages(prev => [...prev, {
                sender: 'bot',
                text: botSummary,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                audio: data.audio || ''
              }]);

              // Speak the detailed reply aloud (only if it's a valid response, not an error)
              if (isCallActiveRef.current) {
                speakText(botReply, () => {
                  setCallState('listening');
                  setLiveTranscript('');
                  // Start next recording cycle after a pause
                  if (isCallActiveRef.current && !isMutedRef.current) {
                    setTimeout(() => startRecordingCycle(), 2000);
                  }
                }, data.audio || '');
              }

            } catch (err) {
              console.warn("Voice chat API error:", err);
              // Show rate limit message on network/server errors too
              const waitMsg = language === 'hi'
                ? '⏳ सर्वर व्यस्त है। कृपया 1 मिनट रुकें...'
                : '⏳ Server busy. Please wait 1 minute...';
              setLiveTranscript(waitMsg);
              setCallState('thinking');
              // Wait 60 seconds before retry
              if (isCallActiveRef.current && !isMutedRef.current) {
                setTimeout(() => {
                  setCallState('listening');
                  setLiveTranscript('');
                  startRecordingCycle();
                }, 60000);
              }
            }
          };
          reader.readAsDataURL(audioBlob);
        };

        recorder.start();
        setCallState('listening');
        setLiveTranscript(language === 'hi' ? '🎤 बोलिए...' : '🎤 Listening...');

        // Record for 8 seconds then stop and process (longer = fewer API calls = no 429 rate limit)
        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, 8000);
      };

      // Begin the first recording cycle
      startRecordingCycle();

    }).catch(err => {
      console.error("Microphone access denied:", err);
      setCallErrorMessage("Microphone permission denied. Please allow microphone access in your browser settings.");
      setIsCallActive(false);
      setCallState('inactive');
    });
  };

  // Start continuous Gemini Live voice call session via WebSockets
  const startVoiceCallSession = async () => {
    console.log("startVoiceCallSession triggered. Language:", language);
    if (wsRef.current || isCallActive) {
      console.warn("WebSocket voice session is already active. Ignoring duplicate invocation.");
      return;
    }
    setCallErrorMessage('');
    
    // Check if secure context for mediaDevices is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const warningText = isSecure 
        ? "Microphone access is not supported or was blocked by your browser settings. Please check site permissions."
        : "Voice Assistant requires a secure context (HTTPS) or localhost to access the microphone. Please test on localhost:5173 or deploy with SSL.";
      setCallErrorMessage(warningText);
      return;
    }

    setIsMuted(false);
    setIsCallActive(true);
    isCallActiveRef.current = true; // Synchronize ref immediately!
    setCallState('listening');
    setLiveTranscript('');
    liveTranscriptRef.current = '';

    try {
      console.log("Initializing AudioStreamProcessor...");
      const processor = new AudioStreamProcessor();
      audioProcessorRef.current = processor;

      const wsUrl = getWebSocketUrl(`/api/ws/voice?lang=${language}`);
      console.log("WebSocket Connection target:", wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log("WebSocket connected to FastAPI Gemini Live proxy.");
        
        // Start microphone audio capture and stream PCM data to backend
        try {
          console.log("Requesting mic access and starting processor...");
          await processor.startMicrophone((pcmBuffer) => {
            if (ws.readyState === WebSocket.OPEN && !isMutedRef.current) {
              ws.send(pcmBuffer);
            }
          });
          console.log("Microphone recording and streaming active.");
        } catch (err) {
          console.error("Failed to start microphone:", err);
          setCallErrorMessage("Microphone access denied. Please allow microphone permissions.");
          setIsMuted(true);
        }
      };

      ws.onmessage = async (event) => {
        try {
          let rawData = event.data;
          if (rawData instanceof Blob) {
            rawData = await rawData.text();
          }
          const response = JSON.parse(rawData);
          
          // Handle Gemini Multimodal Live Server Messages
          if (response.serverContent) {
            const { modelTurn, interrupted, turnComplete } = response.serverContent;
            
            if (interrupted) {
            console.log("Gemini Live interrupted by user voice VAD.");
            processor.interruptPlayback();
            setCallState('listening');
            setLiveTranscript('');
            liveTranscriptRef.current = '';
          }

          if (modelTurn) {
            setCallState('speaking');
            const parts = modelTurn.parts || [];
            parts.forEach((part: any) => {
              // Play incoming audio chunks via Web Audio scheduler
              if (part.inlineData && part.inlineData.data) {
                processor.playAudioChunk(part.inlineData.data);
              }
              // Display transcript in real-time
              if (part.text) {
                liveTranscriptRef.current += part.text;
                setLiveTranscript(liveTranscriptRef.current);
              }
            });
          }

          if (turnComplete) {
            console.log("Gemini Live turn completed.");
            setCallState('listening');
            
            // Append finished response to messages archive log
            if (liveTranscriptRef.current) {
              const botMsg: Message = {
                sender: 'bot',
                text: liveTranscriptRef.current,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              };
              setMessages(prev => [...prev, botMsg]);
              liveTranscriptRef.current = '';
              setLiveTranscript('');
            }
          }
        }
      } catch (err) {
        console.error("Failed to parse Gemini Live message:", err);
      }
    };

    ws.onerror = (err) => {
      console.warn("WebSocket Voice Error:", err);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch(e) {}
      }
    };

    ws.onclose = () => {
      console.log("WebSocket Voice Closed.");
      // Fallback only if call is still active and we haven't already started the native recorder
      if (isCallActiveRef.current && !(window as any)._voiceRecorder) {
        if (audioProcessorRef.current) {
          try { audioProcessorRef.current.destroy(); } catch(e) {}
          audioProcessorRef.current = null;
        }
        startNativeVoiceCallSession();
      }
    };
    } catch (err) {
      console.warn("Error starting voice call session, falling back to Native voice loop:", err);
      if (audioProcessorRef.current) {
        try { audioProcessorRef.current.destroy(); } catch(e) {}
        audioProcessorRef.current = null;
      }
      startNativeVoiceCallSession();
    }
  };

  const endVoiceCallSession = () => {
    setIsCallActive(false);
    isCallActiveRef.current = false; // Synchronize ref immediately to prevent race conditions!
    setCallState('inactive');
    setLiveTranscript('');
    liveTranscriptRef.current = '';

    if (wsRef.current) {
      try { wsRef.current.close(); } catch(e) {}
      wsRef.current = null;
    }

    if (audioProcessorRef.current) {
      try { audioProcessorRef.current.destroy(); } catch(e) {}
      audioProcessorRef.current = null;
    }

    // Stop native recognition instance if active
    const nativeRec = (window as any).nativeRecognitionInstance;
    if (nativeRec) {
      try { nativeRec.stop(); } catch(e) {}
      (window as any).nativeRecognitionInstance = null;
    }

    // Stop MediaRecorder if active
    const voiceRecorder = (window as any)._voiceRecorder;
    if (voiceRecorder && voiceRecorder.state === 'recording') {
      try { voiceRecorder.stop(); } catch(e) {}
    }
    (window as any)._voiceRecorder = null;

    // Release microphone stream
    const voiceStream = (window as any)._voiceStream;
    if (voiceStream) {
      voiceStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      (window as any)._voiceStream = null;
    }

    // Stop native audio playback if active
    const currentAudio = (window as any)._currentAudioPlayback;
    if (currentAudio) {
      try { currentAudio.pause(); } catch(e) {}
      (window as any)._currentAudioPlayback = null;
    }

    // Cancel any active Speech Synthesis
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch(e) {}
    }
  };

  const handleNewChat = () => {
    const userQueries = messages.filter(m => m.sender === 'user');
    if (userQueries.length > 0) {
      const firstQuery = userQueries[0].text;
      const title = firstQuery.length > 28 ? firstQuery.substring(0, 25) + '...' : firstQuery;
      
      const newSession: ChatSession = {
        id: `session-${Date.now()}`,
        title: title,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        messages: messages
      };

      setSessions(prev => [newSession, ...prev]);
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setMessages([
      {
        sender: 'bot',
        text: 'Namaste! I am KrishiMitra-Ai, your digital agronomist assistant. You can type your agricultural queries in English, Hindi, or Punjabi. Try clicking on any suggestions below to ask!',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleLoadSession = (session: ChatSession) => {
    const activeUserQueries = messages.filter(m => m.sender === 'user');
    const isAlreadyArchived = sessions.some(s => JSON.stringify(s.messages) === JSON.stringify(messages));
    
    if (activeUserQueries.length > 0 && !isAlreadyArchived) {
      const firstQuery = activeUserQueries[0].text;
      const title = firstQuery.length > 28 ? firstQuery.substring(0, 25) + '...' : firstQuery;
      
      const archiveCurrent: ChatSession = {
        id: `session-${Date.now()}`,
        title: title,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        messages: messages
      };
      setSessions(prev => [archiveCurrent, ...prev]);
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setMessages(session.messages);
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="fade-in chat-assistant-wrapper" style={{ display: 'flex', gap: '1rem', flexWrap: 'nowrap', alignItems: 'stretch', width: '100%', minHeight: '0', flexGrow: 1, position: 'relative' }}>
      
      {/* Inject custom styles for the fluid organic visualizer */}
      <style>{`
        @keyframes liquid-glow {
          0% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(0deg) scale(1);
          }
          50% {
            border-radius: 30% 60% 70% 30% / 50% 60% 30% 60%;
            transform: rotate(180deg) scale(1.08);
          }
          100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(360deg) scale(1);
          }
        }
        
        @keyframes wave-pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.4); opacity: 0.55; }
        }

        @keyframes eq {
          0% { height: 6px; }
          100% { height: 32px; }
        }

        .premium-voice-orb {
          position: relative;
          width: 170px;
          height: 170px;
          filter: blur(1.5px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          animation: liquid-glow 9s ease-in-out infinite;
        }

        .premium-voice-orb.listening {
          background: linear-gradient(135deg, #2ecc71, #1abc9c, #27ae60);
          box-shadow: 0 0 65px rgba(46, 204, 113, 0.75), inset 0 0 25px rgba(255, 255, 255, 0.25);
        }

        .premium-voice-orb.thinking {
          background: linear-gradient(135deg, #f1c40f, #e67e22, #f39c12);
          box-shadow: 0 0 65px rgba(241, 196, 15, 0.75), inset 0 0 25px rgba(255, 255, 255, 0.25);
          animation-duration: 4.5s;
        }

        .premium-voice-orb.speaking {
          background: linear-gradient(135deg, #3498db, #9b59b6, #8e44ad);
          box-shadow: 0 0 85px rgba(52, 152, 219, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.3);
          animation-duration: 6.5s;
        }

        .orb-wave-layer {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.08);
          animation: wave-pulse 2.2s infinite ease-in-out;
        }

        .orb-wave-layer-2 {
          position: absolute;
          inset: -45px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.04);
          animation: wave-pulse 2.2s infinite ease-in-out;
          animation-delay: 0.8s;
        }
      `}</style>

      {/* Left Pane: Collapsible History Sidebar Slider (ChatGPT style) */}
      <div className="glass-card chat-history-sidebar" style={{
        flex: isSidebarOpen ? '0 0 270px' : '0 0 0px',
        width: isSidebarOpen ? '270px' : '0px',
        opacity: isSidebarOpen ? 1 : 0,
        pointerEvents: isSidebarOpen ? 'auto' : 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: isSidebarOpen ? '1.25rem' : '0px',
        gap: '1rem',
        borderRight: isSidebarOpen ? '3px solid var(--accent)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        margin: 0,
        boxShadow: isSidebarOpen ? 'var(--shadow-lg)' : 'none'
      }}>
        {/* New Chat Button */}
        <button 
          className="primary-btn"
          onClick={handleNewChat}
          style={{
            width: '100%',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            background: 'var(--accent)',
            boxShadow: '0 0 10px rgba(52, 152, 219, 0.2)'
          }}
        >
          <span>➕</span> {t.newChat}
        </button>

        {/* Sidebar Title Header with Close Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '0.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>📁 {t.historyTitle}</h4>
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
              transition: 'all 0.2s ease'
            }}
            title="Close History Sidebar"
          >
            ✕
          </button>
        </div>

        {/* Sessions Feed list */}
        <div style={{
          flexGrow: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          {sessions.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: 'var(--text-muted)', 
              fontSize: '0.82rem', 
              paddingTop: '2.5rem',
              fontStyle: 'italic'
            }}>
              {t.noHistory}
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = JSON.stringify(messages) === JSON.stringify(s.messages);
              return (
                <div 
                  key={s.id}
                  onClick={() => handleLoadSession(s)}
                  style={{
                    background: isActive ? 'var(--primary-glow)' : 'var(--bg-surface-elevated)',
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '0.75rem 0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.25s ease',
                    boxShadow: isActive ? '0 2px 8px rgba(46, 204, 113, 0.15)' : 'none'
                  }}
                  className="history-session-item"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', overflow: 'hidden' }}>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: isActive ? 600 : 500, 
                      color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      💬 {s.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {s.date}
                    </span>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteSession(e, s.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(231, 76, 60, 0.6)',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s'
                    }}
                    title={t.deleteTooltip}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#e74c3c'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(231, 76, 60, 0.6)'; }}
                  >
                    🗑️
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right/Main Pane: Active Chat Box */}
      <div className="glass-card chat-main-pane" style={{
        flex: '1 1 300px',
        width: '100%',
        maxWidth: '100%',
        minWidth: '0',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.15rem',
        justifyContent: 'space-between',
        gap: '1rem',
        position: 'relative'
      }}>
        
        {/* Real-time ChatGPT/Gemini Live Voice Call Overlay */}


        {/* Listening Voice Overlay (Single Use Mic) */}
        {isListening && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(6, 9, 12, 0.9)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            zIndex: 50,
            borderRadius: 'var(--border-radius-lg)'
          }}>
            <div className="logo-ring" style={{
              width: '80px',
              height: '80px',
              borderStyle: 'solid',
              animation: 'spin 3s linear infinite',
              borderColor: 'var(--primary)',
              boxShadow: 'var(--shadow-glow)',
              fontSize: '2rem'
            }}>
              🎙️
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 600 }}>{t.listening}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>{t.speakNow}</p>
            </div>
          </div>
        )}

        {/* Chat Pane Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Collapse Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(prev => !prev)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                color: isSidebarOpen ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                transition: 'all 0.25s',
              }}
              title={t.toggleSidebar}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-glow)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              📂
            </button>
            
            <div className="logo-ring" style={{ width: '30px', height: '30px', animation: 'spin 12s linear infinite', borderStyle: 'solid', fontSize: '0.8rem' }}>
              ✦
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>KrishiMitra Agronomy AI</h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>{t.online}</span>
            </div>
          </div>
        </div>

        {/* Real-time Gemini Live Voice Call Fullscreen Overlay */}
        {isCallActive && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(6, 9, 12, 0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            zIndex: 60,
            borderRadius: 'var(--border-radius-lg)',
            padding: '2rem'
          }}>
            {/* Pulsing voice orb */}
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="orb-wave-layer" style={{ width: '100px', height: '100px', animation: 'spin 8s linear infinite' }} />
              <div className={`premium-voice-orb ${callState}`} style={{ width: '80px', height: '80px' }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {isMuted ? t.micMuted : (callState === 'listening' ? t.callListening : callState === 'thinking' ? t.callThinking : t.callSpeaking)}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: '300px', marginInline: 'auto' }}>
                {liveTranscript ? `"${liveTranscript}"` : (language === 'en' ? 'KrishiMitra Live Audio Session Active...' : 'कृषिमित्र लाइव ऑडियो सत्र सक्रिय...')}
              </p>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
              {/* Mic toggle */}
              <button 
                onClick={() => setIsMuted(prev => !prev)} 
                className="scheme-card-btn" 
                style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? '🔇' : '🎙️'}
              </button>
              {/* Speaker toggle */}
              <button 
                onClick={() => setIsSoundEnabled(!isSoundEnabled)} 
                className="scheme-card-btn" 
                style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                title={isSoundEnabled ? "Mute Speaker" : "Unmute Speaker"}
              >
                {isSoundEnabled ? '🔊' : '🔇'}
              </button>
              {/* End call button */}
              <button 
                onClick={endVoiceCallSession} 
                className="primary-btn" 
                style={{ background: '#e74c3c', border: 'none', color: '#fff', borderRadius: '24px', padding: '0.6rem 1.5rem', fontSize: '0.95rem', fontWeight: 700 }}
              >
                🔴 {t.endCall}
              </button>
            </div>
          </div>
        )}

        {/* Message Bubble Feed */}
        <div style={{
          flexGrow: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          padding: '0.5rem',
          borderRadius: 'var(--border-radius-md)',
          background: 'rgba(0,0,0,0.15)'
        }}>
          {messages.map((msg, index) => (
            <div 
              key={index}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                <div 
                  style={{
                    background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                    color: msg.sender === 'user' ? 'var(--bg-base)' : 'var(--text-primary)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    padding: '0.75rem 1rem',
                    borderRadius: msg.sender === 'user' 
                      ? '16px 16px 2px 16px' 
                      : '16px 16px 16px 2px',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Uploaded crop attachment" 
                      style={{
                        width: '100%',
                        maxWidth: '280px',
                        borderRadius: '12px',
                        marginBottom: '0.65rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'block'
                      }} 
                    />
                  )}
                  {msg.text}
                </div>
                {msg.sender === 'bot' && (
                  <button
                    onClick={() => handleSpeakMessage(msg, index)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '50%',
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      alignSelf: 'center',
                      transition: 'background 0.2s',
                      outline: 'none',
                      flexShrink: 0
                    }}
                    title="Speak message"
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  >
                    🔊
                  </button>
                )}
              </div>

              <span style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-muted)', 
                textAlign: msg.sender === 'user' ? 'right' : 'left',
                paddingInline: '4px',
                fontWeight: 500
              }}>
                {msg.time}
              </span>
            </div>
          ))}

          {isTyping && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>
              <span className="logo-ring" style={{ width: '16px', height: '16px', animation: 'spin 2s linear infinite', borderStyle: 'solid' }}></span>
              <span>{t.typing}</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 650 }}>{t.queries}</span>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
              {t.suggestions.map((sug: string, i: number) => (
                <button 
                  key={i} 
                  className="scheme-card-btn"
                  style={{ fontSize: '1.05rem', borderRadius: '20px', padding: '0.6rem 1.35rem' }}
                  onClick={() => handleSend(sug)}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modern ChatGPT-inspired Input conductor */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', width: '100%', flexShrink: 0, marginTop: 'auto' }}>
          
          {/* Left side attachment plus icon button */}
          <button
            onClick={() => setShowAttachmentMenu(true)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
              outline: 'none',
              flexShrink: 0
            }}
            title="Attach crop/leaf photo"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
          >
            ➕
          </button>

          {/* Hidden HTML5 File Pickers wired to component references */}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
          />

          {/* Attached image preview bar */}
          {attachedImage && (
            <div style={{
              position: 'absolute',
              bottom: '72px',
              left: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(5, 7, 10, 0.95)',
              border: '1px solid var(--border-color-hover)',
              borderRadius: '12px',
              padding: '0.45rem 0.75rem',
              boxShadow: 'var(--shadow-glow)',
              zIndex: 10
            }}>
              <img 
                src={attachedImage} 
                alt="Attachment preview" 
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }} 
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Image Attached
              </span>
              <button
                onClick={() => setAttachedImage(null)}
                style={{
                  background: 'rgba(231, 76, 60, 0.2)',
                  color: '#e74c3c',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Remove attachment"
              >
                ✕
              </button>
            </div>
          )}

          {/* Pill-shaped Rounded Input Conductor */}
          <div style={{
            flexGrow: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)',
            borderRadius: '26px',
            padding: '0.25rem 0.4rem 0.25rem 0.85rem',
            gap: '0.35rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            {/* Input field */}
            <input 
              type="text" 
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(input); }}
              style={{
                flexGrow: 1,
                minWidth: '50px',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.92rem',
                padding: '0.35rem 0.15rem'
              }}
            />

            {/* Send Text Button (Upward Arrow) */}
            <button
              onClick={() => handleSend(input)}
              style={{
                background: (input.trim() || attachedImage) ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: (input.trim() || attachedImage) ? 'var(--bg-base)' : 'var(--text-muted)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (input.trim() || attachedImage) ? 'pointer' : 'default',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              title="Send Message"
              disabled={!input.trim() && !attachedImage}
            >
              <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>

            {/* Right side microphone icon button */}
            <button
              onClick={handleVoiceTrigger}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                transition: 'background 0.2s'
              }}
              title="Voice Typing (Speech to Text)"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              <svg style={{ width: '22px', height: '22px', stroke: 'currentColor' }} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
            </button>

            {/* Circular black voice call button containing white vertical sound wave bars */}
            <button
              onClick={startNativeVoiceCallSession}
              style={{
                background: '#0d0d0d',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'white',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 0 8px rgba(0,0,0,0.3)',
                flexShrink: 0
              }}
              title={t.startCall}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#222'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#0d0d0d'; }}
            >
              <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'currentColor' }}>
                <rect x="4" y="6" width="2" height="12" rx="1" />
                <rect x="9" y="3" width="2" height="18" rx="1" />
                <rect x="14" y="8" width="2" height="8" rx="1" />
                <rect x="19" y="5" width="2" height="14" rx="1" />
              </svg>
            </button>
            
          </div>
        </div>

        {/* Modern Material Design 3 Bottom Sheet / Modal */}
        {showAttachmentMenu && (
          <>
            {/* Dark overlay backdrop */}
            <div 
              onClick={() => {
                setShowAttachmentMenu(false);
                setAttachmentError(null);
              }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(4px)',
                zIndex: 80,
                borderRadius: 'var(--border-radius-lg)',
                animation: 'fadeIn 0.2s ease-out'
              }}
            />
            {/* Bottom Sheet container */}
            <div 
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px 24px 0 0',
                padding: '1.5rem',
                zIndex: 81,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.5)',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Top handle pill for MD3 bottom sheets */}
              <div style={{
                width: '40px',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                alignSelf: 'center',
                marginBottom: '0.25rem'
              }} />

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', textAlign: 'center', margin: 0 }}>
                {language === 'hi' ? 'फ़ोटो जोड़ें' : language === 'pb' ? 'ਫੋਟੋ ਜੋੜੋ' : 'Add Photo'}
              </h3>

              {attachmentError && (
                <div style={{
                  background: 'rgba(231, 76, 60, 0.1)',
                  border: '1px solid #e74c3c',
                  color: '#e74c3c',
                  borderRadius: '12px',
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  fontWeight: 500
                }}>
                  ⚠️ {attachmentError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                {/* Option 1: Take Photo */}
                <button
                  onClick={startCamera}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '1.25rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    color: '#fff',
                    transition: 'all 0.25s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>📷</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {language === 'hi' ? 'फोटो खींचें' : language === 'pb' ? 'ਕੈਮਰਾ ਚਲਾਓ' : 'Take Photo'}
                  </span>
                </button>

                {/* Option 2: Upload Photo */}
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '1.25rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    color: '#fff',
                    transition: 'all 0.25s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>🖼️</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {language === 'hi' ? 'गैलरी से चुनें' : language === 'pb' ? 'ਗੈਲਰੀ ਤੋਂ ਅਪਲੋਡ' : 'Upload Photo'}
                  </span>
                </button>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => {
                  setShowAttachmentMenu(false);
                  setAttachmentError(null);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '16px',
                  color: 'var(--text-primary)',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
              >
                {language === 'hi' ? 'रद्द करें' : language === 'pb' ? 'ਰੱਦ ਕਰੋ' : 'Cancel'}
              </button>
            </div>
          </>
        )}

        {/* Custom video camera capture interface modal */}
        {isCameraActive && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: '#090d16',
            zIndex: 90,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            gap: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              {language === 'hi' ? 'कैमरा लाइव' : language === 'pb' ? 'ਕੈਮਰਾ ਚਾਲੂ' : 'Live Camera Feed'}
            </h3>
            
            {cameraError ? (
              <div style={{
                background: 'rgba(231, 76, 60, 0.1)',
                border: '1px solid #e74c3c',
                color: '#e74c3c',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '0.95rem',
                textAlign: 'center',
                fontWeight: 600,
                maxWidth: '280px'
              }}>
                ⚠️ {cameraError}
                <button
                  onClick={stopCamera}
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--bg-base)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    marginTop: '1rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                    width: '100%'
                  }}
                >
                  {language === 'hi' ? 'बंद करें' : language === 'pb' ? 'ਬੰਦ ਕਰੋ' : 'Close'}
                </button>
              </div>
            ) : (
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '480px',
                aspectRatio: '4/3',
                background: '#000',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.1)',
                boxShadow: 'var(--shadow-glow)'
              }}>
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                {/* Hidden canvas to process frames */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            )}

            {!cameraError && (
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {/* Back button */}
                <button
                  onClick={stopCamera}
                  className="scheme-card-btn"
                  style={{
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    padding: 0
                  }}
                  title="Go Back"
                >
                  ✕
                </button>
                {/* Capture snap button */}
                <button
                  onClick={capturePhoto}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: '#fff',
                    border: '6px solid var(--primary)',
                    cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(0,0,0,0.5)',
                    transition: 'transform 0.15s'
                  }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.9)'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  title="Capture Photo"
                />
                {/* Empty spacer for alignment balance */}
                <div style={{ width: '50px' }} />
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
