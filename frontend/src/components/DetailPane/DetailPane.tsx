import { useEffect, useState, type ReactNode } from "react";

export function DetailPane({
  visible,
  title,
  onClose,
  children,
  widthClass = "w-full sm:w-[60rem] md:w-[40rem] lg:w-[50rem]",
}: {
  visible: boolean;
  title?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  widthClass?: string;
}) {
  const [isRendered, setIsRendered] = useState(visible);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      requestAnimationFrame(() => setAnimateIn(true));
    } else {
      setAnimateIn(false);
      const timeout = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => {
      setIsRendered(false);
      onClose();
    }, 300);
  };

  if (!isRendered) return null;

  return (
    <div className="fixed inset-0 flex justify-end z-50 bg-black/30 backdrop-blur-sm transition-opacity">
      <div
        className={`
          ${widthClass}
          h-full bg-(--content-surface) text-(--content-text) shadow-xl transform transition-transform duration-300
          ${animateIn ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex justify-between items-center p-4 border-b border-(--content-border)">
          <h2 className="text-xl font-bold text-(--content-text)">{title}</h2>
          <button
            onClick={handleClose}
            className="text-(--content-text) cursor-pointer hover:text-(--content-text-muted) text-2xl font-bold"
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
