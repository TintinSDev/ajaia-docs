"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Editor from "@/components/Editor";
import ShareModal from "@/components/ShareModal";
import { ArrowLeft, AlertTriangle } from "lucide-react";

interface DocumentData {
  id: string;
  title: string;
  content: string;
  ownerId: string;
}

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [activeUser, setActiveUser] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const fetchDocument = useCallback(
    async (userId: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/documents/${documentId}`, {
          headers: { "x-user-id": userId },
        });

        if (res.status === 403) {
          throw new Error(
            "Access Denied: You do not have permission to view or edit this document.",
          );
        }
        if (res.status === 404) {
          throw new Error(
            "Document Not Found: The requested document does not exist.",
          );
        }
        if (!res.ok) {
          throw new Error("Failed to load document.");
        }

        const data = await res.json();
        setDoc(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    },
    [documentId],
  );

  useEffect(() => {
    const savedUser = localStorage.getItem("active_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setActiveUser(parsed);
      fetchDocument(parsed.id);
    } else {
      setLoading(false);
      setError("No active user session simulated.");
    }
  }, [fetchDocument]);

  const handleUserChange = (user: { id: string; email: string }) => {
    setActiveUser(user);
    fetchDocument(user.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <Navbar onUserChange={handleUserChange} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Navigation Bar Back Link */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {loading && (
          <div className="text-center py-20 text-gray-500 text-sm">
            Loading document...
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto my-12 p-6 bg-white border border-red-200 rounded-xl shadow-xs text-center">
            <div className="inline-flex p-3 bg-red-50 text-red-600 rounded-full mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 text-base mb-1">
              Access Restricted
            </h3>
            <p className="text-xs text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Return to Workspace
            </button>
          </div>
        )}

        {!loading && !error && doc && activeUser && (
          <Editor
            documentId={doc.id}
            initialTitle={doc.title}
            initialContent={doc.content}
            activeUserId={activeUser.id}
            onShareClick={() => setIsShareModalOpen(true)}
          />
        )}
      </main>

      {/* Share Modal Trigger */}
      {isShareModalOpen && doc && activeUser && (
        <ShareModal
          documentId={doc.id}
          activeUserId={activeUser.id}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
}
