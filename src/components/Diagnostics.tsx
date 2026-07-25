import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '../App';
import { API_BASE_URL } from '../config';

interface SavedReport {
  id: string;
  crop: string;
  disease: string;
  severity: 'High' | 'Medium' | 'None';
  date: string;
  organicRemedies: string[];
  chemicalRemedies: string[];
}

interface DiagnosticsProps {
  language: Language;
}

const TRANSLATIONS: Record<Language, {
  scannerTitle: string;
  scannerSubtitle: string;
  dragDrop: string;
  browse: string;
  logTitle: string;
  emptyLogs: string;
  logFindingsTitle: string;
  logFindingsDesc: string;
  selectCrop: string;
  diseaseName: string;
  severityLevel: string;
  organicAdd: string;
  chemicalAdd: string;
  addBtn: string;
  saveReport: string;
  diagReportTitle: string;
  diagDetails: string;
  cropAnalyzed: string;
  diagFinding: string;
  organicRemedies: string;
  chemicalRemedies: string;
  clearView: string;
  awaitingTitle: string;
  awaitingDesc: string;
  healthy: string;
  mediumSeverity: string;
  highSeverity: string;
  tomato: string;
  rice: string;
  wheat: string;
  cotton: string;
  maize: string;
}> = {
  en: {
    scannerTitle: 'AI Leaf Scanner',
    scannerSubtitle: 'Upload or capture a crop leaf picture to inspect and log diagnoses',
    dragDrop: 'Drag & Drop Leaf Photo',
    browse: 'or click to browse from files',
    logTitle: 'Saved Diagnostic Log',
    emptyLogs: 'No diagnosis reports logged yet.',
    logFindingsTitle: 'Log Diagnostic Findings',
    logFindingsDesc: 'Record plant diagnostics details',
    selectCrop: 'Select Crop',
    diseaseName: 'Diagnosis / Disease Name',
    severityLevel: 'Severity Level',
    organicAdd: 'Organic Remedies (Add item)',
    chemicalAdd: 'Chemical Remedies (Add item)',
    addBtn: 'Add',
    saveReport: 'Save Diagnostic Report',
    diagReportTitle: 'Diagnostic Report',
    diagDetails: 'Log Details',
    cropAnalyzed: 'Crop Analyzed',
    diagFinding: 'Diagnosis Finding',
    organicRemedies: 'Organic Remedies',
    chemicalRemedies: 'Chemical Remedies',
    clearView: 'Clear View',
    awaitingTitle: 'Awaiting Diagnostic Scan',
    awaitingDesc: 'Upload or capture a crop leaf photograph in the scanner zone. Once the scan is complete, you can record details and remedies in the logs.',
    healthy: 'Healthy',
    mediumSeverity: 'Medium Severity',
    highSeverity: 'High Severity',
    tomato: 'Tomato',
    rice: 'Rice (Paddy)',
    wheat: 'Wheat',
    cotton: 'Cotton',
    maize: 'Maize'
  },
  hi: {
    scannerTitle: 'एआई पत्ती स्कैनर',
    scannerSubtitle: 'रोग की जांच करने और रिपोर्ट दर्ज करने के लिए पत्ती की फोटो अपलोड या कैप्चर करें',
    dragDrop: 'पत्ती की फोटो खींचें और यहां छोड़ें',
    browse: 'या फाइलों से ब्राउज़ करने के लिए क्लिक करें',
    logTitle: 'सहेजे गए निदान लॉग',
    emptyLogs: 'अभी तक कोई निदान रिपोर्ट दर्ज नहीं की गई है।',
    logFindingsTitle: 'निदान निष्कर्ष दर्ज करें',
    logFindingsDesc: 'पौधे की जांच रिपोर्ट का विवरण दर्ज करें',
    selectCrop: 'फसल चुनें',
    diseaseName: 'निदान / बीमारी का नाम',
    severityLevel: 'गंभीरता का स्तर',
    organicAdd: 'जैविक उपचार (मद जोड़ें)',
    chemicalAdd: 'रासायनिक उपचार (मद जोड़ें)',
    addBtn: 'जोड़ें',
    saveReport: 'निदान रिपोर्ट सहेजें',
    diagReportTitle: 'निदान रिपोर्ट',
    diagDetails: 'लॉग विवरण',
    cropAnalyzed: 'विश्लेषण की गई फसल',
    diagFinding: 'निदान निष्कर्ष',
    organicRemedies: 'जैविक उपचार',
    chemicalRemedies: 'रासायनिक उपचार',
    clearView: 'साफ करें',
    awaitingTitle: 'निदान स्कैन की प्रतीक्षा है',
    awaitingDesc: 'स्कैनर क्षेत्र में फसल के पत्ते का फोटो अपलोड या कैप्चर करें। स्कैन पूरा होने के बाद, आप रिपोर्ट को सहेज सकते हैं।',
    healthy: 'स्वस्थ',
    mediumSeverity: 'मध्यम गंभीरता',
    highSeverity: 'उच्च गंभीरता',
    tomato: 'टमाटर',
    rice: 'धान (चावल)',
    wheat: 'गेहूं',
    cotton: 'कपास',
    maize: 'मक्का'
  },
  pb: {
    scannerTitle: 'ਏਆਈ ਪੱਤਾ ਸਕੈਨਰ',
    scannerSubtitle: 'ਰੋਗ ਦੀ ਜਾਂਚ ਕਰਨ ਅਤੇ ਰਿਪੋਰਟ ਦਰਜ ਕਰਨ ਲਈ ਪੱਤੇ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਜਾਂ ਕੈਪਚਰ ਕਰੋ',
    dragDrop: 'ਪੱਤੇ ਦੀ ਫੋਟੋ ਇੱਥੇ ਖਿੱਚੋ ਅਤੇ ਸੁੱਟੋ',
    browse: 'ਜਾਂ ਫਾਈਲਾਂ ਤੋਂ ਦੇਖਣ ਲਈ ਕਲਿੱਕ ਕਰੋ',
    logTitle: 'ਸੁਰੱਖਿਅਤ ਕੀਤੇ ਗਏ ਰੋਗ ਲੌਗ',
    emptyLogs: 'ਅਜੇ ਤੱਕ ਕੋਈ ਰਿਪੋਰਟ ਦਰਜ ਨਹੀਂ ਕੀਤੀ ਗਈ ਹੈ।',
    logFindingsTitle: 'ਜਾਂਚ ਦੇ ਵੇਰਵੇ ਦਰਜ ਕਰੋ',
    logFindingsDesc: 'ਪੌਦੇ ਦੀ ਜਾਂਚ ਰਿਪੋਰਟ ਦਾ ਵੇਰਵਾ ਲਿਖੋ',
    selectCrop: 'ਫਸਲ ਚੁਣੋ',
    diseaseName: 'ਬਿਮਾਰੀ / ਰੋਗ ਦਾ ਨਾਮ',
    severityLevel: 'ਗੰਭੀਰਤਾ ਦਾ ਪੱਧਰ',
    organicAdd: 'ਜੈਵਿਕ ਇਲਾਜ (ਆਈਟਮ ਜੋੜੋ)',
    chemicalAdd: 'ਰਸਾਇਣਕ ਇਲਾਜ (ਆਈਟਮ ਜੋੜੋ)',
    addBtn: 'ਜੋੜੋ',
    saveReport: 'ਜਾਂਚ ਰਿਪੋਰਟ ਸੁਰੱਖਿਅਤ ਕਰੋ',
    diagReportTitle: 'ਜਾਂਚ ਰਿਪੋਰਟ',
    diagDetails: 'ਲੌਗ ਵੇਰਵਾ',
    cropAnalyzed: 'ਜਾਂਚ ਕੀਤੀ ਗਈ ਫਸਲ',
    diagFinding: 'ਬਿਮਾਰੀ ਦਾ ਨਾਮ',
    organicRemedies: 'ਜੈਵਿਕ ਇਲਾਜ',
    chemicalRemedies: 'ਰਸਾਇਣਕ ਇਲਾਜ',
    clearView: 'ਸਾਫ਼ ਕਰੋ',
    awaitingTitle: 'ਜਾਂਚ ਸਕੈਨ ਦੀ ਉਡੀਕ ਹੈ',
    awaitingDesc: 'ਸਕੈਨਰ ਖੇਤਰ ਵਿੱਚ ਫਸਲ ਦੇ ਪੱਤੇ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਜਾਂ ਕੈਪਚਰ ਕਰੋ। ਸਕੈਨ ਪੂਰਾ ਹੋਣ ਤੋਂ ਬਾਅद, ਤੁਸੀਂ ਰਿਪੋਰਟ ਦਰਜ ਕਰ ਸਕਦੇ ਹੋ।',
    healthy: 'ਤੰਦਰੁਸਤ ਫਸਲ',
    mediumSeverity: 'ਦਰਮਿਆਨੀ ਗੰਭੀਰਤਾ',
    highSeverity: 'ਉੱਚ ਗੰਭੀਰਤਾ',
    tomato: 'ਟਮਾਟਰ',
    rice: 'ਝੋਨਾ (ਚਾਵਲ)',
    wheat: 'ਕਣਕ',
    cotton: 'ਕਪਾਹ',
    maize: 'ਮੱਕੀ'
  },
  mr: {
    scannerTitle: 'एआय पान स्कॅनर',
    scannerSubtitle: 'तपासणी करण्यासाठी आणि अहवाल नोंदवण्यासाठी पीक पानाच्या फोटो अपलोड किंवा कॅप्चर करा',
    dragDrop: 'पानाचा फोटो ओढा आणि येथे सोडा',
    browse: 'किंवा फाईल्स शोधण्यासाठी क्लिक करा',
    logTitle: 'जतन केलेले निदान लॉग',
    emptyLogs: 'अद्याप कोणतेही निदान रेकॉर्ड केलेले नाही.',
    logFindingsTitle: 'निदान माहिती नोंदवा',
    logFindingsDesc: 'वनस्पती निदान तपशील नोंदवा',
    selectCrop: 'पीक निवडा',
    diseaseName: 'निदान / रोगाचे नाव',
    severityLevel: 'तीव्रता पातळी',
    organicAdd: 'सेंद्रिय उपाय (आयटम जोडा)',
    chemicalAdd: 'रासायनिक उपाय (आयटम जोडा)',
    addBtn: 'जोडा',
    saveReport: 'निदान अहवाल जतन करा',
    diagReportTitle: 'निदान अहवाल',
    diagDetails: 'लॉग तपशील',
    cropAnalyzed: 'तपासलेले पीक',
    diagFinding: 'निदान निष्कर्ष',
    organicRemedies: 'सेंद्रिय उपाय',
    chemicalRemedies: 'रासायनिक उपाय',
    clearView: 'साफ करा',
    awaitingTitle: 'निदान स्कॅनची प्रतीक्षा आहे',
    awaitingDesc: 'स्कॅनर झोनमध्ये पीक पानाचा फोटो अपलोड किंवा कॅप्चर करा. स्कॅन पूर्ण झाल्यावर, तुम्ही तपशील आणि उपाय नोंदवू शकता.',
    healthy: 'निरोगी',
    mediumSeverity: 'मध्यम तीव्रता',
    highSeverity: 'उच्च तीव्रता',
    tomato: 'टोमॅटो',
    rice: 'भात (धान)',
    wheat: 'गहू',
    cotton: 'कापूस',
    maize: 'मका'
  },
  bn: {
    scannerTitle: 'এআই পাতা স্ক্যানার',
    scannerSubtitle: 'ফসল পরীক্ষা করতে পাতার ছবি আপলোড বা ক্যাপচার করুন',
    dragDrop: 'পাতার ছবি ড্র্যাগ করে এখানে ছাড়ুন',
    browse: 'অথবা ফাইল থেকে ছবি নির্বাচন করুন',
    logTitle: 'সংরক্ষিত পরীক্ষার রিপোর্ট',
    emptyLogs: 'এখনও কোনো রিপোর্ট নথিভুক্ত করা হয়নি।',
    logFindingsTitle: 'পরীক্ষার বিবরণ লিখুন',
    logFindingsDesc: 'উদ্ভিদ পরীক্ষার বিবরণ লিখুন',
    selectCrop: 'ফসল নির্বাচন করুন',
    diseaseName: 'রোগ নির্ণয় / রোগের নাম',
    severityLevel: 'তীব্রতার মাত্রা',
    organicAdd: 'জৈবিক প্রতিকার (আইটেম যোগ করুন)',
    chemicalAdd: 'রাসায়निक প্রতিকার (আইটেम যোগ করুন)',
    addBtn: 'যোগ করুন',
    saveReport: 'পরীক্ষার রিপোর্ট সংরক্ষণ করুন',
    diagReportTitle: 'পরীক্ষার রিপোর্ট',
    diagDetails: 'রিপোর্ট বিবরণ',
    cropAnalyzed: 'পরীক্ষিত ফসল',
    diagFinding: 'রোগের নাম',
    organicRemedies: 'জৈবিক প্রতিকার',
    chemicalRemedies: 'রাসায়निक প্রতিকার',
    clearView: 'পরিষ্কার করুন',
    awaitingTitle: 'পরীক্ষার জন্য অপেক্ষা করা হচ্ছে',
    awaitingDesc: 'স্ক্যানার স্থানে ফসলের পাতার ছবি আপলোড বা ক্যাপচার করুন। ਸਕੈਨ শেষ হলে আপনি বিবরণ লিখতে পারবেন।',
    healthy: 'সুস্থ ফসল',
    mediumSeverity: 'মাঝারি তীব্রতা',
    highSeverity: 'উচ্চ তীব্রতা',
    tomato: 'টমেটো',
    rice: 'ধান',
    wheat: 'গম',
    cotton: 'তুला',
    maize: 'ভুট্টা'
  }
};

