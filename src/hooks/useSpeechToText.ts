'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseSpeechToTextOptions {
  onTranscriptUpdate?: (text: string) => void;
  lang?: string;
}

export const useSpeechToText = (options: UseSpeechToTextOptions = {}) => {
  const { onTranscriptUpdate, lang = 'en-US' } = options;
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isSupported = typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    rec.onresult = (event: any) => {
      let finalSpeech = '';
      let interimSpeech = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalSpeech += event.results[i][0].transcript + ' ';
        } else {
          interimSpeech += event.results[i][0].transcript;
        }
      }

      if (finalSpeech) {
        setTranscript((prev) => {
          const updated = prev + finalSpeech;
          if (onTranscriptUpdate) {
            onTranscriptUpdate(updated);
          }
          return updated;
        });
      }
      setInterimTranscript(interimSpeech);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Permission denied. Please allow microphone access.');
      } else if (event.error === 'no-speech') {
        // Safe to ignore or guide user, but don't disrupt
      } else if (event.error === 'audio-capture') {
        setError('No microphone detected. Please plug in a microphone.');
      } else if (event.error === 'network') {
        setError('Network error. Speech recognition requires an internet connection.');
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
      setIsPaused(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isSupported, lang, onTranscriptUpdate]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) return;

    try {
      setError(null);
      setIsPaused(false);
      recognitionRef.current.start();
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
      setError('Failed to start microphone listening.');
    }
  }, [isSupported, isListening]);

  const pauseListening = useCallback(() => {
    if (!isListening || !recognitionRef.current) return;
    try {
      setIsPaused(true);
      recognitionRef.current.stop(); // Stops recognition but retains what was transcribed
    } catch (e) {
      console.error('Failed to pause speech recognition:', e);
    }
  }, [isListening]);

  const resumeListening = useCallback(() => {
    if (isListening || !recognitionRef.current) return;
    try {
      setIsPaused(false);
      recognitionRef.current.start();
    } catch (e) {
      console.error('Failed to resume speech recognition:', e);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      setIsPaused(false);
      recognitionRef.current.stop();
      setInterimTranscript('');
    } catch (e) {
      console.error('Failed to stop speech recognition:', e);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    isPaused,
    transcript,
    interimTranscript,
    error,
    startListening,
    pauseListening,
    resumeListening,
    stopListening,
    resetTranscript,
  };
};
