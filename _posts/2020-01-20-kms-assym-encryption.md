---
layout: post
title:  How To Encrypt Data With Asymmetric KMS Data Keys
date: 2020-01-20
tags: kms aws encryption 
author: Matt Tyler
image: img/asym.png
---

# Introduction

I was recently doing some proof-of-concept work that required performing encryption using keys generated from AWS KMS (Key Management Service). I could find plenty of examples using symmetric encryption, but couldn't find an end-to-end guide that showed how to generate keys from AWS and then use them to encrypt and decrypt data. To that end, I hope this guide will be helpful to anyone else that may need to do this.

# Why would I want to do this?

In my case, I want to generate keys that can be used to verify communications between many clients to one server. The server will hold the private key, whilst (time-limited) public keys will be distributed to clients. The clients will encrypt their messages, and the server will decode them. After some time I will expire the private key such that new keys would need to be distributed to re-enable communication, as the server will no longer be able to decode them. The actual contents of the messages are not important (and in my particular case, aren't actually sensitive) - I'm just using the encryption to establish a time-limited trust between two parties.

# What is AWS KMS?

AWS KMS is managed service for creating and managing cryptographic material, which is typically used to secure access to services and protect confidential data. It uses hardware validated security modules that have been validate under FIPS 140-2 to generate and store key material, and it is integrated with AWS CloudTrail in order to provide logs of key usage to meet compliance and regulatory needs.

# Prerequisites

In addition to an active AWS account, you will need to have installed;

1. The aws-cli
2. Openssl
3. jq

The first thing we need to do is to create a customer managed key (CMK). This key will be used to encrypt the private key. The private key will be used later to decrypt our secret payload.

```bash
# This will create our key and store the ID of the created key
KMS_CMK_ID=$(aws kms create-key -o json | jq -r '.KeyMetadata.KeyId')
```

After this has been done, we can generate a key pair. This is done with the command `generate-data-key-pair-without-plaintext`. This will a generate key-pair that can be used to encrypt and decrypt data. The public key is sent back as base64 encoded plaintext, whilst the private key will be sent back as base64 encoded text, that was encrypted using CMK that we just created. We will use the public key to encrypt our messages. To decrypt, we first must make a call to AWS KMS to decrypt the private key, and then we use unencrypted response to decode our message.

We'll now create a key-pair.

```bash
aws kms generate-data-key-pair-without-plaintext \
    --key-id $KMS_CMK_ID \
    --key-pair-spec RSA_4096 > keypair.json

# this command will extract the public key from keypair.json and reformat it
cat << EOF > public.key
-----BEGIN PUBLIC KEY-----
$(jq -r '.PublicKey' keypair.json | fold -w60)
-----END PUBLIC KEY-----
EOF
```

Once this is done we can encrypt our message with the public key using openssl. You can do so with the following commands.

```bash
echo "My top secret message" > ./input.txt

openssl pkeyutl -encrypt -pubin \
    -inkey public.key \
    -in ./input.txt \
    -out ./input.txt.encrypted
```

This will have output the encrypted text to the `input.txt.encrypted` file. If you try to read the file, you'll notice it has been scrambled.

Now we need to decrypt the file. The first thing we need to do is recover the unecrypted private key. We can do this with the following commands.

```bash
cat << EOF > private.key
-----BEGIN PRIVATE KEY-----
$(aws kms decrypt \
  --ciphertext-blob fileb://<(jq -r '.PrivateKeyCiphertextBlob' keypair.json | base64 --decode) \
  --output text \
  --query Plaintext | fold -w60)
-----END PRIVATE KEY-----
EOF
```

This will base64 decode private key ciphertext blob that we received when generated the key, sends it off for decryption (the ciphertext includes the details of the key that encrypted it, so it does not need to be specified in the decrypt operation), and we receive an unecrypted, base64 encoded private key. In a way roundabout way, requiring this mechanism ensures that only roles/users that have access to the decrypt operation of the CMK have the ability to access and use the private data key.

We can now use the key to decrypt the message with openssl.

```bash
openssl pkeyutl -decrypt \
    -inkey private.key \
    -in ./input.txt.encrypted \
    -out ./input.txt.decrypted
```

You can run `diff input.txt input.txt.decrypted` to confirm that the decrypted message matches the input message. There should be no output from the command if the messages match.

Hopefully this practical example has helped you understand how to use AWS KMS data keys.

Got Data that needs securing? [Contact Mechanical Rock to Get Started!](https://www.mechanicalrock.io/lets-get-started)
