---
layout: post
title: Azure AD Authentication in Cypress Tests
date: 2020-05-05
tags: azure ad activedirectory cypress authentication adal react
author: Tim Veletta
image: img/blog/azure-ad-cypress/header.png
---

> There is a newer version of this article: [Azure AD authentication in Cypress tests with MSAL](http://mechanicalrock.github.io/2022/08/08/azure-ad-authentication-cypress.html)

_Update 4th December 2020: The article has been updated to remove the resource key from the login command body which is POSTed to the AzureAD endpoint for authentication, as it is no longer required._

[Cypress](https://cypress.io) is a browser-based, end-to-end testing framework which makes testing easy and, dare I say it, fun. At Mechanical Rock, we are using Cypress to automate the testing of user flows and interactions with our applications to reduce feedback cycles and prevent issues from affecting users. It has been useful for developers since Cypress tests are relatively easy to write, run and debug. Our clients have also benefited as we are able to automate testing that would have been done manually otherwise.

Our preferred Cypress set up is a discussion for another blog post; in this post, I'd like to focus on an issue we ran into recently when trying to set up Azure Active Directory (AD) authentication for use within our Cypress tests.

With Azure AD, the usual login flow is to check if the user has a valid token and if not, redirect them to `https://login.microsoftonline.com/` to get one. The trouble with this approach is that for security reasons, Cypress doesn't allow for redirects within your tests unless you set `"chromeWebSecurity": false` in your configuration. Even if you did set that configuration variable, you would still have to write a test that uses the Microsoft login page to authenticate, the implementation of which could change at any point causing your tests to fail.

I looked to the Cypress documentation for help and despite there being a very useful [_Recipes_ section](https://docs.cypress.io/examples/examples/recipes.html#Logging-In) which includes some repeatable patterns for handling authentication within your end-to-end tests, none of them applied to Azure AD. A quick Google search revealed a Cypress [Github issue](https://github.com/cypress-io/cypress/issues/1342) that has been around since **February 2018** where the only resolution is to fill out the aforementioned Microsoft login page using the headless Puppeteer browser.

Looking through the Azure documentation, there was a rather [helpful article](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow) on authenticating with Azure AD specifically for _service accounts_ without any form of user interaction. It is this article, that is the basis for how we authenticate with Azure AD in our Cypress tests.

In our Cypress code, we add a custom _command_ to authenticate. Commands are used for adding or overriding functionality within Cypress and are defined in the `cypress/support/commands.js` file by default. In our case, we are adding a custom command called `login` so that we can use it in our tests simply through `cy.login()`.

```javascript
Cypress.Commands.add('login', () => {
	cy.request({
		method: 'POST',
		url: `https://login.microsoftonline.com/${Cypress.config(
			'tenantId'
		)}/oauth2/token`,
		form: true,
		body: {
			grant_type: 'client_credentials',
			client_id: Cypress.config('clientId'),
			client_secret: Cypress.config('clientSecret'),
		},
	}).then((response) => {
		const ADALToken = response.body.access_token;
		const expiresOn = response.body.expires_on;

		localStorage.setItem('adal.token.keys', `${Cypress.config('clientId')}|`);
		localStorage.setItem(
			`adal.access.token.key${Cypress.config('clientId')}`,
			ADALToken
		);
		localStorage.setItem(
			`adal.expiration.key${Cypress.config('clientId')}`,
			expiresOn
		);
		localStorage.setItem('adal.idtoken', ADALToken);
	});
});
```

> The `Cypress.config()` function is used here to pull values from our Cypress configuration file which is usually found at `<root>/cypress.json`. The values for `clientId`, `clientSecret` and `tenantId` can be found on the Azure AD dashboard which I'll detail later on.

When this command is called it will make a `POST` request to `https://login.microsoftonline.com/<tenant ID>/oauth2/token` with a `body` of:

```javascript
{
    "grant_type": "client_credentials",
    "client_id": "<client ID>",
    "client_secret": "<client secret>",
    "resource": "<client ID>"
}
```

We then extract the token and expiry from the response before setting some variables in local storage. The values we set in local storage are used by the [`react-adal`](https://github.com/salvoravida/react-adal) library which handles the authentication within our React app. Since we couldn't replicate the usual authentication flow for our end-to-end tests, we also have to make some small changes to how our React app authenticates with Azure AD.

Previously in our `index.tsx`, we would use the `runWithAdal` function provided by `react-adal` to authenticate as follows.

```javascript
import { runWithAdal } from 'react-adal';
import { authContext } from './auth'; // contains authentication config

const DO_NOT_LOGIN = false;

runWithAdal(
	authContext,
	() => {
		ReactDOM.render(<App />, document.getElementById('root'));
	},
	DO_NOT_LOGIN
);
```

To use the local storage variables we set within our Cypress `login` command, we changed our authentication flow by providing our own `runWithAdal` function.

```javascript
function runWithAdal(authContext: AuthenticationContext, app: Function) {
  authContext.handleWindowCallback();

  if (window === window.parent || (window as any).Cypress) {
    if (!authContext.isCallback(window.location.hash)) {
      if (
        !authContext.getCachedToken(authContext.config.clientId) ||
        (!(window as any).Cypress && !authContext.getCachedUser())
      ) {
        authContext.login();
      } else {
        app();
      }
    }
  }
}

runWithAdal(authContext, () => {
  ReactDOM.render(<App />, document.getElementById("root"));
});
```

In short, what this code does is it checks the local storage for the `adal.token.keys`, `adal.access.token.key<client ID>`, `adal.expiration.key<client ID>` and `adal.idtoken` variables and whether the token stored is valid and has not expired. If the token is invalid or it has expired, it redirects the user to the login page; otherwise, it displays the application.

In our Cypress `login` command, we request a valid token and set the aforementioned values in local storage before the application initialises, therefore bypassing the redirect and going straight to our application.

One simple way of ensuring we have a valid token when we run the end-to-end tests is by running the Cypress `login` command before each test. We can do this simply by adding a test file named `before.js` which simply contains:

```javascript
beforeEach(() => {
	cy.login();
});
```

### Finding the Tenant ID, Client ID and Secret

These values can be found in the Azure portal by clicking on **App Registrations** and then selecting the application you are trying to authenticate. From the overview page, you can find the Tenant ID and Client ID as shown below.

![Tenant ID and Client ID](/img/blog/azure-ad-cypress/client-tenant-id.png)

You can then create a new Client Secret by going to **Certificates and Secrets** and selecting **New Client Secret**.

![Client Secret](/img/blog/azure-ad-cypress/client-secret.png)

There you have it, we have managed to set up our Cypress tests to authenticate with Azure AD in a way that is secure and consistent.

Manual tests taking up all your time and not finding issues before they get to users? We can help!

[Contact Mechanical Rock to Get Started!](https://www.mechanicalrock.io/lets-get-started)
