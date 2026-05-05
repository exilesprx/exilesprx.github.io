---
title: Exceptions Should Be Exceptional - A Misunderstood Guideline
description: The common advice that exceptions should be exceptional is often misapplied to justify returning null instead of throwing. This post clarifies the original intent of the guideline and explains why null is a lossy, untyped error signal that leads to worse code.
slug: 'exceptions/exceptional-exceptions'
pubDate: 1777905062399
tags: ['exceptions', 'null']
isDraft: false
---

One of the most repeated pieces of advice in software development is that _"exceptions should be exceptional."_ It sounds wise. It gets nodded at in code reviews. And it is -- quite frequently -- misapplied in ways that make codebases meaningfully worse.

This post is about what that guideline actually means, what it doesn't mean, and why reaching for `null` instead of an exception is often the wrong trade.

---

## What the Guideline Actually Means

The original intent of "exceptions should be exceptional" was narrow and specific: **don't use exceptions as control flow.** Don't throw an exception to signal that a loop is done iterating. Don't use try/catch as a substitute for an if/else when checking whether a string is a valid integer. The concern was twofold -- exceptions are expensive to construct and unwind, and using them as glorified `goto` statements makes code hard to follow.

That's it. That's the whole claim.

What the guideline does _not_ mean is that exceptions should only be used for rare or surprising situations. It says nothing about whether anticipated failure modes -- a missing record, an unreachable database, a permission denial -- should be modelled as exceptions or as null returns. That's a separate question entirely, and conflating the two is where things go wrong.

---

## The Case Against Null as an Error Signal

When a developer hears "exceptions should be exceptional," a common conclusion is: _"a failed database lookup is expected, so I should return null instead of throwing."_ This reasoning sounds careful. In practice, it trades one problem for several worse ones.

### Null Is a Lie in the Type System

A method with the signature `User getUser(int id)` that can return `null` is making a promise it doesn't keep. The type says the caller gets a `User`. The runtime sometimes delivers nothing. In languages where null isn't tracked by the type system -- Java without Optional, C#, most older OO languages -- there's nothing at the call site to warn you. The compiler can't help you. Tony Hoare, who invented the null reference, called it his "billion dollar mistake" for exactly this reason.

### Null Destroys Information

This is the most damaging property of null as an error signal: it is a **lossy encoding**. You take a rich set of distinct, actionable failure states and collapse them all into a single value that means nothing more than "something went wrong."

Consider a function like `getUser(id)`. Why might it return null?

- The user doesn't exist
- The database is unreachable
- The caller lacks permission
- The query timed out

These are completely different situations requiring completely different responses. A missing user might call for a 404. A database outage might call for a retry with backoff. A permission failure might call for a 403 and an audit log entry. But null encodes all of them identically. Every caller that receives it is flying blind.

An exception, by contrast, carries a **type, a message, and a stack trace.** `UserNotFoundException`, `DatabaseUnavailableException`, and `PermissionDeniedException` are distinct, named, actionable. The type of the exception is documentation. A developer reading a catch block immediately understands what condition is being handled.

---

## The Null Propagation Problem

The damage doesn't stay local. In practice, null-defensive code looks like one of two things.

**The early-return pattern:**

```java
User user = getUser(id);
if (user == null) return null;

Address address = getAddress(user);
if (address == null) return null;

String city = getCity(address);
if (city == null) return null;
```

This is flat and readable enough, but notice what's happening: every null check discards whatever information the original failure contained, and then returns null upward to the caller. The caller now receives a null that could represent any failure from any depth of the call chain. The information loss compounds with every layer. By the time a null surfaces at the top of the stack, it is completely uninterpretable.

**The arrow anti-pattern:**

```java

User user = getUser(id);
if (user != null) {
    Address address = getAddress(user);
    if (address != null) {
        String city = getCity(address);
        if (city != null) {
            // actual logic, buried three levels deep
        }
    }
}
```

Here the code drifts rightward with every defensive check, and the real logic gets buried inside layers of nesting. Worse, every closing brace is a **silent else** -- if any check fails, nothing happens. No error is raised. Execution quietly falls through. In many cases this is worse than crashing, because the failure is invisible. A crash tells you something went wrong and where. Silent fallthrough just produces wrong behaviour with no signal.

---

## Where Null and Optional Actually Belong

There is a legitimate use for representing absence, and it's worth being precise about when that applies.

The distinction that holds up is between **absence** and **failure.**

- `findUser(id)` returning `Optional<User>` or null is appropriate when "user not found" is a _normal, expected outcome with no error semantics_ -- the caller genuinely needs to branch on found versus not found, and there's nothing wrong with either path.
- `getUser(id)` throwing `UserNotFoundException` is appropriate when the caller _asserts_ the user should exist, and its absence represents a problem to be handled.

Languages like Kotlin, Swift, and Rust handle this well by making absence a tracked part of the type system -- `T?` or `Option<T>` forces the caller to acknowledge and handle the absent case. You get the explicitness of exceptions without the overhead. Java's `Optional<T>` was an attempt at the same, though it's used inconsistently in practice.

The key point is that when null _is_ the right choice, it should model **absence of a value**, not a **failed operation.** Those are different things, and conflating them is the root of most null-related suffering.

---

## Conclusion

"Exceptions should be exceptional" means: don't use exceptions as control flow. It doesn't mean: return null whenever a failure is anticipated.

In languages where null isn't tracked by the type system, a thrown exception is often the _more correct_ choice even for expected errors -- because it's explicit, typed, carries context, and cannot be silently ignored. Null, by contrast, destroys the information that distinguishes one failure from another, propagates upward through call stacks silently, and forces defensive checks at every layer without ever telling you what you're actually defending against.

The guideline was meant to prevent exceptions from being overused as goto statements. It was never a licence to smuggle ambiguous nulls in through the back door.
