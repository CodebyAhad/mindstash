import * as vscode from 'vscode';

export interface Idea {
  id: string;
  text: string;
  createdAt: number;
}

const FILENAME = 'mindstash.json';

export function getMindstashUri(): vscode.Uri | undefined {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) return undefined;
  return vscode.Uri.joinPath(folder.uri, '.vscode', FILENAME);
}

export async function readIdeas(): Promise<Idea[]> {
  const uri = getMindstashUri();
  if (!uri) return [];
  try {
    const data = await vscode.workspace.fs.readFile(uri);
    const parsed = JSON.parse(new TextDecoder().decode(data));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function ensureVscodeDir(uri: vscode.Uri): Promise<void> {
  const dir = vscode.Uri.joinPath(uri, '..');
  try {
    await vscode.workspace.fs.createDirectory(dir);
  } catch {
    
  }
}

export async function writeIdeas(ideas: Idea[]): Promise<boolean> {
  const uri = getMindstashUri();
  if (!uri) return false;
  await ensureVscodeDir(uri);
  const content = JSON.stringify(ideas, null, 2);
  await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(content));
  return true;
}

export async function appendIdea(text: string): Promise<Idea | null> {
  const ideas = await readIdeas();
  const idea: Idea = {
    id: `idea-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text: text.trim(),
    createdAt: Date.now(),
  };
  if (!idea.text) return null;
  ideas.push(idea);
  const ok = await writeIdeas(ideas);
  return ok ? idea : null;
}

export async function deleteIdea(id: string): Promise<boolean> {
  const ideas = await readIdeas();
  const filtered = ideas.filter((i) => i.id !== id);
  if (filtered.length === ideas.length) return false;
  return writeIdeas(filtered);
}

export async function updateIdea(id: string, text: string): Promise<boolean> {
  const ideas = await readIdeas();
  const idx = ideas.findIndex((i) => i.id === id);
  if (idx < 0) return false;
  ideas[idx] = { ...ideas[idx], text: text.trim() };
  return writeIdeas(ideas);
}
