import * as vscode from 'vscode';
import { MindstashSidebarProvider } from './sidebarProvider';
import { appendIdea, getMindstashUri } from './storage';

let sidebarProvider: MindstashSidebarProvider;
let capturePanel: vscode.WebviewPanel | undefined;

function getCaptureHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 12px; font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); color: var(--vscode-foreground); }
    textarea { width: 100%; min-height: 120px; padding: 8px; border: 1px solid var(--vscode-input-border); background: var(--vscode-input-background); color: var(--vscode-input-foreground); border-radius: 4px; font: inherit; resize: vertical; box-sizing: border-box; }
    textarea:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
    .hint { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 8px; }
  </style>
</head>
<body>
  <textarea id="input" placeholder="Type your idea... (supports *italic*, **bold**, \`code\`)"></textarea>
  <p class="hint">Enter: save and close &nbsp;•&nbsp; Ctrl+Enter / Cmd+Enter: save and add another &nbsp;•&nbsp; Shift+Enter: new line</p>
  <script>
    const vscode = acquireVsCodeApi();
    const input = document.getElementById('input');
    input.focus();
    function submit(andClose) {
      const text = input.value.trim();
      if (text) vscode.postMessage({ type: 'append', text, andClose });
      else if (andClose) vscode.postMessage({ type: 'close' });
    }
    input.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); submit(false); }
      else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(true); }
    });
    window.addEventListener('message', (e) => {
      if (e.data === 'clear') input.value = '';
    });
  </script>
</body>
</html>`;
}

export function activate(context: vscode.ExtensionContext): void {
  sidebarProvider = new MindstashSidebarProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('mindstash.ideaList', sidebarProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mindstash.showIdeaPopup', () => {
      if (!getMindstashUri()) {
        vscode.window.showWarningMessage('Mindstash: Open a workspace folder to capture ideas.');
        return;
      }
      if (capturePanel) {
        capturePanel.reveal();
        return;
      }
      capturePanel = vscode.window.createWebviewPanel(
        'mindstash.capture',
        'Mindstash – Capture idea',
        vscode.ViewColumn.One,
        { enableScripts: true }
      );
      capturePanel.webview.html = getCaptureHtml();
      capturePanel.webview.onDidReceiveMessage(async (msg) => {
        if (msg.type === 'append' && typeof msg.text === 'string') {
          const idea = await appendIdea(msg.text);
          if (idea) {
            await sidebarProvider.refresh();
            capturePanel?.webview.postMessage('clear');
            if (msg.andClose && capturePanel) {
              capturePanel.dispose();
              capturePanel = undefined;
            }
          }
        } else if (msg.type === 'close' && capturePanel) {
          capturePanel.dispose();
          capturePanel = undefined;
        }
      });
      capturePanel.onDidDispose(() => {
        capturePanel = undefined;
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mindstash.appendIdea', async () => {
      if (!getMindstashUri()) {
        vscode.window.showWarningMessage('Mindstash: Open a workspace folder to capture ideas.');
        return;
      }
      const text = await vscode.window.showInputBox({
        title: 'Mindstash – Idea',
        placeHolder: 'Type your idea... (Enter to save, Esc to cancel)',
        ignoreFocusOut: true,
      });
      if (text !== undefined && text.trim()) {
        const idea = await appendIdea(text.trim());
        if (idea) await sidebarProvider.refresh();
      }
    })
  );
}

export function deactivate(): void {}
