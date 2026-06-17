'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export const useVideoRecorder = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [status, setStatus] = useState<'idle' | 'previewing' | 'recording' | 'paused' | 'stopped'>('idle');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSupported = typeof window !== 'undefined' && 
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) &&
    typeof MediaRecorder !== 'undefined';

  // Stop all active tracks on a stream
  const stopStreamTracks = useCallback((mediaStream: MediaStream | null) => {
    if (!mediaStream) return;
    mediaStream.getTracks().forEach((track) => {
      track.stop();
    });
  }, []);

  // Request permissions and start live camera preview
  const startPreview = useCallback(async (): Promise<MediaStream | null> => {
    if (!isSupported) {
      setError('Video recording is not supported in this browser.');
      return null;
    }

    try {
      setError(null);
      // Request both audio and video
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: true
      });

      setStream(mediaStream);
      setStatus('previewing');
      return mediaStream;
    } catch (err: any) {
      console.error('Error accessing camera/microphone:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera or microphone permission denied.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera or microphone found.');
      } else {
        setError(`Failed to access media devices: ${err.message || err}`);
      }
      setStatus('idle');
      return null;
    }
  }, [isSupported]);

  // Clean up preview/stream when component unmounts
  useEffect(() => {
    return () => {
      stopStreamTracks(stream);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [stream, stopStreamTracks]);

  // Start recording
  const startRecording = useCallback(async () => {
    let activeStream = stream;

    // If stream is not active, request permissions
    if (!activeStream || !activeStream.active) {
      activeStream = await startPreview();
    }

    if (!activeStream) {
      setError('Cannot record without camera/microphone access.');
      return;
    }

    try {
      setError(null);
      chunksRef.current = [];
      setRecordedBlob(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      // Check supported MIME types for video recording
      let options = { mimeType: 'video/webm;codecs=vp9,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=vp8,opus' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/mp4' }; // Fallback for Safari
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: '' }; // Fallback to browser default
      }

      const recorder = new MediaRecorder(activeStream, options);
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'video/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setStatus('stopped');
        setIsRecording(false);
        setIsPaused(false);
        
        // Stop camera stream tracks to turn off the camera light when recording ends
        stopStreamTracks(activeStream);
        setStream(null);
      };

      recorder.onerror = (e: any) => {
        console.error('MediaRecorder error:', e);
        setError('An error occurred during video recording.');
        setIsRecording(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // collect 1s chunks
      setIsRecording(true);
      setIsPaused(false);
      setStatus('recording');
      setRecordingTime(0);

      // Start timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setError(`Failed to start recording: ${err.message || err}`);
    }
  }, [stream, previewUrl, startPreview, stopStreamTracks]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;
    try {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setStatus('paused');
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } catch (e) {
      console.error('Failed to pause recording:', e);
    }
  }, []);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'paused') return;
    try {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setStatus('recording');
      
      // Resume timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (e) {
      console.error('Failed to resume recording:', e);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    try {
      mediaRecorderRef.current.stop();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } catch (e) {
      console.error('Failed to stop recording:', e);
    }
  }, []);

  // Clear current recording and return to live preview
  const resetRecorder = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Revoke object URLs to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    chunksRef.current = [];
    setRecordedBlob(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
    
    // Stop old tracks first
    stopStreamTracks(stream);
    setStream(null);
    
    // Start preview again
    startPreview();
  }, [previewUrl, stream, startPreview, stopStreamTracks]);

  // Completely clean up and turn off camera
  const releaseCamera = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    stopStreamTracks(stream);
    setStream(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    chunksRef.current = [];
    setRecordedBlob(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
    setStatus('idle');
  }, [stream, previewUrl, stopStreamTracks]);

  return {
    isSupported,
    stream,
    isRecording,
    isPaused,
    recordedBlob,
    previewUrl,
    recordingTime,
    status,
    error,
    startPreview,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecorder,
    releaseCamera
  };
};
