import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trophy, 
  Heart, 
  Lock, 
  Unlock,
  Camera,
  ThumbsUp,
  ExternalLink
} from "lucide-react";
import { mockWeb3Service, MockTransaction, formatTokenAmount, formatTxHash } from "@/lib/mockWeb3";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface TransactionHistoryProps {
  maxHeight?: string;
  showTitle?: boolean;
}

export function TransactionHistory({ maxHeight = "500px", showTitle = true }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();

    // Listen for balance updates to refresh transactions
    const handleBalanceUpdate = () => {
      loadTransactions();
    };

    mockWeb3Service.on('balance_updated', handleBalanceUpdate);
    mockWeb3Service.on('state_changed', handleBalanceUpdate);

    return () => {
      mockWeb3Service.off('balance_updated', handleBalanceUpdate);
      mockWeb3Service.off('state_changed', handleBalanceUpdate);
    };
  }, []);

  const loadTransactions = () => {
    try {
      const txs = mockWeb3Service.getAllTransactions();
      // Sort by most recent first
      const sorted = txs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setTransactions(sorted);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: MockTransaction['type']) => {
    switch (type) {
      case 'claim_reward':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'contribute':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'transfer':
        return <ArrowUpRight className="w-5 h-5 text-orange-500" />;
      case 'receive':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'stake_tokens':
        return <Lock className="w-5 h-5 text-blue-500" />;
      case 'unstake_tokens':
        return <Unlock className="w-5 h-5 text-purple-500" />;
      case 'check_in':
        return <Camera className="w-5 h-5 text-veg-primary" />;
      case 'validation':
        return <ThumbsUp className="w-5 h-5 text-veg-secondary" />;
      default:
        return <ArrowDownLeft className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionTypeLabel = (type: MockTransaction['type']) => {
    const labels: Record<MockTransaction['type'], string> = {
      claim_reward: 'Recompensa Reclamada',
      contribute: 'Donación',
      transfer: 'Transferencia Enviada',
      receive: 'Tokens Recibidos',
      stake_tokens: 'Tokens Apostados',
      unstake_tokens: 'Tokens Retirados',
      check_in: 'Check-in Diario',
      validation: 'Validación Comunitaria'
    };
    return labels[type] || type;
  };

  const getTransactionColor = (type: MockTransaction['type']) => {
    switch (type) {
      case 'claim_reward':
      case 'receive':
      case 'unstake_tokens':
        return 'text-green-600';
      case 'contribute':
      case 'transfer':
      case 'stake_tokens':
        return 'text-red-600';
      case 'check_in':
      case 'validation':
        return 'text-veg-primary';
      default:
        return 'text-gray-600';
    }
  };

  const getAmountPrefix = (type: MockTransaction['type']) => {
    switch (type) {
      case 'claim_reward':
      case 'receive':
      case 'unstake_tokens':
        return '+';
      case 'contribute':
      case 'transfer':
      case 'stake_tokens':
        return '-';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Historial de Transacciones</CardTitle>
            <CardDescription>Cargando transacciones...</CardDescription>
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

  if (transactions.length === 0) {
    return (
      <Card data-testid="card-transaction-history">
        {showTitle && (
          <CardHeader>
            <CardTitle>Historial de Transacciones</CardTitle>
            <CardDescription>Todas tus actividades de tokens VEG21</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay transacciones aún</p>
            <p className="text-sm text-gray-400 mt-2">
              Comienza reclamando recompensas o participando en la comunidad
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-transaction-history">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Historial de Transacciones</span>
            <Badge variant="secondary" data-testid="badge-tx-count">
              {transactions.length} transacciones
            </Badge>
          </CardTitle>
          <CardDescription>Todas tus actividades de tokens VEG21</CardDescription>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }} className="w-full">
          <div className="divide-y divide-gray-100">
            {transactions.map((tx, index) => (
              <div
                key={tx.id}
                className="p-4 hover:bg-gray-50 transition-colors"
                data-testid={`transaction-item-${index}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900" data-testid={`tx-type-${index}`}>
                          {getTransactionTypeLabel(tx.type)}
                        </h4>
                        <span className={`font-bold ${getTransactionColor(tx.type)}`} data-testid={`tx-amount-${index}`}>
                          {getAmountPrefix(tx.type)}{formatTokenAmount(tx.amount)} VEG21
                        </span>
                      </div>
                      
                      {tx.metadata?.description && (
                        <p className="text-sm text-gray-600 mb-2" data-testid={`tx-description-${index}`}>
                          {tx.metadata.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span data-testid={`tx-time-${index}`}>
                            {formatDistanceToNow(new Date(tx.timestamp), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                          <Badge 
                            variant={tx.status === 'confirmed' ? 'default' : 'secondary'}
                            className={tx.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                            data-testid={`tx-status-${index}`}
                          >
                            {tx.status === 'confirmed' ? 'Confirmada' : tx.status === 'pending' ? 'Pendiente' : 'Fallida'}
                          </Badge>
                        </div>
                        
                        <button
                          className="flex items-center space-x-1 hover:text-veg-primary transition-colors"
                          onClick={() => {
                            // In a real app, this would link to a blockchain explorer
                            navigator.clipboard.writeText(tx.txHash);
                          }}
                          title="Copiar hash de transacción"
                          data-testid={`button-copy-hash-${index}`}
                        >
                          <span className="font-mono">{formatTxHash(tx.txHash)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      {(tx.to || tx.from) && (
                        <div className="mt-2 text-xs text-gray-500">
                          {tx.to && (
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400">Para:</span>
                              <span className="font-mono" data-testid={`tx-to-${index}`}>
                                {tx.to.slice(0, 8)}...{tx.to.slice(-6)}
                              </span>
                            </div>
                          )}
                          {tx.from && (
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400">De:</span>
                              <span className="font-mono" data-testid={`tx-from-${index}`}>
                                {tx.from.slice(0, 8)}...{tx.from.slice(-6)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
