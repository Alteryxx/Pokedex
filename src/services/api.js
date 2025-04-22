import axios from "axios";

// PokéAPI base URL
const pokeApiBaseUrl = "https://pokeapi.co/api/v2";

// json-server base URL
const jsonServerBaseUrl =
  import.meta.env.VITE_JSON_SERVER_URL || "http://localhost:3001";

// Generate a unique user ID and store it in local storage if not already present
const getUserId = () => {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("userId", userId);
  }
  return userId;
};

const userId = getUserId();

// PokéAPI endpoints
export const fetchPokemonList = async (limit = 20, offset = 0) => {
  const response = await axios.get(`${pokeApiBaseUrl}/pokemon`, {
    params: { limit, offset },
  });
  return response.data;
};

// New filter-related API endpoints
export const fetchPokemonColors = async () => {
  const response = await axios.get(`${pokeApiBaseUrl}/pokemon-color`);
  return response.data.results;
};

export const fetchPokemonHabitats = async () => {
  const response = await axios.get(`${pokeApiBaseUrl}/pokemon-habitat`);
  return response.data.results;
};

export const fetchPokemonShapes = async () => {
  const response = await axios.get(`${pokeApiBaseUrl}/pokemon-shape`);
  return response.data.results;
};

export const fetchPokemonTypes = async () => {
  const response = await axios.get(`${pokeApiBaseUrl}/type`);
  return response.data.results;
};

export const fetchPokemonByColor = async (color) => {
  const response = await axios.get(`${pokeApiBaseUrl}/pokemon-color/${color}`);
  return response.data.pokemon_species;
};

export const fetchPokemonByHabitat = async (habitat) => {
  const response = await axios.get(
    `${pokeApiBaseUrl}/pokemon-habitat/${habitat}`
  );
  return response.data.pokemon_species;
};

export const fetchPokemonByShape = async (shape) => {
  const response = await axios.get(`${pokeApiBaseUrl}/pokemon-shape/${shape}`);
  return response.data.pokemon_species;
};

export const fetchPokemonByType = async (type) => {
  const response = await axios.get(`${pokeApiBaseUrl}/type/${type}`);
  return response.data.pokemon;
};

export const fetchPokemonDetails = async (nameOrId) => {
  const response = await axios.get(`${pokeApiBaseUrl}/pokemon/${nameOrId}`);
  return response.data;
};

export const fetchPokemonSpecies = async (nameOrId) => {
  const response = await axios.get(
    `${pokeApiBaseUrl}/pokemon-species/${nameOrId}`
  );
  return response.data;
};

export const searchPokemon = async (query) => {
  try {
    const response = await axios.get(
      `${pokeApiBaseUrl}/pokemon/${query.toLowerCase()}`
    );
    return [response.data];
  } catch (error) {
    // If direct search fails, fetch a list and filter manually
    const list = await fetchPokemonList(100, 0);
    return list.results.filter((pokemon) =>
      pokemon.name.includes(query.toLowerCase())
    );
  }
};

// json-server endpoints (Team, Favorites, Battle History)
export const fetchTeam = async () => {
  const response = await axios.get(`${jsonServerBaseUrl}/team`, {
    params: { userId },
  });
  return response.data;
};

export const addToTeam = async (pokemon) => {
  const team = await fetchTeam();

  if (team.length >= 6) {
    throw new Error("Team is full! Maximum 6 Pokémon allowed.");
  }

  if (team.some((p) => p.pokedexId === pokemon.id)) {
    throw new Error("This Pokémon is already in your team!");
  }

  const teamEntry = {
    ...pokemon,
    id: `team-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Generate unique ID
    pokedexId: pokemon.id,
    userId,
  };

  const response = await axios.post(`${jsonServerBaseUrl}/team`, teamEntry);
  return response.data;
};

export const removeFromTeam = async (entryId) => {
  await axios.delete(`${jsonServerBaseUrl}/team/${entryId}`);
  return true;
};

export const fetchFavorites = async () => {
  const response = await axios.get(`${jsonServerBaseUrl}/favorites`, {
    params: { userId },
  });
  return response.data;
};

export const addToFavorites = async (pokemon) => {
  const favorites = await fetchFavorites();
  if (favorites.some((p) => p.pokedexId === pokemon.id)) {
    throw new Error("This Pokémon is already in your favorites!");
  }

  const favoriteEntry = {
    ...pokemon,
    id: `fav-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    pokedexId: pokemon.id,
    userId,
  };

  const response = await axios.post(
    `${jsonServerBaseUrl}/favorites`,
    favoriteEntry
  );
  return response.data;
};

