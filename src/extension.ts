// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
	const tags = ["TODO", "BUG", "FIX", "NOTE", "REVIEW", "OPTIMISE"];

	const commentSymbols: { [key: string]: string } = {
		"js": "//", "ts": "//", "java": "//", "go": "//", "cpp": "//", "c": "//", "h": "//",
		"py": "#", "r": "#", "R": "#", "m": "%", "tex": "%", "md": "<!-- -->", "txt": "#"
	};

	const supportedExtensions = ["js", "ts", "py", "md", "txt", "cpp", "c", "h", "r", "tex", "java", "go", "m"];
	const filePattern = "**/*.{js,ts,py,md,txt,cpp,c,h,r,tex,R,java,go,m}";

	const isSupportedExtension = (extension: string) => supportedExtensions.includes(extension.toLowerCase());
	const isSupportedDocument = (document: vscode.TextDocument) => {
		const ext = path.extname(document.fileName).slice(1);
		return isSupportedExtension(ext);
	};

	// 缓存：存储每个标签类型的最大编号
	const tagNumberCache: { [key: string]: number } = {};
	let cacheValid = false;

	// 获取排除模式
	function getExcludePattern(): string {
		const config = vscode.workspace.getConfiguration('autonumtodo');
		const excludePatterns = config.get<string[]>('excludePatterns', [
			'**/node_modules/**',
			'**/.history/**',
			'**/dist/**',
			'**/out/**',
			'**/.git/**'
		]);
		return `{${excludePatterns.join(',')}}`;
	}

	// 使缓存失效
	function invalidateCache() {
		cacheValid = false;
		for (const tag of tags) {
			tagNumberCache[tag] = 0;
		}
	}

	// 监听文件变化，使缓存失效
	const fileWatcher = vscode.workspace.onDidChangeTextDocument((event) => {
		if (isSupportedDocument(event.document)) {
			for (const change of event.contentChanges) {
				const text = change.text;
				if (tags.some(tag => text.includes(tag))) {
					invalidateCache();
					break;
				}
			}
		}
	});
	context.subscriptions.push(fileWatcher);

	// 获取最大标签编号（使用缓存）
	async function getMaxTagNumber(tag: string, forceRefresh: boolean = false): Promise<number> {
		if (cacheValid && !forceRefresh && tagNumberCache[tag] !== undefined) {
			return tagNumberCache[tag];
		}

		const excludePattern = getExcludePattern();
		const allFiles = await vscode.workspace.findFiles(filePattern, excludePattern);
		let maxTagNumber = 0;
		const scannedUris = new Set<string>();

		for (const file of allFiles) {
			const doc = await vscode.workspace.openTextDocument(file);
			const text = doc.getText();
			const tagNumberedRegex = new RegExp(`${tag}-(\\d+):`, "g");
			let match;
			while ((match = tagNumberedRegex.exec(text)) !== null) {
				maxTagNumber = Math.max(maxTagNumber, parseInt(match[1], 10));
			}
			scannedUris.add(doc.uri.toString());
		}

		for (const doc of vscode.workspace.textDocuments) {
			if (!isSupportedDocument(doc)) {
				continue;
			}
			const key = doc.uri.toString();
			if (!doc.isDirty && scannedUris.has(key)) {
				continue;
			}
			const text = doc.getText();
			const tagNumberedRegex = new RegExp(`${tag}-(\\d+):`, "g");
			let match;
			while ((match = tagNumberedRegex.exec(text)) !== null) {
				maxTagNumber = Math.max(maxTagNumber, parseInt(match[1], 10));
			}
			scannedUris.add(key);
		}

		tagNumberCache[tag] = maxTagNumber;
		return maxTagNumber;
	}

	// 刷新所有标签的缓存
	async function refreshCache() {
		for (const tag of tags) {
			await getMaxTagNumber(tag, true);
		}
		cacheValid = true;
	}

	async function getDocumentsToProcess(scopeUri?: vscode.Uri): Promise<vscode.TextDocument[]> {
		const documents: vscode.TextDocument[] = [];
		const seen = new Set<string>();
		const openDocs = new Map<string, vscode.TextDocument>();

		for (const doc of vscode.workspace.textDocuments) {
			openDocs.set(doc.uri.toString(), doc);
		}

		const addDoc = (doc?: vscode.TextDocument) => {
			if (!doc || !isSupportedDocument(doc)) {
				return;
			}
			const key = doc.uri.toString();
			if (seen.has(key)) {
				return;
			}
			documents.push(doc);
			seen.add(key);
		};

		if (scopeUri) {
			addDoc(openDocs.get(scopeUri.toString()));
			if (!seen.has(scopeUri.toString())) {
				const scopeDoc = await vscode.workspace.openTextDocument(scopeUri);
				addDoc(scopeDoc);
			}
		} else {
			const excludePattern = getExcludePattern();
			const files = await vscode.workspace.findFiles(filePattern, excludePattern);
			for (const file of files) {
				const key = file.toString();
				const openDoc = openDocs.get(key);
				if (openDoc) {
					addDoc(openDoc);
					continue;
				}
				const doc = await vscode.workspace.openTextDocument(file);
				addDoc(doc);
			}
		}

		for (const doc of vscode.workspace.textDocuments) {
			if (!isSupportedDocument(doc)) {
				continue;
			}
			if (scopeUri && doc.uri.toString() !== scopeUri.toString()) {
				continue;
			}
			if (doc.isDirty || doc.isUntitled) {
				addDoc(doc);
			}
		}

		return documents;
	}

	// 辅助函数：对指定文件或工作区中的标签进行自动编号
	async function renumberTags(tagsToRenumber: string[], scopeUri?: vscode.Uri) {
		const documents = await getDocumentsToProcess(scopeUri);
		if (documents.length === 0) {
			return;
		}

		for (const tag of tagsToRenumber) {
			let maxTagNumber = await getMaxTagNumber(tag);

			for (const doc of documents) {
				const text = doc.getText();
				const tagUnnumberedRegex = new RegExp(`\\b${tag}:(?!\\d)`, "g");
				let edit = new vscode.WorkspaceEdit();
				let matches = [...text.matchAll(tagUnnumberedRegex)];
				for (let i = matches.length - 1; i >= 0; i--) {
					maxTagNumber++;
					const match = matches[i];
					const start = doc.positionAt(match.index!);
					const end = doc.positionAt(match.index! + match[0].length);
					edit.replace(doc.uri, new vscode.Range(start, end), `${tag}-${maxTagNumber}:`);
				}
				if (edit.size > 0) {
					await vscode.workspace.applyEdit(edit);
					tagNumberCache[tag] = maxTagNumber;
				}
			}
		}
	}

	// 注册全局重新编号命令
	const renumberAllCommand = vscode.commands.registerCommand('extension.renumberAllTags', async () => {
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "正在重新编号所有标签...",
			cancellable: false
		}, async (progress) => {
			await refreshCache();
			await renumberTags(tags);
			vscode.window.showInformationMessage('所有标签已重新编号完成！');
		});
	});
	context.subscriptions.push(renumberAllCommand);

	// 注册删除所有标签编号的命令
	const removeAllNumbersCommand = vscode.commands.registerCommand('extension.removeAllTagNumbers', async () => {
		const result = await vscode.window.showWarningMessage(
			'确定要删除工作区中所有标签的编号吗？此操作不可撤销！',
			{ modal: true },
			'确定',
			'取消'
		);

		if (result !== '确定') {
			return;
		}

		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "正在删除所有标签编号...",
			cancellable: false
		}, async (progress) => {
			const documents = await getDocumentsToProcess();
			let totalRemoved = 0;

			for (const doc of documents) {
				const text = doc.getText();
				let edit = new vscode.WorkspaceEdit();
				let hasChanges = false;

				// 对每个标签类型进行处理
				for (const tag of tags) {
					// 匹配 "TAG-数字:" 并替换为 "TAG:"
					const tagNumberedRegex = new RegExp(`\\b${tag}-(\\d+):`, "g");
					let matches = [...text.matchAll(tagNumberedRegex)];

					for (let i = matches.length - 1; i >= 0; i--) {
						const match = matches[i];
						const start = doc.positionAt(match.index!);
						const end = doc.positionAt(match.index! + match[0].length);
						edit.replace(doc.uri, new vscode.Range(start, end), `${tag}:`);
						totalRemoved++;
						hasChanges = true;
					}
				}

				if (hasChanges) {
					await vscode.workspace.applyEdit(edit);
				}
			}

			// 清空缓存
			invalidateCache();
			vscode.window.showInformationMessage(`已删除 ${totalRemoved} 个标签编号！`);
		});
	});
	context.subscriptions.push(removeAllNumbersCommand);

	tags.forEach(tag => {
		let disposable = vscode.commands.registerCommand(`extension.insert${tag}`, async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) return;

			const document = editor.document;
			const fileExtension = path.extname(document.fileName).slice(1);
			const commentSymbol = commentSymbols[fileExtension] || "//";

			// 使用缓存获取最大编号
			let maxTagNumber = await getMaxTagNumber(tag);

			const documents = await getDocumentsToProcess();

			for (const doc of documents) {
				const text = doc.getText();
				const tagUnnumberedRegex = new RegExp(`\\b${tag}:(?!\\d)`, "g");
				let edit = new vscode.WorkspaceEdit();
				let matches = [...text.matchAll(tagUnnumberedRegex)];
				for (let i = matches.length - 1; i >= 0; i--) {
					maxTagNumber++;
					const match = matches[i];
					const start = doc.positionAt(match.index!);
					const end = doc.positionAt(match.index! + match[0].length);
					edit.replace(doc.uri, new vscode.Range(start, end), `${tag}-${maxTagNumber}:`);
				}
				if (edit.size > 0) {
					await vscode.workspace.applyEdit(edit);
				}
			}

			// 更新缓存
			tagNumberCache[tag] = maxTagNumber;

			// 计算新的 TAG 号
			maxTagNumber++;

			// 插入新的 TAG，使用匹配的注释符号
			let newTag;
			if (fileExtension === "md") {
				newTag = `<!-- ${tag}-${maxTagNumber}: -->`;
			} else {
				newTag = `${commentSymbol} ${tag}-${maxTagNumber}: `;
			}

			editor.edit(editBuilder => {
				editBuilder.insert(editor.selection.active, newTag);
			});
		});

		context.subscriptions.push(disposable);
	});
}

export function deactivate() { }
