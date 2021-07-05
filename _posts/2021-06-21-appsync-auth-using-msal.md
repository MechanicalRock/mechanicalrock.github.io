---
layout: post
title: "How to connect react to appsync using the latest Microsoft authentication library (msal)"
description: "Read this blog to learn how to connect your react application to appsync using the latest Microsoft authentication library (MSAL)"
date: 2021-06-22
# highlight: monokai
# image: /img/fed-talk/s01e03/cover-ep3-740.png
author: Zainab Maleki
tags: [react, appsync, apollo client, msal, azuread, ad, authentication]
---

![Front-End Development Talk: Episode 4 - React Components](/img/blog/msal-appsync-auth/ToBeChanged.png)

If you have connected your appsync to azure ad using ADAL authentication, you should know that ADAL was deprecated since June 2021
<br/>

# Differences between MSAL and ADAL

MSAL.js, which is the latest generation of Microsoft authentication libraries

v1.0 endpoint (and ADAL.js)

you still need to use ADAL.js if your application needs to sign in users with earlier versions of Active Directory Federation Services (ADFS).

In ADAL.js, the methods to acquire tokens are associated with a single authority set in the AuthenticationContext. In MSAL.js, the acquire token requests can take different authority values than what is set in the UserAgentApplication. This allows MSAL.js to acquire and cache tokens separately for multiple tenants and user accounts in the same application.
<br/>

# How to setup appsync?

When connecting appsync to Azure AD, first you will have to specify the v2.0 endpoint in the issuer field. Refer to below examples for more details:

```yaml
AppsyncAPI:
  Type: AWS::AppSync::GraphQLApi
  Properties:
    AuthenticationType: OPENID_CONNECT
    Name: "myAppsyncApi"
    OpenIDConnectConfig:
      ClientId: !Sub ${AzureClientId}
      Issuer: !Sub "https://login.microsoftonline.com/${AzureTenantId}/v2.0"
```

![Screenshot of default authorization settings in appsync](/img/blog/msal-appsync-auth/appsync-config.png)

<br/>

# How to configure MSAL on your react app?

In order to connect your react app to appsync using MSAL library, you will have to follow below steps:
<br/>

#### Step 1: install msal npm package

Run below commands to install msal npm packages

```bash
npm install @azure/msal-react
npm install @azure/msal-browser
```

<br/>

#### Step 2: Create msal configuration

<br/>

#### Step 3: Wrap your app inside msal component.

Inside your index.tsx, import MsalProvider from @azure/msal-react and wrap your app in the MsalProvider

You will also need to create a msal instance with your configuration created in previous step and pass it into the msal provider component

```tsx
const msalInstance = new PublicClientApplication(msalConfig());
```

Your index.tsx should look like below:

![Screenshot of default authorization settings in appsync](/img/blog/msal-appsync-auth/indextsx.png)
<br/>

# How to setup Apollo client?

When you have configured your react app to authenticate with Azure AD using MSAL libraries, all left is to configure Apollo to use the token from the MSAL library. Below is the instruction to show you how:

<br/>

# Closing

<br/>

If you have any further questions on this article, feel free to get in touch for more help :heart:, [get in touch with us!](https://www.mechanicalrock.io/lets-get-started)

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)
