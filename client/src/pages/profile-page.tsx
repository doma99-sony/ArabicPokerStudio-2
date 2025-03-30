import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { PlayerProfile } from "@/types";
import { StatsPanel } from "@/components/profile/stats-panel";
import { Achievements } from "@/components/profile/achievements";
import { GameHistory } from "@/components/profile/game-history";
import { Button } from "@/components/ui/button";
import { Loader2, User, ChevronRight } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function ProfilePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Fetch player profile with stats
  const { data: profile, isLoading } = useQuery<PlayerProfile>({
    queryKey: ["/api/profile"],
  });
  
  // Navigate back to lobby
  const navigateToLobby = () => {
    navigate("/");
  };
  
  // If loading, show loading indicator
  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-deepBlack">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-deepBlack">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-slate/20 rounded-lg overflow-hidden border border-gold/10">
          <div className="p-6 md:p-8">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={navigateToLobby}
                className="text-gold hover:text-gold/80 p-2 mr-2"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <h2 className="text-3xl font-bold text-gold font-cairo">الملف الشخصي</h2>
            </div>
            
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 mb-6 md:mb-0">
                <div className="bg-deepBlack p-4 rounded-lg border border-gold/20">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-gold/20 rounded-full overflow-hidden border-4 border-gold/30 mb-4">
                      {profile.avatar ? (
                        <Image 
                          src={profile.avatar} 
                          alt={profile.username} 
                          className="w-full h-full object-cover"
                          fallback="https://via.placeholder.com/150?text=User"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <User className="h-12 w-12 text-gold/70" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1 font-cairo">{profile.username}</h3>
                    <p className="text-gold/80 text-sm mb-3 font-tajawal">عضو منذ {profile.stats.joinDate}</p>
                    
                    <div className="w-full bg-pokerGreen rounded-full px-4 py-2 flex items-center justify-center mb-4">
                      <i className="fas fa-coins text-gold ml-2"></i>
                      <span className="text-gold font-bold font-roboto">{profile.chips?.toLocaleString() || 0}</span>
                    </div>
                    
                    <Button className="w-full bg-gold hover:bg-darkGold text-deepBlack font-bold py-2 rounded-md transition-colors font-cairo">
                      شراء رقائق
                    </Button>
                  </div>
                  
                  <Achievements achievements={profile.stats.achievements} />
                </div>
              </div>
              
              <div className="md:w-2/3 md:pr-8">
                <StatsPanel stats={profile.stats} />
                <GameHistory history={profile.gameHistory} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
