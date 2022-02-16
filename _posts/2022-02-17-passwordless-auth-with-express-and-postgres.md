---
layout: post
title: Passwordless authentication with Express and PostgreSQL
description: Tutorial to create a passwordless registration and login system using one-time passwords with ExpressJS and PostgreSQL.
date: 2022-02-17
author: Steven Laidlaw
highlight: monokai
image:
tags: ['auth', 'authentication', 'passwordless', 'one-time password', 'express', 'postgresql', 'psql', 'javascript', 'JWT']
---

![Header](/img/passwordless-auth/header.jpg)

- [Introduction](#introduction)
- [Disclaimer](#disclaimer)
- [Overview](#overview)
- [Implementation](#implementation)
  - [Setup](#setup)
  - [Database Structure](#database-structure)
  - [Creating Queries](#creating-queries)
  - [HTML Templates](#html-templates)
  - [API endpoints](#api-endpoints)
    - [GET /register, /login](#get-register-login)
    - [POST /register](#post-register)
    - [POST /login](#post-login)
    - [POST /token](#post-token)
    - [GET /account](#get-account)
    - [GET /logout](#get-logout)
- [Summary](#summary)

# Introduction

Static passwords suck. Not only are they a well-known [security risk](https://community.jisc.ac.uk/library/janet-services-documentation/passwords-threats-and-counter-measures), but they are also the [weakest part of the chain](https://www.afr.com/technology/passwords-often-the-weak-link-in-the-security-chain-20180808-h13pf3) when determining a user's authenticity.

Users generally either make them so simple as to be easily guessable, or are reused so often that getting a password cracked in one website means the rest of your accounts are up for grabs. Even power users who use hard to guess randomly generated passwords often are required to use password managers to keep them all in line which introduces another single point of failure.

These problems are so prevalent that most applications these days either mandate or strongly recommend multi-factor authentication. The most common of these is the one-time password that is either emailed to the user or linked to a special device. The recommendation of this article is that you ditch static passwords altogether due to the aforementioned security risks, and simply implement one-time passwords instead.

So why one-time passwords? First of all they're good for users because they don't have to remember a password. Just put your email address into the login field and they'll be sent an auto-generated password or link to log them in. Secondly these passwords are short-lived, which means that if a data breach _does_ happen then there are no active passwords stored for crackers to log in with or share. As long as a user has access to their email address their accounts will be safe.

# Disclaimer

This article assumes you know your way around PostgreSQL and ExpressJS. We will not be hand-holding you through the entire application build, but instead will be focusing on the concepts and things you'll need to know to implement a safe and secure one-time password login system.

A complete working example will be available at the end of the tutorial.

# Overview

For this article we'll be implementing the most simple version of a one-time password (OTP): a short code sent via email. This was chosen for simplicity, availability, and cost. Almost every user will have an email, and there is very minimal cost in sending them compared with something like SMS. A OTP is used here over a link also for user convenience. It allows them to retrieve the code on one device (like a phone) and log into your service on another (like a public computer).

As a high-level overview the implementation will be as follows:

- A user registers an account using their email address
- The user attempts to log in using their email address
- The site retrieves the user information and generates a OTP
- The OTP is stored securely in the database, and sent via plain text to the user
- The user will then retrieve the code and enter it into the login field provided
- The OTP is verified against the database
- If successful, the user is logged into the application 
- The OTP is then deleted from the database to prevent re-use

This flow is flexible and can be implemented using any technology you are familiar with, but as mentioned we'll be using PostgreSQL and ExpressJS for this example.

# Implementation

## Setup

Generate yourself an Express app, and set up your Postgres database. For libraries we'll be using:

- [node-postgres](https://github.com/brianc/node-postgres) for interfacing with our database
- [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) for the JWT
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) for encrypting the one-time passwords
- [emailjs](https://github.com/eleith/emailjs) for emailing the user
- [dotenv](https://github.com/motdotla/dotenv) for loading our secrets and parameters

For our `.env` file we need the following environment variables in place:

```env
# Database connection string
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
# Secret key for secure JWT generation
JWT_SECRET_KEY=ARandomStringOfCharacters0389j0jsdf8jr8h9as8jd
# Email information for sending the one-time passwords
EMAIL_USER=admin@yourapp.com
EMAIL_PASSWORD=TestPassword1
EMAIL_HOST=mail.mailserver.com
EMAIL_FROM=Your App <admin@yourapp.com>
```

## Database Structure

Firstly we must initialise our database to allow users to both register and log-in using the one-time password. For that we will need two tables, `users` and `otp`. Users must contain at least an id and email address field like so:

```sql
CREATE TABLE users (
	id INT GENERATED ALWAYS AS IDENTITY,
	email varchar(256) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(id)
);
```

This is a very simple user field which only stores the user's unique ID and the their email address.

Next we want to create a table to handle the one-time passwords:

```sql
CREATE TABLE otp (
	user_id INT NOT NULL,
	code VARCHAR(64) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id)
);
```

This will store the hashed OTP and the user's ID as a pair. The `created_at` column here is also important to ensure that the OTP expires quickly. Time between attempting and completing the login should be minimal for security purposes.

## Creating Queries

Now we need to create some queries to handle the interfacing with the database. At minimum we'll need the following:

- Users
	+ Create
	+ GetByEmail
- OTP
	+ Create
	+ GetByUserId
	+ DeleteByUserId
	
This will enable us to create users, and generate then delete one-time passwords.

Firstly I like to create a function that will run our query, log the attempt and results, and then return the results.

```js
const dotenv = require("dotenv");
const { Pool } = require("pg");

// Load the environment variables
dotenv.config();
const { DATABASE_URL } = process.env;

// Create a Database pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const runQuery = async (query, ...args) => {
  console.log(`DB Request:::[${query}]::ARGS::[${args.join(",")}]`);
  const result = await pool.query(query, args);
  console.log(
    `DB Result:::${result.rowLength} results::[${JSON.stringify(result.rows)}]`
  );
  return result.rows;
};
```

Now we can use this function to generate the aforementioned queries like so:

```js
module.exports = {
  Users: {
    Create: async (email) =>
      await runQuery(
        "INSERT INTO users (email) VALUES ($1, $2)",
        email
      ),
    Get: {
      ByEmail: async (email) =>
        await runQuery(
          "SELECT id, name, email, active FROM users WHERE email = $1",
          email
        ),
    },
  },
  Otp: {
    Create: async (user_id, code) =>
      await runQuery(
        "INSERT INTO otp (user_id, code) VALUES ($1, $2)",
        user_id,
        code
      ),
    Delete: {
      ByUserId: async (user_id) =>
        await runQuery("DELETE FROM otp WHERE user_id = $1", user_id),
    },
    Get: {
      ByUserId: async (user_id) =>
        await runQuery(
          "SELECT code, created_at FROM otp WHERE user_id = $1",
          user_id
        ),
    },
  },
};
```

Our queries are now ready to use!

## HTML Templates

Before we tackle the API endpoints lets quickly throw together some forms for the front-end. We only need three forms to handle everything:

- Register
- Login
- Token

Here are some examples:

```html
<form action="/users/register" method="POST">
  <div>
    <label for="email">Email</label>
    <input type="email" name="email" placeholder="Enter Email" />
  </div>
  <button type="submit">Register</button>
</form>

<form action="/users/login" method="POST">
  <div>
    <label for="email">Email</label>
    <input type="email" name="email" placeholder="Enter Email" />
  </div>
  <button type="submit">Send Code</button>
</form>

<form action="/users/token" method="POST">
  <div>
    <label for="code">Code</label>
    <input name="code" placeholder="Enter Code" />
  </div>
  <input type="hidden" value="{{email}}" name="email" />
  <button type="submit">Login</button>
</form>
```

All three form templates are very similar. The only thing to look out for is the hidden `email` field in the token form. We have to make sure that this field is populated with the email that was submitted from the login/register screen, otherwise the back-end won't know what user we're attempting to log in as.

## API endpoints

So we have our queries, now we can put them to use. We're going to need six API endpoints in order to cover everything we need for a simple login system:

1. `/register GET` - To serve the register page
2. `/register POST` - To create a user
3. `/login GET` - To serve the login page
4. `/login POST` - To generate a one-time password
5. `/token POST` - To generate the user session
7. `/account GET` - To validate the session token
6. `/logout GET` - To destroy the user's session

We'll tackle these one at a time to get a feel for how it all works together.

### GET /register, /login

The simplest of all these endpoints are the get endpoints for the Register and Login templates. We just want to render these pages using your view engine of choice.

```js
router.get("/login", async (req, res) => {
  return res.render("login");
});

router.get("/register", async (req, res) => {
  return res.render("register");
});
```

Usually you'd want to check if the user is logged in on any of these endpoints and redirect them away from the pages if so, but I'll leave that as an exercise for the reader.

### POST /register

Now our first endpoint that actually does something to the database. We have two objectives here:

1. Make sure the user isn't already registered
2. Register the user

In both cases above we will redirect to the `POST /login` page afterwards to give our users the cleanest login experience (without having to re-enter their email address).

```js
router.post("/register", async (req, res) => {
  const { email } = req.body;

  // Check if a user exists
  const users = await Queries.Users.Get.ByEmail(email);

  // If not, create one
  if (users.length === 0) {
  	await Queries.Users.Create(email);
  }

  // Redirect to /login POST
  return res.redirect(307, "/users/login");
});
```

Another reader exercise exists above -- validate that email address before creating a user.

### POST /login

This is where the one-time password gets generated and emailed to the user. First we need to make sure the appropriate libraries are imported for these actions:

```js
const bcrypt = require("bcrypt");
const { SMTPClient } = require("emailjs");
```

Now that we have the appropriate libraries let's create a function to handle sending the email to the user:

```js
// Grab the environment variables
const { EMAIL_USER, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_FROM } = process.env;

// Create an email client using emailjs
const client = new SMTPClient({
  user: EMAIL_USER,
  password: EMAIL_PASSWORD,
  host: EMAIL_HOST,
  ssl: true,
});

// Send the email
const sendEmail = async (to, subject, data) => {
  await client.sendAsync({
    from: EMAIL_FROM,
    to,
    subject,
    attachment: [{ data, alternative: true }],
  });
};
```

The code above should be fairly straight-forward. We create an email client and then build a function that wraps sending emails. Now we just need to pass in the recipient, subject, and HTML data for the email.

The login step is a little more complex, we we'll go through it line-by-line to make sure everything is understood.

First thing is to make sure the user exists in the database:

```js
router.post("/login", async (req, res) => {
  const { email } = req.body;

  const users = await Queries.Users.Get.ByEmail(email);

  if (users.length === 0) throw { message: "No user found" };

  // There should only be one result, so grab it
  const user = users[0];
});
```

A more complete app will redirect to the registration screen instead of throwing an error here.

Next we need to generate the one-time password. For this we'll be generating a six character alphanumeric passphrase, then encrypting it for storage in the database.

```js
router.post("/login", async (req, res) => {
  ...
  
  // Generate OTP
  const code = Math.random().toString(32).slice(2, 8).toUpperCase();
  const encrypted_code = bcrypt.hashSync(code, 10);
});
```

Now that we have our code we first need to delete any preexisting OTPs to avoid any conflicts, then add the new encrypted code into the database.

```js
router.post("/login", async (req, res) => {
  ...
  
  // Delete any existing OTPs and insert this new one
  await Queries.Otp.Delete.ById(user.id);
  await Queries.Otp.Create(user.id, encrypted_code);
});
```

> Ideally you'd also run a regular cleanup on the database to delete any passcodes that are out of date.

Our encrypted code now exists in the database, so we can email the plaintext code to the user using the function we created earlier.

```js
router.post("/login", async (req, res) => {
  ...
  
  // Send Email
  await sendEmail(email, "Login Code", `Your login code is ${code}`);
});
```

Now that all this is complete we want to render our token form so the user can input the OTP when it arrives in their inbox. Make sure to include the email provided as a parameter, as it is necessary for the hidden input field as discussed previously.

```js
router.post("/login", async (req, res) => {
  ...
  
  return res.render("token", {
    email,
  });
});
```

### POST /token

Now for the last half of the login chain -- the token. Here we need to decrypt the code in our database, compare it against the one provided by the user, and then generate a JWT for their session.

To start with we'll create a helper function for generating the token.

```js
const jwt = require("jsonwebtoken");

const makeToken = (data) => {
  const expirationDate = new Date();
  expirationDate.setMonth(new Date().getMonth() + 1);
  return jwt.sign({ ...data, expirationDate }, process.env.JWT_SECRET_KEY);
};
```

This code will generate a token that lasts a month before the user will need to log in again. You can modify this token to last as long or as short as you'd like. It's a balancing act between annoying the user with logins, and the security risk of a valid token existing for a long period of time.

Same as the login endpoint we first need to verify that a user with the provided email exists. Since we're coming from the login page this should be guaranteed, but it's always safe to validate again in case someone sends a post request directly to this endpoint and bypasses the login step.

```js
router.post("/token", async (req, res) => {
  const { email, code } = req.body;

  const users = await Queries.Users.Get.ByEmail(email);

  if (users.length === 0) throw { message: "No user found" };

  // There should only be one result, so grab it
  const user = users[0];
});
```

Now we must get the one-time password and verify that it isn't too old. In this case "too old" means more than five minutes, which should give a user more than enough time to enter the code sent to their email address.

```js
router.post("/token", async (req, res) => {
  ...
  
  const otps = await Queries.Otp.Get.ByUserId(user.id);

  if (otps.length === 0) {
    throw { message: "Login code has expired. Please request a new one." };
  }

  const otp = otps[0];

  // Verify the code isn't too old
  if (Date.parse(otp.created_at) + 1000 * 60 * 5 < Date.now()) {
    throw { message: "Login code has expired. Please request a new one."   };
  }
});
```

Now that we're sure the OTP in the database is valid we can compare it to the one provided by the user. Remember to clean up the database by deleting the code in the case that it's used successfully.

```js
router.post("/token", async (req, res) => {
  ...
  
  // Verify the code matches
  const match = bcrypt.compareSync(code, otp.code);

  if (!match) throw { message: "Error with code" };
  
  // Delete code
  await Queries.Otp.Delete.ByUserId(user.id);
});
```

If we've made it this far the code provided matches the one in the database, and we can log our user in. This is where we use the `makeToken` function we created earlier to generate a JWT with our user's details.

```js
router.post("/token", async (req, res) => {
  ...
  
  const token = makeToken({
    ...user,
  });
});
```

We have our secure token! Now we just need to store it in the user's cookies under the name `access_token` and redirect them to the `/account` page.

```js
router.post("/token", async (req, res) => {
  ...
  
  return res
    .cookie("access_token", token, {
      httpOnly: true,
      secure: true,
    })
    .status(200)
    .redirect("/");
});
```

### GET /account

Our user now has a secure JWT verifying their identity. Our next step is to validate that JWT and present the user with a page that shows they are logged in.

First we'll create the middleware function to validate the token so that we can apply it to any endpoint we wish to be protected. The steps here are as follows:

1. Make sure a token exists
2. Verify that it's not expired
3. Populate the user data into the request object
4. Continue to the next step in the application

If any of this fails we want to redirect the user to the login screen.

```js
const validateToken = (req, res, next) => {
  const token = req.cookies.access_token;

  try {
    if (!token) throw true;
    const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!data.expirationDate || Date.parse(data.expirationDate) < Date.now()) {
      throw true;
    }
    req.user = {};
    Object.keys(data).forEach((key) => {
      req.user[key] = data[key];
    });
    return next();
  } catch {
    return res.redirect("/users/login");
  }
};
```

Now that we have the middleware in place we just need to use it to protect an endpoint like so:

```js
router.get("/account", validateToken, async (req, res) => {
  res.send(`Hello ${req.user.name}!`);
});
```

This endpoint is now protected by a valid JWT, and will only render for a securely logged in user.

We are almost done, just one last piece of the puzzle to go.

### GET /logout

This is the simplest of all the endpoints. All we want to do is clear out the token from the cookie, and redirect them to the login page.

```js
router.get("/logout", async (req, res) => {
  return res.clearCookie("access_token").status(200).redirect("/login");
});
```

# Summary

And we're done! We have successfully created a secure registration and login system using one-time passwords. We can be sure that our data is stored securely and expires quickly enough that a data breach won't give anyone enough time or information to do anything nefarious.

While no system is completely secure, I hope this leaves you confident enough to implement passwordless authentication in your own applications without the risk and issues related to static passwords.

> A more complete version of this code using Handlebars for templating and express-validator for parameter validation (among other things) is available [here](https://github.com/stevenlaidlaw/passwordless-login-express-postgres).
