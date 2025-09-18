import { useState } from "react";
import { CheckCircle, Circle, Calendar, Target, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DayStatus {
  day: number;
  status: 'completed' | 'current' | 'upcoming';
  task?: string;
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
                <div>
                  <p className="font-semibold text-veg-dark">Día {currentDay} - ¡Hoy!</p>
                  <p className="text-sm text-gray-600">{dailyTasks[currentDay - 1]}</p>
                </div>
              </div>
            </div>
          )}

          {/* Compact Progress View */}
          {!expandedView && (
            <div className="grid grid-cols-7 gap-2 mb-4">
              {daysData.slice(0, 14).map((day) => (
                <div
                  key={day.day}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all duration-200 ${getStatusStyle(day.status)}`}
                  title={`Día ${day.day}: ${day.task}`}
                >
                  {day.status === 'completed' ? '✓' : day.day}
                </div>
              ))}
            </div>
          )}

          {/* Expanded Progress View */}
          {expandedView && (
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {daysData.map((day) => (
                <div
                  key={day.day}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${getStatusStyle(day.status)}`}
                >
                  {getStatusIcon(day.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Día {day.day}</span>
                      {day.status === 'current' && (
                        <span className="text-xs bg-veg-primary text-white px-2 py-1 rounded-full">¡AHORA!</span>
                      )}
                    </div>
                    <p className="text-sm opacity-80">{day.task}</p>
                  </div>
                </div>
              ))}
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