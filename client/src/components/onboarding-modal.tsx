import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Utensils, Coffee, Heart, CheckCircle } from "lucide-react";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  estimatedReward: number;
}

const AVAILABLE_CHALLENGES: Challenge[] = [
  {
    id: 'meat_free_21',
    title: '21 días sin carne',
    description: 'Elimina toda la carne de tu dieta por 21 días. Incluye pollo, res, cerdo y pescado.',
    icon: <Leaf className="w-6 h-6" />,
    difficulty: 'Principiante',
    estimatedReward: 500
  },
  {
    id: 'vegan_breakfasts_21',
    title: '21 días de desayunos veganos',
    description: 'Comienza tu día con desayunos 100% veganos. Perfecto para principiantes.',
    icon: <Coffee className="w-6 h-6" />,
    difficulty: 'Principiante',
    estimatedReward: 300
  },
  {
    id: 'full_vegan_21',
    title: '21 días completamente vegano',
    description: 'Adopta una dieta 100% vegana: sin carne, lácteos, huevos ni miel.',
    icon: <Heart className="w-6 h-6" />,
    difficulty: 'Intermedio',
    estimatedReward: 800
  },
  {
    id: 'zero_waste_vegan_21',
    title: '21 días vegano zero waste',
    description: 'Combina veganismo con zero waste. Reduce empaques y desperdicio.',
    icon: <Utensils className="w-6 h-6" />,
    difficulty: 'Avanzado',
    estimatedReward: 1000
  }
];

const STORAGE_KEY = 'veg21_user_challenge';
const ONBOARDING_COMPLETED_KEY = 'veg21_onboarding_completed';

interface OnboardingModalProps {
  isOpen: boolean;
  onChallengeSelect: (challenge: Challenge) => void;
}

export function OnboardingModal({ isOpen, onChallengeSelect }: OnboardingModalProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChallengeSelect = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleConfirmChallenge = async () => {
    if (!selectedChallenge) return;
    
    setIsSubmitting(true);
    
    try {
      // Store challenge selection in localStorage
      const challengeData = {
        challenge: selectedChallenge,
        startDate: new Date().toISOString(),
        progress: {
          currentDay: 1,
          completedDays: [],
          isActive: true
        }
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(challengeData));
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      
      // Notify parent component
      onChallengeSelect(selectedChallenge);
    } catch (error) {
      console.error('Failed to save challenge selection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'Principiante': return 'bg-green-100 text-green-800';
      case 'Intermedio': return 'bg-yellow-100 text-yellow-800';
      case 'Avanzado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-onboarding">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-veg-primary">
            ¡Bienvenido a VEG21! 🌱
          </DialogTitle>
          <DialogDescription className="text-center text-lg text-gray-600">
            Comienza tu transformación hacia un estilo de vida más sostenible
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700">
              Selecciona tu primer desafío de 21 días y comienza a ganar tokens VEG21 
              mientras contribuyes a un mundo más verde.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_CHALLENGES.map((challenge) => (
              <Card
                key={challenge.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedChallenge?.id === challenge.id 
                    ? 'ring-2 ring-veg-primary border-veg-primary' 
                    : 'hover:border-veg-primary/50'
                }`}
                onClick={() => handleChallengeSelect(challenge)}
                data-testid={`challenge-card-${challenge.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-veg-primary/10 rounded-lg text-veg-primary">
                        {challenge.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      </div>
                    </div>
                    {selectedChallenge?.id === challenge.id && (
                      <CheckCircle className="w-6 h-6 text-veg-primary" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Hasta <span className="font-semibold text-veg-primary">{challenge.estimatedReward} VEG21</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {challenge.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {selectedChallenge && (
            <div className="bg-veg-primary/5 p-6 rounded-lg border border-veg-primary/20">
              <h3 className="font-semibold text-veg-primary mb-2">
                ¿Listo para "{selectedChallenge.title}"?
              </h3>
              <p className="text-gray-700 mb-4">
                {selectedChallenge.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Duración:</span> 21 días • 
                  <span className="font-medium"> Recompensa:</span> Hasta {selectedChallenge.estimatedReward} VEG21
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleConfirmChallenge}
              disabled={!selectedChallenge || isSubmitting}
              className="bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary px-8 py-3 text-lg"
              data-testid="button-start-challenge"
            >
              {isSubmitting ? 'Guardando...' : 'Comenzar mi desafío 🚀'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Utility functions for other components to use
export function getUserChallenge(): Challenge | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    return data.challenge || null;
  } catch (error) {
    console.error('Failed to get user challenge:', error);
    return null;
  }
}

export function getChallengeProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    return data.progress || null;
  } catch (error) {
    console.error('Failed to get challenge progress:', error);
    return null;
  }
}

export function isOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
    return false;
  }
}

export function updateChallengeProgress(day: number, completed: boolean = true) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    
    const data = JSON.parse(stored);
    if (!data.progress) return false;
    
    if (completed && !data.progress.completedDays.includes(day)) {
      data.progress.completedDays.push(day);
      data.progress.currentDay = Math.min(day + 1, 21);
    }
    
    // Mark challenge as completed if reached day 21
    if (data.progress.completedDays.length >= 21) {
      data.progress.isActive = false;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to update challenge progress:', error);
    return false;
  }
}