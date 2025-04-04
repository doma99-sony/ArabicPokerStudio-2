import React, { useState } from 'react';
import { Link } from "wouter";
import { 
  PlayingCard, 
  CardHand, 
  CommunityCards,
  PlayerCards
} from '@/components/game/playing-card';
import { Button } from '@/components/ui/button';
import { Card as UICard, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// استيراد أنواع البطاقات من نفس ملف مكون البطاقة
type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Value = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
interface Card {
  suit: Suit;
  value: Value;
}

// أمثلة على أوراق اللعب لاستخدامها في العرض التوضيحي
const exampleCards: Record<string, Card[]> = {
  royalFlush: [
    { suit: 'hearts', value: '10' },
    { suit: 'hearts', value: 'J' },
    { suit: 'hearts', value: 'Q' },
    { suit: 'hearts', value: 'K' },
    { suit: 'hearts', value: 'A' }
  ],
  fourOfAKind: [
    { suit: 'hearts', value: 'A' },
    { suit: 'diamonds', value: 'A' },
    { suit: 'clubs', value: 'A' },
    { suit: 'spades', value: 'A' },
    { suit: 'hearts', value: 'K' }
  ],
  fullHouse: [
    { suit: 'hearts', value: 'K' },
    { suit: 'diamonds', value: 'K' },
    { suit: 'clubs', value: 'K' },
    { suit: 'hearts', value: '10' },
    { suit: 'diamonds', value: '10' }
  ],
  flush: [
    { suit: 'diamonds', value: '2' },
    { suit: 'diamonds', value: '5' },
    { suit: 'diamonds', value: '9' },
    { suit: 'diamonds', value: 'J' },
    { suit: 'diamonds', value: 'A' }
  ],
  straight: [
    { suit: 'hearts', value: '5' },
    { suit: 'clubs', value: '6' },
    { suit: 'diamonds', value: '7' },
    { suit: 'spades', value: '8' },
    { suit: 'hearts', value: '9' }
  ],
  threeOfAKind: [
    { suit: 'hearts', value: 'Q' },
    { suit: 'diamonds', value: 'Q' },
    { suit: 'clubs', value: 'Q' },
    { suit: 'spades', value: '3' },
    { suit: 'hearts', value: '9' }
  ],
  twoPair: [
    { suit: 'hearts', value: 'J' },
    { suit: 'diamonds', value: 'J' },
    { suit: 'clubs', value: '8' },
    { suit: 'spades', value: '8' },
    { suit: 'hearts', value: 'A' }
  ],
  onePair: [
    { suit: 'hearts', value: '10' },
    { suit: 'diamonds', value: '10' },
    { suit: 'clubs', value: '5' },
    { suit: 'spades', value: '7' },
    { suit: 'hearts', value: 'K' }
  ],
  highCard: [
    { suit: 'hearts', value: 'A' },
    { suit: 'diamonds', value: 'J' },
    { suit: 'clubs', value: '9' },
    { suit: 'spades', value: '5' },
    { suit: 'hearts', value: '3' }
  ],
  playerHand: [
    { suit: 'hearts', value: 'A' },
    { suit: 'clubs', value: 'A' }
  ],
  communityCards: [
    { suit: 'diamonds', value: 'K' },
    { suit: 'spades', value: 'K' },
    { suit: 'hearts', value: '10' },
    { suit: 'clubs', value: '5' },
    { suit: 'diamonds', value: '2' }
  ]
};

// مكون لتمثيل خطوة في اللعبة
function GameStep({ number, title, description, children }: { 
  number: number; 
  title: string; 
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative mb-10 bg-black bg-opacity-40 p-6 rounded-xl shadow-lg border-r-2 border-l-2 border-[#D4AF37]/30">
      {/* رقم الخطوة */}
      <div className="absolute -top-5 -right-5 w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold shadow-lg">
        {number}
      </div>
      
      <h3 className="text-xl font-bold text-[#D4AF37] mb-2 mt-1">{title}</h3>
      <p className="text-white/90 mb-4">{description}</p>
      
      {/* المحتوى الإضافي مثل الصور أو الأوراق */}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}

// مكون لتمثيل ترتيب يد في البوكر
function PokerHand({ name, cards, description, arabicName }: { 
  name: string; 
  cards: Card[]; 
  description: string;
  arabicName: string;
}) {
  return (
    <div className="flex flex-col mb-6">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-[#D4AF37] font-bold">{arabicName}</h4>
        <Badge variant="outline" className="border-[#D4AF37]/50 text-[#D4AF37]">
          {name}
        </Badge>
      </div>
      
      <div className="bg-black bg-opacity-40 p-4 rounded-lg shadow-inner mb-2">
        <CardHand cards={cards} size="sm" variant="default" overlap="slight" />
      </div>
      
      <p className="text-sm text-white/80">{description}</p>
    </div>
  );
}

// مكون لتمثيل خطوة إجراء في اللعبة
function ActionStep({ name, arabicName, description, className }: { 
  name: string; 
  arabicName: string; 
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("p-4 rounded-lg shadow-md mb-4", className)}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">{arabicName}</h3>
        <Badge>{name}</Badge>
      </div>
      <p className="text-sm opacity-90">{description}</p>
    </div>
  );
}

// الصفحة الرئيسية
export default function HowToPlayPage() {
  const [tab, setTab] = useState('basics');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] text-white">
      {/* Header decoration */}
      <div className="relative h-24 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 via-[#D4AF37]/20 to-[#D4AF37]/5"></div>
        
        {/* Card suits decoration */}
        <div className="absolute top-2 left-2 text-[#D4AF37]/10 text-4xl">♠</div>
        <div className="absolute bottom-2 right-2 text-[#D4AF37]/10 text-4xl">♥</div>
        <div className="absolute top-2 right-5 text-[#D4AF37]/10 text-3xl">♣</div>
        <div className="absolute bottom-2 left-5 text-[#D4AF37]/10 text-3xl">♦</div>
        
        <div className="container mx-auto px-2 h-full flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] mb-1">
            كيف تلعب البوكر
          </h1>
          <p className="text-[#D4AF37]/80 text-center max-w-xl text-sm">
            دليل شامل لقواعد لعبة تكساس هولدم ومصطلحاتها وترتيب الأوراق
          </p>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-2 py-2">
        <Tabs defaultValue="basics" className="mb-8" value={tab} onValueChange={setTab}>
          <div className="flex justify-center mb-6">
            <TabsList className="bg-black/50 p-1">
              <TabsTrigger
                value="basics"
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:shadow-lg"
              >
                أساسيات اللعبة
              </TabsTrigger>
              <TabsTrigger
                value="hands"
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:shadow-lg"
              >
                ترتيب الأوراق
              </TabsTrigger>
              <TabsTrigger
                value="actions"
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:shadow-lg"
              >
                إجراءات اللعب
              </TabsTrigger>
              <TabsTrigger
                value="tips"
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:shadow-lg"
              >
                نصائح للفوز
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* أساسيات اللعبة */}
          <TabsContent value="basics" className="relative">
            {/* زخرفة خلفية */}
            <div className="absolute -top-20 -left-20 text-[#D4AF37]/5 text-[300px] pointer-events-none">
              ♠
            </div>
            <div className="absolute -bottom-20 -right-20 text-[#D4AF37]/5 text-[300px] pointer-events-none transform rotate-180">
              ♥
            </div>
            
            <div className="relative z-10">
              <div className="max-w-3xl mx-auto">
                <UICard className="bg-black/50 border-[#D4AF37]/20 shadow-lg mb-8">
                  <CardHeader>
                    <CardTitle className="text-[#D4AF37]">ما هو بوكر تكساس هولدم؟</CardTitle>
                    <CardDescription>أشهر أنواع البوكر وأكثرها انتشارًا حول العالم</CardDescription>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <p>
                      تكساس هولدم هي لعبة بوكر يحصل فيها كل لاعب على ورقتين سريتين، ثم يتم وضع خمس أوراق مشتركة على الطاولة. الهدف هو تكوين أفضل يد من خمس أوراق باستخدام أي مزيج من الأوراق السرية والمشتركة.
                    </p>
                    
                    <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-6">
                      <div className="text-center">
                        <p className="mb-2 text-[#D4AF37]">أوراقك السرية</p>
                        <PlayerCards cards={exampleCards.playerHand} size="md" />
                      </div>
                      
                      <div className="flex items-center">
                        <div className="h-16 w-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-2xl">+</div>
                      </div>
                      
                      <div className="text-center">
                        <p className="mb-2 text-[#D4AF37]">الأوراق المشتركة</p>
                        <CommunityCards cards={exampleCards.communityCards} size="sm" />
                      </div>
                      
                      <div className="flex items-center">
                        <div className="h-16 w-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-2xl">=</div>
                      </div>
                      
                      <div className="text-center">
                        <p className="mb-2 text-[#D4AF37]">يدك النهائية (أفضل 5 أوراق)</p>
                        <CardHand cards={[
                          { suit: 'hearts', value: 'A' },
                          { suit: 'clubs', value: 'A' },
                          { suit: 'diamonds', value: 'K' },
                          { suit: 'spades', value: 'K' },
                          { suit: 'hearts', value: '10' }
                        ]} size="sm" variant="gold" />
                      </div>
                    </div>
                  </CardContent>
                </UICard>
                
                <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">خطوات اللعبة</h2>
                
                <GameStep
                  number={1}
                  title="توزيع الأوراق السرية"
                  description="يحصل كل لاعب على ورقتين سريتين لا يراها أحد سواه."
                >
                  <div className="flex justify-center space-x-4 space-x-reverse">
                    <PlayerCards cards={[{ suit: 'hearts', value: 'A' }, { suit: 'spades', value: 'K' }]} size="md" />
                    <PlayerCards cards={[{ suit: 'clubs', value: 'Q' }, { suit: 'diamonds', value: 'J' }]} size="md" />
                  </div>
                </GameStep>
                
                <GameStep
                  number={2}
                  title="جولة الرهان الأولى (pre-flop)"
                  description="يبدأ اللاعبون بوضع رهانات إجبارية (الرهانات الصغيرة والكبيرة)، ثم يقرر كل لاعب ما إذا كان سيستمر في اللعبة أو ينسحب."
                >
                  <div className="flex justify-center">
                    <div className="bg-green-900/40 rounded-full w-16 h-16 flex items-center justify-center">
                      <span className="text-[#D4AF37] font-bold">الرهان</span>
                    </div>
                  </div>
                </GameStep>
                
                <GameStep
                  number={3}
                  title="الفلوب (Flop)"
                  description="يتم وضع ثلاث أوراق مشتركة على الطاولة، ويمكن لجميع اللاعبين استخدامها."
                >
                  <div className="flex justify-center">
                    <CommunityCards cards={[
                      { suit: 'hearts', value: '10' },
                      { suit: 'diamonds', value: 'J' },
                      { suit: 'clubs', value: 'Q' }
                    ]} size="md" />
                  </div>
                </GameStep>
                
                <GameStep
                  number={4}
                  title="جولة الرهان الثانية"
                  description="يقوم اللاعبون بجولة أخرى من الرهانات بناءً على ما لديهم وما يظهر على الطاولة."
                />
                
                <GameStep
                  number={5}
                  title="التيرن (Turn)"
                  description="يتم وضع ورقة مشتركة رابعة على الطاولة."
                >
                  <div className="flex justify-center">
                    <CommunityCards cards={[
                      { suit: 'hearts', value: '10' },
                      { suit: 'diamonds', value: 'J' },
                      { suit: 'clubs', value: 'Q' },
                      { suit: 'spades', value: 'K' }
                    ]} size="md" />
                  </div>
                </GameStep>
                
                <GameStep
                  number={6}
                  title="جولة الرهان الثالثة"
                  description="يقوم اللاعبون بجولة أخرى من الرهانات."
                />
                
                <GameStep
                  number={7}
                  title="الريفر (River)"
                  description="يتم وضع الورقة المشتركة الخامسة والأخيرة على الطاولة."
                >
                  <div className="flex justify-center">
                    <CommunityCards cards={[
                      { suit: 'hearts', value: '10' },
                      { suit: 'diamonds', value: 'J' },
                      { suit: 'clubs', value: 'Q' },
                      { suit: 'spades', value: 'K' },
                      { suit: 'hearts', value: 'A' }
                    ]} size="md" />
                  </div>
                </GameStep>
                
                <GameStep
                  number={8}
                  title="جولة الرهان النهائية"
                  description="آخر فرصة للاعبين لوضع رهانات."
                />
                
                <GameStep
                  number={9}
                  title="المواجهة (Showdown)"
                  description="يكشف اللاعبون المتبقون عن أوراقهم، ويفوز صاحب أفضل يد بالمبلغ المتراكم (البوت)."
                >
                  <div className="flex flex-col items-center">
                    <div className="flex justify-center flex-wrap gap-4 mb-4">
                      <div className="text-center">
                        <p className="mb-1 text-[#D4AF37]">لاعب 1</p>
                        <PlayerCards cards={[{ suit: 'hearts', value: 'A' }, { suit: 'spades', value: 'K' }]} size="sm" />
                      </div>
                      <div className="text-center">
                        <p className="mb-1 text-[#D4AF37]">لاعب 2</p>
                        <PlayerCards cards={[{ suit: 'clubs', value: 'Q' }, { suit: 'diamonds', value: 'J' }]} size="sm" />
                      </div>
                    </div>
                    
                    <div className="bg-green-900/40 p-4 rounded-lg">
                      <p className="text-center mb-2 text-[#D4AF37]">يد الفائز: فلاش ملكي</p>
                      <CardHand cards={[
                        { suit: 'hearts', value: '10' },
                        { suit: 'hearts', value: 'J' },
                        { suit: 'hearts', value: 'Q' },
                        { suit: 'hearts', value: 'K' },
                        { suit: 'hearts', value: 'A' }
                      ]} size="sm" variant="gold" />
                    </div>
                  </div>
                </GameStep>
                
                <div className="flex justify-center mt-8 mb-4">
                  <Button 
                    className="bg-[#D4AF37] hover:bg-[#BF9B30] text-black font-bold"
                    onClick={() => setTab('hands')}
                  >
                    التالي: ترتيب الأوراق
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* ترتيب الأوراق */}
          <TabsContent value="hands">
            <div className="max-w-3xl mx-auto">
              <UICard className="bg-black/50 border-[#D4AF37]/20 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-[#D4AF37]">ترتيب الأوراق في البوكر</CardTitle>
                  <CardDescription>
                    من الأقوى (فلاش ملكي) إلى الأضعف (الورقة العالية)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PokerHand
                      name="Royal Flush"
                      arabicName="فلاش ملكي"
                      cards={exampleCards.royalFlush}
                      description="أندر وأقوى يد - تتكون من 10, J, Q, K, A من نفس النوع"
                    />
                    
                    <PokerHand
                      name="Four of a Kind"
                      arabicName="رباعية"
                      cards={exampleCards.fourOfAKind}
                      description="أربع أوراق من نفس القيمة"
                    />
                    
                    <PokerHand
                      name="Full House"
                      arabicName="فول هاوس"
                      cards={exampleCards.fullHouse}
                      description="ثلاثية (ثلاث أوراق من نفس القيمة) مع زوج (ورقتان من نفس القيمة)"
                    />
                    
                    <PokerHand
                      name="Flush"
                      arabicName="فلاش"
                      cards={exampleCards.flush}
                      description="خمس أوراق من نفس النوع (ليست متتالية)"
                    />
                    
                    <PokerHand
                      name="Straight"
                      arabicName="ستريت"
                      cards={exampleCards.straight}
                      description="خمس أوراق متتالية من أنواع مختلفة"
                    />
                    
                    <PokerHand
                      name="Three of a Kind"
                      arabicName="ثلاثية"
                      cards={exampleCards.threeOfAKind}
                      description="ثلاث أوراق من نفس القيمة"
                    />
                    
                    <PokerHand
                      name="Two Pair"
                      arabicName="زوجان"
                      cards={exampleCards.twoPair}
                      description="زوجان من أوراق مختلفة من نفس القيمة"
                    />
                    
                    <PokerHand
                      name="One Pair"
                      arabicName="زوج واحد"
                      cards={exampleCards.onePair}
                      description="ورقتان من نفس القيمة"
                    />
                    
                    <PokerHand
                      name="High Card"
                      arabicName="الورقة العالية"
                      cards={exampleCards.highCard}
                      description="لا يوجد أي تركيبة من الأوراق، وتُحسب قيمة اليد بأعلى ورقة"
                    />
                  </div>
                </CardContent>
              </UICard>
              
              <div className="flex justify-between mt-8 mb-4">
                <Button 
                  variant="outline" 
                  className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  onClick={() => setTab('basics')}
                >
                  العودة: أساسيات اللعبة
                </Button>
                <Button 
                  className="bg-[#D4AF37] hover:bg-[#BF9B30] text-black font-bold"
                  onClick={() => setTab('actions')}
                >
                  التالي: إجراءات اللعب
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* إجراءات اللعب */}
          <TabsContent value="actions">
            <div className="max-w-3xl mx-auto">
              <UICard className="bg-black/50 border-[#D4AF37]/20 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-[#D4AF37]">إجراءات اللعب</CardTitle>
                  <CardDescription>
                    الخيارات المتاحة أمامك خلال جولات الرهان
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <ActionStep
                      name="Check"
                      arabicName="الشيك"
                      description="تمرير دورك بدون رهان إذا لم يكن هناك رهانات سابقة في الجولة."
                      className="bg-blue-900/20 border-r-4 border-blue-500"
                    />
                    
                    <ActionStep
                      name="Bet"
                      arabicName="الرهان"
                      description="وضع رهان إذا لم يكن هناك رهانات سابقة في الجولة."
                      className="bg-green-900/20 border-r-4 border-green-500"
                    />
                    
                    <ActionStep
                      name="Call"
                      arabicName="الكول"
                      description="مطابقة الرهان السابق للبقاء في اللعبة."
                      className="bg-yellow-900/20 border-r-4 border-yellow-500"
                    />
                    
                    <ActionStep
                      name="Raise"
                      arabicName="الرفع"
                      description="زيادة الرهان السابق، مما يجبر اللاعبين الآخرين على مطابقة الرهان الجديد."
                      className="bg-orange-900/20 border-r-4 border-orange-500"
                    />
                    
                    <ActionStep
                      name="Fold"
                      arabicName="الفولد"
                      description="الانسحاب من الجولة الحالية وخسارة أي رهانات وضعتها سابقًا."
                      className="bg-red-900/20 border-r-4 border-red-500"
                    />
                    
                    <ActionStep
                      name="All-In"
                      arabicName="الأول-إن"
                      description="وضع كل رقائقك في الرهان. إذا ربحت، تأخذ فقط من كل لاعب ما يعادل ما راهنت به."
                      className="bg-purple-900/20 border-r-4 border-purple-500"
                    />
                  </div>
                  
                  <div className="mt-8 p-4 bg-[#D4AF37]/10 rounded-lg">
                    <h3 className="text-[#D4AF37] font-bold mb-2">المصطلحات الشائعة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm"><span className="font-bold">الرهان الصغير (Small Blind):</span> رهان إجباري يضعه اللاعب على يسار الموزع.</p>
                      </div>
                      <div>
                        <p className="text-sm"><span className="font-bold">الرهان الكبير (Big Blind):</span> رهان إجباري يضعه اللاعب على يسار الرهان الصغير، عادة ضعف قيمة الرهان الصغير.</p>
                      </div>
                      <div>
                        <p className="text-sm"><span className="font-bold">البوت (Pot):</span> مجموع الرهانات في وسط الطاولة.</p>
                      </div>
                      <div>
                        <p className="text-sm"><span className="font-bold">الموزع (Dealer):</span> اللاعب الذي يوزع الأوراق، يشار إليه بزر الموزع.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </UICard>
              
              <div className="flex justify-between mt-8 mb-4">
                <Button 
                  variant="outline" 
                  className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  onClick={() => setTab('hands')}
                >
                  العودة: ترتيب الأوراق
                </Button>
                <Button 
                  className="bg-[#D4AF37] hover:bg-[#BF9B30] text-black font-bold"
                  onClick={() => setTab('tips')}
                >
                  التالي: نصائح للفوز
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* نصائح للفوز */}
          <TabsContent value="tips">
            <div className="max-w-3xl mx-auto">
              <UICard className="bg-black/50 border-[#D4AF37]/20 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-[#D4AF37]">نصائح للاعبين</CardTitle>
                  <CardDescription>
                    استراتيجيات وأفكار لتحسين لعبك
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-[#D4AF37]/10 to-black rounded-lg">
                      <h3 className="text-[#D4AF37] font-bold mb-2">1. اختيار الأوراق الأولية بحكمة</h3>
                      <p className="text-white/90">لا تلعب كل الأيدي. تعلم قيمة الأوراق الأولية وتجنب اللعب بالأوراق الضعيفة. الأزواج العالية والأوراق المترابطة من نفس النوع لها قيمة أكبر.</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-[#D4AF37]/10 to-black rounded-lg">
                      <h3 className="text-[#D4AF37] font-bold mb-2">2. انتبه لموقعك على الطاولة</h3>
                      <p className="text-white/90">المواقع المتأخرة (قريب من الموزع) أفضل لأنها تتيح لك رؤية قرارات اللاعبين الآخرين قبل اتخاذ قرارك.</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-[#D4AF37]/10 to-black rounded-lg">
                      <h3 className="text-[#D4AF37] font-bold mb-2">3. اقرأ اللاعبين الآخرين</h3>
                      <p className="text-white/90">انتبه لأنماط لعب خصومك وعاداتهم. هل يلعبون بحذر أم بعدوانية؟ هل لديهم "علامات" معينة عندما يكون لديهم يد قوية أو ضعيفة؟</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-[#D4AF37]/10 to-black rounded-lg">
                      <h3 className="text-[#D4AF37] font-bold mb-2">4. إدارة رقائقك بحكمة</h3>
                      <p className="text-white/90">لا تخاطر بكل رقائقك إلا إذا كنت متأكدًا. حافظ على رصيد كافٍ يسمح لك بالاستمرار في اللعب والتعافي من الخسائر.</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-[#D4AF37]/10 to-black rounded-lg">
                      <h3 className="text-[#D4AF37] font-bold mb-2">5. فهم الاحتمالات</h3>
                      <p className="text-white/90">تعلم احتمالات تحسين يدك مع كل ورقة جديدة. هذا سيساعدك في اتخاذ قرارات أفضل بشأن متابعة اللعب أو الانسحاب.</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-[#D4AF37]/10 to-black rounded-lg">
                      <h3 className="text-[#D4AF37] font-bold mb-2">6. تجنب الانحياز العاطفي</h3>
                      <p className="text-white/90">لا تتخذ قرارات بناءً على المشاعر. بعد خسارة كبيرة، خذ استراحة قصيرة لاستعادة تركيزك بدلاً من محاولة استرداد خسائرك على الفور.</p>
                    </div>
                    
                    <div className="p-4 bg-[#D4AF37] text-black rounded-lg font-bold">
                      <h3 className="mb-2">أهم نصيحة: استمتع باللعبة!</h3>
                      <p>البوكر لعبة مهارة وحظ وصبر. كلما لعبت أكثر، كلما تحسنت مهاراتك. استمتع بالرحلة واجعل تجربتك ممتعة!</p>
                    </div>
                  </div>
                </CardContent>
              </UICard>
              
              <div className="flex justify-center mt-8 mb-8">
                <Link href="/">
                  <Button 
                    className="bg-[#D4AF37] hover:bg-[#BF9B30] text-black font-bold px-8 py-6 text-lg"
                  >
                    ابدأ اللعب الآن!
                  </Button>
                </Link>
              </div>
              
              <div className="flex justify-between mt-8 mb-4">
                <Button 
                  variant="outline" 
                  className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  onClick={() => setTab('actions')}
                >
                  العودة: إجراءات اللعب
                </Button>
                <Button 
                  variant="outline" 
                  className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  onClick={() => setTab('basics')}
                >
                  العودة للبداية
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}