export const removeFromFavorites = async (entryId) => {
  await axios.delete(`${jsonServerBaseUrl}/favorites/${entryId}`);
  return true;
};

export const fetchBattleHistory = async () => {
  const response = await axios.get(`${jsonServerBaseUrl}/battleHistory`, {
    params: { userId },
  });
  return response.data;
};

export const recordBattle = async (battleData) => {
  const response = await axios.post(`${jsonServerBaseUrl}/battleHistory`, {
    ...battleData,
    date: new Date().toISOString(),
    userId,
  });
  return response.data;
};

export const simulateBattle = (pokemon1, pokemon2) => {
  const battleResults = {
    rounds: [],
    winner: null,
    date: new Date().toISOString(),
    pokemon1: {
      id: pokemon1.id,
      name: pokemon1.name,
      sprite: pokemon1.sprites.front_default,
    },
    pokemon2: {
      id: pokemon2.id,
      name: pokemon2.name,
      sprite: pokemon2.sprites.front_default,
    },
  };

  // Round 1: HP
  const hpRound = {
    stat: "HP",
    pokemon1Value: pokemon1.stats.find((stat) => stat.stat.name === "hp")
      .base_stat,
    pokemon2Value: pokemon2.stats.find((stat) => stat.stat.name === "hp")
      .base_stat,
    winner: null,
  };
  hpRound.winner =
    hpRound.pokemon1Value > hpRound.pokemon2Value
      ? pokemon1.name
      : hpRound.pokemon1Value < hpRound.pokemon2Value
      ? pokemon2.name
      : "tie";
  battleResults.rounds.push(hpRound);

  // Round 2: Attack
  const attackRound = {
    stat: "Attack",
    pokemon1Value: pokemon1.stats.find((stat) => stat.stat.name === "attack")
      .base_stat,
    pokemon2Value: pokemon2.stats.find((stat) => stat.stat.name === "attack")
      .base_stat,
    winner: null,
  };
  attackRound.winner =
    attackRound.pokemon1Value > attackRound.pokemon2Value
      ? pokemon1.name
      : attackRound.pokemon1Value < attackRound.pokemon2Value
      ? pokemon2.name
      : "tie";
  battleResults.rounds.push(attackRound);

  // Round 3: Speed
  const speedRound = {
    stat: "Speed",
    pokemon1Value: pokemon1.stats.find((stat) => stat.stat.name === "speed")
      .base_stat,
    pokemon2Value: pokemon2.stats.find((stat) => stat.stat.name === "speed")
      .base_stat,
    winner: null,
  };
  speedRound.winner =
    speedRound.pokemon1Value > speedRound.pokemon2Value
      ? pokemon1.name
      : speedRound.pokemon1Value < speedRound.pokemon2Value
      ? pokemon2.name
      : "tie";
  battleResults.rounds.push(speedRound);

  // Count wins for each Pokémon
  const pokemon1Wins = battleResults.rounds.filter(
    (round) => round.winner === pokemon1.name
  ).length;
  const pokemon2Wins = battleResults.rounds.filter(
    (round) => round.winner === pokemon2.name
  ).length;

  // Determine overall winner (best of 3)
  if (pokemon1Wins > pokemon2Wins) {
    battleResults.winner = pokemon1.name;
  } else if (pokemon2Wins > pokemon1Wins) {
    battleResults.winner = pokemon2.name;
  } else {
    // In case of tie, winner is determined by higher total stats
    const pokemon1TotalStats = pokemon1.stats.reduce(
      (sum, stat) => sum + stat.base_stat,
      0
    );
    const pokemon2TotalStats = pokemon2.stats.reduce(
      (sum, stat) => sum + stat.base_stat,
      0
    );
    battleResults.winner =
      pokemon1TotalStats > pokemon2TotalStats ? pokemon1.name : pokemon2.name;
    battleResults.tiebreaker = "total stats";
  }

  return battleResults;
};

// QR Battle functionality
export const createBattleRequest = async (pokemonId, playerName) => {
  // Check if the Pokemon is from the team (has a pokedexId)
  const team = await fetchTeam();
  const teamPokemon = team.find((p) => p.id === pokemonId);

  // If it's a team Pokemon, use its pokedexId for the battle
  const actualPokemonId = teamPokemon ? teamPokemon.pokedexId : pokemonId;

  const battleRequest = {
    id: Date.now().toString(),
    requestorId: userId,
    requestorName: playerName || "Player 1",
    pokemonId: actualPokemonId,
    teamEntryId: teamPokemon ? teamPokemon.id : null,
    status: "waiting",
    created: new Date().toISOString(),
    opponentId: null,
    opponentName: null,
    opponentPokemonId: null,
  };

  const response = await axios.post(
    `${jsonServerBaseUrl}/battleRequests`,
    battleRequest
  );
  return response.data;
};

