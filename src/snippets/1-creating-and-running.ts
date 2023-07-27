import { Effect } from "effect";

// The Effect type
type ConceptualEffect<R, E, A> = (r: R) => E | A;
type Unit = Effect.Effect<never, never, void>;
type Simple = Effect.Effect<never, Error, number>;

// Creating Effects
const success = Effect.succeed(42);
const failure = Effect.fail(new Error());

// Effects compose together
function divide(x: number, y: number): Effect.Effect<never, Error, number> {
  if (y === 0) {
    return Effect.fail(new Error("divide by zero"));
  }
  return Effect.succeed(x / y);
}

// Delaying Computations
const sync = Effect.sync(() => {
  console.log("Hello, World!"); // side effect
  return 42; // return value
});

// An synchronous computation that may throw
const program = Effect.try({
  try: () => JSON.parse(""),
  catch: (_caughtError) => new Error("JSON.parse threw an error"),
});

// Asynchronous computations
const promise = Effect.promise(() => Promise.resolve(42));

// An asynchronous computation that may reject
const response = Effect.tryPromise({
  try: () => fetch("..."),
  catch: (_caughtError) => new Error("fetch rejected"),
});

// Running synchronous Effects
{
  // type: Effect<never, never, number>
  const program = Effect.sync(() => {
    console.log("Hello, World!");
    return 1;
  });
  // Console: <blank>

  // type: number
  const result = Effect.runSync(program);
  // Console: Hello, World!

  console.log(result);
  // Console: 1
}

// Running asynchronous Effects
{
  // type: Effect<never, never, number>
  const program = Effect.promise(() => Promise.resolve(42));

  // type: Promise<number>
  const result = Effect.runPromise(program);

  result.then(console.log);
  // Console: 1
}
