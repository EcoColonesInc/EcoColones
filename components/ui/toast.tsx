"use client";

import { useState, useEffect, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number; // Duration in milliseconds
  onClose?: () => void;
  showCloseButton?: boolean;
  position?: "top" | "bottom" | "top-right" | "top-left" | "bottom-right" | "bottom-left";
  className?: string;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400",
  error: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
};

export function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
  showCloseButton = true,
  position = "top",
  className,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Wait for exit animation
  }, [onClose]);

  useEffect(() => {
    // Start entrance animation
    setIsAnimating(true);
    
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  if (!isVisible) return null;

  const Icon = toastIcons[type];

  return (
    <div
      className={cn(
        "fixed z-50 max-w-md px-4 transition-all duration-300 ease-in-out",
        // Positioning
        position === "top" && "left-0 right-0 mx-auto top-4",
        position === "bottom" && "left-0 right-0 mx-auto bottom-4",
        position === "top-right" && "top-4 right-4",
        position === "top-left" && "top-4 left-4",
        position === "bottom-right" && "bottom-4 right-4",
        position === "bottom-left" && "bottom-4 left-4",
        // Animation
        isAnimating
          ? "translate-y-0 opacity-100"
          : position?.startsWith("top")
            ? "-translate-y-full opacity-0"
            : "translate-y-full opacity-0"
      )}
    >
      <Alert className={cn(toastStyles[type], "shadow-lg", className)}>
        <Icon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{message}</span>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleClose}
              className="ml-2 h-6 w-6 opacity-70 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Hook to manage toast state
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
    duration?: number;
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    duration = 3000
  ) => {
    setToast({ message, type, duration });
  };

  const hideToast = () => {
    setToast(null);
  };

  return {
    toast,
    showToast,
    hideToast,
  };
}