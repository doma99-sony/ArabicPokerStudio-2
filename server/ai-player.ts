import { Card } from "@/types";

// تعريف مستويات صعوبة اللاعب الوهمي
export enum AILevel {
  BEGINNER = "beginner", // مبتدئ - قرارات بسيطة وعشوائية في كثير من الأحيان
  INTERMEDIATE = "intermediate", // متوسط - استراتيجية أساسية ولكن مع بعض الأخطاء
  EXPERT = "expert", // خبير - استراتيجية متقدمة واحتمالية أقل للأخطاء
  PRO = "pro" // محترف - استراتيجية متطورة مع محاكاة أسلوب لاعبين حقيقيين
}

interface AIDecisionParams {
  level: AILevel; // مستوى الذكاء الاصطناعي
  cards: Card[]; // بطاقات اللاعب
  communityCards: Card[]; // بطاقات المجتمع المكشوفة
  pot: number; // مجموع المراهنات الحالي
  currentBet: number; // قيمة الرهان الحالي
  minRaise: number; // الحد الأدنى للزيادة
  chips: number; // رقائق اللاعب الوهمي المتاحة
  betHistory: string[]; // سجل المراهنات السابقة للجولة الحالية
  playersCount: number; // عدد اللاعبين المشاركين
  activePlayers: number; // عدد اللاعبين النشطين (لم ينسحبوا)
  position: number; // موقع اللاعب في الطاولة (مبكر، متوسط، متأخر)
  gameStage: string; // مرحلة اللعبة (preflop, flop, turn, river)
  opponentBetSize: number; // حجم رهان الخصم
  callProbability: number; // احتمالية المجاراة المحسوبة بناءً على القوة
  raiseProbability: number; // احتمالية رفع الرهان المحسوبة بناءً على القوة
  handStrength: number; // قوة اليد (0-1)
}

interface AIDecision {
  action: "fold" | "check" | "call" | "raise" | "all_in";
  amount?: number;
  reason?: string; // سبب اتخاذ هذا القرار (للتصحيح)
}

export function calculateHandStrength(cards: Card[], communityCards: Card[]): number {
  // تنفيذ حقيقي سيتضمن احتساب احتمالية تشكيل يد قوية
  // للتبسيط، سنستخدم حسابات أساسية بناءً على قيم البطاقات
  
  // إذا لم تكن هناك بطاقات مجتمع بعد، نعتمد فقط على قيمة البطاقات اليدوية
  if (communityCards.length === 0) {
    // حساب قوة البطاقات اليدوية فقط
    return calculatePreflopHandStrength(cards);
  }
  
  // دمج بطاقات اليد وبطاقات المجتمع
  const allCards = [...cards, ...communityCards];
  
  // حساب بسيط لقوة اليد بناءً على قيمة البطاقات
  // في التنفيذ الحقيقي، ستكون هذه أكثر تعقيداً بكثير لتحسب احتمالية الحصول على تراكيب مثل:
  // زوج، زوجين، ثلاثية، ستريت، فلاش، فول هاوس، رباعية، ستريت فلاش
  
  // حساب عدد الأزواج والثلاثيات والرباعيات
  const valueCount: Record<string, number> = {};
  const suitCount: Record<string, number> = {};
  
  allCards.forEach(card => {
    valueCount[card.value] = (valueCount[card.value] || 0) + 1;
    suitCount[card.suit] = (suitCount[card.suit] || 0) + 1;
  });
  
  // تحقق من وجود تراكيب قوية
  let strength = 0;
  
  // تحقق من وجود رباعية (Four of a Kind)
  const hasFourOfAKind = Object.values(valueCount).some(count => count >= 4);
  if (hasFourOfAKind) strength += 0.9;
  
  // تحقق من وجود ثلاثية (Three of a Kind)
  const hasThreeOfAKind = Object.values(valueCount).some(count => count >= 3);
  if (hasThreeOfAKind) strength += 0.7;
  
  // تحقق من وجود أزواج (Pairs)
  const pairs = Object.values(valueCount).filter(count => count >= 2).length;
  strength += pairs * 0.3;
  
  // تحقق من وجود فلاش محتمل (5 بطاقات من نفس اللون)
  const hasFlushDraw = Object.values(suitCount).some(count => count >= 4);
  if (hasFlushDraw) strength += 0.4;
  
  // تطبيع القيمة لتكون بين 0 و 1
  strength = Math.min(Math.max(strength, 0), 1);
  
  return strength;
}

