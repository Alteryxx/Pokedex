import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBattleRequest, acceptBattleRequest, fetchPokemonDetails, fetchTeam } from '../services/api';
import { RefreshCw, Swords, AlertCircle } from 'lucide-react';

const QRBattleAccept = ({ onBattleStart }) => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState([]);
  const [battleRequest, setBattleRequest] = useState(null);
  const [requestorPokemon, setRequestorPokemon] = useState(null);
  const [selectedPokemonId, setSelectedPokemonId] = useState(null);
  const [playerName, setPlayerName] = useState('Player 2');
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState(null);

  // Load battle request and requester's Pokémon
  useEffect(() => {
    const loadBattleRequest = async () => {
      if (!requestId) {
        setError('No battle request ID provided');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Load the battle request
        const request = await getBattleRequest(requestId);
        setBattleRequest(request);
        
        // Check if the battle is already completed - handled by parent component now
        // We don't early return here anymore, allowing the component to render properly
        
        // Load the requester's Pokémon
        const pokemon = await fetchPokemonDetails(request.pokemonId);
        setRequestorPokemon(pokemon);
        
        // Load the user's team
        const teamData = await fetchTeam();
        setTeam(teamData);
        if (teamData.length > 0) {
          // Use the unique ID of the team entry
          setSelectedPokemonId(teamData[0].id);
        }
      } catch (err) {
        setError('Failed to load battle request: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBattleRequest();
  }, [requestId]);

  // Format the Pokemon name properly
  const formatName = (name) => {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Accept the battle request
  const handleAcceptBattle = async () => {
    if (!selectedPokemonId) {
      setError('Please select a Pokémon first');
      return;
    }
    
    try {
      setIsAccepting(true);
      setError(null);
      
      // Check the current status of the battle request before accepting
      const currentRequest = await getBattleRequest(requestId);
      
      if (currentRequest.status === 'completed') {
        // If already completed, redirect to results
        navigate(`/battle/qr/results/${requestId}`);
        return;
      }
      
      // Accept the battle request
      const updatedRequest = await acceptBattleRequest(requestId, playerName, selectedPokemonId);
      
      // Redirect directly to results page
      navigate(`/battle/qr/results/${requestId}`);
    } catch (err) {
      setError('Failed to accept battle request: ' + err.message);
      setIsAccepting(false);
    }
  };

  // Go back to battle page
  const handleGoBack = () => {
    navigate('/battle');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="mt-2 text-gray-600">Loading battle request...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="text-center mb-4">
          <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-2" />
          <h2 className="text-lg sm:text-xl font-bold text-red-600">Error</h2>
          <p className="text-sm sm:text-base text-gray-600">{error}</p>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleGoBack}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
          >
            Go Back to Battle Page
          </button>
        </div>
      </div>
    );
  }

  if (!battleRequest || !requestorPokemon) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
        <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-500 mx-auto mb-2" />
        <h2 className="text-lg sm:text-xl font-bold">Battle Request Not Found</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4">The battle request you're looking for doesn't exist or has expired.</p>
        
        <button
          onClick={handleGoBack}
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
        >
          Go Back to Battle Page
        </button>
      </div>
    );
  }

  // Show message for completed battles but still allow actions
  const renderStatusMessage = () => {
    if (battleRequest.status === 'completed') {
      return (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-md">
          <p className="text-green-800 text-sm sm:text-base">
            This battle has already been completed. You can view the results.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4">Accept Battle Request</h2>
      
      {renderStatusMessage()}
      
      <div className="mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">Battle Request from {battleRequest.requestorName || battleRequest.requestorId}</h3>
        <div className="flex flex-col sm:flex-row sm:items-center">
          <img
            src={requestorPokemon.sprites.front_default}
            alt={requestorPokemon.name}
            className="w-16 h-16 mx-auto sm:mx-0 sm:mr-3 mb-2 sm:mb-0"
          />
          <div className="text-center sm:text-left">
            <p className="font-medium text-sm sm:text-base">{formatName(requestorPokemon.name)}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-1 mt-1">
              {requestorPokemon.types.map(typeInfo => (
                <span 
                  key={typeInfo.type.name}
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white bg-${typeInfo.type.name}`}
                >
                  {typeInfo.type.name.toUpperCase()}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-1 text-xs sm:text-sm">
              <div>HP: {requestorPokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}</div>
              <div>ATK: {requestorPokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}</div>
              <div>SPD: {requestorPokemon.stats.find(stat => stat.stat.name === 'speed').base_stat}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Name
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Enter your name"
          disabled={isAccepting}
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Your Pokémon
        </label>
        {team.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2">
            {team.map(pokemon => (
              <div
                key={pokemon.id}
                onClick={() => !isAccepting && setSelectedPokemonId(pokemon.id)}
                className={`p-2 border rounded-md flex items-center ${
                  isAccepting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                } ${
                  selectedPokemonId === pokemon.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <img
                  src={pokemon.sprites.front_default}
                  alt={pokemon.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 mr-2"
                />
                <span className="text-xs sm:text-sm">{formatName(pokemon.name)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-yellow-300 bg-yellow-50 rounded-md p-3 sm:p-4 text-center">
            <p className="text-yellow-800 mb-2 text-sm sm:text-base">You don't have any Pokémon in your team!</p>
            <button
              onClick={() => navigate('/team')}
              className="text-xs sm:text-sm py-1 px-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Go to Team Page
            </button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
        <button
          onClick={handleGoBack}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none order-2 sm:order-1"
          disabled={isAccepting}
        >
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 inline-block mr-1" />
          Go Back
        </button>

        <button
          onClick={handleAcceptBattle}
          disabled={!selectedPokemonId || isAccepting || team.length === 0}
          className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white focus:outline-none order-1 sm:order-2 ${
            !selectedPokemonId || isAccepting || team.length === 0
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isAccepting ? (
            <>
              <span className="inline-block h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mr-1" />
              Processing...
            </>
          ) : (
            <>
              <Swords className="h-3 w-3 sm:h-4 sm:w-4 inline-block mr-1" />
              {battleRequest.status === 'completed' ? 'View Results' : 'Accept Battle'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QRBattleAccept;