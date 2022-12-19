import { CompletionItem, CompletionItemKind, languages, MarkdownString, SnippetString, workspace, WorkspaceConfiguration } from "vscode";

/**
 * Class to generate snippets
 */
export class SnippetsGenerator {

    /**
     * Generate all the snippets completion items and provide them
     */
    generate(): void {
        languages.registerCompletionItemProvider(
            { scheme: "file", language: "bat" },
            {
                provideCompletionItems: async () => {
                    const snippets: CompletionItem[] = [];
                    const json = this.getSnippetsJson();
                    Object.entries(json).forEach(([_key, value]) => {
                        const completionItem = new CompletionItem(value.prefix, CompletionItemKind.Snippet);
                        completionItem.documentation = this.snippetTextToMarkdown(value.body);
                        completionItem.detail = value.description;
                        completionItem.insertText = new SnippetString(value.body);
                        snippets.push(completionItem);
                    });
                    return snippets;
                }
            }
        );
    };

    /**
     * Get the json from a json file according to the snippetsType configuration
     * 
     * @returns {Object} Snippets json
     */
    private getSnippetsJson(): Object {
        var filename = "../snippets/bat.json";
        if (this.getSnippetsType() == "Community") {
            filename = "../snippets/bat-community.json"
        }
        return require(filename);
    }

    /**
     * Returns the value of the snippetsType configuration
     * 
     * @returns {string}
     */
    private getSnippetsType(): string {
        return this.settingsGroup().get<string>("snippetsType", "Rech Internal");
    }

    /**
     *  Returns rech.batch settings group
     *  
     * @returns {WorkspaceCofiguration}
     */
    private settingsGroup(): WorkspaceConfiguration {
        return workspace.getConfiguration("rech.batch");
    }

    /**
     * Convert snippet text to markdown code block
     * 
     * @param snippetText Text to convert
     * @returns {MarkdownString} Markdown with the code block inside
     */
    private snippetTextToMarkdown(snippetText: string): MarkdownString {
        const markdownText = snippetText.replace(/\$[0-9]+|\${|}/g, "");
        const markdown = new MarkdownString();
        markdown.appendCodeblock(markdownText);
        return markdown;
    }
}