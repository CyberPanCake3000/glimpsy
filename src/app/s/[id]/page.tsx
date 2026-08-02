import Canvas from '@/components/Canvas';
import type { SharedSchema } from '@/types/sharedSchema';

type Props = { params: { id: string } };

async function loadSchema(id: string): Promise<SharedSchema | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/schemas/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function SharedSchemaPage({ params }: Props) {
  const schema = await loadSchema(params.id);

  if (!schema) {
    return <div className="p-4">Schema not found</div>;
  }

  return <Canvas initialSchema={schema} />;
}