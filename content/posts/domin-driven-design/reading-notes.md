+++ 
draft = true
date = 2024-02-10T00:52:59-05:00
title = "Think Tank"
description = "Notes from reading domain driven design books"
slug = ""
authors = []
tags = ["ddd", "domain-driven-design"]
categories = ["ddd"]
externalLink = ""
series = []
+++

- Factories should be used to create entities when a command is requested.
- Repositories should use a factory to create entities all of its invariants
- using the power of sql for specifications. Caller should use a repo and creates a spec. **The specification should use a eloquent model and its methods (like a scope or builder methed) not sure about this, query should be in the repo**. Then the caller provides the spec to the repo. The repo calls the spec method. The spec then calls the necessary repo method providing the builder. The repo method returns the results which is then return by the spec which is then return by the original repo called that required the spec
- three different specification implementation types: validation, selection (querying), building to order (generating)
- try to factor the most intricate computations into standalone classes, perhaps by modeling value objects held by thr most connected classes. Meaning, let the standalone classes compute by using value objects and returning value objects, the same ones the others classes use
- try to write classes such that the arguments and return value of the implementor are the same. If the implementor use a value of theirs, then the return value should be the implementor
- focus on: live in the domain, keep looking at things a different way, maintain an unbroken dialog with domain experts 
- a restful feed for all events created from a model could be helpful when another system needs to synchronize a subset of data from another system. This is like event replayability. Although, could something like kafka replace it?
- use long lived process with an executive and tracker (or aggregate) to handle events while keeping track of state when a change depends on multiple events
- event handlers can be synchronous or asynchronous, just depends on the needs of the system
- crud systems cant produce a refined business model by only capturing data. When businesses wont justify ddd as an investment, use entities as intended
- for UUIDs consider using a format more human readable, such as a context-type-creation.date-first.uuid.segment, example: APM-P-08-14-2012-f36ab21c, where apm is the context that generated the ID, p is the product and the last chars are the first segment from a UUID
- value objects extend primative types by placing specialized logic near that type. Not doing so keeps the logic separate from the primative type and therefore, could be lost in the masses
- use enums for standard types (different static types like admin, user, etc) or value objects. Set the defualt state functions (isAdmin, isUser, etc) to false and then override to true for each concrete type
- entities consumed by other boundaries should be modeled as value objects more often than entities. Use entities if state needs to change but use with caution
- don't let the data model influence the domain model. Instead, let the domain model influence the data model. When using a relation database, store value objects in the same row as entities when and where possible. If value objects need a separate table (like collections of value objects), hide the persistence implementations (the primary key). While it may look like an entity from a data perspective, the domain models it as a value object. Nosql databases would be ideal when persisting entities as a whole
- a domain service should be used when there are multiple things needing collaboration or if logic doesn't fit nicely in an entity or value object
- when events are created directly, treat them like aggregates. Meaning, they should have a unique identity and can be queried from the database
- when broadcasting a domain event with a unqiue id, it can be published at the same time its added to its repository. Basically a domain service would create the event, then add it to its repository and then publish over messaging infrastructure
- if the repository and message infrastructure do not share the same data source, use a 2 phase commit. 
- multiple aggregates should not be update in a single transaction synchronously. Instead, this should be done through an async approach (think queued reactors)
- an option for broadcasting domain events externally - persist the domain model and in the same transaction persist the event to the event store. And then send the doamin through a message broker. Example: aggregate behavoir produces an event, persist the state of the aggregate, then dispatch the event, a local subsriber consumes it and persists in to the event store, and then the same subscriber can send the event through a message broker.This can only happen if state persistence and event dispatching and consumer happen in the same thread. Otherwise, aggregate state change and an event is added to its list, then persist the aggregate state and the event in the same transaction. A background worker queries the event store and broadcast the event to subscribers. Those subscribers are local which either react to the event, or broadcast to external boundaries. If the domain model persistence OR event store persistence fails, rollback
- avoid using api calls when possible due to limitations such as system unavailability or slowness. Using an async messaging solution because itll achieve greater interdependence between systems
- don't immediately send events through a message broker. Instead every so often, query the event store for unpublished events and order the events. Then send the events through the message broker. Once acknowledged by the broker, mark the events as published. The message broker guarantees delivery and its up to the subscribers to retrieve the events
- subscribers should keep track of consumed events including data such as id and exchange. If out of order happens, the event store can be used to determine this and ignore events if needed. Such as if the most recently saved event is id 3 but 6 is received, then when 4 and 5 are received they could be ignored (assuming the same properties are changed)