export const Diagnostics: React.FC<DiagnosticsProps> = ({ language }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [crop, setCrop] = useState('Tomato');
  const [disease, setDisease] = useState('');
  const [severity, setSeverity] = useState<'High' | 'Medium' | 'None'>('Medium');
  const [organicInput, setOrganicInput] = useState('');
  const [chemicalInput, setChemicalInput] = useState('');
  const [organicRemedies, setOrganicRemedies] = useState<string[]>([]);
  const [chemicalRemedies, setChemicalRemedies] = useState<string[]>([]);
  
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [leafCondition, setLeafCondition] = useState('');
  const [tips, setTips] = useState<string[]>([]);
  const [activeReportLang, setActiveReportLang] = useState(language);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Crop States
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropBox, setCropBox] = useState({ x: 15, y: 15, w: 70, h: 70 });
  const [isCropping, setIsCropping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 });

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      alert("Camera access denied or unavailable.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg');
        setRawImage(base64Image);
        setCropBox({ x: 15, y: 15, w: 70, h: 70 });
        setIsCropping(true);
      }
      stopCamera();
    }
  };

  // Crop Drag Handlers
  const handleCropMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = handle;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
      boxW: cropBox.w,
      boxH: cropBox.h
    };
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.current.y) / rect.height) * 100;

    let { boxX, boxY, boxW, boxH } = dragStart.current;

    if (isDragging.current === 'move') {
      let newX = Math.max(0, Math.min(100 - boxW, boxX + deltaX));
      let newY = Math.max(0, Math.min(100 - boxH, boxY + deltaY));
      setCropBox({ ...cropBox, x: newX, y: newY });
    } else if (isDragging.current === 'se') {
      let newW = Math.max(10, Math.min(100 - boxX, boxW + deltaX));
      let newH = Math.max(10, Math.min(100 - boxY, boxH + deltaY));
      setCropBox({ ...cropBox, w: newW, h: newH });
    } else if (isDragging.current === 'nw') {
      let newX = Math.max(0, Math.min(boxX + boxW - 10, boxX + deltaX));
      let newY = Math.max(0, Math.min(boxY + boxH - 10, boxY + deltaY));
      let newW = boxW - (newX - boxX);
      let newH = boxH - (newY - boxY);
      setCropBox({ x: newX, y: newY, w: newW, h: newH });
    }
  };

  const handleCropTouchStart = (e: React.TouchEvent, handle: string) => {
    e.stopPropagation();
    const touch = e.touches[0];
    isDragging.current = handle;
    dragStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
      boxW: cropBox.w,
      boxH: cropBox.h
    };
  };

  const handleCropTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((touch.clientX - dragStart.current.x) / rect.width) * 100;
    const deltaY = ((touch.clientY - dragStart.current.y) / rect.height) * 100;

    let { boxX, boxY, boxW, boxH } = dragStart.current;

    if (isDragging.current === 'move') {
      let newX = Math.max(0, Math.min(100 - boxW, boxX + deltaX));
      let newY = Math.max(0, Math.min(100 - boxH, boxY + deltaY));
      setCropBox({ ...cropBox, x: newX, y: newY });
    } else if (isDragging.current === 'se') {
      let newW = Math.max(10, Math.min(100 - boxX, boxW + deltaX));
      let newH = Math.max(10, Math.min(100 - boxY, boxH + deltaY));
      setCropBox({ ...cropBox, w: newW, h: newH });
    }
  };

  const handleCropMouseUp = () => {
    isDragging.current = null;
  };

  const handleConfirmCrop = () => {
    if (!rawImage) return;
    const img = new Image();
    img.src = rawImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const pixelX = (cropBox.x / 100) * img.width;
      const pixelY = (cropBox.y / 100) * img.height;
      const pixelW = (cropBox.w / 100) * img.width;
      const pixelH = (cropBox.h / 100) * img.height;
      
      canvas.width = pixelW;
      canvas.height = pixelH;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, pixelX, pixelY, pixelW, pixelH, 0, 0, pixelW, pixelH);
        const croppedBase64 = canvas.toDataURL('image/jpeg');
        setImagePreview(croppedBase64);
        setIsCropping(false);
        setRawImage(null);
        
        fetch(croppedBase64)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "cropped_leaf.jpg", { type: "image/jpeg" });
            startScanning(file);
          });
      }
    };
  };

  const t = TRANSLATIONS[language];

  // Fetch scan logs on component load
  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/scans`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.warn("Could not retrieve scans list from backend database.");
    }
  };

  const startScanning = async (file: File) => {
    setIsScanning(true);
    setScanProgress(0);
    setShowReportBuilder(false);
    setSelectedReport(null);
    
    const statuses = [
      'Initializing crop diagnostic scan...',
      'Uploading image to Python server...',
      'Analyzing leaf structural integrity...',
      'Comparing patterns with disease library...',
      'Generating remedies report...'
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      if (currentProgress < 90) {
        currentProgress += 10;
        setScanProgress(currentProgress);
        const statusIdx = Math.min(
          Math.floor((currentProgress / 100) * statuses.length),
          statuses.length - 1
        );
        setScanStatus(statuses[statusIdx]);
      }
    }, 120);

    try {
      const getBase64 = (f: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(f);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      };

      const base64Image = await getBase64(file);

      const res = await fetch(`${API_BASE_URL}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64Image,
          mimeType: file.type || 'image/jpeg'
        })
      });

      clearInterval(interval);

      if (!res.ok) {
        throw new Error('API server offline');
      }

      const scanResult = await res.json();
      setScanProgress(100);
      setScanStatus('Diagnosis complete!');
      
      // Auto populate report builder with AI findings
      setCrop(scanResult.crop || 'Tomato');
      setDisease(scanResult.disease || 'Healthy Crop');
      setSeverity(scanResult.severity || 'None');
      setOrganicRemedies(scanResult.organicRemedies || []);
      setChemicalRemedies(scanResult.chemicalRemedies || []);
      setLeafCondition(scanResult.leafCondition || '');
      setTips(scanResult.tips || []);
      setActiveReportLang(language);
      
      setTimeout(() => {
        setIsScanning(false);
        setShowReportBuilder(true); // Open analysis findings instantly!
        fetchScans(); // Refresh log entries from database
      }, 400);

    } catch (err) {
      clearInterval(interval);
      setIsScanning(false);
      setDisease(language === 'en' ? 'Scan failed (Server offline)' : language === 'hi' ? 'स्कैन विफल (सर्वर ऑफ़लाइन)' : 'ਸਕੈਨ ਅਸਫਲ (ਸਰਵਰ ਔਫਲਾਈਨ)');
      setShowReportBuilder(true);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      setRawImage(base64Data);
      setCropBox({ x: 15, y: 15, w: 70, h: 70 });
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const handleAddOrganic = () => {
    if (organicInput.trim()) {
      setOrganicRemedies([...organicRemedies, organicInput.trim()]);
      setOrganicInput('');
    }
  };

  const handleAddChemical = () => {
    if (chemicalInput.trim()) {
      setChemicalRemedies([...chemicalRemedies, chemicalInput.trim()]);
      setChemicalInput('');
    }
  };

  const handleSaveReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!disease.trim()) return;

    const reportId = `rep-${Date.now()}`;
    const dateStr = new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const organic = organicRemedies.length > 0 ? organicRemedies : ['No organic remedies added.'];
    const chemical = chemicalRemedies.length > 0 ? chemicalRemedies : ['No chemical remedies added.'];

    try {
      const res = await fetch(`${API_BASE_URL}/api/scan-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reportId,
          date: dateStr,
          crop,
          disease: disease.trim(),
          severity,
          organicRemedies: organic,
          chemicalRemedies: chemical
        })
      });

      // SQLite disease_history persistence log
      try {
        await fetch(`${API_BASE_URL}/api/history/disease`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: imagePreview || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + disease.trim(),
            diseaseName: `${crop} - ${disease.trim()}`,
            confidence: severity === 'High' ? 0.94 : severity === 'Medium' ? 0.78 : 0.45,
            treatment: {
              organicRemedies: organic,
              chemicalRemedies: chemical
            }
          })
        });
      } catch (err) {
        console.warn("Could not save report to disease history SQLite table.");
      }

      if (res.ok) {
        fetchScans(); // Refresh log from database
        setShowReportBuilder(false);
        setDisease('');
        setOrganicRemedies([]);
        setChemicalRemedies([]);
        setLeafCondition('');
        setTips([]);
        setImagePreview(null);
      }
    } catch (err) {
      console.error("Could not persist manual log to server database.");
    }
  };

  const handleTranslateReport = async (targetLangCode: string, apiLangName: string) => {
    if (activeReportLang === targetLangCode || !disease) return;
    try {
      const prevDisease = disease;
      setDisease(language === 'hi' ? 'अनुवाद हो रहा है...' : 'Translating...');
      
      const res = await fetch(`${API_BASE_URL}/api/translate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop,
          disease: prevDisease,
          organicRemedies,
          chemicalRemedies,
          leafCondition,
          tips,
          target_lang: apiLangName
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setCrop(data.crop || crop);
        setDisease(data.disease || prevDisease);
        setOrganicRemedies(data.organicRemedies || organicRemedies);
        setChemicalRemedies(data.chemicalRemedies || chemicalRemedies);
        setLeafCondition(data.leafCondition || leafCondition);
        setTips(data.tips || tips);
        setActiveReportLang(targetLangCode as Language);
      } else {
        setDisease(prevDisease);
      }
    } catch (err) {
      console.error("Translation failed:", err);
    }
  };

  return (
    <div className="fade-in diagnostics-layout">
      {/* Upload Zone Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{t.scannerTitle}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {t.scannerSubtitle}
          </p>

          {isCropping && rawImage ? (
            <div 
              ref={containerRef}
              onMouseMove={handleCropMouseMove}
              onTouchMove={handleCropTouchMove}
              onMouseUp={handleCropMouseUp}
              onTouchEnd={handleCropMouseUp}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1/1',
                maxHeight: '380px',
                background: '#0a0d12',
                borderRadius: '16px',
                overflow: 'hidden',
                userSelect: 'none',
                touchAction: 'none',
                border: '1px solid var(--border-color)'
              }}
            >
              <img 
                src={rawImage} 
                style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} 
                alt="Raw crop"
              />
              
              {/* Crop box overlay */}
              <div style={{
                position: 'absolute',
                left: `${cropBox.x}%`,
                top: `${cropBox.y}%`,
                width: `${cropBox.w}%`,
                height: `${cropBox.h}%`,
                border: '2px solid var(--primary)',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                cursor: 'move',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseDown={(e) => handleCropMouseDown(e, 'move')}
              onTouchStart={(e) => handleCropTouchStart(e, 'move')}
              >
                {/* Drag handle corner */}
                <div style={{
                  position: 'absolute',
                  right: '-6px',
                  bottom: '-6px',
                  width: '16px',
                  height: '16px',
                  background: 'var(--primary)',
                  borderRadius: '50%',
                  cursor: 'se-resize',
                  border: '2px solid #fff'
                }}
                onMouseDown={(e) => handleCropMouseDown(e, 'se')}
                onTouchStart={(e) => handleCropTouchStart(e, 'se')}
                />
                
                {/* Corner guide overlay */}
                <div style={{
                  position: 'absolute',
                  left: '-6px',
                  top: '-6px',
                  width: '16px',
                  height: '16px',
                  background: 'var(--primary)',
                  borderRadius: '50%',
                  cursor: 'nw-resize',
                  border: '2px solid #fff'
                }}
                onMouseDown={(e) => handleCropMouseDown(e, 'nw')}
                onTouchStart={(e) => handleCropTouchStart(e, 'nw')}
                />
              </div>
            </div>
          ) : (
            <div 
              className={`scanner-zone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="file-input" 
                accept="image/*"
                onChange={handleFileChange}
              />

              {isScanning && <div className="scan-line"></div>}

              {imagePreview ? (
                <img src={imagePreview} className="leaf-preview" alt="User Leaf upload" />
              ) : (
                <div className="scan-instructions">
                  <div className="scan-icon-container">
                    <svg style={{ width: 48, height: 48 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <h4>{t.dragDrop}</h4>
                  <p>{t.browse}</p>
                </div>
              )}
            </div>
          )}

          {isScanning && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span>{scanStatus}</span>
                <span>{scanProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'var(--bg-surface-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${scanProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.1s ease' }}></div>
              </div>
            </div>
          )}

          {isCropping ? (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="primary-btn"
                onClick={handleConfirmCrop}
                style={{
                  flex: 2,
                  background: 'linear-gradient(135deg, var(--primary) 0%, #2ecc71 100%)',
                  color: '#000',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                ✂️ {language === 'hi' ? 'क्रॉप और स्कैन करें' : 'Crop & Scan'}
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={() => { setIsCropping(false); setRawImage(null); }}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="primary-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  startCamera();
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #2ecc71 100%)',
                  color: '#000',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(46, 204, 113, 0.2)'
                }}
              >
                📷 {language === 'hi' ? 'तस्वीर लें' : language === 'pb' ? 'ਫੋਟੋ ਲਓ' : 'Take Photo'}
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                📁 {language === 'hi' ? 'अपलोड करें' : language === 'pb' ? 'ਅਪਲੋਡ ਕਰੋ' : 'Upload Photo'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Output / Form Builder Column */}
      <div className="glass-card">
        {showReportBuilder ? (
          <div className="report-card" style={{ gap: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🩺</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {language === 'hi' ? 'एआई जांच रिपोर्ट (AI Scan Report)' : 'AI Diagnostic Findings'}
                  </h3>
                </div>
                
                {/* Translate Report Pill Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '1rem' }}>🌐</span>
                    <span>{language === 'hi' ? 'अनुवाद करें (Translate):' : 'Translate:'}</span>
                  </span>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {[
                      { code: 'en', label: 'English', apiName: 'English' },
                      { code: 'hi', label: 'हिन्दी', apiName: 'Hindi' },
                      { code: 'pb', label: 'ਪੰਜਾਬੀ', apiName: 'Punjabi' },
                      { code: 'mr', label: 'मराठी', apiName: 'Marathi' },
                      { code: 'bn', label: 'বাংলা', apiName: 'Bengali' }
                    ].map((langObj) => {
                      const isActive = activeReportLang === langObj.code;
                      return (
                        <button
                          key={langObj.code}
                          type="button"
                          onClick={() => handleTranslateReport(langObj.code, langObj.apiName)}
                          style={{
                            background: isActive ? 'rgba(46, 204, 113, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                            color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                            borderRadius: '20px',
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: isActive ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: isActive ? '0 0 10px rgba(46, 204, 113, 0.15)' : 'none',
                            outline: 'none'
                          }}
                        >
                          {langObj.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                {language === 'hi' ? 'पत्ती की तस्वीर के आधार पर एआई द्वारा तैयार की गई रिपोर्ट।' : 'Automated agronomist report generated based on your leaf scan.'}
              </p>
            </div>

            {/* Crop Health Score Circular Progress Ring banner */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              boxShadow: 'inset 0 0 10px rgba(255,255,255,0.01)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  {language === 'hi' ? 'फसल स्वास्थ्य स्कोर (Crop Health Score)' : 'Crop Health Score'}
                </span>
                <h4 style={{ margin: '0.25rem 0 0 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {severity === 'High' 
                    ? (language === 'hi' ? '20% (गंभीर स्थिति / Critical)' : '20% (Critical)')
                    : severity === 'Medium'
                    ? (language === 'hi' ? '65% (मध्यम संक्रमण / Moderate)' : '65% (Moderate)')
                    : (language === 'hi' ? '98% (उत्कृष्ट स्वास्थ्य / Excellent)' : '98% (Excellent)')}
                </h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  {severity === 'High'
                    ? (language === 'hi' ? 'आपकी फसल का स्वास्थ्य गंभीर है, तत्काल दवा छिड़कें।' : 'Your crop is in critical health. Apply remedies immediately.')
                    : severity === 'Medium'
                    ? (language === 'hi' ? 'फसल में आंशिक संक्रमण है, निवारक दवाएं इस्तेमाल करें।' : 'Crop has minor infection. Apply preventive medicines.')
                    : (language === 'hi' ? 'फसल बिल्कुल सुरक्षित और स्वस्थ है!' : 'Your crop is 100% healthy and safe!')}
                </p>
              </div>

              {/* Graphical Circular Progress Indicator */}
              <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
                <svg width="56" height="56" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={severity === 'High' ? '#ef4444' : severity === 'Medium' ? '#f59e0b' : '#2ecc71'}
                    strokeWidth="3.5"
                    strokeDasharray={`${severity === 'High' ? 20 : severity === 'Medium' ? 65 : 98}, 100`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)'
                }}>
                  {severity === 'High' ? '20%' : severity === 'Medium' ? '65%' : '98%'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.cropAnalyzed}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{crop}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.diagFinding}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{disease}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.severityLevel}</span>
                <span style={{ 
                  fontWeight: 700, 
                  fontSize: '0.9rem',
                  color: severity === 'High' ? '#ef4444' : severity === 'Medium' ? '#f59e0b' : '#10b981'
                }}>
                  {severity === 'High' ? t.highSeverity : severity === 'Medium' ? t.mediumSeverity : t.healthy}
                </span>
              </div>

              {leafCondition && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1rem',
                }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {language === 'hi' ? 'पत्ती की स्थिति (Leaf Condition)' : 'Leaf Symptoms'}
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {leafCondition}
                  </p>
                </div>
              )}

              {organicRemedies && organicRemedies.length > 0 && (
                <div className="remedy-box organic" style={{ borderRadius: '12px', padding: '1rem', border: '1px solid rgba(46, 204, 113, 0.15)', background: 'rgba(46, 204, 113, 0.02)' }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#2ecc71', fontWeight: 600 }}>🍃 {t.organicRemedies}</h5>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {organicRemedies.map((rem, i) => (
                      <li key={i}>{rem}</li>
                    ))}
                  </ul>
                </div>
              )}

              {chemicalRemedies && chemicalRemedies.length > 0 && (
                <div className="remedy-box chemical" style={{ borderRadius: '12px', padding: '1rem', border: '1px solid rgba(239, 68, 68, 0.15)', background: 'rgba(239, 68, 68, 0.02)' }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#f87171', fontWeight: 600 }}>🧪 {t.chemicalRemedies}</h5>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {chemicalRemedies.map((rem, i) => (
                      <li key={i}>{rem}</li>
                    ))}
                  </ul>
                </div>
              )}

              {tips && tips.length > 0 && (
                <div style={{
                  background: 'rgba(52, 152, 219, 0.02)',
                  border: '1px solid rgba(52, 152, 219, 0.15)',
                  borderRadius: '12px',
                  padding: '1rem',
                }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#3498db', fontWeight: 600 }}>💡 {language === 'hi' ? 'कृषि विज्ञानिक टिप्स (Agronomist Tips)' : 'Expert Tips'}</h5>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                className="primary-btn" 
                onClick={() => handleSaveReport()}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, var(--primary) 0%, #2ecc71 100%)',
                  color: '#000',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                💾 {language === 'hi' ? 'इतिहास में सहेजें' : 'Save to History'}
              </button>
              
              <button 
                type="button" 
                className="primary-btn" 
                onClick={() => {
                  setShowReportBuilder(false);
                  setImagePreview(null);
                  setDisease('');
                  setOrganicRemedies([]);
                  setChemicalRemedies([]);
                  setLeafCondition('');
                  setTips([]);
                  setActiveReportLang(language);
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                🔄 {language === 'hi' ? 'नया स्कैन' : 'Scan New'}
              </button>
            </div>
          </div>
        ) : selectedReport ? (
          <div className="report-card" style={{ gap: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{t.diagReportTitle}</h3>
            
            {/* Crop Health Score Circular Progress Ring banner */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              boxShadow: 'inset 0 0 10px rgba(255,255,255,0.01)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  {language === 'hi' ? 'फसल स्वास्थ्य स्कोर (Crop Health Score)' : 'Crop Health Score'}
                </span>
                <h4 style={{ margin: '0.25rem 0 0 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedReport.severity === 'High' 
                    ? (language === 'hi' ? '20% (गंभीर स्थिति / Critical)' : '20% (Critical)')
                    : selectedReport.severity === 'Medium'
                    ? (language === 'hi' ? '65% (मध्यम संक्रमण / Moderate)' : '65% (Moderate)')
                    : (language === 'hi' ? '98% (उत्कृष्ट स्वास्थ्य / Excellent)' : '98% (Excellent)')}
                </h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  {selectedReport.severity === 'High'
                    ? (language === 'hi' ? 'आपकी फसल का स्वास्थ्य गंभीर है, तत्काल दवा छिड़कें।' : 'Your crop is in critical health. Apply remedies immediately.')
                    : selectedReport.severity === 'Medium'
                    ? (language === 'hi' ? 'फसल में आंशिक संक्रमण है, निवारक दवाएं इस्तेमाल करें।' : 'Crop has minor infection. Apply preventive medicines.')
                    : (language === 'hi' ? 'फसल बिल्कुल सुरक्षित और स्वस्थ है!' : 'Your crop is 100% healthy and safe!')}
                </p>
              </div>

              {/* Graphical Circular Progress Indicator */}
              <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
                <svg width="56" height="56" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={selectedReport.severity === 'High' ? '#ef4444' : selectedReport.severity === 'Medium' ? '#f59e0b' : '#2ecc71'}
                    strokeWidth="3.5"
                    strokeDasharray={`${selectedReport.severity === 'High' ? 20 : selectedReport.severity === 'Medium' ? 65 : 98}, 100`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)'
                }}>
                  {selectedReport.severity === 'High' ? '20%' : selectedReport.severity === 'Medium' ? '65%' : '98%'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.cropAnalyzed}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedReport.crop}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.diagFinding}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedReport.disease}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.severityLevel}</span>
                <span style={{ 
                  fontWeight: 700, 
                  color: selectedReport.severity === 'High' ? '#ef4444' : selectedReport.severity === 'Medium' ? '#f59e0b' : '#10b981'
                }}>
                  {selectedReport.severity === 'High' ? t.highSeverity : selectedReport.severity === 'Medium' ? t.mediumSeverity : t.healthy}
                </span>
              </div>

              {(selectedReport as any).leafCondition && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1rem',
                }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {language === 'hi' ? 'पत्ती की स्थिति (Leaf Condition)' : 'Leaf Symptoms'}
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {(selectedReport as any).leafCondition}
                  </p>
                </div>
              )}

              {selectedReport.organicRemedies && selectedReport.organicRemedies.length > 0 && (
                <div className="remedy-box organic" style={{ borderRadius: '12px', padding: '1rem', border: '1px solid rgba(46, 204, 113, 0.15)', background: 'rgba(46, 204, 113, 0.02)' }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#2ecc71', fontWeight: 600 }}>🍃 {t.organicRemedies}</h5>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {selectedReport.organicRemedies.map((rem, i) => (
                      <li key={i}>{rem}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedReport.chemicalRemedies && selectedReport.chemicalRemedies.length > 0 && (
                <div className="remedy-box chemical" style={{ borderRadius: '12px', padding: '1rem', border: '1px solid rgba(239, 68, 68, 0.15)', background: 'rgba(239, 68, 68, 0.02)' }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#f87171', fontWeight: 600 }}>🧪 {t.chemicalRemedies}</h5>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {selectedReport.chemicalRemedies.map((rem, i) => (
                      <li key={i}>{rem}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(selectedReport as any).tips && (selectedReport as any).tips.length > 0 && (
                <div style={{
                  background: 'rgba(52, 152, 219, 0.02)',
                  border: '1px solid rgba(52, 152, 219, 0.15)',
                  borderRadius: '12px',
                  padding: '1rem',
                }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#3498db', fontWeight: 600 }}>💡 {language === 'hi' ? 'कृषि विज्ञानिक टिप्स (Agronomist Tips)' : 'Expert Tips'}</h5>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {(selectedReport as any).tips.map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button 
              className="primary-btn" 
              style={{ marginTop: 'auto', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              onClick={() => { setSelectedReport(null); setImagePreview(null); }}
            >
              {t.clearView}
            </button>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            <svg style={{ width: 64, height: 64, stroke: 'var(--border-color)', marginBottom: '1rem', fill: 'none' }} viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="1.5"/>
              <circle cx="12" cy="11" r="3" strokeWidth="1.5"/>
            </svg>
            <h4>{t.awaitingTitle}</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{t.awaitingDesc}</p>
          </div>
        )}
      </div>

      {/* Live Camera Modal Overlay */}
      {isCameraActive && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(6, 9, 12, 0.9)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-glow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            borderRadius: '24px'
          }}>
            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {language === 'hi' ? 'पत्ती की तस्वीर लें' : 'Align Crop Leaf'}
            </h4>
            <div style={{
              width: '100%',
              aspectRatio: '4/3',
              background: '#000',
              borderRadius: '16px',
              overflow: 'hidden',
              position: 'relative',
              border: '2px solid var(--primary)'
            }}>
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: '20px',
                border: '2px dashed rgba(255,255,255,0.4)',
                borderRadius: '12px',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textAlign: 'center', background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '20px' }}>
                  {language === 'hi' ? 'पत्ती को फ्रेम में रखें' : 'Position Leaf inside Frame'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className="primary-btn"
                onClick={capturePhoto}
                style={{
                  flex: 2,
                  background: 'linear-gradient(135deg, var(--primary) 0%, #2ecc71 100%)',
                  color: '#000',
                  border: 'none',
                  padding: '0.8rem',
                  borderRadius: '30px',
                  fontWeight: 750,
                  cursor: 'pointer'
                }}
              >
                📸 {language === 'hi' ? 'तस्वीर खींचे' : 'Capture Leaf'}
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={stopCamera}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '0.8rem',
                  borderRadius: '30px',
                  cursor: 'pointer'
                }}
              >
                {language === 'hi' ? 'बंद करें' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
