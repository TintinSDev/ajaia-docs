"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ShareModal from "@/components/ShareModal";
import { Plus, FileText, Share2, Clock, UserCheck, Users } from "lucide-react";

interface DocumentItem {
  id: string;
  title: string;
  updatedAt: string;
  ownerId: string;
  owner: { id: string; name: string; email: string };
  shares: { user: { id: string; name: string; email: string } }[];
}

export default function Dashboard() {
  const router = useRouter();
  const [activeUser, setActiveUser] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedShareDocId, setSelectedShareDocId] = useState<string | null>(
    null,
  );

  // Fetch documents for the selected user
  const fetchDocuments = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents", {
        headers: { "x-user-id": userId },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("active_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setActiveUser(parsed);
      fetchDocuments(parsed.id);
    }
  }, [fetchDocuments]);

  const handleUserChange = (user: { id: string; email: string }) => {
    setActiveUser(user);
    fetchDocuments(user.id);
  };

  const handleCreateDocument = async () => {
    if (!activeUser) return;
    setCreating(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUser.id,
        },
        body: JSON.stringify({ title: "Untitled Document", content: "" }),
      });

      if (res.ok) {
        const newDoc = await res.json();
        router.push(`/documents/${newDoc.id}`);
      }
    } catch (error) {
      console.error("Failed to create document", error);
    } finally {
      setCreating(false);
    }
  };

  const myDocuments = documents.filter((doc) => doc.ownerId === activeUser?.id);
  const sharedDocuments = documents.filter(
    (doc) => doc.ownerId !== activeUser?.id,
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar onUserChange={handleUserChange} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Action Banner */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Documents
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your personal drafts and team collaborative files.
            </p>
          </div>
          <button
            onClick={handleCreateDocument}
            disabled={creating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{creating ? "Creating..." : "New Document"}</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 text-sm">
            Loading workspace...
          </div>
        ) : (
          <div className="space-y-10">
            {/* Section 1: My Documents */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-4 h-4 text-gray-600" />
                <h2 className="text-base font-semibold text-gray-800">
                  My Documents
                </h2>
                <span className="text-xs bg-gray-200 text-gray-700 font-medium px-2 py-0.5 rounded-full">
                  {myDocuments.length}
                </span>
              </div>

              {myDocuments.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-300 rounded-xl bg-white text-center">
                  <p className="text-sm text-gray-500">
                    No documents created yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="group bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all rounded-xl p-5 flex flex-col justify-between"
                    >
                      <Link
                        href={`/documents/${doc.id}`}
                        className="block flex-1"
                      >
                        <div className="flex items-start justify-between">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-200">
                            Owner
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mt-4 line-clamp-1 group-hover:text-blue-600">
                          {doc.title || "Untitled Document"}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(doc.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>{doc.shares.length} Shared</span>
                        <button
                          onClick={() => setSelectedShareDocId(doc.id)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 2: Shared With Me */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-gray-600" />
                <h2 className="text-base font-semibold text-gray-800">
                  Shared with Me
                </h2>
                <span className="text-xs bg-gray-200 text-gray-700 font-medium px-2 py-0.5 rounded-full">
                  {sharedDocuments.length}
                </span>
              </div>

              {sharedDocuments.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-300 rounded-xl bg-white text-center">
                  <p className="text-sm text-gray-500">
                    No documents shared with you yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sharedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="group bg-white border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all rounded-xl p-5 flex flex-col justify-between"
                    >
                      <Link
                        href={`/documents/${doc.id}`}
                        className="block flex-1"
                      >
                        <div className="flex items-start justify-between">
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold px-2 py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                            Shared
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mt-4 line-clamp-1 group-hover:text-purple-600">
                          {doc.title || "Untitled Document"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Owner: {doc.owner.name}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Share Modal Dialog */}
      {selectedShareDocId && activeUser && (
        <ShareModal
          documentId={selectedShareDocId}
          activeUserId={activeUser.id}
          onClose={() => {
            setSelectedShareDocId(null);
            fetchDocuments(activeUser.id);
          }}
        />
      )}
    </div>
  );
}
