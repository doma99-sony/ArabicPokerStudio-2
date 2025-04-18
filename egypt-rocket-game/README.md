# صاروخ مصر (Egypt Rocket)

## نظرة عامة
"صاروخ مصر" هي لعبة مراهنات تفاعلية مستوحاة من التاريخ المصري القديم، حيث يراهن اللاعبون على مدى ارتفاع "صاروخ" (مضاعف) قبل أن "ينفجر". تجمع اللعبة بين عناصر الحظ والاستراتيجية في واجهة مستخدم جذابة بطابع مصري قديم.

## المميزات الرئيسية
- **نظام مضاعفات تصاعدي**: مضاعف يزداد مع مرور الوقت حتى ينفجر عند نقطة عشوائية.
- **قرارات إستراتيجية**: يجب على اللاعبين اتخاذ قرار بشأن وقت سحب أموالهم قبل الانفجار.
- **عنصر اجتماعي**: رؤية مراهنات اللاعبين الآخرين في الوقت الفعلي.
- **سجل تاريخي**: سجل للجولات السابقة لمساعدة اللاعبين على تطوير استراتيجيتهم.
- **السحب التلقائي**: إمكانية تعيين نقطة سحب تلقائية.

## البنية التقنية
- **الواجهة الأمامية**: React.js مع Tailwind CSS
- **الواجهة الخلفية**: Node.js/Express و Python (للخوارزميات)
- **الاتصال المباشر**: WebSocket لتحديثات الوقت الفعلي
- **قاعدة البيانات**: PostgreSQL لتخزين بيانات اللاعبين والألعاب

## آلية اللعبة
1. **مرحلة الانتظار**: فترة زمنية (عادة 10 ثوانٍ) يضع خلالها اللاعبون رهاناتهم.
2. **مرحلة الطيران**: يبدأ الصاروخ في "الارتفاع" (زيادة قيمة المضاعف بدءًا من 1.00).
3. **الانفجار**: في لحظة عشوائية، "ينفجر" الصاروخ، وكل من لم يسحب أمواله قبل هذه اللحظة يخسر رهانه.

## الموضوع البصري
تتميز اللعبة بتصميم بصري مستوحى من مصر القديمة مع عناصر مثل:
- الأهرامات والمعابد في الخلفية
- رموز هيروغليفية
- ألوان ذهبية وأزرق نيلي
- تأثيرات صوتية وبصرية مستوحاة من الحضارة المصرية القديمة

## مكونات المشروع
- `src/`: الملفات المصدرية للتطبيق
- `assets/`: الصور والأصوات وملفات الوسائط
- `server/`: شيفرة الخادم والـ API
- `utils/`: أدوات مساعدة وتعريفات مشتركة
- `data/`: هياكل البيانات ونماذج قاعدة البيانات
