import { Effect, pipe } from "effect";
import * as Schema from "@effect/schema/Schema";

const pokemonSchema = Schema.struct({
  name: Schema.string,
  weight: Schema.number,
});

type Pokemon = Schema.To<typeof pokemonSchema>;
const parsePokemon = Schema.parseEither(pokemonSchema);

const getPokemon = (id: number) =>
  pipe(
    Effect.tryPromise({
      try: () =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
          res.json()
        ),
      catch: () => new Error("error fetching pokemon"),
    }),
    Effect.flatMap((x) => parsePokemon(x))
  );

const formatPokemon = (pokemon: Pokemon) =>
  `${pokemon.name} weighs ${pokemon.weight} hectograms`;

const getRandomNumberArray = Effect.all(
  Array.from({ length: 10 }, () =>
    Effect.sync(() => Math.floor(Math.random() * 100) + 1)
  )
);

const calculateHeaviestPokemon = (pokemons: Pokemon[]) =>
  Effect.reduce(pokemons, 0, (highest, pokemon) =>
    pokemon.weight === highest
      ? Effect.fail(new Error("two pokemon have the same weight!"))
      : Effect.succeed(pokemon.weight > highest ? pokemon.weight : highest)
  );

const program = pipe(
  getRandomNumberArray,
  Effect.flatMap((arr) => Effect.all(arr.map(getPokemon))),
  Effect.tap((pokemons) =>
    Effect.log("\n" + pokemons.map(formatPokemon).join("\n"))
  ),
  Effect.flatMap((pokemons) => calculateHeaviestPokemon(pokemons)),
  Effect.flatMap((heaviest) =>
    Effect.log(`The heaviest pokemon weighs ${heaviest} hectograms!`)
  )
);

Effect.runPromise(program);
