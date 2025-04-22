import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBattleRequest, fetchPokemonDetails, fetchTeam } from '../services/api';
import { RefreshCw, Swords } from 'lucide-react';

const QRBattleRequest = ({ onBattleStart }) => {
  const navigate = useNavigate();
  const [team, setTeam] = useState([]);
  const [selectedPokemonId, setSelectedPokemonId] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [playerName, setPlayerName] = useState('Player 1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load team data
  useEffect(() => {
    const loadTeam = async () => {
      try {
        const teamData = await fetchTeam();
        setTeam(teamData);
        if (teamData.length > 0) {
          setSelectedPokemonId(teamData[0].id);
        }
      } catch (err) {
        setError('Failed to load team: ' + err.message);
      }
    };

    loadTeam();
  }, []);

  // Update selected Pokémon when ID changes
  useEffect(() => {
    const loadPokemonDetails = async () => {
      if (!selectedPokemonId) return;
      
      try {
        // First try to find the Pokemon in the team
        const pokemon = team.find(p => p.id === selectedPokemonId);
        if (pokemon) {
          setSelectedPokemon(pokemon);
        } else {
          // If not found, fetch it from the API
          const fetchedPokemon = await fetchPokemonDetails(selectedPokemonId);
          setSelectedPokemon(fetchedPokemon);
        }
      } catch (err) {
        setError('Failed to load Pokémon details: ' + err.message);
      }
    };

    loadPokemonDetails();
  }, [selectedPokemonId, team]);

  // Format the Pokemon name properly
  const formatName = (name) => {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Create a battle request and generate QR code
  const handleCreateBattleRequest = async () => {
    if (!selectedPokemonId) {
      setError('Please select a Pokémon first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Create a battle request with player name
      const request = await createBattleRequest(selectedPokemonId, playerName);
      
      // Create the URL for the QR code using environment variable
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const battleUrl = `${baseUrl}/battle/qr/accept/${request.id}`;
      
      // Navigate to the QR display page
      navigate('/battle/qr/display', {
        state: {
          battleRequest: request,
          qrCodeUrl: battleUrl,
          pokemon: selectedPokemon
        }
      });
    } catch (err) {
      setError('Failed to create battle request: ' + err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4">QR Code Battle Request</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm sm:text-base">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Name
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your name"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Your Pokémon
        </label>
        {team.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-2">
            {team.map(pokemon => (
              <div
                key={pokemon.id}
                onClick={() => setSelectedPokemonId(pokemon.id)}
                className={`p-2 border rounded-md cursor-pointer flex items-center ${
                  selectedPokemonId === pokemon.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <img
                  src={pokemon.sprites.front_default}
                  alt={pokemon.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 mr-2"
                />
                <div className="text-xs sm:text-sm">
                  <div className="font-medium">{formatName(pokemon.name)}</div>
                  <div className="text-xs text-gray-500">
                    HP: {pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-red-600 text-sm sm:text-base">
            No Pokémon in your team! Add some Pokémon first.
          </div>
        )}
      </div>
      
      <button
        onClick={handleCreateBattleRequest}
        disabled={isLoading || !selectedPokemonId}
        className={`w-full py-2 px-4 rounded-md flex items-center justify-center text-sm sm:text-base ${
          isLoading || !selectedPokemonId
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? (
          <>
            <RefreshCw className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Creating...
          </>
        ) : (
          <>
            <Swords className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Generate Battle QR Code
          </>
        )}
      </button>
    </div>
  );
};

export default QRBattleRequest;