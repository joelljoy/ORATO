'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, ArrowRight, Check, Target, TrendingUp,
  ChevronRight, FileText, BarChart2, MessageSquare,
  ChevronDown, Star, Award, Clock, Play, Zap, Users
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const, delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const, delay },
});

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Target,
    title: 'Resume-Aware Questions',
    desc: 'Upload your resume and get questions that directly probe your projects, skills, and experience — not generic prompts.',
  },
  {
    icon: MessageSquare,
    title: 'Instant Feedback on Every Answer',
    desc: 'Receive detailed feedback on technical accuracy, communication clarity, depth, and completeness — right after you answer.',
  },
  {
    icon: TrendingUp,
    title: 'Performance Analytics',
    desc: 'Track your growth with skill radar charts, score trends, and improvement roadmaps across every session.',
  },
  {
    icon: FileText,
    title: 'Detailed Session Reports',
    desc: 'Every interview generates a comprehensive report with skill gap analysis, strengths, and curated resources.',
  },
  {
    icon: BarChart2,
    title: '6+ Interview Types',
    desc: 'HR, Technical, AI/ML, Frontend, Backend, Full Stack, and Custom role interviews — all in one platform.',
  },
  {
    icon: Zap,
    title: 'Adaptive Difficulty',
    desc: 'Choose from Easy, Medium, Hard, or Adaptive — the platform adjusts the challenge to match your target level.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Upload Your Resume',
    desc: 'Drop your PDF resume. ORATO extracts your skills, projects, and work history to build a personalized question set.',
    icon: FileText,
  },
  {
    step: '02',
    title: 'Choose Your Interview',
    desc: 'Pick your target role, difficulty, and interview type. Every session is tailored to what you\'re actually preparing for.',
    icon: Target,
  },
  {
    step: '03',
    title: 'Practice & Track Progress',
    desc: 'Answer questions, receive instant feedback, and review your performance report after every session.',
    icon: TrendingUp,
  },
];

const TESTIMONIALS = [
  {
    name: 'Arjun Mehta',
    role: 'Software Engineer, Google',
    quote: 'The resume-aware questions were unlike anything I\'d seen before. They felt like they were written by someone who had actually read my resume. Landed the offer.',
    rating: 5,
    initials: 'AM',
  },
  {
    name: 'Priya Sharma',
    role: 'ML Engineer, Meta',
    quote: 'The AI/ML interview mode is genuinely thorough. I went through 6 sessions in two weeks and felt significantly more confident by the end.',
    rating: 5,
    initials: 'PS',
  },
  {
    name: 'David Chen',
    role: 'Frontend Lead, Stripe',
    quote: 'The performance reports are the real gem. They told me exactly where I was losing points — something mock interviews with friends never did.',
    rating: 5,
    initials: 'DC',
  },
];

const FAQS = [
  {
    q: 'How does ORATO personalize interview questions?',
    a: 'When you upload your resume, ORATO extracts your skills, experience, and project history. It then uses this context to generate questions that are specifically relevant to your background and target role — not generic prompts.',
  },
  {
    q: 'What interview types are supported?',
    a: 'ORATO supports HR/Behavioral, Technical (DSA & Algorithms), AI/ML, Frontend (React, JS, CSS), Backend (APIs, Databases), Full Stack, and Custom role interviews. You can set any custom role you want.',
  },
  {
    q: 'How is my answer evaluated?',
    a: 'Each answer is evaluated across multiple dimensions: technical accuracy, communication clarity, depth, completeness, and problem-solving approach. You receive a score and specific, actionable feedback for each dimension.',
  },
  {
    q: 'Can I practice without uploading a resume?',
    a: 'Yes. Resume upload is optional. Without a resume, ORATO generates high-quality generic questions for your chosen role and difficulty level.',
  },
  {
    q: 'Is my data private?',
    a: 'All interview sessions, answers, and reports are private to your account. We do not share your data with third parties.',
  },
  {
    q: 'How many practice sessions can I do?',
    a: 'You can start practicing for free. Create an account and begin your first session immediately — no credit card required.',
  },
];

const SKILLS_DEMO = [
  { label: 'Technical Accuracy', value: 82 },
  { label: 'Communication', value: 91 },
  { label: 'Problem Solving', value: 74 },
  { label: 'System Design', value: 68 },
  { label: 'Behavioral', value: 87 },
];

