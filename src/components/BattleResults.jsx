import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Trophy } from 'lucide-react';

const BattleResults = ({ battleResult, onNewBattle, onContinueWithSamePokemon }) => {
  if (!battleResult) return null;

  // Format the Pokemon name properly
  const formatName = (name) => {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-4 sm:mb-6">
      <div className="py-2 sm:py-4">
        <div className="text-center mb-4 sm:mb-6">
          <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-500 mx-auto mb-2" />
          <h2 className="text-xl sm:text-2xl font-bold">
            {formatName(battleResult.winner)} Wins!
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Battle completed on {format(new Date(battleResult.date), 'PPP')}
          </p>
        </div>
        
        {/* Pokemon images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Pokemon 1 */}
          <div className={`p-4 rounded-lg ${battleResult.winner === battleResult.pokemon1.name ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex flex-col items-center">
              <div className="text-center mb-2">
                <h3 className="font-bold text-blue-600">{formatName(battleResult.pokemon1.name)}</h3>
                <div className="text-sm text-gray-500">
                  {battleResult.winner === battleResult.pokemon1.name ? 'WINNER' : 'DEFEATED'}
                </div>
              </div>
              <div className="relative">
                <img 
                  src={battleResult.pokemon1.sprite || (battleResult.pokemon1.sprites && battleResult.pokemon1.sprites.front_default)} 
                  alt={battleResult.pokemon1.name}
                  className="w-32 h-32 object-contain"
                />
                {battleResult.winner === battleResult.pokemon1.name && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-1">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Pokemon 2 */}
          <div className={`p-4 rounded-lg ${battleResult.winner === battleResult.pokemon2.name ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex flex-col items-center">
              <div className="text-center mb-2">
                <h3 className="font-bold text-red-600">{formatName(battleResult.pokemon2.name)}</h3>
                <div className="text-sm text-gray-500">
                  {battleResult.winner === battleResult.pokemon2.name ? 'WINNER' : 'DEFEATED'}
                </div>
              </div>
              <div className="relative">
                <img 
                  src={battleResult.pokemon2.sprite || (battleResult.pokemon2.sprites && battleResult.pokemon2.sprites.front_default)} 
                  alt={battleResult.pokemon2.name}
                  className="w-32 h-32 object-contain"
                />
                {battleResult.winner === battleResult.pokemon2.name && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-1">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Battle comparison table */}
        <div className="-mx-3 sm:mx-0 overflow-x-auto">
          <div className="min-w-[600px] px-3 sm:px-0 sm:min-w-full">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 sm:p-3 text-left font-semibold border">Stat</th>
                  <th className="p-2 sm:p-3 text-center font-semibold border text-blue-600">
                    {formatName(battleResult.pokemon1.name)}
                  </th>
                  <th className="p-2 sm:p-3 text-center font-semibold border text-red-600">
                    {formatName(battleResult.pokemon2.name)}
                  </th>
                  <th className="p-2 sm:p-3 text-center font-semibold border">Winner</th>
                </tr>
              </thead>
              <tbody>
                {battleResult.rounds.map((round, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-2 sm:p-3 border font-medium">{round.stat}</td>
                    <td className={`p-2 sm:p-3 border text-center ${round.winner === battleResult.pokemon1.name ? 'font-bold text-blue-600 bg-blue-50' : ''}`}>
                      {round.pokemon1Value}
                    </td>
                    <td className={`p-2 sm:p-3 border text-center ${round.winner === battleResult.pokemon2.name ? 'font-bold text-red-600 bg-red-50' : ''}`}>
                      {round.pokemon2Value}
                    </td>
                    <td className={`p-2 sm:p-3 border text-center ${
                      round.winner === battleResult.pokemon1.name 
                        ? 'text-blue-600 font-medium' 
                        : round.winner === battleResult.pokemon2.name 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-600'
                    }`}>
                      {round.winner === 'tie' ? 'Tie' : formatName(round.winner)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Tiebreaker info if applicable */}
        {battleResult.tiebreaker && (
          <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600">
            Tiebreaker: Winner determined by higher {battleResult.tiebreaker}
          </div>
        )}
        
        {/* Battle action buttons */}
        <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-4">
          {onNewBattle && (
            <button
              onClick={onNewBattle}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center text-xs sm:text-sm"
            >
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              New Battle with Different Pokémon
            </button>
          )}
          
          {onContinueWithSamePokemon && (
            <button
              onClick={onContinueWithSamePokemon}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center text-xs sm:text-sm"
            >
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Battle Again with Same Pokémon
            </button>
          )}

          <Link
            to="/battle"
            className="px-3 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center text-xs sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            Back to Battle Simulator
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BattleResults;