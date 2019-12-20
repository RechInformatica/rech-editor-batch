'use strict';

import { TabStopper } from "rech-editor-cobol";

/**
 * Class used to modify the Tab Stop tipically used with batch files.
 *
 * Originally extracted from https://github.com/spgennard/vscode_cobol/blob/ae519156bf569742b4cd0e81e5ed252369c89ecd/src/tabstopper.ts
 */
export class BatchTabStopper extends TabStopper {

    //@Overrride
    public getTabs(): number[] {
        return [0, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61];
    }
}
