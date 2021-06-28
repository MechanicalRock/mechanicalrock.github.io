---
layout: post
title: Building a Serverless RPC API on AWS: When is the mono lambda OK?
date: 2021-12-25
tags: rpc go twirp aws middleware
author: Matt Tyler
image: img/twirp.png
---

<center><img src="/img/twirp.png" /></center>
<br/>

In a previous installment I mentioned I had written some middleware to make using the AWS SDK more convenient for me to use. In that article I stated I was using it to ensure the table name of any DynamoDB SDK calls would be made to the same table, but stopped short of explaining how I did it. Well, the time has come to further explain what I did and how.

Code for what I'm covering is available [here](https://github.com/matt-tyle/ledger-part-one).

# Why Middleware?

Middleware is pretty big topic so I'll constraint myself to talking about why it might be useful within the context of AWS SDK clients. AWS SDK middleware allows you to attach additional features/logic when executing SDK calls. This can be useful for a number of reason e.g.

- To provide interception of SDK calls for client-side monitoring
- To cache requests/responses for performance reasons
- To modify requests e.g. add a tracing header to a request
- To provide default values when a value for a parameter isn't supplied
- and much more!

# Do all AWS SDKs support middleware?

As far as I can tell, most of them do! Of note though is that *how* middleware is implemented can differ slightly between different SDK clients. Typically the newer SDK clients e.g. Go v2, Javascript v3 have similar middleware interfaces. This seems to be an effect of being generated via the [Smithy IDL](https://awslabs.github.io/smithy/index.html), where-as older SDKs tended to be generated from the Boto definitions.

# Where can I find official documentation on middleware?

Good information for Go SDK v2 is available [here](https://aws.github.io/aws-sdk-go-v2/docs/middleware/).
The best information I could find for the javascript SDK was [this post on the official AWS Blog](https://aws.amazon.com/blogs/developer/middleware-stack-modular-aws-sdk-js/).

# Can I see an example?

Sure! So in the last past I wrote some middleware to help setting the table name parameter for DynamoDB. I used it like this...

```go
    // Look up the table name set as an environment variable
	tableName, ok := os.LookupEnv("TABLE_NAME")
	if !ok {
		log.Panicln("Failed to find required environment variable: TABLE_NAME")
	}

	ddb := dynamodb.NewFromConfig(cfg, dynamodb.WithAPIOptions(func(stack *middleware.Stack) error {
		// Attach the custom middleware to the beginning of the Initialize step
		return stack.Initialize.Add(m.DefaultTableNameMiddleware(tableName), middleware.Before)
	}))

	l, _ := ledger.NewService(*ddb)
```

The call to `stack.Initialize.Add` is used to add a middleware that I created with `m.DefaultTableNameMiddleware(tableName)`. The `middleware.Before` call is used to specify where the middleware is inserted into the call chain e.g. before the call is sent, which makes sense when defaulting a parameter.

The crux of the middleware is implemented below.

```go
func DefaultTableNameMiddleware(tableName string) middleware.InitializeMiddleware {
	middleware := middleware.InitializeMiddlewareFunc("defaultTableName", func(
		ctx context.Context, in middleware.InitializeInput, next middleware.InitializeHandler,
	) (
		out middleware.InitializeOutput, metadata middleware.Metadata, err error,
	) {
		if field, err := reflectStructField(in.Parameters, "TableName"); err == nil {
			field.Set(reflect.ValueOf(aws.String(tableName)))
		}

		return next.HandleInitialize(ctx, in)
	})
	return middleware
}
```

The `InititializeMiddlewareFunc` receives two parameters; the name of the middleware, and a function. It is the latter that implements the behaviour, and it receives several parameters when it is called by the client SDK during the process of making a request. I have wrapped this middleware in a factory function in order construct the middleware with a caller specified table name.

The actual middleware implementation is pretty simple - I use reflection to work out whether the input parameter struct has a `TableName` field, and if it does, I set the value to the tableName parameter that was passed into the factory function.

For completeness, the `reflectStructField` function is provided below.

```go
func reflectStructField(Iface interface{}, FieldName string) (*reflect.Value, error) {
	ValueIface := reflect.ValueOf(Iface)

	// Check if the passed interface is a pointer
	if ValueIface.Type().Kind() != reflect.Ptr {
		// Create a new type of Iface's Type, so we have a pointer to work with
		ValueIface = reflect.New(reflect.TypeOf(Iface))
	}

	// 'dereference' with Elem() and get the field by name
	Field := ValueIface.Elem().FieldByName(FieldName)
	if !Field.IsValid() {
		return nil, fmt.Errorf("Interface `%s` does not have the field `%s`", ValueIface.Type(), FieldName)
	}
	return &Field, nil
}
```

This has allowed me to set a default value for the table name parameter where it is required. I could improve this by checking to make sure the call is a valid DynamoDB service before setting the value. The documentation claims it is possible via the `GetServiceID` function, but I was unable to get this working, nor could I find a working example.

# Conclusion

In the post we learnt a little about middleware as it pertains to the AWS SDK, and why you might want to implement your own middleware. We then walked through a practical example that I wrote for a previous installment. Whilst this wasn't an exhaustive look at the ways you can implement middleware for the AWS SDK, hopefully it has provided enough information to give you a basic awareness of middleware, and how it can help you solve problems.

Until next time!

---

Don't be shy, [get in touch with us!](https://www.mechanicalrock.io/lets-get-started)

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)

