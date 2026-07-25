import asyncio
import json
import base64
import os
import websockets
from fastapi import WebSocket, WebSocketDisconnect

class GeminiLiveSession:
    def __init__(self, client_ws: WebSocket, api_key: str, language: str = "hi"):
        self.client_ws = client_ws
        self.api_key = api_key
        self.language = language
        self.google_ws = None
        self.is_active = True

    async def start(self):
        # Generative Multimodal Live API WebSocket Endpoint (v1beta)
        gemini_url = f"wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key={self.api_key}"
        
        try:
            async with websockets.connect(gemini_url) as google_ws:
                self.google_ws = google_ws
                
                # Handshake Setup Payload
                setup_payload = {
                    "setup": {
                        "model": "models/gemini-2.0-flash-exp",
                        "generationConfig": {
                            "responseModalities": ["AUDIO"],
                            "speechConfig": {
                                "voiceConfig": {
                                    "prebuiltVoiceConfig": {
                                        "voiceName": "Aoede" # Warm prebuilt female voice
                                    }
                                }
                            }
                        },
                        "systemInstruction": {
                            "parts": [{
                                "text": (
                                    "You are KrishiMitra-Ai, a professional digital agronomist AI assistant for Indian farmers. "
                                    "Provide expert, friendly, and structured advice on crop protection, soil health, fertilizers (N-P-K ratios), "
                                    "plant disease treatments, weather-based planning, and watering recommendations. "
                                    "Speak Hindi, English, Marathi, Bengali, Punjabi, or Hinglish based on the user's preference. "
                                    "If the user speaks Hindi, reply in clear, polite, and sweet Hindi. "
                                    "IMPORTANT: Answer extremely concisely, in only 1-2 short sentences. Speak fast and respond instantly. "
                                    "Do NOT give long explanations to reduce voice audio output delay."
                                )
                            }]
                        }
                    }
                }
                
                # Send the initial session configuration
                await google_ws.send(json.dumps(setup_payload))
                print("Gemini Live Session Handshake Completed.", flush=True)

                # Run both proxy directions concurrently
                await asyncio.gather(
                    self.receive_from_client(),
                    self.receive_from_google()
                )
        except Exception as e:
            print(f"Gemini Live Proxy session error: {e}", flush=True)
            await self.close()

    async def receive_from_client(self):
        try:
            while self.is_active:
                # Read message from the React client WebSocket
                data = await self.client_ws.receive()
                
                # Forward binary mic bytes as PCM audio chunks
                if "bytes" in data:
                    pcm_data = data["bytes"]
                    b64_pcm = base64.b64encode(pcm_data).decode("utf-8")
                    
                    realtime_input = {
                        "realtimeInput": {
                            "mediaChunks": [{
                                "mimeType": "audio/pcm;rate=16000",
                                "data": b64_pcm
                            }]
                        }
                    }
                    if self.google_ws:
                        await self.google_ws.send(json.dumps(realtime_input))
                
                # Forward text or command signals
                elif "text" in data:
                    text_msg = data["text"]
                    msg_json = json.loads(text_msg)
                    
                    if msg_json.get("type") == "client_text":
                        client_content = {
                            "clientContent": {
                                "turns": [{
                                    "role": "user",
                                    "parts": [{"text": msg_json.get("text", "")}]
                                }],
                                "turnComplete": True
                            }
                        }
                        if self.google_ws:
                            await self.google_ws.send(json.dumps(client_content))
                    elif msg_json.get("type") == "force_response":
                        client_content = {
                            "clientContent": {
                                "turns": [],
                                "turnComplete": True
                            }
                        }
                        if self.google_ws:
                            await self.google_ws.send(json.dumps(client_content))
                    elif msg_json.get("type") == "interrupt":
                        # Handle client-side manual interruption if needed
                        pass
        except WebSocketDisconnect:
            print("Client WebSocket disconnected.", flush=True)
            await self.close()
        except Exception as e:
            print(f"Error in client listener proxy: {e}", flush=True)
            await self.close()

    async def receive_from_google(self):
        try:
            while self.is_active:
                if not self.google_ws:
                    await asyncio.sleep(0.1)
                    continue
                
                # Receive payload from Google Gemini Server
                google_message = await self.google_ws.recv()
                
                # Relay directly to the React client
                await self.client_ws.send_text(google_message)
        except Exception as e:
            print(f"Error in Google listener proxy: {e}", flush=True)
            await self.close()

    async def close(self):
        self.is_active = False
        if self.google_ws:
            try:
                await self.google_ws.close()
            except:
                pass
        try:
            await self.client_ws.close()
        except:
            pass
