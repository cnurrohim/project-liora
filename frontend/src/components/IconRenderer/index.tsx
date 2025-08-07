// src/components/IconRenderer.tsx

import { RiQuestionLine } from "@remixicon/react";
import { iconRegistry } from "@/assets/icons/iconRegistry";
import type { ReactNode } from "react";

type IconRendererProps = {
  name?: ReactNode | string;
  size?: number;
  className?: string;
  color?: string;
};

export function IconRenderer({
  name,
  size = 20,
  className = "",
  color = "",
}: IconRendererProps) {
  const IconComponent = name
    ? iconRegistry[name as keyof typeof iconRegistry]
    : null;

  if (IconComponent) {
    return (
      <IconComponent
        size={size}
        className={className}
        {...(color ? { color } : {})}
      />
    );
  }

  // Jika tidak ditemukan di registry, anggap ini emoji atau unicode
  if (typeof name === "string" && !isAlphaNumericOnly(name)) {
    return (
      <span className={className} style={{ fontSize: size }}>
        {name}
      </span>
    );
  }

  return <RiQuestionLine size={size} className={className} />;
}

function isAlphaNumericOnly(str: string): boolean {
  return /^[\p{L}\p{N}]+$/u.test(str);
}
