# VSCode Auto-Numbered TODO Extension

## Description

This VSCode extension numbers `TODO`, `BUG`, `FIX`, `NOTE`, `REVIEW`, and `OPTIMISE` tags across all project files whenever you explicitly run one of its commands. Each tag maintains its own independent numbering sequence. The extension supports multiple file types and uses the appropriate comment style for each file format.

## Features

- Detects the highest existing tag number and increments it when you invoke a command.
- Assigns numbers to unnumbered tags in the current file or entire workspace only when you explicitly trigger a command.
- Uses correct comment syntax based on file extension.
- Supports `TODO:`, `BUG:`, `FIX:`, `NOTE:`, `REVIEW:`, and `OPTIMISE:`.
- Configurable keybindings for quick insertion.

## Supported File Types and Comment Styles

| File Type                                        | Comment Style      |
| ------------------------------------------------ | ------------------ |
| `.js`, `.ts`, `.java`, `.go`, `.cpp`, `.c`, `.h` | `// TODO-9:`       |
| `.py`, `.r`, `.R`, `.txt`                        | `# TODO-8:`        |
| `.m`, `.tex`                                     | `% TODO-7:`        |
| `.md`                                            | `<!-- TODO-6: -->` |

## Installation

1. **Build the extension**:

   ```sh
   npm install -g @vscode/vsce
   vsce package
   ```

   This creates a `.vsix` file.

2. **Install the extension locally**:

   ```sh
   code --install-extension my-extension-0.0.1.vsix
   ```

## Usage

- Use the keybindings below to insert an auto-numbered tag (renumbers matching tags across the workspace before inserting):
  - `Cmd+Shift+T` → Insert `TODO`
  - `Cmd+Shift+B` → Insert `BUG`
  - `Cmd+Shift+F` → Insert `FIX`
  - `Cmd+Shift+N` → Insert `NOTE`
  - `Cmd+Shift+R` → Insert `REVIEW`
  - `Cmd+Shift+O` → Insert `OPTIMISE`
- To bulk re-number every supported tag type on demand, run **"Renumber All Tags in Workspace"** (`Cmd+Shift+A`).
- To strip all tag numbers (turn `TODO-5:` back into `TODO-4:`), run **"Remove All Tag Numbers in Workspace"** (`Cmd+Shift+D`).
- 保存文件不会触发编号，只有在执行上述命令或快捷键时才会更新编号。

## Uninstallation

To remove the extension:

```sh
code --uninstall-extension my-extension-0.0.1
```
