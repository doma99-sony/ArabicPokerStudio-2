import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coins, Gift, Tag } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const offers = [
  {
    id: 1,
    title: "الباقة البرونزية",
    description: "باقة مميزة تحتوي على 1,000 رقاقة",
    price: "5 دولار",
    chips: 1000,
    discount: "0%",
    isPopular: false,
    color: "bg-amber-700",
    textColor: "text-amber-700",
    borderColor: "border-amber-700",
  },
  {
    id: 2,
    title: "الباقة الفضية",
    description: "باقة مميزة تحتوي على 5,000 رقاقة",
    price: "20 دولار",
    chips: 5000,
    discount: "20%",
    isPopular: true,
    color: "bg-gray-400",
    textColor: "text-gray-400",
    borderColor: "border-gray-400",
  },
  {
    id: 3,
    title: "الباقة الذهبية",
    description: "باقة مميزة تحتوي على 12,000 رقاقة",
    price: "40 دولار",
    chips: 12000,
    discount: "25%",
    isPopular: false,
    color: "bg-[#D4AF37]",
    textColor: "text-[#D4AF37]",
    borderColor: "border-[#D4AF37]",
  },
  {
    id: 4,
    title: "الباقة الماسية",
    description: "باقة مميزة تحتوي على 25,000 رقاقة",
    price: "80 دولار",
    chips: 25000,
    discount: "30%",
    isPopular: false,
    color: "bg-cyan-400",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-400",
  },
  {
    id: 5,
    title: "باقة VIP",
    description: "باقة مميزة تحتوي على 60,000 رقاقة + عضوية VIP لمدة شهر",
    price: "150 دولار",
    chips: 60000,
    discount: "35%",
    isPopular: false,
    color: "bg-purple-500",
    textColor: "text-purple-500", 
    borderColor: "border-purple-500",
  },
];

export default function OffersPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md border-[#D4AF37] bg-black/70 text-white">
          <CardHeader>
            <CardTitle className="text-[#D4AF37]">يجب تسجيل الدخول أولاً</CardTitle>
            <CardDescription className="text-gray-400">
              يجب عليك تسجيل الدخول لمشاهدة عروض الشحن
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => navigate("/login")} 
              className="bg-[#D4AF37] text-black hover:bg-[#B08D1A] w-full"
            >
              تسجيل الدخول
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handlePurchase = (offerId: number) => {
    alert(`سيتم التواصل مباشرة مع المسؤول للاتفاق على طريقة الدفع وتفعيل العرض رقم ${offerId}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1B4D3E] to-black/90 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="mr-2 bg-black/20 hover:bg-[#D4AF37]/20 text-[#D4AF37]"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-[#D4AF37] flex items-center">
            <Tag className="mr-2 h-6 w-6" />
            عروض الشحن
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0A3A2A]/80 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30">
            <Coins className="h-4 w-4 text-[#D4AF37] ml-2" />
            <span className="text-[#D4AF37] font-bold">
              {user?.chips?.toLocaleString('ar-EG') || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 bg-gradient-to-b from-black/80 to-[#0A3A2A]/20">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-[#D4AF37] text-2xl font-bold">باقات الرقائق المميزة</h2>
            <p className="text-gray-400 mt-2">اختر الباقة المناسبة لك واحصل على رقائق إضافية مجانية!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((offer) => (
              <Card 
                key={offer.id} 
                className={`border-2 ${offer.borderColor} bg-black/70 text-white overflow-hidden transform transition-all duration-300 hover:scale-[1.02] ${offer.isPopular ? 'ring-2 ring-[#D4AF37]' : ''}`}
              >
                {offer.isPopular && (
                  <div className="absolute top-0 right-0 bg-[#D4AF37] text-black px-3 py-1 text-xs font-bold rounded-bl-lg z-10">
                    الأكثر شعبية
                  </div>
                )}
                <div className={`${offer.color} h-2 w-full`}></div>
                <CardHeader className="pb-2">
                  <CardTitle className={`${offer.textColor}`}>{offer.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {offer.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center justify-center mb-3">
                    <Coins className={`${offer.textColor} h-10 w-10 ml-2`} />
                    <span className="text-white text-3xl font-bold">
                      {offer.chips.toLocaleString('ar-EG')}
                    </span>
                  </div>
                  
                  {offer.discount !== "0%" && (
                    <div className="bg-green-900/50 rounded-full py-1 px-3 text-green-400 text-sm font-bold text-center mb-3">
                      خصم {offer.discount}
                    </div>
                  )}
                  
                  <div className="text-xl font-bold text-center text-white">
                    {offer.price}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${offer.color} text-black font-bold hover:opacity-90`}
                    onClick={() => handlePurchase(offer.id)}
                  >
                    شراء الآن
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* قسم التواصل المباشر */}
          <Card className="border-2 border-[#D4AF37] bg-black/70 text-white mt-6">
            <CardHeader>
              <CardTitle className="text-[#D4AF37] text-center">تواصل مباشرة للعروض الخاصة</CardTitle>
              <CardDescription className="text-gray-400 text-center">
                تمتع بعروض حصرية عند التواصل معنا مباشرة عبر واتساب
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-200 mb-4">للحصول على أفضل العروض وباقات مخصصة لاحتياجاتك</p>
              <Button 
                variant="outline" 
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                onClick={() => window.open("https://wa.me/201008508826", "_blank")}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="currentColor" 
                  viewBox="0 0 24 24" 
                  className="h-5 w-5 ml-2"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                تواصل مع المسؤول
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}