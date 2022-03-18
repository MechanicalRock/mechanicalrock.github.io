---
layout: post
title: Working with Protobufs in Typescript
description: Tutorial for how to use Protobufs with Typescript
date: 2022-03-30
author: Ed Newsom
highlight: monokai
image: img/blog/protobuf-ts/protobuf-ts.jpg
tags: ["protobuf", "typescript", "tutorial", "protoc", "npm"]
---

![Protobufs and TypeScript](/img/blog/protobuf-ts/protobuf-ts.png)

# Working with Protobufs in Typescript

[Click here to skip to the interesting technical bits](#making-it-work) 

or [Click here for the code repository in Github and skip all the words](https://github.com/MechanicalRock/protobuf-example-ts)

<details>
  <summary>Contents</summary>

- [How Did We Get Here?](#how-did-we-get-here)
- [Other Stuff & Assumptions](#other-stuff--assumptions)
- [Making It Work](#making-it-work)
  - [Define the data structure for your messages](#define-the-data-structure-for-your-messages)
  - [Compile the TypeScript files you will use in your code](#compile-the-typescript-you-will-use-in-your-code)
  - [Create a message](#create-a-message)
  - [Serialise the message to Protobuf](#serialise-the-message-to-protobuf)
  - [De-serialise the message](#de-serialise-the-message)
- [Closing thoughts](#closing-thoughts)
- [How do do this so it looks like most published tutorials](#how-do-do-this-so-it-looks-like-most-published-tutorials)

</details>

## How Did We Get Here?

So a little while ago I got told "we need an OpenTelemetry API so that customers can send us data, oh, and it needs to be serverless". This post is about a small part of that rabbit hole because after peeling back the layers I realised I needed to learn Protobufs. My first reaction was to groan because I had tried to learn Protobufs a while back and failed, twice.  Admittedly, on both occasions, I did not have an application to focus on and other shiny things distracted me. So before trying again, I asked some of my infinitely more experienced colleagues here at [Mechanical Rock](https://mechanicalrock.io) if it was just me or is the documentation for learning Protobufs from zero really '@#^%'? There was some great discussion on this and then they sent me on my way with a more than a few useful hints.

Having got to the point where I understand enough to use them in anger, I now realise that trying to learn Protobufs for Typescript as a first step was probably the problem. There is almost nothing useful out there for learning Protobufs with Typescript. I actually had to revert to my first love, Python, before I could transfer that newly minted knowledge to TypeScript. As a result, I though I would put together this example for anyone else who is fighting along this path.

## Other Stuff & Assumptions

I am going to skip over the why Protobufs vs XML and the like, there's lots of that out there and if you are still reading this you probably have been told to just get on any make it work.

I'm assuming you know: node.js, Typescript, npm and Jest. We are using Mac/Linux here (sorry Windows users but you can deal with your own world of pain). We will not be hand-holding you through the entire application build, but instead will be focusing on the concepts and things you'll need to know to to do the basics with Protobufs.

# Making It Work
We're going to work through an end to end process to demonstrate the key points to be able to do the basics with Protobufs and TypeScript.

1. [Define the data structure for your messages](#define-the-data-structure-for-your-messages)
2. [Compile the Typescript files you will use in your code](#compile-the-typescript-you-will-use-in-your-code)
3. [Create a message](#create-a-message)
4. [Serialise the message to Protobuf](#serialise-the-message-to-protobuf)
5. [Do something with the serialised message](#do-something-with-the-serialised-message)
6. [De-serialise the message](#de-serialise-the-message)

## Define the Data Structure for Your Messages

First thing to realise about Protobufs are they are just an efficient (small data size) way of encoding messages. Next thing to realise is that these messages have a pre-defined data structure. You need to know that data structure at both ends, to serialize the message before sending and then de-serialize the message back into something useable when it has been received. This is what the `.proto` files are for, they define the data structure of the messages in a language independent format.

In this example, we are going to keep it really simple because the [proto3 data structure](https://developers.google.com/protocol-buffers/docs/proto3) is not the interesting bit for this post. I am also shamelessly basing this on the [Google Protobuf Tutorials](https://developers.google.com/protocol-buffers/docs/tutorials) because I am sure you have already been there, hence using the Address Book example.

So we are going to create an Address Book message that we want to transmit using Protobuf. This message contains People and People have contact details. For example, a JSON object for this message would look something like:

```js
const myAddressBook = {
  people: [
    {
      name: "Joe Blogs",
      phones: [
        {
          phoneNumber: "0123456789",
          phoneType: "MOBILE",
        },
      ],
    },
    {
      name: "Jane Smith",
      phones: [
        {
          phoneNumber: "0987654321",
          phoneType: "HOME",
        },
      ],
    },
  ],
};
```

This structure becomes the following `addressBook.proto` file:

```js
syntax = "proto3";

package tutorial;

message Person {
  optional string name = 1;

  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }

  message PhoneNumber {
    optional string phoneNumber = 1;
    optional PhoneType phoneType = 2;
  }

  repeated PhoneNumber phones = 2;
}

message AddressBook {
  repeated Person people = 1;
}
```

## Compile the TypeScript You Will Use in Your Code

This is the first bit that didn’t quite make sense, there's some magic that's needed to turn the `.proto` files into language specific code you can use within your project. At this point in the journey, all you need to know is how to generate this output for your desired language.

- For this you need the `protoc` compiler. Download and install the [prebuilt binary](https://github.com/protocolbuffers/protobuf/releases)
  - For Mac and Linux you just have to copy the `protoc` file into a location on your `$PATH`. On my Mac I copied this into `/usr/local/bin/`.

However, this only generates code for [some languages](https://github.com/protocolbuffers/protobuf#protobuf-runtime-installation). From that list we're interested in JavaScript, which is included.

The bit that isn’t included with `protoc` is generating the Typescript types. For that you need a plugin like the [`ts-proto`](https://www.npmjs.com/package/ts-proto) npm package that acts as a plugin for `protoc`.

So start a TypeScript project and create an `addressBook.proto` file as above in the same project. Then run:

- `npm install ts-protoc-gen`

Next compile your `.proto` file into a `.ts` file for use within your project by running the following CLI command:

```
protoc \
    --plugin="./node_modules/.bin/protoc-gen-ts_proto" \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_out="./src/generated" \
    src/proto/addressBook.proto
```

This is the point where I really like TypeScript. If you run `protoc` without the `ts-proto` plugin and look at the generated code there is 760 lines of stuff in the `generated/src/proto/addressBook.js` file which honestly is not that easy to read or understand how to use. But if you look at the `generated/src/proto/addressBook.ts` file, there are only 250 lines and it provides you with the type interfaces and commands you are going to need to create and use your messages and Protobufs.

_*This is where I fell over on my first attempt, I did not use a `protoc` plugin like `ts-proto` to generate the Types and only had the JS output. I couldn't easily enough understand what was going on, got lost and then distracted by other shiny stuff.*_

## Create a Message

_*When you read the docs and get presented with ["The API is not well-documented yet"](https://github.com/protocolbuffers/protobuf/tree/master/js#api) you can be forgiven for wanting to cry and giving up. Yes, this is where I failed on my second attempt. This is where the Typescript Types come to the rescue.*_

Creating the contents of your message is now as easy as:
```js
const myAddressBook: AddressBook = {
  people: [
    {
      name: "Joe Blogs",
      phones: [
        {
          phoneNumber: "0123456789",
          phoneType: Person_PhoneType.MOBILE,
        },
      ],
    },
    {
      name: "Jane Smith",
      phones: [
        {
          phoneNumber: "0987654321",
          phoneType: Person_PhoneType.HOME,
        },
      ],
    },
  ],
};
```
This is almost identical to the original JSON object we used in the [data structure section above](#define-the-data-structure-for-your-messages), how fantastic is that!  There are two differences in the above that take advantage of some awesome idiomatic Typescript and make life really easy:
- The object type assignment `AddressBook` which allows you to use type checking for creating valid messages
- The `phoneType` is assigned through an enum, e.g. `Person_PhoneType.MOBILE`

However, if at this point you are thinking _*"Now wait up, this is not like the other tutorials I have seen. I was expecting to use a class object and function calls to assign the data fields"*_, you can do it that way with Typescript, have a look at [How do do this so it looks like most published tutorials](#how-do-do-this-so-it-looks-like-most-published-tutorials) section below.

Congrats, this is the hard work done. You are most of the way there!

## Serialise the Message to Protobuf

After all of the above, this is the easy bit. Again taking instruction from the generated Types file:

- `const serializedMessage = AddressBook.encode(myAddressBook).finish()`

## Do Something with the Serialised Message

The how of transmitting the encoded messages is out of scope here, but you can for example transmit over gRPC or HTTP or even save to file if you really want (as a lot of tutorials unhelpfully seem to do).

## De-serialise the Message

After you have transmitted or stored your message, at some point you are going to want to use its contents, so you are going to have to de-serialize. Again this is really easy:

- `const deSerializedMessage = AddressBook.decode(proto)`

Done! You have your original `AddressBook` Typed message object again.

Congrats, you survived and don’t need to spend days bashing your head against the wall.


# Closing Thoughts

Getting to even this starting point of being able to do the basics with Protobufs, as above, was not a straightforward journey for me and I hope if you have read this far it might shortcut that process for you.  I am sure the docs will get better over time but Protobufs are not a beginner topic and everyone has to start somewhere.

You can now:
1) Define you own message structure
2) Generate TypeScript `.ts` output for working with Protobufs within your code
2) Serialize messages into Protobuf for transmitting
3) De-serialise Protobufs back in to useable message objects.

For a next step, I would recommend spending spending some time understanding the [proto3 data structure](https://developers.google.com/protocol-buffers/docs/proto3) so that you can more easily build you own message structures.


# How do do this so it looks like most published tutorials
Most tutorials you find out there use a message class object with function calls to assign data to fields.  I have included this section for completeness and because I did go through this method before settling on my preferred solution above.   Particularly for data interchange you are likely to have a JSON object that you need to get into a Protobuf message and working through every data item and calling a function to assign to a field is tedious and results in more lines of code than necessary. Also, my comment above _*When you read the docs and get presented with ["The API is not well-documented yet"](https://github.com/protocolbuffers/protobuf/tree/master/js#api) you can be forgiven for wanting to cry and giving up_* reflects some of the pain I experienced when working through this method.

So, very quickly:

1) You need to use a different `protoc` plugin, for example [`ts-protoc-gen`](https://github.com/improbable-eng/ts-protoc-gen)
2) CLI command to compile (note the package name is reversed after install which is dumb)
```
protoc \
	--plugin="protoc-gen-ts=./node_modules/.bin/protoc-gen-ts" \
	--js_out="import_style=commonjs,binary:./generated" \
	--ts_out="./generated" \
	src/proto/addressBook.proto
```
3) To create a new message
    - Create a new instance of AddressBook:
      - `const myAddressBook = new AddressBook()`
    - You now have an empty address book, so add you first contact person:
      - `const newPerson1 = myAddressBook.addPeople()`
    - You now have one blank person in your address book, so add some contact details:
      - `person1.setName('Joe Blogs')`
      - `const person1Phone1 = person1.addPhones()`
      - `person1Phone1.setNumber('0123456789')`
      - `person1Phone1.setType(0)`
        - Note that you have to use the index value of the enum for the `PhoneType`. 
    - Now you get this idea, you can add the second person in the same way.
4) Serialize to Protobuf:
    - `const serializedMessage = myAddressBook.serializeBinary()`
5) De-serialize back to message:
    - `const deSerializedMessage = AddressBook.deserializeBinary(serializedMessage)`
6) Get non-Typed object:
    - `deSerializedMessage.toObject()`
      - This one also caused me some trouble because without the Types and not knowing there was a `.toObject()` call, the `deSerializedMessage` object can be logged and is a mess of wrappers, nested arrays and no keys.

Make you own choice which solution to use, there are advantages in each.
