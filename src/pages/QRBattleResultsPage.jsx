import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import BattleResults from "../components/BattleResults";
import { getBattleRequest, fetchPokemonDetails } from "../services/api";
import { ArrowLeft, QrCode } from "lucide-react";

const QRBattleResultsPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [battleResult, setBattleResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestorName, setRequestorName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchBattleResult = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get the battle request details
        const request = await getBattleRequest(requestId);

        if (!request) {
          throw new Error("Battle request not found");
        }

        if (request.status !== "completed" || !request.result) {
          // Battle not completed yet, will check again in interval
          setIsLoading(false);
          return;
        }

        // Battle is completed with results - clear the interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Store the player names - use the display name fields first, fall back to IDs
        setRequestorName(request.requestorName || request.requestorId);
        setOpponentName(request.opponentName || request.opponentId);

        // Set the battle result from the request
        setBattleResult(request.result);
      } catch (err) {
        console.error("Error fetching battle result:", err);
        setError(err.message || "Failed to load battle results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBattleResult();

    // Clear existing interval if any
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up interval to check for results if not completed
    intervalRef.current = setInterval(() => {
      fetchBattleResult();
    }, 5000);

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [requestId]); // Only depend on requestId, not battleResult

  const handleNewBattle = () => {
    navigate("/battle/qr");
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/battle" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">QR Battle Results</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            <p className="mt-2 text-gray-600">Loading battle results...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-red-500 mb-4">
              <p>{error}</p>
            </div>
            <button
              onClick={() => navigate("/battle/qr")}
              className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create New QR Battle
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row md:justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-lg font-medium">
                    QR Battle #{requestId}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {requestorName} vs {opponentName}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Link
                    to="/battle/qr"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                  >
                    <QrCode className="h-5 w-5 mr-2" />
                    New QR Battle
                  </Link>
                </div>
              </div>
            </div>

            <BattleResults
              battleResult={battleResult}
              onNewBattle={handleNewBattle}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QRBattleResultsPage;
