import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  ArrowRight, 
  Save, 
  Volume2, 
  VolumeX, 
  Lock, 
  Facebook, 
  User, 
  Key, 
  Wallet, 
  Download, 
  Upload, 
  CheckCircle,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack
} from "lucide-react";
import { useMusic } from "@/components/background-music";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // استخدام سياق الموسيقى للتحكم في الأغاني
  const { volume: musicVolume, setVolume: setMusicVolume, isPlaying, togglePlay, currentTrack, nextTrack, previousTrack } = useMusic();
  
  // إعدادات الصوت
  const [volume, setVolume] = useState<number>(70);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // إعدادات الخزنة
  const [showVaultDialog, setShowVaultDialog] = useState<boolean>(false);
  const [vaultAction, setVaultAction] = useState<"deposit" | "withdraw">("deposit");
  const [vaultAmount, setVaultAmount] = useState<string>("");
  const [vaultChips, setVaultChips] = useState<number>(0);
  const [vaultPin, setVaultPin] = useState<string>("");
  const [isVaultSetup, setIsVaultSetup] = useState<boolean>(false);
  const [showVaultSetupDialog, setShowVaultSetupDialog] = useState<boolean>(false);
  const [newVaultPin, setNewVaultPin] = useState<string>("");
  const [confirmVaultPin, setConfirmVaultPin] = useState<string>("");
  
  // ربط الحساب
  const [showLinkAccountDialog, setShowLinkAccountDialog] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isProcessingLink, setIsProcessingLink] = useState<boolean>(false);
  
  // محاكاة إعدادات الخزنة المحفوظة
  useEffect(() => {
    // في تطبيق حقيقي، هذه البيانات ستأتي من واجهة برمجة التطبيقات (API)
    const hasVault = localStorage.getItem("hasVault") === "true";
    setIsVaultSetup(hasVault);
    
    if (hasVault) {
      const savedVaultChips = parseInt(localStorage.getItem("vaultChips") || "0");
      setVaultChips(savedVaultChips);
    }
    
    // حفظ مستوى الصوت
    const savedVolume = parseInt(localStorage.getItem("volume") || "70");
    const savedMute = localStorage.getItem("muted") === "true";
    setVolume(savedVolume);
    setIsMuted(savedMute);
  }, []);
  
  // حفظ إعدادات الصوت
  useEffect(() => {
    localStorage.setItem("volume", volume.toString());
    localStorage.setItem("muted", isMuted.toString());
  }, [volume, isMuted]);
  
  // محاكاة عملية ربط الحساب
  const handleLinkAccount = () => {
    if (password !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور وتأكيد كلمة المرور غير متطابقين",
        variant: "destructive"
      });
      return;
    }
    
    if (username.length < 3) {
      toast({
        title: "خطأ",
        description: "اسم المستخدم يجب أن يكون أكثر من 3 أحرف",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون أكثر من 6 أحرف",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessingLink(true);
    
    // محاكاة طلب API - في الإصدار الحقيقي سيكون هذا طلب حقيقي للخادم
    setTimeout(() => {
      setIsProcessingLink(false);
      setShowLinkAccountDialog(false);
      
      toast({
        title: "تم ربط الحساب بنجاح",
        description: `تم تحويل حساب الضيف إلى حساب دائم باسم ${username}`,
      });
      
      // في تطبيق حقيقي، ستقوم بتسجيل الدخول تلقائيًا بالحساب الجديد
    }, 1500);
  };
  
  // محاكاة إعداد الخزنة
  const handleSetupVault = () => {
    if (newVaultPin.length < 4) {
      toast({
        title: "خطأ",
        description: "يجب أن يكون PIN الخزنة 4 أرقام على الأقل",
        variant: "destructive"
      });
      return;
    }
    
    if (newVaultPin !== confirmVaultPin) {
      toast({
        title: "خطأ",
        description: "رمز PIN وتأكيد رمز PIN غير متطابقين",
        variant: "destructive"
      });
      return;
    }
    
    // في تطبيق حقيقي، ستقوم بإرسال طلب API لإعداد الخزنة
    localStorage.setItem("hasVault", "true");
    localStorage.setItem("vaultPin", newVaultPin);
    localStorage.setItem("vaultChips", "0");
    
    setIsVaultSetup(true);
    setVaultChips(0);
    setShowVaultSetupDialog(false);
    
    toast({
      title: "تم إعداد الخزنة بنجاح",
      description: "يمكنك الآن إيداع وسحب الرقاقات من خزنتك",
    });
  };
  
  // محاكاة عمليات الخزنة
  const handleVaultOperation = () => {
    const storedPin = localStorage.getItem("vaultPin");
    if (vaultPin !== storedPin) {
      toast({
        title: "خطأ",
        description: "رمز PIN غير صحيح",
        variant: "destructive"
      });
      return;
    }
    
    const amount = parseInt(vaultAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح",
        variant: "destructive"
      });
      return;
    }
    
    if (vaultAction === "deposit") {
      // التحقق من أن المستخدم لديه رقاقات كافية
      if (user && (user.chips < amount)) {
        toast({
          title: "خطأ",
          description: "ليس لديك رقاقات كافية للإيداع",
          variant: "destructive"
        });
        return;
      }
      
      // في تطبيق حقيقي، ستقوم بإرسال طلب API لإيداع الرقاقات
      const newVaultBalance = vaultChips + amount;
      setVaultChips(newVaultBalance);
      localStorage.setItem("vaultChips", newVaultBalance.toString());
      
      toast({
        title: "تم الإيداع بنجاح",
        description: `تم إيداع ${amount.toLocaleString()} رقاقة في خزنتك`,
      });
    } else {
      // التحقق من أن الخزنة تحتوي على رقاقات كافية
      if (amount > vaultChips) {
        toast({
          title: "خطأ",
          description: "ليس لديك رقاقات كافية في الخزنة للسحب",
          variant: "destructive"
        });
        return;
      }
      
      // في تطبيق حقيقي، ستقوم بإرسال طلب API لسحب الرقاقات
      const newVaultBalance = vaultChips - amount;
      setVaultChips(newVaultBalance);
      localStorage.setItem("vaultChips", newVaultBalance.toString());
      
      toast({
        title: "تم السحب بنجاح",
        description: `تم سحب ${amount.toLocaleString()} رقاقة من خزنتك`,
      });
    }
    
    setShowVaultDialog(false);
    setVaultPin("");
    setVaultAmount("");
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
            <h1 className="text-2xl font-bold text-[#D4AF37]">الإعدادات</h1>
            <Save className="h-6 w-6 text-[#D4AF37]" />
          </div>
        </div>
        
        <Tabs defaultValue="sound" className="w-full">
          <TabsList className="w-full mb-6 bg-black/40 border border-[#D4AF37]/20">
            <TabsTrigger 
              value="sound" 
              className="flex-1 text-white data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
            >
              الصوت
            </TabsTrigger>
            <TabsTrigger 
              value="vault" 
              className="flex-1 text-white data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
            >
              الخزنة
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              className="flex-1 text-white data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
            >
              الحساب
            </TabsTrigger>
          </TabsList>
          
          {/* إعدادات الصوت */}
          <TabsContent value="sound">
            <Card className="bg-black/40 border border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-[#D4AF37]">إعدادات الصوت</CardTitle>
                <CardDescription className="text-white/70">
                  تحكم في مستوى الصوت والمؤثرات الصوتية في اللعبة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="master-volume" className="text-white">
                      {isMuted ? (
                        <span className="flex items-center gap-2">
                          <VolumeX className="h-5 w-5 text-red-400" />
                          <span>الصوت مكتوم</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Volume2 className="h-5 w-5 text-[#D4AF37]" />
                          <span>مستوى الصوت العام</span>
                        </span>
                      )}
                    </Label>
                    <span className="text-white/70">{volume}%</span>
                  </div>
                  <Slider
                    id="master-volume"
                    value={[volume]} 
                    min={0} 
                    max={100} 
                    step={1}
                    disabled={isMuted}
                    onValueChange={(value) => setVolume(value[0])}
                    className={isMuted ? "opacity-50" : ""}
                  />
                </div>
                
                <div className="flex items-center space-x-2 justify-end space-x-reverse">
                  <Label htmlFor="mute-toggle" className="text-white/90">
                    كتم الصوت
                  </Label>
                  <Switch 
                    id="mute-toggle" 
                    checked={isMuted} 
                    onCheckedChange={setIsMuted} 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="effects-volume" className="text-white">المؤثرات الصوتية</Label>
                    <span className="text-white/70">{volume - 10 < 0 ? 0 : volume - 10}%</span>
                  </div>
                  <Slider
                    id="effects-volume"
                    value={[volume - 10 < 0 ? 0 : volume - 10]} 
                    min={0} 
                    max={100} 
                    step={1}
                    disabled={isMuted}
                    onValueChange={(value) => setVolume(value[0] + 10 > 100 ? 100 : value[0] + 10)}
                    className={isMuted ? "opacity-50" : ""}
                  />
                </div>
                
                {/* تحكم بالموسيقى الخلفية */}
                <div className="bg-[#1a1708]/70 rounded-lg p-4 border border-[#D4AF37]/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#D4AF37] flex items-center gap-2">
                      <Music className="h-5 w-5" />
                      الأغاني والموسيقى
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={previousTrack}
                        className="text-white hover:bg-[#D4AF37]/10"
                      >
                        <SkipBack className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={togglePlay}
                        className="text-white hover:bg-[#D4AF37]/10"
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={nextTrack}
                        className="text-white hover:bg-[#D4AF37]/10"
                      >
                        <SkipForward className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-white/70">
                      {currentTrack?.title || "الأغنية الحالية"} - {currentTrack?.artist || "الفنان"}
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="music-volume" className="text-white flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-[#D4AF37]" />
                        <span>مستوى صوت الأغاني</span>
                      </Label>
                      <span className="text-white/70">{Math.round(musicVolume * 100)}%</span>
                    </div>
                    <Slider
                      id="music-volume"
                      value={[musicVolume * 100]} 
                      min={0} 
                      max={100} 
                      step={5}
                      disabled={!isPlaying}
                      onValueChange={(value) => setMusicVolume(value[0] / 100)}
                      className={!isPlaying ? "opacity-50" : ""}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="bg-[#D4AF37] hover:bg-[#B08D1A] text-black w-full"
                  onClick={() => {
                    toast({
                      title: "تم حفظ الإعدادات",
                      description: "تم حفظ إعدادات الصوت بنجاح",
                    });
                  }}
                >
                  <Save className="ml-2 h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* إعدادات الخزنة */}
          <TabsContent value="vault">
            <Card className="bg-black/40 border border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-[#D4AF37]">الخزنة</CardTitle>
                <CardDescription className="text-white/70">
                  {isVaultSetup 
                    ? "قم بإدارة رقاقاتك المخزنة بأمان في خزنتك الشخصية" 
                    : "قم بإعداد خزنة شخصية لتخزين رقاقاتك بأمان"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isVaultSetup ? (
                  <div className="space-y-6">
                    <div className="bg-[#1a1708]/70 rounded-lg p-4 border border-[#D4AF37]/20">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-[#D4AF37]">رصيد الخزنة</h3>
                        <div className="text-2xl font-bold text-white">{vaultChips.toLocaleString()} رقاقة</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 py-6"
                        onClick={() => {
                          setVaultAction("deposit");
                          setShowVaultDialog(true);
                        }}
                      >
                        <Upload className="h-5 w-5" />
                        إيداع رقاقات في الخزنة
                      </Button>
                      
                      <Button 
                        className="bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 py-6"
                        onClick={() => {
                          setVaultAction("withdraw");
                          setShowVaultDialog(true);
                        }}
                        disabled={vaultChips === 0}
                      >
                        <Download className="h-5 w-5" />
                        سحب رقاقات من الخزنة
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Wallet className="h-16 w-16 mx-auto mb-4 text-[#D4AF37]" />
                    <h3 className="text-xl font-bold text-[#D4AF37] mb-2">لم تقم بإعداد الخزنة بعد</h3>
                    <p className="text-white/70 mb-6">
                      قم بإعداد خزنة شخصية لتخزين رقاقاتك بأمان. ستحتاج إلى إنشاء رمز PIN سري للوصول إلى الخزنة.
                    </p>
                    <Button 
                      className="bg-[#D4AF37] hover:bg-[#B08D1A] text-black"
                      onClick={() => setShowVaultSetupDialog(true)}
                    >
                      <Lock className="ml-2 h-4 w-4" />
                      إعداد الخزنة
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* إعدادات الحساب */}
          <TabsContent value="account">
            <Card className="bg-black/40 border border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-[#D4AF37]">إعدادات الحساب</CardTitle>
                <CardDescription className="text-white/70">
                  إدارة حسابك وربط حساب الضيف
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-[#1a1708]/70 rounded-lg p-4 border border-[#D4AF37]/20">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-[#D4AF37] mb-1">معلومات الحساب</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/70 text-sm">نوع الحساب</p>
                        <p className="text-white font-bold flex items-center">
                          {user?.username?.startsWith("ضيف_") ? (
                            <>
                              <User className="inline-block mr-2 h-4 w-4 text-gray-400" />
                              حساب ضيف
                            </>
                          ) : (
                            <>
                              <CheckCircle className="inline-block mr-2 h-4 w-4 text-green-500" />
                              حساب مسجل
                            </>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm">اسم المستخدم</p>
                        <p className="text-white font-bold">{user?.username}</p>
                      </div>
                    </div>
                  </div>
                  
                  {user?.username?.startsWith("ضيف_") && (
                    <div className="mb-2">
                      <h3 className="text-lg font-bold text-[#D4AF37] mb-3">ربط الحساب</h3>
                      <p className="text-white/70 mb-4">
                        قم بتحويل حساب الضيف الخاص بك إلى حساب دائم للاحتفاظ برصيدك وتقدمك في اللعبة
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button 
                          variant="outline" 
                          className="border-[#D4AF37]/30 text-white hover:bg-[#D4AF37]/10 flex items-center justify-center gap-2 py-6"
                          onClick={() => setShowLinkAccountDialog(true)}
                        >
                          <User className="ml-2 h-5 w-5 text-[#D4AF37]" />
                          ربط بحساب جديد
                        </Button>
                        
                        <Button 
                          variant="outline"
                          className="border-blue-500/30 text-white hover:bg-blue-500/10 flex items-center justify-center gap-2 py-6"
                          onClick={() => {
                            toast({
                              title: "قريباً",
                              description: "ربط حساب الفيسبوك سيكون متاحاً قريباً",
                            });
                          }}
                        >
                          <Facebook className="ml-2 h-5 w-5 text-blue-500" />
                          ربط بحساب فيسبوك
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-[#1a1708]/70 rounded-lg p-4 border border-[#D4AF37]/20">
                  <h3 className="text-lg font-bold text-[#D4AF37] mb-3">خيارات أخرى</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications" className="text-white">
                        الإشعارات
                      </Label>
                      <Switch id="notifications" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-login" className="text-white">
                        تسجيل الدخول التلقائي
                      </Label>
                      <Switch id="auto-login" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-tips" className="text-white">
                        عرض نصائح اللعب
                      </Label>
                      <Switch id="show-tips" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="bg-[#D4AF37] hover:bg-[#B08D1A] text-black w-full"
                  onClick={() => {
                    toast({
                      title: "تم حفظ الإعدادات",
                      description: "تم حفظ إعدادات الحساب بنجاح",
                    });
                  }}
                >
                  <Save className="ml-2 h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* حوار ربط الحساب */}
      <Dialog open={showLinkAccountDialog} onOpenChange={setShowLinkAccountDialog}>
        <DialogContent className="bg-gradient-to-b from-black to-[#1a1708] border-[#D4AF37]/30 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-[#D4AF37]">
              ربط حسابك
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-white/70 mb-4 text-center">
              قم بإنشاء حساب دائم للاحتفاظ برصيدك وتقدمك في اللعبة
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">اسم المستخدم</Label>
                <div className="relative">
                  <User className="absolute right-3 top-2.5 h-5 w-5 text-[#D4AF37]/50" />
                  <Input 
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-black/60 border-[#D4AF37]/30 focus:border-[#D4AF37] pr-10"
                    placeholder="أدخل اسم المستخدم"
                    dir="rtl"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">كلمة المرور</Label>
                <div className="relative">
                  <Key className="absolute right-3 top-2.5 h-5 w-5 text-[#D4AF37]/50" />
                  <Input 
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/60 border-[#D4AF37]/30 focus:border-[#D4AF37] pr-10"
                    placeholder="أدخل كلمة المرور"
                    dir="rtl"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-white">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Key className="absolute right-3 top-2.5 h-5 w-5 text-[#D4AF37]/50" />
                  <Input 
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-black/60 border-[#D4AF37]/30 focus:border-[#D4AF37] pr-10"
                    placeholder="أكد كلمة المرور"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              className="text-white/70 border-white/20"
              onClick={() => setShowLinkAccountDialog(false)}
              disabled={isProcessingLink}
            >
              إلغاء
            </Button>
            
            <Button 
              className="bg-[#D4AF37] hover:bg-[#B08D1A] text-black"
              onClick={handleLinkAccount}
              disabled={!username || !password || !confirmPassword || isProcessingLink}
            >
              {isProcessingLink ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full ml-2"></span>
                  جاري المعالجة...
                </span>
              ) : (
                <>
                  <User className="ml-2 h-4 w-4" />
                  ربط الحساب
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* حوار إعداد الخزنة */}
      <Dialog open={showVaultSetupDialog} onOpenChange={setShowVaultSetupDialog}>
        <DialogContent className="bg-gradient-to-b from-black to-[#1a1708] border-[#D4AF37]/30 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-[#D4AF37]">
              إعداد الخزنة
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-white/70 mb-4 text-center">
              أنشئ رمز PIN للوصول إلى خزنتك الشخصية
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-pin" className="text-white">رمز PIN للخزنة</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-2.5 h-5 w-5 text-[#D4AF37]/50" />
                  <Input 
                    id="new-pin"
                    type="password"
                    value={newVaultPin}
                    onChange={(e) => setNewVaultPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="bg-black/60 border-[#D4AF37]/30 focus:border-[#D4AF37] pr-10"
                    placeholder="أدخل رمز PIN (أرقام فقط)"
                    dir="rtl"
                    maxLength={6}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-pin" className="text-white">تأكيد رمز PIN</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-2.5 h-5 w-5 text-[#D4AF37]/50" />
                  <Input 
                    id="confirm-pin"
                    type="password"
                    value={confirmVaultPin}
                    onChange={(e) => setConfirmVaultPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="bg-black/60 border-[#D4AF37]/30 focus:border-[#D4AF37] pr-10"
                    placeholder="أكد رمز PIN"
                    dir="rtl"
                    maxLength={6}
                  />
                </div>
              </div>
              
              <div className="rounded-lg bg-amber-500/10 p-3 border border-amber-500/30">
                <p className="text-amber-300 text-sm">
                  <strong>تنبيه هام:</strong> احتفظ برمز PIN الخاص بك. في حال نسيانه، لن تتمكن من الوصول إلى الرقاقات المخزنة في الخزنة.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              className="text-white/70 border-white/20"
              onClick={() => setShowVaultSetupDialog(false)}
            >
              إلغاء
            </Button>
            
            <Button 
              className="bg-[#D4AF37] hover:bg-[#B08D1A] text-black"
              onClick={handleSetupVault}
              disabled={!newVaultPin || !confirmVaultPin}
            >
              <Lock className="ml-2 h-4 w-4" />
              إعداد الخزنة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* حوار عمليات الخزنة */}
      <Dialog open={showVaultDialog} onOpenChange={setShowVaultDialog}>
        <DialogContent className="bg-gradient-to-b from-black to-[#1a1708] border-[#D4AF37]/30 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-[#D4AF37]">
              {vaultAction === "deposit" ? "إيداع رقاقات" : "سحب رقاقات"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4 p-3 bg-[#1a1708]/50 rounded-lg border border-[#D4AF37]/20">
              <div className="flex justify-between items-center">
                <span className="text-white/70">رصيد الخزنة:</span>
                <span className="text-white font-bold">{vaultChips.toLocaleString()} رقاقة</span>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-white/70">رصيد الحساب:</span>
                <span className="text-white font-bold">{user?.chips?.toLocaleString() || 0} رقاقة</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vault-amount" className="text-white">المبلغ</Label>
                <div className="relative">
                  <Input 
                    id="vault-amount"
                    value={vaultAmount}
                    onChange={(e) => setVaultAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    className="bg-black/60 border-[#D4AF37]/30 focus:border-[#D4AF37]"
                    placeholder={vaultAction === "deposit" ? "المبلغ المراد إيداعه" : "المبلغ المراد سحبه"}
                    dir="rtl"
                  />
                  <div className="absolute left-3 top-2">
                    <span className="text-[#D4AF37]">رقاقة</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vault-pin" className="text-white">رمز PIN للخزنة</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-2.5 h-5 w-5 text-[#D4AF37]/50" />
                  <Input 
                    id="vault-pin"
                    type="password"
                    value={vaultPin}
                    onChange={(e) => setVaultPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="bg-black/60 border-[#D4AF37]/30 focus:border-[#D4AF37] pr-10"
                    placeholder="أدخل رمز PIN"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              className="text-white/70 border-white/20"
              onClick={() => setShowVaultDialog(false)}
            >
              إلغاء
            </Button>
            
            <Button 
              className={vaultAction === "deposit" 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-amber-600 hover:bg-amber-700 text-white"}
              onClick={handleVaultOperation}
              disabled={!vaultAmount || !vaultPin}
            >
              {vaultAction === "deposit" ? (
                <>
                  <Upload className="ml-2 h-4 w-4" />
                  إيداع
                </>
              ) : (
                <>
                  <Download className="ml-2 h-4 w-4" />
                  سحب
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}