"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered,
  Quote, Link, Image as ImageIcon, Type, Code, Eye, EyeOff,
  Variable, AlignLeft, AlignCenter, AlignRight, Undo, Redo
} from "lucide-react";

interface CampaignEmailEditorProps {
  htmlContent: string;
  textContent: string;
  signature: string;
  senderName?: string;
  senderEmail?: string;
  onChange: (values: { htmlContent: string; textContent: string; signature: string }) => void;
}

const VARIABLES = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "fullName", label: "Full Name" },
  { key: "email", label: "Email" },
  { key: "company", label: "Company" },
  { key: "senderName", label: "Sender Name" },
  { key: "senderEmail", label: "Sender Email" },
  { key: "signature", label: "Signature" },
  { key: "workspaceName", label: "Workspace Name" },
  { key: "unsubscribeUrl", label: "Unsubscribe URL" },
];

function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function plainTextToHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export default function CampaignEmailEditor({
  htmlContent,
  textContent,
  signature,
  senderName,
  senderEmail,
  onChange,
}: CampaignEmailEditorProps) {
  const [format, setFormat] = useState<"html" | "text">("html");
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const plainRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editorRef.current && format === "html") {
      editorRef.current.innerHTML = htmlContent || "<p><br/></p>";
    }
  }, [format, htmlContent]);

  const syncHtml = useCallback(() => {
    const html = editorRef.current?.innerHTML || "";
    const plain = htmlToPlainText(html);
    onChange({ htmlContent: html, textContent: plain, signature });
  }, [onChange, signature]);

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    syncHtml();
  };

  const insertHtml = (html: string) => {
    document.execCommand("insertHTML", false, html);
    syncHtml();
  };

  const insertVariable = (key: string) => {
    if (format === "html") {
      insertHtml(`<span class="text-pk-600 font-medium" data-variable="${key}">{{${key}}}</span>&nbsp;`);
    } else if (plainRef.current) {
      const start = plainRef.current.selectionStart;
      const end = plainRef.current.selectionEnd;
      const before = plainRef.current.value.slice(0, start);
      const after = plainRef.current.value.slice(end);
      const next = `${before}{{${key}}}${after}`;
      plainRef.current.value = next;
      plainRef.current.selectionStart = plainRef.current.selectionEnd = start + `{{${key}}}`.length;
      handlePlainChange(next);
    }
  };

  const handlePlainChange = (text: string) => {
    const html = plainTextToHtml(text);
    onChange({ htmlContent: html, textContent: text, signature });
  };

  const addLink = () => {
    const url = prompt("Enter the URL (including https://)");
    if (url) exec("createLink", url);
  };

  const addImage = () => {
    const url = prompt("Enter image URL");
    if (url) {
      if (format === "html") {
        insertHtml(`<img src="${url}" alt="" style="max-width:100%;border-radius:8px;margin:8px 0;" />`);
      } else if (plainRef.current) {
        const start = plainRef.current.selectionStart;
        const before = plainRef.current.value.slice(0, start);
        const after = plainRef.current.value.slice(start);
        const next = `${before}[Image: ${url}]${after}`;
        plainRef.current.value = next;
        handlePlainChange(next);
      }
    }
  };

  const applyStyle = (style: "fontSize" | "color" | "fontFamily", value: string) => {
    exec(style, value);
  };

  const toggleFormat = (next: "html" | "text") => {
    setFormat(next);
    if (next === "text" && !textContent) {
      onChange({ htmlContent, textContent: htmlToPlainText(htmlContent), signature });
    } else if (next === "html" && !htmlContent) {
      onChange({ htmlContent: plainTextToHtml(textContent), textContent, signature });
    }
  };

  const previewHtml = (htmlContent || "")
    .replace(/{{firstName}}/g, "John")
    .replace(/{{lastName}}/g, "Doe")
    .replace(/{{fullName}}/g, "John Doe")
    .replace(/{{email}}/g, "john@example.com")
    .replace(/{{company}}/g, "Acme Corp")
    .replace(/{{senderName}}/g, senderName || "Pandacrm Team")
    .replace(/{{senderEmail}}/g, senderEmail || "team@pandacrm.com.ng")
    .replace(/{{signature}}/g, signature || `${senderName || "Pandacrm Team"}<br/>team@pandacrm.com.ng`)
    .replace(/{{workspaceName}}/g, "Pandacrm")
    .replace(/{{unsubscribeUrl}}/g, "https://pandacrm.com.ng/unsubscribe");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => toggleFormat("html")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              format === "html" ? "bg-white text-pk-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            HTML / Design
          </button>
          <button
            type="button"
            onClick={() => toggleFormat("text")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              format === "text" ? "bg-white text-pk-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Plain Text
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Variable className="w-3.5 h-3.5" /> Insert Variable
            </button>
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-200 z-20 hidden group-hover:block overflow-hidden">
              {VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => insertVariable(v.key)}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-pink-50 transition-colors"
                >
                  {v.label} <span className="text-gray-400">{"{{" + v.key + "}}"}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPreview((s) => !s)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPreview ? "Hide Preview" : "Preview"}
          </button>
        </div>
      </div>

      {format === "html" && (
        <>
          <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded-t-xl border-b-0">
            <ToolbarButton icon={<Bold className="w-3.5 h-3.5" />} onClick={() => exec("bold")} title="Bold" />
            <ToolbarButton icon={<Italic className="w-3.5 h-3.5" />} onClick={() => exec("italic")} title="Italic" />
            <ToolbarButton icon={<Underline className="w-3.5 h-3.5" />} onClick={() => exec("underline")} title="Underline" />
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <ToolbarButton icon={<Heading1 className="w-3.5 h-3.5" />} onClick={() => exec("formatBlock", "H1")} title="Heading 1" />
            <ToolbarButton icon={<Heading2 className="w-3.5 h-3.5" />} onClick={() => exec("formatBlock", "H2")} title="Heading 2" />
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <ToolbarButton icon={<List className="w-3.5 h-3.5" />} onClick={() => exec("insertUnorderedList")} title="Bullet list" />
            <ToolbarButton icon={<ListOrdered className="w-3.5 h-3.5" />} onClick={() => exec("insertOrderedList")} title="Numbered list" />
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <ToolbarButton icon={<AlignLeft className="w-3.5 h-3.5" />} onClick={() => exec("justifyLeft")} title="Align left" />
            <ToolbarButton icon={<AlignCenter className="w-3.5 h-3.5" />} onClick={() => exec("justifyCenter")} title="Align center" />
            <ToolbarButton icon={<AlignRight className="w-3.5 h-3.5" />} onClick={() => exec("justifyRight")} title="Align right" />
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <ToolbarButton icon={<Quote className="w-3.5 h-3.5" />} onClick={() => exec("formatBlock", "BLOCKQUOTE")} title="Quote" />
            <ToolbarButton icon={<Link className="w-3.5 h-3.5" />} onClick={addLink} title="Link" />
            <ToolbarButton icon={<ImageIcon className="w-3.5 h-3.5" />} onClick={addImage} title="Image" />
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <ToolbarButton icon={<Undo className="w-3.5 h-3.5" />} onClick={() => exec("undo")} title="Undo" />
            <ToolbarButton icon={<Redo className="w-3.5 h-3.5" />} onClick={() => exec("redo")} title="Redo" />

            <select
              onChange={(e) => applyStyle("fontSize", e.target.value)}
              className="ml-1 text-[10px] bg-white border border-gray-200 rounded px-1 py-1 outline-none"
              defaultValue=""
            >
              <option value="" disabled>Size</option>
              <option value="1">Small</option>
              <option value="3">Normal</option>
              <option value="5">Large</option>
              <option value="7">Huge</option>
            </select>
            <input
              type="color"
              onChange={(e) => exec("foreColor", e.target.value)}
              className="ml-1 w-6 h-6 p-0 border-0 rounded cursor-pointer"
              title="Text color"
              defaultValue="#0d0d12"
            />
          </div>

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncHtml}
            onBlur={syncHtml}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
              syncHtml();
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-b-xl px-4 py-3 text-sm outline-none focus:border-pk-500 min-h-[240px] email-editor"
            style={{ lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: htmlContent || "<p><br/></p>" }}
          />
        </>
      )}

      {format === "text" && (
        <textarea
          ref={plainRef}
          value={textContent}
          onChange={(e) => handlePlainChange(e.target.value)}
          rows={10}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pk-500 font-mono"
          placeholder="Write your plain text email here..."
        />
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Signature</label>
        <textarea
          value={signature}
          onChange={(e) => onChange({ htmlContent, textContent, signature: e.target.value })}
          rows={3}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500"
          placeholder="Best regards,&#10;Your Name&#10;Pandacrm"
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Use {`{{signature}}`} inside the email body to insert this signature automatically.
        </p>
      </div>

      {showPreview && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 text-xs font-semibold text-gray-600">Preview</div>
          <div className="bg-white p-4 max-h-80 overflow-y-auto text-sm" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      )}

      <p className="text-[10px] text-gray-400">
        Plain text version is {format === "html" ? "auto-generated" : "used as the text alternative"} and sent alongside HTML to improve deliverability.
      </p>
    </div>
  );
}

function ToolbarButton({ icon, onClick, title }: { icon: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600 transition-colors"
    >
      {icon}
    </button>
  );
}
