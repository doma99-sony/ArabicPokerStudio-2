import { Switch, Route, useLocation } from "wouter";
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
import BadgesPage from "@/pages/badges-page";
import SendChipsPage from "@/pages/send-chips-page";
import OffersPage from "@/pages/offers-page";
import ArabicRocketPage from "@/pages/arabic-rocket-page";
import ArabPokerPage from "@/pages/arab-poker-page";
import ArabPokerGamePage from "@/pages/arab-poker-game-page";
import QueenOfEgypt3DPage from "@/pages/queen-of-egypt-3d-page";
import EgyptRocketPage from "@/pages/egypt-rocket-page";
import FishingSlotsPage from "@/pages/fishing-slots";
import PharaohsBook from "@/games/pharaohs-book/index";
import RiseOfOlympus from "@/games/rise-of-olympus/index";
import PokerMasrLobby from "@/pages/poker-lobby/poker-masr";
import TexasHoldemPoker from "@/pages/poker-lobby/poker-masr/texas-holdem";
import MeccaPoker from "@/pages/poker-lobby/poker-masr/mecca-poker";
import TurkishClassicPoker from "@/pages/poker-lobby/poker-masr/turkish-classic";
import EgyptianComponentsShowcasePage from "@/pages/egyptian-components-showcase-page";
import QueenOfEgypt3DShowcasePage from "@/pages/queen-of-egypt-3d-showcase-page";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { WelcomeMessageNotification } from "@/components/ui/welcome-message";
import { LandscapeNotice } from "@/components/ui/landscape-notice";
import { NotificationsProvider } from "@/components/ui/notifications-system";
import { HomeRedirect } from "@/components/navigation/home-redirect";
import { initializePerformanceOptimizations } from "@/lib/performance-utils";
import { SplashScreen } from "@/components/ui/splash-screen";
import { useState, useEffect, useRef } from "react";
import { ErrorProvider } from "@/components/error-handler";

// استيراد مشغل الموسيقى الخلفية
import { BackgroundMusicProvider } from "@/components/background-music";

// استيراد المكونات والأدوات الجديدة
import { useGlobalWebSocket } from "@/hooks/use-global-websocket";
import { useSessionManager } from "@/hooks/use-session-manager";
import { WebSocketInitializer } from "@/components/websocket-initializer";
import { ConnectionIndicator } from "@/components/ui/connection-indicator";

