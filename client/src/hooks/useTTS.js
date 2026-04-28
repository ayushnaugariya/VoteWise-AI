/**
 * useTTS — Web Speech API Text-to-Speech Hook
 * Feature 3: Talk-Back AI
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utterRef = useRef(null);

  useEffect(() => {
    setSupported('speechSynthesis' in window);
    return () => window.speechSynthesis?.cancel();
  }, []);

  const speak = useCallback((text, lang = 'en-IN') => {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();

    // Strip markdown and HTML for clean speech
    const clean = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/#+\s/g, '')
      .replace(/🗳️|🇮🇳|✅|❌|💡|→/g, '')
      .trim();

    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = lang;
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.volume = 1;

    // Pick best available voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (preferred) utter.voice = preferred;

    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);

    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [supported]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, supported };
}
