import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { checkBattleRequestStatus, fetchPokemonDetails } from '../services/api';
import { Share2, ArrowLeft, Swords, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';

const QRDisplayPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const [battleRequest, setBattleRequest] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Waiting for opponent...');
  const [error, setError] = useState(null);

  // Initialize data from location state
  useEffect(() => {
    if (location.state && location.state.battleRequest && location.state.qrCodeUrl && location.state.pokemon) {
      setBattleRequest(location.state.battleRequest);

      // Ensure QR code URL uses environment variable if needed
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const requestId = location.state.battleRequest.id;
      const qrUrl = `${baseUrl}/battle/qr/accept/${requestId}`;

      setQrCodeUrl(qrUrl);
      setSelectedPokemon(location.state.pokemon);

      // Start checking for status updates
      startStatusCheck(location.state.battleRequest.id);
    } else {
      setError('No QR code data found. Please go back and create a battle request.');
    }

    // Cleanup function to clear the interval when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [location]);

  // Function to start checking for status updates
  const startStatusCheck = (requestId) => {
    setIsChecking(true);

    // Check status immediately
    checkStatus(requestId);

    // Then set interval to check every 5 seconds
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      checkStatus(requestId);
    }, 5000);
  };

  // Function to check battle request status
  const checkStatus = async (requestId) => {
    try {
      const status = await checkBattleRequestStatus(requestId);

      // Update battle request state
      setBattleRequest(status);

      // Handle status changes
      if (status.status === 'completed') {
        // Clear the interval when complete to prevent further redirects and API calls
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        setStatusMessage('Battle request accepted! Redirecting to results...');
        setIsChecking(false);
        
        // Redirect directly to the results page after a short delay
        // Use let to ensure the timeout can be cleared if component unmounts
        const redirectTimeout = setTimeout(() => {
          navigate(`/battle/qr/results/${requestId}`);
        }, 1500);
        
        // Store the timeout so it can be cleared if needed
        return () => clearTimeout(redirectTimeout);
      } else if (status.status === 'waiting') {
        setStatusMessage('Waiting for opponent...');
      }
    } catch (err) {
      console.error('Error checking battle status:', err);
      setError('Failed to check battle status: ' + err.message);
      setIsChecking(false);
      
      // Clear the interval on error to prevent further API calls
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  // Copy battle link to clipboard
  const handleCopyBattleLink = () => {
    navigator.clipboard.writeText(qrCodeUrl)
      .then(() => {
        alert('Battle link copied to clipboard!');
      })
      .catch(err => {
        setError('Failed to copy link: ' + err.message);
      });
  };

  // Format the Pokemon name properly
  const formatName = (name) => {
    if (!name) return '';
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Link to="/battle/qr" className="text-blue-500 hover:underline flex items-center w-fit mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to QR Battle
        </Link>

        <h1 className="text-2xl font-bold mb-6">Your Battle QR Code</h1>

        {error ? (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        ) : !battleRequest ? (
          <div className="bg-white rounded-lg shadow-md p-6 flex justify-center">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mb-4" />
              <p>Loading QR code...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Battle Request</h2>
                <p className="text-gray-600 mb-4">
                  Share this QR code with your opponent to start a battle!
                </p>

                <div className="bg-white p-4 inline-block border border-gray-300 rounded-md mb-4">
                  <QRCodeSVG
                    value={qrCodeUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                    imageSettings={selectedPokemon?.sprites?.front_default ? {
                      src: selectedPokemon.sprites.front_default,
                      height: 40,
                      width: 40,
                      excavate: true,
                    } : undefined}
                  />
                </div>

                <div className="flex justify-center mb-4">
                  <button
                    onClick={handleCopyBattleLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Battle Link
                  </button>
                </div>

                <div className={`text-sm py-2 px-3 rounded-full ${
                  battleRequest.status === 'waiting' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : battleRequest.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isChecking ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      {statusMessage}
                    </div>
                  ) : (
                    statusMessage
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Your Pokémon</h2>

              {selectedPokemon ? (
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <img
                    src={selectedPokemon.sprites.front_default}
                    alt={selectedPokemon.name}
                    className="w-32 h-32 object-contain"
                  />

                  <h3 className="text-lg font-bold mt-2">{formatName(selectedPokemon.name)}</h3>

                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {selectedPokemon.types.map(typeInfo => (
                      <span 
                        key={typeInfo.type.name}
                        className={`px-3 py-1 rounded-full text-sm font-semibold text-white bg-${typeInfo.type.name}`}
                      >
                        {typeInfo.type.name.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-8 mt-4 w-full">
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-500">
                        {selectedPokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}
                      </div>
                      <div className="text-sm text-gray-600">HP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-500">
                        {selectedPokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}
                      </div>
                      <div className="text-sm text-gray-600">ATTACK</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-500">
                        {selectedPokemon.stats.find(stat => stat.stat.name === 'speed').base_stat}
                      </div>
                      <div className="text-sm text-gray-600">SPEED</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  No Pokémon data available
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Battle Info</h3>
                <div className="text-sm grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Player Name:</div>
                  <div>{battleRequest.requestorId}</div>

                  <div className="text-gray-600">Created:</div>
                  <div>{new Date(battleRequest.created).toLocaleString()}</div>

                  <div className="text-gray-600">Status:</div>
                  <div className="capitalize">{battleRequest.status}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRDisplayPage;