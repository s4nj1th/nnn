import { NextRequest, NextResponse } from 'next/server';
import { EXAMPLE_TEMPLATES } from '@/lib/templates';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const difficulty = searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'advanced' | null;

  if (id) {
    const template = EXAMPLE_TEMPLATES.find((t) => t.id === id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ data: template });
  }

  let templates = EXAMPLE_TEMPLATES;
  if (difficulty) {
    templates = templates.filter((t) => t.difficulty === difficulty);
  }

  // Strip canvasState from list view for performance
  const listed = templates.map(({ canvasState: _, ...rest }) => rest);
  return NextResponse.json({ data: listed, count: listed.length });
}
