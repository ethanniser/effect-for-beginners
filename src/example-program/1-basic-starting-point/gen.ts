import { Effect, pipe } from "effect";
import * as Schema from "@effect/schema/Schema";

const pokemonSchema = Schema.struct({
  name: Schema.string,
  weight: Schema.number,
});

type Pokemon = Schema.To<typeof pokemonSchema>;
const parsePokemon = Schema.parseEither(pokemonSchema);

// const getPokemon = (id: number) =>
//   pipe(
//     Effect.tryPromise(() =>
//       fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json())
//     ),
//     Effect.flatMap(parsePokemon)
//   );

const getPokemon = (id: number) =>
  Effect.gen(function* (_) {
    const response = yield* _(
      Effect.tryPromise(() =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
          res.json()
        )
      )
    );
    return yield* _(parsePokemon(response));
  });

const formatPokemon = (pokemon: Pokemon) =>
  `${pokemon.name} weighs ${pokemon.weight} hectograms`;

const getRandomNumberArray = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 100) + 1);

const calculateHeaviestPokemon = (pokemons: Pokemon[]) =>
  Effect.reduce(pokemons, 0, (highest, pokemon) =>
    pokemon.weight === highest
      ? Effect.fail(new Error("two pokemon have the same weight!"))
      : Effect.succeed(pokemon.weight > highest ? pokemon.weight : highest)
  );

// const program = pipe(
//   Effect.all(getRandomNumberArray(10).map(getPokemon)),
//   Effect.tap((pokemons) =>
//     Effect.sync(() => console.log(pokemons.map(formatPokemon).join("\n"), "\n"))
//   ),
//   Effect.flatMap(calculateHeaviestPokemon),
//   Effect.map((heaviest) =>
//     console.log(`The heaviest pokemon weighs ${heaviest} hectograms!`)
//   )
// );

const program = Effect.gen(function* (_) {
  const pokemons = yield* _(
    Effect.all(getRandomNumberArray(10).map(getPokemon))
  );
  console.log(pokemons.map(formatPokemon).join("\n"), "\n");
  const heaviest = yield* _(calculateHeaviestPokemon(pokemons));
  console.log(`The heaviest pokemon weighs ${heaviest} hectograms!`);
});

Effect.runPromise(program);
