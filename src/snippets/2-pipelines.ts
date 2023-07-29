import { Effect, pipe } from "effect";

// pipe applies a series of functions to a value
const increment = (x: number) => x + 1;
const double = (x: number) => x * 2;
const subtractTen = (x: number) => x - 10;

const result = pipe(5, increment, double, subtractTen);
// identical to subtractTen(double(increment(5)))

console.log(result); // Output: 2

// Transforming the value of an effect with map
// type: Effect<never, never, string>
const mappedEffect = pipe(
  Effect.succeed(1),
  Effect.map((x) => String(x))
);

console.log(Effect.runSync(mappedEffect)); // Output: "1"

// Effectful transformations with flatMap
// type: Effect<never, Error, number>
const flatMappedEffect = pipe(
  Effect.succeed({ x: 5, y: 0 }),
  Effect.flatMap(({ x, y }: { x: number; y: number }) =>
    y === 0 ? Effect.fail(new Error("divide by zero")) : Effect.succeed(x / y)
  )
);

// mini example
// type: Effect<never, never, number>
const getRandomNumber = Effect.sync(() => Math.random() * 10);

// returns: Effect<never, Error, number>
const checkIfAtLeastFive = (x: number) =>
  x > 5 ? Effect.succeed(x) : Effect.fail(new Error("number is less than 5"));

// returns: Effect<never, never, void>
const logNumber = (x: number) => Effect.log(x.toString());

const program = pipe(
  getRandomNumber,
  // Effect<never, never, number>
  Effect.map((x) => x * 2),
  // Effect<never, never, number>
  Effect.flatMap((x) => checkIfAtLeastFive(x)),
  // Effect<never, Error, number>
  Effect.flatMap((x) => logNumber(x))
  // Effect<never, Error, void>
);

// Ignoring the result of an Effect

{
  const program = pipe(
    Effect.succeed(5),
    Effect.tap((x) => logNumber(x)),
    Effect.map((x) => x + 1)
  );
}

// Consuming multiple Effects with all

const foo = Effect.succeed(42);
const bar = Effect.succeed("Hello");

// type: Effect<never, never, [number, string]>
const combinedEffect = Effect.all([foo, bar]);

console.log(Effect.runSync(combinedEffect));
// console: [42, "Hello"]

// type: Effect<never, never, { foo: number, bar: string }>
const combinedObjectEffect = Effect.all({ foo, bar });

console.log(Effect.runSync(combinedObjectEffect));
// console: { foo: 43, bar: "Hello" }
