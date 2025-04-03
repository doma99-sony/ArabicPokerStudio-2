import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Trophy,
  TrendingUp,
  ArrowUpRight,
  Clock,
  DollarSign,
  Award,
  BarChart3,
  BarChart4,
  Users,
  PieChart,
  Flame,
  Clock8,
  PercentCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

// نوع بيانات الإحصائيات
interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  highestWin: number;
  biggestPot: number;
  winRate: number;
  joinDate: string;
  totalPlayTime: number;
  
  // إحصائيات خاصة بالبوكر
  handsPlayed: number;
  flopsSeen: number;
  turnsReached: number;
  riverReached: number;
  showdownsReached: number;
  royalFlushes: number;
  straightFlushes: number;
  fourOfAKind: number;
  fullHouses: number;
  flushes: number;
  straights: number;
  threeOfAKind: number;
  twoPairs: number;
  onePairs: number;
  
  // إحصائيات إضافية
  totalBets: number;
  totalRaises: number;
  totalCalls: number;
  totalFolds: number;
  totalChecks: number;
  totalAllIns: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: number;
  className?: string;
}

// مكون بطاقة إحصائية واحدة
function StatCard({ title, value, icon, description, trend, className = "" }: StatCardProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-full bg-gold-200/40 p-2">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend !== undefined && (
          <div className={`flex items-center mt-2 text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowUpRight className="h-4 w-4 mr-1 rotate-180" />}
            <span>{Math.abs(trend)}% خلال آخر 7 أيام</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// مكون الإحصائيات الرئيسي
export function PlayerStatistics() {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const auth = useAuth();
  const userId = auth.user?.id;
  
  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`/api/player-stats/${userId}`);
        
        if (!response.ok) {
          throw new Error("فشل جلب الإحصائيات");
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("خطأ في جلب الإحصائيات:", error);
        toast({
          title: "خطأ",
          description: "تعذر جلب إحصائيات اللاعب، حاول مرة أخرى.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [userId, toast]);
  
  // وظيفة مساعدة لعرض وقت اللعب بتنسيق مناسب
  const formatPlayTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} دقيقة`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} ساعة`;
    }
    
    return `${hours} ساعة و ${remainingMinutes} دقيقة`;
  };
  
  // وظيفة مساعدة لتنسيق النسبة المئوية
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  // وظيفة مساعدة لتنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>لا توجد إحصائيات متاحة</CardTitle>
          <CardDescription>لم نتمكن من العثور على إحصائيات لهذا اللاعب</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const handTypesData = [
    { name: "رويال فلاش", value: stats.royalFlushes },
    { name: "ستريت فلاش", value: stats.straightFlushes },
    { name: "فور أوف كايند", value: stats.fourOfAKind },
    { name: "فول هاوس", value: stats.fullHouses },
    { name: "فلاش", value: stats.flushes },
    { name: "ستريت", value: stats.straights },
    { name: "ثلاثة متماثلة", value: stats.threeOfAKind },
    { name: "زوجان", value: stats.twoPairs },
    { name: "زوج واحد", value: stats.onePairs }
  ];
  
  // حساب النسبة المئوية للفوز والخسارة
  const totalResults = stats.wins + stats.losses + stats.draws;
  const winPercentage = totalResults > 0 ? (stats.wins / totalResults) * 100 : 0;
  const lossPercentage = totalResults > 0 ? (stats.losses / totalResults) * 100 : 0;
  const drawPercentage = totalResults > 0 ? (stats.draws / totalResults) * 100 : 0;
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">إحصائيات اللاعب</h2>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">عامة</TabsTrigger>
          <TabsTrigger value="poker">البوكر</TabsTrigger>
          <TabsTrigger value="actions">الإجراءات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي المباريات"
              value={stats.gamesPlayed}
              icon={<BarChart3 className="h-4 w-4 text-gold-800" />}
              description="عدد المباريات التي لعبتها"
            />
            
            <StatCard
              title="الفوز"
              value={stats.wins}
              icon={<Trophy className="h-4 w-4 text-gold-800" />}
              description={`${formatPercentage(stats.winRate)} معدل الفوز`}
            />
            
            <StatCard
              title="أعلى ربح"
              value={stats.highestWin.toLocaleString()}
              icon={<TrendingUp className="h-4 w-4 text-gold-800" />}
              description="أعلى مبلغ ربحته في مباراة واحدة"
            />
            
            <StatCard
              title="أكبر وعاء"
              value={stats.biggestPot.toLocaleString()}
              icon={<DollarSign className="h-4 w-4 text-gold-800" />}
              description="أكبر وعاء شاركت فيه"
            />
            
            <StatCard
              title="وقت اللعب"
              value={formatPlayTime(stats.totalPlayTime)}
              icon={<Clock className="h-4 w-4 text-gold-800" />}
              description="إجمالي الوقت الذي قضيته في اللعب"
            />
            
            <StatCard
              title="تاريخ الانضمام"
              value={formatDate(stats.joinDate)}
              icon={<Users className="h-4 w-4 text-gold-800" />}
              description="تاريخ انضمامك للعبة"
            />
          </div>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>توزيع نتائج المباريات</CardTitle>
              <CardDescription>نسبة الفوز والخسارة والتعادل</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">فوز ({stats.wins})</span>
                  <span className="text-sm font-medium text-gold-600">{winPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={winPercentage} className="h-2 bg-gray-200" indicatorClassName="bg-green-500" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">خسارة ({stats.losses})</span>
                  <span className="text-sm font-medium text-red-600">{lossPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={lossPercentage} className="h-2 bg-gray-200" indicatorClassName="bg-red-500" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">تعادل ({stats.draws})</span>
                  <span className="text-sm font-medium text-blue-600">{drawPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={drawPercentage} className="h-2 bg-gray-200" indicatorClassName="bg-blue-500" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="poker" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="أيادي اللعب"
              value={stats.handsPlayed}
              icon={<BarChart4 className="h-4 w-4 text-gold-800" />}
              description="إجمالي عدد الأيدي التي لعبتها"
            />
            
            <StatCard
              title="الفلوبات المشاهدة"
              value={stats.flopsSeen}
              icon={<PieChart className="h-4 w-4 text-gold-800" />}
              description={`${stats.handsPlayed > 0 ? ((stats.flopsSeen / stats.handsPlayed) * 100).toFixed(1) : 0}% من الأيدي`}
            />
            
            <StatCard
              title="تيرن وريفر"
              value={`${stats.turnsReached} / ${stats.riverReached}`}
              icon={<BarChart3 className="h-4 w-4 text-gold-800" />}
              description="عدد مرات الوصول لمراحل التيرن والريفر"
            />
            
            <StatCard
              title="شوداون"
              value={stats.showdownsReached}
              icon={<Flame className="h-4 w-4 text-gold-800" />}
              description={`${stats.handsPlayed > 0 ? ((stats.showdownsReached / stats.handsPlayed) * 100).toFixed(1) : 0}% من الأيدي`}
            />
          </div>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>أنواع الأيدي</CardTitle>
              <CardDescription>أفضل الأيدي التي تم تشكيلها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {handTypesData.map((hand, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{hand.name}</span>
                      <span className="text-sm font-medium">{hand.value}</span>
                    </div>
                    <Progress 
                      value={hand.value > 0 ? Math.max(5, (hand.value / Math.max(...handTypesData.map(h => h.value))) * 100) : 0} 
                      className="h-2 bg-gray-200" 
                      indicatorClassName="bg-gold-500" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="مراهنات"
              value={stats.totalBets}
              icon={<DollarSign className="h-4 w-4 text-gold-800" />}
              description="إجمالي عدد المراهنات"
            />
            
            <StatCard
              title="زيادات"
              value={stats.totalRaises}
              icon={<TrendingUp className="h-4 w-4 text-gold-800" />}
              description="إجمالي عدد الزيادات"
            />
            
            <StatCard
              title="مجاراة"
              value={stats.totalCalls}
              icon={<PercentCircle className="h-4 w-4 text-gold-800" />}
              description="إجمالي عدد المجاراة"
            />
            
            <StatCard
              title="تحقق"
              value={stats.totalChecks}
              icon={<Clock8 className="h-4 w-4 text-gold-800" />}
              description="إجمالي عدد التحقق"
            />
            
            <StatCard
              title="انسحاب"
              value={stats.totalFolds}
              icon={<Award className="h-4 w-4 text-gold-800" />}
              description="إجمالي عدد الانسحاب"
            />
            
            <StatCard
              title="كل الرقائق"
              value={stats.totalAllIns}
              icon={<Flame className="h-4 w-4 text-gold-800" />}
              description="إجمالي عدد المجازفة بكل الرقائق"
            />
          </div>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>توزيع الإجراءات</CardTitle>
              <CardDescription>نسبة كل إجراء من إجمالي الإجراءات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* حساب إجمالي الإجراءات */}
                {(() => {
                  const totalActions = stats.totalBets + stats.totalRaises + stats.totalCalls + 
                                      stats.totalChecks + stats.totalFolds + stats.totalAllIns;
                  
                  if (totalActions === 0) return <p>لا توجد إجراءات مسجلة بعد</p>;
                  
                  const getPercentage = (value: number) => (value / totalActions) * 100;
                  
                  return (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">مراهنة</span>
                        <span className="text-sm font-medium">{getPercentage(stats.totalBets).toFixed(1)}%</span>
                      </div>
                      <Progress value={getPercentage(stats.totalBets)} className="h-2 bg-gray-200" indicatorClassName="bg-blue-500" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">زيادة</span>
                        <span className="text-sm font-medium">{getPercentage(stats.totalRaises).toFixed(1)}%</span>
                      </div>
                      <Progress value={getPercentage(stats.totalRaises)} className="h-2 bg-gray-200" indicatorClassName="bg-gold-500" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">مجاراة</span>
                        <span className="text-sm font-medium">{getPercentage(stats.totalCalls).toFixed(1)}%</span>
                      </div>
                      <Progress value={getPercentage(stats.totalCalls)} className="h-2 bg-gray-200" indicatorClassName="bg-green-500" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">تحقق</span>
                        <span className="text-sm font-medium">{getPercentage(stats.totalChecks).toFixed(1)}%</span>
                      </div>
                      <Progress value={getPercentage(stats.totalChecks)} className="h-2 bg-gray-200" indicatorClassName="bg-purple-500" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">انسحاب</span>
                        <span className="text-sm font-medium">{getPercentage(stats.totalFolds).toFixed(1)}%</span>
                      </div>
                      <Progress value={getPercentage(stats.totalFolds)} className="h-2 bg-gray-200" indicatorClassName="bg-red-500" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">كل الرقائق</span>
                        <span className="text-sm font-medium">{getPercentage(stats.totalAllIns).toFixed(1)}%</span>
                      </div>
                      <Progress value={getPercentage(stats.totalAllIns)} className="h-2 bg-gray-200" indicatorClassName="bg-orange-500" />
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}