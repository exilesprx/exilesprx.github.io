---
title: Visitor Pattern - is it useful?
description: Why the visitor pattern can be useful
slug: 'design-patterns/visitor-pattern'
pubDate: 1746480980587
tags: ['development', 'programming', 'design patterns']
isDraft: false
---

I recently came across a site named grugbrain.dev. It presents many good points that I agree with, but one I disagree with—that being the stance on the Visitor pattern. My main issue is the lack of explanation; the page literally just says "bad." I wish the author had elaborated on why they think it is bad. I believe it’s important to understand different viewpoints because, well, that’s how we learn. The empty explanation left me wondering why the author thought the Visitor pattern was bad.

Later on, I began working on building an interpreter using PHP. The resource I followed was Crafting Interpreters, a well-written book from which I learned a lot. Coincidentally, it covered the Visitor pattern, and the author provided a great explanation of its benefit I had never considered in this way before:

> The Visitor pattern is really about approximating the functional style within an OOP language. It lets us add new columns to that table easily. We can define all of the behavior for a new operation on a set of types in one place, without having to touch the types themselves. It does this the same way we solve almost every problem in computer science: by adding a layer of indirection.

One might hear the argument that a functional style necessitates a functional language. However, this doesn't always account for existing project constraints. If an object-oriented (OOP) language is already in use—presumably because it meets the overall project needs—the visitor pattern can be an effective way to introduce functional-style processing for specific components where it offers clear benefits.

With that said, I'm glad I came across the grugbrain.dev site. It provided me with a different perspective on the Visitor pattern, and I appreciate the opportunity to explore this topic further. In the end, I learned more about the Visitor pattern and its potential benefits.
