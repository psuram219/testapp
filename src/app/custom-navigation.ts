import { INavigationClient, NavigationOptions } from "@azure/msal-browser";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { BackgroundColor, InAppBrowser, ToolBarType } from "src/plugins/InAppBrowserPlugin_index";

export class CustomNavigationClient implements INavigationClient {

    constructor() {
    }

    async navigateInternal(url: string, options: NavigationOptions): Promise<boolean> {
        if (Capacitor.isNativePlatform()) {
            await InAppBrowser.openWebView({
                url: url,
                ignoreUntrustedSSLError: true,
                toolbarType: ToolBarType.BLANK,
                backgroundColor: BackgroundColor.BLACK
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
                toolbarType: ToolBarType.BLANK,
                backgroundColor: BackgroundColor.WHITE
            });

            StatusBar.setOverlaysWebView({ overlay: true });
            this.setStatusBarStyleDark();
            StatusBar.setBackgroundColor({
              color: '#d31145'
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

    setStatusBarStyleDark = async () => {
        await StatusBar.setStyle({ style: Style.Dark });
      };
      
      setStatusBarStyleLight = async () => {
        await StatusBar.setStyle({ style: Style.Light });
      };
}