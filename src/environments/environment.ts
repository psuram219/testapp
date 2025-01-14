// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  msalConfig: {
    auth: {
      clientId: "73830000-11f2-4bae-a002-533a8701dde5",
      redirectUri: "com.independenthealth.testapp://login" //com.independenthealth.
    }
  },
  apiConfig: {
    scopes: ["openid", "offline_access", "email"],
    uri: "b2cPolicies.authorities.signUpSignIn.authority"
  },
  b2cPolicies: {
    names: {
      signUpSignIn: "B2C_1A_MYIH-SIGNUP-LINK",
      resetPassword: "",
      editProfile: ""
    },
    authorities: {
      signUpSignIn: {
        authority: "https://ihb2c02.b2clogin.com/login.orchardparksoftware.com/B2C_1A_MYIH-SIGNUP-LINK"
      },
      resetPassword: {
        authority: ""
      },
      editProfile: {
        authority: ""
      }
    },
    authorityDomain: "https://ihb2c02.b2clogin.com"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
