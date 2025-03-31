import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, CheckCircle, Clock, Award, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type MissionType = {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  total: number;
  completed: boolean;
  type: "daily" | "weekly" | "achievement";
  icon?: string;
};

export default function MissionsPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("daily");

  // المهمات اليومية
  const dailyMissions: MissionType[] = [
    {
      id: "mission_1",
      title: "خبير الدومينو",
      description: "العب 10 أدوار دومينو",
      reward: 100000,
      progress: 3,
      total: 10,
      completed: false,
      type: "daily",
      icon: "🎲"
    },
    {
      id: "mission_2",
      title: "جامع الثروات",
      description: "اجمع 2 مليون رقاقة في طاولات بوكر النوب",
      reward: 200000,
      progress: 750000,
      total: 2000000,
      completed: false,
      type: "daily",
      icon: "💰"
    },
    {
      id: "mission_3",
      title: "المشتري الذهبي",
      description: "قم بشراء أي شيء من المتجر بقيمة 100ج",
      reward: 500000,
      progress: 0,
      total: 100,
      completed: false,
      type: "daily",
      icon: "🛒"
    }
  ];

  // المهمات الأسبوعية
  const weeklyMissions: MissionType[] = [
    {
      id: "weekly_1",
      title: "سيد الطاولات",
      description: "فز في 15 لعبة بوكر",
      reward: 500000,
      progress: 4,
      total: 15,
      completed: false,
      type: "weekly",
      icon: "🏆"
    },
    {
      id: "weekly_2",
      title: "الفوز الكبير",
      description: "اربح 10 مليون رقاقة في لعبة واحدة",
      reward: 1000000,
      progress: 3000000,
      total: 10000000,
      completed: false,
      type: "weekly",
      icon: "💎"
    },
    {
      id: "weekly_3",
      title: "لاعب نشط",
      description: "سجل دخول لـ 5 أيام متتالية",
      reward: 300000,
      progress: 2,
      total: 5,
      completed: false,
      type: "weekly",
      icon: "📅"
    }
  ];

  // الإنجازات
  const achievements: MissionType[] = [
    {
      id: "achievement_1",
      title: "خبير البوكر",
      description: "العب 1000 لعبة بوكر",
      reward: 5000000,
      progress: 125,
      total: 1000,
      completed: false,
      type: "achievement",
      icon: "♠️"
    },
    {
      id: "achievement_2",
      title: "المليونير",
      description: "امتلك 100 مليون رقاقة في وقت واحد",
      reward: 10000000,
      progress: 2000000,
      total: 100000000,
      completed: false,
      type: "achievement",
      icon: "💵"
    },
    {
      id: "achievement_3",
      title: "بطل الدومينو",
      description: "فز بـ 100 لعبة دومينو",
      reward: 2000000,
      progress: 12,
      total: 100,
      completed: false,
      type: "achievement",
      icon: "🏅"
    },
    {
      id: "achievement_4",
      title: "مجمع الجواهر",
      description: "اجمع 50 عنصر في الحقيبة",
      reward: 1000000,
      progress: 5,
      total: 50,
      completed: false,
      type: "achievement",
      icon: "💎"
    }
  ];

  // تنسيق للرقم بالصيغة العربية
  const formatNumber = (num: number): string => {
    return num.toLocaleString("ar-EG");
  };

  // المطالبة بمكافأة المهمة
  const claimReward = (mission: MissionType) => {
    toast({
      title: "تمت المطالبة بنجاح!",
      description: `تم إضافة ${formatNumber(mission.reward)} رقاقة إلى حسابك.`,
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1a1708] text-white">
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/lobby")}
            className="flex items-center gap-2 text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            <ArrowRight className="h-5 w-5" />
            <span>العودة للصفحة الرئيسية</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#D4AF37]">المهمات</h1>
            <Award className="h-6 w-6 text-[#D4AF37]" />
          </div>
        </div>
        
        {/* عرض الرصيد الحالي */}
        <div className="bg-black/40 p-4 rounded-lg border border-[#D4AF37]/30 flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#D4AF37]/20 p-2 rounded-full">
              <Award className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-sm text-white/70">أكمل المهمات للحصول على مكافآت</p>
              <p className="text-xl font-bold text-[#D4AF37]">رصيدك الحالي: {user?.chips?.toLocaleString() || 0} رقاقة</p>
            </div>
          </div>
          
          <Button 
            className="bg-[#D4AF37] hover:bg-[#c9a431] text-black"
            onClick={() => navigate("/shop")}
          >
            <Zap className="h-4 w-4 ml-1" />
            اشحن رصيدك
          </Button>
        </div>
        
        {/* تبويبات المهمات */}
        <Tabs 
          defaultValue="daily" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b border-[#D4AF37]/20">
            <TabsList className="bg-black/30 overflow-x-auto w-full">
              <TabsTrigger value="daily" className="text-[#D4AF37]">
                <Clock className="h-4 w-4 ml-1" />
                المهمات اليومية
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-[#D4AF37]">
                <Calendar className="h-4 w-4 ml-1" />
                المهمات الأسبوعية
              </TabsTrigger>
              <TabsTrigger value="achievements" className="text-[#D4AF37]">
                <Award className="h-4 w-4 ml-1" />
                الإنجازات
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* قسم المهمات اليومية */}
          <TabsContent value="daily" className="mt-6">
            <div className="bg-black/20 rounded-lg border border-[#D4AF37]/20 p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-1">المهمات اليومية</h3>
                  <p className="text-sm text-white/70">تتجدد كل 24 ساعة</p>
                </div>
                <div className="bg-[#D4AF37]/10 rounded-lg px-3 py-1 flex items-center">
                  <Clock className="h-4 w-4 text-[#D4AF37] ml-1" />
                  <span className="text-[#D4AF37] text-sm">متبقي 12:45:30</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {dailyMissions.map((mission) => {
                const progressPercent = Math.min(100, (mission.progress / mission.total) * 100);
                const isCompleted = mission.progress >= mission.total;
                
                return (
                  <div 
                    key={mission.id}
                    className={`bg-[#1a1708]/60 rounded-lg border ${
                      isCompleted ? 'border-green-500/50' : 'border-gray-700/50'
                    } overflow-hidden transition-all duration-300`}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3">
                          <div className="bg-[#D4AF37]/10 rounded-full w-10 h-10 flex items-center justify-center text-xl">
                            {mission.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-[#D4AF37]">{mission.title}</h3>
                            <p className="text-sm text-white/70">{mission.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-white/50">المكافأة</span>
                          <p className="font-bold text-[#D4AF37]">{formatNumber(mission.reward)} رقاقة</p>
                        </div>
                      </div>
                      
                      <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-[#D4AF37]'}`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/70">
                          {isCompleted ? 'مكتمل' : `${formatNumber(mission.progress)} / ${formatNumber(mission.total)}`}
                        </span>
                        
                        <Button
                          size="sm"
                          className={isCompleted ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 text-gray-400 cursor-not-allowed"}
                          disabled={!isCompleted}
                          onClick={() => isCompleted && claimReward(mission)}
                        >
                          {isCompleted ? 'استلم المكافأة' : 'غير مكتمل'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          {/* قسم المهمات الاسبوعية */}
          <TabsContent value="weekly" className="mt-6">
            <div className="bg-black/20 rounded-lg border border-[#D4AF37]/20 p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-1">المهمات الأسبوعية</h3>
                  <p className="text-sm text-white/70">تتجدد كل 7 أيام</p>
                </div>
                <div className="bg-[#D4AF37]/10 rounded-lg px-3 py-1 flex items-center">
                  <Calendar className="h-4 w-4 text-[#D4AF37] ml-1" />
                  <span className="text-[#D4AF37] text-sm">متبقي 3 أيام</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {weeklyMissions.map((mission) => {
                const progressPercent = Math.min(100, (mission.progress / mission.total) * 100);
                const isCompleted = mission.progress >= mission.total;
                
                return (
                  <div 
                    key={mission.id}
                    className={`bg-[#1a1708]/60 rounded-lg border ${
                      isCompleted ? 'border-green-500/50' : 'border-gray-700/50'
                    } overflow-hidden transition-all duration-300`}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3">
                          <div className="bg-[#D4AF37]/10 rounded-full w-10 h-10 flex items-center justify-center text-xl">
                            {mission.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-[#D4AF37]">{mission.title}</h3>
                            <p className="text-sm text-white/70">{mission.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-white/50">المكافأة</span>
                          <p className="font-bold text-[#D4AF37]">{formatNumber(mission.reward)} رقاقة</p>
                        </div>
                      </div>
                      
                      <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-[#D4AF37]'}`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/70">
                          {isCompleted ? 'مكتمل' : `${formatNumber(mission.progress)} / ${formatNumber(mission.total)}`}
                        </span>
                        
                        <Button
                          size="sm"
                          className={isCompleted ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 text-gray-400 cursor-not-allowed"}
                          disabled={!isCompleted}
                          onClick={() => isCompleted && claimReward(mission)}
                        >
                          {isCompleted ? 'استلم المكافأة' : 'غير مكتمل'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          {/* قسم الإنجازات */}
          <TabsContent value="achievements" className="mt-6">
            <div className="bg-black/20 rounded-lg border border-[#D4AF37]/20 p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-1">الإنجازات</h3>
                  <p className="text-sm text-white/70">مكافآت خاصة عند إكمال إنجازات معينة</p>
                </div>
                <div className="bg-[#D4AF37]/10 rounded-lg px-3 py-1 flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#D4AF37] ml-1" />
                  <span className="text-[#D4AF37] text-sm">0 / {achievements.length} مكتمل</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {achievements.map((mission) => {
                const progressPercent = Math.min(100, (mission.progress / mission.total) * 100);
                const isCompleted = mission.progress >= mission.total;
                
                return (
                  <div 
                    key={mission.id}
                    className={`bg-[#1a1708]/60 rounded-lg border ${
                      isCompleted ? 'border-green-500/50' : 'border-gray-700/50'
                    } overflow-hidden transition-all duration-300`}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3">
                          <div className="bg-[#D4AF37]/10 rounded-full w-10 h-10 flex items-center justify-center text-xl">
                            {mission.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-[#D4AF37]">{mission.title}</h3>
                            <p className="text-sm text-white/70">{mission.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-white/50">المكافأة</span>
                          <p className="font-bold text-[#D4AF37]">{formatNumber(mission.reward)} رقاقة</p>
                        </div>
                      </div>
                      
                      <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-[#D4AF37]'}`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/70">
                          {isCompleted ? 'مكتمل' : `${formatNumber(mission.progress)} / ${formatNumber(mission.total)}`}
                        </span>
                        
                        <Button
                          size="sm"
                          className={isCompleted ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 text-gray-400 cursor-not-allowed"}
                          disabled={!isCompleted}
                          onClick={() => isCompleted && claimReward(mission)}
                        >
                          {isCompleted ? 'استلم المكافأة' : 'غير مكتمل'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}