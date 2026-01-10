import { get, set, del, clear } from "idb-keyval";
import { ScoreResult } from "./schemas";

export interface HistoryEntry {
  id: string;
  timestamp: number;
  scores: ScoreResult;
  imagePreview?: string; // base64 thumbnail
}

const HISTORY_KEY_PREFIX = "nutrilabel:history:";
const HISTORY_INDEX_KEY = "nutrilabel:history:index";

async function getHistoryIndex(): Promise<string[]> {
  const index = await get<string[]>(HISTORY_INDEX_KEY);
  return index || [];
}

async function saveHistoryIndex(index: string[]): Promise<void> {
  await set(HISTORY_INDEX_KEY, index);
}

export async function saveToHistory(entry: HistoryEntry): Promise<void> {
  const key = `${HISTORY_KEY_PREFIX}${entry.id}`;
  await set(key, entry);

  const index = await getHistoryIndex();
  if (!index.includes(entry.id)) {
    index.unshift(entry.id); // Add to beginning
    await saveHistoryIndex(index);
  }
}

export async function getAllHistory(): Promise<HistoryEntry[]> {
  const index = await getHistoryIndex();
  const entries: HistoryEntry[] = [];

  for (const id of index) {
    const key = `${HISTORY_KEY_PREFIX}${id}`;
    const entry = await get<HistoryEntry>(key);
    if (entry) {
      entries.push(entry);
    }
  }

  return entries.sort((a, b) => b.timestamp - a.timestamp);
}

export async function getHistoryEntry(id: string): Promise<HistoryEntry | null> {
  const key = `${HISTORY_KEY_PREFIX}${id}`;
  return (await get<HistoryEntry>(key)) || null;
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const key = `${HISTORY_KEY_PREFIX}${id}`;
  await del(key);

  const index = await getHistoryIndex();
  const newIndex = index.filter((entryId) => entryId !== id);
  await saveHistoryIndex(newIndex);
}

export async function clearAllHistory(): Promise<void> {
  const index = await getHistoryIndex();
  for (const id of index) {
    const key = `${HISTORY_KEY_PREFIX}${id}`;
    await del(key);
  }
  await clear();
  await saveHistoryIndex([]);
}
