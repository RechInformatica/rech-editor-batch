import { extensions, window, commands, workspace, WorkspaceConfiguration, ConfigurationTarget } from "vscode";

const EXTENSION_SETTINGS_GROUP = 'rech.batch';
const ALERT_CONFLICTING_EXTENSIONS = 'alertConflictingExtensions';

/**
 * Class to check for extensions which are installed and conflict with Rech Bath extension
 */
export class ConflictingExtensionsChecker {

    check(): void {
        if (this.shouldAlert()) {
            const extensionName = 'Windows Bat Language Basics';
            const extensionId = 'vscode.bat';
            const vscodeBatExtension = extensions.getExtension(extensionId);
            if (vscodeBatExtension) {
                const yesButton = 'Yes';
                const dontAskAnymoreButton = `Don't ask anymore`;
                window.showWarningMessage(`The built-in extension ${extensionName} is enabled and conflicts with Rech Batch extension. Would you like to disable ${extensionName}?`, yesButton, 'Not now', dontAskAnymoreButton)
                    .then(selected => {
                        switch (selected) {
                            case yesButton:
                                commands.executeCommand('workbench.extensions.action.showExtensionsWithIds', [extensionId]);
                                window.showInformationMessage(`Please click on the gear icon and disable ${extensionName} extension.`);
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
        settingsGroup().update(ALERT_CONFLICTING_EXTENSIONS, newValue, ConfigurationTarget.Global);
    }

}

function settingsGroup(): WorkspaceConfiguration {
    return workspace.getConfiguration(EXTENSION_SETTINGS_GROUP);
}
