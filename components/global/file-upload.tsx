"use client";

import { useRef, useState } from "react";
import { FileIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  apiEndpoint?: string;
  onChange: (url?: string) => void;
  value?: string;
};

export function FileUpload({ onChange, value }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } catch (e) {
      console.error("Upload failed:", e);
    }
    setUploading(false);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const type = value?.split(".").pop();

  if (value) {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        {type !== "pdf" ? (
          <div className="relative h-40 w-40">
            <Image src={value} alt="uploaded" fill className="rounded-md object-contain" />
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md bg-background/10 p-2">
            <FileIcon className="h-4 w-4" />
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-500 hover:underline">
              View PDF
            </a>
          </div>
        )}
        <Button variant="ghost" size="sm" type="button" onClick={() => onChange("")}>
          <X /> Remove
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
        dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={onFileSelect}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Spinner />
          <p className="text-[13px] text-muted-foreground">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-[13px] text-muted-foreground">
            Click or drag & drop to upload
          </p>
          <p className="text-[11px] text-muted-foreground/60">
            JPG, PNG, GIF, SVG, WebP or PDF (max 4MB)
          </p>
        </div>
      )}
    </div>
  );
}
