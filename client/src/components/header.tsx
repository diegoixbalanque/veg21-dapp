import { Wallet, Leaf, AlertCircle, RefreshCw, ExternalLink, Coins, Trophy, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatTokenAmount } from "@/lib/mockWeb3";
import { Link, useLocation } from "wouter";

export function Header() {
  const { isConnected, isConnecting, connectWallet, disconnectWallet, formattedAddress, error, retryConnection, clearError, mockWeb3 } = useWallet();
  const [location] = useLocation();

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      try {
        await connectWallet();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        // Error is already handled in useWallet hook with toast
      }
    }
  };
  
  const handleRetryClick = async () => {
    await retryConnection();
  };

  return (
    <div>
      <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <div className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-veg-primary to-veg-secondary rounded-xl flex items-center justify-center">
                    <Leaf className="text-white text-lg" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-veg-dark">VEG21</h1>
                    <p className="text-xs text-gray-600">Astar Network</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/">
                <Button
                  variant={location === "/" ? "default" : "ghost"}
                  className={`${
                    location === "/" 
                      ? "bg-veg-primary text-white hover:bg-veg-secondary" 
                      : "text-gray-700 hover:text-veg-primary"
                  }`}
                  data-testid="nav-home"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Inicio
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button
                  variant={location === "/leaderboard" ? "default" : "ghost"}
                  className={`${
                    location === "/leaderboard" 
                      ? "bg-veg-primary text-white hover:bg-veg-secondary" 
                      : "text-gray-700 hover:text-veg-primary"
                  }`}
                  data-testid="nav-leaderboard"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  variant={location === "/profile" ? "default" : "ghost"}
                  className={`${
                    location === "/profile" 
                      ? "bg-veg-primary text-white hover:bg-veg-secondary" 
                      : "text-gray-700 hover:text-veg-primary"
                  }`}
                  data-testid="nav-profile"
                >
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </Button>
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              {isConnected && (
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-veg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm text-veg-secondary font-medium">Astar Network</span>
                </div>
              )}
              
              {/* Token Balance Display */}
              {isConnected && mockWeb3.isInitialized && (
                <div className="flex items-center space-x-3 bg-gradient-to-r from-veg-primary/5 to-veg-secondary/5 px-4 py-2 rounded-xl border border-veg-primary/20">
                  <Coins className="w-4 h-4 text-veg-primary" />
                  <div className="text-right">
                    <div className="text-sm font-semibold text-veg-dark">
                      {formatTokenAmount(mockWeb3.balance.veg21, 0)} VEG21
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTokenAmount(mockWeb3.balance.astr, 3)} ASTR
                    </div>
                  </div>
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
                  data-testid="button-connect-wallet"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Wallet Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Alert className="border-0 bg-transparent p-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <AlertTitle className="text-red-800 text-sm font-medium mb-1">
                Error de Wallet
              </AlertTitle>
              <AlertDescription className="text-red-700 text-sm flex items-center justify-between">
                <span>{error.message}</span>
                <div className="flex items-center space-x-2 ml-4">
                  {error.type === 'installation_required' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRetryClick}
                      className="text-red-700 border-red-300 hover:bg-red-100"
                      data-testid="button-install-metamask"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Instalar MetaMask
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={error.type !== 'installation_required' ? handleRetryClick : clearError}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                    data-testid="button-retry-wallet"
                  >
                    {error.type === 'installation_required' ? (
                      'Cerrar'
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Reintentar
                      </>
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </div>
  );
}
