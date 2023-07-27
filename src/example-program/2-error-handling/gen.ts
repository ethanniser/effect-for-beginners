import { Effect, pipe } from "effect";
import * as Schema from "@effect/schema/Schema";

const pokemonSchema = Schema.struct({
  name: Schema.string,
  weight: Schema.number,
});

type Pokemon = Schema.To<typeof pokemonSchema>;
const parsePokemon = Schema.parseEither(pokemonSchema);

class FetchError {
  readonly _tag = "FetchError";
}

class JSONError {
  readonly _tag = "JSONError";
}

class SameWeightError {
  readonly _tag = "SameWeightError";
  constructor(readonly weight: number) {}
}

const getPokemon = (id: number) =>
  Effect.gen(function* (_) {
    const response = yield* _(
      Effect.tryPromise({
        try: () => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
        catch: () => new FetchError(),
      })
    );
    const json = yield* _(
      Effect.tryPromise({
        try: () => response.json(),
        catch: () => new JSONError(),
      })
    );
    return yield* _(parsePokemon(json));
  }).pipe(
    Effect.catchAll(() => Effect.succeed({ name: "default", weight: 0 }))
  );

const formatPokemon = (pokemon: Pokemon) =>
  `${pokemon.name} weighs ${pokemon.weight} hectograms`;

const getRandomNumberArray = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 100) + 1);

const calculateHeaviestPokemon = (pokemons: Pokemon[]) =>
  Effect.reduce(pokemons, 0, (highest, pokemon) =>
    pokemon.weight === highest
      ? Effect.fail(new SameWeightError(pokemon.weight))
      : Effect.succeed(pokemon.weight > highest ? pokemon.weight : highest)
  );

const program = Effect.gen(function* (_) {
  const pokemons = yield* _(
    Effect.all(getRandomNumberArray(10).map(getPokemon))
  );
  console.log(pokemons.map(formatPokemon).join("\n"), "\n");
  const heaviest = yield* _(calculateHeaviestPokemon(pokemons));
  console.log(`The heaviest pokemon weighs ${heaviest} hectograms!`);
}).pipe(
  Effect.catchTag("SameWeightError", (e) =>
    Effect.sync(() =>
      console.log(`Two pokemon have the same weight: ${e.weight}`)
    )
  )
);

Effect.runPromise(program);