function calculatePreflopHandStrength(cards: Card[]): number {
  if (cards.length !== 2) return 0;
  
  // قيم البطاقات مرتبة من الأضعف إلى الأقوى
  const valueOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  
  // الحصول على قيم البطاقات
  const card1Value = cards[0].value;
  const card2Value = cards[1].value;
  
  // الحصول على لون البطاقات
  const card1Suit = cards[0].suit;
  const card2Suit = cards[1].suit;
  
  // تحقق مما إذا كانت البطاقات متطابقة (زوج)
  const isPair = card1Value === card2Value;
  
  // تحقق مما إذا كانت البطاقات من نفس اللون
  const isSuited = card1Suit === card2Suit;
  
  // قيمة البطاقات (0-12)
  const value1 = valueOrder.indexOf(card1Value);
  const value2 = valueOrder.indexOf(card2Value);
  
  // تأكد من أن value1 هو الأعلى
  const highValue = Math.max(value1, value2);
  const lowValue = Math.min(value1, value2);
  
  // حساب قوة اليد
  let strength = 0;
  
  // زيادة القوة بناءً على قيمة البطاقات
  strength += highValue / 12 * 0.4; // 40% من الوزن للبطاقة الأعلى
  strength += lowValue / 12 * 0.2; // 20% من الوزن للبطاقة الأدنى
  
  // زيادة القوة إذا كانت البطاقات متطابقة (زوج)
  if (isPair) {
    strength += 0.3 + (highValue / 12) * 0.2; // زوج أعلى أفضل
  }
  
  // زيادة القوة إذا كانت البطاقات من نفس اللون
  if (isSuited) {
    strength += 0.1;
  }
  
  // زيادة القوة إذا كانت البطاقات متتالية (احتمال ستريت)
  const isConnector = Math.abs(value1 - value2) <= 2;
  if (isConnector) {
    strength += 0.1;
  }
  
  // زيادة القوة للبطاقات القوية المعروفة
  // AA, KK, QQ, JJ, AK
  if (isPair && highValue >= 10) { // Pair of Jacks or higher
    strength += 0.2;
  } else if (highValue === 12 && lowValue >= 11) { // AK
    strength += 0.15;
  }
  
  // تطبيع القيمة لتكون بين 0 و 1
  strength = Math.min(Math.max(strength, 0), 1);
  
  return strength;
}

