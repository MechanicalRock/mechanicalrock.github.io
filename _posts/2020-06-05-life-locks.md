---
layout: post
title: 'Life-Locks: Or how I discovered two S3 features and learned to love compliance'
date: 2020-06-05
tags: aws s3 WORM compliance locks lifecycle
author: Pete Yandell
---

<!--markdownlint-disable MD025 -->
## The story

Imagine this; you wake up one Monday morning after a great night's sleep. You're feeling well rested and so complete your morning routine quickly and head off to work with a skip in your step and a smile on your face. Sitting down at your desk, with your favourite hot beverage in hand, you start catching up on your emails. Only to read one that instantly sends a cold shiver of dread through you; your happiness falling like shards of broken glass.

```text
From: CorporateCompliance@example.com

To [redacted],

  As you may have heard, there are rumours circulating that our industry
  will soon need to conform to emerging regulations around records retention
  and destruction.

  We do not know as yet the exact requirements; however, we feel that this
  may be a major undertaking and so we need you to start work immediately!

Sincerely,
  Senior Vice President of Corporate Compliance.
```

In a non-cloud world, this would feel like a major piece of work; involving dedicated data centre space, specialised hardware, staff training; the list goes on and on.

<!-- markdownlint-disable MD033 -->
<span style='color:red; font-size: 1.1em;'>**BOOM!**</span> Then it hits you; the system in question has been migrated to AWS. So, you boot up your trusty browser and dig in ...

## The requirements

After taking a big swig of your drink, you start perusing the exhaustive [S3 documentation](https://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html). Soon you realise you can break down the requirements and match each one to specific S3 features:

1. The first requirement is addressing [WORM (Write Once, Read Many)](https://en.wikipedia.org/wiki/Write_once_read_many); S3 provides this via the [Object Locks](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html) feature.
2. The second requirement is destruction once the retention period is lifted; again, S3 provides this via the [Object Lifecycle Policies](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html) feature.
3. The third requirement is to be flexible in how the legislature is enforced, once again S3 provides this via [Bucket Policies](https://docs.aws.amazon.com/AmazonS3/latest/dev/access-policy-language-overview.html).

There is also an unspoken-yet-inviolable requirement that this is managed via [Infrastructure-as-Code](https://en.wikipedia.org/wiki/Infrastructure_as_code). [CloudFormation](https://aws.amazon.com/cloudformation/) to the rescue!

### First and Second Requirements

The first and second requirements, object locking and lifecycle management respectively, are met by how the S3 bucket is configured:

```yaml
Bucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: 'example-lifelocks'
    LifecycleConfiguration:
      Rules:
        - ExpirationInDays: 8
          NoncurrentVersionExpirationInDays: 1
          Status: Enabled
    ObjectLockEnabled: true
    VersioningConfiguration:
      Status: Enabled
```

Object locking has two dependencies, namely:

1. That [Bucket Versioning](https://docs.aws.amazon.com/AmazonS3/latest/dev/ObjectVersioning.html) is enabled; and
2. That [Object Locks](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html) are enabled when the bucket is [first created](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html#object-lock-bucket-config).

The lifecycle policy states that after 8 days, objects become expired. This puts a [delete marker](https://docs.aws.amazon.com/AmazonS3/latest/dev/DeleteMarker.html) against the file and marks it noncurrent (which is effectively a recoverable soft-delete). Once the object becomes noncurrent, it is permanently deleted after 1 more day.

### Third Requirement

As the exact legislative requirements around retention haven't been decided, the implementation needs to be flexible. You know you will need to react quickly when the rules change, and [Bucket Policies](https://docs.aws.amazon.com/AmazonS3/latest/dev/access-policy-language-overview.html) paired with [Conditions Keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition.html) grant you this freedom. You can continually make code changes and redeploy as often as required by using these two condition keys:

1. [s3:object-lock-mode](https://docs.aws.amazon.com/AmazonS3/latest/dev/list_amazons3.html#amazons3-policy-keys) is used to enforce which locking mode is used; and
2. [s3:object-lock-remaining-retention-days](https://docs.aws.amazon.com/AmazonS3/latest/dev/list_amazons3.html#amazons3-policy-keys) is used to enforce the required lock duration.

#### s3:object-lock-mode

By using `s3:object-lock-mode` you can enforce which [S3 Actions](https://docs.aws.amazon.com/IAM/latest/UserGuide/list_amazons3.html#amazons3-actions-as-permissions) require a lock mode value (the first stanza), as well as the requirement that it has a value of **COMPLIANCE** (second stanza).

```yaml
- Sid: 'RequireObjectLockMode'
  Effect: Deny
  Principal: '*'
  Action:
    - 's3:PutObject'
    - 's3:PutObjectRetention'
  Resource:
    - !Sub '${Bucket.Arn}/*'
  Condition:
      'Null':
        's3:object-lock-mode': 'true'
- Sid: 'RequireObjectLockModeToBeCompliance'
  Effect: Deny
  Principal: '*'
  Action:
    - 's3:PutObject'
    - 's3:PutObjectRetention'
  Resource:
    - !Sub '${Bucket.Arn}/*'
  Condition:
      'StringNotEqualsIgnoreCase':
        's3:object-lock-mode': 'COMPLIANCE'
```

#### s3:object-lock-remaining-retention-days

Next you enforce how long uploaded files are protected by using the `s3:object-lock-remaining-retention-days` condition key. In the example below, you require that a retention period be specified, and that it must be 7 days. It is also possible to use this condition key to enforce a day range; I'll leave that as an exercise for you dear reader :wink:

```yaml
- Sid: 'RequireRetentionDays'
  Effect: Deny
  Principal: '*'
  Action:
    - 's3:PutObject'
    - 's3:PutObjectRetention'
  Resource:
    - !Sub '${Bucket.Arn}/*'
  Condition:
      'Null':
        's3:object-lock-remaining-retention-days': 'true'
- Sid: 'RequireRetentionToBeThreeDays'
  Effect: Deny
  Principal: '*'
  Action:
    - 's3:PutObject'
    - 's3:PutObjectRetention'
  Resource:
    - !Sub '${Bucket.Arn}/*'
  Condition:
      NumericNotEquals:
        's3:object-lock-remaining-retention-days': '7'
```

### Unspoken Requirement

The last and unspoken requirement can be found in this [complete CloudFormation template](/assets/2020-06-03-life-locks-example-template.yml).

## Definitions

During your reading you realise that some of the terms in [Object Locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html) are a bit vague, so you document them for the rest of the team:

* **LegalHold**: view this as making an object 'read-only'. It is independent to the `LockingMode`; you can specify neither, either or both of Legal Hold and Locking Mode.
* **LockingMode**: view this has how tamper proof the WORM model is, and has one of the following values:
  * **Governance**: Governance mode can be disabled by either an IAM User with the required IAM permissions or by the AWS Account's root user.
  * **Compliance**: Compliance mode cannot be disabled by any user, including the Account's root user.

**Note:** The `LockingMode` expiry date can only be modified if it extends the lock.

## Fame, Glory and Accolades

Phew, what a day! What started out with a shock quickly turned out very well! You managed to not only address the Compliance Manager's concerns but also have a proof-of-concept ready to deploy! Your colleagues are amazed, your manager is astounded and everyone else is seriously impressed by your Cloud Skillz!

Well done!
