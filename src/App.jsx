import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages/HomePage';
import PokemonDetailPage from './pages/PokemonDetailPage';
import TeamPage from './pages/TeamPage';
import BattlePage from './pages/BattlePage';
import BattleResultsPage from './pages/BattleResultsPage';
import BattleHistoryPage from './pages/BattleHistoryPage';
import QRBattlePage from './pages/QRBattlePage';
import QRDisplayPage from './pages/QRDisplayPage';
import QRBattleResultsPage from './pages/QRBattleResultsPage';
import FavoritesPage from './pages/FavoritesPage';
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="/battle/results" element={<BattleResultsPage />} />
          <Route path="/battle/qr" element={<QRBattlePage />} />
          <Route path="/battle/qr/accept/:requestId" element={<QRBattlePage />} />
          <Route path="/battle/qr/display" element={<QRDisplayPage />} />
          <Route path="/battle/qr/results/:requestId" element={<QRBattleResultsPage />} />
          <Route path="/history" element={<BattleHistoryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