// ─── Sub-Components ──────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: '1px solid var(--orato-border)',
      }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 0',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '1rem',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--orato-text-primary)', lineHeight: 1.4 }}>
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0, color: 'var(--orato-accent)' }}
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ paddingBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--orato-text-secondary)' }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MockInterviewCard() {
  return (
    <div
      style={{
        background: 'var(--orato-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--orato-border)',
        boxShadow: '0 24px 64px rgba(47,36,48,0.12)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: 480,
      }}
    >
      {/* Window bar */}
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--orato-border)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--orato-surface-secondary)' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
        <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--orato-text-secondary)' }}>ORATO — Interview Session</span>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* Session header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>Technical</span>
            <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>Senior</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--orato-text-secondary)', fontWeight: 500 }}>Q 4 of 8 · 5:12 left</span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'var(--orato-border)', borderRadius: 'var(--radius-full)', marginBottom: '1.25rem', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '50%' }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
            style={{ height: '100%', background: 'var(--orato-highlight)', borderRadius: 'var(--radius-full)' }}
          />
        </div>

        {/* Question card */}
        <div style={{ background: 'var(--orato-bg)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--orato-border)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--orato-text-primary)', lineHeight: 1.6, margin: 0 }}>
            "Describe how you'd design a distributed rate-limiting system for an API serving 50M daily requests."
          </p>
        </div>

        {/* Answer textarea mock */}
        <div style={{ background: 'var(--orato-bg)', border: '2px solid var(--orato-accent)', borderRadius: 'var(--radius-md)', padding: '0.875rem', marginBottom: '1rem', minHeight: 72 }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--orato-text-secondary)', margin: 0, lineHeight: 1.5 }}>
            I'd use a token bucket algorithm with Redis as the distributed store...
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{ display: 'inline-block', width: 2, height: 14, background: 'var(--orato-highlight)', marginLeft: 2, verticalAlign: 'middle' }}
            />
          </p>
        </div>

        {/* Score preview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {[{ label: 'Technical', val: 88 }, { label: 'Clarity', val: 82 }, { label: 'Depth', val: 75 }].map(({ label, val }) => (
            <div key={label} style={{ background: 'var(--orato-surface-secondary)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.625rem', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--orato-highlight)' }}>{val}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--orato-text-secondary)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard() {
  return (
    <div style={{
      background: 'var(--orato-surface)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--orato-border)',
      boxShadow: '0 24px 64px rgba(47,36,48,0.12)',
      padding: '1.5rem',
      width: '100%',
      maxWidth: 420,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.125rem' }}>Skill Performance</h4>
          <p style={{ fontSize: '0.75rem', margin: 0 }}>Last 6 sessions</p>
        </div>
        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>↑ +12 pts</span>
      </div>

      {SKILLS_DEMO.map(({ label, value }, i) => (
        <div key={label} style={{ marginBottom: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--orato-text-primary)' }}>{label}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--orato-highlight)' }}>{value}</span>
          </div>
          <div style={{ height: 6, background: 'var(--orato-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${value}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.1 }}
              style={{ height: '100%', background: 'var(--orato-highlight)', borderRadius: 'var(--radius-full)', opacity: 0.85 + i * 0.03 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LandingPage() {
  const [activePreviewTab, setActivePreviewTab] = useState<'interview' | 'analytics'>('interview');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--orato-bg)', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(243, 234, 242, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--orato-border)',
          padding: '0 2rem',
          height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--orato-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={15} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--orato-text-primary)', letterSpacing: '-0.02em' }}>ORATO</span>
        </Link>

        {/* Nav links — hidden on small screens */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="hidden md:flex">
          {['Features', 'How it works', 'FAQ'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--orato-text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--orato-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--orato-text-secondary)')}
            >
              {item}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <Link href="/login" style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--orato-text-secondary)', textDecoration: 'none', padding: '0.5rem 0.875rem' }}>
            Sign In
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started Free</Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          paddingTop: 110,
          paddingBottom: 80,
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
        }}
        className="container"
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '4rem',
          alignItems: 'center',
          width: '100%',
        }}
          className="hero-grid"
        >
          {/* Left: Copy */}
          <div>
            <motion.div {...fadeUp(0.05)}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--orato-surface)',
                border: '1px solid var(--orato-border)',
                borderRadius: 'var(--radius-full)',
                padding: '0.3rem 0.875rem',
                marginBottom: '1.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--orato-text-secondary)',
                boxShadow: 'var(--shadow-card)',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--orato-success)', display: 'inline-block' }} />
                Trusted by 2,400+ candidates
              </div>
            </motion.div>

            <motion.h1
              {...fadeUp(0.12)}
              style={{
                fontSize: 'clamp(2.4rem, 5vw, 3.75rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem',
                fontWeight: 800,
              }}
            >
              Practice Interviews{' '}
              <span style={{ color: 'var(--orato-highlight)' }}>That Feel Real</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.2)}
              style={{
                fontSize: '1.1rem',
                maxWidth: 500,
                marginBottom: '2.25rem',
                color: 'var(--orato-text-secondary)',
                lineHeight: 1.75,
              }}
            >
              ORATO builds personalized interview sessions from your resume and target role. Get detailed feedback on every answer, track your progress, and walk into interviews prepared.
            </motion.p>

            <motion.div {...fadeUp(0.28)} style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <Link href="/signup">
                <Button size="lg" iconRight={<ArrowRight size={18} />}>Start for Free</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary" icon={<Play size={16} />}>Sign In</Button>
              </Link>
            </motion.div>

            <motion.div {...fadeUp(0.36)} style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              {[
                'No credit card required',
                'Free to get started',
                '6+ interview types',
              ].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--orato-text-secondary)', fontWeight: 500 }}>
                  <Check size={13} color="var(--orato-success)" strokeWidth={2.5} /> {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: Product Preview */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0', alignItems: 'flex-end' }}
          >
            {/* Tab switcher */}
            <div style={{
              display: 'inline-flex',
              background: 'var(--orato-surface)',
              border: '1px solid var(--orato-border)',
              borderRadius: 'var(--radius-full)',
              padding: '0.25rem',
              marginBottom: '1rem',
            }}>
              {(['interview', 'analytics'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActivePreviewTab(tab)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                    background: activePreviewTab === tab ? 'var(--orato-highlight)' : 'transparent',
                    color: activePreviewTab === tab ? '#fff' : 'var(--orato-text-secondary)',
                  }}
                >
                  {tab === 'interview' ? 'Interview' : 'Analytics'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activePreviewTab === 'interview' ? (
                <motion.div key="interview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} style={{ width: '100%' }}>
                  <MockInterviewCard />
                </motion.div>
              ) : (
                <motion.div key="analytics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} style={{ width: '100%' }}>
                  <AnalyticsCard />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <section style={{ background: 'var(--orato-surface)', borderTop: '1px solid var(--orato-border)', borderBottom: '1px solid var(--orato-border)', padding: '1.25rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '2.5rem' }}>
            {[
              { icon: Users, label: '2,400+', sub: 'Candidates prepared' },
              { icon: Award, label: '94%', sub: 'Improved their score' },
              { icon: Mic, label: '18,000+', sub: 'Sessions completed' },
              { icon: Clock, label: '< 30s', sub: 'Session setup time' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--orato-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} color="var(--orato-highlight)" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--orato-text-primary)', lineHeight: 1 }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--orato-text-secondary)', marginTop: 2 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4 }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--orato-highlight)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              How it works
            </div>
            <h2 style={{ marginBottom: '1rem' }}>Interview-ready in three steps</h2>
            <p style={{ maxWidth: 440, margin: '0 auto', fontSize: '1rem' }}>From zero context to a full practice session in under two minutes.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', position: 'relative' }}>
            {STEPS.map(({ step, title, desc, icon: Icon }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.12 }}
              >
                <div className="card" style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                  {/* Step number watermark */}
                  <div style={{
                    position: 'absolute', top: -12, right: 16,
                    fontSize: '5rem', fontWeight: 900, color: 'var(--orato-border)',
                    lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
                  }}>
                    {step}
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: 'var(--orato-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <Icon size={21} color="var(--orato-highlight)" />
                  </div>
                  <h4 style={{ marginBottom: '0.625rem' }}>{title}</h4>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESUME SECTION ── */}
      <section style={{ background: 'var(--orato-surface)', padding: '5rem 0', borderTop: '1px solid var(--orato-border)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '4rem',
            alignItems: 'center',
          }}
            className="two-col-grid"
          >
            {/* Left: Resume card visual */}
            <motion.div
              initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
            >
              <div style={{
                background: 'var(--orato-bg)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--orato-border)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-hover)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(138,106,139,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} color="var(--orato-highlight)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--orato-text-primary)' }}>Arjun_Mehta_Resume.pdf</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--orato-text-secondary)' }}>Uploaded · 2 pages</div>
                  </div>
                  <span className="badge badge-success" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>Analyzed</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--orato-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Detected skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'System Design'].map(s => (
                      <span key={s} className="badge badge-accent" style={{ fontSize: '0.75rem' }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid var(--orato-border)', paddingTop: '0.875rem', marginTop: '0.25rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--orato-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>Resume score</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.75rem', color: 'var(--orato-highlight)', lineHeight: 1 }}>87</div>
                      <div style={{ flex: 1, height: 8, background: 'var(--orato-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: '87%' }}
                          viewport={{ once: true }} transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                          style={{ height: '100%', background: 'var(--orato-highlight)', borderRadius: 'var(--radius-full)' }}
                        />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--orato-text-secondary)' }}>/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Copy */}
            <motion.div
              initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--orato-highlight)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Resume-aware interviews
              </div>
              <h2 style={{ marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                Questions built from<br />your actual experience
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.75rem' }}>
                Upload your resume and ORATO extracts your skills, projects, and work history to generate questions that a real interviewer at your target company would actually ask about your background.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  'Questions reference your specific projects and tech stack',
                  'Difficulty scales to your experience level',
                  'Works with any PDF resume format',
                ].map(point => (
                  <div key={point} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(134,197,163,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <Check size={12} color="var(--orato-success)" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--orato-text-secondary)', lineHeight: 1.5 }}>{point}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{ display: 'inline-block', marginTop: '2rem' }}>
                <Button iconRight={<ChevronRight size={16} />}>Try Resume Upload</Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4 }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--orato-highlight)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Features
            </div>
            <h2 style={{ marginBottom: '1rem' }}>Everything built for serious candidates</h2>
            <p style={{ maxWidth: 480, margin: '0 auto' }}>Not a chatbot. Not a quiz app. A complete interview preparation platform.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className="card" style={{ height: '100%' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: 'var(--orato-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <Icon size={21} color="var(--orato-highlight)" />
                  </div>
                  <h4 style={{ marginBottom: '0.5rem' }}>{title}</h4>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERFORMANCE ANALYTICS ── */}
      <section style={{ background: 'var(--orato-surface)', padding: '5rem 0', borderTop: '1px solid var(--orato-border)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '4rem',
            alignItems: 'center',
          }}
            className="two-col-grid"
          >
            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--orato-highlight)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Performance analytics
              </div>
              <h2 style={{ marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                Know exactly where<br />to improve
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.75rem' }}>
                Track your performance across multiple skill dimensions. See how your scores evolve session-by-session, identify your weakest areas, and follow a personalised improvement roadmap.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  'Score breakdown per question and skill area',
                  'Session-over-session trend charts',
                  'Curated learning resources for every gap',
                ].map(point => (
                  <div key={point} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(134,197,163,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <Check size={12} color="var(--orato-success)" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--orato-text-secondary)', lineHeight: 1.5 }}>{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Analytics card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            >
              <AnalyticsCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section" id="testimonials">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4 }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--orato-highlight)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Testimonials
            </div>
            <h2>Real candidates, real results</h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
            {TESTIMONIALS.map(({ name, role, quote, rating, initials }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.125rem' }}>
                    {Array.from({ length: rating }).map((_, j) => (
                      <Star key={j} size={14} fill="var(--orato-warning)" color="var(--orato-warning)" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.925rem', fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: 1.65, flex: 1 }}>
                    "{quote}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--orato-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--orato-highlight)', flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--orato-text-primary)' }}>{name}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--orato-text-secondary)' }}>{role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ background: 'var(--orato-surface)', padding: '5rem 0', borderTop: '1px solid var(--orato-border)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4 }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--orato-highlight)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              FAQ
            </div>
            <h2>Common questions</h2>
          </motion.div>

          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <FAQItem q={faq.q} a={faq.a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.45 }}
          >
            <div style={{
              maxWidth: 680,
              margin: '0 auto',
              background: 'var(--orato-surface)',
              border: '1px solid var(--orato-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(2.5rem, 5vw, 4rem) 2rem',
              boxShadow: 'var(--shadow-hover)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Subtle accent blob */}
              <div style={{
                position: 'absolute', top: -80, right: -80,
                width: 240, height: 240, borderRadius: '50%',
                background: 'var(--orato-accent-secondary)',
                opacity: 0.18,
                pointerEvents: 'none',
                filter: 'blur(40px)',
              }} />

              <div style={{ position: 'relative' }}>
                <h2 style={{ marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                  Ready to start practicing?
                </h2>
                <p style={{ marginBottom: '2.25rem', maxWidth: 460, margin: '0 auto 2.25rem', fontSize: '1rem' }}>
                  Create your free account, upload your resume, and complete your first practice session in under 15 minutes.
                </p>
                <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/signup">
                    <Button size="lg" iconRight={<ArrowRight size={18} />}>
                      Get Started — It's Free
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="secondary">Sign In</Button>
                  </Link>
                </div>
                <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--orato-text-secondary)' }}>
                  No credit card required · Cancel anytime
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--orato-surface)', borderTop: '1px solid var(--orato-border)', padding: '2.5rem 1.5rem' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--orato-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={13} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--orato-text-primary)', letterSpacing: '-0.02em' }}>ORATO</span>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {['Features', 'How it works', 'FAQ', 'Privacy'].map(link => (
                <a key={link} href="#" style={{ fontSize: '0.875rem', color: 'var(--orato-text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--orato-text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--orato-text-secondary)')}
                >
                  {link}
                </a>
              ))}
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--orato-text-secondary)', margin: 0 }}>
              © 2025 ORATO. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          .two-col-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
        .hidden { display: none; }
        @media (min-width: 768px) {
          .hidden.md\\:flex { display: flex !important; }
          .hidden.md\\:block { display: block !important; }
        }
      `}</style>
    </div>
  );
}
