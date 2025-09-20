import { useState, useEffect } from "react";
import { CheckCircle, Circle, Calendar, Target, Flame, Gift, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMockWeb3 } from "@/hooks/use-mock-web3";
import { Badge } from "@/components/ui/badge";
import { formatTokenAmount } from "@/lib/mockWeb3";

interface DayStatus {
  day: number;
  status: 'completed' | 'current' | 'upcoming';
  task?: string;
}

interface Milestone {
  day: number;
  rewardId: string;
  amount: number;
  description: string;
  unlocked: boolean;
  claimed: boolean;
}

interface ChallengeProgressTrackerProps {
  challengeId: number;
  challengeName: string;
  currentDay: number;
  totalDays: number;
  isActive: boolean;
  onStartChallenge?: () => void;
}

export function ChallengeProgressTracker({
  challengeId,
  challengeName,
  currentDay,
  totalDays = 21,
  isActive,
  onStartChallenge
}: ChallengeProgressTrackerProps) {
  const [expandedView, setExpandedView] = useState(false);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);
  const mockWeb3 = useMockWeb3();
  
  // Define reward milestones
  const milestones: Milestone[] = [
    {
      day: 1,
      rewardId: 'day_1_bonus',
      amount: 50,
      description: 'Premio por tu primer día vegano',
      unlocked: false,
      claimed: false
    },
    {
      day: 7,
      rewardId: 'week_1_milestone',
      amount: 100,
      description: 'Completaste tu primera semana vegana',
      unlocked: false,
      claimed: false
    },
    {
      day: 14,
      rewardId: 'week_2_milestone',
      amount: 150,
      description: 'Dos semanas de compromiso vegano',
      unlocked: false,
      claimed: false
    },
    {
      day: 21,
      rewardId: 'challenge_complete',
      amount: 300,
      description: '¡Completaste el desafío de 21 días!',
      unlocked: false,
      claimed: false
    }
  ];
  
  // Update milestone status based on progress and Web3 rewards
  const getUpdatedMilestones = (): Milestone[] => {
    return milestones.map(milestone => {
      const web3Reward = mockWeb3.rewards.find(r => r.id === milestone.rewardId);
      return {
        ...milestone,
        unlocked: isActive && currentDay >= milestone.day,
        claimed: web3Reward?.claimed || false
      };
    });
  };
  
  const [currentMilestones, setCurrentMilestones] = useState<Milestone[]>(getUpdatedMilestones());
  
  // Update milestones when progress changes
  useEffect(() => {
    const updatedMilestones = getUpdatedMilestones();
    setCurrentMilestones(updatedMilestones);
    
    // Unlock rewards in Web3 service when milestones are reached
    updatedMilestones.forEach(milestone => {
      if (milestone.unlocked && !milestone.claimed) {
        mockWeb3.unlockReward(milestone.rewardId);
      }
    });
  }, [currentDay, isActive, mockWeb3.rewards]);
  
  // Handle reward claiming
  const handleClaimReward = async (rewardId: string) => {
    setClaimingReward(rewardId);
    try {
      await mockWeb3.claimReward(rewardId);
      // Update local state
      setCurrentMilestones(prev => 
        prev.map(m => 
          m.rewardId === rewardId ? { ...m, claimed: true } : m
        )
      );
    } catch (error) {
      console.error('Failed to claim reward:', error);
    } finally {
      setClaimingReward(null);
    }
  };

  // Generate daily tasks for the 21-day challenge
  const dailyTasks: string[] = [
    "Prepara un desayuno 100% vegano",
    "Investiga sobre nutrición vegana",
    "Prueba una nueva proteína vegetal",
    "Cocina una receta vegana para el almuerzo",
    "Lee sobre el impacto ambiental",
    "Comparte tu progreso en redes sociales",
    "Explora un restaurante vegano local",
    "Prepara snacks veganos saludables",
    "Aprende sobre vitamina B12",
    "Cocina una cena vegana completa",
    "Descubre alternativas veganas a lácteos",
    "Planifica tu menú semanal vegano",
    "Prepara un batido verde nutritivo",
    "Lee testimonios de otros veganos",
    "Experimenta con especias y condimentos",
    "Aprende sobre proteínas vegetales",
    "Cocina legumbres de forma creativa",
    "Explora productos veganos en el mercado",
    "Prepara un postre vegano",
    "Reflexiona sobre tu progreso",
    "¡Celebra tu logro de 21 días veganos!"
  ];

  const createDaysData = (): DayStatus[] => {
    return Array.from({ length: totalDays }, (_, index) => {
      const dayNum = index + 1;
      let status: 'completed' | 'current' | 'upcoming';
      
      if (!isActive) {
        status = 'upcoming';
      } else if (dayNum < currentDay) {
        status = 'completed';
      } else if (dayNum === currentDay) {
        status = 'current';
      } else {
        status = 'upcoming';
      }

      return {
        day: dayNum,
        status,
        task: dailyTasks[index] || `Tarea del día ${dayNum}`
      };
    });
  };

  const daysData = createDaysData();
  const completedDays = daysData.filter(d => d.status === 'completed').length;
  const progressPercentage = isActive ? Math.round((completedDays / totalDays) * 100) : 0;

  const getStatusIcon = (status: DayStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current':
        return <Target className="w-5 h-5 text-veg-primary animate-pulse" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusStyle = (status: DayStatus['status']) => {
    switch (status) {
      case 'completed':
        return "bg-green-100 border-green-300 text-green-800";
      case 'current':
        return "bg-veg-primary/10 border-veg-primary text-veg-primary ring-2 ring-veg-primary/20";
      default:
        return "bg-gray-50 border-gray-200 text-gray-400";
    }
  };

  if (!isActive && !onStartChallenge) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 shadow-lg border border-green-100" data-testid={`progress-tracker-${challengeId}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-veg-primary to-veg-secondary rounded-full flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-veg-dark">{challengeName}</h3>
            <p className="text-sm text-gray-600">Progreso de 21 días</p>
          </div>
        </div>
        {isActive && (
          <div className="text-right">
            <p className="text-2xl font-bold text-veg-primary">{currentDay}/21</p>
            <p className="text-xs text-gray-600">Día actual</p>
          </div>
        )}
      </div>

      {!isActive ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-veg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-veg-accent" />
          </div>
          <h4 className="text-lg font-semibold text-veg-dark mb-2">¡Comienza tu Desafío de 21 Días!</h4>
          <p className="text-gray-600 mb-6">
            Únete al reto y comienza tu transformación vegana paso a paso
          </p>
          <Button
            onClick={onStartChallenge}
            className="bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary transform hover:scale-105 transition-all duration-200 shadow-lg"
            data-testid="start-challenge-button"
          >
            <Flame className="mr-2 h-4 w-4" />
            ¡Iniciar Desafío!
          </Button>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-veg-dark">Progreso General</span>
              <span className="text-sm font-bold text-veg-primary">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-veg-primary to-veg-secondary h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Current Day Highlight */}
          {currentDay <= totalDays && (
            <div className="bg-white rounded-xl p-4 mb-4 border border-veg-primary/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-veg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentDay}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-veg-dark">Día {currentDay} - ¡Hoy!</p>
                  <p className="text-sm text-gray-600">{dailyTasks[currentDay - 1]}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Milestone Rewards - Enhanced */}
          {currentMilestones.some(m => m.unlocked) && (
            <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 rounded-2xl p-6 mb-6 border-2 border-yellow-300 shadow-lg relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full opacity-20 -mr-12 -mt-12"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-200 rounded-full opacity-20 -ml-8 -mb-8"></div>
              
              <div className="relative">
                <h4 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  🎉 ¡Recompensas Disponibles!
                </h4>
                <p className="text-sm text-gray-700 mb-4">Has desbloqueado recompensas por tu progreso. ¡Reclámalas ahora!</p>
                
                <div className="space-y-4">
                  {currentMilestones
                    .filter(milestone => milestone.unlocked)
                    .map((milestone) => (
                      <div key={milestone.rewardId} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-yellow-200 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <Star className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">Día {milestone.day} Completado</p>
                            <p className="text-sm text-gray-700 mb-2">{milestone.description}</p>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-sm font-semibold">
                              💰 {formatTokenAmount(milestone.amount, 0)} VEG21 tokens
                            </Badge>
                          </div>
                        </div>
                        <div>
                          {milestone.claimed ? (
                            <Badge variant="default" className="bg-green-200 text-green-900 border-green-300 px-4 py-2 text-base font-semibold">
                              ✅ Reclamado
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => handleClaimReward(milestone.rewardId)}
                              disabled={claimingReward === milestone.rewardId || !mockWeb3.isInitialized}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-6 py-3 text-base font-bold"
                              size="lg"
                              data-testid={`claim-reward-${milestone.rewardId}`}
                            >
                              {claimingReward === milestone.rewardId ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                  Reclamando...
                                </>
                              ) : (
                                <>
                                  <Gift className="w-5 h-5 mr-2" />
                                  🎁 Reclamar Ahora
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* Compact Progress View - Enhanced */}
          {!expandedView && (
            <div className="grid grid-cols-7 gap-3 mb-4">
              {daysData.slice(0, 14).map((day) => {
                const isMilestone = currentMilestones.some(m => m.day === day.day);
                const milestoneData = currentMilestones.find(m => m.day === day.day);
                const isUnlockedMilestone = isMilestone && milestoneData?.unlocked;
                
                return (
                  <div
                    key={day.day}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-200 relative hover:scale-110 ${
                      getStatusStyle(day.status)
                    } ${isMilestone ? 'ring-3 ring-yellow-400 ring-offset-1' : ''} ${
                      isUnlockedMilestone ? 'shadow-lg shadow-yellow-400/50 animate-pulse' : ''
                    }`}
                    title={`Día ${day.day}: ${day.task}${isMilestone ? ` - 🎁 Hito: ${milestoneData?.amount} VEG21` : ''}`}
                  >
                    {day.status === 'completed' ? '✓' : day.day}
                    {isMilestone && (
                      <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
                        isUnlockedMilestone ? 'bg-gradient-to-br from-yellow-400 to-orange-500 animate-bounce' : 'bg-yellow-400'
                      }`}>
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {isUnlockedMilestone && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="text-xs font-bold text-yellow-600 bg-yellow-100 px-1 rounded">🎁</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Expanded Progress View */}
          {expandedView && (
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {daysData.map((day) => {
                const isMilestone = currentMilestones.some(m => m.day === day.day);
                const milestoneData = currentMilestones.find(m => m.day === day.day);
                
                return (
                  <div
                    key={day.day}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                      getStatusStyle(day.status)
                    } ${isMilestone ? 'ring-1 ring-yellow-400' : ''}`}
                  >
                    {getStatusIcon(day.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Día {day.day}</span>
                          {isMilestone && (
                            <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-700">
                              <Star className="w-3 h-3 mr-1" />
                              Hito
                            </Badge>
                          )}
                        </div>
                        {day.status === 'current' && (
                          <span className="text-xs bg-veg-primary text-white px-2 py-1 rounded-full">¡AHORA!</span>
                        )}
                      </div>
                      <p className="text-sm opacity-80">{day.task}</p>
                      {isMilestone && milestoneData && (
                        <p className="text-xs text-yellow-700 mt-1">
                          Recompensa: {formatTokenAmount(milestoneData.amount, 0)} VEG21 tokens
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Toggle View Button */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setExpandedView(!expandedView)}
              className="text-veg-primary hover:text-veg-secondary font-medium"
              data-testid="toggle-progress-view"
            >
              {expandedView ? 'Ver menos' : 'Ver progreso completo'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}