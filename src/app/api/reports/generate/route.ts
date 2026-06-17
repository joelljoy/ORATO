import { NextRequest, NextResponse } from 'next/server';
import { getInterview, getReportByInterview, saveReport } from '@/lib/firebase/firestore';
import { generateReport } from '@/lib/gemini/client';
import { Report } from '@/types/report';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId, userId } = body;

    if (!interviewId || !userId) {
      return NextResponse.json({ error: 'Missing interviewId or userId' }, { status: 400 });
    }

    // Check if report already exists for this interview
    const existingReport = await getReportByInterview(interviewId);
    if (existingReport) {
      return NextResponse.json({ success: true, report: existingReport });
    }

    // Load interview
    const interview = await getInterview(interviewId);
    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    if (interview.status !== 'completed') {
      return NextResponse.json({ error: 'Interview is not completed yet' }, { status: 400 });
    }

    const overallScore = interview.overallScore || 50;

    // Call Gemini API to generate the summary report
    const geminiResult = await generateReport({
      role: interview.role,
      type: interview.type,
      questions: interview.questions.map(q => ({ text: q.text, type: q.type })),
      answers: interview.answers.map(a => ({ text: a.text, score: a.score })),
      overallScore,
    });

    // Compute breakdown averages from evaluated answers
    const evaluatedAnswers = interview.answers.filter(a => a.isEvaluated && a.feedback);
    
    const getAvg = (field: 'technicalAccuracy' | 'communication' | 'clarity' | 'completeness' | 'depth') => {
      if (evaluatedAnswers.length === 0) return overallScore;
      const sum = evaluatedAnswers.reduce((acc, curr) => acc + (curr.feedback?.[field] || overallScore), 0);
      return Math.round(sum / evaluatedAnswers.length);
    };

    const technicalAccuracy = getAvg('technicalAccuracy');
    const communication = getAvg('communication');
    const clarity = getAvg('clarity');
    const completeness = getAvg('completeness');
    const depth = getAvg('depth');

    const breakdown = {
      technicalAccuracy,
      communication,
      clarity,
      confidence: Math.round((communication + clarity) / 2),
      completeness,
      depth,
      problemSolving: Math.round((technicalAccuracy + depth) / 2),
    };

    // Calculate sub-scores
    const technicalScore = technicalAccuracy;
    const communicationScore = communication;
    const behavioralScore = Math.round((communication + clarity + completeness) / 3);

    // Create Report Object
    const reportData: Omit<Report, 'id'> = {
      interviewId,
      userId,
      generatedAt: new Date().toISOString(),
      overallScore,
      breakdown,
      skillAnalysis: geminiResult.skillAnalysis || {},
      questionBreakdown: interview.answers.map((a, i) => ({
        questionId: a.questionId,
        questionText: interview.questions[i]?.text || '',
        questionType: interview.questions[i]?.type || 'technical',
        score: a.score || 0,
        maxScore: 100,
        feedback: a.feedback?.suggestions?.[0] || 'Good try. Keep practicing.',
      })),
      improvementRoadmap: (geminiResult.improvementRoadmap || []).map(item => ({
        area: item.area || 'General',
        priority: ['high', 'medium', 'low'].includes(item.priority)
          ? item.priority as 'high' | 'medium' | 'low'
          : 'medium',
        suggestion: item.suggestion || '',
        estimatedTime: item.estimatedTime || 'N/A',
      })),
      learningResources: (geminiResult.learningResources || []).map(r => ({
        title: r.title || 'Resource',
        url: r.url || '#',
        type: ['article', 'video', 'course', 'documentation'].includes(r.type)
          ? r.type as 'article' | 'video' | 'course' | 'documentation'
          : 'article',
        topic: r.topic || 'General',
      })),
      communicationScore,
      technicalScore,
      behavioralScore,
      strengths: geminiResult.strengths || [],
      weaknesses: geminiResult.weaknesses || [],
    };

    // Save report to firestore
    const reportId = await saveReport(userId, reportData);

    return NextResponse.json({
      success: true,
      reportId,
      report: { id: reportId, ...reportData }
    });
  } catch (error: any) {
    console.error('Report generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Report generation failed: ${message}` },
      { status: 500 }
    );
  }
}
