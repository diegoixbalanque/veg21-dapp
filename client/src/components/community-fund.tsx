import { useState } from "react";
import { Coins, Heart, ThumbsUp, History, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageModal } from "./message-modal";
import { useWallet } from "@/hooks/use-wallet";
import { useMockWeb3, useContributions } from "@/hooks/use-mock-web3";
import { formatTokenAmount, formatTxHash } from "@/lib/mockWeb3";

interface Charity {
  id: number;
  name: string;
  description: string;
  donations: number;
  votes: number;
  image: string;
}

const charities: Charity[] = [
  {
    id: 1,
    name: "Santuario Esperanza Animal",
    description: "Refugio para animales de granja rescatados. Proporcionamos cuidado médico, alimentación y un hogar seguro para más de 200 animales.",
    donations: 3247,
    votes: 156,
    image: "https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  },
  {
    id: 2,
    name: "Centro de Rescate Silvestre",
    description: "Rehabilitación y liberación de fauna silvestre. Trabajamos en la conservación de especies nativas y educación ambiental.",
    donations: 2891,
    votes: 89,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  },
  {
    id: 3,
    name: "Rescate Marino Pacífico",
    description: "Protección de la vida marina y limpieza de océanos. Rescatamos especies afectadas por contaminación plástica.",
    donations: 6709,
    votes: 234,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  }
];

export function CommunityFund() {
  const [totalDonated, setTotalDonated] = useState(12847);
  const [charityData, setCharityData] = useState(charities);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [donatingTo, setDonatingTo] = useState<number | null>(null);
  const [votingFor, setVotingFor] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('50');
  const [showContributionHistory, setShowContributionHistory] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'success', title: '', message: '' });

  const { isConnected } = useWallet();
  const mockWeb3 = useMockWeb3();
  const { contributions, contribute, totalContributed, isLoading: isContributing } = useContributions();

  // Fallback component for loading state
  const LoadingCard = () => (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100">
      <div className="animate-pulse space-y-4">
        <div className="w-full h-48 bg-gray-200 rounded-xl"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  // Fallback component for error state
  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Heart className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar las organizaciones</h3>
      <p className="text-gray-600 mb-6">No pudimos cargar la información de las organizaciones benéficas. Por favor, intenta de nuevo.</p>
      <Button
        onClick={() => {
          setHasError(false);
          setIsLoading(true);
          // Simulate retry
          setTimeout(() => setIsLoading(false), 1000);
        }}
        className="bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary"
      >
        Intentar de Nuevo
      </Button>
    </div>
  );

  // Fallback for empty state
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-veg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Heart className="w-8 h-8 text-veg-accent" />
      </div>
      <h3 className="text-xl font-semibold text-veg-dark mb-2">Próximamente nuevas organizaciones</h3>
      <p className="text-gray-600">Estamos trabajando para agregar más organizaciones benéficas verificadas. ¡Vuelve pronto!</p>
    </div>
  );

  const showMessage = (type: 'success' | 'error', title: string, message: string) => {
    setModalState({ isOpen: true, type, title, message });
  };

  const handleDonation = async (charityId: number, amount?: number) => {
    // In development mode with mock Web3, we only need mockWeb3 to be initialized
    const canDonate = import.meta.env.DEV ? mockWeb3.isInitialized : (isConnected && mockWeb3.isInitialized);
    
    if (!canDonate) {
      showMessage('error', 'Wallet Requerida', 'Necesitas conectar tu wallet antes de hacer una donación.');
      return;
    }

    const donationAmount = amount || parseInt(customAmount) || 50;
    
    if (isNaN(donationAmount) || donationAmount <= 0) {
      showMessage('error', 'Monto Inválido', 'Por favor, ingresa un monto válido mayor a 0.');
      return;
    }

    if (mockWeb3.balance.veg21 < donationAmount) {
      showMessage('error', 'Saldo Insuficiente', `No tienes suficientes tokens VEG21. Tu saldo actual es ${formatTokenAmount(mockWeb3.balance.veg21, 0)} VEG21.`);
      return;
    }

    setDonatingTo(charityId);

    try {
      // Use mock Web3 service for contribution
      const transaction = await contribute(charityId.toString(), donationAmount);
      
      // Update local charity data
      setTotalDonated(prev => prev + donationAmount);
      setCharityData(prev => prev.map(charity => 
        charity.id === charityId 
          ? { ...charity, donations: charity.donations + donationAmount }
          : charity
      ));

      const charity = charityData.find(c => c.id === charityId);
      showMessage('success', '¡Donación Exitosa!', 
        `Has donado ${formatTokenAmount(donationAmount, 0)} VEG21 tokens a ${charity?.name}. ¡Gracias por tu generosidad! Tu contribución ayuda directamente a los animales.`);
      
      // Reset custom amount
      setCustomAmount('50');
    } catch (error: any) {
      showMessage('error', 'Error en Donación', error.message || 'Hubo un problema al procesar la donación. Intenta de nuevo.');
    } finally {
      setDonatingTo(null);
    }
  };

  const handleVote = async (charityId: number) => {
    if (!isConnected) {
      showMessage('error', 'Wallet Requerida', 'Necesitas conectar tu wallet antes de votar.');
      return;
    }

    setVotingFor(charityId);

    try {
      // Simulate voting process
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCharityData(prev => prev.map(charity => 
        charity.id === charityId 
          ? { ...charity, votes: charity.votes + 1 }
          : charity
      ));

      showMessage('success', '¡Voto Registrado!', 'Tu voto de confianza ha sido registrado exitosamente.');
    } catch (error) {
      showMessage('error', 'Error', 'Hubo un problema al registrar tu voto. Intenta de nuevo.');
    } finally {
      setVotingFor(null);
    }
  };

  return (
    <>
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-veg-light to-green-50" data-testid="community-fund-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-veg-dark mb-4">Fondo Comunitario VEG21</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Dona tokens VEG21 a organizaciones de protección animal verificadas. Tu contribución crea un impacto real y transparente.
            </p>
          </div>

          {/* Total donations and user stats */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Community Total */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-green-100 text-center">
              <h3 className="text-2xl font-bold text-veg-dark mb-4">Total Donado por la Comunidad</h3>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-veg-primary to-veg-secondary rounded-full flex items-center justify-center">
                  <Coins className="text-white text-3xl" />
                </div>
                <div>
                  <p className="text-5xl font-bold text-veg-primary">{totalDonated.toLocaleString()}</p>
                  <p className="text-lg text-gray-600">Tokens VEG21</p>
                </div>
              </div>
            </div>
            
            {/* User Contributions */}
            {(import.meta.env.DEV ? mockWeb3.isInitialized : (isConnected && mockWeb3.isInitialized)) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-xl border border-blue-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Tus Contribuciones</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Contribuido:</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{formatTokenAmount(totalContributed, 0)}</p>
                      <p className="text-sm text-gray-500">VEG21 tokens</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Donaciones realizadas:</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {contributions.length}
                    </Badge>
                  </div>
                  {contributions.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setShowContributionHistory(!showContributionHistory)}
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                      data-testid="toggle-contribution-history"
                    >
                      <History className="w-4 h-4 mr-2" />
                      {showContributionHistory ? 'Ocultar' : 'Ver'} Historial
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Contribution History */}
          {showContributionHistory && contributions.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <History className="w-5 h-5 mr-2" />
                Historial de Contribuciones
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {contributions.slice().reverse().map((contribution) => {
                  const charity = charityData.find(c => c.id.toString() === contribution.charityId);
                  return (
                    <div key={contribution.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{charity?.name || 'Organización'}</p>
                        <p className="text-sm text-gray-600">
                          {contribution.timestamp.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-gray-500">{formatTxHash(contribution.txHash)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{formatTokenAmount(contribution.amount, 0)}</p>
                        <p className="text-xs text-gray-500">VEG21</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </div>
          )}

          {/* Error State */}
          {hasError && !isLoading && <ErrorState />}

          {/* Empty State */}
          {!isLoading && !hasError && charityData.length === 0 && <EmptyState />}

          {/* Normal Data Display */}
          {!isLoading && !hasError && charityData.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {charityData.map((charity) => (
              <div key={charity.id} className="bg-white rounded-2xl p-8 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
                <img 
                  src={charity.image} 
                  alt={charity.name}
                  className="w-full h-48 object-cover rounded-xl mb-6" 
                />
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-veg-dark">{charity.name}</h3>
                  <span className="bg-green-100 text-veg-secondary px-2 py-1 rounded-full text-xs font-semibold">
                    Verificado ✓
                  </span>
                </div>
                
                <p className="text-gray-600 mb-6">{charity.description}</p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Donaciones recibidas:</span>
                    <span className="text-lg font-bold text-veg-primary">{charity.donations.toLocaleString()} VEG21</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Votos de confianza:</span>
                    <span className="text-sm font-semibold text-veg-secondary">{charity.votes}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Custom Donation Amount */}
                  {(import.meta.env.DEV ? mockWeb3.isInitialized : (isConnected && mockWeb3.isInitialized)) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Label htmlFor={`amount-${charity.id}`} className="text-sm font-medium text-gray-700">
                        Monto de Donación (VEG21)
                      </Label>
                      <div className="mt-2 space-y-3">
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id={`amount-${charity.id}`}
                            type="number"
                            min="1"
                            max={mockWeb3.balance.veg21}
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="pl-10"
                            placeholder="Ingresa monto"
                            data-testid={`input-donation-amount-${charity.id}`}
                          />
                        </div>
                        
                        {/* Quick Amount Buttons */}
                        <div className="flex space-x-2">
                          {[25, 50, 100, 200].map((amount) => (
                            <Button
                              key={amount}
                              variant="outline"
                              size="sm"
                              onClick={() => setCustomAmount(amount.toString())}
                              className="flex-1 text-xs border-gray-300 hover:border-veg-primary hover:text-veg-primary"
                              disabled={amount > mockWeb3.balance.veg21}
                            >
                              {amount}
                            </Button>
                          ))}
                        </div>
                        
                        <div className="text-xs text-gray-500 text-center">
                          Tu saldo: {formatTokenAmount(mockWeb3.balance.veg21, 0)} VEG21
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={() => handleDonation(charity.id)}
                      disabled={donatingTo === charity.id || isContributing || !(import.meta.env.DEV ? mockWeb3.isInitialized : (isConnected && mockWeb3.isInitialized))}
                      className="w-full bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary transform hover:scale-105 transition-all duration-200 shadow-lg"
                      data-testid={`button-donate-${charity.id}`}
                    >
                      {donatingTo === charity.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Heart className="mr-2 h-4 w-4" />
                          {(import.meta.env.DEV ? mockWeb3.isInitialized : (isConnected && mockWeb3.isInitialized))
                            ? `Donar ${customAmount || '50'} VEG21`
                            : 'Conectar para Donar'
                          }
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={() => handleVote(charity.id)}
                      disabled={votingFor === charity.id || !isConnected}
                      variant="outline"
                      className="w-full border-veg-primary text-veg-primary hover:bg-veg-primary hover:text-white transition-all duration-200"
                      data-testid={`button-vote-${charity.id}`}
                    >
                      {votingFor === charity.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Votando...
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Votar Confianza
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <MessageModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />
    </>
  );
}
