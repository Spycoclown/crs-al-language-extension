import * as fs from 'fs';
import { join } from 'path';
import * as vscode from 'vscode';
import { Settings } from './Settings';
import * as crsOutput from './CRSOutput';
import { AppInsights, EventName } from './ApplicationInsights';

export class SnippetFunctions {
    static SetupCRSAlSnippets() {
        let mySettings = Settings.GetConfigSettings(null);
        let setDisabled = mySettings[Settings.DisableCRSSnippets];

        this.SetupSnippets('waldo.crs-al-language', setDisabled);
    }

    static SetupDefaultAlSnippets() {
        let mySettings = Settings.GetConfigSettings(null);
        let setDisabled = mySettings[Settings.DisableDefaultAlSnippets];

        this.SetupSnippets('microsoft.al', setDisabled);
        this.SetupSnippets('ms-dynamics-smb.al', setDisabled);
    }

    static SetupSnippets(extension: string, setDisabled: boolean) {

        //console.log(process.env.USERPROFILE);

        function MicrosftAl(element) {
            return element.startsWith(extension);
        };

        fs.readdir(join(process.env.USERPROFILE, '.vscode', 'extensions'), (err, files) => {
            files.filter(MicrosftAl).forEach(file => {
                let microsoftAlSnippetsDir = join(process.env.USERPROFILE, '.vscode', 'extensions', file, 'snippets')
                let microsoftAlSnippetsDirDisabled = join(process.env.USERPROFILE, '.vscode', 'extensions', file, 'snippets-disabled')

                if (setDisabled) {
                    if (fs.existsSync(microsoftAlSnippetsDir)) {
                        fs.renameSync(microsoftAlSnippetsDir, microsoftAlSnippetsDirDisabled);
                        //console.log('Renamed ' + microsoftAlSnippetsDir + ' -> ' + microsoftAlSnippetsDirDisabled);
                        vscode.window.showInformationMessage('Snippets from ' + extension + ' successfully disabled. Please restart VSCode.');
                        crsOutput.showOutput('Snippets from ' + extension + ' successfully disabled. Please restart VSCode.');

                        let appInsightsEntryProperties: any = {};
                        appInsightsEntryProperties.extension = extension;
                        AppInsights.getInstance().trackEvent(EventName.SnippetsDisabled, appInsightsEntryProperties);
                    } else {
                        (!fs.existsSync(microsoftAlSnippetsDirDisabled)) ?
                            console.log('Snippet-directory not found - nothing to disable.') :
                            null;
                    }
                } else {
                    if (fs.existsSync(microsoftAlSnippetsDirDisabled)) {
                        fs.renameSync(microsoftAlSnippetsDirDisabled, microsoftAlSnippetsDir);
                        //console.log('Renamed ' + microsoftAlSnippetsDirDisabled + ' -> ' + microsoftAlSnippetsDir);
                        vscode.window.showInformationMessage('Snippets from ' + extension + ' successfully enabled. Please restart VSCode.');
                        crsOutput.showOutput('Snippets from ' + extension + ' successfully enabled. Please restart VSCode.');

                        let appInsightsEntryProperties: any = {};
                        appInsightsEntryProperties.extension = extension;
                        AppInsights.getInstance().trackEvent(EventName.SnippetsEnabled, appInsightsEntryProperties);
                    } else {
                        (!fs.existsSync(microsoftAlSnippetsDir)) ?
                            console.log('Disabled snippet-directory not found - nothing to enable.') :
                            null;
                    }
                }
            });

        });


    }
}