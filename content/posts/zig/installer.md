+++ 
draft = false
date = 2024-04-05T22:26:59-04:00
title = "Zig Installer"
description = "Building a simple zig installer"
slug = "installer"
authors = ["exilesprx"]
tags = ["zig", "installer"]
categories = ["zig", "programming"]
externalLink = ""
series = []
+++

As of right now, Zig does not have an installer so installing Zig is a manual process. Every time a new version of Zig was released, I found myself repeating the same steps:

- manually download the tarball
- extract the content into `/opt/zig` (this is the directory I prefer)
- remove the old tarball
- symlink the new version

So I wrote a very simple shell script to handle the process. Here is the source code if you're interested: https://github.com/exilesprx/zig-installer . And if you find it useful, feel free to give me a star :) .
