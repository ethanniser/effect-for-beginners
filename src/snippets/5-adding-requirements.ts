import { Effect, Context, pipe } from "effect";

type Random = {
  readonly next: () => Effect.Effect<never, never, number>;
};

const Random = Context.Tag<Random>();

// type: Effect<Random, never, void>
const program = pipe(
  Random,
  // "random" type: Random
  Effect.flatMap((random) => random.next()),
  Effect.flatMap((randomNumber) =>
    Effect.sync(() => console.log(`random number: ${randomNumber}`))
  )
);

// Effect.runSync(program); // Error!

const runnable = program.pipe(
  Effect.provideService(
    Random,
    Random.of({ next: () => Effect.succeed(Math.random()) })
  )
);

Effect.runSync(runnable);
