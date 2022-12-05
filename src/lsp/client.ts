import { ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';
import * as path from 'path';

/**
 * Language Server Provider client
 */
export class Client {

	/** Client instance of the Language Server Provider (LSP) */
	private static client: LanguageClient | undefined;

	/**
     * Starts the LSP server and establishes communication between them
     */
	public static startServerAndEstablishCommunication(context: ExtensionContext) {
		// The server is implemented in node
		const serverModule = context.asAbsolutePath(
			path.join('out', 'lsp', 'server.js')
		);
		// The debug options for the server
		// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
		const debugOptions = { execArgv: ['--nolazy', '--inspect=10999'] };
		// If the extension is launched in debug mode then the debug server options are used
		// Otherwise the run options are used
		const serverOptions: ServerOptions = {
			run: { module: serverModule, transport: TransportKind.ipc },
			debug: {
				module: serverModule,
				transport: TransportKind.ipc,
				options: debugOptions
			}
		};
		// Options to control the language client
		const clientOptions: LanguageClientOptions = {
			// Register the server for Batch documents
			documentSelector: [{ scheme: 'file', language: 'bat' }]
		};
		// Create the language client and start the client.
		Client.client = new LanguageClient(
			'batchLanguageServer',
			'Batch Language Server',
			serverOptions,
			clientOptions
		);
		// Start the client. This will also launch the server
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		Client.client.start();
	}


	/**
	 * Stops the LSP client if it has ben previously started
	 */
	public static stopClient() {
		if (!Client.client) {
			return undefined;
		}
		return Client.client.stop();
	}

}