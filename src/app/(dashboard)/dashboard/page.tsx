'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Clock, Target, ArrowRight, Mic, Zap, Star, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserInterviews } from '@/lib/firebase/firestore';
import { Interview } from '@/types/interview';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const STAT_DELAY = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06, duration: 0.35 } });

const QUICK_ACTIONS = [
  { href: '/interview', label: 'New Interview', icon: Mic, color: 'var(--orato-highlight)' },
  { href: '/resume', label: 'Upload Resume', icon: Plus, color: 'var(--orato-accent)' },
  { href: '/reports', label: 'View Reports', icon: TrendingUp, color: 'var(--orato-success)' },
];

const SKILL_DATA = [
  { skill: 'Technical', score: 78 },
  { skill: 'Communication', score: 85 },
  { skill: 'Problem Solving', score: 72 },
  { skill: 'System Design', score: 65 },
  { skill: 'Behavioral', score: 88 },
  { skill: 'Code Quality', score: 75 },
];

const RADAR_DATA = SKILL_DATA.map(s => ({ subject: s.skill, A: s.score, fullMark: 100 }));

const AI_TIPS = [
  { icon: '🎯', tip: 'Focus on System Design — your last 3 sessions scored below 70 in this area.' },
  { icon: '💬', tip: 'Structure behavioral answers using the STAR method for stronger impact.' },
  { icon: '📚', tip: 'Review distributed systems concepts before your next backend interview.' },
];

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserInterviews(user.uid).then(data => {
      setInterviews(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const completed = interviews.filter(i => i.status === 'completed');
  const avgScore = completed.length
    ? Math.round(completed.reduce((a, b) => a + (b.overallScore || 0), 0) / completed.length)
    : 0;
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  const STATS = [
    { label: 'Overall Score', value: `${avgScore}%`, icon: Award, color: 'var(--orato-highlight)', bg: 'rgba(138,106,139,0.1)' },
    { label: 'Interviews Done', value: completed.length.toString(), icon: Mic, color: 'var(--orato-success)', bg: 'rgba(134,197,163,0.1)' },
    { label: 'Avg. Rating', value: avgScore > 0 ? `${(avgScore / 20).toFixed(1)}/5` : '—', icon: Star, color: 'var(--orato-warning)', bg: 'rgba(229,183,105,0.1)' },
    { label: 'Practice Hours', value: `${Math.floor(interviews.length * 0.5)}h`, icon: Clock, color: 'var(--orato-accent)', bg: 'rgba(180,139,175,0.1)' },
  ];

  return (
    <PageWrapper>
      <TopBar />

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'linear-gradient(135deg, var(--orato-highlight), var(--orato-accent))',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '0.375rem' }}>
            Hello, {firstName}! 👋
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
            {completed.length === 0
              ? 'Ready to ace your first interview? Let\'s go!'
              : `You've completed ${completed.length} interview${completed.length > 1 ? 's' : ''}. Keep improving!`}
          </p>
        </div>
        <Link href="/interview">
          <Button
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
            iconRight={<ArrowRight size={16} />}
          >
            Start Interview
          </Button>
        </Link>
      </motion.div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {STATS.map((stat, i) => (
          <motion.div key={stat.label} {...STAT_DELAY(i)}>
            <Card hover>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={19} color={stat.color} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--orato-text-primary)', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--orato-text-secondary)', marginTop: '0.375rem' }}>
                {stat.label}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '1.25rem', marginBottom: '1.25rem', alignItems: 'start' }}>

        {/* Recent Interviews */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Recent Interviews</h3>
            <Link href="/reports"><Button variant="ghost" size="sm" iconRight={<ArrowRight size={14} />}>View All</Button></Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : interviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--orato-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Mic size={26} color="var(--orato-accent)" />
              </div>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Your first interview is one click away</h4>
              <p style={{ fontSize: '0.875rem', maxWidth: 280, margin: '0 auto 1.5rem' }}>
                No sessions yet. Choose a role, pick a difficulty, and start practicing in under 2 minutes.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {[
                  { href: '/resume', label: 'Step 1 — Upload your resume', icon: '📄' },
                  { href: '/interview', label: 'Step 2 — Start a practice session', icon: '🎙️' },
                  { href: '/reports', label: 'Step 3 — Review your report', icon: '📊' },
                ].map(({ href, label, icon }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--orato-bg)',
                      border: '1px solid var(--orato-border)',
                      textDecoration: 'none',
                      fontSize: '0.85rem', fontWeight: 500, color: 'var(--orato-text-primary)',
                      transition: 'all var(--transition-fast)',
                      textAlign: 'left',
                    }}
                  >
                    <span>{icon}</span>
                    <span style={{ flex: 1 }}>{label}</span>
                    <ArrowRight size={14} color="var(--orato-text-secondary)" />
                  </Link>
                ))}
              </div>
              <Link href="/interview">
                <Button size="sm" icon={<Mic size={14} />}>Start First Interview</Button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {interviews.slice(0, 5).map(interview => (
                <Link
                  key={interview.id}
                  href={`/reports/${interview.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--orato-bg)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--orato-border)'; (e.currentTarget as HTMLElement).style.background = 'var(--orato-surface-secondary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.background = 'var(--orato-bg)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--orato-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Mic size={16} color="var(--orato-highlight)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--orato-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {interview.role}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--orato-text-secondary)' }}>
                        {interview.type} · {interview.difficulty}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <Badge variant={interview.status === 'completed' ? 'success' : 'warning'}>
                      {interview.status}
                    </Badge>
                    {interview.overallScore !== null && (
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--orato-highlight)' }}>
                        {interview.overallScore}%
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Skill Radar + Progress Ring */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Skill Overview</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <ProgressRing value={avgScore} size={96} label={`${avgScore}%`} sublabel="Overall" />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="var(--orato-border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--orato-text-secondary)' }} />
                <Radar dataKey="A" stroke="var(--orato-highlight)" fill="var(--orato-highlight)" fillOpacity={0.18} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {QUICK_ACTIONS.map(({ href, label, icon: Icon, color }) => (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.875rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--orato-bg)',
                      cursor: 'pointer',
                      border: '1px solid var(--orato-border)',
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--orato-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={color} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--orato-text-primary)' }}>{label}</span>
                    <ArrowRight size={14} color="var(--orato-text-secondary)" style={{ marginLeft: 'auto' }} />
                  </motion.div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Score Trend */}
      {completed.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <Card>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Score Trend</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={completed.slice(-6).map((iv, i) => ({ name: `#${i + 1}`, score: iv.overallScore || 0 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--orato-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--orato-text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--orato-text-secondary)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: 'var(--orato-surface)', border: '1px solid var(--orato-border)', borderRadius: 12, boxShadow: 'var(--shadow-hover)', fontSize: 13 }}
                  cursor={{ fill: 'var(--orato-surface-secondary)' }}
                />
                <Bar dataKey="score" fill="var(--orato-highlight)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Communication Metrics</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={completed.slice(-6).map((iv, i) => ({ name: `#${i + 1}`, speakingTime: Math.floor(Math.random() * 60) + 60 /* mock speaking duration per answer */ }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--orato-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--orato-text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--orato-text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--orato-surface)', border: '1px solid var(--orato-border)', borderRadius: 12, boxShadow: 'var(--shadow-hover)', fontSize: 13 }}
                  cursor={{ fill: 'var(--orato-surface-secondary)' }}
                />
                <Bar dataKey="speakingTime" fill="var(--orato-accent)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* AI Recommendations */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <Zap size={18} color="var(--orato-warning)" />
          <h3 style={{ fontSize: '1rem' }}>AI Recommendations</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {AI_TIPS.map(({ icon, tip }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--orato-bg)',
                border: '1px solid var(--orato-border)',
              }}
            >
              <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>{icon}</span>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>{tip}</p>
            </motion.div>
          ))}
        </div>
      </Card>
    </PageWrapper>
  );
}
