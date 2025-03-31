import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// الخيارات المتاحة للصورة الرمزية
const avatarOptions = {
  backgrounds: [
    { id: "blue", name: "أزرق", color: "#3b82f6" },
    { id: "green", name: "أخضر", color: "#10b981" },
    { id: "red", name: "أحمر", color: "#ef4444" },
    { id: "purple", name: "بنفسجي", color: "#8b5cf6" },
    { id: "gold", name: "ذهبي", color: "#f59e0b" },
    { id: "gray", name: "رمادي", color: "#6b7280" },
  ],
  accessories: [
    { id: "none", name: "بدون", path: "" },
    { id: "cards", name: "أوراق لعب", path: "/accessories/cards.svg" },
    { id: "crown", name: "تاج", path: "/accessories/crown.svg" },
    { id: "sunglasses", name: "نظارة شمس", path: "/accessories/sunglasses.svg" },
    { id: "hat", name: "قبعة", path: "/accessories/hat.svg" },
    { id: "mic", name: "ميكروفون", path: "/accessories/mic.svg" },
  ],
  faces: [
    { id: "happy", name: "سعيد", path: "/faces/happy.svg" },
    { id: "cool", name: "رائع", path: "/faces/cool.svg" },
    { id: "serious", name: "جاد", path: "/faces/serious.svg" },
    { id: "angry", name: "غاضب", path: "/faces/angry.svg" },
    { id: "sleepy", name: "نعسان", path: "/faces/sleepy.svg" },
  ],
};

