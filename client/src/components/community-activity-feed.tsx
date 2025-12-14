import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy, 
  Heart, 
  Camera,
  ThumbsUp,
  Coins,
  TrendingUp
} from "lucide-react";
import { mockWeb3Service, MockTransaction } from "@/lib/mockWeb3";
import { getUserCheckIns, getAllCheckIns } from "@/components/daily-check-in";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface CommunityActivity {
  id: string;
  type: 'challenge_complete' | 'check_in' | 'validation' | 'donation' | 'reward_claim';
  userId: string;
  userName: string;
  amount?: number;
  description: string;
  timestamp: Date;
}

interface CommunityActivityFeedProps {
  maxHeight?: string;
  showTitle?: boolean;
  currentUserId?: string;
}

export function CommunityActivityFeed({ 
  maxHeight = "600px", 
  showTitle = true,
  currentUserId 
}: CommunityActivityFeedProps) {
  const [activities, setActivities] = useState<CommunityActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivities();

    // Refresh activities periodically
    const interval = setInterval(() => {
      loadActivities();
    }, 30000); // Every 30 seconds

    // Listen for new events
    const handleBalanceUpdate = () => {
      loadActivities();
    };

    mockWeb3Service.on('balance_updated', handleBalanceUpdate);
    mockWeb3Service.on('state_changed', handleBalanceUpdate);

    return () => {
      clearInterval(interval);
      mockWeb3Service.off('balance_updated', handleBalanceUpdate);
      mockWeb3Service.off('state_changed', handleBalanceUpdate);
    };
  }, []);

  const loadActivities = () => {
    try {
      const communityActivities: CommunityActivity[] = [];

      // Get all check-ins
      const checkIns = getAllCheckIns();
      checkIns.forEach((checkIn) => {
        const userName = localStorage.getItem('veg21_username') || `Usuario ${checkIn.userId.slice(-4)}`;
        
        communityActivities.push({
          id: checkIn.id,
          type: 'check_in',
          userId: checkIn.userId,
          userName,
          description: `completó el día ${checkIn.day} del desafío`,
          timestamp: new Date(checkIn.timestamp)
        });

        // Add validation activities for likes/approvals
        if (checkIn.likes > 0 && checkIn.likedBy.length > 0) {
          const lastLiker = checkIn.likedBy[checkIn.likedBy.length - 1];
          communityActivities.push({
            id: `${checkIn.id}_like`,
            type: 'validation',
            userId: lastLiker,
            userName: `Usuario ${lastLiker.slice(-4)}`,
            description: `validó el check-in de ${userName}`,
            timestamp: new Date(checkIn.timestamp)
          });
        }
      });

      // Get transactions
      const transactions = mockWeb3Service.getAllTransactions();
      
      transactions.forEach((tx) => {
        let activity: CommunityActivity | null = null;
        const userName = localStorage.getItem('veg21_username') || `Usuario ${tx.txHash.slice(-4)}`;

        switch (tx.type) {
          case 'claim_reward':
            activity = {
              id: tx.id,
              type: 'reward_claim',
              userId: tx.txHash.slice(-8),
              userName,
              amount: tx.amount,
              description: `reclamó ${tx.amount} VEG21 tokens`,
              timestamp: new Date(tx.timestamp)
            };
            break;

          case 'contribute':
            activity = {
              id: tx.id,
              type: 'donation',
              userId: tx.txHash.slice(-8),
              userName,
              amount: tx.amount,
              description: `donó ${tx.amount} VEG21 tokens`,
              timestamp: new Date(tx.timestamp)
            };
            break;

          case 'send':
          case 'transfer':
            if (tx.to) {
              const recipientShort = tx.to.slice(0, 6) + '...' + tx.to.slice(-4);
              activity = {
                id: tx.id,
                type: 'reward_claim',
                userId: tx.txHash.slice(-8),
                userName,
                amount: tx.amount,
                description: `envió ${tx.amount} VEG21 tokens a ${recipientShort}`,
                timestamp: new Date(tx.timestamp)
              };
            }
            break;

          case 'receive':
            if (tx.from) {
              const senderShort = tx.from.slice(0, 6) + '...' + tx.from.slice(-4);
              activity = {
                id: tx.id,
                type: 'reward_claim',
                userId: tx.txHash.slice(-8),
                userName,
                amount: tx.amount,
                description: `recibió ${tx.amount} VEG21 tokens de ${senderShort}`,
                timestamp: new Date(tx.timestamp)
              };
            }
            break;
        }

        if (activity) {
          communityActivities.push(activity);
        }
      });

      // Check for challenge completions
      const challengeProgress = localStorage.getItem('veg21_challenge_progress');
      if (challengeProgress) {
        try {
          const progress = JSON.parse(challengeProgress);
          if (progress.progress?.completedDays?.length === 21) {
            const userName = localStorage.getItem('veg21_username') || 'Un usuario';
            communityActivities.push({
              id: 'challenge_complete',
              type: 'challenge_complete',
              userId: currentUserId || 'demo',
              userName,
              amount: 50,
              description: `completó el desafío de 21 días y ganó 50 VEG21 tokens`,
              timestamp: new Date(progress.progress.lastCheckInDate || Date.now())
            });
          }
        } catch (error) {
          console.error('Error parsing challenge progress:', error);
        }
      }

      // Sort by most recent first
      const sorted = communityActivities.sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      );

      // Limit to most recent 50 activities
      setActivities(sorted.slice(0, 50));
    } catch (error) {
      console.error('Failed to load community activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: CommunityActivity['type']) => {
    switch (type) {
      case 'challenge_complete':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'check_in':
        return <Camera className="w-5 h-5 text-veg-primary" />;
      case 'validation':
        return <ThumbsUp className="w-5 h-5 text-blue-500" />;
      case 'donation':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'reward_claim':
        return <Coins className="w-5 h-5 text-green-500" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: CommunityActivity['type']) => {
    switch (type) {
      case 'challenge_complete':
        return 'bg-yellow-100';
      case 'check_in':
        return 'bg-green-100';
      case 'validation':
        return 'bg-blue-100';
      case 'donation':
        return 'bg-red-100';
      case 'reward_claim':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getUserInitials = (userName: string) => {
    const parts = userName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Actividad de la Comunidad</CardTitle>
            <CardDescription>Cargando actividades...</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-veg-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-community-activity">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Actividad de la Comunidad</span>
            <Badge variant="secondary" data-testid="badge-activity-count">
              {activities.length} actividades
            </Badge>
          </CardTitle>
          <CardDescription>
            Últimas acciones de la comunidad VEG21
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="text-4xl mb-3">🌿</div>
            <p className="text-gray-600 font-medium">¡Todo listo para comenzar!</p>
            <p className="text-sm text-gray-500 mt-2">
              Completa un día del desafío, reclama recompensas o comparte contenido para ver tu actividad aquí. ¡Cada pequeño paso cuenta! 🚀
            </p>
          </div>
        ) : (
          <ScrollArea style={{ maxHeight }} className="w-full">
            <div className="divide-y divide-gray-100">
              {activities.map((activity, index) => {
                const isCurrentUser = activity.userId === currentUserId;
                
                return (
                  <div
                    key={activity.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                    data-testid={`activity-item-${index}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className={getActivityColor(activity.type)}>
                            {getUserInitials(activity.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900" data-testid={`activity-description-${index}`}>
                          <span className="font-semibold">
                            {activity.userName}
                            {isCurrentUser && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Tú
                              </Badge>
                            )}
                          </span>{' '}
                          {activity.description}
                        </p>
                        
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500" data-testid={`activity-time-${index}`}>
                            {formatDistanceToNow(activity.timestamp, { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                          
                          {activity.amount && (
                            <Badge 
                              variant="outline" 
                              className="text-xs border-veg-primary text-veg-primary"
                              data-testid={`activity-amount-${index}`}
                            >
                              +{activity.amount} VEG21
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
