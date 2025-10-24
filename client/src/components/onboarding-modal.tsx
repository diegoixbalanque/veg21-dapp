import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Utensils, Coffee, Heart, CheckCircle, User, Mail, MapPin, ChefHat, ArrowRight, ArrowLeft } from "lucide-react";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  estimatedReward: number;
}

export interface UserRegistrationData {
  name: string;
  email: string;
  location: string;
  dietaryPreference: string;
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

const STORAGE_KEY = 'veg21_challenge_progress';
const ONBOARDING_COMPLETED_KEY = 'veg21_onboarding_completed';
const USER_REGISTRATION_KEY = 'veg21_user_registration';

interface OnboardingModalProps {
  isOpen: boolean;
  onChallengeSelect: (challenge: Challenge) => void;
}

export function OnboardingModal({ isOpen, onChallengeSelect }: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState<UserRegistrationData>({
    name: '',
    email: '',
    location: '',
    dietaryPreference: ''
  });
  const [registrationErrors, setRegistrationErrors] = useState<Record<string, string>>({});

  // Load saved registration data when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedData = localStorage.getItem(USER_REGISTRATION_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData) as UserRegistrationData;
          setRegistrationData(parsedData);
        } catch (error) {
          console.error('Failed to load registration data:', error);
        }
      }
    }
  }, [isOpen]);

  const handleRegistrationChange = (field: keyof UserRegistrationData, value: string) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }));
    if (registrationErrors[field]) {
      setRegistrationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateRegistration = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!registrationData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    } else if (registrationData.name.length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!registrationData.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email)) {
      errors.email = 'Email no válido';
    }
    
    if (!registrationData.location.trim()) {
      errors.location = 'La ubicación es obligatoria';
    }
    
    if (!registrationData.dietaryPreference) {
      errors.dietaryPreference = 'Selecciona tu preferencia dietética';
    }
    
    setRegistrationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToChallenge = () => {
    if (validateRegistration()) {
      localStorage.setItem(USER_REGISTRATION_KEY, JSON.stringify(registrationData));
      setStep(2);
    }
  };

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
            {step === 1 ? '¡Bienvenido a VEG21! 🌱' : 'Elige tu Desafío'}
          </DialogTitle>
          <DialogDescription className="text-center text-lg text-gray-600">
            {step === 1 
              ? 'Completa tu registro para comenzar tu transformación vegana'
              : 'Selecciona tu desafío de 21 días'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-veg-primary to-veg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <p className="text-gray-700">
                  Cuéntanos un poco sobre ti para personalizar tu experiencia
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold flex items-center">
                    <User className="w-4 h-4 mr-2 text-veg-primary" />
                    Nombre Completo *
                  </Label>
                  <Input
                    id="name"
                    data-testid="input-registration-name"
                    placeholder="Tu nombre"
                    value={registrationData.name}
                    onChange={(e) => handleRegistrationChange('name', e.target.value)}
                    className={registrationErrors.name ? 'border-red-500' : ''}
                  />
                  {registrationErrors.name && (
                    <p className="text-sm text-red-600">{registrationErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-veg-primary" />
                    Correo Electrónico *
                  </Label>
                  <Input
                    id="email"
                    data-testid="input-registration-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={registrationData.email}
                    onChange={(e) => handleRegistrationChange('email', e.target.value)}
                    className={registrationErrors.email ? 'border-red-500' : ''}
                  />
                  {registrationErrors.email && (
                    <p className="text-sm text-red-600">{registrationErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-semibold flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-veg-primary" />
                    Ciudad / País *
                  </Label>
                  <Input
                    id="location"
                    data-testid="input-registration-location"
                    placeholder="Ej: Ciudad de México, México"
                    value={registrationData.location}
                    onChange={(e) => handleRegistrationChange('location', e.target.value)}
                    className={registrationErrors.location ? 'border-red-500' : ''}
                  />
                  {registrationErrors.location && (
                    <p className="text-sm text-red-600">{registrationErrors.location}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietary-preference" className="text-base font-semibold flex items-center">
                    <ChefHat className="w-4 h-4 mr-2 text-veg-primary" />
                    Preferencia Dietética Actual *
                  </Label>
                  <Select
                    value={registrationData.dietaryPreference}
                    onValueChange={(value) => handleRegistrationChange('dietaryPreference', value)}
                  >
                    <SelectTrigger 
                      id="dietary-preference"
                      data-testid="select-dietary-preference"
                      className={registrationErrors.dietaryPreference ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="omnivore">Omnívoro (como de todo)</SelectItem>
                      <SelectItem value="flexitarian">Flexitariano (mayormente vegetales)</SelectItem>
                      <SelectItem value="vegetarian">Vegetariano (sin carne)</SelectItem>
                      <SelectItem value="vegan">Vegano (sin productos animales)</SelectItem>
                      <SelectItem value="curious">Curioso (quiero aprender)</SelectItem>
                    </SelectContent>
                  </Select>
                  {registrationErrors.dietaryPreference && (
                    <p className="text-sm text-red-600">{registrationErrors.dietaryPreference}</p>
                  )}
                </div>
              </div>

              <div className="bg-veg-primary/5 p-4 rounded-lg border border-veg-primary/20">
                <p className="text-sm text-gray-700">
                  <strong>Privacidad:</strong> Tus datos se guardan localmente en tu navegador y nunca se comparten sin tu consentimiento.
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleContinueToChallenge}
                  className="bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary px-8 py-3 text-lg"
                  data-testid="button-continue-to-challenge"
                >
                  Continuar al Desafío
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-veg-primary"
                  data-testid="button-back-to-registration"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Volver
                </Button>
              </div>

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
          )}
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

export function getUserRegistration(): UserRegistrationData | null {
  try {
    const stored = localStorage.getItem(USER_REGISTRATION_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to get user registration:', error);
    return null;
  }
}