import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HelpCircle, X, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Adding props interface to control visibility from parent
interface GameInstructionsProps {
  showInstructions?: boolean;
  onClose?: () => void;
}

export function GameInstructions({ showInstructions = false, onClose }: GameInstructionsProps) {
  // Using internal state only when no external control is provided
  const [internalOpen, setInternalOpen] = useState(false);
  const [tab, setTab] = useState("general");
  
  // Use either external or internal state for controlling dialog open state
  const open = onClose ? showInstructions : internalOpen;
  const setOpen = onClose ? (value: boolean) => {
    if (!value) onClose();
  } : setInternalOpen;

  // ترتيبات اليد
  const handRankings = [
    {
      name: "الرويال فلاش",
      description: "خمس بطاقات متتالية من نفس النوع تبدأ بالآس",
      value: 10,
      textExample: "A K Q J 10 ♥"
    },
    {
      name: "ستريت فلاش",
      description: "خمس بطاقات متتالية من نفس النوع",
      value: 9,
      textExample: "9 8 7 6 5 ♠"
    },
    {
      name: "فور أوف كايند",
      description: "أربع بطاقات من نفس القيمة",
      value: 8,
      textExample: "J J J J 9"
    },
    {
      name: "فول هاوس",
      description: "ثلاث بطاقات من قيمة واحدة واثنتان من قيمة أخرى",
      value: 7,
      textExample: "10 10 10 K K"
    },
    {
      name: "فلاش",
      description: "خمس بطاقات من نفس النوع (غير متتالية)",
      value: 6,
      textExample: "A J 8 6 3 ♣"
    },
    {
      name: "ستريت",
      description: "خمس بطاقات متتالية من أنواع مختلفة",
      value: 5,
      textExample: "Q J 10 9 8"
    },
    {
      name: "ثري أوف كايند",
      description: "ثلاث بطاقات من نفس القيمة",
      value: 4,
      textExample: "8 8 8 K 3"
    },
    {
      name: "زوجان",
      description: "زوجان مختلفان من البطاقات",
      value: 3,
      textExample: "A A 7 7 4"
    },
    {
      name: "زوج واحد",
      description: "زوج واحد فقط من البطاقات",
      value: 2,
      textExample: "K K J 7 2"
    },
    {
      name: "كارت عالي",
      description: "لا توجد أي مجموعة، يتم اختيار أعلى بطاقة",
      value: 1,
      textExample: "A J 9 5 2"
    }
  ];

  return (
    <>
      {/* زر المعلومات في الطاولة - يظهر فقط عندما نستخدم الحالة الداخلية */}
      {!onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 bg-black/40 hover:bg-black/60 rounded-full w-10 h-10 flex items-center justify-center"
          onClick={() => setOpen(true)}
        >
          <HelpCircle className="h-6 w-6 text-gold" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-slate-900 text-white border-gold/30 w-full max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-gold font-tajawal">تعليمات لعبة البوكر</DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="absolute top-2 left-2">
                <X className="h-5 w-5 text-white" />
              </Button>
            </div>
            <DialogDescription className="text-slate-300">تعلم قواعد وأساسيات لعبة تكساس هولدم</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="w-full bg-slate-800">
              <TabsTrigger value="general" className="text-white data-[state=active]:bg-slate-700">أساسيات اللعبة</TabsTrigger>
              <TabsTrigger value="hand-rankings" className="text-white data-[state=active]:bg-slate-700">ترتيب الأيدي</TabsTrigger>
              <TabsTrigger value="game-flow" className="text-white data-[state=active]:bg-slate-700">مراحل اللعب</TabsTrigger>
              <TabsTrigger value="actions" className="text-white data-[state=active]:bg-slate-700">الإجراءات المتاحة</TabsTrigger>
            </TabsList>

            {/* أساسيات اللعبة */}
            <TabsContent value="general" className="border-none p-0 mt-4">
              <div className="space-y-4 text-white">
                <div className="bg-slate-800 rounded-md p-4">
                  <h3 className="text-xl font-bold mb-2 text-gold">نظرة عامة</h3>
                  <p className="mb-3">البوكر هي لعبة بطاقات شهيرة تجمع بين المهارة والحظ. الهدف هو الفوز بالرقائق (الشيبس) من اللاعبين الآخرين.</p>
                  <p>في لعبة تكساس هولدم، يحصل كل لاعب على بطاقتين خاصتين (غير مرئية للاعبين الآخرين)، ويتم وضع خمس بطاقات مكشوفة على الطاولة. يستخدم اللاعبون أفضل 5 بطاقات من أصل 7 (البطاقتين الخاصتين + البطاقات المكشوفة) لتكوين أفضل يد بوكر.</p>
                </div>

                <div className="bg-slate-800 rounded-md p-4">
                  <h3 className="text-xl font-bold mb-2 text-gold">الهدف</h3>
                  <p>الفوز بمجمع الرهان (البوت) عن طريق:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>امتلاك أفضل يد عند المواجهة النهائية (الشوداون)</li>
                    <li>دفع اللاعبين الآخرين للتخلي (الفولد) قبل المواجهة النهائية</li>
                  </ul>
                </div>

                <div className="bg-slate-800 rounded-md p-4">
                  <h3 className="text-xl font-bold mb-2 text-gold">طاولة البوكر</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="mb-2">تتكون طاولة البوكر من عدة عناصر مهمة:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>مواقع اللاعبين حول الطاولة</li>
                        <li>زر الموزع (D) يشير إلى موقع الديلر الافتراضي</li>
                        <li>البطاقات المجتمعية في وسط الطاولة</li>
                        <li>الرقائق (الشيبس) للمراهنة</li>
                        <li>مجمع الرهان (البوت) في وسط الطاولة</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900 rounded-md p-3 flex items-center justify-center">
                      <div className="text-center">
                        <div className="inline-block bg-green-800 p-4 rounded-full border-4 border-slate-700 relative">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-opacity-20 text-2xl font-bold">
                            ♠ ♥ ♦ ♣
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">طاولة بوكر نموذجية</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ترتيب الأيدي */}
            <TabsContent value="hand-rankings" className="border-none p-0 mt-4">
              <div className="space-y-4">
                <p className="text-white">ترتيب الأيدي من الأعلى قيمة إلى الأقل:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {handRankings.map((hand, index) => (
                    <Card key={index} className="bg-slate-800 border-slate-700">
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-bold text-gold">{hand.name}</h3>
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-white">{hand.value}</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">{hand.description}</p>
                        <div className="flex justify-center">
                          <div className="bg-slate-700 rounded-md p-2 text-center">
                            <span className={`text-xl font-mono ${index === 0 ? "text-gold" : "text-white"}`}>
                              {hand.textExample}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* مراحل اللعب */}
            <TabsContent value="game-flow" className="border-none p-0 mt-4">
              <div className="space-y-4 text-white">
                <div className="bg-slate-800 rounded-md p-4">
                  <h3 className="text-xl font-bold mb-2 text-gold">مراحل جولة البوكر</h3>
                  <div className="space-y-3 mt-3">
                    <div className="rounded-md bg-slate-700 p-3">
                      <h4 className="font-bold text-lg mb-1">1. الرهانات الإجبارية</h4>
                      <p>قبل توزيع البطاقات، يقوم اللاعبان على يسار الموزع بوضع رهانات إجبارية:</p>
                      <ul className="list-disc list-inside mt-1 text-sm">
                        <li>اللاعب الأول يضع "الرهان الصغير" (Small Blind)</li>
                        <li>اللاعب الثاني يضع "الرهان الكبير" (Big Blind) وهو ضعف الرهان الصغير عادة</li>
                      </ul>
                    </div>

                    <div className="rounded-md bg-slate-700 p-3">
                      <h4 className="font-bold text-lg mb-1">2. توزيع البطاقات الشخصية</h4>
                      <p>يحصل كل لاعب على بطاقتين مخفيتين (Hole Cards).</p>
                    </div>

                    <div className="rounded-md bg-slate-700 p-3">
                      <h4 className="font-bold text-lg mb-1">3. جولة المراهنة الأولى (Pre-flop)</h4>
                      <p>يبدأ اللاعب على يسار الرهان الكبير بالمراهنة ولديه خيار المتابعة، الرفع، أو التخلي.</p>
                    </div>

                    <div className="rounded-md bg-slate-700 p-3">
                      <h4 className="font-bold text-lg mb-1">4. الفلوب (Flop)</h4>
                      <p>يتم كشف ثلاث بطاقات مجتمعية على الطاولة تليها جولة مراهنة ثانية.</p>
                    </div>

                    <div className="rounded-md bg-slate-700 p-3">
                      <h4 className="font-bold text-lg mb-1">5. التيرن (Turn)</h4>
                      <p>يتم كشف البطاقة المجتمعية الرابعة تليها جولة مراهنة ثالثة.</p>
                    </div>

                    <div className="rounded-md bg-slate-700 p-3">
                      <h4 className="font-bold text-lg mb-1">6. الريفر (River)</h4>
                      <p>يتم كشف البطاقة المجتمعية الخامسة والأخيرة تليها جولة مراهنة نهائية.</p>
                    </div>

                    <div className="rounded-md bg-slate-700 p-3">
                      <h4 className="font-bold text-lg mb-1">7. المواجهة (Showdown)</h4>
                      <p>إذا بقي أكثر من لاعب بعد جولة المراهنة الأخيرة، يتم كشف البطاقات ويفوز اللاعب صاحب أفضل يد بالرهان.</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* الإجراءات المتاحة */}
            <TabsContent value="actions" className="border-none p-0 mt-4">
              <div className="space-y-4 text-white">
                <div className="bg-slate-800 rounded-md p-4">
                  <h3 className="text-xl font-bold mb-3 text-gold">الإجراءات المتاحة خلال اللعب</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-900/30 rounded-md p-3 border border-red-500/30">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white mr-2">F</div>
                        <h4 className="font-bold text-lg">التخلي (Fold)</h4>
                      </div>
                      <p className="text-sm">التخلي عن اللعب في هذه الجولة. تفقد أي رقائق وضعتها في الرهان، وتتجنب وضع المزيد.</p>
                    </div>

                    <div className="bg-green-900/30 rounded-md p-3 border border-green-500/30">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white mr-2">C</div>
                        <h4 className="font-bold text-lg">المتابعة (Check/Call)</h4>
                      </div>
                      <p className="text-sm">المتابعة بدون رهان (Check) إذا لم يكن هناك رهان سابق، أو المجاراة (Call) بوضع نفس مبلغ الرهان الحالي.</p>
                    </div>

                    <div className="bg-amber-900/30 rounded-md p-3 border border-amber-500/30">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white mr-2">R</div>
                        <h4 className="font-bold text-lg">الرفع (Raise)</h4>
                      </div>
                      <p className="text-sm">زيادة مبلغ الرهان الحالي. يجب أن يكون الرفع على الأقل ضعف الرهان السابق أو ضعف الرهان الكبير.</p>
                    </div>

                    <div className="bg-yellow-900/30 rounded-md p-3 border border-yellow-500/30">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-yellow-500 flex items-center justify-center text-white mr-2">A</div>
                        <h4 className="font-bold text-lg">كل ما لديك (All-In)</h4>
                      </div>
                      <p className="text-sm">وضع جميع الرقائق التي تملكها في الرهان. لن يمكنك التخلي بعد ذلك وستشارك في الرهانات الجانبية.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800 rounded-md p-4">
                  <h3 className="text-xl font-bold mb-2 text-gold">نصائح للمبتدئين</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>ابدأ بلعب الأيدي القوية فقط حتى تكتسب الخبرة</li>
                    <li>راقب خصومك وتعلم أنماط لعبهم</li>
                    <li>كن حذراً من المراهنات الكبيرة، فقد تعني يد قوية</li>
                    <li>لا تخف من التخلي إذا كانت يدك ضعيفة</li>
                    <li>تحكم في ميزانيتك ومراهناتك</li>
                    <li>استمتع باللعب واعتبره فرصة للتعلم!</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-white border-slate-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              العودة للعبة
            </Button>
            
            {tab !== "general" && (
              <Button variant="ghost" onClick={() => setTab("general")} className="text-slate-300">
                العودة للبداية
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}