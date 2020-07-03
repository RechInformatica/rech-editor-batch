import { Scan } from "rech-ts-commons";

/** Minimum word size */
const MIN_WORD_SIZE = 3;

/**
 * Class which provide references for Batch elements.
 * 
 * This class do not have any dependence with VSCode API so
 * unit tests can be run.
 */
export class BatchReferencesProvider {

  /**
   * Find the declaration of the term
   *
   * @param text buffer text in which ter will be searched
   * @param term Term to find
   */
  public findReferences(text: string, term: string): Promise<BatchElementPosition[]> {
    return new Promise((resolve, reject) => {
      // If the word is too small
      if (term.length < MIN_WORD_SIZE) {
        reject();
        return;
      }
      const result: BatchElementPosition[] = [];
      const regexText = '[\\s\\.\\%\\!\\:\\,\\)\\(](' + term + ')[\\s\\t\\n\\r\\.\\%\\!\\:\\=\\,\\)\\(]';
      const elementUsage = new RegExp(regexText, "img");
      new Scan(text).scan(elementUsage, (iterator: any) => {
        if (!this.shouldIgnoreElement(term, iterator.lineContent, iterator.column)) {
          result.push({ line: iterator.row, column: iterator.column + 1 });
        }
      });
      resolve(result);
    });
  }

  private shouldIgnoreElement(term: string, lineText: string, column: number): boolean {
    let enclosed = this.isEnclosedInQuotes(lineText, column);
    let variable = this.isVariableReference(term, lineText, column);
    return enclosed && !variable;
  }

  private isEnclosedInQuotes(lineText: string, column: number): boolean {
    let insideQuotes = false;
    for (let i = 0; i < lineText.length && i < column; i++) {
      const currentChar = lineText[i];
      if (currentChar === "\"") {
        insideQuotes = !insideQuotes;
      }
    }
    return insideQuotes;
  }

  private isVariableReference(term: string, lineText: string, column: number): boolean {
    if (column == 0 || column == lineText.length) {
      return false;
    }
    const symbols = ["%", "!"];
    let variable = false;
    for (let i = 0; i < symbols.length && !variable; i++) {
      const symbol = symbols[i];
      const indexBeforeElement = column;
      const indexAfterElement = column + term.length + 1;
      if (lineText[indexBeforeElement] == symbol && lineText[indexAfterElement] == symbol) {
        variable = true;
      }
    }
    return variable;
  }

}

export interface BatchElementPosition {
  line: number,
  column: number
}
