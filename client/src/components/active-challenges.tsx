import { useState } from "react";
import { Trophy, Utensils, Heart, Plus, Check, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageModal } from "./message-modal";
import { ChallengeProgressTracker } from "./challenge-progress-tracker";
import { useWallet } from "@/hooks/use-wallet";
import { useMockWeb3 } from "@/hooks/use-mock-web3";

interface Challenge {
  id: number;
  title: string;
  description: string;
  progress: number;
  reward: number;
  participants: number;
  daysLeft: number;
  icon: any;
  status: 'active' | 'upcoming' | 'specialist';
  gradient: string;
  requirement?: string;
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: "Desafío Noviembre 2024",
    description: "Adopta 21 hábitos veganos consecutivos y contribuye al impacto ambiental positivo.",
    progress: 68,
    reward: 100,
    participants: 342,
    daysLeft: 7,
    icon: Trophy,
    status: 'active',
    gradient: "from-veg-primary to-veg-secondary"
  },
  {
    id: 2,
    title: "Cocina Vegana Avanzada",
    description: "Aprende 21 recetas veganas únicas y compártelas con la comunidad para ganar tokens extra.",
    progress: 0,
    reward: 150,
    participants: 0,
    daysLeft: 0,
    icon: Utensils,
    status: 'upcoming',
    gradient: "from-blue-500 to-blue-600",
    requirement: "Inicia: 1 Dic 2024"
  },
  {
    id: 3,
    title: "Activismo Digital",
    description: "Promociona el veganismo en redes sociales y educa sobre sostenibilidad durante 21 días.",
    progress: 0,
    reward: 200,
    participants: 0,
    daysLeft: 0,
    icon: Heart,
    status: 'specialist',
    gradient: "from-purple-500 to-purple-600",
    requirement: "1 reto completado"
  }
];

