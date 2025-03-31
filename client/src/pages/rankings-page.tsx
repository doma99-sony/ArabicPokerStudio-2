import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { OnlineUsersCounter } from "@/components/ui/online-users-badge";
import { ArrowRight, Trophy, Medal, Star, Award, Crown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RankingsPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeRankTab, setActiveRankTab] = useState("daily");

  // بيانات افتراضية للاعبين المتصدرين (في تطبيق حقيقي، ستأتي هذه البيانات من API)
  const topPlayers = [
    { id: 1, username: "الملك_الذهبي", chips: 24500000, wins: 342, level: "الفاجر", avatar: null },
    { id: 2, username: "الأسد_المصري", chips: 18300000, wins: 287, level: "الفاجر", avatar: null },
    { id: 3, username: "بوكر_العرب", chips: 15200000, wins: 231, level: "الفاجر", avatar: null },
    { id: 4, username: "ملك_الشدة", chips: 12800000, wins: 189, level: "محترف", avatar: null },
    { id: 5, username: "بطل_الطاولة", chips: 10900000, wins: 173, level: "محترف", avatar: null },
    { id: 6, username: "الفلوش_الملكي", chips: 9300000, wins: 167, level: "محترف", avatar: null },
    { id: 7, username: "كينج_بوكر", chips: 8100000, wins: 142, level: "محترف", avatar: null },
    { id: 8, username: "الجوكر_العظيم", chips: 7200000, wins: 136, level: "محترف", avatar: null },
    { id: 9, username: "الورقة_الرابحة", chips: 6500000, wins: 121, level: "محترف", avatar: null },
    { id: 10, username: "نجم_الطاولة", chips: 5800000, wins: 105, level: "محترف", avatar: null },
  ];

  // بيانات الرتب والمكافآت
  const rankInfo = [
    { 
      id: 1, 
      title: "المبتدئ", 
      chips: "0 - 50,000", 
      rewards: ["10,000 رقاقة يوميًا", "أفاتار خاص"],
      icon: <Star className="h-6 w-6 text-gray-400" />
    },
    { 
      id: 2, 
      title: "النوب", 
      chips: "50,000 - 200,000", 
      rewards: ["15,000 رقاقة يوميًا", "طاولات خاصة", "أفاتار مميز"],
      icon: <Star className="h-6 w-6 text-blue-400" />
    },
    { 
      id: 3, 
      title: "لسه بتعلم", 
      chips: "200,000 - 1,000,000", 
      rewards: ["25,000 رقاقة يوميًا", "دخول مسابقات أسبوعية", "هدايا خاصة"],
      icon: <Medal className="h-6 w-6 text-yellow-400" />
    },
    { 
      id: 4, 
      title: "محترف", 
      chips: "1,000,000 - 10,000,000", 
      rewards: ["50,000 رقاقة يوميًا", "الدخول إلى البطولات الكبرى", "تصميم طاولات خاصة"],
      icon: <Trophy className="h-6 w-6 text-orange-400" />
    },
    { 
      id: 5, 
      title: "الفاجر", 
      chips: "10,000,000+", 
      rewards: ["100,000 رقاقة يوميًا", "مقعد VIP في بطولات العالم", "تصميم خاص للملف الشخصي"],
      icon: <Crown className="h-6 w-6 text-[#D4AF37]" />
    },
  ];

  // حالة المستخدم الحالي من بين قائمة المتصدرين
  const userRanking = user ? topPlayers.findIndex(player => player.username === user.username) + 1 : 0;

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col"
         style={{ backgroundImage: "url('/images/egyptian-background.jpg')" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Header Bar */}
      <header className="relative z-10 bg-black/80 text-white p-6 shadow-xl border-b border-[#D4AF37]/30">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-[#D4AF37]">تصنيفات اللاعبين</h1>
            {/* عداد المستخدمين المتصلين */}
            <div className="absolute top-3 left-6">
              <OnlineUsersCounter />
            </div>
          </div>

          <Button 
            variant="outline" 
            className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
            onClick={() => navigate("/")}
          >
            <ArrowRight size={18} className="ml-2" />
            العودة إلى اللوبي
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto flex-1 p-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Rankings Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-black/60 border border-[#D4AF37]/20 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#D4AF37] flex items-center">
                  <Trophy className="ml-2 h-6 w-6" /> 
                  قائمة المتصدرين
                </h2>
                <div className="text-white/80 text-sm">
                  {userRanking > 0 ? (
                    <span>ترتيبك: <span className="text-[#D4AF37] font-bold">{userRanking}</span></span>
                  ) : (
                    <span>لم تدخل قائمة المتصدرين بعد</span>
                  )}
                </div>
              </div>

              {/* Tabs للتصنيفات المختلفة */}
              <Tabs 
                defaultValue="daily" 
                value={activeRankTab}
                onValueChange={setActiveRankTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 h-auto mb-6">
                  <TabsTrigger value="daily">يومي</TabsTrigger>
                  <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
                  <TabsTrigger value="allTime">الإجمالي</TabsTrigger>
                </TabsList>

                {/* محتوى التصنيف اليومي */}
                <TabsContent value="daily">
                  <div className="bg-black/30 rounded-lg p-4">
                    <table className="w-full">
                      <thead className="border-b border-[#D4AF37]/20">
                        <tr className="text-[#D4AF37]">
                          <th className="py-3 text-right">الترتيب</th>
                          <th className="py-3 text-right">اللاعب</th>
                          <th className="py-3 text-right">الرقائق</th>
                          <th className="py-3 text-right">الرتبة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topPlayers.map((player, index) => (
                          <tr key={player.id} className={`border-b border-white/10 ${player.username === user?.username ? 'bg-[#D4AF37]/10' : ''}`}>
                            <td className="py-3 text-right">
                              <div className="flex items-center">
                                {index === 0 && <Crown className="h-5 w-5 ml-1 text-[#D4AF37]" />}
                                {index === 1 && <Crown className="h-5 w-5 ml-1 text-[#C0C0C0]" />}
                                {index === 2 && <Crown className="h-5 w-5 ml-1 text-[#CD7F32]" />}
                                <span className={`
                                  ${index === 0 ? 'text-[#D4AF37] font-bold' : ''}
                                  ${index === 1 ? 'text-[#C0C0C0] font-bold' : ''}
                                  ${index === 2 ? 'text-[#CD7F32] font-bold' : ''}
                                `}>
                                  {index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-right font-semibold">{player.username}</td>
                            <td className="py-3 text-right">{player.chips.toLocaleString()}</td>
                            <td className="py-3 text-right">
                              <span className={`
                                rounded-full px-2 py-1 text-xs 
                                ${player.level === 'الفاجر' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : ''}
                                ${player.level === 'محترف' ? 'bg-orange-500/20 text-orange-400' : ''}
                                ${player.level === 'لسه بتعلم' ? 'bg-blue-500/20 text-blue-400' : ''}
                                ${player.level === 'النوب' ? 'bg-green-500/20 text-green-400' : ''}
                              `}>
                                {player.level}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                {/* محتوى التصنيف الأسبوعي - يمكن استخدام نفس البيانات للتوضيح */}
                <TabsContent value="weekly">
                  <div className="bg-black/30 rounded-lg p-4">
                    <table className="w-full">
                      <thead className="border-b border-[#D4AF37]/20">
                        <tr className="text-[#D4AF37]">
                          <th className="py-3 text-right">الترتيب</th>
                          <th className="py-3 text-right">اللاعب</th>
                          <th className="py-3 text-right">الرقائق</th>
                          <th className="py-3 text-right">الرتبة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* تظهر نفس البيانات بترتيب مختلف للتوضيح */}
                        {[...topPlayers].sort((a, b) => b.wins - a.wins).map((player, index) => (
                          <tr key={player.id} className={`border-b border-white/10 ${player.username === user?.username ? 'bg-[#D4AF37]/10' : ''}`}>
                            <td className="py-3 text-right">
                              <div className="flex items-center">
                                {index === 0 && <Crown className="h-5 w-5 ml-1 text-[#D4AF37]" />}
                                {index === 1 && <Crown className="h-5 w-5 ml-1 text-[#C0C0C0]" />}
                                {index === 2 && <Crown className="h-5 w-5 ml-1 text-[#CD7F32]" />}
                                <span className={`
                                  ${index === 0 ? 'text-[#D4AF37] font-bold' : ''}
                                  ${index === 1 ? 'text-[#C0C0C0] font-bold' : ''}
                                  ${index === 2 ? 'text-[#CD7F32] font-bold' : ''}
                                `}>
                                  {index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-right font-semibold">{player.username}</td>
                            <td className="py-3 text-right">{player.chips.toLocaleString()}</td>
                            <td className="py-3 text-right">
                              <span className={`
                                rounded-full px-2 py-1 text-xs 
                                ${player.level === 'الفاجر' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : ''}
                                ${player.level === 'محترف' ? 'bg-orange-500/20 text-orange-400' : ''}
                                ${player.level === 'لسه بتعلم' ? 'bg-blue-500/20 text-blue-400' : ''}
                                ${player.level === 'النوب' ? 'bg-green-500/20 text-green-400' : ''}
                              `}>
                                {player.level}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                {/* محتوى التصنيف الإجمالي */}
                <TabsContent value="allTime">
                  <div className="bg-black/30 rounded-lg p-4">
                    <table className="w-full">
                      <thead className="border-b border-[#D4AF37]/20">
                        <tr className="text-[#D4AF37]">
                          <th className="py-3 text-right">الترتيب</th>
                          <th className="py-3 text-right">اللاعب</th>
                          <th className="py-3 text-right">الرقائق</th>
                          <th className="py-3 text-right">الرتبة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topPlayers.map((player, index) => (
                          <tr key={player.id} className={`border-b border-white/10 ${player.username === user?.username ? 'bg-[#D4AF37]/10' : ''}`}>
                            <td className="py-3 text-right">
                              <div className="flex items-center">
                                {index === 0 && <Crown className="h-5 w-5 ml-1 text-[#D4AF37]" />}
                                {index === 1 && <Crown className="h-5 w-5 ml-1 text-[#C0C0C0]" />}
                                {index === 2 && <Crown className="h-5 w-5 ml-1 text-[#CD7F32]" />}
                                <span className={`
                                  ${index === 0 ? 'text-[#D4AF37] font-bold' : ''}
                                  ${index === 1 ? 'text-[#C0C0C0] font-bold' : ''}
                                  ${index === 2 ? 'text-[#CD7F32] font-bold' : ''}
                                `}>
                                  {index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-right font-semibold">{player.username}</td>
                            <td className="py-3 text-right">{player.chips.toLocaleString()}</td>
                            <td className="py-3 text-right">
                              <span className={`
                                rounded-full px-2 py-1 text-xs 
                                ${player.level === 'الفاجر' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : ''}
                                ${player.level === 'محترف' ? 'bg-orange-500/20 text-orange-400' : ''}
                                ${player.level === 'لسه بتعلم' ? 'bg-blue-500/20 text-blue-400' : ''}
                                ${player.level === 'النوب' ? 'bg-green-500/20 text-green-400' : ''}
                              `}>
                                {player.level}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* رتب اللاعبين والمكافآت */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-black/60 border border-[#D4AF37]/20 p-6 rounded-xl backdrop-blur-sm">
              <h2 className="text-xl font-bold text-[#D4AF37] flex items-center mb-6">
                <Award className="ml-2 h-5 w-5" /> 
                رتب اللاعبين والمكافآت
              </h2>

              <div className="space-y-5">
                {rankInfo.map(rank => (
                  <div key={rank.id} className="border border-[#D4AF37]/10 rounded-lg p-4 bg-black/30">
                    <div className="flex items-center mb-2">
                      {rank.icon}
                      <h3 className="text-lg font-bold mr-2">{rank.title}</h3>
                    </div>
                    <p className="text-white/80 mb-2 text-sm">الرقائق: {rank.chips}</p>
                    <div className="text-xs">
                      <h4 className="text-[#D4AF37] font-semibold mb-1">المكافآت:</h4>
                      <ul className="list-disc mr-5 space-y-1 text-white/90">
                        {rank.rewards.map((reward, i) => (
                          <li key={i}>{reward}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/80 text-white/60 text-center p-4 mt-8 border-t border-[#D4AF37]/20">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} بوكر تكساس عرباوي - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}