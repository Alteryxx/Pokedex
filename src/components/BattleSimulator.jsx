import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { fetchTeam, fetchPokemonDetails, simulateBattle, recordBattle, completeBattleRequest } from '../services/api';
import { ArrowLeft, Swords, Trophy, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';

const BattleSimulator = ({ pokemon1: propPokemon1, pokemon2: propPokemon2, battleRequestId, onBattleComplete }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const preselectedPokemonId = searchParams.get('pokemon');
  
  const [team, setTeam] = useState([]);
  const [selectedPokemon1, setSelectedPokemon1] = useState(null);
  const [selectedPokemon2, setSelectedPokemon2] = useState(null);
  const [isLoading, setIsLoading] = useState(!propPokemon1 || !propPokemon2);
  const [isBattling, setIsBattling] = useState(false);
  const [error, setError] = useState(null);
  const [showRules, setShowRules] = useState(false);

  // Handle QR battle mode (when props are provided)
  const isQRBattle = Boolean(propPokemon1 && propPokemon2 && battleRequestId);

  // Use provided Pokémon for QR battles, or load team for regular battles
  useEffect(() => {
    if (isQRBattle) {
      // Using provided Pokémon for QR battles
      setSelectedPokemon1(propPokemon1);
      setSelectedPokemon2(propPokemon2);
      setIsLoading(false);
    } else {
      // Load team for regular battles
      const loadTeam = async () => {
        try {
          setIsLoading(true);
          const teamData = await fetchTeam();
          setTeam(teamData);
          
          // If there's a preselected Pokémon ID in the URL, set it as the first selection
          if (preselectedPokemonId) {
            const preselectedPokemon = teamData.find(p => p.pokedexId === parseInt(preselectedPokemonId) || p.id === preselectedPokemonId);
            if (preselectedPokemon) {
              setSelectedPokemon1(preselectedPokemon);
            }
          }
          
          // Check if we have pokemon IDs from the location state (coming back from results page)
          if (location.state) {
            const { pokemon1Id, pokemon2Id } = location.state;
            if (pokemon1Id && pokemon2Id) {
              const pokemon1 = teamData.find(p => p.id === pokemon1Id);
              const pokemon2 = teamData.find(p => p.id === pokemon2Id);
              
              if (pokemon1) setSelectedPokemon1(pokemon1);
              if (pokemon2) setSelectedPokemon2(pokemon2);
            }
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      loadTeam();
    }
  }, [preselectedPokemonId, location.state, propPokemon1, propPokemon2, isQRBattle]);

  // Format the Pokemon name properly
  const formatName = (name) => {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Handle pokemon selection (only for regular battles)
  const handlePokemonSelect = (pokemon, selectionNumber) => {
    if (isQRBattle) return; // Disable selection in QR battle mode
    
    if (selectionNumber === 1) {
      setSelectedPokemon1(pokemon);
      // If the same Pokémon was selected as the second one, deselect it
      if (selectedPokemon2 && selectedPokemon2.id === pokemon.id) {
        setSelectedPokemon2(null);
      }
    } else {
      setSelectedPokemon2(pokemon);
      // If the same Pokémon was selected as the first one, deselect it
      if (selectedPokemon1 && selectedPokemon1.id === pokemon.id) {
        setSelectedPokemon1(null);
      }
    }
  };

  // Start the battle
  const handleStartBattle = async () => {
    if (!selectedPokemon1 || !selectedPokemon2) {
      setError('Please select two Pokémon to battle!');
      return;
    }
    
    try {
      setIsBattling(true);
      setError(null);
      
      // Simulate battle and get results
      const result = simulateBattle(selectedPokemon1, selectedPokemon2);
      
      // Add a short delay for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isQRBattle) {
        // For QR battles, complete the battle request with the result
        await completeBattleRequest(battleRequestId, result);
        
        // Call the onBattleComplete callback if provided
        if (onBattleComplete) {
          onBattleComplete();
        } else {
          // Fallback navigation if callback not provided
          navigate(`/battle/qr/results/${battleRequestId}`);
        }
      } else {
        // For regular battles, just record the battle
        await recordBattle(result);
        
        // Navigate to the regular battle results page
        navigate('/battle/results', { state: { battleResult: result } });
      }
    } catch (err) {
      console.error("Battle Error:", err);
      setError(err.message);
      setIsBattling(false);
    }
  };

  // Reset battle selections (only for regular battles)
  const handleResetBattle = () => {
    if (isQRBattle) return; // Disable reset in QR battle mode
    
    setSelectedPokemon1(null);
    setSelectedPokemon2(null);
    setError(null);
  };

  // Determine CSS classes for a Pokémon card based on selection state
  const getPokemonCardClasses = (pokemon) => {
    let baseClasses = "relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ";
    
    if (selectedPokemon1 && pokemon.id === selectedPokemon1.id) {
      return baseClasses + "ring-2 ring-blue-500 transform scale-105";
    }
    
    if (selectedPokemon2 && pokemon.id === selectedPokemon2.id) {
      return baseClasses + "ring-2 ring-red-500 transform scale-105";
    }
    
    return baseClasses + (isQRBattle ? "" : "cursor-pointer hover:shadow-lg");
  };

  // Render the QR Battle component
  const renderQRBattle = () => {
    // Make sure we have both Pokémon before rendering
    if (!selectedPokemon1 || !selectedPokemon2) {
      return (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">Loading Pokémon data...</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">QR Battle</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* First Pokemon */}
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-1 sm:mb-2 text-sm sm:text-base">Player 1's Pokémon</h3>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <img
                src={selectedPokemon1.sprites.front_default}
                alt={selectedPokemon1.name}
                className="w-16 h-16 mx-auto sm:mx-0 sm:mr-3 mb-2 sm:mb-0"
              />
              <div className="text-center sm:text-left">
                <p className="font-medium text-sm sm:text-base">{formatName(selectedPokemon1.name)}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-1 mt-1">
                  {selectedPokemon1.types.map(typeInfo => (
                    <span 
                      key={typeInfo.type.name}
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white bg-${typeInfo.type.name}`}
                    >
                      {typeInfo.type.name.toUpperCase()}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-1 text-xs">
                  <div>HP: {selectedPokemon1.stats.find(stat => stat.stat.name === 'hp').base_stat}</div>
                  <div>ATK: {selectedPokemon1.stats.find(stat => stat.stat.name === 'attack').base_stat}</div>
                  <div>SPD: {selectedPokemon1.stats.find(stat => stat.stat.name === 'speed').base_stat}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Second Pokemon */}
          <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-medium text-red-800 mb-1 sm:mb-2 text-sm sm:text-base">Player 2's Pokémon</h3>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <img
                src={selectedPokemon2.sprites.front_default}
                alt={selectedPokemon2.name}
                className="w-16 h-16 mx-auto sm:mx-0 sm:mr-3 mb-2 sm:mb-0"
              />
              <div className="text-center sm:text-left">
                <p className="font-medium text-sm sm:text-base">{formatName(selectedPokemon2.name)}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-1 mt-1">
                  {selectedPokemon2.types.map(typeInfo => (
                    <span 
                      key={typeInfo.type.name}
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white bg-${typeInfo.type.name}`}
                    >
                      {typeInfo.type.name.toUpperCase()}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-1 text-xs">
                  <div>HP: {selectedPokemon2.stats.find(stat => stat.stat.name === 'hp').base_stat}</div>
                  <div>ATK: {selectedPokemon2.stats.find(stat => stat.stat.name === 'attack').base_stat}</div>
                  <div>SPD: {selectedPokemon2.stats.find(stat => stat.stat.name === 'speed').base_stat}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Battle button */}
        <div className="flex justify-center mt-4 sm:mt-6">
          <button
            onClick={handleStartBattle}
            disabled={isBattling}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base ${
              isBattling
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isBattling ? (
              <>
                <span className="inline-block h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mr-2" />
                Battle in Progress...
              </>
            ) : (
              <>
                <Swords className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Start Battle!
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">Loading battle data...</p>
        </div>
      </div>
    );
  }

  // For QR Battles, render a simpler UI
  if (isQRBattle) {
    return renderQRBattle();
  }

  // Regular battle UI
  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      {/* Header and back button */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <Link to="/team" className="text-blue-500 hover:underline flex items-center w-fit">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-sm sm:text-base">Back to Team</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold mt-2">Pokémon Battle Simulator</h1>
        </div>
        
        <button
          onClick={() => setShowRules(!showRules)}
          className="flex items-center text-gray-600 hover:text-gray-800 text-sm sm:text-base mt-2 sm:mt-0"
        >
          <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
          {showRules ? 'Hide Rules' : 'How it Works'}
        </button>
      </div>

      {/* Rules explanation */}
      {showRules && (
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <h2 className="font-bold text-base sm:text-lg mb-2">Battle Rules</h2>
          <p className="mb-2 text-sm sm:text-base">The battle is decided based on three core stats:</p>
          <ol className="list-decimal list-inside mb-3 sm:mb-4 pl-2 sm:pl-4 text-sm sm:text-base">
            <li>HP (Health Points)</li>
            <li>Attack</li>
            <li>Speed</li>
          </ol>
          <p className="mb-2 text-sm sm:text-base">Each stat comparison is like a "round", and the Pokémon who wins 2 out of 3 rounds is the overall winner.</p>
          <p className="text-sm sm:text-base">If there's a tie in the number of rounds won, the Pokémon with higher total stats wins.</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="my-3 sm:my-4 p-3 sm:p-4 bg-red-100 text-red-700 rounded-md text-sm sm:text-base">
          Error: {error}
        </div>
      )}

      {/* Not enough Pokémon message */}
      {team.length < 2 ? (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 text-center">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">You need at least 2 Pokémon to battle!</h2>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            Add more Pokémon to your team by browsing the Pokédex
          </p>
          <Link 
            to="/"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
          >
            Browse Pokémon
          </Link>
        </div>
      ) : (
        <>
          {/* Battle in progress indicator */}
          {isBattling && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                <Swords className="h-12 w-12 sm:h-16 sm:w-16 text-orange-500 animate-pulse mb-3 sm:mb-4" />
                <h2 className="text-lg sm:text-xl font-bold mb-2">Battle in Progress</h2>
                <p className="text-gray-600 text-sm sm:text-base">Calculating the outcome...</p>
              </div>
            </div>
          )}

          {/* Pokemon selection area */}
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-0">Select Pokémon to Battle</h2>
              
              {/* Battle/Reset buttons */}
              <div className="flex flex-wrap gap-2 sm:space-x-3">
                {(selectedPokemon1 && selectedPokemon2) ? (
                  <button
                    onClick={handleStartBattle}
                    disabled={isBattling}
                    className={`px-3 sm:px-4 py-2 rounded-lg flex items-center text-xs sm:text-sm ${
                      isBattling
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    <Swords className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    Start Battle
                  </button>
                ) : null}
                
                {(selectedPokemon1 || selectedPokemon2) && (
                  <button
                    onClick={handleResetBattle}
                    className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs sm:text-sm"
                  >
                    Reset Selection
                  </button>
                )}
              </div>
            </div>
            
            {/* Team Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {team.map(pokemon => (
                <div 
                  key={pokemon.id} 
                  className={getPokemonCardClasses(pokemon)}
                  onClick={() => {
                    if (!selectedPokemon1 || (selectedPokemon2 && selectedPokemon2.id === pokemon.id)) {
                      handlePokemonSelect(pokemon, 1);
                    } else if (!selectedPokemon2 || (selectedPokemon1 && selectedPokemon1.id === pokemon.id)) {
                      handlePokemonSelect(pokemon, 2);
                    }
                  }}
                >
                  {/* Selection indicator */}
                  {selectedPokemon1 && pokemon.id === selectedPokemon1.id && (
                    <div className="absolute top-0 left-0 m-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full">
                      Pokémon 1
                    </div>
                  )}
                  {selectedPokemon2 && pokemon.id === selectedPokemon2.id && (
                    <div className="absolute top-0 left-0 m-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full">
                      Pokémon 2
                    </div>
                  )}
                
                  <div className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      {/* Pokemon image */}
                      <div className="flex-shrink-0 text-center sm:text-left">
                        <img 
                          src={pokemon.sprites.front_default} 
                          alt={pokemon.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto sm:mx-0"
                        />
                      </div>
                      
                      {/* Pokemon info */}
                      <div className="mt-2 sm:mt-0 sm:ml-3 text-center sm:text-left">
                        <h3 className="font-bold text-sm sm:text-base">{formatName(pokemon.name)}</h3>
                        <div className="text-gray-500 text-xs mb-1">#{pokemon.pokedexId.toString().padStart(3, '0')}</div>
                        
                        {/* Type badges */}
                        <div className="flex flex-wrap justify-center sm:justify-start gap-1 mb-1">
                          {pokemon.types.map(typeInfo => (
                            <span 
                              key={typeInfo.type.name}
                              className={`px-1.5 py-0.5 rounded-full text-xs font-semibold text-white bg-${typeInfo.type.name}`}
                            >
                              {typeInfo.type.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="mt-2 grid grid-cols-3 gap-1 text-xs sm:text-sm border-t pt-2">
                      <div className="text-center">
                        <div className="font-bold text-red-500">
                          {pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}
                        </div>
                        <div className="text-xs text-gray-600">HP</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-orange-500">
                          {pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}
                        </div>
                        <div className="text-xs text-gray-600">ATK</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-500">
                          {pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat}
                        </div>
                        <div className="text-xs text-gray-600">SPD</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BattleSimulator;
