import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { PlayerProfile } from "@/types";
import { StatsPanel } from "@/components/profile/stats-panel";
import { Achievements } from "@/components/profile/achievements";
import { GameHistory } from "@/components/profile/game-history";
import { Button } from "@/components/ui/button";
import { Loader2, User, ChevronRight, Phone } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Fetch player profile with stats
  const { data: profile, isLoading } = useQuery<PlayerProfile>({
    queryKey: ["/api/profile"],
    // منع الاستعلامات المتكررة عند عدم تسجيل الدخول
    enabled: !!user,
    retry: false,
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
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-gold hover:bg-darkGold text-deepBlack font-bold py-2 rounded-md transition-colors font-cairo">
                          شراء رقائق
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-deepBlack border-gold/30 text-white">
                        <DialogHeader>
                          <DialogTitle className="text-gold text-2xl font-cairo text-center mb-2">شراء رقائق إضافية</DialogTitle>
                          <DialogDescription className="text-white/80 text-center font-tajawal">
                            للشحن والحصول على رقائق إضافية، يرجى التواصل مع فريق الدعم الخاص بنا
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="py-4">
                          <div className="bg-pokerGreen/30 p-4 rounded-lg border border-gold/20 mb-4">
                            <h3 className="text-gold text-lg font-cairo mb-2">للتواصل مع عرباوي:</h3>
                            <div className="flex items-center p-3 bg-black/40 rounded">
                              <div className="bg-green-600 p-2 rounded-full ml-3">
                                <i className="fab fa-whatsapp text-white text-xl"></i>
                              </div>
                              <div>
                                <p className="text-white font-tajawal">واتساب</p>
                                <p className="text-white font-roboto text-lg">01008508826</p>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-white/60 text-sm text-center font-tajawal">
                            سيتم إضافة الرقائق إلى حسابك فورًا بعد تأكيد عملية الدفع
                          </p>
                        </div>
                        
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button className="w-full bg-gold hover:bg-darkGold text-deepBlack font-bold py-2 rounded-md transition-colors font-cairo">
                              العودة
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
