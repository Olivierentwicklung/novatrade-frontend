# Runtime Composition

## Context

By Chapter 30, NovaTrade already has several architectural boundaries in place.

The Orders UI does not depend directly on the REST adapter. Instead, it depends on the capability represented by:

```text
ORDER_API
```

Production uses:

```text
RestOrderApi
```

and Angular assembles the running application through:

```text
src/main.ts
        ↓
src/app/app.config.ts
```

The relevant production binding is:

```text
ORDER_API
        ↓
RestOrderApi
```

This means runtime composition already exists.

Chapter 30 does not need to invent a new dependency-injection mechanism or introduce a separate composition framework.

The architectural question is narrower:

> **Who owns the decision about which concrete implementation satisfies a required capability at runtime?**

---

## Observed Implementation

The Orders presentation depends on the port rather than the concrete REST adapter.

Conceptually:

```text
OrderPage
        ↓
ORDER_API
```

The concrete production implementation is selected in:

```text
src/app/app.config.ts
```

through an Angular provider binding:

```ts
{
  provide: ORDER_API,
  useClass: RestOrderApi,
}
```

Angular then bootstraps the application using that configuration from:

```text
src/main.ts
```

The resulting production dependency graph is:

```text
OrderPage
        ↓
ORDER_API
        ↑
RestOrderApi

concrete binding selected by:

app.config.ts
```

---

## Architectural Decision

Treat:

```text
src/app/app.config.ts
```

as the place that owns NovaTrade's top-level runtime composition decisions.

Its responsibility is to select concrete implementations for the capabilities required by the running frontend.

For the current Orders capability:

```text
ORDER_API
        ↓
RestOrderApi
```

The feature itself does not choose `RestOrderApi`.

The Application-facing dependency remains the port.

The concrete adapter is selected at the application boundary.

---

## Dependency Inversion, Dependency Injection, and Composition

These concepts are related, but they are not the same responsibility.

### Dependency Inversion

Dependency Inversion determines the direction of the architectural dependency:

```text
OrderPage
        ↓
ORDER_API
```

The higher-level consumer depends on an abstraction instead of depending directly on:

```text
RestOrderApi
```

### Dependency Injection

Angular dependency injection is the mechanism used to provide the selected implementation at runtime.

For example:

```ts
{
  provide: ORDER_API,
  useClass: RestOrderApi,
}
```

### Composition Root

The Composition Root is the architectural responsibility that owns the concrete wiring decision.

In the current NovaTrade frontend, that responsibility is expressed through:

```text
app.config.ts
```

Therefore:

```text
Dependency Inversion
≠
Dependency Injection
≠
Composition Root
```

They participate in the same dependency graph, but they answer different questions.

---

## Alternative Composition Is Already Possible

Production is not the only environment capable of satisfying `ORDER_API`.

The same abstraction can be connected to different implementations depending on the environment.

Conceptually:

```text
Production
ORDER_API
        ↓
RestOrderApi
```

Tests may instead use:

```text
ORDER_API
        ↓
InMemoryOrderApi
```

or:

```text
ORDER_API
        ↓
test double
```

This demonstrates that the consumer is not coupled to one concrete adapter.

The concrete implementation is selected outside the consumer.

---

## Why No New Composition Infrastructure Is Added

The existing Angular mechanism already expresses the required runtime decision clearly.

There is currently no demonstrated need for:

```text
CompositionRoot class

DependencyRegistry

custom DI container

service locator

generic adapter factory

custom bootstrap framework
```

Introducing any of these would duplicate functionality already provided by Angular without solving a new problem.

The smallest responsible design is therefore to keep using Angular's existing provider configuration.

---

## Why the Binding Remains Direct

The current composition requirement is small.

NovaTrade currently needs a straightforward binding:

```text
ORDER_API
        ↓
RestOrderApi
```

That can remain directly visible in `app.config.ts`.

A grouped provider function such as:

```text
provideOrders()
```

may become useful later if Orders acquires several related runtime bindings.

For example:

```text
ORDER_READ_API
PLACE_ORDER_API
CANCEL_ORDER_API
ORDER_EVENTS
ORDER_STORAGE
```

could eventually create enough grouping pressure to justify:

```text
provideOrders()
```

That pressure does not exist yet.

Therefore:

```text
centralized ownership of composition
≠
every provider must remain inline forever
```

but also:

```text
possible future complexity
≠
reason to introduce provider infrastructure now
```

---

## Deliberate Non-Decisions

Chapter 30 does not introduce:

- a custom dependency-injection container;
- a service locator;
- a `CompositionRoot` class;
- a dependency registry;
- a generic provider framework;
- a feature-level `provideOrders()` function;
- feature-specific composition infrastructure;
- additional abstraction around Angular providers.

These remain unjustified by the current implementation.

---

## Consequence

NovaTrade now has an explicit architectural interpretation of a mechanism that already existed:

```text
app.config.ts
        ↓
owns production runtime bindings
```

The Orders feature depends on a capability:

```text
ORDER_API
```

The REST adapter implements that capability:

```text
RestOrderApi
```

and the application composition boundary decides that production connects the two.

The important lesson is not that Angular provides dependency injection.

The important lesson is:

> **Concrete runtime choices belong at the composition boundary, not inside the feature that consumes the capability.**
