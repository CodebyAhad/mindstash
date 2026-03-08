import * as vscode from 'vscode';
import type { Idea } from './storage';

function getHtml(ideas: Idea[]): string {
  const ideasJson = JSON.stringify(ideas);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 8px; font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); color: var(--vscode-foreground); }
    .search { width: 100%; padding: 6px 8px; margin-bottom: 8px; border: 1px solid var(--vscode-input-border); background: var(--vscode-input-background); color: var(--vscode-input-foreground); border-radius: 4px; }
    .search:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
    .idea-list { list-style: none; padding: 0; margin: 0; }
    .idea { padding: 8px 10px; margin-bottom: 6px; border-radius: 4px; background: var(--vscode-editor-inactiveSelectionBackground); border: 1px solid transparent; }
    .idea:hover { border-color: var(--vscode-widget-border); }
    .idea-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
    .idea-time { font-size: 11px; color: var(--vscode-descriptionForeground); }
    .idea-actions { display: flex; gap: 4px; }
    .idea-actions button { background: none; border: none; cursor: pointer; padding: 2px 6px; color: var(--vscode-foreground); font-size: 12px; border-radius: 2px; }
    .idea-actions button:hover { background: var(--vscode-toolbar-hoverBackground); }
    .idea-body { word-break: break-word; line-height: 1.4; }
    .idea-body code { background: var(--vscode-textBlockQuote-background); padding: 1px 4px; border-radius: 2px; font-family: var(--vscode-editor-font-family); }
    .idea-edit { width: 100%; min-height: 60px; padding: 6px 8px; margin-top: 4px; border: 1px solid var(--vscode-input-border); background: var(--vscode-input-background); color: var(--vscode-input-foreground); border-radius: 4px; font: inherit; resize: vertical; }
    .idea-edit:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
    .empty { color: var(--vscode-descriptionForeground); padding: 12px; text-align: center; }
    .sidebar-title { margin: 0 0 8px 0; font-size: 14px; font-weight: bold; }
  </style>
</head>
<body>
  <h2 class="sidebar-title">Capture Your Ideas</h2>
  <input type="text" class="search" id="search" placeholder="Search ideas..." />
  <ul class="idea-list" id="list"></ul>
  <script>
    const ideas = ${ideasJson};
    const renderMarkdown = (raw) => {
      const escape = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
      let out = escape(raw);
      out = out.replace(/\\\`([^\\\`]+)\\\`/g, '<code>$1</code>');
      out = out.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
      out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');
      out = out.replace(/(?<!\\*)\\*([^*]+)\\*(?!\\*)/g, '<em>$1</em>');
      out = out.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');
      return out;
    };
    const formatTime = (ms) => {
      const d = new Date(ms);
      const now = Date.now();
      const diff = now - ms;
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return Math.floor(diff/60000) + 'm ago';
      if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago';
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };
    let searchQuery = '';
    function filterIdeas() {
      const q = searchQuery.toLowerCase().trim();
      return ideas.filter(i => !q || i.text.toLowerCase().includes(q));
    }
    function render() {
      const filtered = filterIdeas();
      const list = document.getElementById('list');
      list.innerHTML = '';
      if (filtered.length === 0) {
        const el = document.createElement('li');
        el.className = 'empty';
        el.textContent = searchQuery ? 'No ideas match your search.' : 'No ideas yet. Use Ctrl+Shift+A / Cmd+Shift+A to capture.';
        list.appendChild(el);
        return;
      }
      filtered.forEach(idea => {
        const li = document.createElement('li');
        li.className = 'idea';
        li.dataset.id = idea.id;
        const bodyHtml = renderMarkdown(idea.text);
        li.innerHTML = '<div class="idea-header"><span class="idea-time">' + formatTime(idea.createdAt) + '</span><div class="idea-actions"><button class="btn-edit" title="Edit">Edit</button><button class="btn-delete" title="Delete">Delete</button></div></div><div class="idea-body"></div>';
        const body = li.querySelector('.idea-body');
        body.innerHTML = bodyHtml;
        const btnEdit = li.querySelector('.btn-edit');
        const btnDelete = li.querySelector('.btn-delete');
        btnEdit.onclick = () => {
          if (li.querySelector('.idea-edit')) return;
          const textarea = document.createElement('textarea');
          textarea.className = 'idea-edit';
          textarea.value = idea.text;
          body.innerHTML = '';
          body.appendChild(textarea);
          textarea.focus();
          const save = () => {
            const newText = textarea.value.trim();
            body.innerHTML = newText ? renderMarkdown(newText) : '';
            if (newText !== idea.text) {
              idea.text = newText;
              const vscode = acquireVsCodeApi();
              vscode.postMessage({ type: 'update', id: idea.id, text: newText });
            }
          };
          textarea.addEventListener('blur', save);
          textarea.addEventListener('keydown', (e) => { if (e.key === 'Escape') save(); });
        };
        btnDelete.onclick = () => {
          const vscode = acquireVsCodeApi();
          vscode.postMessage({ type: 'delete', id: idea.id });
        };
        list.appendChild(li);
      });
    }
    document.getElementById('search').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
    });
    render();
    window.addEventListener('message', (e) => {
      const msg = e.data;
      if (msg.type === 'refresh' && Array.isArray(msg.ideas)) {
        ideas.length = 0;
        ideas.push(...msg.ideas);
        searchQuery = document.getElementById('search').value;
        render();
      }
    });
  </script>
</body>
</html>`;
}

export class MindstashSidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _context: vscode.ExtensionContext) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._context.extensionUri],
    };
    webviewView.webview.onDidReceiveMessage(async (msg) => {
      const { deleteIdea, updateIdea } = await import('./storage');
      if (msg.type === 'delete' && msg.id) {
        await deleteIdea(msg.id);
        await this.refresh();
      } else if (msg.type === 'update' && msg.id && typeof msg.text === 'string') {
        await updateIdea(msg.id, msg.text);
        await this.refresh();
      }
    });
    this._view.webview.html = getHtml([]);
    this.refresh();
  }

  async refresh(): Promise<void> {
    if (!this._view) return;
    const { readIdeas } = await import('./storage');
    const ideas = await readIdeas();
    this._view.webview.html = getHtml(ideas);
  }
}
