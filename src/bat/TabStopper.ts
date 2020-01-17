'use strict';

import { Position, Range, TextDocument, TextEditor, TextEditorEdit, Selection, window } from 'vscode';

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
     * Returns the configured tabstops or default values if no tabstop is configured
     */
    public getTabs(): number[] {
        return [0, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61];
    }

    /**
     * Executes the tab insertion or removal
     *
     * @param editor text editor
     * @param doc current document
     * @param sel selection
     * @param inserting boolean indicating whether the editor is inserting or removing a tab
     */
    private executeTab(editor: TextEditor, doc: TextDocument, sel: Selection[], inserting: boolean) {
        editor.edit(edit => {
            for (var x = 0; x < sel.length; x++) {
                if (sel[x].start.line === sel[x].end.line) {
                    var position = sel[x].start;
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
     * Removes a single selecton tab
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
                var selline = doc.getText(selection);
                if (selline !== null) {
                    var match = selline.match(pttrn);
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
     */
    private tabSize(pos: number) {
        var tabs = this.getTabs();
        var tab = 0;
        for (var index = 0; index < tabs.length; index++) {
            tab = tabs[index];

            if (tab > pos) {
                return tab - pos;
            }
        }
        // outside range?
        return 3 - ((pos - tabs[tabs.length - 1]) % 3);
    }


    /**
     * Returns the untab size
     *
     * @param pos current position
     */
    private unTabSize(pos: number) {
        var tabs = this.getTabs();
        if (pos > tabs[tabs.length - 1]) {
            if ((pos - tabs[tabs.length - 1]) % 3 === 0) {
                return 3;
            }
            return (pos - tabs[tabs.length - 1]) % 3;
        }
        for (var index = tabs.length - 1; index > -1; index--) {
            var tab = tabs[index];
            if (tab < pos) {
                return pos - tab;
            }
        }
        return 0;
    }

}

