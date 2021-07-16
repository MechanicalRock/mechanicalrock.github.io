---
layout: post
title: Snowflake SSO setup with G-Suite
date: 2021-07-5
tags: [snowflake saml sso gsuite google authentication]
author: Zainab Maleki
image: img/blog/snowflake-g-suite/heading.jpg
---

<center><img src="/img/blog/snowflake-g-suite/heading.jpg" /></center><br/>

Recently I was trying to integrate Snowflake to SSO with G-suite and I went through a world of pain to get it working. The documentation was out of date and did not help with 403 error that I was continuously receiving. I have therefore written this blogpost, hoping it would help someone else in the future. <br/>

# G-Suite Setup<br/>

To get started you first need to create a new SAML app in G-suite. You may require admin access to perform this action:<br/>

Login to [https://admin.google.com](https://admin.google.com){:target="\_blank" rel="noopener"} and click on the three lines to open the menu<br/>

<center><img src="/img/blog/snowflake-g-suite/01-Gsuite.png" width="250px" height= "100%"/></center><br/>

From the menu click on the Apps and select <code>Web and mobile apps</code>

<center><img src="/img/blog/snowflake-g-suite/02-Gsuite.png" width="250px"/></center><br/>

Click on <code>Add App</code> then <code>Add custom SAML app</code>

<center><img src="/img/blog/snowflake-g-suite/03-Gsuite.png" width="300px"/></center><br/>

Enter your app details and press continue

<center><img src="/img/blog/snowflake-g-suite/04-Gsuite.png" /></center><br/>

Copy the values of <code>SSO URL</code> , <code>Entity ID</code> and <code>Certificate</code> and click continue. You will need those later when setting up Snowflake

<center><img src="/img/blog/snowflake-g-suite/05-Gsuite.png" /></center><br/>

Recently Snowflake has introduced a friendly name for the account, however in order to setup SSO with G-Suite you need Snowflake's auto generated account name and region. To retrieve your generated account name run below command in Snowflake.

```sql
select t.value:type::varchar as type,
       t.value:host::varchar as host,
       t.value:port as port
from table(flatten(input => parse_json(system$whitelist()))) as t;

```

The regional account name will be in the SNOWFLAKE_DEPLOYMENT field

<center><img src="/img/blog/snowflake-g-suite/06-Gsuite.png" /></center><br/>

Back in G-suite enter the Service provider details as below and press Continue.
ACS URL:

`https://${regionalAccountName}.{region}.snowflakecomputing.com/fed/login`

Entity ID:

`https://${regionalAccountName}.{region}.snowflakecomputing.com`

<div style="background-color: #fff3cd ; border-color: #ffeeba; color: #856404; border-radius: .25rem; padding: .75rem 1.25rem;"><strong>Note!</strong><br/>Make sure there are no trailing slashes in ACS URL or Entity ID</div> <br/>

<center><img src="/img/blog/snowflake-g-suite/07-Gsuite.png" /></center><br/>

You do not need to change anything in attribute mapping, click Finish<br/>

One last step left in G-suite is to enable your users for this app. To do this click on the User access inside your app

<center><img src="/img/blog/snowflake-g-suite/08-Gsuite.png" /></center><br/>

Make sure to turn it on for everyone and click on save. Alternatively, you could turn it on for a specific group of users

<center><img src="/img/blog/snowflake-g-suite/09-Gsuite.png" /></center><br/>

# Snowflake Setup:

Now go to your Snowflake account and set saml_identity_provider on the account level. Replace the certificate, issuer and ssoUrl with values copied from G-suite app and run below commands.

<div style="background-color: #fff3cd ; border-color: #ffeeba; color: #856404; border-radius: .25rem; padding: .75rem 1.25rem;"><strong>Note!</strong><br/>

1. When entering the certificate into Snowflake please ensure the certificate is ALL ON ONE LINE (e.g. no carriage returns) along with remove the Begin and End Certificate tags<br/>
2. Issuer value will be from entity ID in your G-suite app<br/>
3. Run below commands using AccountAdmin role<br/>
</div> <br/>

```sql
alter account set saml_identity_provider = '{
  "certificate": "MIIDdDCCabhduknsykgIGAWt...UV6+gsftmCsM",
  "issuer": "https://accounts.google.com/o/saml2?idpid=Cdummy045",
  "ssoUrl": "https://accounts.google.com/o/saml2/idp?idpid=Cdummy045",
  "type"  : "Custom",
  "label" : "gsuiteSingleSignOn"
  }';

  alter account set sso_login_page = true;

```

<br/>

# Verify your connection:

Unfortunately automatic provisioning with G-suite does not work in Snowflake. Therefore you will have to manually create your users in Snowflake. Run below command to create your users using their email addresses:

<div style="background-color: #fff3cd ; border-color: #ffeeba; color: #856404; border-radius: .25rem; padding: .75rem 1.25rem;"><strong>Note!</strong><br/>You do not need to specify passwords for SSO users in Snowflake</div> <br/>

```sql
CREATE USER "zainab.maleki@mechanicalrock.io";
```

Once all the above setup is completed, now you can test your integration using the below URL:

<div style="background-color: #fff3cd ; border-color: #ffeeba; color: #856404; border-radius: .25rem; padding: .75rem 1.25rem;"><strong>Note!</strong><br/>If you change any settings, verify it in a cognito browser as I noticed G-Suite sometimes returns cached response</div> <br/>

<code>https://${Your account friendly name}.snowflakecomputing.com/console/login?fedpreview=true</code>
<br/>
<br/>
<br/>
If you need any help with your Snowflake setup, patterns and best practices, feel free to [get in touch](https://mechanicalrock.io/lets-get-started).<br/>

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)
