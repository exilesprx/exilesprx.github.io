+++
title = 'Visitor Pattern'
date = 2025-03-24T17:57:09-04:00
draft = true
+++

I recently came across a site named grugbrain.dev. It presents many good points that I agree with, but there are also a few I disagree with—one of them being the stance on the Visitor pattern. My main issue is the lack of explanation; the page literally just says "bad." I wish the author had elaborated on why they think it is bad. I believe it’s important to understand different viewpoints because, well, that’s how we learn. This thought stuck with me for a while.

Later on, I began working on building an interpreter using PHP. The resource I followed was Crafting Interpreters, a well-written book from which I learned a lot. Coincidentally, it covered the Visitor pattern, and the author provided a great explanation of its benefits:

> The Visitor pattern is really about approximating the functional style within an OOP language. It lets us add new columns to that table easily. We can define all of the behavior for a new operation on a set of types in one place, without having to touch the types themselves. It does this the same way we solve almost every problem in computer science: by adding a layer of indirection.

With that said, I think it’s important to understand the Visitor pattern and how it can be used to solve problems. It’s a great pattern to have in your toolbelt in case you ever need it.
