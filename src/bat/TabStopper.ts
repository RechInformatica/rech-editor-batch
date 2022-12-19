'use strict';

import { Position, Range, TextDocument, TextEditor, TextEditorEdit, Selection, window, WorkspaceConfiguration, workspace } from 'vscode';

/**
 * Class used to modify the Tab Stop tipically used with Batch files.
 *
 * Originally extracted from https://github.com/spgennard/vscode_cobol/blob/ae519156bf569742b4cd0e81e5ed252369c89ecd/src/tabstopper.ts
 */
export class TabStopper {

    /**
     * Processes the Tab or Reverse-tab with the specified stops
     *
     * @param inserting true if needs to insert tab
     */
    public processTabKey(inserting: boolean) {
        const editor = window.activeTextEditor;
        if (editor) {
            const doc = editor.document;
            const sel = editor.selections;
            this.executeTab(editor, doc, sel, inserting);
        }
    }

    /**
     * Return the first two tab stops according to the configuration and default values
     *
     * @return {number[]}
     */
    private getTabs(): number[] {
        return [0, this.getInitialTabAlignment()];
    }

    /**
     * Executes the tab insertion or removal
     *
     * @param editor text editor
     * @param doc current document
     * @param sel selection
     * @param inserting boolean indicating whether the editor is inserting or removing a tab
     */
    private executeTab(editor: TextEditor, doc: TextDocument, sel: readonly Selection[], inserting: boolean) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        editor.edit(edit => {
            for (var x = 0; x < sel.length; x++) {
                if (sel[x].start.line === sel[x].end.line) {
                    const position = sel[x].start;
                    if (inserting) {
                        this.singleSelectionTab(edit, position);
                    } else {
                        this.singleSelectionUnTab(edit, doc, position);
                    }
                } else {
                    if (inserting) {
                        this.multipleSelectionTab(edit, sel[x]);
                    } else {
                        this.multipleSelectionUnTab(edit, doc, sel[x]);
                    }
                }
            }
        });
    }

    /**
     * Inserts a single selection tab
     *
     * @param edit text editor
     * @param pos position to insert the tab
     */
    private singleSelectionTab(edit: TextEditorEdit, pos: Position) {
        const size = this.tabSize(pos.character);
        edit.insert(pos, ' '.repeat(size));
    }

    /**
     * Get the value of the active text editor's tab size
     *
     * @return {number} Tab size
     */
    private getEditorTabValue(): number {
        const codeTabSizeConfiguration = window.activeTextEditor?.options.tabSize;
        var codeTabSize: number;
        if (codeTabSizeConfiguration == undefined) {
            codeTabSize = 3
        } else {
            codeTabSize = Number(codeTabSizeConfiguration);
        }
        return codeTabSize;
    }

    /**
     * Removes a single selecton tab
     *
     * @param edit text editor
     * @param doc current document
     * @param pos position to insert the tab
     */
    private singleSelectionUnTab(edit: TextEditorEdit, doc: TextDocument, pos: Position) {
        const size = this.unTabSize(pos.character);
        const range = new Range(pos.line, pos.character - size, pos.line, pos.character);
        const txt = doc.getText(range);
        if (txt === ' '.repeat(size)) {
            edit.delete(range);
        }
    }

    /**
     * Performs multiple tab selecton
     *
     * @param edit editor
     * @param sel selection
     */
    private multipleSelectionTab(edit: TextEditorEdit, sel: Selection) {
        for (let line = sel.start.line; line <= sel.end.line; line++) {
            const pos = new Position(line, sel.start.character);
            this.singleSelectionTab(edit, pos);
        }
    }

    /**
     * Performs ubtab with multiple selecions
     *
     * @param edit current text editor
     * @param doc text document
     * @param selection selection
     */
    private multipleSelectionUnTab(edit: TextEditorEdit, doc: TextDocument, selection: Selection) {
        for (let line = selection.start.line; line <= selection.end.line; line++) {
            var charpos = selection.start.character;
            if (charpos === 0) {
                const pttrn = /^\s*/;
                const selline = doc.getText(selection);
                if (selline !== null) {
                    const match = selline.match(pttrn);
                    if (match !== null) {
                        charpos = match[0].length;
                    }
                }
            }
            const pos = new Position(line, charpos);
            this.singleSelectionUnTab(edit, doc, pos);
        }
    }

    /**
     * Returns the tab size
     *
     * @param pos current position
     * @return {number}
     */
    private tabSize(pos: number): number {
        const tabs = this.getTabs();
        var tab = 0;
        for (var index = 0; index < tabs.length; index++) {
            tab = tabs[index];

            if (tab > pos) {
                return tab - pos;
            }
        }
        // outside range?
        const tabValue = this.getEditorTabValue();
        return tabValue - ((pos - tabs[tabs.length - 1]) % tabValue);
    }

    /**
     * Get the value of the initial tab alignment according to the configuration or the active editor tab value
     *
     * @return {number} Initial tab alignment
     */
    private getInitialTabAlignment(): number {
        const tabConfigString = this.settingsGroup().get<string>("initialTabAlignment", "4");
        if (tabConfigString == "off") {
            return this.getEditorTabValue();
        }
        return Number(tabConfigString);
    }

    /**
     * Returns the untab size
     *
     * @param pos current position
     * @return {number}
     */
    private unTabSize(pos: number): number {
        const tabs = this.getTabs();
        if (pos > tabs[tabs.length - 1]) {
            const tabSize = this.getEditorTabValue();
            if ((pos - tabs[tabs.length - 1]) % tabSize === 0) {
                return tabSize;
            }
            return (pos - tabs[tabs.length - 1]) % tabSize;
        }
        for (var index = tabs.length - 1; index > -1; index--) {
            const tab = tabs[index];
            if (tab < pos) {
                return pos - tab;
            }
        }
        return 0;
    }

    /**
     * Return the settings group of Rech Batch extension
     *
     * @return {WorkspaceConfiguration}
     */
    private settingsGroup(): WorkspaceConfiguration {
        return workspace.getConfiguration("rech.batch");
    }

}

