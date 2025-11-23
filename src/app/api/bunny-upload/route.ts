import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const folder = (form.get('folder') as string) || 'lessons';

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const BUNNY_API_BASE = process.env.BUNNY_API_BASE || process.env.NEXT_PUBLIC_BUNNY_API_URL || 'https://api.bunny.net';
    const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || process.env.NEXT_PUBLIC_BUNNY_STORAGE_ZONE || '';
    const BUNNY_API_KEY = process.env.BUNNY_API_KEY || process.env.NEXT_PUBLIC_BUNNY_API_KEY || '';
    const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL || process.env.NEXT_PUBLIC_BUNNY_CDN_URL || '';

    if (!BUNNY_STORAGE_ZONE || !BUNNY_API_KEY) {
      return NextResponse.json({ error: 'Server Bunny.net configuration is missing' }, { status: 500 });
    }

    // Generar nombre único
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${randomId}-${file.name || 'upload'}`;
    const path = `${folder}/${fileName}`;

    // Metadata
    const size = typeof (file as File).size === 'number' ? (file as File).size : undefined;
    const contentType = (file as File).type || 'application/octet-stream';

    // Preparar body: preferir stream si está disponible (no cargar todo en memoria para videos grandes)
    let body: unknown;

    if (typeof (file as any).stream === 'function') {
      // Web File stream
      body = (file as any).stream();
    } else if (typeof (file as any).arrayBuffer === 'function') {
      const ab = await (file as any).arrayBuffer();
      body = Buffer.from(ab);
    } else {
      // Fallback: leer como texto (para tipos pequeños) o usar el objeto tal cual
      try {
        body = await file.text();
      } catch {
        body = file;
      }
    }

    // Construir headers y añadir Content-Type y Content-Length si están disponibles
    const headers: Record<string, string> = {
      AccessKey: BUNNY_API_KEY,
      'Content-Type': contentType,
    };

    if (typeof size === 'number') {
      headers['Content-Length'] = String(size);
    }

    const uploadRes = await fetch(`${BUNNY_API_BASE}/v3/b/${BUNNY_STORAGE_ZONE}/${path}`, {
      method: 'PUT',
      headers,
      body: body as any,
    });

    if (!uploadRes.ok) {
      const txt = await uploadRes.text();
      return NextResponse.json({ error: `Bunny error: ${uploadRes.status} - ${txt}` }, { status: 500 });
    }

    const cdnUrl = BUNNY_CDN_URL ? `${BUNNY_CDN_URL}/${path}` : `${BUNNY_API_BASE}/v3/b/${BUNNY_STORAGE_ZONE}/${path}`;

    return NextResponse.json({ url: cdnUrl, fileName: file.name, fileSize: (file as File).size, fileType: (file as File).type });
  } catch (err) {
    console.error('Proxy upload error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
