import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getDefaultNetwork } from '@/config/chainConfig';

export function DemoModeBanner() {
  const network = getDefaultNetwork();
  const mode = import.meta.env.VITE_VEG21_MODE || 'demo';
  
  // Only show banner in demo/mock mode
  if (mode !== 'demo' && mode !== 'mock') {
    return null;
  }

  return (
    <Alert 
      className="border-purple-500 bg-purple-50 dark:bg-purple-950 dark:border-purple-700 mb-4"
      data-testid="banner-demo-mode"
    >
      <Info className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      <AlertTitle className="text-purple-900 dark:text-purple-100 font-semibold">
        🎮 Demo Mode — No On-Chain Transactions
      </AlertTitle>
      <AlertDescription className="text-purple-800 dark:text-purple-200">
        You're using VEG21 in demonstration mode. All transactions are simulated locally using localStorage. 
        No real blockchain interactions or gas fees. Connect a real wallet to interact with Celo blockchain.
        <div className="mt-2 text-sm text-purple-700 dark:text-purple-300">
          <strong>Current Network:</strong> {network.displayName} (Simulated)
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function NetworkModeBanner() {
  const network = getDefaultNetwork();
  const mode = import.meta.env.VITE_VEG21_MODE || 'demo';
  
  // Show testnet warning banner
  if (mode === 'celo-alfajores' || mode === 'celo-testnet') {
    return (
      <Alert 
        className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-700 mb-4"
        data-testid="banner-testnet-mode"
      >
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-900 dark:text-yellow-100 font-semibold">
          🧪 Testnet Mode — Celo Alfajores
        </AlertTitle>
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          Connected to {network.displayName}. Transactions use test CELO (no real value). 
          Get testnet tokens from <a href="https://faucet.celo.org" target="_blank" rel="noopener noreferrer" className="underline font-medium">faucet.celo.org</a>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Show mainnet live banner
  if (mode === 'celo-mainnet' || mode === 'celo') {
    return (
      <Alert 
        className="border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-700 mb-4"
        data-testid="banner-mainnet-mode"
      >
        <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-900 dark:text-green-100 font-semibold">
          🚀 Live on Celo Mainnet
        </AlertTitle>
        <AlertDescription className="text-green-800 dark:text-green-200">
          Connected to {network.displayName}. All transactions are real and cost gas fees. 
          Your VEG21 tokens have real value. Trade responsibly!
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
}
