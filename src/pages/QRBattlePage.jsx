import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import QRBattleRequest from '../components/QRBattleRequest';
import QRBattleAccept from '../components/QRBattleAccept';
import BattleSimulator from '../components/BattleSimulator';
import { getBattleRequest, fetchPokemonDetails } from '../services/api';

const QRBattlePage = () => {
  const { requestId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [battleMode, setBattleMode] = useState('request'); // 'request', 'accept', or 'battle'
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);
  const [activeBattleId, setActiveBattleId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check if we're on the accept path and have a requestId
    if (location.pathname.includes('/battle/qr/accept/') && requestId) {
      // Check if the battle is already completed and redirect if needed
      const checkBattleStatus = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const request = await getBattleRequest(requestId);
          
          if (request.status === 'completed' && request.result) {
            // If battle is already completed, redirect to QR battle results
            navigate(`/battle/qr/results/${requestId}`);
            return;
          } 
          
          if (request.status === 'completed' && request.opponentPokemonId) {
            console.log('Battle already completed, loading Pokémon...');
            // If battle is completed but no result yet, load the battle
            try {
              const [reqPokemon, oppPokemon] = await Promise.all([
                fetchPokemonDetails(request.pokemonId),
                fetchPokemonDetails(request.opponentPokemonId)
              ]);
              
              console.log('Pokémon loaded successfully:', { reqPokemon, oppPokemon });
              setPokemon1(reqPokemon);
              setPokemon2(oppPokemon);
              setActiveBattleId(requestId);
              setBattleMode('battle');
            } catch (pokemonError) {
              console.error('Error loading Pokémon details:', pokemonError);
              setError('Failed to load Pokémon details. Please try again.');
              setBattleMode('accept');
            }
          } else {
            // Otherwise, show the accept page
            console.log('Battle waiting for opponent, showing accept page');
            setBattleMode('accept');
          }
        } catch (error) {
          console.error('Error checking battle status:', error);
          setError('Failed to check battle status. Please try again.');
          setBattleMode('accept');
        } finally {
          setIsLoading(false);
        }
      };
      
      checkBattleStatus();
    } else {
      setIsLoading(false);
    }
  }, [requestId, location.pathname, navigate]);

  // Handle battle start from either request or accept
  const handleBattleStart = (pokemon1, pokemon2, battleId) => {
    console.log('Starting battle with:', { pokemon1, pokemon2, battleId });
    
    // Validate that we have all the required data
    if (!pokemon1 || !pokemon2 || !battleId) {
      console.error('Missing required battle data:', { pokemon1, pokemon2, battleId });
      setError('Missing required battle data. Please try again.');
      return;
    }
    
    setPokemon1(pokemon1);
    setPokemon2(pokemon2);
    setActiveBattleId(battleId);
    setBattleMode('battle');
  };

  const handleBattleComplete = () => {
    // Navigate to QR battle results page instead of battle history
    navigate(`/battle/qr/results/${activeBattleId}`);
  };

  // Render content based on the mode
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center w-full max-w-full">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading battle...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center w-full">
          <div className="text-red-500 mb-4">
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      );
    }

    if (location.pathname.includes('/battle/qr/accept/') && requestId) {
      if (battleMode === 'battle' && pokemon1 && pokemon2) {
        return (
          <BattleSimulator
            pokemon1={pokemon1}
            pokemon2={pokemon2}
            battleRequestId={activeBattleId}
            onBattleComplete={handleBattleComplete}
          />
        );
      }
      return <QRBattleAccept onBattleStart={handleBattleStart} />;
    }
    
    return <QRBattleRequest onBattleStart={handleBattleStart} />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-4 sm:py-8 flex-grow">
        <div className="w-full max-w-3xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default QRBattlePage;