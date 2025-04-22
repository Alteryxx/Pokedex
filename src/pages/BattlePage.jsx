import React from 'react';
import { Link } from 'react-router-dom';
import BattleSimulator from '../components/BattleSimulator';
import Navbar from '../components/Navbar';
import { QrCode } from 'lucide-react';

const BattlePage = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4">
        
        {/* QR Battle Link */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mt-4 mb-6 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-left">QR Code Battle</h2>
              <p className="text-sm opacity-90 text-left">Battle with friends by scanning a QR code!</p>
            </div>
            <Link 
              to="/battle/qr" 
              className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 flex items-center font-medium"
            >
              <QrCode className="h-5 w-5 mr-2" />
              Start QR Battle
            </Link>
          </div>
        </div>
        
        <BattleSimulator />
      </div>
    </div>
  );
};

export default BattlePage;