export function AvatarCreator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // اختيارات المستخدم الحالية
  const [selectedBackground, setSelectedBackground] = useState(avatarOptions.backgrounds[0].id);
  const [selectedFace, setSelectedFace] = useState(avatarOptions.faces[0].id);
  const [selectedAccessory, setSelectedAccessory] = useState(avatarOptions.accessories[0].id);
  
  // الصورة الرمزية السابقة للمستخدم (إن وجدت)
  const [existingAvatar, setExistingAvatar] = useState<string | null>(null);
  
  useEffect(() => {
    // تحميل الصورة الرمزية الحالية للمستخدم (إن وجدت)
    if (user?.avatar) {
      setExistingAvatar(user.avatar);
      
      // محاولة استخراج الاختيارات من الصورة الرمزية الحالية
      try {
        const avatarData = JSON.parse(user.avatar);
        if (avatarData.background) setSelectedBackground(avatarData.background);
        if (avatarData.face) setSelectedFace(avatarData.face);
        if (avatarData.accessory) setSelectedAccessory(avatarData.accessory);
      } catch (e) {
        // لا يمكن تحليل البيانات، ربما ليست بالتنسيق المتوقع
        console.log("تعذر تحليل بيانات الصورة الرمزية الحالية");
      }
    }
  }, [user]);
  
  // الحصول على البيانات الكاملة للاختيارات الحالية
  const getSelectedBackground = () => avatarOptions.backgrounds.find(bg => bg.id === selectedBackground) || avatarOptions.backgrounds[0];
  const getSelectedFace = () => avatarOptions.faces.find(face => face.id === selectedFace) || avatarOptions.faces[0];
  const getSelectedAccessory = () => avatarOptions.accessories.find(acc => acc.id === selectedAccessory) || avatarOptions.accessories[0];
  
  // توليد بيانات الصورة الرمزية
  const generateAvatarData = () => {
    return {
      background: selectedBackground,
      face: selectedFace,
      accessory: selectedAccessory
    };
  };
  
  // حفظ الصورة الرمزية
  const saveAvatar = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const avatarData = generateAvatarData();
      
      // تحديث الصورة الرمزية للمستخدم
      const response = await apiRequest(
        "/api/user/avatar",
        {
          method: "POST",
          body: JSON.stringify(avatarData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.ok) {
        toast({
          title: "تم الحفظ بنجاح",
          description: "تم حفظ الصورة الرمزية بنجاح",
        });
        setExistingAvatar(JSON.stringify(avatarData));
      } else {
        toast({
          title: "خطأ",
          description: "تعذر حفظ الصورة الرمزية. حاول مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الصورة الرمزية.",
        variant: "destructive",
      });
      console.error("خطأ في حفظ الصورة الرمزية:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // توليد الصورة الرمزية المخصصة
  const renderAvatar = () => {
    const background = getSelectedBackground();
    const face = getSelectedFace();
    const accessory = getSelectedAccessory();
    
    return (
      <div 
        className="relative w-40 h-40 mx-auto rounded-full flex items-center justify-center overflow-hidden shadow-lg border-4 border-white"
        style={{ backgroundColor: background.color }}
      >
        {/* الوجه */}
        {face.path && (
          <div className="absolute w-32 h-32">
            <img src={face.path} alt={face.name} className="w-full h-full" />
          </div>
        )}
        
        {/* الإكسسوار */}
        {accessory.path && (
          <div className="absolute w-32 h-32">
            <img src={accessory.path} alt={accessory.name} className="w-full h-full" />
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gold mb-4 text-center">الصورة الرمزية الخاصة بك</h2>
      
      {/* عرض الصورة الرمزية الحالية */}
      <div className="mb-6">
        {renderAvatar()}
        <div className="mt-2 text-center text-sm text-gray-400">
          {user?.username || "الضيف"}
        </div>
      </div>
      
      {/* خيارات التخصيص */}
      <Tabs defaultValue="background">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="background">الخلفية</TabsTrigger>
          <TabsTrigger value="face">الوجه</TabsTrigger>
          <TabsTrigger value="accessory">الإكسسوارات</TabsTrigger>
        </TabsList>
        
        {/* اختيار الخلفية */}
        <TabsContent value="background">
          <div className="grid grid-cols-3 gap-3">
            {avatarOptions.backgrounds.map((bg) => (
              <div 
                key={bg.id} 
                className={`w-16 h-16 rounded-full cursor-pointer mx-auto
                  ${selectedBackground === bg.id ? "ring-4 ring-gold" : "ring-2 ring-gray-600"}
                `}
                style={{ backgroundColor: bg.color }}
                onClick={() => setSelectedBackground(bg.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* اختيار الوجه */}
        <TabsContent value="face">
          <div className="grid grid-cols-3 gap-3">
            {avatarOptions.faces.map((face) => (
              <div 
                key={face.id} 
                className={`w-16 h-16 rounded-full bg-gray-200 cursor-pointer mx-auto flex items-center justify-center overflow-hidden
                  ${selectedFace === face.id ? "ring-4 ring-gold" : "ring-2 ring-gray-600"}
                `}
                onClick={() => setSelectedFace(face.id)}
              >
                {face.path && <img src={face.path} alt={face.name} className="w-12 h-12" />}
              </div>
            ))}
          </div>
        </TabsContent>
        
        {/* اختيار الإكسسوارات */}
        <TabsContent value="accessory">
          <div className="grid grid-cols-3 gap-3">
            {avatarOptions.accessories.map((accessory) => (
              <div 
                key={accessory.id} 
                className={`w-16 h-16 rounded-full bg-gray-200 cursor-pointer mx-auto flex items-center justify-center overflow-hidden
                  ${selectedAccessory === accessory.id ? "ring-4 ring-gold" : "ring-2 ring-gray-600"}
                `}
                onClick={() => setSelectedAccessory(accessory.id)}
              >
                {accessory.path && <img src={accessory.path} alt={accessory.name} className="w-12 h-12" />}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* زر الحفظ */}
      <div className="mt-6 text-center">
        <Button 
          onClick={saveAvatar} 
          disabled={isLoading}
          className="bg-gold hover:bg-gold/80 text-black px-8"
        >
          {isLoading ? "جاري الحفظ..." : "حفظ الصورة الرمزية"}
        </Button>
      </div>
    </Card>
  );
}