import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBattleHistory } from '../services/api';
import { format } from 'date-fns';
import { ArrowLeft, CalendarDays, Trophy } from 'lucide-react';
import Navbar from '../components/Navbar';

const BattleHistoryPage = () => {
  const [battleHistory, setBattleHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBattleHistory = async () => {
      try {
        setIsLoading(true);
        const history = await fetchBattleHistory();
        // Sort by date, newest first
        const sortedHistory = history.sort((a, b) => new Date(b.date) - new Date(a.date));
        setBattleHistory(sortedHistory);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadBattleHistory();
  }, []);

  // Format the Pokemon name properly
  const formatName = (name) => {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-2 text-gray-600">Loading battle history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Battle History</h1>
          <p className="text-gray-600 text-sm sm:text-base">View the results of your past Pokémon battles</p>
        </div>

        {error && (
          <div className="my-3 sm:my-4 p-3 sm:p-4 bg-red-100 text-red-700 rounded-md text-sm">
            Error: {error}
          </div>
        )}

        {battleHistory.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 text-center">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">No Battle History Yet</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Start battling with your Pokémon to record your battle history
            </p>
            <Link 
              to="/battle"
              className="px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
            >
              Go to Battle
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {battleHistory.map((battle, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Battle header */}
                <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mr-1 sm:mr-2" />
                      <h3 className="font-bold text-sm sm:text-base">
                        {formatName(battle.winner)} Won the Battle
                      </h3>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">
                      <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {format(new Date(battle.date), 'PPP p')}
                    </div>
                  </div>
                </div>
                
                {/* Battle content */}
                <div className="p-3 sm:p-4">
                  <div className="flex flex-col md:flex-row items-center justify-around mb-4 sm:mb-6">
                    {/* Pokémon 1 */}
                    <div className="flex flex-col items-center mb-3 md:mb-0">
                      <div className={`text-xs sm:text-sm font-medium mb-1 ${battle.winner === battle.pokemon1.name ? 'text-green-600' : 'text-gray-500'}`}>
                        {battle.winner === battle.pokemon1.name ? 'WINNER' : 'DEFEATED'}
                      </div>
                      <div className="relative">
                        <img 
                          src={battle.pokemon1.sprite} 
                          alt={battle.pokemon1.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                        />
                        {battle.winner === battle.pokemon1.name && (
                          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-1">
                            <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                        )}
                      </div>
                      <div className="font-bold mt-1 text-sm sm:text-base">{formatName(battle.pokemon1.name)}</div>
                      <Link 
                        to={`/pokemon/${battle.pokemon1.pokedexId || battle.pokemon1.id}`}
                        className="text-xs text-blue-500 hover:underline mt-0.5 sm:mt-1"
                      >
                        View Details
                      </Link>
                    </div>
                    
                    {/* VS */}
                    <div className="text-xl sm:text-2xl font-bold text-gray-400 my-1 sm:my-2 md:my-0">VS</div>
                    
                    {/* Pokémon 2 */}
                    <div className="flex flex-col items-center">
                      <div className={`text-xs sm:text-sm font-medium mb-1 ${battle.winner === battle.pokemon2.name ? 'text-green-600' : 'text-gray-500'}`}>
                        {battle.winner === battle.pokemon2.name ? 'WINNER' : 'DEFEATED'}
                      </div>
                      <div className="relative">
                        <img 
                          src={battle.pokemon2.sprite} 
                          alt={battle.pokemon2.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                        />
                        {battle.winner === battle.pokemon2.name && (
                          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-1">
                            <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                        )}
                      </div>
                      <div className="font-bold mt-1 text-sm sm:text-base">{formatName(battle.pokemon2.name)}</div>
                      <Link 
                        to={`/pokemon/${battle.pokemon2.pokedexId || battle.pokemon2.id}`}
                        className="text-xs text-blue-500 hover:underline mt-0.5 sm:mt-1"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                  
                  {/* Battle stats - make table scrollable */}
                  <div className="-mx-3 sm:mx-0 overflow-x-auto">
                    <div className="min-w-[600px] px-3 sm:px-0 sm:min-w-full">
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-gray-100 text-gray-700">
                              <th className="p-1.5 sm:p-2 text-left border-b">Stat</th>
                              <th className="p-1.5 sm:p-2 text-center border-b">{formatName(battle.pokemon1.name)}</th>
                              <th className="p-1.5 sm:p-2 text-center border-b">{formatName(battle.pokemon2.name)}</th>
                              <th className="p-1.5 sm:p-2 text-center border-b">Winner</th>
                            </tr>
                          </thead>
                          <tbody>
                            {battle.rounds.map((round, roundIndex) => (
                              <tr key={roundIndex} className={roundIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="p-1.5 sm:p-2 border-b">{round.stat}</td>
                                <td className={`p-1.5 sm:p-2 text-center border-b ${round.winner === battle.pokemon1.name ? 'font-medium text-blue-600' : ''}`}>
                                  {round.pokemon1Value}
                                </td>
                                <td className={`p-1.5 sm:p-2 text-center border-b ${round.winner === battle.pokemon2.name ? 'font-medium text-red-600' : ''}`}>
                                  {round.pokemon2Value}
                                </td>
                                <td className="p-1.5 sm:p-2 text-center border-b">
                                  {round.winner === 'tie' ? 'Tie' : formatName(round.winner)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tiebreaker info if applicable */}
                  {battle.tiebreaker && (
                    <div className="mt-2 text-center text-xs text-gray-500">
                      Tiebreaker: Winner determined by higher {battle.tiebreaker}
                    </div>
                  )}
                </div>
                
                {/* Battle footer */}
                <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200 flex justify-center">
                  <Link 
                    to="/battle"
                    className="text-orange-500 hover:text-orange-700 font-medium text-xs sm:text-sm flex items-center"
                  >
                    <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Start a New Battle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleHistoryPage;
