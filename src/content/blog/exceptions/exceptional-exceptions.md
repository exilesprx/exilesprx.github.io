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

## What the Guideline Actually Means

The original intent of "exceptions should be exceptional" was narrow and specific: **don't use exceptions as control flow.** Don't throw an exception to signal that a loop is done iterating. Don't use try/catch as a substitute for an if/else when checking whether a string is a valid integer. The concern was twofold -- exceptions are expensive to construct and unwind, and using them as glorified `goto` statements makes code hard to follow.

That's it. That's the whole claim.

What the guideline does _not_ mean is that exceptions should only be used for rare or surprising situations. It says nothing about whether anticipated failure modes -- a missing record, an unreachable database, a permission denial -- should be modelled as exceptions or swept under the rug with a null return. That's a separate question entirely, and conflating the two is where things go wrong.

## The Case Against Null as an Error Signal

When a developer hears "exceptions should be exceptional," a common conclusion is: _"a failed database lookup is expected, so I should return null instead of throwing."_ This reasoning sounds careful. In practice it trades one problem for several worse ones.

### Null Is a Lie in the Type System

A function with the return type `User` that returns `null` on failure is making a promise it doesn't keep. The type says the caller gets a `User`. The runtime sometimes delivers nothing, with no indication why. PHP's type system will let you get away with this unless you are disciplined about nullable types, and even then nothing stops a careless `?User` return type from swallowing a genuine failure.

Tony Hoare, who invented the null reference, called it his "billion dollar mistake" for exactly this reason.

### Null Destroys Information

This is the most damaging property of null as an error signal: it is a **lossy encoding**. You take a rich set of distinct, actionable failure states and collapse them all into a single value that means nothing more than "something went wrong."

Consider `getUser($id)`. Why might it return null?

- The user doesn't exist
- The database is unreachable
- The caller lacks permission
- The query timed out

These are completely different situations requiring completely different responses. A missing user might call for a 404. A database outage might call for a retry with backoff. A permission failure might call for a 403 and an audit log entry. But null encodes all of them identically. Every caller that receives it is flying blind.

PHP has perfectly good typed exceptions. `UserNotFoundException`, `DatabaseUnavailableException`, and `PermissionDeniedException` are distinct, named, and actionable. The type of the exception is documentation. A developer reading a catch block immediately understands what condition is being handled:

```php
try {
    $user = $this->userRepository->getUser($id);
} catch (UserNotFoundException $e) {
    return new Response(status: 404);
} catch (PermissionDeniedException $e) {
    $this->audit->log($id);
    return new Response(status: 403);
} catch (DatabaseUnavailableException $e) {
    $this->logger->error($e->getMessage());
    return new Response(status: 503);
}
```

Each failure mode is handled explicitly, differently, and correctly. None of this is possible when the function returns null.

## The Null Propagation Problem

The damage doesn't stay local. In practice, null-defensive code looks like one of two things.

**The early-return pattern:**

```php
$user = $this->getUser($id);
if ($user === null) {
    return null;
}

$address = $this->getAddress($user);
if ($address === null) {
    return null;
}

$city = $this->getCity($address);
if ($city === null) {
    return null;
}
```

Every check silently discards whatever information the original failure contained, then propagates null upward. The caller receives a null that could represent any failure from any depth of the call chain. The information loss compounds with every layer. By the time a null surfaces at the top of the stack, it is completely uninterpretable.

**The arrow anti-pattern:**

```php
$user = $this->getUser($id);
if ($user !== null) {
    $address = $this->getAddress($user);
    if ($address !== null) {
        $city = $this->getCity($address);
        if ($city !== null) {
            // actual logic, buried three levels deep
        }
    }
}
```

The code drifts rightward with every defensive check, and the real logic gets buried inside layers of nesting. Worse, every closing brace is a **silent else** -- if any check fails, nothing happens. No exception is thrown. Execution quietly falls through. In many cases this is worse than crashing, because the failure is invisible. A crash tells you something went wrong and where. Silent fallthrough just produces wrong behaviour with no signal.

The correct approach is to throw typed exceptions and let them propagate, catching only what you can meaningfully handle:

```php
// Exceptions propagate naturally -- no null checks needed at every step
$user = $this->getUser($id);         // throws UserNotFoundException
$address = $this->getAddress($user); // throws AddressNotFoundException
$city = $this->getCity($address);    // throws InvalidRegionException
```

Every failure has a name, a type, and a stack trace. The caller catches what it can handle and lets the rest bubble up to a central error handler.

## Where Null Actually Belongs

There is a legitimate use for null, and it's worth being precise about when that applies.

The distinction that holds up is between **absence** and **failure.**

- `findUser($id): ?User` returning null is appropriate when "user not found" is a _normal, expected outcome with no error semantics_ -- the caller genuinely needs to branch on found versus not found, and there's nothing wrong with either path.
- `getUser($id): User` throwing `UserNotFoundException` is appropriate when the caller asserts the user should exist, and its absence represents a problem to be handled.

The naming convention here is intentional and worth adopting. `find` implies a search that may come up empty. `get` implies a retrieval where the record is expected to exist. When the semantics say "this should be here," use an exception. When the semantics say "this might or might not be here," null or a nullable return type is appropriate -- but only then.

## Conclusion

"Exceptions should be exceptional" means: don't use exceptions as control flow. It doesn't mean: return null whenever a failure is anticipated.

PHP has a perfectly capable exception hierarchy and supports typed, named exceptions that carry context and can be caught selectively. Null, by contrast, destroys the information that distinguishes one failure from another, propagates upward through call stacks silently, and forces defensive checks at every layer without ever telling you what you're actually defending against.

The guideline was meant to prevent exceptions from being overused as goto statements. It was never a licence to smuggle ambiguous nulls in through the back door.
