import { useState } from "react";
import { Calendar, RefreshCw, Gift, Heart, Trophy, Coins, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMockWeb3 } from "@/hooks/use-mock-web3";
import { formatTokenAmount, formatTxHash, mockWeb3Service, MockTransaction } from "@/lib/mockWeb3";

interface TransactionWithType {
  id: string;
  type: 'reward_claimed' | 'donation_made' | 'challenge_joined' | 'staking' | 'unstaking';
  amount: number;
  description: string;
  timestamp: Date;
  txHash: string;
  metadata?: {
    charityName?: string;
    challengeName?: string;
    rewardType?: string;
  };
}

export function UserActivity() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mockWeb3 = useMockWeb3();

  // Combine all transaction types into a unified feed
  const getAllTransactions = (): TransactionWithType[] => {
    const transactions: TransactionWithType[] = [];
    
    // Add contribution/donation transactions
    mockWeb3.contributions.forEach(contribution => {
      transactions.push({
        id: `donation-${contribution.id}`,
        type: 'donation_made',
        amount: contribution.amount,
        description: `Donación a organización benéfica`,
        timestamp: contribution.timestamp,
        txHash: contribution.txHash,
        metadata: {
          charityName: getCharityName(contribution.charityId)
        }
      });
    });

    // Add all mock Web3 transactions (rewards, staking, etc.)
    const allMockTransactions = mockWeb3Service.getTransactions();
    allMockTransactions.forEach((transaction: MockTransaction) => {
      if (transaction.type === 'claim_reward') {
        // Use transaction metadata for accurate description
        const description = transaction.metadata?.description || 'Recompensa reclamada';
        
        transactions.push({
          id: `reward-${transaction.id}`,
          type: 'reward_claimed',
          amount: transaction.amount,
          description: description,
          timestamp: transaction.timestamp,
          txHash: transaction.txHash,
          metadata: {
            rewardType: description,
            rewardId: transaction.metadata?.rewardId
          }
        });
      } else if (transaction.type === 'stake_tokens') {
        const description = transaction.metadata?.description || 'Tokens apostados para ganar recompensas';
        
        transactions.push({
          id: `stake-${transaction.id}`,
          type: 'staking',
          amount: transaction.amount,
          description: description,
          timestamp: transaction.timestamp,
          txHash: transaction.txHash,
          metadata: {
            stakeId: transaction.metadata?.stakeId
          }
        });
      } else if (transaction.type === 'unstake_tokens') {
        const description = transaction.metadata?.description || 'Tokens retirados con recompensas incluidas';
        
        transactions.push({
          id: `unstake-${transaction.id}`,
          type: 'unstaking',
          amount: transaction.amount,
          description: description,
          timestamp: transaction.timestamp,
          txHash: transaction.txHash,
          metadata: {
            stakeId: transaction.metadata?.stakeId
          }
        });
      } else if (transaction.type === 'contribute') {
        const charityName = getCharityName(transaction.metadata?.charityId || '');
        const description = `Donación a ${charityName}`;
        
        transactions.push({
          id: `donation-${transaction.id}`,
          type: 'donation_made',
          amount: transaction.amount,
          description: description,
          timestamp: transaction.timestamp,
          txHash: transaction.txHash,
          metadata: {
            charityId: transaction.metadata?.charityId,
            charityName: charityName
          }
        });
      }
    });

    // Sort by timestamp (newest first)
    return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const getCharityName = (charityId: string): string => {
    const charityNames: { [key: string]: string } = {
      '1': 'Santuario Esperanza Animal',
      '2': 'Centro de Rescate Silvestre', 
      '3': 'Rescate Marino Pacífico'
    };
    return charityNames[charityId] || 'Organización';
  };

  const getTransactionIcon = (type: TransactionWithType['type']) => {
    switch (type) {
      case 'reward_claimed':
        return <Gift className="w-5 h-5 text-yellow-600" />;
      case 'donation_made':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'challenge_joined':
        return <Trophy className="w-5 h-5 text-blue-600" />;
      case 'staking':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'unstaking':
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionBadge = (type: TransactionWithType['type']) => {
    switch (type) {
      case 'reward_claimed':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Recompensa Reclamada</Badge>;
      case 'donation_made':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Donación Realizada</Badge>;
      case 'challenge_joined':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Reto Unido</Badge>;
      case 'staking':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Tokens Apostados</Badge>;
      case 'unstaking':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Tokens Retirados</Badge>;
      default:
        return <Badge variant="secondary">Transacción</Badge>;
    }
  };

  const getAmountColor = (type: TransactionWithType['type']) => {
    switch (type) {
      case 'reward_claimed':
      case 'unstaking':
        return 'text-green-600'; // Positive/incoming
      case 'donation_made':
      case 'staking':
        return 'text-red-600'; // Negative/outgoing
      default:
        return 'text-gray-600';
    }
  };

  const getAmountPrefix = (type: TransactionWithType['type']) => {
    switch (type) {
      case 'reward_claimed':
      case 'unstaking':
        return '+';
      case 'donation_made':
      case 'staking':
        return '-';
      default:
        return '';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    mockWeb3.refreshState();
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const allTransactions = getAllTransactions();

  // Show message if not connected
  if (!mockWeb3.isInitialized) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50" data-testid="user-activity-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Conecta tu Wallet</h3>
            <p className="text-gray-600">Conecta tu wallet para ver tu historial de actividad VEG21</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50" data-testid="user-activity-section">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Mi Actividad VEG21</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Historial completo de tus transacciones, recompensas y contribuciones
          </p>
        </div>

        {/* Balance Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Saldo Actual</h3>
              <Coins className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{formatTokenAmount(mockWeb3.balance.veg21, 0)}</p>
            <p className="text-sm text-gray-600">VEG21 tokens</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Total Ganado</h3>
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{formatTokenAmount(mockWeb3.totalEarned, 0)}</p>
            <p className="text-sm text-gray-600">VEG21 tokens</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Total Donado</h3>
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-500">{formatTokenAmount(mockWeb3.totalContributed, 0)}</p>
            <p className="text-sm text-gray-600">VEG21 tokens</p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-blue-600" />
                Historial de Transacciones
              </h3>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                data-testid="refresh-activity-button"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>
          </div>

          <div className="p-6">
            {allTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">No hay actividad aún</h4>
                <p className="text-gray-600">
                  Cuando reclames recompensas o hagas donaciones, verás tu actividad aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {allTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    data-testid={`transaction-${transaction.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          {getTransactionBadge(transaction.type)}
                        </div>
                        {transaction.metadata?.charityName && (
                          <p className="text-sm text-gray-600 mb-1">{transaction.metadata.charityName}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            {transaction.timestamp.toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="font-mono">{formatTxHash(transaction.txHash)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getAmountColor(transaction.type)}`}>
                        {getAmountPrefix(transaction.type)}{formatTokenAmount(transaction.amount, 0)}
                      </p>
                      <p className="text-xs text-gray-500">VEG21</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}