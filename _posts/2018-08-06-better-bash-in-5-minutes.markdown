---
layout: post
title:  "Better Bash Scripting in 5 Minutes or Less"
date:   2018-08-10
categories: bash linux unix mac osx script shell
author: Josh Armitage
image: img/bash-logo.png
---

## Shebang `#!/bin/bash`
You'll often see `#!/bin/bash` at the top of script files. What this is doing is forcing the script to be invoked using the `/bin/bash` binary. This stops the script being at the mercy of the invoking shell.

## Catching Errors `set -e`
Shell scripts by default don't fail fast and can give false positive return codes. By adding `set -e` right after the shebang line the script will now fail if any command fails.

## Unbound Variables `set -u`
This should be added unless you're checking for the existence of a variable, so if you reference any variables by mistake or typo the script will instantly fail.

## Add Trace Logging `set -x`
During the debugging stages it can be helpful to see what is being run, with this set it will print out the commands in full as they're run with all the variables resolved.

## Piping Carefully `set -o pipefail`
By default if you pipe in bash the return code is the return code of the last statement in the pipe. After setting this, if any command returns a non-zero return code the pipe will fail.

## Simple Command Output Checking
This pattern for checking output while not perfect is simple and covers the vast majority of cases. The below statement idempotently stops and removes a Docker container.
```bash
    if [[ $(docker container ps) == *container_name* ]]; then
        docker rm -f container_name
    fi
```

## Simple Looping
An easy way to loop is to set a variable that is your values split with spaces, then a for loop will automatically iterate as expected:
```bash
    CONTAINERS="container1 container2 container3"
    for CONTAINER in ${CONTAINERS}
    do
        docker run ${CONTAINER}
    done
```

## Idempotency
When the scripts are being committed to source control and shared amongst a team it's worth spending the time making sure that all commands are run idempotently but will still fail as expected.

## Reassign Parameters To Named Variables
Parameters passed to the script come through as $1, $2, etc. Especially as the bash file grows in size the meaning of the variables gets lost. Good practice is to reassign them at the top of the file.

```bash
ARTIFACT=${1}
```

## Cleaning Up After Ourselves
When you are running resources as part of the script it's valuable to write a function that will clean up the resources no matter how the script exits. Below is an example that will make sure a container is stopped and cleaned up.

```bash
    function cleanup {
        docker container stop container1
        docker container rm container1
    }
    trap cleanup SIGINT SIGTERM EXIT
```

## Learning when Bash is no longer the tool for the job
Every time I extend a bash script, I always consider the trade off between adding complexity to this script vs. potentially rewriting in Python or another language. Bash has it's advantages, but it's worth considering for critical scripts to write them in something easier to maintain and extend.

## Further Reading
For those wishing to become masters of Bash I would look at:
1. [Shellharden](https://github.com/anordal/shellharden)
1. [Learn Bash the Hard Way](https://leanpub.com/learnbashthehardway)
1. [Google Shell Scripting Style Guide](https://google.github.io/styleguide/shell.xml)
