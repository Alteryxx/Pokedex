import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Info, Swords } from 'lucide-react';
import { fetchTeam, removeFromTeam } from '../services/api';

const TeamView = () => {
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load team data
  useEffect(() => {
    const loadTeam = async () => {
      try {
        setIsLoading(true);
        const teamData = await fetchTeam();
        setTeam(teamData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeam();
  }, []);

  // Format the Pokemon name properly
  const formatName = (name) => {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Remove a Pokémon from the team
  const handleRemoveFromTeam = async (id) => {
    try {
      await removeFromTeam(id);
      setTeam(team.filter(pokemon => pokemon.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading your team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Pokémon Team</h1>
        <p className="text-gray-600">You can have up to 6 Pokémon in your team</p>
      </div>

      {error && (
        <div className="my-4 p-4 bg-red-100 text-red-700 rounded-md">
          Error: {error}
        </div>
      )}

      {team.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Your team is empty!</h2>
          <p className="text-gray-600 mb-6">
            Add Pokémon to your team by browsing the Pokédex
          </p>
          <Link 
            to="/"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Browse Pokémon
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map(pokemon => (
              <div key={pokemon.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 flex">
                  {/* Pokemon image */}
                  <div className="flex-shrink-0">
                    <img 
                      src={pokemon.sprites.front_default} 
                      alt={pokemon.name}
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  
                  {/* Pokemon info */}
                  <div className="ml-4 flex-1">
                    <h3 className="font-bold text-lg">{formatName(pokemon.name)}</h3>
                    <div className="text-gray-500 text-sm mb-2">#{pokemon.pokedexId.toString().padStart(3, '0')}</div>
                    
                    {/* Type badges */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {pokemon.types.map(typeInfo => (
                        <span 
                          key={typeInfo.type.name}
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white bg-${typeInfo.type.name}`}
                        >
                          {typeInfo.type.name}
                        </span>
                      ))}
                    </div>
                    
                    {/* Main stats */}
                    <div className="grid grid-cols-3 gap-1 text-xs text-gray-600">
                      <div>HP: {pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}</div>
                      <div>ATK: {pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}</div>
                      <div>SPD: {pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat}</div>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between">
                  <button 
                    onClick={() => handleRemoveFromTeam(pokemon.id)}
                    className="text-red-500 hover:text-red-700 flex items-center text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                  
                  <div className="flex space-x-4">
                    <Link 
                      to={`/battle?pokemon=${pokemon.pokedexId}`}
                      className="text-orange-500 hover:text-orange-700 flex items-center text-sm"
                    >
                      <Swords className="w-4 h-4 mr-1" />
                      Battle
                    </Link>
                    
                    <Link 
                      to={`/pokemon/${pokemon.pokedexId}`}
                      className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                    >
                      <Info className="w-4 h-4 mr-1" />
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Battle button, only enable if at least 2 Pokémon in team */}
          <div className="mt-8 flex justify-center">
            <Link 
              to="/battle"
              className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                team.length >= 2 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Swords className="w-5 h-5 mr-2" />
              Battle with Your Team
            </Link>
          </div>

          {/* Notice if less than 2 Pokémon */}
          {team.length < 2 && (
            <div className="mt-4 text-center text-gray-600">
              Add at least one more Pokémon to your team to battle
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeamView;
