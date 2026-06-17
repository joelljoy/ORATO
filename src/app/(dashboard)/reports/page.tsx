'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Filter, Search, Mic, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserInterviews } from '@/lib/firebase/firestore';
import { Interview } from '@/types/interview';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { format } from 'date-fns';

export default function ReportsPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');

  useEffect(() => {
    if (!user) return;
    getUserInterviews(user.uid, 50).then(data => {
      setInterviews(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const filtered = interviews
    .filter(iv => filter === 'all' || iv.status === filter)
    .filter(iv => search === '' || iv.role.toLowerCase().includes(search.toLowerCase()));

  const completed = interviews.filter(i => i.status === 'completed');
  const avgScore = completed.length
    ? Math.round(completed.reduce((a, b) => a + (b.overallScore || 0), 0) / completed.length)
    : 0;

  const scoreColor = (score: number | null) =>
    score === null ? 'var(--orato-text-secondary)'
      : score >= 80 ? 'var(--orato-success)'
      : score >= 60 ? 'var(--orato-warning)'
      : 'var(--orato-error)';

  return (
    <PageWrapper>
      <TopBar title="Reports" />

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Total Sessions', value: interviews.length, color: 'var(--orato-accent)' },
          { label: 'Completed', value: completed.length, color: 'var(--orato-success)' },
          { label: 'Avg. Score', value: `${avgScore}%`, color: 'var(--orato-highlight)' },
          { label: 'Best Score', value: `${completed.length ? Math.max(...completed.map(c => c.overallScore || 0)) : 0}%`, color: 'var(--orato-warning)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--orato-text-secondary)', marginTop: '0.375rem' }}>{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--orato-text-secondary)', pointerEvents: 'none' }} />
            <input
              placeholder="Search by role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            {(['all', 'completed', 'active'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ textTransform: 'capitalize' }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Interview List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <BarChart2 size={40} style={{ margin: '0 auto 1rem', opacity: 0.3, color: 'var(--orato-text-secondary)' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No interviews found</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {interviews.length === 0
              ? "You haven't done any interviews yet. Start your first one!"
              : "No matches for your current filter."}
          </p>
          {interviews.length === 0 && (
            <Link href="/interview"><button className="btn btn-primary">Start Interview</button></Link>
          )}
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filtered.map((interview, i) => (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/reports/${interview.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  className="card"
                  style={{ cursor: 'pointer', transition: 'all var(--transition-base)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-hover)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--orato-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Mic size={20} color="var(--orato-highlight)" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--orato-text-primary)', marginBottom: '0.25rem' }}>
                          {interview.role}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>{interview.type}</span>
                          <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>{interview.difficulty}</span>
                          {interview.createdAt && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--orato-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={12} />
                              {format(new Date(interview.createdAt), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                      <Badge variant={interview.status === 'completed' ? 'success' : interview.status === 'active' ? 'warning' : 'default'}>
                        {interview.status}
                      </Badge>
                      {interview.overallScore !== null && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: scoreColor(interview.overallScore), lineHeight: 1 }}>
                            {interview.overallScore}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--orato-text-secondary)' }}>/ 100</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
