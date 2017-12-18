---
layout: post
title:  "Networking Between Sibling Docker Containers"
date:   2017-12-01
categories: devops docker
author: Tim Myerscough
image: img/docker-sibling/docker-network.png
---
We work inside Docker containers all the time, as our development environment.

As a result, we sometimes want to spin up [sibling containers](https://forums.docker.com/t/how-can-i-run-docker-command-inside-a-docker-container/337/2) and connect to them.

Example:

In the following example, I want to connect my current container, `myproject_dev-env_run_1`, started using [docker-compose](https://docs.docker.com/compose/) to the `myapp` container, which was started using the docker command from within the `dev-env` container:

```
$ docker ps
CONTAINER ID        IMAGE                      COMMAND              CREATED             STATUS              PORTS                  NAMES
874a13f65926        myapp                      "httpd-foreground"   11 minutes ago      Up 11 minutes       0.0.0.0:8080->80/tcp   myapp
034a8606b4b0        myproject-dev-env:latest   "bash"               37 minutes ago      Up 37 minutes                              myproject_dev-env_run_1
```

```
curl http://myapp
curl: (6) Could not resolve host: myapp
```

😞

However, I can connect the `myapp` container to my current container network
```
$ docker network ls
NETWORK ID          NAME                                      DRIVER              SCOPE
...
76a9193ca4b4        myproject_default    bridge              local
```

Connect the myapp container to my current network
`docker network connect 76a9193ca4b4 874a13f65926`

```
# curl http://myapp
<html>
<head>
  <Title>Hello World</title>
</head>
<body>
  Hello World!
</body>
</html>
```

BOOM! 🤘

[Docker networking](https://docs.docker.com/engine/userguide/networking/) is used by `docker-compose` under the hood to transparently add all your compose services to a common network.
