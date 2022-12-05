import { Location, Position, Range } from "vscode-languageserver";
import { BatchReferencesProvider, BatchElementPosition } from "./BatchReferencesProvider";

/**
 * Class to find Batch references
 */
export class BatchReferencesFinder {

  /**
   * Constructor of Find
   * 
   * @param text editor text
   */
  constructor(private text: string) {}

  /**
   * Find the declaration of the term
   *
   * @param term Term to find
   * @param uri current source uri
   */
  public findReferences(term: string, uri: string): Promise<Location[]> {
    return new Promise((resolve, reject) => {
      new BatchReferencesProvider()
        .findReferences(this.text, term)
        .then((positions) => {
          const result = this.convertBatchPositionsToLocations(positions, uri);
          resolve(result);
        })
        .catch(() => reject());
    });
  }

  private convertBatchPositionsToLocations(positions: BatchElementPosition[], uri: string): Location[] {
    const result: Location[] = [];
    positions.forEach(position => {
      const range = Range.create(
        Position.create(position.line, position.column),
        Position.create(position.line, position.column)
      );
      result.push({ uri: uri, range: range });
    });
    return result;
  }
}
