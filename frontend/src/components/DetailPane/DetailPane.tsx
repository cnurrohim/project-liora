// src/components/DetailPane/BaseDetailPane.tsx

import { type ReactNode } from "react";

export function DetailPane({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex justify-end z-50 bg-black/30 backdrop-blur-sm">
      <div className="w-full md:w-[28rem] h-full bg-gray-900 text-white shadow-xl transform transition-all duration-300">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
            title="Tutup"
          >
            &times;
          </button>
        </div>

        <div className="p-4 overflow-auto h-full space-y-4">{children}</div>
      </div>
    </div>
  );
}
