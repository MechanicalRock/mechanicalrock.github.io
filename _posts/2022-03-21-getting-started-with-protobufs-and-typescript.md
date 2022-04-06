---
layout: post
title: Getting Started with Protobufs and Typescript
description: Tutorial for how to start using Protobufs with Typescript
date: 2022-03-21
author: Ed Newsom
highlight: monokai
image: img/blog/protobuf-ts/protobuf-ts.jpg
tags: ["protobuf", "typescript", "tutorial", "protoc", "npm"]
---

![Protobuf and TypeScript](/img/blog/protobuf-ts/protobuf-ts.png)

# Getting Started with Protobufs and Typescript
Getting Protobufs to work with Typescript for the first time is not very straightforward and this article runs through the minimum steps needed to make it work.  Hopefully after reading this and working through the code, you will be confident enough to start using Protobufs in your own projects.

[Click here to skip to the technical bits](#making-it-work) 

or [Click here for the code repository in Github and to skip all the words](https://github.com/MechanicalRock/protobuf-example-ts)

## How Did We Get Here?
A while ago I was asked to build a specific type of data API that supports Protobufs. My first reaction was to groan because I had tried to learn Protobufs previously and failed twice.  Admittedly on both occasions I did not have an application to focus on and other shiny things distracted me. Before trying again I asked some of my infinitely more experienced colleagues here at [Mechanical Rock](https://mechanicalrock.io) if it was just me or is the documentation for learning Protobufs from zero really '@#^%'? There was some great discussion on this and they sent me on my way with more than a few useful hints.

Having got to the point where I understand enough to use them in anger, I realised that trying to learn Protobufs with Typescript first was the problem because that is where the doc's fall short. I actually had to revert to my first love, Python, before I could transfer that newly minted knowledge to TypeScript.

## Other Stuff & Assumptions
I am going to skip over the why Protobufs vs XML, the details of the [proto3 data structure](https://developers.google.com/protocol-buffers/docs/proto3) and the like which you can find in plenty of other articles.  I'm assuming you know: node.js, Typescript, npm and Jest. I am using Mac/Linux here (sorry Windows users but you can deal with your own world of pain). I am also shamelessly basing this on the [Google Protobuf Tutorials](https://developers.google.com/protocol-buffers/docs/tutorials) because I am sure you have already been there, hence using the Address Book example.

# Making It Work
We're going to work through an end to end process to demonstrate the minimum of using Protobufs with TypeScript. Check out the [repository on Github](https://github.com/MechanicalRock/protobuf-example-ts) which brings this all together.

1. [Define the data structure for your messages](#define-the-data-structure-for-your-messages)
2. [Compile the Typescript files you will use in your code](#compile-the-typescript-you-will-use-in-your-code)
3. [Create a message](#create-a-message)
4. [Serialise the message to Protobuf](#serialise-the-message-to-protobuf)
5. [Do something with the serialised message](#do-something-with-the-serialised-message)
6. [De-serialise the message](#de-serialise-the-message)

## Define the Data Structure for Your Messages
First thing to realise about Protobufs is they are just an efficient (small data size) way of encoding messages. Second, these messages have a pre-defined data structure and you need to know this structure at both ends; to serialize the message before sending and then to de-serialize the message back into something useable after it has been received. This is what the language independent `.proto` files are for.

We are going to create an Address Book message that we want to transmit using Protobufs. This message contains People and People have contact details. For example, a JSON object for this message would look something like:

```js
const myAddressBook = {
  people: [
    {
      name: "Joe Blogs",
      phones: [
        {
          phoneNumber: "0123456789",
          phoneType: "MOBILE"
        }
      ]
    },
    {
      name: "Jane Smith",
      phones: [
        {
          phoneNumber: "0987654321",
          phoneType: "HOME"
        }
      ]
    }
  ]
}
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
This is one of the bits that didn’t quite make sense when I was first trying to learn Protobufs.  There is some magic that's needed to turn the `.proto` files into language specific code you can use within your project.

- For this you need the `protoc` compiler. Download and install the [prebuilt binary](https://github.com/protocolbuffers/protobuf/releases)
  - On my Mac I downloaded `protoc-x.xx.x-osx-x86_64.zip`, unzipped and copied the `protoc` file in to my `$PATH` at `/usr/local/bin/`.

However, this only generates code for [some languages](https://github.com/protocolbuffers/protobuf#protobuf-runtime-installation). From that list we're interested in JavaScript. The bit that isn’t included with `protoc` is generating the Typescript types. For that you need a plugin for `protoc` like the [`ts-proto`](https://www.npmjs.com/package/ts-proto) npm package.

Let's start building.  Start a TypeScript project and create an `addressBook.proto` file as above in the same project. Then run:

- `npm install ts-protoc-gen`

Next compile your `.proto` file into a `.ts` file for use within your project by running the following CLI command:

```
protoc \
    --plugin="./node_modules/.bin/protoc-gen-ts_proto" \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_out="./src/generated" \
    src/proto/addressBook.proto
```

This is the point where I really like TypeScript. If you run `protoc` without the `ts-proto` plugin and look at the generated code there are 760 lines of stuff in the `generated/src/proto/addressBook.js` file which honestly is not that easy to read or understand how to use. But if you look at the `generated/src/proto/addressBook.ts` file, there are only 250 lines and it provides you with the type interfaces and commands you are going to need to create and use your messages and Protobufs.

_*This is where I fell over on my first attempt, I did not use a plugin like `ts-proto` to generate the types and only had the JS output. I couldn't easily enough understand what was going on, got lost and then distracted by other shiny stuff.*_

## Create a Message
_*When you read the docs and get presented with ["The API is not well-documented yet"](https://github.com/protocolbuffers/protobuf/tree/master/js#api) you can be forgiven for wanting to cry and giving up. This is where I failed on my second attempt and this is where the Typescript types come to the rescue.*_

Creating the contents of your message is now as easy as:
```js
import { AddressBook, Person_PhoneType } from './generated/src/proto/addressBook'

const myAddressBook: AddressBook = {
  people: [
    {
      name: "Joe Blogs",
      phones: [
        {
          phoneNumber: "0123456789",
          phoneType: Person_PhoneType.MOBILE,
        }
      ]
    },
    {
      name: "Jane Smith",
      phones: [
        {
          phoneNumber: "0987654321",
          phoneType: Person_PhoneType.HOME,
        }
      ]
    }
  ]
}
```
This is almost identical to the original JSON object used in the [data structure section above](#define-the-data-structure-for-your-messages), how fantastic is that!  There are two differences in the above that take advantage of some awesome idiomatic Typescript and make life really easy:
- The object type assignment `AddressBook` which allows you to use type checking for creating valid messages
- The `phoneType` is assigned through an enum, e.g. `Person_PhoneType.MOBILE`

However, if at this point you are thinking _*"Now wait up, this is not like the other tutorials I have seen. I was expecting to use a class object and function calls to create the message"*_, you can do it that way with Typescript, have a look at the [How to do this so it looks like most published tutorials](#how-to-do-this-so-it-looks-like-most-published-tutorials) section below.

Great, this is the hard work done. You are most of the way there!

## Serialise the Message to Protobuf
After all of the above, this is the easy bit. Again taking instruction from the generated types file:

- `const serializedMessage = AddressBook.encode(myAddressBook).finish()`

## Do Something with the Serialised Message
The how of transmitting the encoded messages is out of scope here, but you can for example transmit over gRPC or HTTP or save to file if you really want (as a lot of tutorials unhelpfully seem to do).

## De-serialise the Message
After you have transmitted or stored your message, at some point you are going to want to use its contents and you are going to have to de-serialize. Again this is really easy:

- `const deSerializedMessage = AddressBook.decode(serializedMessage)`

Done! You have your original `AddressBook` Typed message object again.

Congrats, you survived and don’t need to spend days bashing your head against the wall.


# Closing Thoughts
Getting to even this point of doing the basics with Protobufs and Typescript was not a straightforward journey for me and I hope if you have read this far it might shortcut that process for you.  I am sure the docs will get better over time but Protobufs are not a beginner topic and everyone has to start somewhere.

You can now:
1. Define you own `.proto` message structure
2. Generate TypeScript `.ts` output for working with Protobufs within your code
3. Serialize messages into Protobufs for transmitting
4. De-serialise Protobufs back in to useable message objects.

For a next step, I would recommend spending spending some time understanding the [proto3 data structure](https://developers.google.com/protocol-buffers/docs/proto3) so you can more easily build you own message structures.

If you have any questions regarding this article or want a chat about anything cloud native, feel free to contact us at Mechanical Rock either via [email](mailto:contact@mechanicalrock.io) or our [web form](https://mechanicalrock.io/lets-get-started).

<br>
<br>

## How to do this so it looks like most published tutorials
Most tutorials you find out there use a message class object with function calls to assign data to fields.  I have included this section for completeness and because I did go through this method before settling on my preferred solution above. Particularly for data interchange you are likely to have a JSON object that you need to get into a Protobuf message and working through every data item and calling a function to assign to a field is tedious and results in more lines of code than necessary. Also, my comment above _*When you read the docs and get presented with ["The API is not well-documented yet"](https://github.com/protocolbuffers/protobuf/tree/master/js#api) you can be forgiven for wanting to cry and giving up_* reflects some of the pain I experienced when working through this method.

Very quickly:

1) You need to use a different `protoc` plugin, for example [`ts-protoc-gen`](https://github.com/improbable-eng/ts-protoc-gen)
2) CLI command to compile becomes (note the package name is reversed after install which is dumb):
```
protoc \
	--plugin="protoc-gen-ts=./node_modules/.bin/protoc-gen-ts" \
	--js_out="import_style=commonjs,binary:./generated" \
	--ts_out="./generated" \
	src/proto/addressBook.proto
```
3) To create a new message:
    - Create a new instance of AddressBook:
      - `const myAddressBook = new AddressBook()`
    - You now have an empty address book and can add your first contact person:
      - `const newPerson1 = myAddressBook.addPeople()`
    - You now have a blank person in your address book and can add some contact details:
      - `person1.setName('Joe Blogs')`
      - `const person1Phone1 = person1.addPhones()`
      - `person1Phone1.setNumber('0123456789')`
      - `person1Phone1.setType(0)`
        - Note that you have to use the index value of the enum for the `PhoneType`. 
    - Now you get the idea, you can add a second person in the same way.
4) Serialize to Protobuf:
    - `const serializedMessage = myAddressBook.serializeBinary()`
5) De-serialize back to message:
    - `const deSerializedMessage = AddressBook.deserializeBinary(serializedMessage)`
6) Get non-Typed object:
    - `deSerializedMessage.toObject()`
      - This one also caused me some trouble because without the Types and not knowing there was a `.toObject()` call, the `deSerializedMessage` object can be logged and is a mess of wrappers, nested arrays and no keys.

Make your own choice which solution to use, there are advantages in each.
