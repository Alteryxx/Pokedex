import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFavorites, removeFromFavorites } from '../services/api';

const FavoritesView = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setIsLoading(true);
        const favoritesData = await fetchFavorites();
        setFavorites(favoritesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const handleRemoveFromFavorites = async (id) => {
    try {
      await removeFromFavorites(id);
      setFavorites(favorites.filter(pokemon => pokemon.id !== id));
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
          <p className="mt-2 text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Favorite Pokémon</h1>
        <p className="text-gray-600">Your collection of favorite Pokémon</p>
      </div>

      {error && (
        <div className="my-4 p-4 bg-red-100 text-red-700 rounded-md">
          Error: {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No Favorites Yet</h2>
          <p className="text-gray-600 mb-6">
            Add Pokémon to your favorites by browsing the Pokédex
          </p>
          <Link 
            to="/"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Browse Pokémon
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(pokemon => (
            <div key={pokemon.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 flex">
                <div className="flex-shrink-0">
                  <img 
                    src={pokemon.sprites.front_default} 
                    alt={pokemon.name}
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-bold text-lg">{pokemon.name}</h3>
                  <div className="text-gray-500 text-sm mb-2">#{pokemon.pokedexId.toString().padStart(3, '0')}</div>
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
                  <div className="grid grid-cols-3 gap-1 text-xs text-gray-600">
                    <div>HP: {pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}</div>
                    <div>ATK: {pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}</div>
                    <div>SPD: {pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat}</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between">
                <button 
                  onClick={() => handleRemoveFromFavorites(pokemon.id)}
                  className="text-red-500 hover:text-red-700 flex items-center text-sm"
                >
                  Remove
                </button>
                <Link 
                  to={`/pokemon/${pokemon.pokedexId}`}
                  className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;
