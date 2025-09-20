import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { ActiveChallenges } from "@/components/active-challenges";
import { UserActivity } from "@/components/user-activity";
import { CommunityFund } from "@/components/community-fund";
import { VeganImpactRanking } from "@/components/vegan-impact-ranking";
import { Footer } from "@/components/footer";
import { OnboardingModal, isOnboardingCompleted, Challenge } from "@/components/onboarding-modal";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if we should show onboarding when wallet connects
  useEffect(() => {
    if (isConnected && !isOnboardingCompleted()) {
      setShowOnboarding(true);
    }
  }, [isConnected]);

  const handleChallengeSelect = (challenge: Challenge) => {
    setShowOnboarding(false);
    
    toast({
      title: "¡Desafío seleccionado! 🌱",
      description: `Has elegido "${challenge.title}". ¡Comienza tu transformación hacia un estilo de vida más verde!`,
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <ActiveChallenges />
      <UserActivity />
      <CommunityFund />
      <VeganImpactRanking />
      <Footer />
      
      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onChallengeSelect={handleChallengeSelect} 
      />
    </div>
  );
}
