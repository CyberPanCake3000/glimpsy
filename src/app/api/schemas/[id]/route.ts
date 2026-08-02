import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import SharedSchemaModel from '@/models/SharedSchemaModel';
import type { SharedSchema } from '@/types/sharedSchema';

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  try {
    await connectMongo();
    const doc = await SharedSchemaModel.findById(params.id).lean<{ payload: SharedSchema }>();

    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(doc.payload);
  } catch (error) {
    console.error('GET /api/schemas/[id] error:', error);
    return NextResponse.json({ error: 'Failed to load schema' }, { status: 500 });
  }
}