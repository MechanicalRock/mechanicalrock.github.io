---
layout: post
font: serif
title: Azure AD Authentication in Cypress Tests with MSAL
date: 2022-07-18
highlight: monokai
author: Tim Veletta
tags: azure ad activedirectory cypress authentication msal react
---

Its been a little over 2 years since I wrote about [Azure AD authentication in Cypress tests](2020-05-05-azure-ad-authentication-cypress.md) and as such, it is out of date. In that time, [Cypress](https://cypress.io) has gone from strength-to-strength but the big change in that time has been the [migration from the Azure Active Directory Library (ADAL) to the Microsoft Authentication Library (MSAL)](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-migration). In this post, I will discuss how to authenticate with MSAL in your Cypress tests making reference to the change in approach from that post 2 years ago as a result of the migration.

> If you'd just like to get the solution I've created a demo repo on [Github](https://github.com/MechanicalRock/cypress-msal-demo) which you can reference.

The issue that originally inspired this blog post is that when a user tries to log into an app with Azure Active Directory (AD), they are redirected to the login portal to login and allow the application to get a valid token. However, Cypress doesn't like this approach since it applies the same strict [same-origin](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) policy that browsers do thus failing the test when it tries to access a different domain to your app.

> Since version 9.6.0, Cypress now supports [multi-domain workflows](https://cypress.io/blog/2022/04/25/cypress-9-6-0-easily-test-multi-domain-workflows-with-cy-origin/) but if we use this approach, we would have to write a test that validates the Microsoft authentication flow which isn't ideal because we don't _control_ it.

We can work around this issue by performing the Azure AD login process in the background so that when the tests run, there is already a valid token. Since most web applications will use `@azure/msal-browser` under the hood, it should also be web framework agnostic and require no changes to the application code.

So, at a high level we will:

1. Acquire a token from Azure AD 🔑
2. Save the token to the session storage 💾
3. Run the test ✅

We will do all this in a [Cypress command](https://docs.cypress.io/api/cypress-api/custom-commands) so that we can run `cy.login()` to authenticate with Azure AD before our tests run. Custom commands are created in the `cypress/support/commands.ts` file by default.

## 1. Acquire a token from Azure AD 🔑

The first step involves making a request in the background using some of the information available on your Azure dashboard under _App Registrations_. For this we will need the **client and tenant IDs** as well as generating a **client secret**. One important change from the previous article is that we are now using a `grant_type` of `password` instead of `client_credentials` which I will discuss further in _E2E testing approach_. As a result, we will also need to create a test user so we can use their login credentials to run the tests.

It is important to note that this test user:

- Must have MFA **disabled**
- Must **not** be a guest user
- You must log in at least once via the UI to grant consent to the requested scopes

Now, we can emulate the request a browser makes to the Azure token endpoint when a user enters their login details on the page.

```javascript
Cypress.Commands.add('login', () => {
 cy.request({
  method: 'POST',
  url: `https://login.microsoftonline.com/${Cypress.env(
   'AZURE_TENANT_ID'
  )}/oauth2/v2.0/token`,
  form: true,
  body: {
   grant_type: 'password',
   client_id: Cypress.env('AZURE_CLIENT_ID'),
   client_secret: Cypress.env('AZURE_CLIENT_SECRET'),
   scope: 'openid profile email',
   username: Cypress.env('USERNAME'),
   password: Cypress.env('PASSWORD'),
  },
 }).then((response) => {
  injectTokens(response);
 });
});
```

As you can see, there are a number of references to `Cypress.env('...')`; we can store all these values in the `env` within our `cypress.config.ts` (as shown below) but we should be careful not to commit this change as the **client secret** and **password** are secret values. Instead we should pass them through environment variables when running tests on our CI server. i.e. `CYPRESS_AZURE_CLIENT_SECRET` and `CYPRESS_PASSWORD`

```json
{
 "env": {
  "AZURE_CLIENT_ID": "<Azure client ID>",
  "AZURE_TENANT_ID": "<Azure tenant ID>",
  "AZURE_CLIENT_SECRET": "<Azure client secret>",
  "USERNAME": "test.user@mechanicalrock.io",
  "PASSWORD": "password1234"
 }
}
```

Now that we can successfully obtain a token for our test user, we can now move onto saving that token into session storage so that it gets picked up by `@azure/msal-browser`.

## 2. Save the token to the session storage 💾

Prior to making a login request, `@azure/msal-browser` checks the session storage for a number of values to see if a user is currently logged in and has a valid session token. If so, the user is not redirected to log in again and can simply continue using the app as expected. This step involves populating those session storage values that `@azure/msal-browser` expects so that we can convince it that we have already logged in through the browser.

![MSAL browser session values](/img/blog/azure-ad-cypress/msal-browser-session.png)

We begin by installing the `jsonwebtoken` library so that we can decode the token response from Azure AD. Next, we extract some values that are used in multiple places in the session storage. These include:

- `idTokenClaims`
- `localAccountId`
- `homeAccountId`

```javascript
const injectTokens = (tokenResponse: any) => {
 const environment = 'login.windows.net';
 const idTokenClaims: JwtPayload = decode(tokenResponse.id_token);
 const localAccountId = idTokenClaims.oid || idTokenClaims.sid;
 const clientId = Cypress.env('AZURE_CLIENT_ID');
 const realm = Cypress.env('AZURE_TENANT_ID');
 const homeAccountId = `${localAccountId}.${realm}`;
 ...
}
```

```javascript
const tokenId = `${homeAccountId}-${environment}-${realm}`;
```

```javascript
const token = {
 authorityType: 'MSSTS',
 homeAccountId,
 environment,
 realm,
 idTokenClaims,
 localAccountId,
 username: idTokenClaims.preferred_username,
 name: idTokenClaims.name,
};
sessionStorage.setItem(tokenId, JSON.stringify(token));
```

```javascript
const accessTokenId = `${homeAccountId}-${environment}-accesstoken-${Cypress.env(
 'AZURE_CLIENT_ID'
)}-${Cypress.env('AZURE_TENANT_ID')}-${tokenResponse.scope}--`;
```

```javascript
const now = Math.floor(Date.now() / 1000);
const accessToken = {
 credentialType: 'AccessToken',
 tokenType: 'Bearer',
 homeAccountId,
 secret: tokenResponse.access_token,
 cachedAt: now.toString(),
 expiresOn: (now + tokenResponse.expires_in).toString(),
 extendedExpiresOn: (now + tokenResponse.ext_expires_in).toString(),
 environment,
 target: tokenResponse.scope,
 realm,
 clientId,
};
sessionStorage.setItem(accessTokenId, JSON.stringify(accessToken));
```

## 3. Run the test ✅

```javascript
describe('login spec', () => {
 it('should log in as a user', () => {
  cy.login();
  cy.visit('/');
  cy.contains('Welcome');
  cy.contains('Authenticated');
  cy.contains('Token: ');
 });
});
```

## E2E testing approach

- client_credentials vs password
