---
title: Nil can be a contract violation
description: How and why returning nil can violate the contract of a method, leading to bugs and maintenance issues.
slug: 'nil/contract-violation'
pubDate: 1777994374077
tags: ['nil', 'contracts']
isDraft: false
---

Here is a bug that has probably happened to you.

An API endpoint is supposed to return a list of devices. In most cases it does. But in one specific scenario -- when there are no devices -- it returns `null` instead. The frontend iterates the list with `map`. The frontend crashes.

```
Cannot read properties of null (reading 'map')
```

The frontend developer adds a null check, the bug is closed, and everyone moves on. But something quietly went wrong that a null check doesn't fix. The API broke its contract, and the damage from that is going to outlast the ticket.

## Empty and Nil Are Not the Same Thing

This is the root of the problem. `nil` and an empty slice feel similar -- both represent "nothing is here" -- but they have completely different semantics.

- `[]Device{}` means "I looked, and there is nothing here"
- `nil` means "I don't know, something is absent, or something went wrong"

An empty slice is a **valid, meaningful answer**. It tells the caller: the operation succeeded, the data was checked, and the result is zero items. The caller can range over it, measure it, serialize it, and reason about it. Everything works.

`nil` is a **broken promise**. It tells the caller nothing useful. Is there an error? Is the service degraded? Does this device category not exist? Did something upstream fail silently? Nil encodes all of these possibilities identically, and the caller has no way to distinguish between them.

In Go this distinction is easy to get right and easy to get wrong. A function that returns `[]Device` can return either:

```go
// Correct -- unambiguous, safe to range over
return []Device{}, nil

// Wrong -- breaks the contract, forces callers to defend against nil
return nil, nil
```

Both compile. Both have the same type signature. Only one of them keeps the promise.

## The Failure Is Invisible Until It Explodes Somewhere Else

What makes this particularly damaging is that the API didn't crash. It returned HTTP 200. From the outside, the request succeeded. The nil travels silently through the network, gets deserialized without complaint, and sits quietly in the frontend's state until the moment something tries to use it.

Then it explodes -- not at the source, but somewhere downstream, in code that had every reason to trust what it was given.

This is the defining characteristic of nil-related bugs: **the error surfaces far from where it was created.** The frontend developer debugging `Cannot read properties of null` has to trace backwards through a chain of apparently successful operations to find the actual cause. The further from the source the failure materializes, the harder it is to diagnose and the more likely the wrong layer ends up holding the fix.

In Go, the same problem surfaces at the serialization boundary. Go's `range` over a nil slice happens to be safe locally, which masks the problem -- but a nil slice serializes to `"null"` in a JSON response instead of `"[]"`, and that is where the downstream consumer breaks:

```go
devices, err := getDevices(ctx)
if err != nil {
    return err
}

// range over nil is safe in Go -- no panic here
// but when this gets serialized to JSON, nil becomes "null", not "[]"
// the contract is already broken at the boundary
for _, d := range devices {
    process(d)
}
```

The bug is silent on the server and loud on the client, which is exactly the wrong way around.

## Nil Permanently Widens the Contract

This is the part that doesn't get talked about enough. Once an API has shipped nil where it promised a list, the contract has changed -- whether anyone intended that or not.

The frontend adds a null check. The bug is closed. But that null check now has to live in the codebase. If the backend is corrected tomorrow, the frontend can't safely remove the defensive code. It can't trust that every environment, every edge case, every version of the API it might talk to will behave correctly. The null check stays, if only for a moment of paranoia -- and then it becomes a permanent part of the codebase.

The API contract has been **widened from `[]Device` to `[]Device | null`**, and there is overhead to correct it.

## The Fix Belongs at the Source

The frontend null check is an understandable response to a production bug. It is not a fix. It is a consumer working around a broken contract, and it means the cost of the original mistake has been transferred from the API to every client that touches it.

The correct fix is entirely on the API side. In Go, the right pattern is to initialize the slice before appending so it never serializes as null:

```go
func getDevices(ctx context.Context) ([]Device, error) {
    // Initialize to empty slice, not nil.
    // This ensures JSON serialization produces "[]" not "null".
    devices := make([]Device, 0)

    rows, err := db.QueryDevices(ctx)
    if err != nil {
        return nil, fmt.Errorf("getDevices: %w", err)
    }

    for _, row := range rows {
        devices = append(devices, row.ToDevice())
    }

    return devices, nil
}
```

This costs nothing. An empty slice is trivially cheap to construct and serialize. There is no scenario where returning nil instead of an empty slice is the right call when the return type is a slice.

If the function genuinely cannot determine whether the list is empty or whether something went wrong, that is a different problem -- and the answer is still not nil. It is a non-nil error with a message that gives consumers something to act on.

## The Broader Principle

The devices example is one instance of a general failure mode. Any time a function, method, or endpoint promises a type and returns nil instead, it is making its consumers responsible for a problem it created. The nil check that results is not defensive programming -- it is evidence that a contract was broken and the wrong layer is paying for it.

Nil should never be used as a substitute for an empty collection, a zero value, or a valid default. It should never be used to signal an error when an error return is possible. And it should never be returned where a concrete type was promised.

An empty slice is an answer. Nil is an absence of one. They are not interchangeable, and treating them as such is how a small oversight in one service quietly becomes permanent defensive code in every service that depends on it.
