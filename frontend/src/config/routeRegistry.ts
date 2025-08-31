import type { ReactNode } from "react";

type RouteCategory = "page" | "action" | "default";

type RegisteredRoute = {
  path: string;
  label?: string;
  component: ReactNode;
  matcher: (input: string) => boolean;
  category: RouteCategory;
};

const registry: RegisteredRoute[] = [];

export const RouteRegistry = {
  register(
    path: string,
    label: string,
    component: ReactNode,
    category: RouteCategory = "page"
  ) {
    if (registry.some((entry) => entry.path === path)) return;

    const matcher = (input: string) => {
      const pathParts = path.split("/");
      const inputParts = input.split("/");
      if (pathParts.length !== inputParts.length) return false;

      return pathParts.every((part, i) =>
        part.startsWith(":") ? true : part === inputParts[i]
      );
    };

    registry.push({ path, label, component, matcher, category });
  },
  get(path: string): ReactNode | undefined {
    const found = registry.find((entry) => entry.matcher(path));
    return found?.component;
  },

  has(path: string): boolean {
    return !!this.get(path);
  },

  getAllPaths() {
    return registry.map((entry) => entry.path);
  },

  getAllLabels() {
    return registry.map((entry) => entry.label);
  },

  getAllOptions(category?: RouteCategory) {
    return registry
      .filter((entry) => !category || entry.category === category)
      .map((entry) => ({
        value: entry.path,
        label: entry.label ?? entry.path,
      }));
  },
};
