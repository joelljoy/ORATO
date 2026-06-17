'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Award, Target, Tag, Plus, Trash2, Save, Mic } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/firebase/firestore';
import { ExperienceLevel, InterviewType } from '@/types/user';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (2-5 years)' },
  { value: 'senior', label: 'Senior Level (5-8 years)' },
  { value: 'lead', label: 'Lead/Staff (8+ years)' },
  { value: 'executive', label: 'Executive/VP' },
];

const INTERVIEW_TYPES: { value: InterviewType; label: string }[] = [
  { value: 'technical', label: 'Technical (DSA & Problem Solving)' },
  { value: 'hr', label: 'HR / Behavioral' },
  { value: 'ai-ml', label: 'AI / Machine Learning' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'custom', label: 'Custom Specified Role' },
];

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('mid');
  const [preferredInterviewType, setPreferredInterviewType] = useState<InterviewType>('technical');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  // Sync profile details on load
  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName || user?.displayName || '');
    setTargetRole(profile.targetRole || '');
    setExperienceLevel(profile.experienceLevel || 'mid');
    setPreferredInterviewType(profile.preferredInterviewType || 'technical');
    setSkills(profile.skillPreferences || []);
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateUserProfile(user.uid, {
        displayName,
        targetRole,
        experienceLevel,
        preferredInterviewType,
        skillPreferences: skills,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to save profile changes');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    if (e.type === 'keydown') e.preventDefault();

    const trimmed = newSkill.trim();
    if (!trimmed) return;

    if (skills.includes(trimmed)) {
      toast.error('Skill tag already added');
      return;
    }

    setSkills([...skills, trimmed]);
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  if (authLoading) {
    return (
      <PageWrapper>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ animation: 'spin 1s linear infinite', border: '3px solid var(--orato-border)', borderTopColor: 'var(--orato-highlight)', width: 30, height: 30, borderRadius: '50%' }} />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <TopBar title="User Profile" />

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Account Details */}
          <Card>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--orato-highlight)" />
              Account Settings
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <Input
                label="Full Name"
                placeholder="Enter your name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                icon={<User size={16} />}
              />
              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                icon={<Mail size={16} />}
              />
            </div>
          </Card>

          {/* Job Target Details */}
          <Card>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={18} color="var(--orato-accent)" />
              Interview Preferences
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input
                label="Target Role"
                placeholder="e.g. Senior Frontend Engineer, Product Manager"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                icon={<Mic size={16} />}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--orato-text-secondary)' }}>
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={e => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="input"
                  style={{
                    background: 'var(--orato-bg)',
                    border: '1px solid var(--orato-border)',
                    outline: 'none',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem',
                    color: 'var(--orato-text-primary)',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  {EXPERIENCE_LEVELS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--orato-text-secondary)' }}>
                  Preferred Interview Type
                </label>
                <select
                  value={preferredInterviewType}
                  onChange={e => setPreferredInterviewType(e.target.value as InterviewType)}
                  className="input"
                  style={{
                    background: 'var(--orato-bg)',
                    border: '1px solid var(--orato-border)',
                    outline: 'none',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem',
                    color: 'var(--orato-text-primary)',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  {INTERVIEW_TYPES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Skill Tag list */}
          <Card>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={18} color="var(--orato-success)" />
              Skill Focus tags
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--orato-text-secondary)', marginBottom: '1.25rem' }}>
              Input skills you want ORATO to focus on during evaluation (press Enter to add).
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="e.g. React, Node.js, Kubernetes, STAR Methodology"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={addSkill}
                  icon={<Tag size={15} />}
                />
              </div>
              <button
                type="button"
                onClick={addSkill}
                className="btn btn-secondary"
                style={{ height: 'fit-content', padding: '0.625rem 1rem', alignSelf: 'flex-end', borderRadius: 'var(--radius-md)' }}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* List tags */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {skills.length === 0 ? (
                <span style={{ fontSize: '0.85rem', color: 'var(--orato-text-secondary)', fontStyle: 'italic' }}>
                  No focus skills specified yet.
                </span>
              ) : (
                skills.map(skill => (
                  <Badge
                    key={skill}
                    variant="accent"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.625rem',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      style={{
                        background: 'transparent', border: 'none',
                        color: 'var(--orato-text-secondary)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', padding: 0
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--orato-error)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--orato-text-secondary)'}
                    >
                      <Trash2 size={11} />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </Card>

          {/* Action CTA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              loading={loading}
              icon={<Save size={18} />}
            >
              Save Profile Changes
            </Button>
          </div>

        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </PageWrapper>
  );
}
