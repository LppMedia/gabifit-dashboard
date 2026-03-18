"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, X, Film, ImageIcon, FileVideo } from "lucide-react";
import { MediaFile } from "@/lib/calendar-data";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/quicktime","video/webm"];

function formatBytes(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface Props {
  files:     MediaFile[];
  onChange:  (files: MediaFile[]) => void;
  /** Object URLs keyed by MediaFile.id — managed by parent to allow cleanup */
  urls:      Record<string, string>;
  onAddUrl:  (id: string, url: string) => void;
  onRemove:  (id: string) => void;
}

export function MediaUploadZone({ files, onChange, urls, onAddUrl, onRemove }: Props) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (raw: FileList | null) => {
      if (!raw) return;
      Array.from(raw).forEach((file) => {
        if (!ACCEPTED.includes(file.type)) return;
        const id  = `mf-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
        const url = URL.createObjectURL(file);
        const mf: MediaFile = { id, name: file.name, type: file.type, size: file.size };
        onAddUrl(id, url);
        onChange([...files, mf]);
      });
    },
    [files, onChange, onAddUrl]
  );

  // Drag & drop handlers
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()                    => setDragging(false);
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 transition-all duration-150",
          dragging
            ? "border-emerald-500/60 bg-emerald-500/8"
            : "border-border/40 bg-white/[0.01] hover:border-border/70 hover:bg-white/[0.03]"
        )}
      >
        <Upload className={cn("h-5 w-5", dragging ? "text-emerald-400" : "text-muted-foreground/40")} />
        <div className="text-center">
          <p className="text-[12px] font-medium text-muted-foreground/60">
            Arrastra archivos aquí o <span className="text-emerald-400">haz clic</span>
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/30">
            Imágenes (JPG, PNG, WebP) · Videos (MP4, MOV, WebM)
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* File preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {files.map((file) => {
            const url       = urls[file.id];
            const isImage   = file.type.startsWith("image/");
            const isVideo   = file.type.startsWith("video/");

            return (
              <div
                key={file.id}
                className="group relative overflow-hidden rounded-lg border border-border/30 bg-white/[0.02]"
              >
                {/* Preview */}
                {isImage && url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={file.name}
                    className="aspect-square w-full object-cover"
                  />
                ) : isVideo && url ? (
                  <video
                    src={url}
                    className="aspect-square w-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-white/[0.03]">
                    {isVideo ? (
                      <FileVideo className="h-6 w-6 text-muted-foreground/30" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                    )}
                  </div>
                )}

                {/* Video overlay icon */}
                {isVideo && (
                  <div className="absolute left-1.5 top-1.5 rounded-md bg-black/50 p-0.5">
                    <Film className="h-3 w-3 text-white/80" />
                  </div>
                )}

                {/* Session-only badge (no url = file was from a previous session) */}
                {!url && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-center text-[9px] text-amber-400">
                    Re-upload needed
                  </div>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(file.id); }}
                  className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white/80 transition-all hover:bg-red-500/80 group-hover:flex"
                >
                  <X className="h-3 w-3" />
                </button>

                {/* File name tooltip */}
                <div className="absolute inset-x-0 bottom-0 hidden bg-black/70 px-1.5 py-1 group-hover:block">
                  <p className="truncate text-[9px] text-white/70">{file.name}</p>
                  <p className="text-[9px] text-white/40">{formatBytes(file.size)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Session note */}
      <p className="text-[10px] text-muted-foreground/30">
        Las previsualizaciones son de sesión. Los archivos se re-adjuntan en la próxima visita.
        {/* TODO: Remove this note once Supabase Storage is integrated */}
      </p>
    </div>
  );
}
