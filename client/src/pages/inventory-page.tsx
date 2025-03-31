import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Gift, Package, Award, ShoppingBag, Star, Search, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// أنواع العناصر في المتجر
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ItemType>("frame");
  const [searchQuery, setSearchQuery] = useState("");
  const [showWelcomeReward, setShowWelcomeReward] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    // محاكاة لتحميل العناصر من قاعدة البيانات
    const loadInventory = () => {
      // عنصر الإطار الترحيبي للاعبين الجدد
      const welcomeFrame: InventoryItem = {
        id: "welcome_frame_1",
        name: "إطار ترحيبي ذهبي",
        description: "إطار خاص يُمنح للاعبين الجدد، مزين بنقوش ذهبية فرعونية",
        imageSrc: "/assets/frames/welcome_frame.png",
        type: "frame",
        rarity: "rare",
        acquired: new Date().toISOString(),
        equipped: true
      };

      // أضف عناصر أخرى للمخزون
      const items: InventoryItem[] = [
        welcomeFrame,
        {
          id: "avatar_1",
          name: "عبقري البوكر",
          description: "صورة رمزية تُظهر مهاراتك العالية في لعبة البوكر",
          imageSrc: "/assets/avatars/poker_genius.png",
          type: "avatar",
          rarity: "common",
          acquired: new Date().toISOString(),
          equipped: true
        },
        {
          id: "badge_1",
          name: "لاعب متمرس",
          description: "شارة تُمنح بعد لعب 50 جولة بوكر",
          imageSrc: "/assets/badges/experienced_player.png",
          type: "badge",
          rarity: "common",
          acquired: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "chip_1",
          name: "رقاقة فرعونية",
          description: "رقاقة خاصة مزينة بنقوش فرعونية",
          imageSrc: "/assets/chips/pharaoh_chip.png",
          type: "chip",
          rarity: "epic",
          acquired: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "table_1",
          name: "طاولة الملوك",
          description: "طاولة فاخرة بتصميم ملكي ذهبي",
          imageSrc: "/assets/tables/kings_table.png",
          type: "table",
          rarity: "legendary",
          acquired: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "card_1",
          name: "أوراق لعب كلاسيكية",
          description: "مجموعة أوراق لعب بنقشة كلاسيكية أنيقة",
          imageSrc: "/assets/cards/classic_set.png",
          type: "card",
          rarity: "common",
          acquired: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          equipped: true
        }
      ];

      setInventory(items);

      // تحقق مما إذا كان يجب عرض مكافأة الترحيب
      const hasSeenWelcomeReward = localStorage.getItem("hasSeenWelcomeReward");
      if (!hasSeenWelcomeReward) {
        setShowWelcomeReward(true);
        localStorage.setItem("hasSeenWelcomeReward", "true");
      }
    };

    loadInventory();
  }, []);

  // فلترة العناصر حسب نوعها والبحث
  const filteredItems = inventory.filter(item => {
    const matchesType = item.type === activeTab;
    const matchesSearch = searchQuery 
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesType && matchesSearch;
  });

  // فتح تفاصيل العنصر
  const openItemDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowItemDetails(true);
  };

  // استخدام أو تجهيز العنصر
  const equipItem = (item: InventoryItem) => {
    // تحديث حالة الارتداء للعنصر
    setInventory(prevItems => 
      prevItems.map(i => {
        // إلغاء تجهيز العناصر الأخرى من نفس النوع إذا كان هناك عنصر واحد فقط يمكن ارتداؤه
        if (i.type === item.type) {
          return { ...i, equipped: i.id === item.id };
        }
        return i;
      })
    );

    // إغلاق النافذة
    setShowItemDetails(false);

    // إظهار رسالة نجاح
    toast({
      title: "تم التجهيز بنجاح",
      description: `تم تجهيز ${item.name}`,
      duration: 3000
    });
  };

  // الحصول على نص لنوع العنصر
  const getItemTypeText = (type: ItemType) => {
    const typeMap: Record<ItemType, string> = {
      frame: "إطار",
      avatar: "صورة رمزية",
      badge: "شارة",
      chip: "رقاقة",
      table: "طاولة",
      card: "أوراق لعب"
    };
    return typeMap[type] || type;
  };

  // الحصول على لون لمستوى الندرة
  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: "text-gray-400",
      rare: "text-blue-400",
      epic: "text-purple-400",
      legendary: "text-[#FFD700]"
    };
    return colors[rarity] || "text-gray-400";
  };

  // الحصول على نص عربي لمستوى الندرة
  const getRarityText = (rarity: string) => {
    const texts: Record<string, string> = {
      common: "شائع",
      rare: "نادر",
      epic: "أسطوري",
      legendary: "خارق"
    };
    return texts[rarity] || rarity;
  };

  // تنسيق التاريخ للعرض
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
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
            <h1 className="text-2xl font-bold text-[#D4AF37]">حقيبتي</h1>
            <ShoppingBag className="h-6 w-6 text-[#D4AF37]" />
          </div>
        </div>
        
        {/* شريط البحث */}
        <div className="bg-black/40 p-4 rounded-lg border border-[#D4AF37]/30 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#D4AF37]/20 p-2 rounded-full">
                <Tag className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#D4AF37]">مقتنياتك</p>
                <p className="text-sm text-white/70">عرض جميع العناصر المملوكة</p>
              </div>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input 
                type="text"
                placeholder="ابحث في المقتنيات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/30 border border-[#D4AF37]/20 rounded-lg pr-3 pl-10 py-2 w-full text-sm focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>
        
        {/* تبويبات أنواع العناصر */}
        <Tabs 
          defaultValue="frame" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ItemType)}
          className="w-full"
        >
          <div className="border-b border-[#D4AF37]/20">
            <TabsList className="bg-black/30 overflow-x-auto w-full">
              <TabsTrigger value="frame" className="text-[#D4AF37]">
                <div className="flex items-center gap-1">
                  <div className="h-4 w-4 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <span className="text-[0.5rem]">🖼️</span>
                  </div>
                  <span>الإطارات</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="avatar" className="text-[#D4AF37]">
                <div className="flex items-center gap-1">
                  <div className="h-4 w-4 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <span className="text-[0.5rem]">👤</span>
                  </div>
                  <span>الصور الرمزية</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="badge" className="text-[#D4AF37]">
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span>الشارات</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="chip" className="text-[#D4AF37]">
                <div className="flex items-center gap-1">
                  <div className="h-4 w-4 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <span className="text-[0.5rem]">🎮</span>
                  </div>
                  <span>الرقاقات</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="table" className="text-[#D4AF37]">
                <div className="flex items-center gap-1">
                  <div className="h-4 w-4 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <span className="text-[0.5rem]">🎲</span>
                  </div>
                  <span>الطاولات</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="card" className="text-[#D4AF37]">
                <div className="flex items-center gap-1">
                  <div className="h-4 w-4 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <span className="text-[0.5rem]">🃏</span>
                  </div>
                  <span>أوراق اللعب</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* محتوى كل تبويب */}
          {(["frame", "avatar", "badge", "chip", "table", "card"] as ItemType[]).map((tabType) => (
            <TabsContent key={tabType} value={tabType} className="mt-6">
              {filteredItems.length === 0 ? (
                <div className="bg-black/20 rounded-lg border border-[#D4AF37]/20 p-8 text-center">
                  <Package className="h-12 w-12 text-[#D4AF37]/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">لا توجد عناصر</h3>
                  <p className="text-sm text-white/60 mb-4">
                    ليس لديك أي {getItemTypeText(tabType)} في حقيبتك حتى الآن
                  </p>
                  <Button 
                    onClick={() => navigate("/shop")}
                    className="bg-[#D4AF37] hover:bg-[#c9a431] text-black"
                  >
                    <Star className="h-4 w-4 ml-1" />
                    تسوق الآن
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-black/40 rounded-lg border ${
                        item.equipped ? 'border-[#D4AF37]' : 'border-gray-700/30'
                      } overflow-hidden cursor-pointer hover:shadow-[0_0_8px_rgba(212,175,55,0.2)] transition-all duration-300`}
                      onClick={() => openItemDetails(item)}
                    >
                      <div className="relative p-4 bg-gradient-to-b from-[#1a1708]/60 to-black/60">
                        {item.equipped && (
                          <div className="absolute top-2 right-2 bg-[#D4AF37] text-black text-xs px-1.5 py-0.5 rounded-sm font-bold">
                            مجهز
                          </div>
                        )}
                        
                        <div className="h-28 flex items-center justify-center mb-3">
                          {/* في الواقع، سيتم استبدال هذا بصور حقيقية للعناصر */}
                          <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                            {item.type === 'frame' && <span className="text-2xl">🖼️</span>}
                            {item.type === 'avatar' && <span className="text-2xl">👤</span>}
                            {item.type === 'badge' && <Award className="h-8 w-8 text-[#D4AF37]" />}
                            {item.type === 'chip' && <span className="text-2xl">🎮</span>}
                            {item.type === 'table' && <span className="text-2xl">🎲</span>}
                            {item.type === 'card' && <span className="text-2xl">🃏</span>}
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-lg text-[#D4AF37] text-center mb-1">{item.name}</h3>
                        
                        <div className="flex justify-center items-center mb-2">
                          <span className={`text-xs ${getRarityColor(item.rarity)}`}>
                            {getRarityText(item.rarity)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-white/60 text-center line-clamp-2 h-10">
                          {item.description}
                        </p>
                      </div>
                      
                      <div className="p-3 border-t border-gray-700/30 bg-black/30">
                        <p className="text-xs text-white/40 text-center">
                          تم الحصول عليه: {formatDate(item.acquired)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* نافذة الترحيب بالمكافآت للاعبين الجدد */}
      <Dialog open={showWelcomeReward} onOpenChange={setShowWelcomeReward}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-black to-[#1a1708] border-[#D4AF37]/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-[#D4AF37]">
              مرحباً بك في تكساس هولدم عرباوي!
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                <Gift className="h-10 w-10 text-[#D4AF37]" />
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">مبروك! لقد ربحت هدية</h3>
            <p className="text-white/70 mb-4">
              لقد حصلت على <span className="text-[#D4AF37] font-bold">إطار ترحيبي ذهبي</span> خاص للاعبين الجدد!
            </p>
            
            <div className="bg-[#1a1708] p-4 rounded-lg border border-[#D4AF37]/20 mb-4">
              <h4 className="font-bold text-[#D4AF37] mb-2">إطار ترحيبي ذهبي</h4>
              <p className="text-sm text-white/70 mb-2">
                إطار خاص مزين بنقوش ذهبية فرعونية يميزك عن باقي اللاعبين.
              </p>
              <p className="text-xs text-blue-400">
                نادر
              </p>
            </div>
            
            <p className="text-sm text-white/60 mb-4">
              يمكنك العثور على هذا الإطار في حقيبتك وتجهيزه على الفور!
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              className="w-full bg-[#D4AF37] hover:bg-[#c9a431] text-black"
              onClick={() => setShowWelcomeReward(false)}
            >
              شكراً لك!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* نافذة تفاصيل العنصر */}
      {selectedItem && (
        <Dialog open={showItemDetails} onOpenChange={setShowItemDetails}>
          <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-black to-[#1a1708] border-[#D4AF37]/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-[#D4AF37]">
                {selectedItem.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-24 h-24 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                  {selectedItem.type === 'frame' && <span className="text-4xl">🖼️</span>}
                  {selectedItem.type === 'avatar' && <span className="text-4xl">👤</span>}
                  {selectedItem.type === 'badge' && <Award className="h-12 w-12 text-[#D4AF37]" />}
                  {selectedItem.type === 'chip' && <span className="text-4xl">🎮</span>}
                  {selectedItem.type === 'table' && <span className="text-4xl">🎲</span>}
                  {selectedItem.type === 'card' && <span className="text-4xl">🃏</span>}
                </div>
              </div>
              
              <div className="flex justify-center items-center mb-3">
                <span className={`text-sm px-2 py-0.5 rounded-full bg-black/30 ${getRarityColor(selectedItem.rarity)}`}>
                  {getRarityText(selectedItem.rarity)}
                </span>
              </div>
              
              <p className="text-sm text-white/80 text-center mb-4">
                {selectedItem.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg">
                  <span className="text-white/70">النوع:</span>
                  <span className="font-medium text-white">{getItemTypeText(selectedItem.type)}</span>
                </div>
                
                <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg">
                  <span className="text-white/70">تاريخ الحصول:</span>
                  <span className="font-medium text-white">{formatDate(selectedItem.acquired)}</span>
                </div>
                
                <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg">
                  <span className="text-white/70">الحالة:</span>
                  <span className={selectedItem.equipped ? "text-green-400" : "text-yellow-400"}>
                    {selectedItem.equipped ? "مجهز" : "غير مجهز"}
                  </span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="sm:justify-between">
              <Button 
                variant="outline" 
                className="text-white/70 border-white/20"
                onClick={() => setShowItemDetails(false)}
              >
                إغلاق
              </Button>
              
              <Button 
                className={selectedItem.equipped ? "bg-gray-700 hover:bg-gray-600" : "bg-[#D4AF37] hover:bg-[#c9a431] text-black"}
                onClick={() => equipItem(selectedItem)}
                disabled={selectedItem.equipped}
              >
                {selectedItem.equipped ? "مجهز بالفعل" : "تجهيز العنصر"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}