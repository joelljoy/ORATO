import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, role, difficulty } = body;

    if (!question || !answer || !role || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (answer.trim().length < 10) {
      return NextResponse.json({ error: 'Answer is too short to evaluate' }, { status: 400 });
    }

    const { evaluateAnswer } = await import('@/lib/gemini/client');
    const feedback = await evaluateAnswer({ question, answer, role, difficulty });

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error('Answer evaluation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Answer evaluation failed: ${message}` },
      { status: 500 }
    );
  }
}
