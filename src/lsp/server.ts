/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
"use strict";

import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  DidChangeConfigurationNotification,
  Location,
  InitializeParams,
  ReferenceParams,
  RenameParams,
  TextDocumentPositionParams,
  CompletionItem,
  ResponseError,
  ErrorCodes,
  WorkspaceEdit,
  TextEdit,
  Range,
  Position,
  TextDocumentSyncKind
} from "vscode-languageserver/node";

import { TextDocument } from 'vscode-languageserver-textdocument';

import { BufferSplitter, WordFinder } from "rech-ts-commons";
import { BatchDeclarationFinder } from "./BatchDeclarationFinder";
import { BatchReferencesFinder } from "./BatchReferencesFinder";

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

connection.onInitialize(async (_params: InitializeParams) => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      definitionProvider: true,
      referencesProvider: true,
      renameProvider: true,
    }
  };
});

/**
 * Retrun if the character that has been typed is a enter
 *
 * @param ch
 */
export function hasTypedEnter(ch: string) {
  return ch == "\n";
}

connection.onInitialized(() => {
  // Register for all configuration changes.
  void connection.client.register(
    DidChangeConfigurationNotification.type,
    undefined
  );
});

connection.onDefinition((params: TextDocumentPositionParams): Thenable<Location | ResponseError<undefined> | undefined> => {
  return new Promise((resolve, reject) => {
    const fullDocument = documents.get(params.textDocument.uri);
    if (fullDocument) {
      const text = fullDocument.getText();
      const word = getLineText(text, params.position.line, params.position.character);
      new BatchDeclarationFinder(text)
        .findDeclaration(word, params.textDocument.uri)
        .then((location) => resolve(location))
        .catch(() => resolve(undefined));
    } else {
      reject(new ResponseError<undefined>(ErrorCodes.UnknownErrorCode, "Error to find declaration"));
    }
  })
});

connection.onReferences((params: ReferenceParams): Thenable<Location[] | ResponseError<undefined> | undefined> => {
  return new Promise((resolve, reject) => {
    const fullDocument = documents.get(params.textDocument.uri);
    if (fullDocument) {
      const text = fullDocument.getText();
      const word = getLineText(text, params.position.line, params.position.character);
      new BatchReferencesFinder(text)
        .findReferences(word, params.textDocument.uri)
        .then((locations) => resolve(locations))
        .catch(() => reject(undefined));
    } else {
      return reject(new ResponseError<undefined>(ErrorCodes.UnknownErrorCode, "Error to find references"));
    }
  });
});

connection.onRenameRequest((params: RenameParams): Thenable<WorkspaceEdit | ResponseError<undefined> | undefined> => {
  return new Promise((resolve, reject) => {
    const fullDocument = documents.get(params.textDocument.uri);
    if (fullDocument) {
      const text = fullDocument.getText();
      const word = getLineText(text, params.position.line, params.position.character);
      new BatchReferencesFinder(text)
        .findReferences(word, params.textDocument.uri)
        .then((locations) => {
          const textEdits: TextEdit[] = convertLocationsToTextEdits(locations, word, params.newName);
          resolve({ changes: { [params.textDocument.uri]: textEdits } })
        }).catch(() => resolve(undefined));
    } else {
      reject(new ResponseError<undefined>(ErrorCodes.UnknownErrorCode, "Error to rename"));
    }
  });

});

/**
 * Converts the specified Location array into an TextEdit array
 *
 * @param locations locations to be converted
 */
export function convertLocationsToTextEdits(locations: Location[], oldName: string, newName: string): TextEdit[] {
  const textEdits: TextEdit[] = [];
  locations.forEach((currentLocation) => {
    const line = currentLocation.range.start.line;
    const column = currentLocation.range.start.character;
    textEdits.push({
      newText: newName,
      range: Range.create(
        Position.create(line, column),
        Position.create(line, column + oldName.length))
    });
  });
  return textEdits;
}

/**
 * Returns the specified line within the document text
 *
 * @param documentText document text
 * @param line line
 * @param column column
 */
export function getLineText(
  documentText: string,
  line: number,
  column: number
) {
  const currentLine = BufferSplitter.split(documentText)[line];
  const batchRegEx = /([a-zA-Z0-9_\-])+/g
  const word = WordFinder.findWordWithRegex(currentLine, column, batchRegEx);
  return word;
}


// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// Listen on the connection
connection.listen();

// This handler resolve additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    return item;
  }
);
