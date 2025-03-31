
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { PlayerProfile } from "@/types";
import { StatsPanel } from "@/components/profile/stats-panel";
import { Achievements } from "@/components/profile/achievements";
import { GameHistory } from "@/components/profile/game-history";
import { Button } from "@/components/ui/button";
import { Loader2, User, ChevronRight, Eye, EyeOff } from "lucide-react";
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
  
  const { data: profile, isLoading, refetch } = useQuery<PlayerProfile>({
    queryKey: ["/api/profile"],
    enabled: !!user,
    retry: false,
  });
  
  const navigateToLobby = () => {
    navigate("/");
  };
  
  const handleUsernameChange = async () => {
    const newUsername = prompt('أدخل اسم المستخدم الجديد');
    if (newUsername && newUsername.length >= 3) {
      try {
        const response = await fetch('/api/profile/username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: newUsername })
        });
        
        const data = await response.json();
        if (data.success) {
          alert('تم تغيير اسم المستخدم بنجاح!');
          refetch();
        } else {
          alert(data.message || 'حدث خطأ أثناء تغيير اسم المستخدم');
        }
      } catch (error) {
        alert('حدث خطأ في الاتصال');
      }
    } else if (newUsername) {
      alert('يجب أن يكون اسم المستخدم 3 أحرف على الأقل');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      
      try {
        const response = await fetch('/api/profile/avatar', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        if (data.success) {
          alert('تم تغيير الصورة بنجاح!');
          refetch();
        } else {
          alert(data.message || 'حدث خطأ أثناء تغيير الصورة');
        }
      } catch (error) {
        alert('حدث خطأ في الاتصال');
      }
    }
  };

  const handleGuestConversion = async () => {
    const username = prompt('أدخل اسم المستخدم الجديد (3 أحرف على الأقل)');
    if (username && username.length >= 3) {
      const password = prompt('أدخل كلمة المرور (6 أحرف على الأقل)');
      if (password && password.length >= 6) {
        try {
          const response = await fetch('/api/profile/convert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
          });
          
          const data = await response.json();
          if (data.success) {
            alert('تم تحويل حسابك بنجاح!');
            window.location.reload();
          } else {
            alert(data.message || 'حدث خطأ أثناء تحويل الحساب');
          }
        } catch (error) {
          alert('حدث خطأ في الاتصال');
        }
      } else {
        alert('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      }
    } else if (username) {
      alert('يجب أن يكون اسم المستخدم 3 أحرف على الأقل');
    }
  };
  
  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-deepBlack">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
      </div>
    );
  }

  const handleCoverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('coverPhoto', file);
      
      try {
        const response = await fetch('/api/profile/cover', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        if (data.success) {
          alert('تم تغيير صورة الغلاف بنجاح!');
          refetch();
        } else {
          alert(data.message || 'حدث خطأ أثناء تغيير صورة الغلاف');
        }
      } catch (error) {
        alert('حدث خطأ في الاتصال');
      }
    }
  };

  return (
    <div className="min-h-screen py-8 bg-deepBlack">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-slate/20 rounded-lg overflow-hidden border border-gold/10">
          {/* صورة الغلاف */}
          <div className="relative h-48 md:h-64 overflow-hidden">
            {profile.coverPhoto ? (
              <Image 
                src={profile.coverPhoto} 
                alt="صورة الغلاف" 
                className="w-full h-full object-cover"
                fallback={<div className="w-full h-full bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-center">
                  <span className="text-gold/50 text-sm">أضف صورة غلاف</span>
                </div>}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-center">
                <span className="text-gold/50 text-sm">أضف صورة غلاف</span>
              </div>
            )}
            
            {/* زر تغيير صورة الغلاف */}
            <label className="absolute cursor-pointer bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md hover:bg-black/70 transition-colors">
              <input 
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={handleCoverPhotoChange}
              />
              <span className="flex items-center text-xs font-tajawal">
                <i className="fas fa-camera ml-1"></i>
                تغيير صورة الغلاف
              </span>
            </label>
          </div>
          
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
                    <div className="relative group">
                      <div className="w-24 h-24 bg-gold/20 rounded-full overflow-hidden border-4 border-gold/30 mb-4">
                        {profile.avatar ? (
                          <Image 
                            src={profile.avatar} 
                            alt={profile.username} 
                            className="w-full h-full object-cover"
                            fallback={<div className="w-full h-full flex items-center justify-center bg-slate-800">
                              <User className="h-12 w-12 text-gold/70" />
                            </div>}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800">
                            <User className="h-12 w-12 text-gold/70" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer">
                            <input 
                              type="file" 
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarChange}
                            />
                            <span className="text-white text-sm">تغيير الصورة</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white font-cairo">{profile.username}</h3>
                      <button 
                        onClick={handleUsernameChange}
                        className="text-gold/70 hover:text-gold"
                      >
                        <i className="fas fa-edit text-sm"></i>
                      </button>
                    </div>
                    
                    {profile.username.startsWith('ضيف_') && (
                      <button
                        onClick={handleGuestConversion}
                        className="bg-gradient-to-br from-gold to-darkGold text-deepBlack font-bold py-2 px-4 rounded-md hover:from-lightGold hover:to-gold transition-all mt-2"
                      >
                        تحويل إلى حساب دائم
                      </button>
                    )}
                    
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
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>شراء رقائق</DialogTitle>
                          <DialogDescription>
                            قريباً...
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div className="mt-6">
                  <StatsPanel stats={profile.stats} />
                </div>
              </div>
              
              <div className="md:w-2/3 md:pl-6">
                <Achievements achievements={profile.stats.achievements} />
                <GameHistory history={profile.gameHistory} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