export function makeAIDecision(params: AIDecisionParams): AIDecision {
  const {
    level,
    cards,
    communityCards,
    pot,
    currentBet,
    minRaise,
    chips,
    betHistory,
    playersCount,
    activePlayers,
    position,
    gameStage,
    handStrength
  } = params;
  
  // عوامل عشوائية تختلف بناءً على مستوى الذكاء الاصطناعي
  // كلما زاد المستوى، قل عامل العشوائية
  let randomFactor: number;
  switch (level) {
    case AILevel.BEGINNER:
      randomFactor = 0.5; // 50% عشوائية
      break;
    case AILevel.INTERMEDIATE:
      randomFactor = 0.3; // 30% عشوائية
      break;
    case AILevel.EXPERT:
      randomFactor = 0.15; // 15% عشوائية
      break;
    case AILevel.PRO:
      randomFactor = 0.05; // 5% عشوائية
      break;
    default:
      randomFactor = 0.3;
  }
  
  // احتمالية المخاطرة تعتمد على مستوى الذكاء الاصطناعي
  let riskTolerance: number;
  switch (level) {
    case AILevel.BEGINNER:
      riskTolerance = 0.2 + Math.random() * 0.4; // 0.2-0.6
      break;
    case AILevel.INTERMEDIATE:
      riskTolerance = 0.3 + Math.random() * 0.3; // 0.3-0.6
      break;
    case AILevel.EXPERT:
      riskTolerance = 0.4 + Math.random() * 0.3; // 0.4-0.7
      break;
    case AILevel.PRO:
      riskTolerance = 0.5 + Math.random() * 0.3; // 0.5-0.8
      break;
    default:
      riskTolerance = 0.4;
  }
  
  // تعديل قوة اليد بناءً على عامل العشوائية
  let adjustedHandStrength = handStrength * (1 - randomFactor) + Math.random() * randomFactor;
  
  // تعديل قوة اليد بناءً على مرحلة اللعبة
  // في المراحل المبكرة، اللاعبون الوهميون المتقدمون يكونون أكثر تحفظاً
  if (gameStage === "preflop" && level === AILevel.PRO) {
    adjustedHandStrength *= 0.8; // يقلل من قوة اليد في preflop للأكثر احترافية
  }
  
  // تعديل قوة اليد بناءً على الموقع
  // المواقع المتأخرة تسمح بمزيد من المخاطرة
  if (position > playersCount * 0.7) {
    adjustedHandStrength *= 1.2; // زيادة قوة اليد للمواقع المتأخرة
  }
  
  // حساب قيمة الراتيو pot odds
  const potOdds = currentBet > 0 ? currentBet / (pot + currentBet) : 0;
  
  // احتمالية الانسحاب
  const foldProbability = Math.max(0, 1 - adjustedHandStrength - riskTolerance + potOdds);
  
  // احتمالية المجاراة
  const callProbability = adjustedHandStrength * 0.8 + riskTolerance * 0.2;
  
  // احتمالية الزيادة
  const raiseProbability = adjustedHandStrength * 0.7 + riskTolerance * 0.3;
  
  // احتمالية المجازفة بكل الرقائق
  const allInProbability = adjustedHandStrength * 0.4 + riskTolerance * 0.1;
  
  // صناعة القرار
  let decision: AIDecision;
  
  // إذا كان الرهان الحالي 0، يمكن التحقق أو الرهان
  if (currentBet === 0) {
    if (adjustedHandStrength > 0.6 || Math.random() < raiseProbability) {
      // الزيادة
      const raiseAmount = calculateRaiseAmount(minRaise, pot, chips, adjustedHandStrength, level);
      if (raiseAmount >= chips) {
        decision = { action: "all_in", reason: "رهان قوي مع يد جيدة" };
      } else {
        decision = { action: "raise", amount: raiseAmount, reason: "يد قوية، زيادة الرهان" };
      }
    } else {
      // التحقق
      decision = { action: "check", reason: "يد متوسطة، تحقق" };
    }
  } else {
    // هناك رهان حالي، يجب المجاراة أو الزيادة أو الانسحاب
    if (Math.random() < foldProbability) {
      // الانسحاب
      decision = { action: "fold", reason: "يد ضعيفة، انسحاب" };
    } else if (adjustedHandStrength > 0.8 || Math.random() < allInProbability) {
      // المجازفة بكل الرقائق
      decision = { action: "all_in", reason: "يد قوية جداً، مجازفة بكل الرقائق" };
    } else if (adjustedHandStrength > 0.6 || Math.random() < raiseProbability) {
      // الزيادة
      const raiseAmount = calculateRaiseAmount(minRaise, pot, chips, adjustedHandStrength, level);
      if (currentBet >= chips || raiseAmount >= chips) {
        decision = { action: "all_in", reason: "رهان كبير ولكن يد قوية" };
      } else {
        decision = { action: "raise", amount: raiseAmount, reason: "يد جيدة، زيادة الرهان" };
      }
    } else {
      // المجاراة
      if (currentBet >= chips) {
        decision = { action: "all_in", reason: "رهان كبير يتطلب كل الرقائق" };
      } else {
        decision = { action: "call", reason: "يد مقبولة، مجاراة" };
      }
    }
  }
  
  console.log(`قرار AI (${level}): ${decision.action}${decision.amount ? ' بمبلغ ' + decision.amount : ''}, السبب: ${decision.reason}, قوة اليد: ${handStrength}`);
  
  return decision;
}

