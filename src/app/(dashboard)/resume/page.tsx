'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Star, Trash2, Download, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/contexts/AuthContext';
import { getUserResumes, saveResume, deleteResume } from '@/lib/firebase/firestore';
import { Resume } from '@/types/resume';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { SkeletonCard } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function ResumePage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [selected, setSelected] = useState<Resume | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserResumes(user.uid).then(data => {
      setResumes(data);
      setLoading(false);
      if (data.length > 0) setSelected(data[0]);
    }).catch(() => setLoading(false));
  }, [user]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !user) return;

    setUploading(true);
    setParsing(false);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      toast.loading('Parsing your resume with AI...', { id: 'parse' });
      setParsing(true);

      const res = await fetch('/api/resume/parse', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Parse failed');

      toast.success('Resume analyzed successfully!', { id: 'parse' });

      const resumeId = await saveResume(user.uid, {
        userId: user.uid,
        fileName: file.name,
        storageUrl: '',
        uploadedAt: new Date().toISOString(),
        version: resumes.length + 1,
        resumeScore: data.resumeScore || 75,
        skills: data.skills || [],
        projects: data.projects || [],
        education: data.education || [],
        experience: data.experience || [],
        suggestedRoles: data.suggestedRoles || [],
        summary: data.summary || '',
      });

      const updated = await getUserResumes(user.uid);
      setResumes(updated);
      const newResume = updated.find(r => r.id === resumeId);
      if (newResume) setSelected(newResume);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast.error(message, { id: 'parse' });
    } finally {
      setUploading(false);
      setParsing(false);
    }
  }, [user, resumes.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume?')) return;
    await deleteResume(id);
    const updated = resumes.filter(r => r.id !== id);
    setResumes(updated);
    if (selected?.id === id) setSelected(updated[0] || null);
    toast.success('Resume deleted');
  };

  const scoreColor = (score: number) =>
    score >= 80 ? 'var(--orato-success)' : score >= 60 ? 'var(--orato-warning)' : 'var(--orato-error)';

  return (
    <PageWrapper>
      <TopBar title="Resume Center" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 1.5fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Upload + History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Drop Zone */}
          <Card>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Upload Resume</h3>
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? 'var(--orato-highlight)' : 'var(--orato-border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem 1rem',
                textAlign: 'center',
                cursor: uploading ? 'not-allowed' : 'pointer',
                background: isDragActive ? 'rgba(138,106,139,0.06)' : 'var(--orato-bg)',
                transition: 'all var(--transition-base)',
              }}
            >
              <input {...getInputProps()} />
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--orato-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                {uploading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Upload size={22} color="var(--orato-highlight)" />
                  </motion.div>
                ) : (
                  <Upload size={22} color="var(--orato-highlight)" />
                )}
              </div>
              {parsing ? (
                <>
                  <p style={{ fontWeight: 600, color: 'var(--orato-text-primary)', marginBottom: '0.25rem' }}>Analyzing with AI...</p>
                  <p style={{ fontSize: '0.85rem' }}>Extracting skills, projects, and experience</p>
                </>
              ) : isDragActive ? (
                <p style={{ fontWeight: 600, color: 'var(--orato-highlight)' }}>Drop your resume here!</p>
              ) : (
                <>
                  <p style={{ fontWeight: 600, color: 'var(--orato-text-primary)', marginBottom: '0.25rem' }}>
                    Drag & drop your resume
                  </p>
                  <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>or click to browse files</p>
                  <span className="badge badge-accent">PDF only · Max 5MB</span>
                </>
              )}
            </div>
          </Card>

          {/* Resume History */}
          <Card>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Your Resumes</h3>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : resumes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--orato-text-secondary)', fontSize: '0.9rem' }}>
                <FileText size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                No resumes yet. Upload your first one!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {resumes.map(resume => (
                  <div
                    key={resume.id}
                    onClick={() => setSelected(resume)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.875rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      background: selected?.id === resume.id ? 'var(--orato-surface-secondary)' : 'var(--orato-bg)',
                      border: `1px solid ${selected?.id === resume.id ? 'var(--orato-accent-secondary)' : 'var(--orato-border)'}`,
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <FileText size={17} color="var(--orato-highlight)" />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--orato-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {resume.fileName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--orato-text-secondary)' }}>
                          v{resume.version} · Score: {resume.resumeScore}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(resume.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--orato-error)', opacity: 0.6, borderRadius: 'var(--radius-sm)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Resume Details */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {/* Score */}
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{selected.fileName}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--orato-text-secondary)' }}>Version {selected.version}</span>
                  </div>
                  <ProgressRing
                    value={selected.resumeScore}
                    size={80}
                    label={`${selected.resumeScore}`}
                    sublabel="Score"
                    color={scoreColor(selected.resumeScore)}
                  />
                </div>

                {selected.summary && (
                  <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--orato-bg)', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{selected.summary}</p>
                  </div>
                )}

                {/* Suggested Roles */}
                {selected.suggestedRoles.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--orato-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Suggested Roles
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selected.suggestedRoles.map(role => (
                        <Badge key={role} variant="accent">{role}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Skills */}
              {selected.skills.length > 0 && (
                <Card>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Extracted Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selected.skills.map(skill => (
                      <span key={skill} className="badge badge-accent" style={{ cursor: 'default' }}>{skill}</span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Projects */}
              {selected.projects.length > 0 && (
                <Card>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Projects</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {selected.projects.map((proj, i) => (
                      <div key={i} style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--orato-bg)', border: '1px solid var(--orato-border)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--orato-text-primary)' }}>{proj.name}</div>
                        <p style={{ fontSize: '0.8rem', marginBottom: '0.625rem' }}>{proj.description}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                          {proj.technologies.map(t => <span key={t} style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'var(--orato-surface-secondary)', color: 'var(--orato-highlight)' }}>{t}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Education */}
              {selected.education.length > 0 && (
                <Card>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Education</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selected.education.map((edu, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--orato-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Star size={16} color="var(--orato-warning)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--orato-text-primary)' }}>{edu.degree} in {edu.field}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--orato-text-secondary)' }}>{edu.institution} · {edu.year}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}
            >
              <div style={{ textAlign: 'center', color: 'var(--orato-text-secondary)' }}>
                <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>Upload a resume to see the analysis</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
