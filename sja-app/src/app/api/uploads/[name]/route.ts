import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { UPLOADS_DIR } from "@/lib/db";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  // Kun enkle filnavn — hindrer path traversal.
  if (!/^[\w-]+\.[a-z]+$/i.test(name)) {
    return NextResponse.json({ error: "Ugyldig filnavn." }, { status: 400 });
  }
  const ext = name.split(".").pop()!.toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return NextResponse.json({ error: "Ugyldig filtype." }, { status: 400 });
  }
  try {
    const data = await fs.readFile(path.join(UPLOADS_DIR, name));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Ikke funnet." }, { status: 404 });
  }
}
