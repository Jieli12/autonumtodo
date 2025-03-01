# VSCode Auto-Numbered TODO Extension

## Description

This VSCode extension automatically numbers `TODO`, `BUG`, `FIX`, `NOTE`, `REVIEW`, and `OPTIMISE` tags across all project files. Each tag maintains its own independent numbering sequence. The extension supports multiple file types and uses the appropriate comment style for each file format.

## Features

- Automatically detects the highest existing tag number and increments it.
- Assigns numbers to unnumbered tags in all project files.
- Uses correct comment syntax based on file extension.
- Supports `TODO`, `BUG`, `FIX`, `NOTE`, `REVIEW`, and `OPTIMISE`.
- Configurable keybindings for quick insertion.

## Supported File Types and Comment Styles

| File Type                                        | Comment Style      |
| ------------------------------------------------ | ------------------ |
| `.js`, `.ts`, `.java`, `.go`, `.cpp`, `.c`, `.h` | `// TODO-1:`       |
| `.py`, `.r`, `.R`, `.txt`                        | `# TODO-1:`        |
| `.m`, `.tex`                                     | `% TODO-1:`        |
| `.md`                                            | `<!-- TODO-1: -->` |

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

- Use the keybindings below to insert an auto-numbered tag:
  - `Cmd+Shift+T` → Insert `TODO`
  - `Cmd+Shift+B` → Insert `BUG`
  - `Cmd+Shift+F` → Insert `FIX`
  - `Cmd+Shift+N` → Insert `NOTE`
  - `Cmd+Shift+R` → Insert `REVIEW`
  - `Cmd+Shift+O` → Insert `OPTIMISE`
- The extension will automatically renumber unnumbered tags in all project files.

## Uninstallation

To remove the extension:

```sh
code --uninstall-extension my-extension-0.0.1
```