function calculateRaiseAmount(
  minRaise: number,
  pot: number,
  chips: number,
  handStrength: number,
  level: AILevel
): number {
  // لاعب مبتدئ يرفع بشكل عشوائي
  if (level === AILevel.BEGINNER) {
    return Math.min(minRaise + Math.floor(Math.random() * 3) * minRaise, chips);
  }
  
  // الرهان كنسبة من وعاء المراهنات يعتمد على قوة اليد
  let betRatio: number;
  
  if (handStrength > 0.9) {
    // يد قوية جداً - رهان كبير
    betRatio = 1.0 + Math.random() * 0.5; // 100-150% من الوعاء
  } else if (handStrength > 0.8) {
    // يد قوية - رهان متوسط إلى كبير
    betRatio = 0.75 + Math.random() * 0.5; // 75-125% من الوعاء
  } else if (handStrength > 0.6) {
    // يد جيدة - رهان متوسط
    betRatio = 0.5 + Math.random() * 0.25; // 50-75% من الوعاء
  } else if (handStrength > 0.4) {
    // يد متوسطة - رهان صغير
    betRatio = 0.25 + Math.random() * 0.25; // 25-50% من الوعاء
  } else {
    // يد ضعيفة - رهان أدنى
    betRatio = 0.1 + Math.random() * 0.2; // 10-30% من الوعاء
  }
  
  // تعديل نسبة الرهان بناءً على مستوى الذكاء الاصطناعي
  switch (level) {
    case AILevel.INTERMEDIATE:
      betRatio *= 0.9 + Math.random() * 0.2; // 90-110% من النسبة الأصلية
      break;
    case AILevel.EXPERT:
      betRatio *= 0.85 + Math.random() * 0.3; // 85-115% من النسبة الأصلية
      break;
    case AILevel.PRO:
      // اللاعبون المحترفون يستخدمون استراتيجية مماثلة للاعبين الحقيقيين
      // يمكن أن يرفعوا الرهان بشكل متغير جداً لتضليل الخصوم
      if (Math.random() < 0.3) {
        // مخادعة محتملة - رهان غير متوقع
        betRatio = Math.random() < 0.5 ? 
          betRatio * 0.5 : // رهان صغير غير متوقع
          betRatio * 1.5;  // رهان كبير غير متوقع
      }
      break;
  }
  
  // حساب مبلغ الرهان
  let amount = Math.max(Math.floor(pot * betRatio), minRaise);
  
  // تقريب المبلغ إلى أقرب قيمة منطقية
  // اللاعبون المتقدمون يستخدمون أرقاماً غير نمطية (مثل 1250 بدلاً من 1000 أو 1500)
  if (level === AILevel.PRO || level === AILevel.EXPERT) {
    const roundingFactor = Math.random() < 0.7 ? 50 : 100;
    amount = Math.ceil(amount / roundingFactor) * roundingFactor;
    
    // أحياناً إضافة/إنقاص قيمة صغيرة لجعل الرهان يبدو أكثر بشرية
    if (Math.random() < 0.4) {
      amount += Math.floor(Math.random() * 5) * 10;
    }
  } else {
    // تقريب إلى أقرب 100 أو 50 للمستويات الأقل
    const roundingFactor = Math.random() < 0.5 ? 50 : 100;
    amount = Math.ceil(amount / roundingFactor) * roundingFactor;
  }
  
  // التأكد من أن المبلغ ليس أكبر من الرقائق المتاحة
  amount = Math.min(amount, chips);
  
  // التأكد من أن المبلغ ليس أقل من الحد الأدنى للزيادة
  amount = Math.max(amount, minRaise);
  
  return amount;
}