
## About

This is just a little experiment in building a type-safe SQL library in TypeScript. It's somewhat inspired by Slick for Scala.

## Goals

1. Create an expressive, type-safe, SQL-like syntax.
2. Require as little boilerplate as possible.

## Example

```
let q2 = Query
  .find(User, Avatar)
  .select((u, a) => [ u.firstName, a.url ])
  .where((u, a) => a.userId.eq(u.id))
console.log(q2.toSql())
// SELECT u.firstName, a.url FROM User AS u WHERE a.userId = u.id
```

## Status

The basic proof of concept is here but there are a few things I don't like about it:

1. Building the tables as classes requires a lot of boilerplate code. This was also true of Slick.
2. The reliance of TypeScript's mapped types to build the column expressions makes the syntax nice and expressive but adds a lot of complexity.
3. Generalizing between a database and a subquery is difficult because of the use of mapped types.

## Wishes

1. A stronger type system in TypeScript would probably make this much easier. Variadic types could help substantially but that feature is not being actively developed yet. Even a way to build strongly typed tuples in some kind of dynamic way would be very helpful.
2. Could we build the tables via a command line tool?

## Building

1. Use `tsc -w` from the root directory. TypeScript code will be compiled to `./build`
2. Run with `node build/test.js`
