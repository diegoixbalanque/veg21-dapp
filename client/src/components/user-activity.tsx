import { useState, useEffect } from 'react';
import { Calendar, Coins, Heart, Trophy, ArrowUpRight, ArrowDownLeft, Clock, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockWeb3Service, MockTransaction, formatTokenAmount, formatTxHash } from '@/lib/mockWeb3';
import { useMockWeb3 } from '@/hooks/use-mock-web3';

// Define activity types with Spanish descriptions
const ACTIVITY_TYPES = {
  claim_reward: {
    icon: Trophy,
    label: 'Recompensa Reclamada',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200'
  },
  contribute: {
    icon: Heart,
    label: 'Donación Realizada',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200'
  },
  transfer: {
    icon: ArrowUpRight,
    label: 'Transferencia',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200'
  }
} as const;

interface ActivityItemProps {
  transaction: MockTransaction;
}

function ActivityItem({ transaction }: ActivityItemProps) {
  const activityType = ACTIVITY_TYPES[transaction.type] || ACTIVITY_TYPES.transfer;
  const IconComponent = activityType.icon;
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: MockTransaction['status']) => {
    const statusConfig = {
      confirmed: { label: 'Confirmado', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pendiente', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'Fallido', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className={`${activityType.borderColor} border-l-4 hover:shadow-md transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={`${activityType.bgColor} p-3 rounded-full`}>
              <IconComponent className={`w-5 h-5 ${activityType.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activityType.label}
                </h3>
                {getStatusBadge(transaction.status)}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(transaction.timestamp)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="font-mono text-xs">{formatTxHash(transaction.txHash)}</span>
                </div>
              </div>
              
              <p className="text-gray-700">
                {transaction.type === 'claim_reward' && 'Has reclamado tokens VEG21 como recompensa por tu progreso.'}
                {transaction.type === 'contribute' && 'Has donado tokens VEG21 a una causa benéfica.'}
                {transaction.type === 'transfer' && 'Transferencia de tokens VEG21.'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              transaction.type === 'contribute' ? 'text-red-600' : 'text-green-600'
            }`}>
              {transaction.type === 'contribute' ? '-' : '+'}
              {formatTokenAmount(transaction.amount, 0)}
            </div>
            <div className="text-sm text-gray-500">VEG21</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingCardProps {}

function LoadingCard({}: LoadingCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse">
          <div className="flex items-start space-x-4">
            <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            No hay actividad aún
          </h3>
          <p className="text-gray-600 max-w-md">
            Cuando reclames recompensas o hagas donaciones, verás tu actividad aquí.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserActivity() {
  const { isInitialized, balance, totalEarned, totalContributed } = useMockWeb3();
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load transactions from mock service
  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 500));
      const allTransactions = mockWeb3Service.getTransactions();
      // Sort by timestamp, most recent first
      const sortedTransactions = allTransactions.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
      setTransactions(sortedTransactions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTransactions();
  };

  useEffect(() => {
    loadTransactions();

    // Listen for new transactions
    const handleStateChange = () => {
      loadTransactions();
    };

    mockWeb3Service.on('state_changed', handleStateChange);
    
    return () => {
      mockWeb3Service.off('state_changed', handleStateChange);
    };
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-veg-primary to-veg-secondary rounded-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Mi Actividad VEG21
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Historial completo de tus transacciones, recompensas y contribuciones
          </p>
        </div>

        {/* Stats Overview */}
        {isInitialized && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-100 to-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-800 flex items-center">
                  <Coins className="w-5 h-5 mr-2" />
                  Saldo Actual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">
                  {formatTokenAmount(balance.veg21, 0)}
                </div>
                <div className="text-green-600">VEG21 tokens</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-yellow-800 flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Total Ganado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-700">
                  {formatTokenAmount(totalEarned, 0)}
                </div>
                <div className="text-yellow-600">VEG21 tokens</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-100 to-red-50 border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-800 flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Total Donado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-700">
                  {formatTokenAmount(totalContributed, 0)}
                </div>
                <div className="text-red-600">VEG21 tokens</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Activity Feed Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Historial de Transacciones
          </h2>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
            className="flex items-center space-x-2"
            data-testid="button-refresh-activity"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </Button>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          {isLoading && (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          )}

          {!isLoading && transactions.length === 0 && <EmptyState />}

          {!isLoading && transactions.length > 0 && (
            <>
              {transactions.map((transaction, index) => (
                <div key={transaction.id}>
                  <ActivityItem transaction={transaction} />
                  {index < transactions.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Load More Button (if needed for pagination in the future) */}
        {!isLoading && transactions.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Mostrando {transactions.length} transacciones
            </p>
          </div>
        )}
      </div>
    </section>
  );
}