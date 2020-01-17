import { Location, Position, Range } from "vscode-languageserver"
import { Scan } from "rech-ts-commons";

/** Minimum word size */
const MIN_WORD_SIZE = 3;

/**
 * Class to find Batch references
 */
export class BatchReferencesFinder {

     /** Editor text*/
     private text: string;

     /**
      * Constructor of Find
      *
      * @param editor
      */
     constructor(text: string) {
          this.text = text;
     }

     /**
      * Find the declaration of the term
      *
      * @param term Term to find
      * @param uri current source uri
      */
     public findReferences(term: string, uri: string): Promise<Location[]> {
          return new Promise((resolve, reject) => {
               // If the word is too small
               if (term.length < MIN_WORD_SIZE) {
                    reject();
                    return;
               }
               let result: Location[] = [];
               const regexText = '[\\s\\.\\%\\!\\,\\)\\(](' + term + ')[\\s\\t\\n\\r\\.\\%\\!\\=\\,\\)\\(]';
               const elementUsage = new RegExp(regexText, "img");
               new Scan(this.text).scan(elementUsage, (iterator: any) => {
                    const range = Range.create(
                         Position.create(iterator.row, iterator.column + 1),
                         Position.create(iterator.row, iterator.column + 1)
                    );
                    result.push({ uri: uri, range: range });
               });
               resolve(result);
          });
     }

}