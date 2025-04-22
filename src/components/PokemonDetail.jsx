import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPokemonDetails, fetchPokemonSpecies, addToTeam, addToFavorites, fetchTeam, fetchFavorites, removeFromTeam, removeFromFavorites } from '../services/api';
import { ArrowLeft, Heart, Plus, BarChart2, Trash2 } from 'lucide-react';

const PokemonDetail = () => {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [message, setMessage] = useState(null);
  const [team, setTeam] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadPokemonDetails = async () => {
      try {
        setIsLoading(true);
        const [pokemonData, speciesData, teamData, favoritesData] = await Promise.all([
          fetchPokemonDetails(id),
          fetchPokemonSpecies(id),
          fetchTeam(),
          fetchFavorites()
        ]);
        setPokemon(pokemonData);
        setSpecies(speciesData);
        setTeam(teamData);
        setFavorites(favoritesData);
      } catch (err) {
        setError(`Failed to load Pokémon details: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadPokemonDetails();
  }, [id]);

  // Format the Pokemon name properly
  const formatName = (name) => {
    return name ? name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';
  };

  // Check if Pokemon is in team or favorites
  const isInTeam = team.some(p => p.pokedexId === parseInt(id));
  const isInFavorites = favorites.some(p => p.pokedexId === parseInt(id));

  // Find the team entry ID if it exists (needed for removal)
  const teamEntryId = isInTeam ? team.find(p => p.pokedexId === parseInt(id))?.id : null;
  const favoriteEntryId = isInFavorites ? favorites.find(p => p.pokedexId === parseInt(id))?.id : null;

  // Handle adding to team
  const handleAddToTeam = async () => {
    try {
      await addToTeam(pokemon);
      setMessage({ type: 'success', text: `${formatName(pokemon.name)} added to your team!` });
      setTimeout(() => setMessage(null), 3000);
      
      // Refresh team data after addition
      const updatedTeam = await fetchTeam();
      setTeam(updatedTeam);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Handle removing from team
  const handleRemoveFromTeam = async () => {
    try {
      await removeFromTeam(teamEntryId);
      setMessage({ type: 'success', text: `${formatName(pokemon.name)} removed from your team!` });
      setTimeout(() => setMessage(null), 3000);
      setTeam(team.filter(p => p.id !== teamEntryId));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Handle adding to favorites
  const handleAddToFavorites = async () => {
    try {
      await addToFavorites(pokemon);
      setMessage({ type: 'success', text: `${formatName(pokemon.name)} added to your favorites!` });
      setTimeout(() => setMessage(null), 3000);
      
      // Refresh favorites data after addition
      const updatedFavorites = await fetchFavorites();
      setFavorites(updatedFavorites);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Handle removing from favorites
  const handleRemoveFromFavorites = async () => {
    try {
      await removeFromFavorites(favoriteEntryId);
      setMessage({ type: 'success', text: `${formatName(pokemon.name)} removed from your favorites!` });
      setTimeout(() => setMessage(null), 3000);
      setFavorites(favorites.filter(p => p.id !== favoriteEntryId));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Get the english flavor text from species data
  const getFlavorText = () => {
    if (!species) return '';
    const englishEntry = species.flavor_text_entries.find(entry => entry.language.name === 'en');
    return englishEntry ? englishEntry.flavor_text.replace(/\\f|\\n/g, ' ') : '';
  };

  // Get stat percentage for visualization (max stat is assumed to be 255)
  const getStatPercentage = (statValue) => {
    return Math.min(100, (statValue / 255) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading Pokémon details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
          <Link to="/" className="text-blue-500 hover:underline mt-2 inline-block">
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Back to Pokémon list
          </Link>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      {/* Back button and Pokémon name */}
      <div className="mb-4 sm:mb-6">
        <Link to="/" className="text-blue-500 hover:underline flex items-center w-fit">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span className="text-sm sm:text-base">Back to Pokémon list</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2">{formatName(pokemon.name)}</h1>
        <div className="text-gray-500 text-sm sm:text-base">#{pokemon.id.toString().padStart(3, '0')}</div>
      </div>

      {/* Notification */}
      {message && (
        <div className={`mb-4 p-2 sm:p-3 rounded text-sm sm:text-base ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column - Image and basic info */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            {/* Pokemon image */}
            <div className="flex justify-center">
              <img 
                src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
                alt={pokemon.name}
                className="w-full max-w-[250px] sm:max-w-[300px] h-auto"
              />
            </div>
            
            {/* Types */}
            <div className="mt-3 sm:mt-4 flex justify-center gap-2">
              {pokemon.types.map(typeInfo => (
                <span 
                  key={typeInfo.type.name}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-white bg-${typeInfo.type.name}`}
                >
                  {typeInfo.type.name.toUpperCase()}
                </span>
              ))}
            </div>
            
            {/* Basic Info */}
            <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500">Height</h3>
                <p>{(pokemon.height / 10).toFixed(1)} m</p>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500">Weight</h3>
                <p>{(pokemon.weight / 10).toFixed(1)} kg</p>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500">Base Experience</h3>
                <p>{pokemon.base_experience}</p>
              </div>
              {species && (
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-500">Habitat</h3>
                  <p>{species.habitat ? formatName(species.habitat.name) : 'Unknown'}</p>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {isInTeam ? (
                <button 
                  onClick={handleRemoveFromTeam}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 sm:px-4 rounded-full flex justify-center items-center text-xs sm:text-sm"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Remove from Team
                </button>
              ) : (
                <button 
                  onClick={handleAddToTeam}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 sm:px-4 rounded-full flex justify-center items-center text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Add to Team
                </button>
              )}
              
              {isInFavorites ? (
                <button 
                  onClick={handleRemoveFromFavorites}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 sm:px-4 rounded-full flex justify-center items-center text-xs sm:text-sm"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Remove from Favorites
                </button>
              ) : (
                <button 
                  onClick={handleAddToFavorites}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 px-3 sm:px-4 rounded-full flex justify-center items-center text-xs sm:text-sm"
                >
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Favorite
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Tabs with detailed info */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            {/* Flavor text */}
            {species && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg italic text-xs sm:text-sm text-gray-700">
                {getFlavorText()}
              </div>
            )}
            
            {/* Tabs */}
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex space-x-4 sm:space-x-8 whitespace-nowrap">
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                    activeTab === 'stats'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Stats
                </button>
                
                <button
                  onClick={() => setActiveTab('abilities')}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                    activeTab === 'abilities'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Abilities
                </button>
                
                <button
                  onClick={() => setActiveTab('moves')}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                    activeTab === 'moves'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Moves
                </button>
              </nav>
            </div>
            
            {/* Tab content */}
            <div className="py-4 sm:py-6">
              {activeTab === 'stats' && (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                    <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> Base Stats
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    {pokemon.stats.map(stat => (
                      <div key={stat.stat.name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            {stat.stat.name.toUpperCase().replace('-', ' ')}
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">{stat.base_stat}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2.5">
                          <div 
                            className="bg-blue-600 h-1.5 sm:h-2.5 rounded-full" 
                            style={{ width: `${getStatPercentage(stat.base_stat)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total stats */}
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-bold text-xs sm:text-sm text-gray-700">TOTAL</span>
                      <span className="font-bold text-xs sm:text-sm text-gray-700">
                        {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'abilities' && (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Abilities</h2>
                  <ul className="space-y-3 sm:space-y-4">
                    {pokemon.abilities.map(ability => (
                      <li key={ability.ability.name} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="font-medium text-xs sm:text-sm">{formatName(ability.ability.name)}</div>
                        {ability.is_hidden && (
                          <span className="text-xs sm:text-sm text-purple-600 font-medium">Hidden Ability</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {activeTab === 'moves' && (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Moves</h2>
                  {pokemon.moves.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pokemon.moves.slice(0, 30).map(move => (
                        <div key={move.move.name} className="p-2 bg-gray-50 rounded text-xs sm:text-sm">
                          {formatName(move.move.name)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm">No moves found.</p>
                  )}
                  {pokemon.moves.length > 30 && (
                    <div className="mt-3 sm:mt-4 text-center text-gray-500 text-xs sm:text-sm">
                      Showing 30 of {pokemon.moves.length} moves
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;