import { useState } from "react";
import { Wallet, Leaf, AlertCircle, RefreshCw, ExternalLink, Coins, Trophy, Home, User, Users, Network, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatTokenAmount } from "@/lib/mockWeb3";
import { Link, useLocation } from "wouter";
import { DemoWalletButton } from "@/components/demo-wallet-button";
import { AuthModal } from "@/components/auth-modal";
import { DEFAULT_NETWORK } from "@/config/chainConfig";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const { isConnected: isWalletConnected, isConnecting, connectWallet, disconnectWallet, formattedAddress, error, retryConnection, clearError, mockWeb3, isDemoMode } = useWallet();
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  const handleWalletClick = async () => {
    if (isWalletConnected) {
      disconnectWallet();
    } else {
      try {
        await connectWallet();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };
  
  const handleRetryClick = async () => {
    await retryConnection();
  };

  const handleSwitchNetwork = () => {
    toast({
      title: "Función próximamente",
      description: "El cambio de red estará disponible en Milestone 2 cuando se desplieguen los contratos en Celo Alfajores.",
      duration: 4000,
    });
  };

  const openLogin = () => {
    setAuthModalTab("login");
    setShowAuthModal(true);
  };

  const openRegister = () => {
    setAuthModalTab("register");
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    disconnectWallet();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
  };

  const getNetworkDisplayName = () => {
    return DEFAULT_NETWORK.displayName;
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
                    <p className="text-xs text-gray-600">{DEFAULT_NETWORK.displayName}</p>
                  </div>
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/">
                <Button variant={location === "/" ? "default" : "ghost"} className={`${location === "/" ? "bg-veg-primary text-white hover:bg-veg-secondary" : "text-gray-700 hover:text-veg-primary"}`} data-testid="nav-home">
                  <Home className="w-4 h-4 mr-2" />
                  Inicio
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant={location === "/leaderboard" ? "default" : "ghost"} className={`${location === "/leaderboard" ? "bg-veg-primary text-white hover:bg-veg-secondary" : "text-gray-700 hover:text-veg-primary"}`} data-testid="nav-leaderboard">
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant={location === "/profile" ? "default" : "ghost"} className={`${location === "/profile" ? "bg-veg-primary text-white hover:bg-veg-secondary" : "text-gray-700 hover:text-veg-primary"}`} data-testid="nav-profile">
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </Button>
              </Link>
              <Link href="/community">
                <Button variant={location === "/community" ? "default" : "ghost"} className={`${location === "/community" ? "bg-veg-primary text-white hover:bg-veg-secondary" : "text-gray-700 hover:text-veg-primary"}`} data-testid="nav-community">
                  <Users className="w-4 h-4 mr-2" />
                  Comunidad
                </Button>
              </Link>
            </nav>
            
            <div className="flex items-center space-x-3">
              {isWalletConnected && (
                <>
                  <div className={`hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full ${isDemoMode ? 'bg-purple-50' : 'bg-green-50'}`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isDemoMode ? 'bg-purple-500' : 'bg-veg-primary'}`}></div>
                    <span className={`text-sm font-medium ${isDemoMode ? 'text-purple-700' : 'text-veg-secondary'}`}>
                      {getNetworkDisplayName()}
                    </span>
                  </div>
                  <div className="hidden lg:flex items-center space-x-3 bg-gradient-to-r from-veg-primary/5 to-veg-secondary/5 px-4 py-2 rounded-xl border border-veg-primary/20">
                    <Coins className="w-4 h-4 text-veg-primary" />
                    <div className="text-right">
                      <div className="text-sm font-semibold text-veg-dark">
                        {formatTokenAmount(mockWeb3.balance.veg21, 0)} VEG21
                      </div>
                    </div>
                    {isDemoMode && (
                      <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        DEMO
                      </div>
                    )}
                  </div>
                </>
              )}

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2" data-testid="button-user-menu">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{user?.name?.split(' ')[0] || 'Usuario'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {!isWalletConnected && (
                      <>
                        <DropdownMenuItem onClick={handleWalletClick} data-testid="menu-connect-wallet">
                          <Wallet className="w-4 h-4 mr-2" />
                          Conectar Wallet
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {isWalletConnected && (
                      <>
                        <DropdownMenuItem className="text-xs text-gray-500">
                          <Wallet className="w-4 h-4 mr-2" />
                          {formattedAddress}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600" data-testid="menu-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  {!isWalletConnected && <DemoWalletButton />}
                  <Button variant="outline" onClick={openLogin} data-testid="button-login">
                    <LogIn className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Iniciar Sesión</span>
                  </Button>
                  <Button onClick={openRegister} className="bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary" data-testid="button-register">
                    Registrarse
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {error && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Alert className="border-0 bg-transparent p-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <AlertTitle className="text-red-800 text-sm font-medium mb-1">Error de Wallet</AlertTitle>
              <AlertDescription className="text-red-700 text-sm flex items-center justify-between">
                <span>{error.message}</span>
                <div className="flex items-center space-x-2 ml-4">
                  {error.type === 'installation_required' && (
                    <Button size="sm" variant="outline" onClick={handleRetryClick} className="text-red-700 border-red-300 hover:bg-red-100">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Instalar MetaMask
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={error.type !== 'installation_required' ? handleRetryClick : clearError} className="text-red-700 border-red-300 hover:bg-red-100">
                    {error.type === 'installation_required' ? 'Cerrar' : <><RefreshCw className="h-3 w-3 mr-1" />Reintentar</>}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab={authModalTab} />
    </div>
  );
}
