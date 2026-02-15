import type { FlowDocument } from '../types/flow';

const STORAGE_KEY = 'flowchart-builder-doc';

export interface FlowStorage {
  save(doc: FlowDocument): void;
  load(): FlowDocument | null;
}

export const localStorageFlow: FlowStorage = {
  save: (doc) => localStorage.setItem(STORAGE_KEY, JSON.stringify(doc)),
  load: () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!isFlowDocument(parsed)) return null;
      return parsed;
    } catch {
      return null;
    }
  },
};

export const downloadTextFile = (filename: string, content: string, mime = 'text/plain'): void => {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};

export const importFromFile = async (file: File): Promise<FlowDocument> => {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!isFlowDocument(parsed)) throw new Error('JSONスキーマが不正です。');
  return parsed;
};

export const isFlowDocument = (doc: unknown): doc is FlowDocument => {
  if (!doc || typeof doc !== 'object') return false;
  const d = doc as Record<string, unknown>;
  return Array.isArray(d.nodes) && Array.isArray(d.edges) && !!d.meta && typeof d.meta === 'object';
};
