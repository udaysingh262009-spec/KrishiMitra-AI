// Centralized API and WebSocket configuration driven by Vite environment variables
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

// WebSocket URL constructed dynamically from VITE_WS_BASE_URL or VITE_API_BASE_URL
export const getWebSocketUrl = (path: string): string => {
  const customWsUrl = import.meta.env.VITE_WS_BASE_URL;
  if (customWsUrl) {
    const baseUrl = customWsUrl.replace(/\/$/, '');
    return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  }
  
  // Infer WS protocol (ws:// or wss://) from current API_BASE_URL or window.location
  let wsProtocol = 'ws:';
  if (API_BASE_URL.startsWith('https:')) {
    wsProtocol = 'wss:';
  } else if (API_BASE_URL.startsWith('http:')) {
    wsProtocol = 'ws:';
  } else if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    wsProtocol = 'wss:';
  }
  
  const hostMatch = API_BASE_URL.replace(/^https?:\/\//, '');
  const cleanHost = hostMatch || (typeof window !== 'undefined' ? window.location.hostname + ':8000' : 'localhost:8000');
  
  return `${wsProtocol}//${cleanHost}${path.startsWith('/') ? path : '/' + path}`;
};
