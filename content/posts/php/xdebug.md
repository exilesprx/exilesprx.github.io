+++ 
draft = false
date = 2024-03-13T20:01:56-04:00
title = "Xdebug setup"
description = "Easy method to setup xdebug"
slug = "xdebug"
authors = ["exilesprx"]
tags = ["php", "xdebug", "configuration"]
categories = ["php", "configurations"]
externalLink = ""
series = []
+++

Xdebug is one of those things that is pretty easy to setup. However, I find myself infrequently setting it up, so I always forget the steps. This post will serve as a reminder to myself, and hopefully help others as well.

Typically, I set most static things in the xdebug configuration file. Anything that changes I leverage environment variables. And it is a good practice to keep your configuration files clean and easy to maintain. Which is why I prefer not to set non-static values in the configuration file.

If you're using docker, all proceeding steps still apply. If you're using docker compose, then you can leverage the .env file to set the environment variables.

Anyway, let's get started.

## Version 2

```text
XDEBUG_SESSION=storm
XDEBUG_CONFIG="remote_host=192.168.106.138 remote_enable=1 remote_port=9000 idekey=storm remote_autostart=1 remote_connect_back=0"
PHP_IDE_CONFIG="serverName=storm"
```

## Version 3

```text
XDEBUG_SESSION=storm
XDEBUG_CONFIG="client_host=192.168.106.138 client_port=9000"
PHP_IDE_CONFIG="serverName=storm"
```

Notes:
  - The word "storm" can be replaced with your preferred server name
  - "client_port" is might a little redundant, but I prefer to be explicit
  - "PHP_IDE_CONFIG" can obviously be removed if you're not using PHPStorm
