import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, type, difficulty, resumeText, count = 8 } = body;

    if (!role || !type || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields: role, type, difficulty' }, { status: 400 });
    }

    const { generateQuestions } = await import('@/lib/gemini/client');
    const questions = await generateQuestions({ role, type, difficulty, resumeText, count });

    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error('Question generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Question generation failed: ${message}` },
      { status: 500 }
    );
  }
}
