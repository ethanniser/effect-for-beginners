import { Effect } from "effect";
// describing error types
{
  type DivideByZeroError = {
    readonly _tag: "DivideByZeroError";
  };

  type HttpError = {
    readonly _tag: "HttpError";
    readonly statusCode: number;
  };
}

// using classes to describe error types + constructors
class DivideByZeroError {
  readonly _tag = "DivideByZeroError";
}

class HttpError {
  readonly _tag = "HttpError";
  constructor(readonly statusCode: number) {}
}

Effect.fail(new DivideByZeroError());
Effect.fail(new HttpError(404));

declare const mayError: Effect.Effect<
  never,
  DivideByZeroError | HttpError,
  string
>;

// catching all errors

// type: Effect<never, never, string>
const caughtAll = mayError.pipe(
  // "e" type: DivideByZeroError | HttpError
  Effect.catchAll((error) =>
    Effect.succeed(`Recovering from any Error (${error._tag})`)
  )
);

// Catching specific errors

// type: Effect<never, DivideByZeroError, string>
const caughtTag = mayError.pipe(
  // "e" type: HttpError
  Effect.catchTag("HttpError", (httpError) =>
    Effect.succeed(
      `recovering from httpError with status: ${httpError.statusCode}`
    )
  )
);

//  Catching multiple specific errors

// type: Effect<never, never, string>
const caughtTags = mayError.pipe(
  Effect.catchTags({
    HttpError: (httpError) =>
      Effect.succeed(
        `recovering from httpError with status: ${httpError.statusCode}`
      ),
    DivideByZeroError: (_divideByZeroError) =>
      Effect.succeed("recovering from divideByZeroError"),
  })
);

// Short Circuiting

const operation1 = Effect.sync(() => console.log("operation1"));
const operation2 = Effect.fail(new Error("Something went wrong!"));
const operation3 = Effect.sync(() => console.log("operation3"));

Effect.runSync(
  operation1.pipe(
    Effect.flatMap(() => operation2),
    Effect.flatMap(() => operation3) // This computation won't be executed because the previous one fails
  )
);
/* console:
operation1
<UNCAUGHT ERROR>...
*/
