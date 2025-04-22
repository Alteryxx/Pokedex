import React from 'react';
import PokemonList from '../components/PokemonList';
import Navbar from '../components/Navbar';

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <PokemonList />
    </div>
  );
};

export default HomePage;