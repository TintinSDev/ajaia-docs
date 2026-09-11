import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "@/app/api/documents/[id]/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Mock Prisma client
vi.mock("@/lib/prisma", () => ({
  prisma: {
    document: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("Document Access Control API", () => {
  const mockDocId = "doc-123";
  const ownerUserId = "user-owner";
  const unauthorizedUserId = "user-unauthorized";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 Unauthorized if x-user-id header is missing", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/documents/${mockDocId}`,
    );
    const res = await GET(req, { params: Promise.resolve({ id: mockDocId }) });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 403 Forbidden when an unshared user requests a document", async () => {
    // Mock document owned by ownerUserId with no active shares
    (prisma.document.findUnique as any).mockResolvedValue({
      id: mockDocId,
      ownerId: ownerUserId,
      shares: [],
    });

    const req = new NextRequest(
      `http://localhost:3000/api/documents/${mockDocId}`,
      {
        headers: { "x-user-id": unauthorizedUserId },
      },
    );

    const res = await GET(req, { params: Promise.resolve({ id: mockDocId }) });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe("Forbidden: Access denied");
  });

  it("should return 200 OK when the owner requests their document", async () => {
    const mockDoc = {
      id: mockDocId,
      title: "Test Doc",
      content: "<p>Hello</p>",
      ownerId: ownerUserId,
      shares: [],
    };

    (prisma.document.findUnique as any).mockResolvedValue(mockDoc);

    const req = new NextRequest(
      `http://localhost:3000/api/documents/${mockDocId}`,
      {
        headers: { "x-user-id": ownerUserId },
      },
    );

    const res = await GET(req, { params: Promise.resolve({ id: mockDocId }) });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe("Test Doc");
  });

  it("should return 403 Forbidden when an unauthorized user attempts to PATCH document", async () => {
    (prisma.document.findUnique as any).mockResolvedValue({
      id: mockDocId,
      ownerId: ownerUserId,
      shares: [],
    });

    const req = new NextRequest(
      `http://localhost:3000/api/documents/${mockDocId}`,
      {
        method: "PATCH",
        headers: {
          "x-user-id": unauthorizedUserId,
          "content-type": "application/json",
        },
        body: JSON.stringify({ title: "Hacked Title" }),
      },
    );

    const res = await PATCH(req, {
      params: Promise.resolve({ id: mockDocId }),
    });

    expect(res.status).toBe(403);
    expect(prisma.document.update).not.toHaveBeenCalled();
  });
});
