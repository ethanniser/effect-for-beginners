import { Effect, Logger, LoggerLevel, pipe } from "effect";

const program = Effect.log("Application started");

Effect.runSync(program);

// multiple levels

const logLevels = pipe(
  Effect.log("info by default"),
  Effect.flatMap(() => Effect.logDebug("debug")),
  Effect.flatMap(() => Effect.logInfo("info")),
  Effect.flatMap(() => Effect.logWarning("warning")),
  Effect.flatMap(() => Effect.logError("error")),
  Effect.flatMap(() => Effect.logFatal("fatal"))
);

Effect.runSync(logLevels);

// set minimum log level

const logDebug = pipe(
  Effect.logDebug("debug"),
  Logger.withMinimumLogLevel(LoggerLevel.Debug)
);

Effect.runSync(logDebug);

{
  // type: Effect<never, never, void>
  const program = pipe(
    Effect.sleep("1 seconds"),
    Effect.flatMap(() => Effect.log("The job is finished!")),
    Effect.withLogSpan("myspan")
  );

  Effect.runPromise(program);
}
