import { Location, Position, Range } from "vscode-languageserver";
import { Scan } from "rech-ts-commons";

/**
 * Class to find Batch declarations
 */
export class BatchDeclarationFinder {

     /** Editor text*/
     private buffer: string;

     /**
      * Constructor of Find
      *
      * @param buffer
      */
     constructor(buffer: string) {
          this.buffer = buffer;
     }

     /**
      * Find the declaration of the term
      *
      * @param label label declaration to find
      * @param uri current source uri
      */
     public findDeclaration(label: string, uri: string): Promise<Location> {
          return new Promise((resolve, reject) => {
               const regexText = "^\\:" + label + "$";
               const regex = new RegExp(regexText, "gm");
               let declaration: Location | undefined = undefined;
               new Scan(this.buffer).scan(regex, (iterator: any) => {
                    const firstCharRange = Range.create(
                         Position.create(iterator.row, 0),
                         Position.create(iterator.row, 0)
                    );
                    declaration = Location.create(uri, firstCharRange);
                    iterator.stop();

               });
               if (declaration) {
                    resolve(declaration)
               } else {
                    reject();
               }
          });
     }
}