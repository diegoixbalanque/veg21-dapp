import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { ActiveChallenges } from "@/components/active-challenges";
import { UserActivity } from "@/components/user-activity";
import { CommunityFund } from "@/components/community-fund";
import { VeganImpactRanking } from "@/components/vegan-impact-ranking";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <ActiveChallenges />
      <UserActivity />
      <CommunityFund />
      <VeganImpactRanking />
      <Footer />
    </div>
  );
}
