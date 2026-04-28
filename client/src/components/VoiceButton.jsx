import { FiMic, FiMicOff } from 'react-icons/fi';
import useVoice from '../hooks/useVoice';

/**
 * VoiceButton
 * Mic button that captures speech via Web Speech API
 * Shows animated wave bars while listening
 */
export default function VoiceButton({ onResult, lang = 'en-IN', disabled }) {
  const { isListening, transcript, error, isSupported, startListening, stopListening } = useVoice(onResult);

  if (!isSupported) return null;

  return (
    <div className="relative">
      <button
        onClick={isListening ? stopListening : () => startListening(lang)}
        disabled={disabled}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        aria-pressed={isListening}
        className={`relative p-3 rounded-xl transition-all duration-200 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg scale-110'
            : 'bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
        title={isListening ? 'Click to stop' : 'Click to speak'}
      >
        {isListening ? (
          <div className="flex items-end gap-0.5 h-5" aria-hidden="true">
            {[12, 20, 28, 16, 24].map((h, i) => (
              <div key={i} className="voice-bar" style={{ height: `${h}px` }} />
            ))}
          </div>
        ) : (
          <FiMic className="text-lg" aria-hidden="true" />
        )}
      </button>

      {/* Live transcript preview */}
      {isListening && transcript && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 text-center animate-fade-in">
          {transcript}
        </div>
      )}

      {/* Error tooltip */}
      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-52 bg-red-600 text-white text-xs rounded-lg px-3 py-2 text-center animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
}
