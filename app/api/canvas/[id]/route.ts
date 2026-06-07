import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const canvasStateSchema = z.object({
  nodes: z.array(z.unknown()),
  edges: z.array(z.unknown()),
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number(),
  }),
  settings: z.object({
    gridVisible: z.boolean(),
    snapToGrid: z.boolean(),
    gridSize: z.number(),
    showMinimap: z.boolean(),
    showControls: z.boolean(),
    animationsEnabled: z.boolean(),
  }),
  simulation: z.object({
    inputValues: z.record(z.string(), z.number()),
    stepMode: z.boolean(),
    autoRun: z.boolean(),
    speed: z.number(),
    currentStep: z.number(),
  }),
  layers: z.array(z.unknown()),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Check project access
  const { data: project } = await supabase
    .from('projects')
    .select('user_id, is_public')
    .eq('id', id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (!project.is_public && session?.user.id !== project.user_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('project_data')
    .select('canvas_state, updated_at')
    .eq('project_id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Canvas data not found' }, { status: 404 });
  }

  return NextResponse.json({ data: data.canvas_state, updatedAt: data.updated_at });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!project || project.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body: unknown = await request.json();
  const parsed = canvasStateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { error } = await supabase
    .from('project_data')
    .upsert({
      project_id: id,
      canvas_state: parsed.data,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update project timestamp
  await supabase
    .from('projects')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id);

  return NextResponse.json({ message: 'Canvas saved' });
}
