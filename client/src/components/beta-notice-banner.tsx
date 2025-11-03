import { AlertCircle } from 'lucide-react';

export function BetaNoticeBanner() {
  return (
    <div 
      className="bg-yellow-50 border-b border-yellow-200 py-2 px-4"
      data-testid="banner-beta-notice"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-center">
          <AlertCircle className="h-4 w-4 text-yellow-700 flex-shrink-0" />
          <p className="text-sm text-yellow-900 font-medium">
            <span className="font-bold">⚠️ VEG21 Demo —</span> This version is a beta preview. Smart contract connection to Celo Mainnet coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
