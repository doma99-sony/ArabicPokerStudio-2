// هذا الملف يحتوي على كود لإنشاء الأصوات المصرية اللازمة للعبة سلوت "ملكة مصر"
// يمكن تشغيله من خلال Node.js لإنشاء ملفات الصوت

const fs = require('fs');
const { exec } = require('child_process');

// تستخدم هذه الوظيفة لإنشاء ملف صوت WAV باستخدام أداة sox
function createAudio(filename, commands) {
  return new Promise((resolve, reject) => {
    const cmd = `sox -n public/audio/${filename} ${commands}`;
    console.log(`تنفيذ: ${cmd}`);
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`خطأ: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`تم إنشاء ${filename} بنجاح`);
      resolve();
    });
  });
}

// إنشاء المجلد إذا لم يكن موجوداً
if (!fs.existsSync('public/audio')) {
  fs.mkdirSync('public/audio', { recursive: true });
}

async function createAllSounds() {
  try {
    // صوت دوران البكرات - يشبه صوت آلة سلوت مع لمسة مصرية
    await createAudio('egypt-spin.wav', 'synth 1.5 sin 300-100 sin 400-200 chorus 0.7 0.9 55 0.4 0.25 2 -t echos 0.8 0.5 700 0.25 900 0.3');
    
    // صوت الفوز - صوت احتفالي مع رنين لمسة مصرية
    await createAudio('egypt-win.wav', 'synth 1.5 sin 500-700 sin 800-1000 chorus 0.6 0.9 50 0.4 0.25 2 -t echos 0.8 0.5 500 0.25 700 0.3 gain -n -10');
    
    // صوت الفوز الكبير - أكثر حماسًا
    await createAudio('egypt-big-win.wav', 'synth 2 sin 600-1000 sin 900-1200 chorus 0.7 0.9 60 0.4 0.3 2.3 -t echos 0.9 0.6 300 0.4 500 0.5 gain -n -8');
    
    // صوت تفعيل لعبة المكافأة
    await createAudio('egypt-bonus.wav', 'synth 2.5 sin 400-800 sin 600-1100 sin 700-1200 chorus 0.8 0.8 70 0.5 0.5 2.5 -t echos 0.9 0.7 400 0.6 600 0.7 gain -n -5');
    
    // صوت النقر على الأزرار
    await createAudio('egypt-click.wav', 'synth 0.15 sin 500-700 fade 0 0.15 0.05 gain -n -10');
    
    // صوت فتح صندوق الكنز في لعبة المكافأة
    await createAudio('egypt-chest-open.wav', 'synth 1 sin 300-600 sin 500-800 chorus 0.6 0.7 50 0.3 0.3 2 fade 0 1 0.3 gain -n -10');

    console.log('تم إنشاء جميع الأصوات بنجاح!');
  } catch (error) {
    console.error('فشل في إنشاء الأصوات:', error);
  }
}

// تشغيل وظيفة إنشاء الأصوات
createAllSounds();