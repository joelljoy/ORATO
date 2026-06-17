'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Award, Clock, Star, TrendingUp, CheckCircle, AlertTriangle,
  ArrowLeft, ExternalLink, Calendar, BookOpen, AlertCircle, Play,
  ChevronDown, ChevronUp, Zap, HelpCircle, FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getInterview, getReportByInterview } from '@/lib/firebase/firestore';
import { Interview } from '@/types/interview';
import { Report } from '@/types/report';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        // 1. Fetch interview details
        const iv = await getInterview(id);
        if (!iv) {
          toast.error('Interview session not found');
          router.push('/reports');
          return;
        }
        if (isMounted) setInterview(iv);

        // 2. Fetch report details
        const rpt = await getReportByInterview(id);
        if (rpt) {
          if (isMounted) {
            setReport(rpt);
            setLoading(false);
          }
          return;
        }

        // 3. If completed but report doesn't exist, trigger generation
        if (iv.status === 'completed') {
          setGenerating(true);
          const res = await fetch('/api/reports/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interviewId: id, userId: user.uid }),
          });
          const data = await res.json();
          if (res.ok && data.report) {
            if (isMounted) {
              setReport(data.report);
              setGenerating(false);
              setLoading(false);
            }
          } else {
            throw new Error(data.error || 'Failed to generate report');
          }
        } else {
          toast.error('This interview session is not completed');
          router.push('/reports');
        }
      } catch (err: any) {
        console.error('Error loading report:', err);
        toast.error(err.message || 'Failed to load report');
        if (isMounted) {
          setLoading(false);
          setGenerating(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, user, router]);

  if (loading || generating) {
    return (
      <PageWrapper>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1.5rem' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
            <Zap size={44} color="var(--orato-highlight)" />
          </motion.div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>{generating ? 'AI is evaluating your session...' : 'Loading report...'}</h2>
            <p style={{ color: 'var(--orato-text-secondary)', maxWidth: 400, margin: '0 auto' }}>
              {generating ? 'Analyzing transcript, measuring technical depth, and preparing learning path resources (this takes about 10 seconds)...' : 'Retreiving your interview metrics...'}
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!interview || !report) {
    return (
      <PageWrapper>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertCircle size={48} color="var(--orato-error)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Report Unavailable</h2>
          <p style={{ color: 'var(--orato-text-secondary)', marginBottom: '1.5rem' }}>We could not load this performance report.</p>
          <Button onClick={() => router.push('/reports')}>Back to Reports</Button>
        </div>
      </PageWrapper>
    );
  }

  // Formatting chart data
  const radarData = Object.entries(report.skillAnalysis).map(([subject, score]) => ({
    subject,
    A: score,
    fullMark: 100,
  }));

  const breakdownData = [
    { name: 'Accuracy', score: report.breakdown.technicalAccuracy },
    { name: 'Clarity', score: report.breakdown.clarity },
    { name: 'Completeness', score: report.breakdown.completeness },
    { name: 'Comm.', score: report.breakdown.communication },
    { name: 'Depth', score: report.breakdown.depth },
    { name: 'Problem Solv.', score: report.breakdown.problemSolving },
  ];

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'var(--orato-error)';
    if (priority === 'medium') return 'var(--orato-warning)';
    return 'var(--orato-success)';
  };

  const getResourceIcon = (type: string) => {
    if (type === 'video') return <Play size={15} />;
    if (type === 'article' || type === 'course') return <BookOpen size={15} />;
    return <FileText size={15} />;
  };

  return (
    <PageWrapper>
      {/* Back Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          onClick={() => router.push('/reports')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--orato-surface)', border: '1px solid var(--orato-border)',
            cursor: 'pointer', color: 'var(--orato-text-primary)',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(-2px)'; e.currentTarget.style.borderColor = 'var(--orato-accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--orato-border)'; }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Session Performance Report</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--orato-text-secondary)' }}>
            {interview.role} · Practice Completed {interview.completedAt ? format(new Date(interview.completedAt), 'MMM d, yyyy') : ''}
          </p>
        </div>
      </div>

      {/* Overview Block */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>
        {/* Score Breakdown Ring Card */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <ProgressRing value={report.overallScore} size={130} strokeWidth={10} label={`${report.overallScore}%`} sublabel="Overall Score" />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Dimension Ratings</h3>
              {[
                { label: 'Technical Score', value: report.technicalScore, color: 'var(--orato-highlight)' },
                { label: 'Communication Score', value: report.communicationScore, color: 'var(--orato-accent)' },
                { label: 'Behavioral Score', value: report.behavioralScore, color: 'var(--orato-success)' },
              ].map(dim => (
                <div key={dim.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--orato-text-secondary)' }}>{dim.label}</span>
                    <span style={{ fontWeight: 700, color: 'var(--orato-text-primary)' }}>{dim.value}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--orato-surface-secondary)', borderRadius: 9 }}>
                    <div style={{ height: '100%', background: dim.color, borderRadius: 9, width: `${dim.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Skill radar chart card */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Skill Breakdown</h3>
          <div style={{ width: '100%', height: 210 }}>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--orato-border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--orato-text-secondary)' }} />
                  <Radar dataKey="A" stroke="var(--orato-highlight)" fill="var(--orato-highlight)" fillOpacity={0.16} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--orato-text-secondary)' }}>No skill data.</div>
            )}
          </div>
        </Card>
      </div>

      {/* Category breakdown bar chart */}
      <Card style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '1.25rem' }}>Detailed Performance Matrix</h3>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={breakdownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--orato-border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--orato-text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--orato-text-secondary)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: 'var(--orato-surface)', border: '1px solid var(--orato-border)', borderRadius: 12, fontSize: 12 }}
                cursor={{ fill: 'var(--orato-surface-secondary)', opacity: 0.4 }}
              />
              <Bar dataKey="score" fill="var(--orato-accent)" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Strengths and Weaknesses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card style={{ borderLeft: '4px solid var(--orato-success)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--orato-text-primary)' }}>
            <CheckCircle size={18} color="var(--orato-success)" />
            Top Key Strengths
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '0.5rem', listStyle: 'none' }}>
            {report.strengths.map((str, i) => (
              <li key={i} style={{ fontSize: '0.9rem', color: 'var(--orato-text-primary)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--orato-success)', fontWeight: 800 }}>•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card style={{ borderLeft: '4px solid var(--orato-error)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--orato-text-primary)' }}>
            <AlertTriangle size={18} color="var(--orato-error)" />
            Key Improvement Areas
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '0.5rem', listStyle: 'none' }}>
            {report.weaknesses.map((weak, i) => (
              <li key={i} style={{ fontSize: '0.9rem', color: 'var(--orato-text-primary)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--orato-error)', fontWeight: 800 }}>•</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Improvement Roadmap */}
      {report.improvementRoadmap.length > 0 && (
        <Card style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} color="var(--orato-warning)" />
            Actionable Study Roadmap
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {report.improvementRoadmap.map((item, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--orato-bg)',
                  border: '1px solid var(--orato-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--orato-text-primary)' }}>{item.area}</span>
                  <Badge
                    variant={item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'success'}
                    style={{ fontSize: '0.68rem', textTransform: 'capitalize' }}
                  >
                    {item.priority}
                  </Badge>
                </div>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.45, color: 'var(--orato-text-secondary)', flex: 1 }}>
                  {item.suggestion}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--orato-highlight)', marginTop: '0.5rem', fontWeight: 600 }}>
                  <Clock size={12} />
                  <span>Timeframe: {item.estimatedTime}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Curated Resources */}
      {report.learningResources.length > 0 && (
        <Card style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} color="var(--orato-highlight)" />
            AI-Curated Learning Materials
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {report.learningResources.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem',
                  background: 'var(--orato-surface-secondary)',
                  border: '1px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orato-accent)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = ''; }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--orato-surface)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'var(--orato-highlight)', flexShrink: 0
                }}>
                  {getResourceIcon(res.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--orato-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {res.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--orato-text-secondary)', textTransform: 'capitalize' }}>
                    {res.topic} · {res.type}
                  </div>
                </div>
                <ExternalLink size={12} color="var(--orato-text-secondary)" style={{ flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Question Breakdown */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', marginTop: '2rem' }}>Response Transcript & Evaluations</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {report.questionBreakdown.map((qb, i) => {
          const isExpanded = expandedQuestion === qb.questionId;
          const userAns = interview.answers.find(ans => ans.questionId === qb.questionId);

          const qScoreColor = qb.score >= 80 ? 'var(--orato-success)'
            : qb.score >= 60 ? 'var(--orato-warning)'
            : 'var(--orato-error)';

          return (
            <div
              key={qb.questionId}
              style={{
                background: 'var(--orato-surface)',
                border: '1px solid var(--orato-border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                transition: 'all var(--transition-fast)'
              }}
            >
              {/* Header section (Always visible) */}
              <div
                onClick={() => setExpandedQuestion(isExpanded ? null : qb.questionId)}
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  gap: '1rem',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 800, color: 'var(--orato-highlight)', fontSize: '0.9rem', flexShrink: 0, marginTop: '0.125rem' }}>
                    Q{i + 1}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--orato-text-primary)', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {qb.questionText}
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                      <Badge variant="accent">{qb.questionType}</Badge>
                      {userAns?.isEvaluated === false && <Badge variant="default">Evaluation Skipped</Badge>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  {userAns?.isEvaluated && (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: qScoreColor }}>{qb.score}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--orato-text-secondary)' }}>/ 100</span>
                    </div>
                  )}
                  {isExpanded ? <ChevronUp size={16} color="var(--orato-text-secondary)" /> : <ChevronDown size={16} color="var(--orato-text-secondary)" />}
                </div>
              </div>

              {/* Expander Panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', borderTop: '1px solid var(--orato-border)', display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1.25rem' }}>
                      {/* Full Question Text */}
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--orato-text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Question</div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--orato-text-primary)', fontWeight: 500, lineHeight: 1.5 }}>{qb.questionText}</p>
                      </div>

                      {/* User Answer Transcript */}
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--orato-text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Candidate's Answer</div>
                        <p
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--orato-text-primary)',
                            lineHeight: 1.6,
                            background: 'var(--orato-bg)',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--orato-border)',
                            fontStyle: userAns?.text === '[Skipped]' ? 'italic' : 'normal'
                          }}
                        >
                          {userAns?.text || '[No Answer]'}
                        </p>
                      </div>

                      {/* Video Recording Playback */}
                      {userAns?.videoUrl && (
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--orato-text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Video Response</div>
                          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--orato-border)', background: '#000' }}>
                            <video
                              controls
                              src={userAns.videoUrl}
                              style={{ width: '100%', maxHeight: '400px', display: 'block' }}
                              preload="metadata"
                            />
                          </div>
                        </div>
                      )}

                      {/* Evaluated Details */}
                      {userAns?.isEvaluated && userAns.feedback && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--orato-surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--orato-success)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>✓ Key Strengths</div>
                            <ul style={{ paddingLeft: '0.5rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                              {userAns.feedback.strengths.map((str, idx) => (
                                <li key={idx} style={{ fontSize: '0.8rem', color: 'var(--orato-text-primary)' }}>• {str}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--orato-highlight)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>→ Actionable Suggestion</div>
                            <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--orato-text-primary)' }}>
                              {qb.feedback}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
}
