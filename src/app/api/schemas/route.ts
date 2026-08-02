import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import SharedSchemaModel from '@/models/SharedSchemaModel';
import type { SharedSchema } from '@/types/sharedSchema';
import { isSchemaEmpty } from '@/lib/serializeSchema';

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as SharedSchema;

        if (!body?.nodes?.length || body.version !== 1) {
            return NextResponse.json({ error: 'Invalid schema' }, { status: 400 });
        }

        if (isSchemaEmpty(body)) {
            return NextResponse.json(
                { error: 'Cannot share an empty schema. Add at least one block.' },
                { status: 400 },
            );
        }

        await connectMongo();
        const doc = await SharedSchemaModel.create({ payload: body });

        return NextResponse.json({ id: doc._id.toString() });
    } catch (error) {
        console.error('POST /api/schemas error:', error);
        return NextResponse.json({ error: 'Failed to save schema' }, { status: 500 });
    }
}