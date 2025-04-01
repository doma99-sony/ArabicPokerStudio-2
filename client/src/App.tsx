import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import LobbyPage from "@/pages/lobby-page";
import GamePage from "@/pages/game-page";
import GamePageSimplified from "@/pages/game-page-simplified";
import DirectTablePage from "@/pages/direct-table-page";
import ProfilePage from "@/pages/profile-page";
import NarutoPage from "@/pages/naruto-page";
import LevelSelectPage from "@/pages/level-select-page";
import PokerTablesPage from "@/pages/poker-tables-page";
import RankingsPage from "@/pages/rankings-page";
import DominoPage from "@/pages/domino-page";
import NotificationsPage from "@/pages/notifications-page";
import InventoryPage from "@/pages/inventory-page";
import ShopPage from "@/pages/shop-page";
import MissionsPage from "@/pages/missions-page";
import VIPPage from "@/pages/vip-page";
import SettingsPage from "@/pages/settings-page";
import HowToPlayPage from "@/pages/how-to-play-page";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { WelcomeMessageNotification } from "@/components/ui/welcome-message";
import { LandscapeNotice } from "@/components/ui/landscape-notice";
import { NotificationsProvider } from "@/components/ui/notifications-system";
import { HomeRedirect } from "@/components/navigation/home-redirect";
import { initializePerformanceOptimizations } from "@/lib/performance-utils";
import { SplashScreen } from "@/components/ui/splash-screen";
import { useState, useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/how-to-play" component={HowToPlayPage} />
      <ProtectedRoute path="/" component={LobbyPage} />
      <Route path="/home" component={HomeRedirect} />
      <Route path="/lobby" component={HomeRedirect} />
      <Route path="/main" component={HomeRedirect} />
      <ProtectedRoute path="/game/:tableId" component={GamePage} />
      <ProtectedRoute path="/game-simple/:tableId" component={GamePageSimplified} />
      <ProtectedRoute path="/direct-table/:tableId" component={DirectTablePage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/poker-tables" component={PokerTablesPage} />
      <ProtectedRoute path="/poker/levels" component={LevelSelectPage} />
      <ProtectedRoute path="/poker/:level" component={GamePage} />
      <ProtectedRoute path="/naruto" component={NarutoPage} />
      <ProtectedRoute path="/rankings" component={RankingsPage} />
      <ProtectedRoute path="/domino" component={DominoPage} />
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <ProtectedRoute path="/notifications/:messageId" component={NotificationsPage} />
      <ProtectedRoute path="/inventory" component={InventoryPage} />
      <ProtectedRoute path="/shop" component={ShopPage} />
      <ProtectedRoute path="/missions" component={MissionsPage} />
      <ProtectedRoute path="/vip" component={VIPPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // تحقق مما إذا كانت شاشة البداية قد تم رؤيتها سابقاً في الجلسة الحالية
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    
    // تحقق مما إذا كان المستخدم قد سجل خروجه، إذا كان كذلك أظهر شاشة البداية من جديد
    const hasLoggedOut = sessionStorage.getItem('hasLoggedOut');
    
    if (hasLoggedOut === 'true') {
      // إعادة ضبط حالة تسجيل الخروج
      sessionStorage.removeItem('hasLoggedOut');
      return true;
    }
    
    // إذا لم يكن قد رأى شاشة البداية من قبل، أظهرها
    return hasSeenSplash !== 'true';
  });
  
  const { isLoading, user } = useAuth();
  
  // تهيئة تحسينات الأداء عند بدء التطبيق
  useEffect(() => {
    initializePerformanceOptimizations();
    
    // تعطيل حركات الصفحة الغير ضرورية على الهواتف المحمولة
    if ('ontouchstart' in window) {
      // تحسين متابعة حركات اللمس
      document.documentElement.classList.add('touch-optimization');
      
      // منع تكبير الصفحة بشكل غير مقصود على الأجهزة المحمولة
      const metaViewport = document.querySelector('meta[name=viewport]');
      if (!metaViewport) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
      } else {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
      
      // تنظيف عند إزالة المكون
      return () => {
        document.documentElement.classList.remove('touch-optimization');
      };
    }
  }, []);
  
  // رصد حالة تسجيل الدخول
  useEffect(() => {
    // إذا كان المستخدم موجود، ضع علامة في sessionStorage
    if (user !== null) {
      sessionStorage.setItem('hadUser', 'true');
    }
  }, [user]);
  
  // عرض شاشة التحميل العامة أثناء التحقق من حالة المصادقة
  if (isLoading) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-black z-50">
        {/* فيديو خلفية كازينو حقيقي */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute w-full h-full object-cover"
            style={{ filter: "brightness(0.3) contrast(1.2)" }}
          >
            <source src="/assets/loading-background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
        </div>
        
        {/* إضافة طبقة من الفلاتر */}
        <div className="absolute inset-0 bg-[#0a0f18]/50 mix-blend-overlay"></div>
        
        {/* توهج مركزي */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-[#D4AF37]/20 to-transparent blur-3xl animate-pulse-slow"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-[#BF9B30]/10 rounded-full blur-2xl animate-pulse-slow"></div>
            <Loader2 className="absolute inset-0 h-32 w-32 animate-spin text-[#D4AF37]" />
            <div className="absolute inset-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <img 
                src="/assets/poker-icon-gold.png"
                alt="VIP Poker" 
                className="w-full h-full object-contain p-1 animate-pulse-slow"
              />
            </div>
          </div>
          
          <h2 className="text-[#D4AF37] text-2xl font-bold mt-4 animate-pulse-slow bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] bg-clip-text text-transparent">
            جاري تحميل بوكر تكساس عرباوي...
          </h2>
        </div>
        
        {/* بطاقات وعناصر متحركة في الخلفية */}
        {[...Array(4)].map((_, index) => {
          const positionData = [
            { bottom: '10%', right: '10%', rotateVal: 15 },
            { top: '10%', left: '10%', rotateVal: -20 },
            { top: '15%', right: '20%', rotateVal: 10 },
            { bottom: '15%', left: '20%', rotateVal: -15 }
          ];
          const suits = ['♠', '♥', '♦', '♣'];
          const isRed = index % 2 === 1 || index % 2 === 2;
          const position = positionData[index];
          
          return (
            <div
              key={`floating-${index}`}
              className="absolute w-16 h-16 flex items-center justify-center text-5xl pointer-events-none animate-pulse-slow"
              style={{ 
                top: position.top,
                bottom: position.bottom,
                left: position.left,
                right: position.right,
                color: isRed ? 'rgba(220, 53, 69, 0.2)' : 'rgba(212, 175, 55, 0.2)',
                transform: `rotate(${position.rotateVal}deg)`,
                animationDelay: `${index * 0.5}s`
              }}
            >
              {suits[index]}
            </div>
          );
        })}
      </div>
    );
  }
  
  // إذا كانت شاشة البداية مفعلة، اعرضها أولاً
  if (showSplash) {
    return <SplashScreen onComplete={() => {
      // تعيين علامة في sessionStorage أنه قد رأى شاشة البداية
      sessionStorage.setItem('hasSeenSplash', 'true');
      setShowSplash(false);
    }} />;
  }
  
  return (
    <NotificationsProvider>
      <Router />
      <WelcomeMessageNotification />
      <LandscapeNotice />
      <Toaster />
    </NotificationsProvider>
  );
}

export default App;
