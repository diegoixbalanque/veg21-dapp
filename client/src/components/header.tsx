import { Wallet, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";

export function Header() {
  const { isConnected, isConnecting, connectWallet, disconnectWallet, formattedAddress } = useWallet();

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      try {
        await connectWallet();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-veg-primary to-veg-secondary rounded-xl flex items-center justify-center">
              <Leaf className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-veg-dark">VEG21</h1>
              <p className="text-xs text-gray-600">Astar Network</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isConnected && (
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-veg-primary rounded-full animate-pulse"></div>
                <span className="text-sm text-veg-secondary font-medium">Astar Network</span>
              </div>
            )}
            
            {isConnected ? (
              <div className="bg-gray-100 px-4 py-2 rounded-xl">
                <span className="text-sm text-gray-600">{formattedAddress}</span>
              </div>
            ) : (
              <Button 
                onClick={handleWalletClick}
                disabled={isConnecting}
                className="bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Wallet className="mr-2 h-4 w-4" />
                {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
