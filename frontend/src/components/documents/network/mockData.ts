import type { ConceptNodeData } from "./types";

export const mockConcepts: ConceptNodeData[] = [
  {
    id: "nn",
    label: "Neural Networks",
    category: "core",
    importance: 3,
    summary:
      "Mạng nơ-ron là mô hình học biểu diễn, gồm nhiều lớp nơ-ron liên kết để học quan hệ phi tuyến từ dữ liệu.",
    citations: [
      {
        location: "Chapter 4, Section 2",
        excerpt:
          "Neural networks learn hierarchical representations by composing simple functions into complex mappings.",
      },
    ],
    connections: [
      { toId: "backprop", label: "trained by" },
      { toId: "activation", label: "uses" },
      { toId: "optim", label: "optimized with" },
    ],
  },
  {
    id: "backprop",
    label: "Backpropagation",
    category: "algorithms",
    importance: 2,
    summary:
      "Backprop là thuật toán tính gradient hiệu quả bằng cách lan truyền sai số ngược qua các lớp.",
    citations: [
      {
        location: "Chapter 4, Section 3",
        excerpt:
          "Backpropagation computes gradients via the chain rule across the computational graph.",
      },
    ],
    connections: [{ toId: "optim", label: "feeds gradients to" }],
  },
  {
    id: "activation",
    label: "Activation Functions",
    category: "core",
    importance: 2,
    summary:
      "Hàm kích hoạt đưa tính phi tuyến vào mô hình (ReLU, GELU, sigmoid...), ảnh hưởng trực tiếp đến khả năng học.",
    citations: [
      {
        location: "Chapter 4, Section 1",
        excerpt: "Non-linear activations enable deep networks to approximate complex functions.",
      },
    ],
    connections: [{ toId: "nn", label: "enables" }],
  },
  {
    id: "optim",
    label: "Optimization",
    category: "algorithms",
    importance: 1,
    summary:
      "Tối ưu hoá cập nhật tham số để giảm loss (SGD, Adam), cân bằng tốc độ hội tụ và độ ổn định.",
    citations: [
      {
        location: "Chapter 5, Section 1",
        excerpt: "Adaptive optimizers adjust per-parameter learning rates over time.",
      },
    ],
    connections: [{ toId: "nn", label: "improves training" }],
  },
  {
    id: "data",
    label: "Data & Features",
    category: "systems",
    importance: 1,
    summary:
      "Chất lượng dữ liệu và đặc trưng quyết định trần hiệu năng. Pipeline tốt giảm nhiễu và tránh rò rỉ thông tin.",
    citations: [
      {
        location: "Chapter 2, Section 4",
        excerpt: "Data quality often dominates model choice in practical systems.",
      },
    ],
    connections: [{ toId: "nn", label: "feeds" }],
  },
];

export const mockEdges: Array<{ from: string; to: string }> = [
  { from: "nn", to: "backprop" },
  { from: "backprop", to: "optim" },
  { from: "nn", to: "activation" },
  { from: "data", to: "nn" },
  // keep mock graph acyclic for tree layout
];

