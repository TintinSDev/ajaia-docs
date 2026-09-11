"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, User } from "lucide-react";

interface SeedUser {
  id: string;
  email: string;
  name: string;
}

// Default fallback users matching the Prisma seed script
const SEED_USERS: SeedUser[] = [
  {
    id: "cmtxerbqg0000jkt7jk6kvyx2",
    email: "alice@ajaia.com",
    name: "Alice (Owner)",
  },
  {
    id: "cmtxerbql0001jkt7v3wxezfa",
    email: "bob@ajaia.com",
    name: "Bob (Collaborator)",
  },
];

export default function Navbar({
  onUserChange,
}: {
  onUserChange?: (user: SeedUser) => void;
}) {
  const [activeUser, setActiveUser] = useState<SeedUser>(SEED_USERS[0]);

  useEffect(() => {
    // Sync active user state from localStorage on load
    const saved = localStorage.getItem("active_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveUser(parsed);
        if (onUserChange) onUserChange(parsed);
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    } else {
      localStorage.setItem("active_user", JSON.stringify(SEED_USERS[0]));
    }
  }, []);

  const handleSelectUser = (email: string) => {
    const selected = SEED_USERS.find((u) => u.email === email) || SEED_USERS[0];
    setActiveUser(selected);
    localStorage.setItem("active_user", JSON.stringify(selected));
    if (onUserChange) onUserChange(selected);
    window.location.reload(); // Hard reload to refresh document lists per active identity
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-gray-900 text-lg"
        >
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <FileText className="w-5 h-5" />
          </div>
          <span>Ajaia Docs</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">
              Simulate Identity:
            </span>
            <select
              value={activeUser.email}
              onChange={(e) => handleSelectUser(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-800 outline-none cursor-pointer"
            >
              {SEED_USERS.map((user) => (
                <option key={user.email} value={user.email}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