export function ActiveChallenges() {
  const [joinedChallenges, setJoinedChallenges] = useState<Set<number>>(new Set());
  const [joiningChallenge, setJoiningChallenge] = useState<number | null>(null);
  const [challengeProgress, setChallengeProgress] = useState<Record<number, number>>({});
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'success', title: '', message: '' });

  const { isConnected } = useWallet();
  const mockWeb3 = useMockWeb3();

  const showMessage = (type: 'success' | 'error', title: string, message: string) => {
    setModalState({ isOpen: true, type, title, message });
  };

  const handleJoinChallenge = async (challenge: Challenge) => {
    // In development mode with mock Web3, we only need mockWeb3 to be initialized
    const canJoin = import.meta.env.DEV ? mockWeb3.isInitialized : (isConnected && mockWeb3.isInitialized);
    
    if (!canJoin) {
      showMessage('error', 'Wallet Requerida', 'Necesitas conectar tu wallet antes de unirte a un reto.');
      return;
    }

    if (challenge.status === 'upcoming') {
      showMessage('error', 'Reto No Disponible', 'Este reto aún no está disponible. Regresa pronto.');
      return;
    }

    if (challenge.status === 'specialist' && !joinedChallenges.has(1)) {
      showMessage('error', 'Requisitos No Cumplidos', 'Necesitas completar al menos un reto antes de acceder a este desafío especialista.');
      return;
    }

    setJoiningChallenge(challenge.id);

    try {
      // Simulate joining challenge
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setJoinedChallenges(prev => new Set([...Array.from(prev), challenge.id]));
      setChallengeProgress(prev => ({ ...prev, [challenge.id]: 1 }));
      
      // For the main challenge, unlock milestone rewards to demonstrate the system
      if (challenge.id === 1) {
        // Simulate user has been working on challenge for some days by unlocking day 7 reward
        mockWeb3.unlockReward('day_7_milestone');
        
        // Optionally also unlock day 14 if they've progressed further (for demo purposes)
        // This simulates a user who has been active
        if (Math.random() > 0.5) { // 50% chance to unlock day 14 reward too
          mockWeb3.unlockReward('day_14_milestone');
        }
      }
      
      showMessage('success', '¡Te has unido al reto!', 'Ahora formas parte del desafío. ¡Completa tus objetivos diarios para ganar tokens VEG21!');
    } catch (error) {
      showMessage('error', 'Error', 'Hubo un problema al unirse al reto. Intenta de nuevo.');
    } finally {
      setJoiningChallenge(null);
    }
  };

  const getButtonContent = (challenge: Challenge) => {
    if (joiningChallenge === challenge.id) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Uniéndose...
        </>
      );
    }

    if (joinedChallenges.has(challenge.id)) {
      return (
        <>
          <Check className="mr-2 h-4 w-4" />
          ¡Unido!
        </>
      );
    }

    if (challenge.status === 'upcoming') {
      return (
        <>
          <Clock className="mr-2 h-4 w-4" />
          Próximamente
        </>
      );
    }

    if (challenge.status === 'specialist') {
      return (
        <>
          <Star className="mr-2 h-4 w-4" />
          Unirse al Reto
        </>
      );
    }

    return (
      <>
        <Plus className="mr-2 h-4 w-4" />
        Unirse al Reto
      </>
    );
  };

  const getButtonStyle = (challenge: Challenge) => {
    if (joinedChallenges.has(challenge.id)) {
      return "bg-green-600 hover:bg-green-700";
    }

    if (challenge.status === 'upcoming') {
      return "bg-gray-200 text-gray-500 cursor-not-allowed";
    }

    return `bg-gradient-to-r ${challenge.gradient} text-white hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg`;
  };

  return (
    <>
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white" data-testid="active-challenges-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-veg-dark mb-4">Retos Activos</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Participa en desafíos veganos de 21 días y gana tokens VEG21 por completar objetivos diarios.
            </p>
          </div>

          {/* Progress Trackers for Joined Challenges */}
          {Array.from(joinedChallenges).length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-veg-dark mb-6 text-center">Mis Retos Activos</h3>
              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from(joinedChallenges).map((challengeId) => {
                  const challenge = challenges.find(c => c.id === challengeId);
                  if (!challenge) return null;
                  
                  return (
                    <ChallengeProgressTracker
                      key={challengeId}
                      challengeId={challengeId}
                      challengeName={challenge.title}
                      currentDay={challengeProgress[challengeId] || 1}
                      totalDays={21}
                      isActive={true}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {challenges.map((challenge) => {
              const IconComponent = challenge.icon;
              const isJoined = joinedChallenges.has(challenge.id);
              const isJoining = joiningChallenge === challenge.id;

              return (
                <div 
                  key={challenge.id}
                  className={`bg-gradient-to-br from-white ${
                    challenge.status === 'active' ? 'to-green-50 border-green-100' : 
                    challenge.status === 'upcoming' ? 'to-blue-50 border-blue-100' : 
                    'to-purple-50 border-purple-100'
                  } rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${challenge.gradient} rounded-2xl flex items-center justify-center`}>
                      <IconComponent className="text-white text-2xl" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      challenge.status === 'active' ? 'bg-veg-accent/20 text-veg-accent' :
                      challenge.status === 'upcoming' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {challenge.status === 'active' ? `${challenge.daysLeft} días restantes` :
                       challenge.status === 'upcoming' ? 'Próximamente' :
                       'Especialista'}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-veg-dark mb-3">
                    {challenge.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {challenge.description}
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    {challenge.status === 'active' && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Progreso Global:</span>
                          <span className="text-sm font-semibold text-veg-primary">{challenge.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-veg-primary to-veg-secondary h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${challenge.progress}%` }}
                          ></div>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Recompensa: <span className={`font-semibold ${
                          challenge.status === 'active' ? 'text-veg-primary' :
                          challenge.status === 'upcoming' ? 'text-blue-600' :
                          'text-purple-600'
                        }`}>{challenge.reward} VEG21</span>
                      </span>
                      {challenge.status === 'active' ? (
                        <span className="text-gray-600">
                          <span className="font-semibold">{challenge.participants}</span> participantes
                        </span>
                      ) : (
                        <span className="text-gray-600">
                          {challenge.requirement}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleJoinChallenge(challenge)}
                    disabled={challenge.status === 'upcoming' || isJoining || isJoined}
                    className={`w-full py-3 rounded-xl font-semibold ${getButtonStyle(challenge)}`}
                  >
                    {getButtonContent(challenge)}
                  </Button>
                </div>
              );
            })}
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
