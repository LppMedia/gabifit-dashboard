"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORM_META } from "@/lib/competitors-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Platform = "instagram" | "tiktok" | "youtube" | "twitter" | "linkedin";

const ALL_PLATFORMS: Platform[] = [
  "instagram",
  "tiktok",
  "youtube",
  "twitter",
  "linkedin",
];

interface AddCompetitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: {
    name: string;
    handle: string;
    platforms: Platform[];
    niche: string;
    avatarGradient: string;
  }) => void;
}

const AVATAR_GRADIENTS = [
  "from-pink-500 to-rose-400",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-600",
];

export function AddCompetitorDialog({
  open,
  onOpenChange,
  onAdd,
}: AddCompetitorDialogProps) {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [niche, setNiche] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [gradientIndex, setGradientIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function togglePlatform(p: Platform) {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "El nombre es obligatorio";
    if (!handle.trim()) errs.handle = "El handle es obligatorio";
    if (selectedPlatforms.length === 0)
      errs.platforms = "Selecciona al menos una plataforma";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onAdd({
      name: name.trim(),
      handle: handle.trim().startsWith("@")
        ? handle.trim()
        : `@${handle.trim()}`,
      platforms: selectedPlatforms,
      niche: niche.trim() || "Fitness · Lifestyle",
      avatarGradient: AVATAR_GRADIENTS[gradientIndex],
    });
    // Reset form
    setName("");
    setHandle("");
    setNiche("");
    setSelectedPlatforms([]);
    setGradientIndex(0);
    setErrors({});
    onOpenChange(false);
  }

  function handleClose() {
    setName("");
    setHandle("");
    setNiche("");
    setSelectedPlatforms([]);
    setErrors({});
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border/40 p-0 overflow-hidden">
        {/* Gradient top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

        <div className="p-6">
          <DialogHeader className="mb-5">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-foreground">
                Agregar competidor
              </DialogTitle>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Añade un perfil para monitorear su contenido y métricas.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {/* Avatar preview + gradient picker */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "h-14 w-14 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg flex-shrink-0",
                  AVATAR_GRADIENTS[gradientIndex]
                )}
              >
                {name ? name.slice(0, 2).toUpperCase() : "??"}
              </div>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_GRADIENTS.map((g, i) => (
                  <button
                    key={g}
                    onClick={() => setGradientIndex(i)}
                    className={cn(
                      "h-6 w-6 rounded-full bg-gradient-to-br transition-all",
                      g,
                      i === gradientIndex
                        ? "ring-2 ring-white/50 ring-offset-1 ring-offset-card scale-110"
                        : "opacity-60 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="comp-name" className="text-sm text-foreground">
                Nombre
              </Label>
              <Input
                id="comp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sofía Moves"
                className={cn(
                  "bg-background border-border/60 focus:border-amber-500/50",
                  errors.name && "border-rose-500/60"
                )}
              />
              {errors.name && (
                <p className="text-xs text-rose-400">{errors.name}</p>
              )}
            </div>

            {/* Handle */}
            <div className="space-y-1.5">
              <Label htmlFor="comp-handle" className="text-sm text-foreground">
                Handle
              </Label>
              <Input
                id="comp-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@username"
                className={cn(
                  "bg-background border-border/60 focus:border-amber-500/50",
                  errors.handle && "border-rose-500/60"
                )}
              />
              {errors.handle && (
                <p className="text-xs text-rose-400">{errors.handle}</p>
              )}
            </div>

            {/* Platforms */}
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Plataformas</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_PLATFORMS.map((p) => {
                  const meta = PLATFORM_META[p];
                  const active = selectedPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        active
                          ? cn(meta.bg, meta.border, meta.color)
                          : "bg-white/[0.03] border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
                      )}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: meta.dot }}
                      />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
              {errors.platforms && (
                <p className="text-xs text-rose-400">{errors.platforms}</p>
              )}
            </div>

            {/* Niche */}
            <div className="space-y-1.5">
              <Label htmlFor="comp-niche" className="text-sm text-foreground">
                Nicho{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Input
                id="comp-niche"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Fat loss · Nutrición · Lifestyle"
                className="bg-background border-border/60 focus:border-amber-500/50"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="flex-1 text-muted-foreground hover:text-foreground border border-border/40"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Agregar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
