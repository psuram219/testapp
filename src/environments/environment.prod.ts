export const environment = {
  production: true,
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
