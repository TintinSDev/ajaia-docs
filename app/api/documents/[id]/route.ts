import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// Helper to verify user access permission
async function checkAccess(documentId: string, userId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { shares: true },
  });

  if (!doc) return { doc: null, hasAccess: false };

  const isOwner = doc.ownerId === userId;
  const isShared = doc.shares.some((share) => share.userId === userId);

  return { doc, hasAccess: isOwner || isShared, isOwner };
}

// GET /api/documents/[id] - Fetch single document
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = request.headers.get("x-user-id"); // or your session check

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { doc, hasAccess } = await checkAccess(id, userId);

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(doc);
}

// PATCH /api/documents/[id] - Auto-save title and content
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { doc, hasAccess } = await checkAccess(id, userId);

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, content } = await request.json();

  const updatedDoc = await prisma.document.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
    },
  });

  return NextResponse.json(updatedDoc);
}
