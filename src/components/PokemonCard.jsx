import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Info, Trash2 } from 'lucide-react';
import { addToTeam, addToFavorites, fetchTeam, fetchFavorites, removeFromTeam, removeFromFavorites } from '../services/api';

const PokemonCard = ({ pokemon, isDetailed = false }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState(null);
  const [team, setTeam] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const teamData = await fetchTeam();
        const favoritesData = await fetchFavorites();
        setTeam(teamData);
        setFavorites(favoritesData);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
  }, []);

  const getId = () => {
    const urlParts = pokemon.url ? pokemon.url.split('/') : [];
    return pokemon.id || urlParts[urlParts.length - 2] || '';
  };

  const id = getId();

  const formatName = (name) => {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Check if Pokemon is in team or favorites using pokedexId or id
  const isInTeam = team.some(p => p.pokedexId === parseInt(id) || p.id === parseInt(id));
  const isInFavorites = favorites.some(p => p.pokedexId === parseInt(id) || p.id === parseInt(id));

  // Find the team entry ID if it exists (needed for removal)
  const teamEntryId = isInTeam ? team.find(p => p.pokedexId === parseInt(id) || p.id === parseInt(id))?.id : null;
  const favoriteEntryId = isInFavorites ? favorites.find(p => p.pokedexId === parseInt(id) || p.id === parseInt(id))?.id : null;

  const handleAddToTeam = async () => {
    try {
      setIsAdding(true);
      const detailedPokemon = isDetailed ? pokemon : await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json());
      await addToTeam(detailedPokemon);
      setMessage({ type: 'success', text: 'Added to team!' });
      setTimeout(() => setMessage(null), 3000);
      
      // Refresh team data after addition
      const updatedTeam = await fetchTeam();
      setTeam(updatedTeam);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveFromTeam = async () => {
    try {
      setIsAdding(true);
      await removeFromTeam(teamEntryId);
      setMessage({ type: 'success', text: 'Removed from team!' });
      setTimeout(() => setMessage(null), 3000);
      setTeam(team.filter(p => p.id !== teamEntryId));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddToFavorites = async () => {
    try {
      setIsAdding(true);
      const detailedPokemon = isDetailed ? pokemon : await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json());
      await addToFavorites(detailedPokemon);
      setMessage({ type: 'success', text: 'Added to favorites!' });
      setTimeout(() => setMessage(null), 3000);
      
      // Refresh favorites data after addition
      const updatedFavorites = await fetchFavorites();
      setFavorites(updatedFavorites);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveFromFavorites = async () => {
    try {
      setIsAdding(true);
      await removeFromFavorites(favoriteEntryId);
      setMessage({ type: 'success', text: 'Removed from favorites!' });
      setTimeout(() => setMessage(null), 3000);
      setFavorites(favorites.filter(p => p.id !== favoriteEntryId));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
      <div className="relative pt-4 px-4 flex justify-center">
        <img 
          src={pokemon.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`} 
          alt={pokemon.name}
          className="w-32 h-32 object-contain"
        />
      </div>
      
      {message && (
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="p-4">
        <div className="font-bold text-xl mb-1">{formatName(pokemon.name)}</div>
        <div className="text-gray-500 text-sm">#{id.toString().padStart(3, '0')}</div>
        
        {pokemon.types && (
          <div className="mt-2 flex flex-wrap gap-1">
            {pokemon.types.map(typeInfo => (
              <span 
                key={typeInfo.type.name}
                className={`px-2 py-1 rounded-full text-xs font-semibold text-white bg-${typeInfo.type.name}`}
              >
                {typeInfo.type.name}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex flex-wrap gap-2 justify-between">
          {isInTeam ? (
            <button 
              onClick={handleRemoveFromTeam}
              disabled={isAdding}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 sm:px-3 rounded-full flex items-center text-xs sm:text-sm"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Remove from Team
            </button>
          ) : (
            <button 
              onClick={handleAddToTeam}
              disabled={isAdding}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 sm:px-3 rounded-full flex items-center text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Add to Team
            </button>
          )}
          
          {isInFavorites ? (
            <button 
              onClick={handleRemoveFromFavorites}
              disabled={isAdding}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 sm:px-3 rounded-full flex items-center text-xs sm:text-sm"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Remove from Favorites
            </button>
          ) : (
            <button 
              onClick={handleAddToFavorites}
              disabled={isAdding}
              className="bg-pink-500 hover:bg-pink-600 text-white py-1 px-2 sm:px-3 rounded-full flex items-center text-xs sm:text-sm"
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Add to Favorites
            </button>
          )}
          
          <Link 
            to={`/pokemon/${id}`}
            className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-2 sm:px-3 rounded-full flex items-center text-xs sm:text-sm"
          >
            <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
