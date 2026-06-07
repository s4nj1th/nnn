import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createProjectSchema = z.object({
  title: z.string().min(1).max(100).default('Untitled Project'),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1');
  const perPage = parseInt(searchParams.get('perPage') ?? '20');

  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data ?? [],
    count: count ?? 0,
    page,
    perPage,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      is_public: parsed.data.isPublic,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create empty canvas data
  await supabase.from('project_data').insert({
    project_id: project.id,
    canvas_state: {
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      settings: { gridVisible: true, snapToGrid: false, gridSize: 24, showMinimap: true, showControls: true, animationsEnabled: true },
      simulation: { inputValues: {}, stepMode: false, autoRun: false, speed: 1, currentStep: 0 },
      layers: [],
    },
  });

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: session.user.id,
    project_id: project.id,
    action: 'project.created',
  });

  return NextResponse.json({ data: project }, { status: 201 });
}
