import { useState } from "react";
import { Coins, Heart, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageModal } from "./message-modal";
import { useWallet } from "@/hooks/use-wallet";

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
  const [userTokenBalance] = useState(450);
  const [donatingTo, setDonatingTo] = useState<number | null>(null);
  const [votingFor, setVotingFor] = useState<number | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'success', title: '', message: '' });

  const { isConnected } = useWallet();

  const showMessage = (type: 'success' | 'error', title: string, message: string) => {
    setModalState({ isOpen: true, type, title, message });
  };

  const handleDonation = async (charityId: number) => {
    if (!isConnected) {
      showMessage('error', 'Wallet Requerida', 'Necesitas conectar tu wallet antes de hacer una donación.');
      return;
    }

    const donationAmount = 50;
    if (userTokenBalance < donationAmount) {
      showMessage('error', 'Saldo Insuficiente', 'No tienes suficientes tokens VEG21 para hacer una donación.');
      return;
    }

    setDonatingTo(charityId);

    try {
      // Simulate donation process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setTotalDonated(prev => prev + donationAmount);
      setCharityData(prev => prev.map(charity => 
        charity.id === charityId 
          ? { ...charity, donations: charity.donations + donationAmount }
          : charity
      ));

      showMessage('success', '¡Donación Exitosa!', `Has donado ${donationAmount} tokens VEG21. ¡Gracias por tu contribución al bienestar animal!`);
    } catch (error) {
      showMessage('error', 'Error', 'Hubo un problema al procesar la donación. Intenta de nuevo.');
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-veg-light to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-veg-dark mb-4">Fondo Comunitario VEG21</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Dona tokens VEG21 a organizaciones de protección animal verificadas. Tu contribución crea un impacto real y transparente.
            </p>
          </div>

          {/* Total donations counter */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-green-100 mb-12 text-center">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleDonation(charity.id)}
                    disabled={donatingTo === charity.id}
                    className="w-full bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    {donatingTo === charity.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        Donar con Tokens
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={() => handleVote(charity.id)}
                    disabled={votingFor === charity.id}
                    variant="outline"
                    className="w-full border-veg-primary text-veg-primary hover:bg-veg-primary hover:text-white transition-all duration-200"
                  >
                    {votingFor === charity.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-veg-primary mr-2"></div>
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
            ))}
          </div>
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
