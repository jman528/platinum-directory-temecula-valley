"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Link as LinkIcon, ImageIcon, Youtube as YTIcon, Undo, Redo,
} from "lucide-react";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ width: 640, height: 360 }),
      Placeholder.configure({ placeholder: "Describe this business..." }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none focus:outline-none min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 text-gray-200",
      },
    },
  });

  if (!editor) return null;

  function addLink() {
    const url = window.prompt("Enter URL:");
    if (!url) return;
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function addImage() {
    const url = window.prompt("Enter image URL:");
    if (!url) return;
    editor!.chain().focus().setImage({ src: url }).run();
  }

  function addYoutube() {
    const url = window.prompt("Enter YouTube URL:");
    if (!url) return;
    editor!.commands.setYoutubeVideo({ src: url });
  }

  const btn = (active: boolean) =>
    `rounded p-1.5 transition-colors ${
      active
        ? "bg-pd-gold/20 text-pd-gold"
        : "text-gray-400 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 bg-white/[0.03] px-2 py-1.5">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} title="Bold">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} title="Italic">
          <Italic className="h-4 w-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-white/10" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-white/10" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} title="Bullet List">
          <List className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} title="Ordered List">
          <ListOrdered className="h-4 w-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-white/10" />
        <button type="button" onClick={addLink} className={btn(editor.isActive("link"))} title="Add Link">
          <LinkIcon className="h-4 w-4" />
        </button>
        <button type="button" onClick={addImage} className={btn(false)} title="Add Image">
          <ImageIcon className="h-4 w-4" />
        </button>
        <button type="button" onClick={addYoutube} className={btn(false)} title="Add YouTube Video">
          <YTIcon className="h-4 w-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-white/10" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`${btn(false)} disabled:opacity-30`} title="Undo">
          <Undo className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`${btn(false)} disabled:opacity-30`} title="Redo">
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
