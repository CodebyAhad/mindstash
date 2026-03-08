# Mindstash

**Capture notes and ideas without leaving the IDE.**

Mindstash is a lightweight VS Code extension that lets you quickly jot down thoughts, snippets, and ideas while coding—without switching apps or breaking flow. All data stays in your workspace as plain JSON.

![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-007ACC?logo=visualstudiocode)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## Features

### Sidebar panel
- **Browse all ideas** – View your captured notes with timestamps in a dedicated sidebar
- **Search** – Filter ideas by text
- **Edit & delete** – Update or remove ideas inline
- **Chronological view** – Ideas ordered by creation time

### Quick capture popup
- **Multiple ideas** – Open a popup with a keyboard shortcut to type multiple ideas
- **Markdown support** – Use *italic*, **bold**, and `code` formatting
- **Append mode** – Add multiple ideas in one session; Ctrl+Enter / Cmd+Enter appends and keeps the popup open

### Quick input
- **Fast capture** – Open a input with a keyboard shortcut to type an idea instantly

### Local storage
- **Workspace-based** – Notes live in `.vscode/mindstash.json` inside your project
- **Plain JSON** – Human-readable, version-control friendly, easy to script or migrate
- **No cloud** – Your data never leaves your machine

---

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to **Extensions** (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for **Mindstash**
4. Click **Install**

### From VSIX
1. Download the `.vsix` file from the [Releases](https://github.com/CodebyAhad/mindstash/releases) page
2. Run: `code --install-extension mindstash-X.X.X.vsix`

### From source
```bash
git clone https://github.com/CodebyAhad/mindstash.git
cd mindstash
npm install
npm run compile
# Then: Run > Run Extension (F5) or package with vsce
```

---

## Usage

1. **Open a workspace folder** – Mindstash requires a workspace to store ideas
2. **Open the sidebar** – Click the Mindstash icon in the Activity Bar or use the shortcut
3. **Capture an idea** – Use the capture shortcut to open the popup, type, then Enter to save

---

## Keybindings

| Keybinding | Action |
|------------|--------|
| `Ctrl+Shift+I` (Win/Linux) / `Cmd+Shift+I` (Mac) | Open Mindstash sidebar |
| `Ctrl+Shift+A` (Win/Linux) / `Cmd+Shift+A` (Mac) | Open Capture popup |
| `Ctrl+Shift+R` (Win/Linux) / `Cmd+Shift+R` (Mac) | Open Quick input |

**In the capture popup:**
- **Enter** – Save the idea and close the popup
- **Ctrl+Enter** / **Cmd+Enter** – Save the idea and keep the popup open for another
- **Ctrl+Shift** / **Cmd+Enter** – To go down to next line

**In the quick input:**
- **Enter** – Save the idea and close the quick input.
- **Escape** – Close the quick input.

---

## Data format

Ideas are stored in `<workspaceFolder>/.vscode/mindstash.json`:

```json
[
  {
    "id": "abc123",
    "text": "Remember to refactor the auth module",
    "createdAt": 1709827200000
  }
]
```

- **id** – Unique identifier (UUID)
- **text** – Idea content (supports markdown)
- **createdAt** – Unix timestamp in milliseconds

You can edit this file directly or use scripts to import/export data.

---

## Requirements

- **VS Code** 1.75.0 or newer
- A workspace folder must be open

---

## License

[MIT](LICENSE.md) – see [LICENSE.md](LICENSE.md) for details.
