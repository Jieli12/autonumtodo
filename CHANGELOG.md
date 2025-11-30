# Change Log

All notable changes to the "autonumtodo" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.1.1] - 2025-11-30

### Changed (Manual Trigger)

- **编号触发方式**：移除保存时自动编号行为，现在仅在执行快捷键或命令时才会更新编号。
- **激活事件**：扩展改为按命令激活，避免在启动时立即加载。
- **文档更新**：README 新增“Renumber All Tags (Cmd+Shift+A)”批量编号提示，强调保存不会触发编号。

### Removed (Manual Trigger)

- `autonumtodo.enableAutoNumberOnSave` 配置项。

## [0.1.0] - 2025-11-24

### Added

- **缓存机制**：缓存每个标签类型的最大编号，避免重复扫描文件，显著提升性能
- **文件夹排除功能**：支持通过配置排除特定文件夹（如 node_modules、.history、dist、out、.git）
- **保存时自动编号**：保存文件时自动给未编号的标签添加编号（可通过配置关闭）
- **全局重新编号命令**：新增命令 "Renumber All Tags in Workspace"，快捷键 `Cmd+Shift+A`
- **删除所有标签编号命令**：新增命令 "Remove All Tag Numbers in Workspace"，快捷键 `Cmd+Shift+D`
- **智能缓存失效**：文件内容变化时自动使缓存失效，保证编号准确性
- **配置选项**：
  - `autonumtodo.enableAutoNumberOnSave`：控制是否在保存时自动编号（默认开启）
  - `autonumtodo.excludePatterns`：自定义排除文件夹的 glob 模式列表

### Changed

- **激活事件优化**：从按需激活改为启动时激活（onStartupFinished），以支持文件保存监听
- **性能优化**：使用缓存机制减少文件扫描次数，提升大型项目的响应速度
- **文件扫描优化**：所有文件扫描操作现在都会应用排除模式，避免扫描不必要的文件

### Fixed

- 修复了在大型项目中扫描速度慢的问题
- 修复了可能扫描到历史文件和依赖包的问题

## [0.0.1] - 2025-03-01

### Initial Release

- 支持 6 种标签类型：TODO, BUG, FIX, NOTE, REVIEW, OPTIMISE
- 每种标签类型独立编号
- 支持多种编程语言：JavaScript, TypeScript, Python, Java, Go, C/C++, R, MATLAB, LaTeX, Markdown
- 快捷键支持：
  - `Cmd+Shift+T`：插入 TODO
  - `Cmd+Shift+B`：插入 BUG
  - `Cmd+Shift+F`：插入 FIX
  - `Cmd+Shift+N`：插入 NOTE
  - `Cmd+Shift+R`：插入 REVIEW
  - `Cmd+Shift+O`：插入 OPTIMISE
- 自动根据文件类型使用正确的注释符号
- 插入新标签时自动给工作区中所有未编号的同类型标签添加编号
