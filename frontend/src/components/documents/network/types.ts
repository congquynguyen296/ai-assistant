export type ConceptCategory = "core" | "algorithms" | "systems";

export type Citation = {
  location: string;
  excerpt: string;
};

export type ConceptConnection = {
  toId: string;
  label: string;
};

export type ConceptNodeData = {
  id: string;
  label: string;
  category: ConceptCategory;
  importance: 1 | 2 | 3;
  summary: string;
  citations: Citation[];
  connections: ConceptConnection[];
};

export const categoryLabel: Record<ConceptCategory, string> = {
  core: "Core Concepts",
  algorithms: "Algorithms",
  systems: "Systems",
};

