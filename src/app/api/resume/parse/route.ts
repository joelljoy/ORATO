import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use pdf-parse to extract text
    let resumeText = '';
    let parser: any = null;
    try {
      await import('pdf-parse/worker');
      const { PDFParse } = await import('pdf-parse');
      parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      resumeText = result.text;
    } catch (parseError: any) {
      console.error('PDF parsing error:', parseError);
      return NextResponse.json({
        error: `Failed to extract text from PDF: ${parseError.message || parseError}`
      }, { status: 422 });
    } finally {
      if (parser) {
        try {
          await parser.destroy();
        } catch (destroyError) {
          console.error('Failed to destroy PDFParse instance:', destroyError);
        }
      }
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({ error: 'Could not extract text from PDF. Try a text-based PDF.' }, { status: 422 });
    }

    // Use Gemini to analyze the resume
    const { analyzeResume } = await import('@/lib/gemini/client');
    const analysis = await analyzeResume(resumeText);

    return NextResponse.json({
      success: true,
      rawText: resumeText.slice(0, 500), // Preview only
      ...analysis,
    });
  } catch (error: any) {
    console.error('Resume parse error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Resume parsing failed: ${message}` },
      { status: 500 }
    );
  }
}
