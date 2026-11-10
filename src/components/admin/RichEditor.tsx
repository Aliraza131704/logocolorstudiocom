import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Image as Img, ImagePlus, Code, Quote, Undo, Redo, Megaphone, FileCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadMediaImage } from "@/lib/media-upload";
import { encodeAdCode } from "@/components/site/AdSlot";

export function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit, LinkExt.configure({ openOnClick: false }), ImageExt, TableKit.configure({ table: { resizable: false } })],
    content: value,
    immediatelyRender: false,
    editorProps: { attributes: { class: "prose-content p-4" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  useEffect(() => { if (editor && value !== editor.getHTML()) editor.commands.setContent(value); }, [value, editor]);
  if (!editor) return <div className="h-80 animate-pulse rounded-xl bg-muted" />;
  const upload = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadMediaImage(file, "posts");
      editor.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[a-z0-9]+$/i, "") }).run();
      toast.success("Image added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };
  const B = ({ on, active, label, children }: { on: () => void; active?: boolean; label: string; children: React.ReactNode }) => (
    <Button type="button" variant={active ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={on} aria-label={label}>{children}</Button>
  );
  return (
    <div className="rounded-xl border bg-background">
      <div className="flex flex-wrap gap-0.5 border-b p-1">
        <B label="Bold" active={editor.isActive("bold")} on={() => editor.chain().focus().toggleBold().run()}><Bold /></B>
        <B label="Italic" active={editor.isActive("italic")} on={() => editor.chain().focus().toggleItalic().run()}><Italic /></B>
        <B label="Heading 2" active={editor.isActive("heading", { level: 2 })} on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 /></B>
        <B label="Heading 3" active={editor.isActive("heading", { level: 3 })} on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 /></B>
        <B label="Bullet list" active={editor.isActive("bulletList")} on={() => editor.chain().focus().toggleBulletList().run()}><List /></B>
        <B label="Numbered list" active={editor.isActive("orderedList")} on={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></B>
        <B label="Quote" active={editor.isActive("blockquote")} on={() => editor.chain().focus().toggleBlockquote().run()}><Quote /></B>
        <B label="Code block" active={editor.isActive("codeBlock")} on={() => editor.chain().focus().toggleCodeBlock().run()}><Code /></B>
        <B label="Link" on={() => { const u = prompt("Link URL"); if (u) editor.chain().focus().setLink({ href: u }).run(); else editor.chain().focus().unsetLink().run(); }}><Link2 /></B>
        <B label="Upload image" active={busy} on={() => fileRef.current?.click()}><ImagePlus /></B>
        <B label="Image URL" on={() => { const u = prompt("Image URL"); if (u) editor.chain().focus().setImage({ src: u }).run(); }}><Img /></B>
        <B label="Insert ad spot (Ads Manager in-content code)" on={() => editor.chain().focus().insertContent({ type: "paragraph", content: [{ type: "text", text: "[[ad]]" }] }).run()}><Megaphone /></B>
        <B label="Paste ad code here" on={() => { const c = prompt("Paste ad code (AdSense or other HTML/script)"); if (c?.trim()) editor.chain().focus().insertContent({ type: "paragraph", content: [{ type: "text", text: `[[adcode:${encodeAdCode(c)}]]` }] }).run(); }}><FileCode /></B>
        <B label="Undo" on={() => editor.chain().focus().undo().run()}><Undo /></B>
        <B label="Redo" on={() => editor.chain().focus().redo().run()}><Redo /></B>
      </div>
      <EditorContent editor={editor} />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
      />
    </div>
  );
}
