import { extensions, window, commands, workspace, WorkspaceConfiguration, ConfigurationTarget } from "vscode";

const EXTENSION_SETTINGS_GROUP = 'rech.batch';
const ALERT_CONFLICTING_EXTENSIONS = 'alertConflictingExtensions';

/**
 * Class to check for extensions which are installed and conflict with Rech Bath extension
 */
export class ConflictingExtensionsChecker {

    check(): void {
        if (this.shouldAlert()) {
            const extensionName = `'Windows Bat Language Basics'`;
            const extensionId = 'vscode.bat';
            const vscodeBatExtension = extensions.getExtension(extensionId);
            if (vscodeBatExtension) {
                const yesButton = 'Yes';
                const dontAskAnymoreButton = `Don't ask anymore`;
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                window.showInformationMessage(`The built-in extension ${extensionName} is enabled along with Rech Batch, which may lead to misbehavior while inserting 'rem' comments in lowercase. Would you like to manually disable the built-in extension ${extensionName}?`, yesButton, 'Not now', dontAskAnymoreButton)
                    .then(selected => {
                        switch (selected) {
                            case yesButton:
                                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                                commands.executeCommand('workbench.extensions.action.showExtensionsWithIds', [extensionId]);
                                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                                window.showInformationMessage(`Please click on the gear icon and manually disable ${extensionName} extension.`);
                                break;
                            case dontAskAnymoreButton:
                                this.disableAlertSetting();
                                break;
                        }
                    });
            }
        }
    };

    private shouldAlert(): boolean {
        const shouldAlert = settingsGroup().get<boolean>(ALERT_CONFLICTING_EXTENSIONS, true);
        return shouldAlert;
    }

    private disableAlertSetting(): void {
        const newValue = false;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        settingsGroup().update(ALERT_CONFLICTING_EXTENSIONS, newValue, ConfigurationTarget.Global);
    }

}

function settingsGroup(): WorkspaceConfiguration {
    return workspace.getConfiguration(EXTENSION_SETTINGS_GROUP);
}
