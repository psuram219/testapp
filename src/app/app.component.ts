import { Component, Inject, OnDestroy } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { AccountInfo, AuthenticationResult, EventMessage, EventType, IdTokenClaims, InteractionStatus, InteractionType, PopupRequest, PromptValue, RedirectRequest, SsoSilentRequest } from '@azure/msal-browser';
import { filter, Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CustomNavigationClient } from './custom-navigation';
import { InAppBrowser } from 'src/plugins/InAppBrowserPlugin_index';
import { StatusBar, Style } from '@capacitor/status-bar';

type IdTokenClaimsWithPolicyId = IdTokenClaims & {
  acr?: string,
  tfp?: string,
};

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy {

  loginDisplay = false;

  destroyerSubject = new Subject<void>();

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) { 
    InAppBrowser.addListener('urlChangeEvent', (data) => {
      console.log(data);
    });
    this.authService.instance.setNavigationClient(new CustomNavigationClient());
  }

  subscribeToEvents() {
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.ACCOUNT_ADDED || msg.eventType === EventType.ACCOUNT_REMOVED),
      )
      .subscribe((result: EventMessage) => {
        if (this.authService.instance.getAllAccounts().length === 0) {
          console.log('Navigated from here');
          window.location.pathname = "/";
        } else {
          this.setLoginDisplay();
        }
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.destroyerSubject)
      )
      .subscribe(() => {
        this.setLoginDisplay();
        this.checkAndSetActiveAccount();
      });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS
          || msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
          || msg.eventType === EventType.SSO_SILENT_SUCCESS),
        takeUntil(this.destroyerSubject)
      )
      .subscribe((result: EventMessage) => {

        let payload = result.payload as AuthenticationResult;
        let idtoken = payload.idTokenClaims as IdTokenClaimsWithPolicyId;

        if (idtoken.acr === environment.b2cPolicies.names.signUpSignIn || idtoken.tfp === environment.b2cPolicies.names.signUpSignIn) {
          this.authService.instance.setActiveAccount(payload.account);
        }

        /**
         * For the purpose of setting an active account for UI update, we want to consider only the auth response resulting
         * from SUSI flow. "acr" claim in the id token tells us the policy (NOTE: newer policies may use the "tfp" claim instead).
         * To learn more about B2C tokens, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
         */
        if (idtoken.acr === environment.b2cPolicies.names.editProfile ||
          idtoken.tfp === environment.b2cPolicies.names.editProfile) {

          // retrieve the account from initial sing-in to the app
          const originalSignInAccount = this.authService.instance.getAllAccounts()
            .find((account: AccountInfo) =>
              account.idTokenClaims?.oid === idtoken.oid
              && account.idTokenClaims?.sub === idtoken.sub
              && ((account.idTokenClaims as IdTokenClaimsWithPolicyId).acr === environment.b2cPolicies.names.signUpSignIn
                || (account.idTokenClaims as IdTokenClaimsWithPolicyId).tfp === environment.b2cPolicies.names.signUpSignIn)
            );

          let signUpSignInFlowRequest: SsoSilentRequest = {
            authority: environment.b2cPolicies.authorities.signUpSignIn.authority,
            account: originalSignInAccount
          };

          // silently login again with the signUpSignIn policy
          this.authService.ssoSilent(signUpSignInFlowRequest);
        }

        /**
         * Below we are checking if the user is returning from the reset password flow.
         * If so, we will ask the user to reauthenticate with their new password.
         * If you do not want this behavior and prefer your users to stay signed in instead,
         * you can replace the code below with the same pattern used for handling the return from
         * profile edit flow (see above ln. 74-92).
         */
        if (idtoken.acr === environment.b2cPolicies.names.resetPassword || idtoken.tfp === environment.b2cPolicies.names.resetPassword) {
          let signUpSignInFlowRequest: RedirectRequest | PopupRequest = {
            authority: environment.b2cPolicies.authorities.signUpSignIn.authority,
            scopes: [...environment.apiConfig.scopes],
            prompt: PromptValue.LOGIN // force user to reauthenticate with their new password
          };

          this.login(signUpSignInFlowRequest);
        }

        //this.authService.instance.setNavigationClient(new NavigationAuthenticationClient())

        return result;
      });

  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  checkAndSetActiveAccount() {
    let activeAccount = this.authService.instance.getActiveAccount();

    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }

  logout() {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      this.authService.logoutPopup({
        mainWindowRedirectUri: "/"
      });
    } else {
      this.authService.logoutRedirect();
    }
  }

  loginRedirect() {
    if (this.msalGuardConfig.authRequest) {
        this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
    } else {
        this.authService.loginRedirect();
    }
  }

  login(userFlowRequest?: RedirectRequest | PopupRequest) {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
        if (this.msalGuardConfig.authRequest) {
            this.authService.loginPopup({ ...this.msalGuardConfig.authRequest, ...userFlowRequest } as PopupRequest)
                .subscribe((response: AuthenticationResult) => {
                    this.authService.instance.setActiveAccount(response.account);
                });
        } else {
            this.authService.loginPopup(userFlowRequest)
                .subscribe((response: AuthenticationResult) => {
                    this.authService.instance.setActiveAccount(response.account);
                });
        }
    } else {
        if (this.msalGuardConfig.authRequest) {
            this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest, ...userFlowRequest } as RedirectRequest);
        } else {
            this.authService.loginRedirect(userFlowRequest);
        }
    }
  }

  ngOnDestroy(): void {
    this.destroyerSubject.next();
    this.destroyerSubject.complete();
  }

}
