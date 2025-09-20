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
  Clock
} from "lucide-react";
import { formatTokenAmount } from "@/lib/mockWeb3";

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
  };

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

    return {
      tokensEarned: mockWeb3.totalEarned,
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
                      onClick={() => markDayCompleted(challengeProgress.currentDay)}
                      className="bg-veg-primary hover:bg-veg-secondary"
                      data-testid="button-mark-day-completed"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como completado
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
    </div>
  );
}