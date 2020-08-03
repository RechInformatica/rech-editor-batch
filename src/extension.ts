'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, ExtensionContext } from 'vscode';
import { Client } from './lsp/client';
import { TabStopper } from './bat/TabStopper';
import { ConflictingExtensionsChecker } from './ConflictingExtensionsChecker';
// import { BatchTabStopper } from './bat/BatchTabStopper';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(_context: any) {

    new ConflictingExtensionsChecker().check();

    const context = <ExtensionContext>_context;
    Client.startServerAndEstablishCommunication(context);
    //
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    //
    context.subscriptions.push(commands.registerCommand('rech.editor.batch.batchInsertCommentLine', async () => {
        await commands.executeCommand('editor.action.insertLineBefore');
        await commands.executeCommand('editor.action.trimTrailingWhitespace');
        await commands.executeCommand('editor.action.commentLine');
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.batch.tab', () => {
        new TabStopper().processTabKey(true);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.batch.revtab', () => {
        new TabStopper().processTabKey(false);
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