export const getBattleRequest = async (battleRequestId) => {
  try {
    const response = await axios.get(
      `${jsonServerBaseUrl}/battleRequests/${battleRequestId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get battle request:", error);
    throw new Error("Battle request not found");
  }
};

export const acceptBattleRequest = async (
  battleRequestId,
  opponentName,
  opponentPokemonId
) => {
  try {
    const battleRequest = await getBattleRequest(battleRequestId);

    const team = await fetchTeam();
    const teamPokemon = team.find((p) => p.id === opponentPokemonId);

    const actualOpponentPokemonId = teamPokemon
      ? teamPokemon.pokedexId
      : opponentPokemonId;

    const [pokemon1, pokemon2] = await Promise.all([
      fetchPokemonDetails(battleRequest.pokemonId),
      fetchPokemonDetails(actualOpponentPokemonId),
    ]);

    const battleResult = simulateBattle(pokemon1, pokemon2);

    const updatedRequest = {
      ...battleRequest,
      status: "completed",
      opponentId: userId,
      opponentName: opponentName || "Player 2",
      opponentPokemonId: actualOpponentPokemonId,
      opponentTeamEntryId: teamPokemon ? teamPokemon.id : null,
      result: battleResult,
    };

    const response = await axios.put(
      `${jsonServerBaseUrl}/battleRequests/${battleRequestId}`,
      updatedRequest
    );

    // Also record the battle in history with additional QR battle information
    const battleHistoryEntry = {
      ...battleResult,
      type: "qr",
      battleRequestId: battleRequestId,
      player1Id: battleRequest.requestorId,
      player1Name: battleRequest.requestorName,
      player2Id: userId,
      player2Name: opponentName || "Player 2",
    };

    // Add pokedexId to the battle history
    if (pokemon1.id) {
      battleHistoryEntry.pokemon1.pokedexId = pokemon1.id;
    }
    if (pokemon2.id) {
      battleHistoryEntry.pokemon2.pokedexId = pokemon2.id;
    }

    // Save battle history for the current user (player 2/opponent)
    await recordBattle(battleHistoryEntry);

    // Also save the battle for player 1 (requestor)
    await axios.post(`${jsonServerBaseUrl}/battleHistory`, {
      ...battleHistoryEntry,
      date: new Date().toISOString(),
      userId: battleRequest.requestorId,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to accept battle request:", error);
    throw new Error("Could not accept battle request");
  }
};

export const checkBattleRequestStatus = async (battleRequestId) => {
  try {
    const battleRequest = await getBattleRequest(battleRequestId);
    return battleRequest;
  } catch (error) {
    console.error("Failed to check battle request status:", error);
    throw new Error("Could not check battle request status");
  }
};

export const completeBattleRequest = async (battleRequestId, result) => {
  try {
    const battleRequest = await getBattleRequest(battleRequestId);

    const updatedRequest = {
      ...battleRequest,
      status: "completed",
      result,
    };

    const response = await axios.put(
      `${jsonServerBaseUrl}/battleRequests/${battleRequestId}`,
      updatedRequest
    );

    const battleHistoryEntry = {
      ...result,
      type: "qr",
      battleRequestId: battleRequestId,
      player1Id: battleRequest.requestorId,
      player1Name: battleRequest.requestorName,
      player2Id: battleRequest.opponentId,
      player2Name: battleRequest.opponentName,
    };

    if (result.pokemon1 && result.pokemon1.id) {
      battleHistoryEntry.pokemon1.pokedexId = result.pokemon1.id;
    }

    if (result.pokemon2 && result.pokemon2.id) {
      battleHistoryEntry.pokemon2.pokedexId = result.pokemon2.id;
    }

    const isRequestor = battleRequest.requestorId === userId;

    if (isRequestor) {
      await recordBattle(battleHistoryEntry);

      if (battleRequest.opponentId) {
        await axios.post(`${jsonServerBaseUrl}/battleHistory`, {
          ...battleHistoryEntry,
          date: new Date().toISOString(),
          userId: battleRequest.opponentId,
        });
      }
    } else {
      await recordBattle(battleHistoryEntry);

      await axios.post(`${jsonServerBaseUrl}/battleHistory`, {
        ...battleHistoryEntry,
        date: new Date().toISOString(),
        userId: battleRequest.requestorId,
      });
    }

    return response.data;
  } catch (error) {
    console.error("Failed to complete battle request:", error);
    throw new Error("Could not complete battle request");
  }
};
