import { Effect, pipe } from "effect";

declare const imAnEffect: Effect.Effect<never, Error, number>;

// type: Effect<Effect<never, Error, string>
const program = Effect.gen(function* (_) {
  // type: number
  const valueOfEffect = yield* _(imAnEffect);
  return String(valueOfEffect);
});

{
  // mini example
  // returns: Effect<never, never, number>
  const getNumber = () => Effect.succeed(Math.random() * 10);

  // returns: Effect<never, Error, number>
  const checkIfAtLeastFive = (x: number) =>
    x > 5 ? Effect.succeed(x) : Effect.fail(new Error("number is less than 5"));

  // returns: Effect<never, never, void>
  const logNumber = (x: number) => Effect.sync(() => console.log(x));

  const before = pipe(
    getNumber(),
    // Effect<never, never, number>
    Effect.map((x) => x * 2),
    // Effect<never, never, number>
    Effect.flatMap(checkIfAtLeastFive),
    // Effect<never, Error, number>
    Effect.flatMap(logNumber)
    // Effect<never, Error, void>
  );

  // type: Effect<never, Error, void>
  const after = Effect.gen(function* (_) {
    const x = yield* _(getNumber());
    const y = x * 2;
    const z = yield* _(checkIfAtLeastFive(y));
    yield* _(logNumber(z));
  });
}
