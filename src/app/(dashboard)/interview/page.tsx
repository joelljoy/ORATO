'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mic, Code, Brain, Globe, Server, Layers, Settings, ArrowRight,
  ChevronRight, FileText, Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserResumes, createInterview } from '@/lib/firebase/firestore';
import { Resume } from '@/types/resume';
import { InterviewType, Difficulty } from '@/types/interview';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

const INTERVIEW_TYPES: { type: InterviewType; label: string; icon: typeof Mic; desc: string; color: string }[] = [
  { type: 'hr', label: 'HR Interview', icon: Mic, desc: 'Behavioral, culture fit, situational', color: 'var(--orato-highlight)' },
  { type: 'technical', label: 'Technical', icon: Code, desc: 'DSA, algorithms, problem solving', color: 'var(--orato-success)' },
  { type: 'ai-ml', label: 'AI / ML', icon: Brain, desc: 'Machine learning, deep learning, MLOps', color: 'var(--orato-warning)' },
  { type: 'frontend', label: 'Frontend', icon: Globe, desc: 'React, JS, CSS, performance', color: '#7CB9E8' },
  { type: 'backend', label: 'Backend', icon: Server, desc: 'APIs, databases, scalability', color: 'var(--orato-accent)' },
  { type: 'fullstack', label: 'Full Stack', icon: Layers, desc: 'End-to-end engineering', color: 'var(--orato-highlight)' },
  { type: 'custom', label: 'Custom Role', icon: Settings, desc: 'Any role you specify', color: 'var(--orato-text-secondary)' },
];

const DIFFICULTIES: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Junior-level questions', color: 'var(--orato-success)' },
  { value: 'medium', label: 'Medium', desc: 'Mid-level questions', color: 'var(--orato-warning)' },
  { value: 'hard', label: 'Hard', desc: 'Senior-level questions', color: 'var(--orato-error)' },
  { value: 'adaptive', label: 'Adaptive', desc: 'AI adjusts difficulty', color: 'var(--orato-highlight)' },
];

export default function InterviewSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedType, setSelectedType] = useState<InterviewType>('technical');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserResumes(user.uid).then(data => {
      setResumes(data);
      if (data.length > 0) setSelectedResumeId(data[0].id);
    });
  }, [user]);

  const selectedTypeData = INTERVIEW_TYPES.find(t => t.type === selectedType)!;
  const roleLabel = selectedType === 'custom' ? customRole : selectedTypeData.label;

  const handleStart = async () => {
    if (selectedType === 'custom' && !customRole.trim()) {
      toast.error('Please enter a custom role');
      return;
    }
    if (!user) return;
    setLoading(true);

    try {
      const selectedResume = resumes.find(r => r.id === selectedResumeId);

      // Create interview in Firestore first
      const interviewId = await createInterview(user.uid, {
        userId: user.uid,
        resumeId: selectedResumeId,
        role: roleLabel,
        type: selectedType,
        difficulty: selectedDifficulty,
        status: 'pending',
        startedAt: null,
        completedAt: null,
        questions: [],
        answers: [],
        overallScore: null,
        totalQuestions: 8,
      });

      // Store resume text for API call (via sessionStorage)
      if (selectedResume) {
        sessionStorage.setItem(`interview_resume_${interviewId}`, JSON.stringify({
          skills: selectedResume.skills,
          summary: selectedResume.summary,
        }));
      }

      router.push(`/interview/session/${interviewId}`);
    } catch (error) {
      toast.error('Failed to start interview. Please try again.');
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <TopBar title="Start Interview" />

      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Interview Type Selection */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Select Interview Type</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {INTERVIEW_TYPES.map(({ type, label, icon: Icon, desc, color }) => (
              <motion.div
                key={type}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedType(type)}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${selectedType === type ? color : 'var(--orato-border)'}`,
                  background: selectedType === type ? 'rgba(138,106,139,0.06)' : 'var(--orato-bg)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: selectedType === type ? `${color}22` : 'var(--orato-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Icon size={18} color={selectedType === type ? color : 'var(--orato-text-secondary)'} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--orato-text-primary)', marginBottom: '0.25rem' }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--orato-text-secondary)', lineHeight: 1.4 }}>{desc}</div>
              </motion.div>
            ))}
          </div>
          {selectedType === 'custom' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: '1rem' }}>
              <input
                placeholder="Enter your target role (e.g., 'DevOps Engineer at Startup')"
                value={customRole}
                onChange={e => setCustomRole(e.target.value)}
                className="input"
                style={{ marginTop: '0.5rem' }}
              />
            </motion.div>
          )}
        </Card>

        {/* Difficulty */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Difficulty Level</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {DIFFICULTIES.map(({ value, label, desc, color }) => (
              <motion.div
                key={value}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedDifficulty(value)}
                style={{
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${selectedDifficulty === value ? color : 'var(--orato-border)'}`,
                  background: selectedDifficulty === value ? `${color}12` : 'var(--orato-bg)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedDifficulty === value ? color : 'var(--orato-text-primary)', marginBottom: '0.25rem' }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--orato-text-secondary)' }}>{desc}</div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Resume Selection */}
        {resumes.length > 0 && (
          <Card style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={16} color="var(--orato-warning)" />
                Resume-Aware Questions (Optional)
              </span>
            </h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              Select a resume so ORATO can generate questions specific to your experience.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <motion.div
                onClick={() => setSelectedResumeId(null)}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${selectedResumeId === null ? 'var(--orato-accent)' : 'var(--orato-border)'}`,
                  background: selectedResumeId === null ? 'rgba(180,139,175,0.08)' : 'var(--orato-bg)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Settings size={16} color="var(--orato-text-secondary)" />
                <span style={{ fontSize: '0.875rem', color: 'var(--orato-text-secondary)' }}>Generic questions (no resume)</span>
              </motion.div>
              {resumes.map(resume => (
                <motion.div
                  key={resume.id}
                  onClick={() => setSelectedResumeId(resume.id)}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${selectedResumeId === resume.id ? 'var(--orato-accent)' : 'var(--orato-border)'}`,
                    background: selectedResumeId === resume.id ? 'rgba(180,139,175,0.08)' : 'var(--orato-bg)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <FileText size={16} color="var(--orato-highlight)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--orato-text-primary)' }}>{resume.fileName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--orato-text-secondary)' }}>Score: {resume.resumeScore} · v{resume.version}</div>
                  </div>
                  <Badge variant="accent">v{resume.version}</Badge>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {/* Start CTA */}
        <Card secondary style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Ready to interview?</h3>
            <p style={{ fontSize: '0.9rem' }}>
              <strong>{roleLabel || 'Technical'}</strong> · {selectedDifficulty} difficulty · 8 questions
              {selectedResumeId ? ' · Resume-aware' : ''}
            </p>
          </div>
          <Button
            size="lg"
            loading={loading}
            onClick={handleStart}
            icon={<Mic size={18} />}
            iconRight={<ArrowRight size={18} />}
          >
            Start Interview
          </Button>
        </Card>
      </div>
    </PageWrapper>
  );
}
