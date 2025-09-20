import { useState, useEffect } from "react";
import { Trophy, Medal, Crown, TrendingUp, Coins, Heart, DollarSign, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useWallet } from "@/hooks/use-wallet";
import { formatTokenAmount } from "@/lib/mockWeb3";
import { Link } from "wouter";

interface LeaderboardUser {
  id: string;
  username: string;
  address: string;
  tokensEarned: number;
  tokensDonated: number;
  stakingRewards: number;
  totalScore: number;
  isCurrentUser?: boolean;
}

interface GlobalImpactStats {
  totalRewardsDistributed: number;
  totalTokensDonated: number;
  totalTokensStaked: number;
  totalUsers: number;
  lastUpdated: Date;
}

// Storage key for leaderboard persistence
const LEADERBOARD_STORAGE_KEY = 'veg21_leaderboard_data';
const IMPACT_STATS_STORAGE_KEY = 'veg21_global_impact_stats';

export default function Leaderboard() {
  const { isConnected, mockWeb3, formattedAddress } = useWallet();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalImpactStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  // Generate mock users for global leaderboard
  const generateMockUsers = (): LeaderboardUser[] => {
    const mockUsers: Omit<LeaderboardUser, 'totalScore'>[] = [
      {
        id: 'user1',
        username: 'EcoWarrior2024',
        address: '0x742d35Cc6C6C3C69D4321e9c1B2A6e3B5F8C9D1a',
        tokensEarned: 2847,
        tokensDonated: 892,
        stakingRewards: 156
      },
      {
        id: 'user2', 
        username: 'VeganChampion',
        address: '0x89abcdef12345678901234567890abcdef123456',
        tokensEarned: 2634,
        tokensDonated: 756,
        stakingRewards: 143
      },
      {
        id: 'user3',
        username: 'PlantPowerMX',
        address: '0x234567890abcdef1234567890abcdef1234567890',
        tokensEarned: 2391,
        tokensDonated: 634,
        stakingRewards: 127
      },
      {
        id: 'user4',
        username: 'GreenChef_Buenos',
        address: '0x345678901234567890abcdef1234567890abcdef',
        tokensEarned: 2156,
        tokensDonated: 543,
        stakingRewards: 98
      },
      {
        id: 'user5',
        username: 'SustainableSoul',
        address: '0x456789012345678901234567890abcdef123456789',
        tokensEarned: 1934,
        tokensDonated: 487,
        stakingRewards: 89
      },
      {
        id: 'user6',
        username: 'EcoFriendly_Lima',
        address: '0x567890123456789012345678901234567890abcdef',
        tokensEarned: 1823,
        tokensDonated: 432,
        stakingRewards: 76
      },
      {
        id: 'user7',
        username: 'VeggiePower',
        address: '0x678901234567890123456789012345678901234567',
        tokensEarned: 1687,
        tokensDonated: 389,
        stakingRewards: 67
      },
      {
        id: 'user8',
        username: 'AnimalProtector',
        address: '0x789012345678901234567890123456789012345678',
        tokensEarned: 1543,
        tokensDonated: 345,
        stakingRewards: 54
      }
    ];

    return mockUsers.map(user => ({
      ...user,
      totalScore: user.tokensEarned + user.tokensDonated + user.stakingRewards
    }));
  };

  // Create current user data from mockWeb3
  const createCurrentUserData = (): LeaderboardUser | null => {
    if (!isConnected || !mockWeb3.isInitialized) return null;

    const currentUser: LeaderboardUser = {
      id: 'current',
      username: 'Tú',
      address: formattedAddress || 'Tu Wallet',
      tokensEarned: mockWeb3.totalEarned,
      tokensDonated: mockWeb3.totalContributed,
      stakingRewards: mockWeb3.totalStakingRewards,
      totalScore: mockWeb3.totalEarned + mockWeb3.totalContributed + mockWeb3.totalStakingRewards,
      isCurrentUser: true
    };

    return currentUser;
  };

  // Calculate global impact statistics
  const calculateGlobalStats = (users: LeaderboardUser[]): GlobalImpactStats => {
    const totalRewardsDistributed = users.reduce((sum, user) => sum + user.tokensEarned, 0);
    const totalTokensDonated = users.reduce((sum, user) => sum + user.tokensDonated, 0);
    const totalTokensStaked = users.reduce((sum, user) => sum + user.stakingRewards, 0) * 20; // Estimate based on rewards

    return {
      totalRewardsDistributed,
      totalTokensDonated,
      totalTokensStaked,
      totalUsers: users.length,
      lastUpdated: new Date()
    };
  };

  // Load data from localStorage
  const loadPersistedData = () => {
    try {
      const storedLeaderboard = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      const storedStats = localStorage.getItem(IMPACT_STATS_STORAGE_KEY);

      if (storedLeaderboard) {
        const parsed = JSON.parse(storedLeaderboard);
        return {
          leaderboard: parsed.map((user: any) => ({
            ...user,
            // Don't load current user from storage, always use fresh data
            ...(user.isCurrentUser ? createCurrentUserData() : {})
          })),
          stats: storedStats ? {
            ...JSON.parse(storedStats),
            lastUpdated: new Date(JSON.parse(storedStats).lastUpdated)
          } : null
        };
      }
    } catch (error) {
      console.warn('Failed to load persisted leaderboard data:', error);
    }

    return { leaderboard: null, stats: null };
  };

  // Save data to localStorage
  const persistData = (users: LeaderboardUser[], stats: GlobalImpactStats) => {
    try {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(users));
      localStorage.setItem(IMPACT_STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.warn('Failed to persist leaderboard data:', error);
    }
  };

  // Update leaderboard data
  const updateLeaderboardData = () => {
    const mockUsers = generateMockUsers();
    const currentUser = createCurrentUserData();
    
    let allUsers = [...mockUsers];
    if (currentUser) {
      allUsers.push(currentUser);
    }

    // Sort by total score (highest first)
    allUsers.sort((a, b) => b.totalScore - a.totalScore);

    // Add rank information and find current user rank
    const rankedUsers = allUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    if (currentUser) {
      const userRank = rankedUsers.findIndex(user => user.isCurrentUser);
      setCurrentUserRank(userRank >= 0 ? userRank + 1 : null);
    }

    const stats = calculateGlobalStats(rankedUsers);

    setLeaderboardData(rankedUsers);
    setGlobalStats(stats);
    persistData(rankedUsers, stats);
  };

  // Initialize data on component mount
  useEffect(() => {
    const { leaderboard, stats } = loadPersistedData();
    
    if (leaderboard && stats) {
      setLeaderboardData(leaderboard);
      setGlobalStats(stats);
      
      // Find current user rank
      if (isConnected) {
        const userRank = leaderboard.findIndex((user: LeaderboardUser) => user.isCurrentUser);
        setCurrentUserRank(userRank >= 0 ? userRank + 1 : null);
      }
    } else {
      updateLeaderboardData();
    }
  }, [isConnected, mockWeb3.isInitialized]);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    updateLeaderboardData();
    setIsRefreshing(false);
  };

  // Get rank icon/medal
  const getRankIcon = (rank: number, isCurrentUser?: boolean) => {
    const baseClasses = "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold";
    
    if (rank === 1) {
      return (
        <div className={`${baseClasses} bg-gradient-to-br from-yellow-400 to-yellow-600`}>
          <Crown className="w-5 h-5" />
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className={`${baseClasses} bg-gradient-to-br from-gray-400 to-gray-600`}>
          <Medal className="w-5 h-5" />
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className={`${baseClasses} bg-gradient-to-br from-amber-600 to-amber-800`}>
          <Medal className="w-5 h-5" />
        </div>
      );
    } else {
      return (
        <div className={`${baseClasses} ${isCurrentUser ? 'bg-gradient-to-br from-veg-primary to-veg-secondary' : 'bg-gradient-to-br from-gray-500 to-gray-700'}`}>
          {rank}
        </div>
      );
    }
  };

  // Get rank badge
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">🏆 Campeón</Badge>;
    if (rank === 2) return <Badge className="bg-gray-100 text-gray-800 border-gray-300">🥈 Subcampeón</Badge>;
    if (rank === 3) return <Badge className="bg-amber-100 text-amber-800 border-amber-300">🥉 Tercer Lugar</Badge>;
    if (rank <= 10) return <Badge className="bg-blue-100 text-blue-800 border-blue-300">⭐ Top 10</Badge>;
    return null;
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-green-50">
        <div className="max-w-7xl mx-auto">
          {/* Back to Home Button */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="text-veg-primary hover:text-veg-secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
          </div>

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-veg-dark mb-4">🏆 Leaderboard Global VEG21</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Descubre a los líderes de la comunidad VEG21 que están creando el mayor impacto positivo en el planeta.
            </p>
          </div>

          {/* Global Impact Statistics */}
          {globalStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-veg-dark">
                    {formatTokenAmount(globalStats.totalRewardsDistributed, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Tokens Distribuidos en Recompensas</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-red-500" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-veg-dark">
                    {formatTokenAmount(globalStats.totalTokensDonated, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Tokens Donados a Comunidad</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-veg-dark">
                    {formatTokenAmount(globalStats.totalTokensStaked, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Tokens en Staking</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Coins className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-veg-dark">{globalStats.totalUsers}</p>
                  <p className="text-sm text-gray-600">Usuarios Activos</p>
                </div>
              </div>
            </div>
          )}

          {/* Current User Ranking Highlight */}
          {isConnected && currentUserRank && (
            <div className="bg-gradient-to-r from-veg-primary to-veg-secondary rounded-2xl p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Tu Posición Actual</h3>
                  <p className="text-green-100">¡Sigue así! Cada acción cuenta para un mundo más sostenible.</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">#{currentUserRank}</div>
                  <p className="text-green-100 text-sm">de {globalStats?.totalUsers} usuarios</p>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-veg-primary/5 to-veg-secondary/5 border-b border-green-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-veg-dark flex items-center">
                  <Trophy className="w-6 h-6 text-veg-primary mr-3" />
                  Ranking Global de Impacto
                </h2>
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  className="border-veg-primary text-veg-primary hover:bg-veg-primary hover:text-white"
                  data-testid="button-refresh-leaderboard"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Posición</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Usuario</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Tokens Ganados</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Tokens Donados</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Recompensas Staking</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Puntuación Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaderboardData.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 transition-colors duration-200 ${
                        user.isCurrentUser ? 'bg-veg-primary/5 border-l-4 border-veg-primary' : ''
                      }`}
                      data-testid={`leaderboard-row-${user.id}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {getRankIcon(index + 1, user.isCurrentUser)}
                          {getRankBadge(index + 1)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className={`font-semibold ${user.isCurrentUser ? 'text-veg-primary' : 'text-gray-900'}`}>
                            {user.username}
                            {user.isCurrentUser && (
                              <Badge variant="secondary" className="ml-2 bg-veg-primary/10 text-veg-primary border-veg-primary/20">
                                Tú
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 font-mono">{user.address}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold text-gray-900">
                            {formatTokenAmount(user.tokensEarned, 0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="font-semibold text-gray-900">
                            {formatTokenAmount(user.tokensDonated, 0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="font-semibold text-gray-900">
                            {formatTokenAmount(user.stakingRewards, 0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-lg font-bold text-veg-primary">
                          {formatTokenAmount(user.totalScore, 0)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Last Updated Info */}
          {globalStats && (
            <div className="text-center mt-8 text-sm text-gray-500">
              Última actualización: {globalStats.lastUpdated.toLocaleString('es-ES')}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}