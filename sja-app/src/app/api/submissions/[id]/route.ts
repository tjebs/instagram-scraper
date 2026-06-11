import { NextRequest, NextResponse } from "next/server";
import { getSubmission } from "@/lib/repository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return NextResponse.json({ error: "Ugyldig id." }, { status: 400 });
  }
  const submission = getSubmission(numId);
  if (!submission) {
    return NextResponse.json({ error: "Ikke funnet." }, { status: 404 });
  }
  return NextResponse.json(submission);
}
