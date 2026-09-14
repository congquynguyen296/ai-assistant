export type ConceptCategory = "core" | "algorithms" | "systems" | string;


export type Position = {
  x: number;
  y: number;
};

export type ConceptNode = {
  id: string;
  label: string;
  category: ConceptCategory;
  importance: 1 | 2 | 3;
  summary: string;
  position: Position;
};

export type ConceptEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
};

export const categoryLabel: Record<ConceptCategory, string> = {
  core: "Core Concepts",
  algorithms: "Algorithms",
  systems: "Systems",
};
