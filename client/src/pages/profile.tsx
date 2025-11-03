import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/header";
import { getUserChallenge, getChallengeProgress, updateChallengeProgress, Challenge } from "@/components/onboarding-modal";
import { 
  DailyCheckInModal, 
  CheckInList, 
  getUserCheckIns, 
  likeCheckIn, 
  approveCheckIn,
  type DailyCheckIn 
} from "@/components/daily-check-in";
import { TransactionHistory } from "@/components/transaction-history";
import { SendVEG21Modal } from "@/components/send-veg21-modal";
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Trophy, 
  Coins, 
  Heart, 
  Target,
  Calendar,
  Star,
  Award,
  CheckCircle,
  Clock,
  Wallet,
  Plus,
  Minus,
  Camera,
  ArrowUpRight,
  History
} from "lucide-react";
import { formatTokenAmount, mockWeb3Service } from "@/lib/mockWeb3";

const USERNAME_STORAGE_KEY = 'veg21_username';

interface UserStats {
  tokensEarned: number;
  challengesCompleted: number;
  tokensDonated: number;
  tokensStaked: number;
}

interface ChallengeProgressData {
  currentDay: number;
  completedDays: number[];
  isActive: boolean;
}

export default function Profile() {
  const { isConnected, mockWeb3, formattedAddress } = useWallet();
  const [username, setUsername] = useState<string>('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState<string>('');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgressData | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [showStakingDetails, setShowStakingDetails] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [userCheckIns, setUserCheckIns] = useState<DailyCheckIn[]>([]);
  const [refreshCheckIns, setRefreshCheckIns] = useState(0);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Update challenge progress when mockWeb3 data changes
  useEffect(() => {
    if (mockWeb3.isInitialized) {
      loadUserData();
    }
  }, [mockWeb3.isInitialized]);

  const loadUserData = () => {
    // Load username from localStorage
    try {
      const storedUsername = localStorage.getItem(USERNAME_STORAGE_KEY);
      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        // Default username based on address
        const defaultUsername = formattedAddress ? `User_${formattedAddress.slice(-4)}` : 'Usuario Vegano';
        setUsername(defaultUsername);
      }
    } catch (error) {
      console.error('Failed to load username:', error);
    }

    // Load challenge data
    const challenge = getUserChallenge();
    const progress = getChallengeProgress();
    
    setCurrentChallenge(challenge);
    setChallengeProgress(progress);

    // Load user check-ins
    if (formattedAddress) {
      const checkIns = getUserCheckIns(formattedAddress);
      setUserCheckIns(checkIns);
    }
  };

  // Reload check-ins when refreshCheckIns changes
  useEffect(() => {
    if (formattedAddress) {
      const checkIns = getUserCheckIns(formattedAddress);
      setUserCheckIns(checkIns);
    }
  }, [refreshCheckIns, formattedAddress]);

  // Check for challenge completion and award +50 token completion bonus
  useEffect(() => {
    if (challengeProgress && challengeProgress.completedDays.length === 21 && mockWeb3.isInitialized) {
      const completionBonusKey = 'veg21_completion_bonus_claimed';
      const alreadyClaimed = localStorage.getItem(completionBonusKey);
      
      if (!alreadyClaimed) {
        const completionBonus = 50;
        
        // Add completion bonus to localStorage-tracked earnings
        const bonusData = {
          amount: completionBonus,
          claimed: true,
          claimedAt: new Date().toISOString()
        };
        localStorage.setItem(completionBonusKey, JSON.stringify(bonusData));
        
        // Show success notification
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('show-completion-celebration', {
              detail: {
                message: `¡Felicidades! Has completado el desafío de 21 días vegano y ganado un bono de +${completionBonus} VEG21 tokens! 🎉`,
                tokens: completionBonus
              }
            });
            window.dispatchEvent(event);
          }
        }, 500);
        
        // Refresh user data
        setTimeout(() => loadUserData(), 1000);
      }
    }
  }, [challengeProgress?.completedDays.length, mockWeb3.isInitialized]);

  const saveUsername = () => {
    try {
      localStorage.setItem(USERNAME_STORAGE_KEY, tempUsername);
      setUsername(tempUsername);
      setEditingUsername(false);
    } catch (error) {
      console.error('Failed to save username:', error);
    }
  };

  const cancelEditUsername = () => {
    setTempUsername(username);
    setEditingUsername(false);
  };

  const startEditUsername = () => {
    setTempUsername(username);
    setEditingUsername(true);
  };

  const getUserStats = (): UserStats => {
    if (!mockWeb3.isInitialized) {
      return {
        tokensEarned: 0,
        challengesCompleted: 0,
        tokensDonated: 0,
        tokensStaked: 0
      };
    }

    // Include +50 completion bonus in total earned if claimed
    let totalEarned = mockWeb3.totalEarned;
    const completionBonusKey = 'veg21_completion_bonus_claimed';
    const bonusData = localStorage.getItem(completionBonusKey);
    if (bonusData) {
      try {
        const bonus = JSON.parse(bonusData);
        if (bonus.claimed && bonus.amount) {
          totalEarned += bonus.amount;
        }
      } catch (error) {
        console.error('Failed to parse completion bonus data:', error);
      }
    }

    return {
      tokensEarned: totalEarned,
      challengesCompleted: (challengeProgress?.completedDays?.length || 0) >= 21 ? 1 : 0,
      tokensDonated: mockWeb3.totalContributed,
      tokensStaked: mockWeb3.totalStaked
    };
  };

  const getProgressPercentage = (): number => {
    if (!challengeProgress || !challengeProgress.completedDays) return 0;
    return Math.round((challengeProgress.completedDays.length / 21) * 100);
  };

  const getMilestonesBadges = () => {
    if (!challengeProgress || !challengeProgress.completedDays) return [];
    
    const badges = [];
    const completedDays = challengeProgress.completedDays.length;
    
    if (completedDays >= 7) {
      badges.push({ 
        label: "Primera Semana", 
        icon: <Star className="w-4 h-4" />, 
        color: "bg-yellow-100 text-yellow-800" 
      });
    }
    
    if (completedDays >= 14) {
      badges.push({ 
        label: "Dos Semanas", 
        icon: <Award className="w-4 h-4" />, 
        color: "bg-orange-100 text-orange-800" 
      });
    }
    
    if (completedDays >= 21) {
      badges.push({ 
        label: "¡Desafío Completado!", 
        icon: <Trophy className="w-4 h-4" />, 
        color: "bg-green-100 text-green-800" 
      });
    }
    
    return badges;
  };

  const markDayCompleted = (day: number) => {
    if (challengeProgress && challengeProgress.completedDays && !challengeProgress.completedDays.includes(day)) {
      updateChallengeProgress(day, true);
      loadUserData(); // Refresh data
    }
  };

  const generateAvatar = (address: string | null): string => {
    if (!address) return '';
    // Simple avatar generation based on address
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const colorIndex = parseInt(address.slice(-1), 16) % colors.length;
    return colors[colorIndex];
  };

  const handleStakeTokens = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    
    setIsStaking(true);
    try {
      await mockWeb3.stakeTokens(parseFloat(stakeAmount));
      setStakeAmount('');
      // Refresh user data to show updated stats
      loadUserData();
    } catch (error: any) {
      console.error('Failed to stake tokens:', error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleOpenCheckIn = (day: number) => {
    setSelectedDay(day);
    setShowCheckInModal(true);
  };

  const handleCheckInComplete = (checkIn: DailyCheckIn) => {
    // Mark the day as completed
    if (challengeProgress && !challengeProgress.completedDays.includes(checkIn.day)) {
      updateChallengeProgress(checkIn.day, true);
    }
    // Refresh check-ins and challenge data
    setRefreshCheckIns(prev => prev + 1);
    loadUserData();
  };

  const handleLikeCheckIn = (checkInId: string) => {
    if (formattedAddress) {
      likeCheckIn(checkInId, formattedAddress);
      setRefreshCheckIns(prev => prev + 1);
    }
  };

  const handleApproveCheckIn = (checkInId: string) => {
    if (formattedAddress) {
      approveCheckIn(checkInId, formattedAddress);
      setRefreshCheckIns(prev => prev + 1);
    }
  };

  const userStats = getUserStats();
  const progressPercentage = getProgressPercentage();
  const milestones = getMilestonesBadges();
  const avatarColor = generateAvatar(formattedAddress);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Conecta tu wallet para ver tu perfil
            </h1>
            <p className="text-gray-600">
              Por favor conecta tu wallet para acceder a tu perfil y estadísticas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm" data-testid="card-profile-header">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="" />
                  <AvatarFallback className={`${avatarColor} text-white text-2xl font-bold`}>
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {editingUsername ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          className="max-w-xs"
                          data-testid="input-username"
                        />
                        <Button
                          size="sm"
                          onClick={saveUsername}
                          className="bg-veg-primary hover:bg-veg-secondary"
                          data-testid="button-save-username"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditUsername}
                          data-testid="button-cancel-username"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <h1 className="text-3xl font-bold text-gray-900" data-testid="text-username">
                          {username}
                        </h1>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={startEditUsername}
                          data-testid="button-edit-username"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mt-1" data-testid="text-wallet-address">
                    {formattedAddress}
                  </p>
                  
                  {/* Milestone Badges */}
                  {milestones.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3">
                      {milestones.map((milestone, index) => (
                        <Badge
                          key={index}
                          className={`${milestone.color} flex items-center space-x-1`}
                          data-testid={`badge-milestone-${index}`}
                        >
                          {milestone.icon}
                          <span>{milestone.label}</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Current Challenge */}
          {currentChallenge && challengeProgress && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm" data-testid="card-current-challenge">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-veg-primary" />
                  <span>Desafío Actual</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg" data-testid="text-challenge-title">
                      {currentChallenge.title}
                    </h3>
                    <p className="text-gray-600" data-testid="text-challenge-description">
                      {currentChallenge.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-veg-primary" data-testid="text-challenge-progress">
                      {challengeProgress.completedDays.length}/21
                    </div>
                    <div className="text-sm text-gray-600">días completados</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Progreso</Label>
                    <span className="text-sm font-medium" data-testid="text-progress-percentage">
                      {progressPercentage}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" data-testid="progress-challenge" />
                </div>

                {challengeProgress.isActive && challengeProgress.currentDay <= 21 && (
                  <div className="flex items-center justify-between bg-veg-primary/5 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-veg-primary" />
                      <span className="font-medium">Día {challengeProgress.currentDay}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleOpenCheckIn(challengeProgress.currentDay)}
                      className="bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary"
                      data-testid="button-daily-checkin"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Check-in Diario
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm" data-testid="card-tokens-earned">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  <span>Tokens Ganados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600" data-testid="text-tokens-earned">
                  {formatTokenAmount(userStats.tokensEarned, 0)}
                </div>
                <p className="text-gray-600 text-sm">VEG21 tokens</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm" data-testid="card-challenges-completed">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <span>Desafíos Completados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600" data-testid="text-challenges-completed">
                  {userStats.challengesCompleted}
                </div>
                <p className="text-gray-600 text-sm">de 21 días</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm" data-testid="card-tokens-donated">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Tokens Donados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500" data-testid="text-tokens-donated">
                  {formatTokenAmount(userStats.tokensDonated, 0)}
                </div>
                <p className="text-gray-600 text-sm">VEG21 donados</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm" data-testid="card-tokens-staked">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Tokens en Staking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600" data-testid="text-tokens-staked">
                  {formatTokenAmount(userStats.tokensStaked, 0)}
                </div>
                <p className="text-gray-600 text-sm">VEG21 en staking</p>
              </CardContent>
            </Card>
          </div>

          {/* Staking Section */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm" data-testid="card-staking-section">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-purple-600" />
                  <span>Gestión de Staking</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStakingDetails(!showStakingDetails)}
                  data-testid="button-toggle-staking-details"
                >
                  {showStakingDetails ? 'Ocultar' : 'Mostrar'} Detalles
                </Button>
              </CardTitle>
              <CardDescription>
                Apuesta tus tokens VEG21 para ganar recompensas (3.65% APY)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Staking Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Tokens Disponibles</div>
                  <div className="text-2xl font-bold text-purple-600" data-testid="text-available-balance">
                    {formatTokenAmount(mockWeb3.balance.veg21, 0)}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">En Staking</div>
                  <div className="text-2xl font-bold text-blue-600" data-testid="text-staked-amount">
                    {formatTokenAmount(userStats.tokensStaked, 0)}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">APY</div>
                  <div className="text-2xl font-bold text-green-600">3.65%</div>
                </div>
              </div>

              {/* Staking Actions */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Cantidad a apostar"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="flex-1"
                    min="0"
                    step="0.01"
                    data-testid="input-stake-amount"
                  />
                  <Button
                    onClick={handleStakeTokens}
                    disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || isStaking || !mockWeb3.isInitialized}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-stake-tokens"
                  >
                    {isStaking ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Apostando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Apostar
                      </>
                    )}
                  </Button>
                </div>

                {mockWeb3.balance.veg21 <= 0 && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                    No tienes tokens VEG21 disponibles para apostar. Completa desafíos para ganar tokens.
                  </div>
                )}
              </div>

              {/* Staking Details */}
              {showStakingDetails && (
                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-semibold text-gray-900">Información sobre Staking</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Modo Actual:</span>
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        HYBRID (Staking Real)
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Red:</span>
                      <span className="ml-2">Celo Test / VEG21 Beta</span>
                    </div>
                    <div>
                      <span className="font-medium">Recompensas:</span>
                      <span className="ml-2">3.65% APY (1% diario)</span>
                    </div>
                    <div>
                      <span className="font-medium">Retiros:</span>
                      <span className="ml-2">Disponible en cualquier momento</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    En modo HYBRID, el staking utiliza contratos inteligentes reales en la red de prueba de Celo,
                    mientras que otras funciones permanecen en modo simulado.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Check-ins Section */}
          {currentChallenge && challengeProgress && challengeProgress.isActive && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm" data-testid="card-check-ins">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-veg-primary" />
                  <span>Mis Check-ins Diarios</span>
                </CardTitle>
                <CardDescription>
                  Comparte tu progreso y gana validación de la comunidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CheckInList
                  checkIns={userCheckIns}
                  currentUserId={formattedAddress || ''}
                  onLike={handleLikeCheckIn}
                  onApprove={handleApproveCheckIn}
                />
              </CardContent>
            </Card>
          )}

          {/* Transaction History Section */}
          {isConnected && mockWeb3.isInitialized && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <History className="w-6 h-6 text-veg-primary" />
                  <span>Historial de Transacciones</span>
                </h3>
                <Button
                  onClick={() => setShowSendModal(true)}
                  className="bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary"
                  data-testid="button-send-veg21"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Enviar VEG21
                </Button>
              </div>
              <TransactionHistory maxHeight="400px" showTitle={false} />
            </div>
          )}

          {/* Empty State for New Users */}
          {!currentChallenge && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm text-center py-12" data-testid="card-no-challenge">
              <CardContent>
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  ¡Aún no tienes un desafío activo!
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Conecta tu wallet por primera vez para seleccionar tu primer desafío de 21 días
                  y comenzar a ganar tokens VEG21.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Daily Check-in Modal */}
      <DailyCheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        day={selectedDay}
        onCheckInComplete={handleCheckInComplete}
      />

      {/* Send VEG21 Modal */}
      <SendVEG21Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        currentBalance={mockWeb3.balance.veg21}
      />
    </div>
  );
}