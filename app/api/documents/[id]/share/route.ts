import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Unwrap params asynchronously
    const { id: documentId } = await params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 3. Ensure document exists and current user owns it
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    if (document.ownerId !== userId) {
      return NextResponse.json(
        { error: "Only the owner can share" },
        { status: 403 },
      );
    }

    // 4. Find recipient user by email
    const recipient = await prisma.user.findUnique({
      where: { email },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "User with this email does not exist" },
        { status: 404 },
      );
    }

    // 5. Prevent sharing with self
    if (recipient.id === userId) {
      return NextResponse.json(
        { error: "Cannot share document with yourself" },
        { status: 400 },
      );
    }

    // 6. Create or update share record
    const share = await prisma.docShare.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId: recipient.id,
        },
      },
      update: {},
      create: {
        documentId,
        userId: recipient.id,
      },
    });

    return NextResponse.json(share, { status: 200 });
  } catch (error) {
    console.error("Error sharing document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
