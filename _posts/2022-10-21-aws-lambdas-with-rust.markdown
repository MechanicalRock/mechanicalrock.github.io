---
layout: post
font: serif
title: Running Rust in the cloud with AWS Lambda Custom Runtime
date: 2022-10-18
highlight: monokai
author:  Leon Ticharwa
image: /img/blog/aws-lambdas-with-rust/rust-cover.png
tags: rust custom-runtime lambda aws sam deployment
---

## Why Rust?

Whether Rust is the C++ killer we've all been waiting for still remains to be seen. With companies like Tesla and Microsoft still heavily reliant on C++, it's a pretty safe bet that C++ will be around for a long time to come. Nonetheless, Rust's growing popularity among developers is definitely something to take notice of. [[1]](#references) 

In 2019, AWS officially became a sponsor of the Rust project before partnering with Microsoft, Google, Mozilla and Huawei in 2020 to create the Rust Foundation, an organisation whose sole purpose is to support Rust and fuel its adoption as a general purpose language. 

The rapid uptake of Rust by the three largest cloud providers has contributed significantly to the growth of the Rust community since its initial release in 2010. So, although C++ isn't going away any time soon, it's increasingly obvious that the demand for Rust skills is going to grow over time as more companies adopt Rust as a general purpose language.

### So what is Rust good for?

Rust is a mature programming language with all the features necessary to handle projects of any level of complexity. My personal favourite Rust feature is the provision of an inbuilt package manager called `cargo` - something I wish C++ came with. I want to avoid giving you a whole Rust sales pitch because I am not trying to convince you to use Rust. If you are here, then you are probably just looking for help with getting Rust in the cloud not a sales pitch. However, if you are interested in diving deeper into how Rust compares against other systems programming languages then I recommend reading the following [article]("https://betterprogramming.pub/in-depth-comparison-of-rust-and-cpp-579b1f93a5e9").

Here is a none "salesy" list of some of my favorite Rust features. 

- Memory saftey (due to absence of garbage collection)
- Can target embedded systems
- Rich type system and ownership model that helps you weed out memory related bugs thereby ensuring memory and thread safety
- Tiny footprint
- A package manager called Cargo (Mentioned it twice because it is that good)

## Let's get Rusty

1.  Install Rust  by following the instructions provided here `https://www.rust-lang.org/tools/install`

2. Install zigbuild by running `cargo install cargo-zigbuild ` in your command line. Zigbuild is a linker CLI tool that simplifies cross compilation of Rust code. 

## The fun stuff

1. Create a new Rust Project with `cargo new <rust_project_name>`

2.  Open the project folder and install dependencies with 
`cargo add lambda_runtime tokio serde_json serde`

3. Replace the contents of `src/main.rs` with the following code: 

~~~ rust
use lambda_runtime::{Context, Error, service_fn, run, LambdaEvent};
use serde::{Deserialize, Serialize};

#[tokio::main]
async fn main () ->Result<(), Error>{
    let handler = service_fn(handler);
   run(handler).await?;
    Ok(())
}

#[derive(Deserialize)]
struct Event {
    first_name: String,
    last_name: String

}

#[derive(Serialize)]
struct Output {
    message: String,
    request_id:String
}

async fn handler (event: LambdaEvent<Event>) -> Result<Output, Error> {
    let message:String = format!("Hi {} {} , welcome to rust in the cloud!", event.payload.first_name, event.payload.last_name);
    Ok(Output { message, request_id: event.context.request_id })
}
~~~

##### What's happening in the code 

The block of code shown below imports dependencies into our code. At the very top we import `lambda_runtime` - the library that provides a Lambda runtime for our Rust code.

Next we import `serde` - a framework for serialising/deserialising Rust data structures in an efficient and standardised manner.

~~~ rust
use lambda_runtime::{Context, Error, service_fn, run, LambdaEvent};
use serde::{Deserialize, Serialize};
~~~

