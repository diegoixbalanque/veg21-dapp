import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";

interface DemoWalletButtonProps {
  className?: string;
}

export function DemoWalletButton({ className = "" }: DemoWalletButtonProps) {
  const { connectDemo, isConnecting } = useWallet();

  const handleDemoClick = async () => {
    try {
      await connectDemo();
    } catch (error) {
      console.error('Failed to connect demo wallet:', error);
    }
  };

  return (
    <Button 
      onClick={handleDemoClick}
      disabled={isConnecting}
      variant="outline"
      className={`bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-blue-100 hover:border-purple-300 transition-all duration-200 ${className}`}
      data-testid="button-demo-wallet"
    >
      <Play className="mr-2 h-4 w-4" />
      Usar Wallet de Prueba
    </Button>
  );
}