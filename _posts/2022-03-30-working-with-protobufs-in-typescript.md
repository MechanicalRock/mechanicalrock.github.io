---
layout: post
title: Working with Protobufs in Typescript
description: Tutorial for how to use Protobufs with Typescript
date: 2022-03-30
author: Ed Newsom
highlight: monokai
image: img/blog/protobuf-ts/protobuf-ts.jpg
tags: ['protobuf', 'typescript', 'tutorial', 'protoc', 'npm']
---

![Protobufs and TypeScript](/img/blog/protobuf-ts/protobuf-ts.png)


# Working with Protobufs in Typescript
[Click here to skip to the interesting technical bits](#now-to-do-it-a-better-way) or [click here for the code repo and skip all the words](https://github.com/MechanicalRock/protobuf-example-ts)

- [How Did We Get Here?](#how-did-we-get-here)
- [Other Stuff & Assumptions](#other-stuff--assumptions)
- [Making It Work (in a way like most tutorials)](#making-it-work-in-a-similar-way-to-most-tutorials)
  - [Implementation (in a similar to most tutorials)](#implementation-in-a-similar-to-most-tutorials)
- [Now To do It A Better Way (unlike most tutorials)](#now-to-do-it-a-better-way-unlike-most-tutorials)
  - [Implementation](#implementation)
- [Thoughts]()


## How Did We Get Here?
So a little while ago our PO said "what we need is an OpenTelemetry API so that customers can send us data, oh, and it needs to be serverless".  This post is about a small part of that rabbit hole because after peeling back the layers I realised I needed to learn Protobufs.  My first response was to groan because I had tried to learn Protobufs a while back and failed, twice.  Admittedly, on both occasions, I did not have an application to focus on and other shiny things distracted me.  But before trying again, I asked some of my infinitely more experienced colleagues here at [Mechanical Rock](https://mechanicalrock.io) if it was just me or is the documentation for learning Protobufs from zero really '@#^%'?  There was some great discussion on this and then they sent me on my way with a more than a few useful hints.

Having got to the point where I now understand enough to use them in anger, I now realise that trying to learn Protobufs for Typescript as a first step was probably the problem.  There is almost nothing useful our there for learning Protobufs with Typescript or even JavaScript.  I actually had to revert to my first love, Python, before I could transfer that newly minted knowledge to TypeScript.  As a result, I though I would put together this example for anyone else who is wrestling along that path.


## Other Stuff & Assumptions
I am going to skip over the why Protobufs vs XML and the like, there's lots of that out there and if you are still reading this you probably have been told to just get on any make it work.

I'm assuming you know: node.js, Typescript, npm and Jest.  We are using Mac/Linux here (sorry Windows users but you can deal with your own world of pain). We will not be hand-holding you through the entire application build, but instead will be focusing on the concepts and things you'll need to know to to do the basics with Protobufs.


# Making It Work (In a similar way to most tutorials)
We're going to work through an end to end process to demonstrate the key points you need to cover to be able to do the basics.
1. [Define the data structure for your messages](#define-the-data-structure-for-your-messages)
2. [Compile the JS and Types you will use in your code](#compile-the-js-and-types-you-will-use-in-your-code)
3. [Create a message](#create-a-message)
4. [Serialise the message into a Protobuf](#serialise-the-message-into-a-protobuf)
5. [Do something with the serialised message](#do-something-with-the-serialised-message)
6. [De-serialise the message](#de-serialise-the-message)


# Implementation (in a similar to most tutorials)

## Define the data structure for your messages
First thing to realise about Protobufs are they are just an efficient (small data size) way of encoding messages.  Next thing to realise is that these messages have a pre-defined data structure.  You need to know that data structure at both ends, to serialize the message before sending and then de-serialize the message back into something useable when it has been received.  This is what the `.proto` files are for, they define the data structure of the messages.

In this example, we are going to keep it really simple because the [data structure](https://developers.google.com/protocol-buffers/docs/proto3) is not the interesting bit for this post.  I am also shamelessly basing this on the [Google Protobuf Tutorials](https://developers.google.com/protocol-buffers/docs/tutorials) because I am sure you have already been there, hence using the Address Book example. 

So we are going to create an Address Book message that we want to transmit using Protobuf.  This contains an array of People and People have contact details. For example, a JSON object for this message would look something like:
```js
{
	AddressBook: [
		Person1: {
			Name: Joe Bloggs,
			Number: 0123456789,
			PhoneType: mobile
		},
		Person2: {
			Name: Jane Smith,
			Number: 0987654321,
			PhoneType: home
		}
	]
}
```
This becomes the following addressBook.proto file:
```js
syntax = "proto2";

package tutorial;

message Person {
  optional string name = 1;

  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }

  message PhoneNumber {
    optional string number = 1;
    optional PhoneType type = 2 [default = HOME];
  }

  repeated PhoneNumber phones = 2;
}

message AddressBook {
  repeated Person people = 1;
}
```

## Compile the JS and Types you will use in your code
This is the first bit that didn’t quite make sense, there's some magic that goes on that turns the `.proto` files into code you can use within your project.  At this point in the journey, all you need to know is how to generate this output for your desired language.
-  For this you need the `protoc` compiler.  Download and install the [prebuilt binary](https://github.com/protocolbuffers/protobuf/releases)
	-  For Mac and Linux you just have to copy the `protoc` file into a location on your $PATH.  On my Mac I copied into `/usr/local/bin/`

However this only generates code for [some languages](https://github.com/protocolbuffers/protobuf#protobuf-runtime-installation) to see the list. For us, we're interested in JavaScript, which is included.

This bit that isn’t included with `protoc` is generating the Typescript types.  For that you need a plugin like the [protoc-gen-ts](https://www.npmjs.com/package/ts-protoc-gen) npm package that acts as a plugin for `protoc`.
 - So start a JS project and run
	- `npm install ts-protoc-gen`
	- Create an `addressBook.proto` file as above in the same project

Next compile your `.proto` files into `.js` and `.d.ts` for use within your project by running the following CLI command (note the package name is reversed after install which is dumb):
```
protoc \
	--plugin="protoc-gen-ts=./node_modules/.bin/protoc-gen-ts" \
	--js_out="import_style=commonjs,binary:./generated" \
	--ts_out="./generated" \
	src/proto/addressBook.proto
```

This is the point where I really like TypeScript. If you look at the generated code there is 760 lines of stuff in the `generated/src/proto/addressBook.js` file which honestly is not that easy to read or understand how to use.  But if you look at the `generated/src/proto/addressBook.d.ts` Types file, there are only 100 lines and it tells you all the function calls you are going to need to create and use your messages and Protobufs.

_*This is where I fell over on my first attempt, I did not use a `protoc` plugin like `ts-protoc-gen` to generate the Types and only had the JS output. I couldn't easily enough understand what was going on, got lost and then distracted by other shiny stuff.*_


## Create a message
_*When you read the docs and get presented with ["The API is not well-documented yet"](https://github.com/protocolbuffers/protobuf/tree/master/js#api) you can be forgiven for wanting to cry and giving up.  Yes, this is where I failed on my second attempt. And again this is where the Typescript Types `.d.ts` files comes to the rescue.*_

To create a new message, you create a new instance of AddressBook
- `const myAddressBook = new AddressBook()`

You now have an empty address book, so add you first contact person
- `const newPerson1 = myAddressBook.addPeople()`

You now have one blank person in your address book, so add some contact details
- `person1.setName('Joe Blogs')`
- `const person1Phone1 = person1.addPhones()`
- `person1Phone1.setNumber('0123456789')`
- `person1Phone1.setType(0)`

Note that you have to use the index value of the enum for the `PhoneType`.  Now you get this idea, you can add the second person in the same way.

Congrats, this is the hard work done.  You are most of the way there!


## Serialise the message into a Protobuf
After all of the above, this is the easy bit.  Again taking instruction from the Types file:
- `const serializedMessage = myAddressBook.serializeBinary()`


## Do something with the serialised message
The how of transmitting the encoded messages is out of scope here, but you can for example transmit over gRPC or HTTP or even save to file if you really want (as a lot of tutorials unhelpfully seem to do).


## De-serialise the message
After you have transmitted or stored your message, at some point you are going to want to use its contents.  Again this is really easy:
- `const deSerializedMessage = AddressBook.deserializeBinary(serializedMessage)`

Done! You have your original message again which you can view as an object with:
- `deSerializedMessage.toObject()`

This one also caused me some trouble because without the Types and not knowing there was a `.toObject()` call, the `deSerializedMessage` object can be logged and is a mess of wrappers, nested arrays and no keys.

Congrats, you survived and don’t need to spend days bashing your head against the wall.


# Now To Do It A Better Way
## Implementation
Having said congrats above, now forget most of it and lets do it a better.  The method above was only done because it allows you to see the parallels to the other published tutorials.  Actually that is not the best way within TypeScript to work with messages.  Working from a class object and endlessly running functional calls to add every bit of information is unnecessarily hard work and going to lead to a lot of code.  Far easier is to define your message through a typed object.  For example you can replace all the calls we did in [Create a message](#create-a-message) with 
```js
const myAddressBook: AddressBook = {
	AddressBook: [
		Person1: {
			Name: Joe Bloggs,
			Number: 0123456,
			PhoneType: mobile
		},
		Person2: {
			Name: John Smith,
			Number: 0987654,
			PhoneType: home
		}
	]
}
```

## Define the data structure for your messages
Done, as just above.  Way easier to create and way easier to read.


## Compile the JS and Types you will use in your code


## Create a message


## Serialise the messag


## Do something with the serialised message


## De-serialise the message


# Thoughts

And we're done! We have successfully created a secure registration and login system using one-time passwords. We can be sure that our data is stored securely and expires quickly enough that a data breach won't give anyone enough time or information to do anything nefarious.

While no system is completely secure, I hope this leaves you confident enough to implement passwordless authentication in your own applications without the risk and issues related to static passwords.

If you have any questions regarding this article feel free to contact us either via [email](mailto:contact@mechanicalrock.io) or our [web form](https://mechanicalrock.io/lets-get-started).

> A more complete version of this code using Handlebars for templating and express-validator for parameter validation (among other things) is available [here](https://github.com/stevenlaidlaw/passwordless-login-express-postgres).



# TODO
- What licence for public repos for blog posts?