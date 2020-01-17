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
  WorkspaceEdit
} from "vscode-languageserver";

import { BufferSplitter, WordFinder } from "rech-ts-commons";
import { BatchDeclarationFinder } from "./BatchDeclarationFinder";
import { BatchReferencesFinder } from "./BatchReferencesFinder";

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments = new TextDocuments();

connection.onInitialize(async (_params: InitializeParams) => {
  return {
    capabilities: {
      textDocumentSync: documents.syncKind,
      definitionProvider: true,
      referencesProvider: true,
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
  connection.client.register(
    DidChangeConfigurationNotification.type,
    undefined
  );
});

connection.onDefinition((params: TextDocumentPositionParams): Thenable<Location | ResponseError<undefined>> => {
  return new Promise((resolve, reject) => {
    const fullDocument = documents.get(params.textDocument.uri);
    if (fullDocument) {
      const text = fullDocument.getText();
      const word = getLineText(text, params.position.line, params.position.character);
      new BatchDeclarationFinder(text)
        .findDeclaration(word, params.textDocument.uri)
        .then((location) => {
          resolve(location);
        }).catch(() => {
          resolve(undefined);
        });
    } else {
      reject(new ResponseError<undefined>(ErrorCodes.RequestCancelled, "Error to find declaration"));
    }
  })
});

connection.onReferences((params: ReferenceParams): Thenable<Location[] | ResponseError<undefined>> => {
  return new Promise((resolve, reject) => {
    const fullDocument = documents.get(params.textDocument.uri);
    if (fullDocument) {
      const text = fullDocument.getText();
      const word = getLineText(text, params.position.line, params.position.character);
      new BatchReferencesFinder(text)
          .findReferences(word, params.textDocument.uri)
          .then((locations) => {
            resolve(locations)
          }).catch(() => {
            reject();
          })
    } else {
      reject(new ResponseError<undefined>(ErrorCodes.RequestCancelled, "Error to find references"));
    }
  });
});

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
