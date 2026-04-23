"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { useEffect, useState, useCallback } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Link as LinkIcon,
  Image as ImageIcon, Undo, Redo, Minus, Type, Highlighter,
  Subscript as SubIcon, Superscript as SuperIcon, RemoveFormatting,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** A small pressable toolbar button with tooltip */
const ToolBtn = ({
  onClick, active = false, disabled = false, tooltip, children,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean;
  tooltip: string; children: React.ReactNode;
}) => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onClick(); }}
          disabled={disabled}
          className={`
            inline-flex items-center justify-center w-8 h-8 rounded-md text-sm
            transition-all duration-100 flex-shrink-0
            ${active ? "bg-blue-100 text-blue-700 shadow-inner border border-blue-200" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
            ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs py-1 px-2">{tooltip}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const Sep = () => <div className="w-px h-5 bg-slate-200 mx-0.5 flex-shrink-0" />;

export default function RichTextEditor({ value, onChange, placeholder = "Start writing your blog post…" }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: { class: "rounded-lg max-w-full my-4 mx-auto block shadow-md" },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
    ],
    content: value || "",
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: { class: "focus:outline-none min-h-[480px]" },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl.trim()) {
      const href = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().setLink({ href }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkUrl("");
    setLinkOpen(false);
  }, [editor, linkUrl]);

  const insertImage = useCallback(() => {
    if (!editor || !imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setImgOpen(false);
  }, [editor, imageUrl]);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    setUploadingImage(true);
    try {
      const secureUrl = await uploadImageToCloudinary(file);
      editor.chain().focus().setImage({ src: secureUrl }).run();
      setImgOpen(false);
    } catch (error) {
      console.error("Rich text image upload failed:", error);
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }, [editor]);

  if (!editor) return null;

  const words = editor.storage.characterCount?.words?.() ?? 0;
  const chars = editor.storage.characterCount?.characters?.() ?? 0;

  // ── Highlight colours ──────────────────────────────────────────────────────
  const hlColors = ["#fef08a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff","#fed7aa","#f9a8d4","#a5f3fc","#d1d5db"];
  const txtColors = ["#1e293b","#dc2626","#16a34a","#2563eb","#9333ea","#ea580c","#0891b2","#be185d","#ca8a04"];

  return (
    <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="bg-slate-50 border-b border-slate-200 px-2 py-1.5 flex flex-wrap items-center gap-0.5">

        {/* History */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} tooltip="Undo (Ctrl+Z)"><Undo className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} tooltip="Redo (Ctrl+Y)"><Redo className="w-3.5 h-3.5" /></ToolBtn>

        <Sep />

        {/* Paragraph style dropdown */}
        <Popover>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button type="button" className="flex items-center gap-1 px-2 h-8 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer transition-all">
                    <Type className="w-3.5 h-3.5" />
                    {editor.isActive("heading", { level: 1 }) ? "H1"
                      : editor.isActive("heading", { level: 2 }) ? "H2"
                        : editor.isActive("heading", { level: 3 }) ? "H3"
                          : editor.isActive("heading", { level: 4 }) ? "H4"
                            : "Para"}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Paragraph Style</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="w-40 p-1" align="start">
            {[
              { label: "Paragraph", fn: () => editor.chain().focus().setParagraph().run(), active: editor.isActive("paragraph"), cls: "text-sm" },
              { label: "Heading 1", fn: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }), cls: "text-xl font-bold" },
              { label: "Heading 2", fn: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), cls: "text-lg font-semibold" },
              { label: "Heading 3", fn: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }), cls: "text-base font-semibold" },
              { label: "Heading 4", fn: () => editor.chain().focus().toggleHeading({ level: 4 }).run(), active: editor.isActive("heading", { level: 4 }), cls: "text-sm font-semibold" },
            ].map(({ label, fn, active, cls }) => (
              <button key={label} type="button" onMouseDown={(e) => { e.preventDefault(); fn(); }}
                className={`w-full text-left px-3 py-1.5 rounded ${cls} ${active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"}`}
              >{label}</button>
            ))}
          </PopoverContent>
        </Popover>

        <Sep />

        {/* Text style */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} tooltip="Bold (Ctrl+B)"><Bold className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} tooltip="Italic (Ctrl+I)"><Italic className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} tooltip="Underline (Ctrl+U)"><UnderlineIcon className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} tooltip="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} tooltip="Subscript"><SubIcon className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} tooltip="Superscript"><SuperIcon className="w-3.5 h-3.5" /></ToolBtn>

        <Sep />

        {/* Highlight */}
        <Popover>
          <TooltipProvider delayDuration={300}><Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button type="button" className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-all ${editor.isActive("highlight") ? "bg-yellow-100 text-yellow-700" : "text-slate-600 hover:bg-slate-100"}`}>
                  <Highlighter className="w-3.5 h-3.5" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Highlight</TooltipContent>
          </Tooltip></TooltipProvider>
          <PopoverContent className="w-36 p-2" align="start">
            <p className="text-xs text-slate-500 mb-2">Highlight colour</p>
            <div className="grid grid-cols-5 gap-1">
              {hlColors.map(c => (
                <button key={c} type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setHighlight({ color: c }).run(); }}
                  className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform" style={{ background: c }} />
              ))}
              <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); }}
                title="Remove" className="w-6 h-6 rounded border border-slate-200 text-red-400 text-xs flex items-center justify-center hover:bg-red-50">✕</button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Text colour */}
        <Popover>
          <TooltipProvider delayDuration={300}><Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button type="button" className="inline-flex flex-col items-center justify-center w-8 h-8 rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer transition-all">
                  <span className="text-xs font-bold leading-none">A</span>
                  <div className="w-4 h-1 rounded-sm mt-0.5" style={{ backgroundColor: (editor.getAttributes("textStyle") as { color?: string }).color || "#1e293b" }} />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Text Colour</TooltipContent>
          </Tooltip></TooltipProvider>
          <PopoverContent className="w-40 p-2" align="start">
            <p className="text-xs text-slate-500 mb-2">Text colour</p>
            <div className="grid grid-cols-5 gap-1">
              {txtColors.map(c => (
                <button key={c} type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); }}
                  className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform" style={{ background: c }} />
              ))}
            </div>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); }}
              className="mt-2 w-full text-xs text-slate-400 hover:text-slate-600 py-1 rounded hover:bg-slate-100">Reset colour</button>
          </PopoverContent>
        </Popover>

        <ToolBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} tooltip="Clear Formatting"><RemoveFormatting className="w-3.5 h-3.5" /></ToolBtn>

        <Sep />

        {/* Alignment */}
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} tooltip="Align Left"><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} tooltip="Align Center"><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} tooltip="Align Right"><AlignRight className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} tooltip="Justify"><AlignJustify className="w-3.5 h-3.5" /></ToolBtn>

        <Sep />

        {/* Lists & blocks */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} tooltip="Bullet List"><List className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} tooltip="Numbered List"><ListOrdered className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} tooltip="Blockquote"><Quote className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} tooltip="Inline Code"><Code className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} tooltip="Code Block">
          <span className="text-xs font-mono font-bold leading-none">{"</>"}</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} tooltip="Horizontal Divider"><Minus className="w-3.5 h-3.5" /></ToolBtn>

        <Sep />

        {/* Link */}
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <TooltipProvider delayDuration={300}><Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button type="button" className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-all ${editor.isActive("link") ? "bg-blue-100 text-blue-700 border border-blue-200" : "text-slate-600 hover:bg-slate-100"}`}>
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Insert / Edit Link</TooltipContent>
          </Tooltip></TooltipProvider>
          <PopoverContent className="w-72 p-3" align="start">
            <p className="text-sm font-medium text-slate-700 mb-2">Insert Link</p>
            <Input placeholder="https://example.com" value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applyLink()} className="mb-2 text-sm h-8" />
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={applyLink} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white h-7 text-xs">Apply</Button>
              {editor.isActive("link") && (
                <Button type="button" size="sm" variant="outline" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false); }}
                  className="flex-1 h-7 text-xs">Remove</Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Image */}
        <Popover open={imgOpen} onOpenChange={setImgOpen}>
          <TooltipProvider delayDuration={300}><Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button type="button" className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-600 hover:bg-slate-100 transition-all">
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Insert Image (URL)</TooltipContent>
          </Tooltip></TooltipProvider>
          <PopoverContent className="w-80 p-3" align="start">
            <p className="text-sm font-medium text-slate-700 mb-1">Insert Image</p>
            <p className="text-xs text-slate-400 mb-2">Paste a public image URL or upload from your device</p>
            <Input placeholder="https://example.com/photo.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && insertImage()} className="mb-2 text-sm h-8" />
            <Button type="button" size="sm" onClick={insertImage} className="w-full bg-blue-700 hover:bg-blue-800 text-white h-7 text-xs">Insert Image</Button>
            <label className="mt-2 flex w-full items-center justify-center rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
              {uploadingImage ? "Uploading..." : "Upload Image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>
          </PopoverContent>
        </Popover>
      </div>

      {/* ── Writing area ─────────────────────────────────────────────── */}
      <div
        className="px-8 py-6 bg-white flex-1 cursor-text editor-prose"
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>

      {/* ── Status bar ───────────────────────────────────────────────── */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{words} words</span>
          <span className="w-px h-3 bg-slate-200"></span>
          <span>{chars} characters</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {editor.isActive("bold") && <span className="font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">B</span>}
          {editor.isActive("italic") && <span className="italic text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">I</span>}
          {editor.isActive("link") && <span className="text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">🔗 Link</span>}
          {editor.isActive("heading", { level: 1 }) && <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">H1</span>}
          {editor.isActive("heading", { level: 2 }) && <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">H2</span>}
        </div>
      </div>
    </div>
  );
}