The next Block of code starts with the  `#[tokio::main]` macro. This macro is responsible for transforming the `async fn main()`, execution entry point, function into a synchronous function that initialises a runtime instance and then subsequently executes the async main function. 

~~~ rust
#[tokio::main]
async fn main () ->Result<(), Error>{
    let handler = service_fn(handler); // This lets you build a Service from an async function that returns a Result.
   run(handler).await?; //Starts the Lambda Rust runtime and begins polling for events on the Lambda Runtime APIs
    Ok(())
}
~~~

~~~rust
#[derive(Deserialize)]   // Allows the struct to be Deserialised 
struct Event {
    first_name: String,
    last_name: String
}

#[derive(Serialize)] // Allows the struct to be Serialised 
struct Output {
    message: String,
    request_id:String
}
~~~

The block of code provided below is the handler function that  processes events. This is passed to the `service_fn()` function so it can be converted to a service that can in turn be passed to the `run()` function - which has the responsibility of starting the Lambda Rust runtime.

~~~ rust 
async fn handler (event: LambdaEvent<Event>) -> Result<Output, Error> {
    let message:String = format!("Hi {} {} , welcome to rust in the cloud!", event.payload.first_name, event.payload.last_name);
    Ok(Output { message, request_id: event.context.request_id })
}
~~~

## Let's ~~blow things up~~, build and deploy

### Compile Rust Project to an executable binary file

1. Install the arm64 Rust target via rustup by running `rustup target add aarch64-unknown-linux-gnu`. Doing this allows us to target the `arm64` architecture when we build our executable binary file. 

2. Build an `arm64` executable binary file using Zigbuild by running `cargo zigbuild --target aarch64-unknown-linux-gnu --release` from the root of the Rust project

3. Copy the generated executable binary file to the root and rename it to bootstrap by running the following command from the root of the project `cp target/aarch64-unknown-linux-gnu/release/<project_name> bootstrap`

### Deploy to AWS using SAM

1. Create a `template.yaml` file and place it on the same level as the Rust project directory. 

2. Add the the following to the `template.yaml` file you created in step 1
   
~~~ yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  HelloFriendFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: HelloFriendFunction
      MemorySize: 128
      Architectures: ["arm64"]
      Handler: bootstrap
      Runtime: provided.al2
      Timeout: 5
      CodeUri: <rust_project_name>/

Outputs:
  FunctionName:
    Value: !Ref HelloFriendFunction
    Description: This is a simple Lambda Function Written in Rust
~~~
1. From the same level as the `template.yaml` file, run the command `sam deploy --guided`
   
2. Once The deployment succeeds, take note of the created Lambda Function's name in the outputs

### Test your Lambda Function

Invoke the newly deployed lambda using aws-cli in your terminal, the output will be placed in a file called `output.json`

~~~
    aws lambda invoke \
    --cli-binary-format raw-in-base64-out \
    --region ap-southeast-2 \
    --function-name <your_lambda_function_name> \
    --payload '{"first_name": "Leon", "last_name":"Ticharwa"}' \
    output.json
~~~

expected output 

~~~json
   {
   "message":"Hi Leon Ticharwa , welcome to rust in the cloud!",
   "request_id":"xxxx-xxxx-xxxx-xxxxx"
   }
~~~

All the code used in this tutorial can be found in this [repository](https://github.com/MechanicalRock/RustLambda-AWS). Please feel free to clone it and modify the code.

### Conclusion

Congratulations on deploying your first Rust custom runtime and program to AWS Lambda.

If you have any questions related to running Rust in the cloud please feel free to get in touch with the [Mechanical Rock team](https://mechanicalrock.io/services/).  

### References
[1]  [Sustainability with Rust](https://aws.amazon.com/blogs/opensource/sustainability-with-rust/#:~:text=We%20use%20Rust%20to%20deliver,%2C%20Amazon%20CloudFront%2C%20and%20more)