---
layout: post
title: Ensuring Resolvers Aren't Rejected
date: 2020-04-27
tags: appsync vtl resolver mapping template testing tdd
author: Rick Foxcroft
image: img/appsync.png
---

If you're using AppSync, you will no doubt have come across resolver mapping templates. To paraphrase the AWS [docs](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference-overview.html), resolvers link a GraphQL query or mutation via a mapping template to a datasource and a mapping template is a way to indicate to AppSync how to translate an incoming GraphQL request into instructions that can be used to operate on your datasource.

Mapping Templates are written in Apache Velocity Template Language ([VTL](https://velocity.apache.org/engine/1.7/user-guide.html)) and take the GraphQL request as input and produce a JSON document containing the resolver instructions as output. Mapping templates are great because they allow you to interact directly with AWS datastores such as DynamoDB, ElasticSearch and RDS. Allowing you to capture simple backend CRUD operations as configuration without the need for managing any related code.

Except, they really can be code sometimes.

Although, you can programatically achieve quite a lot with VTL, especially as AppSync exposes some additional helper [utils](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-util-reference.html) as well as the mappings to the [Java String class](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference-programming-guide.html#strings) for basic string operations, it can be tricky to determine how your use of this templating language will play out at runtime since these particular features are unique to the AppSync environment.

If you're using the Amplify framework you can use the emulation tools provided for fully testing GraphQL APIs as is documented in this [AWS blog](https://aws.amazon.com/blogs/aws/new-local-mocking-and-testing-with-the-amplify-cli/). However, if for some reason you are not using Amplify, you may feel stretched for options in this space as the only other advertised way of testing these templates is through the AWS AppSync console, but this means that you have already committed to deploying AppSync resources in some capacity to get to this point.

![Console - Edit Resolver ]({{ site.url }}/img/editResolver-console.png)

Having found myself recently in this exact predicament, I embarked on a search for "a better way". I came across some packages deep within the murky depths of the Amplify framework and discovered that by reverse engineering one or two of these packages I could reproduce the VTL environment in development. This allowed me to develop VTL templates test first and get a super fast feedback loop into the JSON documents my templates were outputting before I deployed them anywhere.

Below is a trivial example where I use a VTL template to create a JSON document that will perform a DynamoDB PutItem operation. There is no syntax highlighting support for VTL in markdown so I have included an image instead.

![vtl template]({{ site.url }}/img/createThingVtlTemplate.png)

The test will look something like the following.

```typescript
import * as utils from 'amplify-appsync-simulator/lib/velocity/util'
import { map } from 'amplify-appsync-simulator/lib/velocity/value-mapper/mapper'
import { Compile, parse } from 'amplify-velocity-template'
import * as fs from 'fs'
import * as path from 'path'
import { expect } from 'chai'

describe('Create Thing', () => {
  it('should create the correct id value and the DynamoDB data type descriptor object ', () => {
    const templatePath = path.resolve(__dirname, '../templates/createSMP-request.vtl')
    const createSMPTemplate = fs.readFileSync(templatePath, { encoding: 'utf8' })
    const ast = parse(createSMPTemplate)
    const compiler = new Compile(ast, {
      valueMapper: map,
      escape: false
    })
    const args = {
      thing: {
        attribute1: '000',
        attribute2: '123',
        attribute3: '456'
      }
    }
    const context = createVtlContext(args)
    const result = JSON.parse(compiler.render(context))
    expect(result.key.id.S.startsWith(`thing_${args.thing.attribute1}`)).to.be.true
    const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
    expect(result.key.id.S).to.match(uuidRegex)
  })
})

function createVtlContext<T> (args: T) {
  const util = utils.create([], new Date(Date.now()), Object())
  const context = {
    args,
    arguments: args
  }
  return {
    util,
    utils: util,
    ctx: context,
    context
  }
}
```

Having the ability to unit test my resolver mapping templates means I can use these tests to aid my development efforts as well as run these tests as part of a test suite in my CI/CD pipeline, making sure that these templates at least make sense before deploying new resolvers to my GraphQL API.
