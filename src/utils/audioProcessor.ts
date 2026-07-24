export class AudioStreamProcessor {
  private audioContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  
  // Audio playback scheduling state
  private activeSources: AudioBufferSourceNode[] = [];
  private nextPlayTime: number = 0;
  
  constructor() {}

  // Capture Microphone Input and manually downsample to 16kHz PCM
  public async startMicrophone(onAudioChunk: (chunk: ArrayBuffer) => void) {
    if (this.micStream) return;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Initialize AudioContext at native rate to prevent NotSupportedError crashes on Windows
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      const source = this.audioContext.createMediaStreamSource(this.micStream);
      
      // Buffer size: 4096 samples (approx 85ms chunks at 48kHz)
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const inputSampleRate = e.inputBuffer.sampleRate; // e.g. 48000 or 44100
        const targetSampleRate = 16000;
        
        // Decimation / Downsampling Ratio calculation
        const ratio = inputSampleRate / targetSampleRate;
        const targetLength = Math.round(inputData.length / ratio);
        
        // Convert to 16-bit signed Linear PCM resampled to 16000Hz
        const pcmBuffer = new Int16Array(targetLength);
        for (let i = 0; i < targetLength; i++) {
          const inputIndex = Math.round(i * ratio);
          if (inputIndex < inputData.length) {
            const s = Math.max(-1, Math.min(1, inputData[inputIndex]));
            pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
        }
        
        // Send resampled 16kHz PCM chunk
        onAudioChunk(pcmBuffer.buffer);
      };

      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (err) {
      console.error("Failed to start microphone audio capture:", err);
      throw err;
    }
  }

  // Stop recording microphone
  public stopMicrophone() {
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
  }

  // Play dynamic incoming 24kHz PCM chunks
  public playAudioChunk(base64Data: string) {
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Safely copy to an aligned Int16Array using DataView to avoid byte offset alignment crashes
    const pcm16 = new Int16Array(bytes.length / 2);
    const dataView = new DataView(bytes.buffer);
    for (let i = 0; i < pcm16.length; i++) {
      if (i * 2 + 1 < bytes.length) {
        pcm16[i] = dataView.getInt16(i * 2, true); // true for little-endian
      }
    }
    
    const sampleRate = 24000;
    const floatData = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      floatData[i] = pcm16[i] / 32768.0;
    }

    const audioBuffer = this.audioContext.createBuffer(1, floatData.length, sampleRate);
    audioBuffer.copyToChannel(floatData, 0);

    const currentTime = this.audioContext.currentTime;
    
    if (this.nextPlayTime < currentTime) {
      // Add a 150ms safety jitter buffer padding to guarantee smooth, crackle-free audio streaming
      this.nextPlayTime = currentTime + 0.15;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    
    this.activeSources.push(source);
    
    source.onended = () => {
      this.activeSources = this.activeSources.filter(s => s !== source);
    };

    source.start(this.nextPlayTime);
    this.nextPlayTime += audioBuffer.duration;
  }

  // Interrupt/Clear the playback queue immediately
  public interruptPlayback() {
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might not have started or already ended
      }
    });
    this.activeSources = [];
    this.nextPlayTime = 0;
  }

  // Close and clean up everything
  public destroy() {
    this.stopMicrophone();
    this.interruptPlayback();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
