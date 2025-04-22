import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  fetchPokemonList, 
  searchPokemon, 
  fetchPokemonColors, 
  fetchPokemonHabitats, 
  fetchPokemonShapes,
  fetchPokemonTypes,
  fetchPokemonByColor,
  fetchPokemonByHabitat,
  fetchPokemonByShape,
  fetchPokemonByType
} from '../services/api';
import PokemonCard from './PokemonCard';
import Pagination from './Pagination';

const PokemonList = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchResults, setSearchResults] = useState(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [colorOptions, setColorOptions] = useState([]);
  const [habitatOptions, setHabitatOptions] = useState([]);
  const [shapeOptions, setShapeOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedHabitat, setSelectedHabitat] = useState('');
  const [selectedShape, setSelectedShape] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [activeFilter, setActiveFilter] = useState(null); // 'color', 'habitat', 'shape', 'type', or null
  const [filteredResults, setFilteredResults] = useState(null);
  
  const ITEMS_PER_PAGE = 20;

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Load filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [colors, habitats, shapes, types] = await Promise.all([
          fetchPokemonColors(),
          fetchPokemonHabitats(),
          fetchPokemonShapes(),
          fetchPokemonTypes()
        ]);
        
        setColorOptions(colors);
        setHabitatOptions(habitats);
        setShapeOptions(shapes);
        setTypeOptions(types);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    
    loadFilterOptions();
  }, []);

  // Apply URL filters on component mount
  useEffect(() => {
    const applyUrlParams = async () => {
      const params = Object.fromEntries(searchParams.entries());
      
      // Apply search query from URL
      if (params.search) {
        try {
          setIsLoading(true);
          const results = await searchPokemon(params.search);
          setSearchResults(results);
          setTotalPages(Math.ceil(results.length / ITEMS_PER_PAGE));
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      
      // Apply filters from URL
      if (params.color) {
        handleColorFilter(params.color);
      } else if (params.habitat) {
        handleHabitatFilter(params.habitat);
      } else if (params.shape) {
        handleShapeFilter(params.shape);
      } else if (params.type) {
        handleTypeFilter(params.type);
      }
      
      // Set current page from URL
      if (params.page) {
        setCurrentPage(Number(params.page));
      }
    };
    
    applyUrlParams();
  }, []); // Run only once on component mount

  // Load Pokemon list on initial render and when page changes
  useEffect(() => {
    const loadPokemonList = async () => {
      try {
        setIsLoading(true);
        // If we have filtered results, paginate those
        if (filteredResults) {
          const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
          const paginatedResults = filteredResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
          setPokemonList(paginatedResults);
        }
        // If we have search results, paginate those
        else if (searchResults) {
          const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
          const paginatedResults = searchResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
          setPokemonList(paginatedResults);
        } 
        // Otherwise fetch from the API
        else {
          const offset = (currentPage - 1) * ITEMS_PER_PAGE;
          const data = await fetchPokemonList(ITEMS_PER_PAGE, offset);
          setPokemonList(data.results);
          setTotalPages(Math.ceil(data.count / ITEMS_PER_PAGE));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPokemonList();
  }, [currentPage, searchResults, filteredResults]);

  // Sync search and filter values with URL
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedColor) params.color = selectedColor;
    if (selectedHabitat) params.habitat = selectedHabitat;
    if (selectedShape) params.shape = selectedShape;
    if (selectedType) params.type = selectedType;
    params.page = currentPage;
    setSearchParams(params);
  }, [searchQuery, selectedColor, selectedHabitat, selectedShape, selectedType, currentPage]);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    if (params.search) setSearchQuery(params.search);
    if (params.color) setSelectedColor(params.color);
    if (params.habitat) setSelectedHabitat(params.habitat);
    if (params.shape) setSelectedShape(params.shape);
    if (params.type) setSelectedType(params.type);
    if (params.page) setCurrentPage(Number(params.page));
  }, [searchParams]);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setFilteredResults(null);
      setSelectedColor('');
      setSelectedHabitat('');
      setSelectedShape('');
      setSelectedType('');
      setActiveFilter(null);
      setCurrentPage(1);
      return;
    }
    
    try {
      setIsLoading(true);
      const results = await searchPokemon(searchQuery);
      setSearchResults(results);
      setFilteredResults(null);
      setSelectedColor('');
      setSelectedHabitat('');
      setSelectedShape('');
      setSelectedType('');
      setActiveFilter(null);
      setTotalPages(Math.ceil(results.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear search and filters
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setFilteredResults(null);
    setSelectedColor('');
    setSelectedHabitat('');
    setSelectedShape('');
    setActiveFilter(null);
    setCurrentPage(1);
  };
  
  // Apply color filter
  const handleColorFilter = async (color) => {
    if (!color) {
      setFilteredResults(null);
      setActiveFilter(null);
      setCurrentPage(1);
      return;
    }
    
    try {
      setIsLoading(true);
      setSelectedColor(color);
      setSelectedHabitat('');
      setSelectedShape('');
      setSelectedType('');
      setActiveFilter('color');
      
      const speciesList = await fetchPokemonByColor(color);
      // Need to convert species to actual pokemon
      const pokemonPromises = speciesList.map(async (species) => {
        const pokemonId = species.url.split('/').filter(Boolean).pop();
        return {
          name: species.name,
          url: `https://pokeapi.co/api/v2/pokemon/${pokemonId}/`
        };
      });
      
      const results = await Promise.all(pokemonPromises);
      setFilteredResults(results);
      setTotalPages(Math.ceil(results.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply habitat filter
  const handleHabitatFilter = async (habitat) => {
    if (!habitat) {
      setFilteredResults(null);
      setActiveFilter(null);
      setCurrentPage(1);
      return;
    }
    
    try {
      setIsLoading(true);
      setSelectedColor('');
      setSelectedHabitat(habitat);
      setSelectedShape('');
      setSelectedType('');
      setActiveFilter('habitat');
      
      const speciesList = await fetchPokemonByHabitat(habitat);
      // Need to convert species to actual pokemon
      const pokemonPromises = speciesList.map(async (species) => {
        const pokemonId = species.url.split('/').filter(Boolean).pop();
        return {
          name: species.name,
          url: `https://pokeapi.co/api/v2/pokemon/${pokemonId}/`
        };
      });
      
      const results = await Promise.all(pokemonPromises);
      setFilteredResults(results);
      setTotalPages(Math.ceil(results.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply shape filter
  const handleShapeFilter = async (shape) => {
    if (!shape) {
      setFilteredResults(null);
      setActiveFilter(null);
      setCurrentPage(1);
      return;
    }
    
    try {
      setIsLoading(true);
      setSelectedColor('');
      setSelectedHabitat('');
      setSelectedShape(shape);
      setSelectedType('');
      setActiveFilter('shape');
      
      const speciesList = await fetchPokemonByShape(shape);
      // Need to convert species to actual pokemon
      const pokemonPromises = speciesList.map(async (species) => {
        const pokemonId = species.url.split('/').filter(Boolean).pop();
        return {
          name: species.name,
          url: `https://pokeapi.co/api/v2/pokemon/${pokemonId}/`
        };
      });
      
      const results = await Promise.all(pokemonPromises);
      setFilteredResults(results);
      setTotalPages(Math.ceil(results.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply type filter
  const handleTypeFilter = async (type) => {
    if (!type) {
      setFilteredResults(null);
      setActiveFilter(null);
      setCurrentPage(1);
      return;
    }
    
    try {
      setIsLoading(true);
      setSelectedColor('');
      setSelectedHabitat('');
      setSelectedShape('');
      setSelectedType(type);
      setActiveFilter('type');
      
      const pokemonList = await fetchPokemonByType(type);
      // The type endpoint already returns pokemon objects with slightly different structure
      const results = pokemonList.map(item => ({
        name: item.pokemon.name,
        url: item.pokemon.url
      }));
      
      setFilteredResults(results);
      setTotalPages(Math.ceil(results.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search and Filter bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mb-4 sm:mb-0">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
                placeholder="Search Pokémon by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full sm:w-auto"
              >
                Search
              </button>
              {(searchResults || filteredResults) && (
                <button 
                  type="button" 
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 w-full sm:w-auto"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
          
          {/* Filter toggle button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${showFilters ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {(selectedColor || selectedHabitat || selectedShape || selectedType) && (
              <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                {[selectedColor, selectedHabitat, selectedShape, selectedType].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
        
        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="text-lg font-medium mb-3">Filter Pokémon</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Color filter */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">By Color</label>
                <select
                  value={selectedColor}
                  onChange={(e) => handleColorFilter(e.target.value)}
                  className={`block w-full p-2 border rounded-lg ${activeFilter === 'color' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <option value="">All Colors</option>
                  {colorOptions.map(color => (
                    <option key={color.name} value={color.name}>
                      {color.name.charAt(0).toUpperCase() + color.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Habitat filter */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">By Habitat</label>
                <select
                  value={selectedHabitat}
                  onChange={(e) => handleHabitatFilter(e.target.value)}
                  className={`block w-full p-2 border rounded-lg ${activeFilter === 'habitat' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <option value="">All Habitats</option>
                  {habitatOptions.map(habitat => (
                    <option key={habitat.name} value={habitat.name}>
                      {habitat.name.charAt(0).toUpperCase() + habitat.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Shape filter */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">By Shape</label>
                <select
                  value={selectedShape}
                  onChange={(e) => handleShapeFilter(e.target.value)}
                  className={`block w-full p-2 border rounded-lg ${activeFilter === 'shape' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <option value="">All Shapes</option>
                  {shapeOptions.map(shape => (
                    <option key={shape.name} value={shape.name}>
                      {shape.name.charAt(0).toUpperCase() + shape.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type filter */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">By Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => handleTypeFilter(e.target.value)}
                  className={`block w-full p-2 border rounded-lg ${activeFilter === 'type' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <option value="">All Types</option>
                  {typeOptions.map(type => (
                    <option key={type.name} value={type.name}>
                      {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Active filter info */}
            {activeFilter && (
              <div className="mt-4 p-2 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-800">
                <div className="font-medium">Active Filter:</div>
                {selectedColor && <div>Color: {selectedColor}</div>}
                {selectedHabitat && <div>Habitat: {selectedHabitat}</div>}
                {selectedShape && <div>Shape: {selectedShape}</div>}
                {selectedType && <div>Type: {selectedType}</div>}
                {filteredResults && <div>Found {filteredResults.length} Pokémon</div>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status messages */}
      {error && (
        <div className="my-4 p-4 bg-red-100 text-red-700 rounded-md">
          Error: {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600">Loading Pokémon...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Search result info */}
          {searchResults && (
            <div className="mb-4 text-gray-600">
              Found {searchResults.length} Pokémon matching "{searchQuery}"
            </div>
          )}
          
          {/* Pokemon grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {pokemonList.length > 0 ? (
              pokemonList.map((pokemon) => (
                <PokemonCard key={pokemon.name} pokemon={pokemon} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                No Pokémon found.
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default PokemonList;