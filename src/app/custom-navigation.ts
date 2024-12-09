import { INavigationClient, NavigationOptions } from "@azure/msal-browser";
import { Capacitor } from "@capacitor/core";
import { InAppBrowser, ToolBarType } from "src/plugins/InAppBrowserPlugin_index";

export class CustomNavigationClient implements INavigationClient {

    constructor() {
    }

    async navigateInternal(url: string, options: NavigationOptions): Promise<boolean> {
        if (Capacitor.isNativePlatform()) {
            await InAppBrowser.openWebView({
                url: url,
                ignoreUntrustedSSLError: true,
                toolbarType: ToolBarType.BLANK
            });
        }
        else {
            if(options.noHistory) {
                window.location.replace(url);
            }
            else {
                window.location.assign(url);
            }
        }
        return true;
    }

    async navigateExternal(url: string, options: NavigationOptions): Promise<boolean> {
        if (Capacitor.isNativePlatform()) {
           await InAppBrowser.openWebView({
                url: url,
                ignoreUntrustedSSLError: true,
                toolbarType: ToolBarType.BLANK
            });
        }
        else {
            if(options.noHistory) {
                window.location.replace(url);
            }
            else {
                window.location.assign(url);
            }
        }
        return true;
    }
}