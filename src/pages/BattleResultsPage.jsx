import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BattleResults from '../components/BattleResults';

const BattleResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [battleResult, setBattleResult] = useState(null);

  useEffect(() => {
    // Check if battle result data was passed in location state
    if (location.state && location.state.battleResult) {
      setBattleResult(location.state.battleResult);
    } else {
      // If no data was passed, redirect back to battle page
      navigate('/battle');
    }
  }, [location, navigate]);

  const handleNewBattle = () => {
    navigate('/battle');
  };

  const handleContinueWithSamePokemon = () => {
    // Navigate back to battle page but with the same Pokémon selected
    navigate('/battle', { 
      state: { 
        pokemon1Id: battleResult.pokemon1.id,
        pokemon2Id: battleResult.pokemon2.id
      } 
    });
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Battle Results</h1>
        
        {battleResult ? (
          <BattleResults 
            battleResult={battleResult}
            onNewBattle={handleNewBattle}
            onContinueWithSamePokemon={handleContinueWithSamePokemon}
          />
        ) : (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600">Loading battle results...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleResultsPage;