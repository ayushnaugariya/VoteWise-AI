/**
 * Web Speech API Hook
 * Browser-native voice input — no API key required
 * Supports multilingual speech recognition
 */
import { useState, useRef, useCallback } from 'react';

const useVoice = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const startListening = useCallback((lang = 'en-IN') => {
    if (!isSupported) {
      setError('Voice input is not supported in your browser. Please use Chrome.');
      return;
    }
    setError(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = lang;           // en-IN, hi-IN, ta-IN, te-IN, bn-IN
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const current = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setTranscript(current);
      if (event.results[event.results.length - 1].isFinal) {
        onResult?.(current);
        setTranscript('');
      }
    };

    recognition.onerror = (e) => {
      setError(e.error === 'not-allowed' ? 'Microphone access denied' : `Error: ${e.error}`);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  }, [isSupported, onResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, transcript, error, isSupported, startListening, stopListening };
};

export default useVoice;
