import { Schema, model, type Document as MongooseDocument, type Types } from "mongoose";


export interface Position {
  x: number;
  y: number;
}

export interface ConceptNode {
  id: string; // Will map to ObjectId or UUID string
  label: string;
  category: string;
  importance: number;
  summary: string;
  position: Position;
}

export interface ConceptEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface KnowledgeGraphDocument extends MongooseDocument {
  documentId: Types.ObjectId;
  userId: Types.ObjectId;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
  version: number;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeGraphSchema = new Schema<KnowledgeGraphDocument>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      unique: true, // One graph per document
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    error: {
      type: String,
    },
    version: {
      type: Number,
      default: 1,
    },
    nodes: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        category: { type: String, required: true },
        importance: { type: Number, required: true },
        summary: { type: String, required: true },
        position: {
          x: { type: Number, required: true },
          y: { type: Number, required: true },
        },
      },
    ],
    edges: [
      {
        id: { type: String, required: true },
        from: { type: String, required: true },
        to: { type: String, required: true },
        label: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

KnowledgeGraphSchema.index({ userId: 1, documentId: 1 });

const KnowledgeGraph = model<KnowledgeGraphDocument>("KnowledgeGraph", KnowledgeGraphSchema);
export default KnowledgeGraph;
