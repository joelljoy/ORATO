'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, CheckCircle, ChevronRight, Clock, Pause, Play, SkipForward, Send, 
  AlertCircle, Loader2, Video, VideoOff, Keyboard, Volume2, RotateCcw, Camera 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getInterview, updateInterview, saveVideoResponse } from '@/lib/firebase/firestore';
import { uploadVideoResponse } from '@/lib/firebase/storage';
import { Interview, Question, Answer, AnswerFeedback } from '@/types/interview';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import toast from 'react-hot-toast';

type SessionPhase = 'loading' | 'generating' | 'active' | 'feedback' | 'completed';
type AnswerMode = 'type' | 'voice' | 'video';

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [phase, setPhase] = useState<SessionPhase>('loading');
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [currentFeedback, setCurrentFeedback] = useState<AnswerFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Answer mode state
  const [answerMode, setAnswerMode] = useState<AnswerMode>('type');

  // Speaking duration tracker for Speech-to-Text
  const [voiceDuration, setVoiceDuration] = useState(0);

  // References and Hooks
  const lastTranscriptLengthRef = useRef(0);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Speech to Text hook
  const {
    isSupported: isMicSupported,
    isListening: isMicListening,
    isPaused: isMicPaused,
    interimTranscript: micInterimTranscript,
    error: micError,
    startListening: startMicListening,
    pauseListening: pauseMicListening,
    resumeListening: resumeMicListening,
    stopListening: stopMicListening,
    resetTranscript: resetMicTranscript,
  } = useSpeechToText({
    onTranscriptUpdate: (fullText) => {
      const delta = fullText.slice(lastTranscriptLengthRef.current);
      if (delta) {
        setCurrentAnswer((prev) => prev + delta);
        lastTranscriptLengthRef.current = fullText.length;
      }
    },
  });

  // Video Recorder hook
  const {
    isSupported: isCamSupported,
    stream: camStream,
    isRecording: isCamRecording,
    isPaused: isCamPaused,
    recordedBlob: camBlob,
    previewUrl: camPreviewUrl,
    recordingTime: camRecordingTime,
    status: camStatus,
    error: camError,
    startPreview: startCamPreview,
    startRecording: startCamRecording,
    pauseRecording: pauseCamRecording,
    resumeRecording: resumeCamRecording,
    stopRecording: stopCamRecording,
    resetRecorder: resetCamRecorder,
    releaseCamera: releaseCamCamera,
  } = useVideoRecorder();

  // Set camera preview stream to <video> element
  useEffect(() => {
    if (videoPreviewRef.current && camStream) {
      videoPreviewRef.current.srcObject = camStream;
    }
  }, [camStream]);

  // Track voice speaking duration
  useEffect(() => {
    let interval: any = null;
    if (isMicListening && !isMicPaused) {
      interval = setInterval(() => {
        setVoiceDuration((d) => d + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMicListening, isMicPaused]);

  // Handle switching answer modes and turning off camera/mic
  const handleModeChange = (mode: AnswerMode) => {
    // Stop any active speech recognition
    stopMicListening();
    resetMicTranscript();
    lastTranscriptLengthRef.current = 0;
    
    // Stop any active camera streams
    releaseCamCamera();

    setAnswerMode(mode);

    if (mode === 'video') {
      // Auto initiate preview
      startCamPreview();
    }
  };

  // Load interview and generate questions
  useEffect(() => {
    if (!interviewId || !user) return;

    const init = async () => {
      try {
        const iv = await getInterview(interviewId);
        if (!iv) { toast.error('Interview not found'); router.push('/interview'); return; }
        setInterview(iv);
        setPhase('generating');

        // Get resume context from sessionStorage
        const resumeData = sessionStorage.getItem(`interview_resume_${interviewId}`);
        const resumeContext = resumeData ? JSON.parse(resumeData) : null;
        const resumeText = resumeContext
          ? `Skills: ${resumeContext.skills?.join(', ')}\n${resumeContext.summary || ''}`
          : undefined;

        // Generate questions
        const res = await fetch('/api/interview/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: iv.role, type: iv.type, difficulty: iv.difficulty,
            resumeText, count: 8,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const generated: Question[] = data.questions;
        setQuestions(generated);

        await updateInterview(interviewId, {
          questions: generated,
          status: 'active',
          startedAt: new Date().toISOString(),
        });

        setPhase('active');
        setTimeLeft(120);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to start interview';
        toast.error(message);
        router.push('/interview');
      }
    };

    init();
  }, [interviewId, user, router]);

  // Timer
  useEffect(() => {
    if (phase !== 'active' || isPaused) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, isPaused]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const submitAnswer = async (skipAnswer = false) => {
    if (!interview || !questions[currentIndex]) return;
    const text = skipAnswer ? '[Skipped]' : currentAnswer.trim();
    if (!skipAnswer && text.length < 10) { toast.error('Please write a more detailed answer'); return; }

    setSubmitting(true);
    setEvaluating(true);

    // Stop and clean up any ongoing recording or microphone
    stopMicListening();
    if (isCamRecording) {
      stopCamRecording();
    }

    try {
      let finalVideoUrl: string | undefined = undefined;
      let finalSpeakingDuration = 0;

      // Handle video upload if in video mode and blob was recorded
      if (answerMode === 'video' && camBlob && !skipAnswer) {
        toast.loading('Uploading video response...', { id: 'videoUpload' });
        try {
          // 1. Upload to Firebase Storage
          finalVideoUrl = await uploadVideoResponse(
            user!.uid,
            interviewId,
            questions[currentIndex].id,
            camBlob
          );

          // 2. Save video responses metadata in Firestore collection
          await saveVideoResponse({
            interviewId,
            userId: user!.uid,
            questionId: questions[currentIndex].id,
            videoUrl: finalVideoUrl,
            timestamp: new Date().toISOString(),
            duration: camRecordingTime,
          });

          finalSpeakingDuration = camRecordingTime;
          toast.success('Video uploaded successfully!', { id: 'videoUpload' });
        } catch (uploadErr: any) {
          console.error('Video upload failed:', uploadErr);
          toast.error('Failed to upload video response. Proceeding with text evaluation.', { id: 'videoUpload' });
        }
      } else if (answerMode === 'voice') {
        finalSpeakingDuration = voiceDuration;
      }

      let feedback: AnswerFeedback | null = null;

      if (!skipAnswer) {
        const evalRes = await fetch('/api/interview/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: questions[currentIndex].text,
            answer: text,
            role: interview.role,
            difficulty: interview.difficulty,
          }),
        });
        const evalData = await evalRes.json();
        if (!evalRes.ok) {
          throw new Error(evalData.error || 'Evaluation failed');
        }
        feedback = evalData.feedback;
      }

      const answer: Answer = {
        questionId: questions[currentIndex].id,
        text,
        submittedAt: new Date().toISOString(),
        score: feedback?.score,
        feedback: feedback || undefined,
        isEvaluated: !!feedback,
        videoUrl: finalVideoUrl,
        speakingDuration: finalSpeakingDuration > 0 ? finalSpeakingDuration : undefined,
      };

      const newAnswers = [...answers, answer];
      setAnswers(newAnswers);
      setCurrentFeedback(feedback);

      if (!skipAnswer && feedback) {
        setPhase('feedback');
      } else {
        await nextQuestion(newAnswers);
      }
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : 'Evaluation failed';
      toast.error(`${errMsg}. Moving to next question.`);
      await nextQuestion([
        ...answers, 
        { 
          questionId: questions[currentIndex].id, 
          text, 
          submittedAt: new Date().toISOString(), 
          isEvaluated: false 
        }
      ]);
    } finally {
      setSubmitting(false);
      setEvaluating(false);
      
      // Release camera/mic stream
      releaseCamCamera();
      resetMicTranscript();
      setVoiceDuration(0);
      lastTranscriptLengthRef.current = 0;
    }
  };

  const nextQuestion = async (currentAnswers: Answer[]) => {
    const next = currentIndex + 1;
    if (next >= questions.length) {
      await finishInterview(currentAnswers);
    } else {
      setCurrentIndex(next);
      setCurrentAnswer('');
      setCurrentFeedback(null);
      setTimeLeft(120);
      setPhase('active');
      
      // Re-initialize correct mode stream
      if (answerMode === 'video') {
        startCamPreview();
      }
    }
  };

  const finishInterview = async (finalAnswers: Answer[]) => {
    if (!interview) return;
    setPhase('completed');

    const scored = finalAnswers.filter(a => a.score !== undefined);
    const overallScore = scored.length > 0
      ? Math.round(scored.reduce((s, a) => s + (a.score || 0), 0) / scored.length)
      : 50;

    try {
      // 1. Mark interview as completed in Firestore
      await updateInterview(interviewId, {
        answers: finalAnswers,
        overallScore,
        status: 'completed',
        completedAt: new Date().toISOString(),
      });

      // 2. Call the report generation API route to create and save the full Gemini report
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          userId: user!.uid,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (error: any) {
      console.error('Failed to complete interview / generate report:', error);
      toast.error(`Error finalizing session: ${error.message || 'Failed to generate report'}`);
    }
  };

  // Synchronize recording & background speech-to-text
  const handleStartCamRecording = async () => {
    await startCamRecording();
    if (isMicSupported) {
      resetMicTranscript();
      lastTranscriptLengthRef.current = 0;
      startMicListening();
    }
  };

  const handlePauseCamRecording = () => {
    pauseCamRecording();
    pauseMicListening();
  };

  const handleResumeCamRecording = () => {
    resumeCamRecording();
    resumeMicListening();
  };

  const handleStopCamRecording = () => {
    stopCamRecording();
    stopMicListening();
  };

  const handleResetCamRecorder = () => {
    resetCamRecorder();
    stopMicListening();
    resetMicTranscript();
    lastTranscriptLengthRef.current = 0;
    setCurrentAnswer('');
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;
  const timerColor = timeLeft < 30 ? 'var(--orato-error)' : timeLeft < 60 ? 'var(--orato-warning)' : 'var(--orato-success)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--orato-bg)', padding: '1.5rem' }}>
      {/* Loading / Generating */}
      {(phase === 'loading' || phase === 'generating') && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1.5rem' }}>
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--orato-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={36} color="#fff" />
            </div>
          </motion.div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>{phase === 'loading' ? 'Loading interview...' : 'Generating questions with AI...'}</h2>
            <p style={{ color: 'var(--orato-text-secondary)' }}>Personalizing your interview experience</p>
          </div>
          <Loader2 size={24} color="var(--orato-accent)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Completed */}
      {phase === 'completed' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1.5rem' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(134,197,163,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={40} color="var(--orato-success)" />
            </div>
          </motion.div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Interview Complete! 🎉</h2>
            <p style={{ color: 'var(--orato-text-secondary)', marginBottom: '1.5rem' }}>Your performance report is being generated.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button onClick={() => router.push(`/reports/${interviewId}`)}>View Report</Button>
              <Button variant="secondary" onClick={() => router.push('/interview')}>New Interview</Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Interview */}
      {(phase === 'active' || phase === 'feedback') && currentQuestion && (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--orato-text-primary)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--orato-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mic size={14} color="#fff" />
                </div>
                ORATO
              </div>
              <Badge variant="accent">{interview?.role}</Badge>
              <Badge variant="warning">{interview?.difficulty}</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, color: timerColor }}>
                <Clock size={16} />
                {formatTime(timeLeft)}
              </div>
              <button
                onClick={() => setIsPaused(p => !p)}
                style={{ background: 'var(--orato-surface)', border: '1px solid var(--orato-border)', borderRadius: 'var(--radius-md)', padding: '0.4rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--orato-text-secondary)', fontFamily: 'var(--font-sans)', fontWeight: 500 }}
              >
                {isPaused ? <><Play size={14} /> Resume</> : <><Pause size={14} /> Pause</>}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--orato-text-secondary)', marginBottom: '0.5rem' }}>
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div style={{ height: 6, background: 'var(--orato-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ height: '100%', background: 'var(--orato-highlight)', borderRadius: 'var(--radius-full)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* AI Interviewer Panel */}
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <motion.div
                animate={phase === 'active' ? { scale: [1, 1.04, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--orato-highlight), var(--orato-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}
              >
                <Mic size={28} color="#fff" />
              </motion.div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--orato-text-primary)' }}>ORATO AI</div>
              <div className="badge badge-success" style={{ fontSize: '0.7rem' }}>● Interviewing</div>

              <hr className="divider" style={{ margin: '1rem 0' }} />

              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--orato-text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Progress
                </div>
                {questions.map((_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: i < currentIndex ? 'var(--orato-success)' : i === currentIndex ? 'var(--orato-highlight)' : 'var(--orato-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      fontSize: '0.65rem', color: '#fff', fontWeight: 700,
                    }}>
                      {i < currentIndex ? '✓' : i + 1}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: i === currentIndex ? 'var(--orato-text-primary)' : 'var(--orato-text-secondary)', fontWeight: i === currentIndex ? 600 : 400 }}>
                      Q{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Question Card */}
                  <div className="card" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <Badge variant="accent">{currentQuestion.type}</Badge>
                      <Badge variant="accent">{currentQuestion.category}</Badge>
                    </div>
                    <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--orato-text-primary)', fontWeight: 500 }}>
                      {currentQuestion.text}
                    </p>
                  </div>

                  {/* Feedback (after answering) */}
                  {phase === 'feedback' && currentFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      className="card"
                      style={{ marginBottom: '1rem', border: '1px solid var(--orato-success)', background: 'rgba(134,197,163,0.06)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.95rem' }}>Instant Feedback</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--orato-text-secondary)' }}>Score:</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: currentFeedback.score >= 70 ? 'var(--orato-success)' : 'var(--orato-warning)' }}>{currentFeedback.score}/100</span>
                        </div>
                      </div>
                      {currentFeedback.strengths.length > 0 && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--orato-success)', marginBottom: '0.375rem' }}>✓ Strengths</div>
                          {currentFeedback.strengths.map((s, i) => <p key={i} style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>• {s}</p>)}
                        </div>
                      )}
                      {currentFeedback.suggestions.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--orato-warning)', marginBottom: '0.375rem' }}>→ Improve</div>
                          {currentFeedback.suggestions.map((s, i) => <p key={i} style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>• {s}</p>)}
                        </div>
                      )}
                      <Button
                        style={{ marginTop: '1rem' }}
                        onClick={() => nextQuestion(answers)}
                        iconRight={<ChevronRight size={16} />}
                      >
                        {currentIndex + 1 >= questions.length ? 'Finish Interview' : 'Next Question'}
                      </Button>
                    </motion.div>
                  )}

                  {/* Answer Panel Card */}
                  {phase === 'active' && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Tab Selectors */}
                      <div style={{ display: 'flex', borderBottom: '1px solid var(--orato-border)', paddingBottom: '0.75rem', gap: '0.5rem' }}>
                        {[
                          { id: 'type', label: 'Type Answer', icon: Keyboard },
                          { id: 'voice', label: 'Speech-to-Text', icon: Mic },
                          { id: 'video', label: 'Video Response', icon: Video }
                        ].map(mode => (
                          <button
                            key={mode.id}
                            disabled={isCamRecording || isMicListening}
                            onClick={() => handleModeChange(mode.id as AnswerMode)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 1rem',
                              border: 'none',
                              borderRadius: 'var(--radius-md)',
                              background: answerMode === mode.id ? 'var(--orato-surface-secondary)' : 'transparent',
                              color: answerMode === mode.id ? 'var(--orato-highlight)' : 'var(--orato-text-secondary)',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              cursor: (isCamRecording || isMicListening) ? 'not-allowed' : 'pointer',
                              opacity: (isCamRecording || isMicListening) && answerMode !== mode.id ? 0.4 : 1,
                              transition: 'all var(--transition-fast)'
                            }}
                          >
                            <mode.icon size={15} />
                            {mode.label}
                          </button>
                        ))}
                      </div>

                      {/* Video Recorder Component */}
                      {answerMode === 'video' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', background: 'var(--orato-bg)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--orato-border)' }}>
                          <div style={{ position: 'relative', width: '100%', aspectRatio: '1.333', background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {camStatus === 'stopped' && camPreviewUrl ? (
                              <video
                                src={camPreviewUrl}
                                controls
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            ) : camStream ? (
                              <video
                                ref={videoPreviewRef}
                                autoPlay
                                playsInline
                                muted
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                              />
                            ) : (
                              <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <VideoOff size={40} color="var(--orato-text-secondary)" style={{ opacity: 0.4, margin: '0 auto 0.5rem' }} />
                                <p style={{ fontSize: '0.85rem', color: 'var(--orato-text-secondary)' }}>Camera is not active.</p>
                                <Button size="sm" style={{ marginTop: '0.75rem' }} onClick={startCamPreview} icon={<Camera size={14} />}>
                                  Enable Camera
                                </Button>
                              </div>
                            )}

                            {/* Overlays */}
                            {isCamRecording && (
                              <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: isCamPaused ? 'var(--orato-warning)' : 'var(--orato-error)', display: 'inline-block', animation: isCamPaused ? 'none' : 'pulse-ring 1s infinite' }} />
                                <span>{isCamPaused ? 'PAUSED' : 'REC'}</span>
                                <span style={{ color: 'rgba(255,255,255,0.7)', marginLeft: '0.25rem' }}>{formatTime(camRecordingTime)}</span>
                              </div>
                            )}
                          </div>

                          {/* Recording Errors */}
                          {camError && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(215, 122, 122, 0.12)', color: 'var(--orato-error)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', border: '1px solid rgba(215,122,122,0.2)' }}>
                              <AlertCircle size={16} />
                              <span>{camError}</span>
                            </div>
                          )}

                          {/* Video Action Controls */}
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {camStatus === 'previewing' && (
                              <Button size="sm" onClick={handleStartCamRecording} icon={<Play size={14} />}>
                                Start Recording
                              </Button>
                            )}

                            {isCamRecording && (
                              <>
                                {isCamPaused ? (
                                  <Button size="sm" variant="secondary" onClick={handleResumeCamRecording} icon={<Play size={14} />}>
                                    Resume
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="secondary" onClick={handlePauseCamRecording} icon={<Pause size={14} />}>
                                    Pause
                                  </Button>
                                )}
                                <Button size="sm" variant="danger" onClick={handleStopCamRecording} icon={<VideoOff size={14} />}>
                                  Stop Recording
                                </Button>
                              </>
                            )}

                            {camStatus === 'stopped' && (
                              <Button size="sm" variant="secondary" onClick={handleResetCamRecorder} icon={<RotateCcw size={14} />}>
                                Re-record Video
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Speech to Text Microphone controls */}
                      {answerMode === 'voice' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--orato-bg)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--orato-border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Mic size={18} color="var(--orato-highlight)" />
                              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Microphone Transcription</span>
                            </div>
                            {isMicListening && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--orato-text-secondary)', fontWeight: 600 }}>
                                <Volume2 size={13} style={{ animation: 'pulse-ring 1s infinite' }} />
                                <span>{isMicPaused ? 'Paused' : 'Listening...'} ({formatTime(voiceDuration)})</span>
                              </div>
                            )}
                          </div>

                          {/* Mic Errors */}
                          {micError && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(215, 122, 122, 0.12)', color: 'var(--orato-error)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', border: '1px solid rgba(215,122,122,0.2)' }}>
                              <AlertCircle size={16} />
                              <span>{micError}</span>
                            </div>
                          )}

                          {/* Speech Action buttons */}
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {!isMicListening && !isMicPaused && (
                              <Button size="sm" onClick={startMicListening} icon={<Mic size={14} />} disabled={!isMicSupported}>
                                {isMicSupported ? 'Start Listening' : 'Speech-to-Text Not Supported'}
                              </Button>
                            )}

                            {isMicListening && (
                              <>
                                <Button size="sm" variant="secondary" onClick={pauseMicListening} icon={<Pause size={14} />}>
                                  Pause Listening
                                </Button>
                                <Button size="sm" variant="danger" onClick={stopMicListening} icon={<Mic size={14} />}>
                                  Stop Listening
                                </Button>
                              </>
                            )}

                            {isMicPaused && (
                              <>
                                <Button size="sm" onClick={resumeMicListening} icon={<Mic size={14} />}>
                                  Resume Listening
                                </Button>
                                <Button size="sm" variant="danger" onClick={stopMicListening} icon={<Mic size={14} />}>
                                  Stop Listening
                                </Button>
                              </>
                            )}
                          </div>

                          {/* Real-time Interim speech preview */}
                          {micInterimTranscript && (
                            <p style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--orato-text-secondary)', padding: '0.5rem 0.75rem', background: 'var(--orato-surface)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--orato-border)' }}>
                              Speech input: &quot;{micInterimTranscript}&quot;
                            </p>
                          )}
                        </div>
                      )}

                      {/* Text Input area (Unified for editing and transcription) */}
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--orato-text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                          Your Transcript / Answer
                        </label>
                        <textarea
                          value={currentAnswer}
                          onChange={e => setCurrentAnswer(e.target.value)}
                          placeholder={
                            answerMode === 'video' 
                              ? 'Speak into the camera to generate your transcript, or type it directly here...'
                              : answerMode === 'voice'
                                ? 'Your spoken answer will be transcribed here in real time. You can edit it manually at any time.'
                                : 'Type your detailed answer here... Be specific, use examples, and explain your thinking process.'
                          }
                          rows={6}
                          style={{
                            width: '100%', padding: '0.875rem 1rem',
                            border: '1px solid var(--orato-border)',
                            borderRadius: 'var(--radius-md)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.9rem', lineHeight: 1.6,
                            color: 'var(--orato-text-primary)',
                            background: 'var(--orato-bg)',
                            resize: 'vertical',
                            outline: 'none',
                            transition: 'border-color var(--transition-fast)',
                            marginBottom: '0.75rem',
                          }}
                          onFocus={e => { e.target.style.borderColor = 'var(--orato-accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(180,139,175,0.12)'; }}
                          onBlur={e => { e.target.style.borderColor = 'var(--orato-border)'; e.target.style.boxShadow = 'none'; }}
                          disabled={isPaused}
                        />

                        {/* Speech indicator during Video Recording */}
                        {answerMode === 'video' && isCamRecording && micInterimTranscript && (
                          <div style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--orato-text-secondary)', marginBottom: '0.75rem', padding: '0.35rem 0.5rem', background: 'rgba(138,106,139,0.06)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Volume2 size={12} color="var(--orato-highlight)" />
                            <span>Transcribing: &quot;{micInterimTranscript}&quot;</span>
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => submitAnswer(true)}
                            disabled={submitting}
                            icon={<SkipForward size={15} />}
                          >
                            Skip
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => submitAnswer(false)}
                            loading={submitting}
                            icon={<Send size={15} />}
                            disabled={
                              (answerMode === 'video' && !camBlob && !currentAnswer.trim()) || 
                              currentAnswer.trim().length < 5 || 
                              isPaused ||
                              isCamRecording
                            }
                          >
                            Submit Answer
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
