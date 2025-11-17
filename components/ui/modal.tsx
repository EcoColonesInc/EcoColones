"use client";

import { ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  title?: string;
  children?: ReactNode;
  onCancel?: () => void;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  dangerNote?: string; // texto rojo opcional
  className?: string;
}

export function Modal({
  open,
  title,
  children,
  onCancel,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  dangerNote,
  className,
}: ModalProps) {
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center px-4 py-10 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <Card className={cn("relative w-full max-w-lg animate-in fade-in zoom-in", className)}>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute top-3 right-3 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={onCancel}
          >
            ×
          </button>
        </CardHeader>
        <CardContent className="space-y-5">
          {children}
          {dangerNote && (
            <p className="text-center text-sm text-red-600 font-medium">{dangerNote}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="destructive"
              className="min-w-28"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant="success"
              className="min-w-28"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "..." : confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
