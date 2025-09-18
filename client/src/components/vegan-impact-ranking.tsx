import { useState } from "react";
import { Trophy, Droplets, Leaf, Heart, Share2, UserPlus, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaderboardUser {
  rank: number;
  username: string;
  location: string;
  impactScore: number;
}

const leaderboard: LeaderboardUser[] = [
  { rank: 1, username: "@EcoWarrior2024", location: "Barcelona, España", impactScore: 2847 },
  { rank: 2, username: "@VeganMom_Madrid", location: "Madrid, España", impactScore: 2634 },
  { rank: 3, username: "@PlantPowerMX", location: "Ciudad de México, México", impactScore: 2391 },
  { rank: 4, username: "@GreenChef_Buenos", location: "Buenos Aires, Argentina", impactScore: 2156 },
  { rank: 5, username: "@SustainableSoul", location: "Lima, Perú", impactScore: 1934 },
];

export function VeganImpactRanking() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>(leaderboard);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-veg-primary to-veg-secondary";
    if (rank === 2) return "bg-gradient-to-br from-gray-400 to-gray-500";
    if (rank === 3) return "bg-gradient-to-br from-amber-400 to-amber-500";
    return "bg-gradient-to-br from-veg-secondary to-green-600";
  };

  // Loading skeleton for leaderboard
  const LoadingRow = () => (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-100">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
      <div className="text-right space-y-1">
        <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>
    </div>
  );

  // Error state for leaderboard
  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar el ranking</h3>
      <p className="text-gray-600 mb-6">No pudimos cargar la información del ranking. Por favor, intenta de nuevo.</p>
      <Button
        onClick={() => {
          setHasError(false);
          setIsLoading(true);
          setTimeout(() => setIsLoading(false), 1000);
        }}
        className="bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Intentar de Nuevo
      </Button>
    </div>
  );

  // Empty state for leaderboard
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-veg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trophy className="w-8 h-8 text-veg-accent" />
      </div>
      <h3 className="text-xl font-semibold text-veg-dark mb-2">¡Sé el primero en el ranking!</h3>
      <p className="text-gray-600">El ranking está vacío. ¡Únete a un desafío y comienza a ganar puntos de impacto!</p>
    </div>
  );

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white" data-testid="vegan-impact-ranking-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-veg-dark mb-4">Ranking de Impacto Vegano</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Descubre a los líderes de la comunidad VEG21 que están creando el mayor impacto positivo en el planeta.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-8 shadow-lg border border-green-100">
              <h3 className="text-2xl font-bold text-veg-dark mb-6 flex items-center">
                <Trophy className="text-veg-accent mr-3" />
                Top 10 Impacto Global
              </h3>
              
              <div className="space-y-4">
                {/* Loading State */}
                {isLoading && (
                  <>
                    <LoadingRow />
                    <LoadingRow />
                    <LoadingRow />
                    <LoadingRow />
                    <LoadingRow />
                  </>
                )}

                {/* Error State */}
                {hasError && !isLoading && <ErrorState />}

                {/* Empty State */}
                {!isLoading && !hasError && leaderboardData.length === 0 && <EmptyState />}

                {/* Normal Data Display */}
                {!isLoading && !hasError && leaderboardData.length > 0 && leaderboardData.map((user: LeaderboardUser) => (
                  <div key={user.rank} className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 ${getRankIcon(user.rank)} rounded-full flex items-center justify-center text-white font-bold`}>
                        {user.rank}
                      </div>
                      <div>
                        <p className="font-semibold text-veg-dark">{user.username}</p>
                        <p className="text-sm text-gray-600">{user.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-veg-primary">{user.impactScore.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">puntos de impacto</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Button variant="ghost" className="text-veg-primary hover:text-veg-secondary font-semibold">
                  Ver ranking completo <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            {/* Monthly Challenge Stats */}
            <div className="bg-gradient-to-br from-veg-primary to-veg-secondary rounded-2xl p-8 text-white shadow-lg">
              <h3 className="text-xl font-bold mb-4">Tu Progreso Mensual</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Retos completados:</span>
                  <span className="text-2xl font-bold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Tokens ganados:</span>
                  <span className="text-2xl font-bold">450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Posición actual:</span>
                  <span className="text-2xl font-bold">#47</span>
                </div>
              </div>
            </div>

            {/* Impact Statistics */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100">
              <h3 className="text-xl font-bold text-veg-dark mb-4">Impacto Ambiental</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Droplets className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Agua ahorrada</p>
                    <p className="font-bold text-veg-dark">1,247 L</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Leaf className="text-veg-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CO₂ no emitido</p>
                    <p className="font-bold text-veg-dark">89 kg</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Heart className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Animales ayudados</p>
                    <p className="font-bold text-veg-dark">23</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-8 shadow-lg border border-purple-100">
              <h3 className="text-xl font-bold text-veg-dark mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Button className="w-full bg-veg-accent text-white hover:bg-veg-accent/90 transition-all duration-200">
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir Progreso
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full border-veg-primary text-veg-primary hover:bg-veg-primary hover:text-white transition-all duration-200"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invitar Amigos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
