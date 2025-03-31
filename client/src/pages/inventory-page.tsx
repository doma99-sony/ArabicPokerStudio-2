import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Gift, Package, Award, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";

// أنواع العناصر المختلفة
type ItemType = "frame" | "avatar" | "badge" | "chip" | "table" | "card";

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  type: ItemType;
  rarity: "common" | "rare" | "epic" | "legendary";
  acquired: string; // تاريخ الحصول عليه
  equipped?: boolean;
}

export default function InventoryPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // التحقق من كونه مستخدم جديد وعرض رسالة الترحيب
  useEffect(() => {
    // سننظر إذا كان اسم المستخدم يبدأ بـ "ضيف_" لتحديد ما إذا كان مستخدماً جديداً
    if (user?.username?.startsWith("ضيف_")) {
      setIsNewUser(true);
    }

    // التحقق من كونه أول زيارة للحقيبة
    const hasVisitedInventory = localStorage.getItem("hasVisitedInventory");
    if (!hasVisitedInventory) {
      localStorage.setItem("hasVisitedInventory", "true");
      setShowWelcomeDialog(true);
    }
  }, [user]);

  // تجهيز قائمة افتراضية من العناصر كمثال
  useEffect(() => {
    // أمثلة على بعض العناصر التي يمكن امتلاكها
    const demoItems: InventoryItem[] = [
      {
        id: "frame_1",
        name: "إطار ذهبي فاخر",
        description: "إطار ذهبي مميز للاعبين الجدد. يعطي لمسة من الفخامة لصورتك الشخصية.",
        imageSrc: "/assets/items/gold-frame.png",
        type: "frame",
        rarity: "rare",
        acquired: "31-03-2025",
        equipped: true
      },
      {
        id: "avatar_1",
        name: "صورة ملك البوكر",
        description: "صورة شخصية تظهر مهارتك في لعبة البوكر.",
        imageSrc: "/assets/items/king-avatar.png",
        type: "avatar",
        rarity: "common",
        acquired: "31-03-2025"
      },
      {
        id: "badge_1",
        name: "شارة المبتدئ المحظوظ",
        description: "شارة تمنح للاعبين الجدد الذين حققوا فوزاً في أول مباراة.",
        imageSrc: "/assets/items/lucky-badge.png",
        type: "badge",
        rarity: "common",
        acquired: "31-03-2025"
      },
      {
        id: "chip_1",
        name: "رقاقات ذهبية",
        description: "رقاقات ذهبية مميزة للاستخدام في طاولات VIP.",
        imageSrc: "/assets/items/golden-chips.png",
        type: "chip",
        rarity: "epic",
        acquired: "31-03-2025"
      }
    ];

    // إذا كان مستخدماً جديداً، سنضيف الإطار الترحيبي الخاص
    if (isNewUser) {
      const welcomeFrame: InventoryItem = {
        id: "welcome_frame",
        name: "إطار الترحيب الذهبي",
        description: "إطار خاص مقدم لك كهدية ترحيبية! استخدمه لتمييز صورتك الشخصية.",
        imageSrc: "/assets/items/welcome-frame.png",
        type: "frame",
        rarity: "epic",
        acquired: new Date().toLocaleDateString("ar-EG"),
        equipped: true
      };
      
      setItems([welcomeFrame, ...demoItems]);
    } else {
      setItems(demoItems);
    }
  }, [isNewUser]);

  // تغيير حالة العنصر (مجهز أو غير مجهز)
  const toggleEquip = (itemId: string) => {
    setItems(prev => 
      prev.map(item => {
        // إذا كان من نفس النوع، نزيل التجهيز من جميع العناصر من هذا النوع أولاً
        if (item.id === itemId) {
          const selectedItemType = prev.find(i => i.id === itemId)?.type;
          
          if (item.type === selectedItemType) {
            return {
              ...item,
              equipped: item.id === itemId ? !item.equipped : false
            };
          }
        }
        
        return item;
      })
    );
  };

  // فتح تفاصيل العنصر
  const openItemDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setOpenItemDialog(true);
  };

  // تصفية العناصر حسب النوع
  const filteredItems = activeTab === "all" 
    ? items 
    : items.filter(item => item.type === activeTab);

  // الحصول على لون الندرة
  const getRarityColor = (rarity: InventoryItem["rarity"]) => {
    switch (rarity) {
      case "common":
        return "text-gray-300";
      case "rare":
        return "text-blue-400";
      case "epic":
        return "text-purple-400";
      case "legendary":
        return "text-[#FFD700]";
      default:
        return "text-gray-300";
    }
  };

  // ترجمة أنواع العناصر للعربية
  const getItemTypeText = (type: ItemType) => {
    switch (type) {
      case "frame":
        return "إطار";
      case "avatar":
        return "صورة شخصية";
      case "badge":
        return "شارة";
      case "chip":
        return "رقاقات";
      case "table":
        return "طاولة";
      case "card":
        return "بطاقات";
      default:
        return "عنصر";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1a1708] text-white">
      <div className="container mx-auto p-4">
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
            <ShoppingBag className="h-6 w-6 text-[#D4AF37]" />
            <h1 className="text-2xl font-bold text-[#D4AF37]">حقيبتي</h1>
          </div>
        </div>
        
        {/* تبويبات أنواع العناصر */}
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b border-[#D4AF37]/20">
            <TabsList className="bg-black/30 overflow-x-auto w-full">
              <TabsTrigger value="all" className="text-[#D4AF37]">
                الكل
              </TabsTrigger>
              <TabsTrigger value="frame" className="text-[#D4AF37]">
                <Award className="h-4 w-4 ml-1" />
                الإطارات
              </TabsTrigger>
              <TabsTrigger value="avatar" className="text-[#D4AF37]">
                <div className="h-4 w-4 ml-1 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <span className="text-xs">👤</span>
                </div>
                الصور الشخصية
              </TabsTrigger>
              <TabsTrigger value="badge" className="text-[#D4AF37]">
                <Award className="h-4 w-4 ml-1" />
                الشارات
              </TabsTrigger>
              <TabsTrigger value="chip" className="text-[#D4AF37]">
                <div className="h-4 w-4 ml-1 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <span className="text-xs">🪙</span>
                </div>
                الرقاقات
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="mt-6">
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredItems.map(item => (
                  <div 
                    key={item.id}
                    className={`bg-black/40 rounded-lg border ${item.equipped ? 'border-[#D4AF37]' : 'border-gray-700'} overflow-hidden cursor-pointer hover:border-[#D4AF37]/80 transition-all duration-300 hover:shadow-[0_0_12px_rgba(212,175,55,0.2)]`}
                    onClick={() => openItemDetails(item)}
                  >
                    <div className="h-32 bg-gradient-to-br from-black/30 to-[#1a1708]/40 flex items-center justify-center p-4 relative">
                      {item.equipped && (
                        <div className="absolute top-2 right-2 bg-[#D4AF37] text-black text-xs px-1.5 py-0.5 rounded-md font-bold">
                          مُجهز
                        </div>
                      )}
                      
                      <div className="w-20 h-20 flex items-center justify-center">
                        {/* يمكن استبدال هذا بصورة حقيقية */}
                        <div className={`w-full h-full rounded-lg flex items-center justify-center text-4xl ${item.rarity === 'legendary' ? 'bg-gradient-to-br from-[#FFD700]/20 to-[#D4AF37]/30' : 'bg-gradient-to-br from-[#1B4D3E]/20 to-black/30'}`}>
                          {item.type === 'frame' && '🖼️'}
                          {item.type === 'avatar' && '👤'}
                          {item.type === 'badge' && '🏅'}
                          {item.type === 'chip' && '🪙'}
                          {item.type === 'table' && '🎮'}
                          {item.type === 'card' && '🃏'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-bold text-sm text-white">{item.name}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-400">{getItemTypeText(item.type)}</span>
                        <span className={`text-xs font-semibold ${getRarityColor(item.rarity)}`}>
                          {item.rarity === 'common' && 'عادي'}
                          {item.rarity === 'rare' && 'نادر'}
                          {item.rarity === 'epic' && 'أسطوري'}
                          {item.rarity === 'legendary' && 'أسطوري نادر'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-black/20 rounded-lg border border-gray-800">
                <Package className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-400">لا توجد عناصر في هذه القسم حالياً</p>
                <p className="text-xs text-gray-500 mt-2">العب المزيد من المباريات للحصول على عناصر جديدة!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* نافذة منبثقة لتفاصيل العنصر */}
      {selectedItem && (
        <Dialog open={openItemDialog} onOpenChange={setOpenItemDialog}>
          <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-black to-[#1a1708] border-[#D4AF37]/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-[#D4AF37]">
                {selectedItem.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="h-48 w-48 bg-gradient-to-br from-[#1B4D3E]/20 to-black/30 flex items-center justify-center mx-auto rounded-lg mb-4 relative">
                {/* العنصر المحدد */}
                <div className="w-32 h-32 flex items-center justify-center text-7xl">
                  {selectedItem.type === 'frame' && '🖼️'}
                  {selectedItem.type === 'avatar' && '👤'}
                  {selectedItem.type === 'badge' && '🏅'}
                  {selectedItem.type === 'chip' && '🪙'}
                  {selectedItem.type === 'table' && '🎮'}
                  {selectedItem.type === 'card' && '🃏'}
                </div>
                
                {selectedItem.equipped && (
                  <div className="absolute top-2 right-2 bg-[#D4AF37] text-black text-xs px-2 py-0.5 rounded-md font-bold">
                    مُجهز
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-300">{getItemTypeText(selectedItem.type)}</span>
                <span className={`text-sm font-semibold ${getRarityColor(selectedItem.rarity)}`}>
                  {selectedItem.rarity === 'common' && 'عادي'}
                  {selectedItem.rarity === 'rare' && 'نادر'}
                  {selectedItem.rarity === 'epic' && 'أسطوري'}
                  {selectedItem.rarity === 'legendary' && 'أسطوري نادر'}
                </span>
              </div>
              
              <p className="text-sm text-gray-300 mb-3">{selectedItem.description}</p>
              
              <div className="text-xs text-gray-400">
                تم الحصول عليه: {selectedItem.acquired}
              </div>
            </div>
            
            <DialogFooter className="sm:justify-between">
              <Button 
                variant="ghost" 
                className="text-gray-400"
                onClick={() => setOpenItemDialog(false)}
              >
                إغلاق
              </Button>
              
              <Button 
                className={selectedItem.equipped ? "bg-red-600 hover:bg-red-700" : "bg-[#D4AF37] hover:bg-[#C9A431]"}
                onClick={() => {
                  toggleEquip(selectedItem.id);
                  setOpenItemDialog(false);
                }}
              >
                {selectedItem.equipped ? 'إلغاء التجهيز' : 'تجهيز'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* نافذة منبثقة للترحيب بالمستخدمين الجدد */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-[#121212] to-[#1a1708] border-[#D4AF37] text-white shadow-[0_0_25px_rgba(212,175,55,0.3)]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-[#D4AF37] flex items-center justify-center gap-2">
              <Gift className="h-6 w-6 text-[#D4AF37]" />
              مبروك! لقد ربحت إطار جديد
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 flex flex-col items-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-black/30 flex items-center justify-center mb-4 relative border-4 border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <div className="animate-pulse-slow">
                <div className="w-32 h-32 flex items-center justify-center text-7xl">
                  🖼️
                </div>
              </div>
              
              <div className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-xs px-2 py-0.5 rounded-full font-bold animate-bounce">
                جديد!
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-[#D4AF37] mb-2">إطار الترحيب الذهبي</h3>
            <p className="text-center text-gray-300 mb-4">
              أهلاً بك في عائلة بوكر ستارز! لقد أضفنا إلى حقيبتك إطار خاص كهدية ترحيبية.
            </p>
            <p className="text-center text-sm text-[#D4AF37]/80">
              استمتع بإطارك الجديد وتباهى به أمام أصدقائك! يمكنك تجهيزه من حقيبتك في أي وقت.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              className="w-full bg-[#D4AF37] hover:bg-[#C9A431] text-black font-bold"
              onClick={() => setShowWelcomeDialog(false)}
            >
              رائع، شكراً لكم!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}