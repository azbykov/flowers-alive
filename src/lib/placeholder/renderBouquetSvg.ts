import { createElement, type ReactElement, type ReactNode } from "react";
import type { FlowerType } from "@/domain/types";
import { BouquetIllustration } from "@/components/placeholder/BouquetIllustration";

/**
 * Next.js App Route Handlers run in the React Server Components environment,
 * where `react-dom/server` is unsupported. We keep the bouquet as React
 * components for readability, then serialize the element tree to SVG markup
 * ourselves (no DOM, no streaming APIs).
 */

const VOID_SVG = new Set(["path", "circle", "rect", "line", "ellipse", "polyline", "polygon"]);

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderNode(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(renderNode).join("");
  if (typeof node !== "object" || !("$$typeof" in node)) return "";

  const el = node as ReactElement<Record<string, unknown>>;
  const type = el.type;
  const props = el.props;

  if (typeof type === "function") {
    const result = (type as (p: Record<string, unknown>) => ReactNode)(props);
    return renderNode(result);
  }
  if (typeof type !== "string") return "";

  const { children, ...rest } = props;
  const attrs = Object.entries(rest)
    .filter(([name, value]) => value != null && name !== "ref" && typeof value !== "function")
    .map(([name, value]) => {
      if (typeof value === "boolean") return value ? ` ${name}` : "";
      return ` ${name}="${escapeAttr(String(value))}"`;
    })
    .join("");

  const childStr = renderNode(children as ReactNode);
  if (childStr === "" && VOID_SVG.has(type)) {
    return `<${type}${attrs} />`;
  }
  return `<${type}${attrs}>${childStr}</${type}>`;
}

/** Renders `BouquetIllustration` to a standalone SVG markup string (for the placeholder route). */
export function renderBouquetSvg(flowerType: FlowerType, seed: string, colorHint?: string): string {
  return renderNode(
    createElement(BouquetIllustration, { flowerType, seed, color: colorHint }),
  );
}
