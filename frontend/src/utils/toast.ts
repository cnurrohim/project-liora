// utils/toast.ts
let hasSonner = false;
let toast: any = null;

// Coba load sonner (jika ada)
try {
  const sonner = await import("sonner");
  toast = sonner.toast;
  hasSonner = true;
} catch {
  console.warn("Sonner not installed, fallback to alert()");
}

export function showSuccessToast(message: string) {
  if (hasSonner && toast) {
    toast.success(message, {
      className:
        "bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border)]",
      duration: 4000,
    });
  } else {
    alert(`✅ ${message}`);
  }
}

export function toastConfirmSuccess(message: string) {
  if (hasSonner && toast) {
    toast.success(message, {
      action: {
        label: "Oke",
        onClick: () => toast.dismiss(),
      },
    });
  } else {
    alert(`✅ ${message}`);
  }
}

export function showErrorToast(message: string) {
  if (hasSonner && toast) {
    toast.error(message, {
      className: "bg-red-800 text-[var(--text-primary)] border border-red-700",
      duration: 5000,
    });
  } else {
    alert(`❌ ${message}`);
  }
}