// استيراد مزود التحديثات الفورية
import { RealtimeUpdatesProvider } from "@/hooks/use-realtime-updates";


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
      <ProtectedRoute path="/arab-poker" component={ArabPokerPage} />
      <ProtectedRoute path="/arab-poker/:tableId" component={ArabPokerGamePage} />
      <ProtectedRoute path="/naruto" component={NarutoPage} />
      <ProtectedRoute path="/rankings" component={RankingsPage} />
      <ProtectedRoute path="/domino" component={DominoPage} />
      <ProtectedRoute path="/arabic-rocket" component={ArabicRocketPage} />
      <Route path="/queen-of-egypt-3d">
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
          <button
            onClick={() => window.location.href = '/'}
            className="fixed top-4 left-4 z-50 px-3 py-2 bg-amber-700/80 text-white rounded-md hover:bg-amber-600/80 backdrop-blur-sm"
          >
            العودة للرئيسية
          </button>
          <div className="container mx-auto p-8 pt-20">
            <h1 className="text-3xl md:text-5xl font-bold text-amber-400 text-center mb-8">ملكة مصر 3D</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-600/30">
                <h2 className="text-xl font-bold text-amber-300 mb-4">مقدمة سينمائية مذهلة</h2>
                <p className="text-amber-100">استمتع بتجربة غامرة مع مقدمة سينمائية ثلاثية الأبعاد تأخذك في رحلة إلى مصر القديمة</p>
              </div>
              <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-600/30">
                <h2 className="text-xl font-bold text-amber-300 mb-4">رموز مصرية تاريخية</h2>
                <p className="text-amber-100">رموز مستوحاة من التاريخ المصري: تاج الملكة، القط المصري، صقر حورس، الإناء الفخاري والكوبرا</p>
              </div>
              <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-600/30">
                <h2 className="text-xl font-bold text-amber-300 mb-4">تأثيرات بصرية مبهرة</h2>
                <p className="text-amber-100">تأثيرات ثلاثية الأبعاد مع عملات متطايرة وحركات سلسة للمكافآت الكبيرة</p>
              </div>
              <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-600/30">
                <h2 className="text-xl font-bold text-amber-300 mb-4">واجهة فرعونية أصيلة</h2>
                <p className="text-amber-100">تصميم مستوحى من العمارة المصرية القديمة مع زخارف وألوان تاريخية أصيلة</p>
              </div>
            </div>
            <div className="mt-12 text-center">
              <p className="text-amber-300 text-xl mb-4">جرّب الآن معرض مكونات ملكة مصر</p>
              <a href="/queen-of-egypt-3d-showcase" className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors">
                استعراض المكونات
              </a>
            </div>
          </div>
        </div>
      </Route>
      <ProtectedRoute path="/egypt-rocket" component={EgyptRocketPage} />
      <ProtectedRoute path="/fishing-slots" component={FishingSlotsPage} />
      <ProtectedRoute path="/poker-lobby/poker-masr" component={PokerMasrLobby} />
      <ProtectedRoute path="/poker-lobby/poker-masr/texas-holdem" component={TexasHoldemPoker} />
      <ProtectedRoute path="/poker-lobby/poker-masr/mecca-poker" component={MeccaPoker} />
      <ProtectedRoute path="/poker-lobby/poker-masr/turkish-classic" component={TurkishClassicPoker} />
      <ProtectedRoute path="/slots/pharaohs-book" component={PharaohsBook} />
      <ProtectedRoute path="/slots/rise-of-olympus" component={RiseOfOlympus} />
      <ProtectedRoute path="/egyptian-components-showcase" component={EgyptianComponentsShowcasePage} />
      <Route path="/queen-of-egypt-3d-showcase">
        <div className="min-h-screen bg-black">
          <button
            onClick={() => window.location.href = '/'}
            className="fixed top-4 left-4 z-50 px-3 py-2 bg-black/60 text-white rounded-md hover:bg-black/80 backdrop-blur-sm"
          >
            العودة للرئيسية
          </button>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-amber-400 text-center my-8">معرض مكونات ملكة مصر ثلاثية الأبعاد</h1>
            <div className="bg-amber-900/20 p-8 rounded-lg border border-amber-600/30">
              <p className="text-amber-300 text-center text-lg">
                تم تطوير معرض للمكونات المصرية بنجاح، يتضمن المعرض:
              </p>
              <ul className="list-disc list-inside text-amber-200 mt-4 space-y-2">
                <li>المقدمة السينمائية ثلاثية الأبعاد</li>
                <li>أيقونات ورموز مصرية تاريخية</li>
                <li>إطارات مستوحاة من التصاميم الفرعونية</li>
                <li>عداد عملات متحرك مع تأثيرات مرئية</li>
                <li>خلفية بردية متحركة لعرض المحتوى</li>
              </ul>
            </div>
          </div>
        </div>
      </Route>
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <ProtectedRoute path="/notifications/:messageId" component={NotificationsPage} />
      <ProtectedRoute path="/inventory" component={InventoryPage} />
      <ProtectedRoute path="/shop" component={ShopPage} />
      <ProtectedRoute path="/missions" component={MissionsPage} />
      <ProtectedRoute path="/vip" component={VIPPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/badges" component={BadgesPage} />
      <ProtectedRoute path="/send-chips" component={SendChipsPage} />
      <ProtectedRoute path="/offers" component={OffersPage} />
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
    
    // تحميل سكريبت تأثيرات الصوت الخاصة بالرعد والبرق
    const loadThunderScript = () => {
      const script = document.createElement('script');
      script.src = '/sounds/thunder.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('تم تحميل سكريبت تأثيرات الصوت الخاصة بالرعد والبرق بنجاح');
      };
      script.onerror = (error) => {
        console.error('فشل في تحميل سكريبت تأثيرات الصوت', error);
      };
      document.body.appendChild(script);
    };
    
    // تحميل سكريبت تأثيرات الصوت
    loadThunderScript();
    
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-[#D4AF37] mx-auto mb-4" />
          <h2 className="text-[#D4AF37] text-xl font-bold">جاري تحميل بوكر تكساس عرباوي...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorProvider>
      <NotificationsProvider>
        {/* تضمين مزود الموسيقى الخلفية في جميع الحالات لضمان تشغيلها في كل الشاشات */}
        <BackgroundMusicProvider />
        
        {/* إضافة مكون WebSocketInitializer لضمان استمرارية الاتصال في جميع الصفحات */}
        <WebSocketInitializer />
        
        {/* إضافة مزود التحديثات الفورية */}
        <RealtimeUpdatesProvider>
          {/* إذا كانت شاشة البداية مفعلة، اعرضها وإلا اعرض التطبيق الرئيسي */}
          {showSplash ? (
            <SplashScreen onComplete={() => {
              // تعيين علامة في sessionStorage أنه قد رأى شاشة البداية
              sessionStorage.setItem('hasSeenSplash', 'true');
              setShowSplash(false);
            }} />
          ) : (
            <>
              <Router />
              <WelcomeMessageNotification />
              <LandscapeNotice />
              <ConnectionIndicator />
              <Toaster />
            </>
          )}
        </RealtimeUpdatesProvider>
      </NotificationsProvider>
    </ErrorProvider>
  );
}

export default App;
