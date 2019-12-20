'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, ExtensionContext } from 'vscode';
import { Editor } from 'rech-editor-cobol';
import { BatchTabStopper } from './bat/BatchTabStopper';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(_context: any) {
    const context = <ExtensionContext>_context;
    //
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    //
    context.subscriptions.push(commands.registerCommand('rech.editor.batch.batchInsertCommentLine', async () => {
        await new Editor().insertLineAbove();
        commands.executeCommand("editor.action.commentLine");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.batch.tab', () => {
        new BatchTabStopper().processTabKey(true);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.batch.revtab', () => {
        new BatchTabStopper().processTabKey(false);
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}