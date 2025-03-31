import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import LobbyPage from "@/pages/lobby-page";
import GamePage from "@/pages/game-page";
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
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { WelcomeMessageNotification } from "@/components/ui/welcome-message";
import { LandscapeNotice } from "@/components/ui/landscape-notice";
import { GameAssistant } from "@/components/ui/game-assistant";
import CasinoBuilding from "@/components/ui/casino-building";
import { initializePerformanceOptimizations } from "@/lib/performance-utils";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={LobbyPage} />
      <ProtectedRoute path="/game/:tableId" component={GamePage} />
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
  const { isLoading } = useAuth();
  
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
  
  // عرض شاشة التحميل العامة أثناء التحقق من حالة المصادقة
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-[#D4AF37] mx-auto mb-4" />
          <h2 className="text-[#D4AF37] text-xl font-bold">جاري تحميل بوكر تكساس عرباوي...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Router />
      <WelcomeMessageNotification />
      <LandscapeNotice />
      <GameAssistant />
      <CasinoBuilding />
      <Toaster />
    </>
  );
}

export default App;
