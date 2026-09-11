import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Helper to extract simulated User ID from request headers
function getUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// GET /api/documents - List owned and shared documents for current user
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const documents = await prisma.document.findMany({
      where: {
        OR: [{ ownerId: userId }, { shares: { some: { userId } } }],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        shares: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}

// POST /api/documents - Create a new document
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { title = "Untitled Document", content = "" } = body;

    const document = await prisma.document.create({
      data: {
        title,
        content,
        ownerId: userId,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/documents Error:", error);
    return NextResponse.json(
      { error: "Failed to create document", details: error?.message },
      { status: 500 },
    );
  }
}
