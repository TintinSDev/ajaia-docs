"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Upload,
  CheckCircle,
  Loader2,
  Share2,
  Download,
  Copy,
  Check,
} from "lucide-react";

interface EditorProps {
  documentId: string;
  initialTitle: string;
  initialContent: string;
  activeUserId: string;
  onShareClick?: () => void;
}

export default function Editor({
  documentId,
  initialTitle,
  initialContent,
  activeUserId,
  onShareClick,
}: EditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">(
    "saved",
  );
  const [copied, setCopied] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Core API Auto-Save handler
  const saveDocument = useCallback(
    async (updatedTitle: string, updatedContent: string) => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": activeUserId,
          },
          body: JSON.stringify({
            title: updatedTitle,
            content: updatedContent,
          }),
        });

        if (!res.ok) throw new Error("Failed to save");
        setSaveStatus("saved");
      } catch (err) {
        console.error("Autosave error:", err);
        setSaveStatus("error");
      }
    },
    [documentId, activeUserId],
  );

  // Debounced trigger for content / title changes
  const triggerAutoSave = useCallback(
    (newTitle: string, newContent: string) => {
      setSaveStatus("saving");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        saveDocument(newTitle, newContent);
      }, 1000);
    },
    [saveDocument],
  );

  // Initialize Tiptap Editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline],
    content: initialContent || "",
    onUpdate: ({ editor }) => {
      triggerAutoSave(title, editor.getHTML());
    },
  });

  // Keep editor content synchronized if initialContent updates externally
  useEffect(() => {
    if (editor && initialContent !== undefined && !editor.isFocused) {
      const currentHTML = editor.getHTML();
      if (currentHTML !== initialContent) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [initialContent, editor]);

  // Handle Title Change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (editor) {
      triggerAutoSave(newTitle, editor.getHTML());
    }
  };

  // Handle File Upload (.txt or .md)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        editor.commands.setContent(text);
        triggerAutoSave(title, text);
      }
    };
    reader.readAsText(file);
  };

  // Export Document Content to File
  const handleExport = (format: "txt" | "md") => {
    if (!editor) return;
    const textContent = editor.getText();
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, "-") || "document"}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy Direct Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!editor) {
    return (
      <div className="p-8 text-center text-gray-500">Loading Editor...</div>
    );
  }

  // Live Stats
  const text = editor.getText();
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="max-w-4xl mx-auto my-6 bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
      {/* Top Header & Save Indicator */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Document"
          className="text-xl font-bold bg-transparent border-none outline-none focus:ring-0 text-gray-800 w-full mr-4"
        />

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center text-xs text-gray-500 gap-1.5 min-w-[80px]">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span>Saved</span>
              </>
            )}
            {saveStatus === "error" && (
              <span className="text-red-500 font-medium">Save error</span>
            )}
          </div>

          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 shadow-xs">
            <Upload className="w-3.5 h-3.5 text-gray-500" />
            <span>Import</span>
            <input
              type="file"
              accept=".txt,.md"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {onShareClick && (
            <button
              onClick={onShareClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar Controls & Quick Actions */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50 overflow-x-auto gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive("bold") ? "bg-gray-200 font-bold" : ""
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4 text-gray-700" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive("italic") ? "bg-gray-200" : ""
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4 text-gray-700" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive("underline") ? "bg-gray-200" : ""
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4 text-gray-700" />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4 text-gray-700" />
          </button>

          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4 text-gray-700" />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive("bulletList") ? "bg-gray-200" : ""
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4 text-gray-700" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive("orderedList") ? "bg-gray-200" : ""
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4 text-gray-700" />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Export Actions */}
          <button
            onClick={() => handleExport("txt")}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded border border-gray-300 bg-white"
            title="Export as plain text"
          >
            <Download className="w-3 h-3" />
            <span>.txt</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded border border-gray-300 bg-white"
            title="Copy document link"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>{copied ? "Copied" : "Link"}</span>
          </button>
        </div>

        {/* Word & Character Counter */}
        <div className="text-xs text-gray-400 whitespace-nowrap">
          {wordCount} words | {charCount} chars
        </div>
      </div>

      {/* Editable Area */}
      <div className="p-6 min-h-[400px] prose max-w-none focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
