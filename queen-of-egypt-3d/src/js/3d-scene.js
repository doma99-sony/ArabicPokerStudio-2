/**
 * مدير المشهد الثلاثي الأبعاد
 * المسؤول عن إعداد مشهد Three.js بالكامل وإدارة الرموز والمؤثرات ثلاثية الأبعاد
 */

class Scene3DManager {
  constructor() {
    // المتغيرات الأساسية
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.canvas = null;
    this.controls = null;
    this.reels = [];
    this.symbols = {};
    this.lights = {};
    this.animations = {};
    this.symbolSize = 1;
    this.reelWidth = 1.2;
    this.reelGap = 0.2;
    this.reelCount = 5;
    this.rowCount = 3;
    
    // مؤشرات حالة اللعبة
    this.isSpinning = false;
    this.isAnimating = false;
    
    // تتبع التحميل
    this.assetsToLoad = 0;
    this.assetsLoaded = 0;
    this.onProgressCallback = null;
    this.onCompleteCallback = null;
    
    // حاوية المؤثرات
    this.effects = {
      particles: [],
      glows: [],
    };
  }

  /**
   * تهيئة المشهد الثلاثي الأبعاد
   * @param {HTMLCanvasElement} canvas - عنصر القماش (canvas) للعرض
   * @param {Function} onProgress - دالة callback للتقدم في التحميل
   * @param {Function} onComplete - دالة callback عند اكتمال التحميل
   */
  init(canvas, onProgress, onComplete) {
    this.canvas = canvas;
    this.onProgressCallback = onProgress;
    this.onCompleteCallback = onComplete;
    
    // إنشاء المشهد
    this.scene = new THREE.Scene();
    
    // إعداد الكاميرا
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 10);
    
    // إعداد المعالج (renderer)
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // إضافة إنارة
    this._setupLights();
    
    // إضافة خلفية
    this._setupBackground();
    
    // تحميل النماذج ثلاثية الأبعاد
    this._loadModels();
    
    // إضافة حدث استجابة لتغيير حجم النافذة
    window.addEventListener('resize', this._onWindowResize.bind(this));
    
    // إعداد حلقة الرسم
    this.animate();
  }

  /**
   * إعداد الإنارة للمشهد
   * @private
   */
  _setupLights() {
    // إضاءة محيطية
    this.lights.ambient = new THREE.AmbientLight(0xcccccc, 0.4);
    this.scene.add(this.lights.ambient);
    
    // الإضاءة الرئيسية
    this.lights.main = new THREE.DirectionalLight(0xffffff, 0.8);
    this.lights.main.position.set(5, 5, 8);
    this.lights.main.castShadow = true;
    this.scene.add(this.lights.main);
    
    // إضاءة ملونة للتأثير
    this.lights.spotBlue = new THREE.SpotLight(0x0044ff, 0.5);
    this.lights.spotBlue.position.set(-10, 5, 5);
    this.scene.add(this.lights.spotBlue);
    
    this.lights.spotGold = new THREE.SpotLight(0xffaa00, 0.5);
    this.lights.spotGold.position.set(10, -5, 5);
    this.scene.add(this.lights.spotGold);
  }

  /**
   * إعداد خلفية المشهد
   * @private
   */
  _setupBackground() {
    // إنشاء خلفية بتدرج لوني
    const bgGeometry = new THREE.PlaneGeometry(50, 30);
    const bgMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color(0x0C3559) },
        color2: { value: new THREE.Color(0x0A1A1A) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    
    const background = new THREE.Mesh(bgGeometry, bgMaterial);
    background.position.z = -10;
    this.scene.add(background);
    
    // إضافة جسيمات (نجوم) للخلفية
    this._createParticles();
  }

  /**
   * إنشاء جسيمات خلفية (نجوم أو غبار ذهبي)
   * @private
   */
  _createParticles() {
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
      
      sizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xD4AF37,
      size: 0.1,
      transparent: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    this.scene.add(particleSystem);
    this.effects.particles.push(particleSystem);
  }

  /**
   * تحميل النماذج ثلاثية الأبعاد للرموز
   * @private
   */
  _loadModels() {
    // تعريف الرموز المطلوب تحميلها
    const symbolsList = [
      { name: 'crown', file: 'crown.gltf' },
      { name: 'cat', file: 'cat.gltf' },
      { name: 'falcon', file: 'falcon.gltf' },
      { name: 'snake', file: 'snake.gltf' },
      { name: 'jar', file: 'jar.gltf' }
    ];
    
    // تحديد عدد الملفات المطلوب تحميلها
    this.assetsToLoad = symbolsList.length;
    
    // استدعاء محمل GLTF
    const loader = new THREE.GLTFLoader();
    
    // ملفات نماذج GLTF غير متوفرة بعد، سنستخدم أشكال هندسية بسيطة كبديل مؤقت
    symbolsList.forEach(symbol => {
      // إنشاء نموذج مبسط
      this._createSimpleSymbol(symbol.name);
      
      // تقدم التحميل
      this._onAssetLoaded();
    });
  }

  /**
   * إنشاء نماذج بسيطة بدلاً من النماذج الثلاثية الأبعاد المعقدة
   * @param {string} symbolName - اسم الرمز
   * @private
   */
  _createSimpleSymbol(symbolName) {
    let geometry, material;
    
    switch(symbolName) {
      case 'crown':
        // تاج بسيط
        geometry = new THREE.CylinderGeometry(0.5, 0.7, 0.7, 5);
        material = new THREE.MeshStandardMaterial({ 
          color: 0xD4AF37, 
          metalness: 0.8, 
          roughness: 0.2 
        });
        break;
        
      case 'cat':
        // قطة بسيطة (مكعب مع مثلثين للأذنين)
        geometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        material = new THREE.MeshStandardMaterial({ 
          color: 0x8B4513, 
          metalness: 0.1, 
          roughness: 0.8 
        });
        break;
        
      case 'falcon':
        // صقر بسيط (هرم)
        geometry = new THREE.ConeGeometry(0.5, 1, 4);
        material = new THREE.MeshStandardMaterial({ 
          color: 0x708090, 
          metalness: 0.5, 
          roughness: 0.5 
        });
        break;
        
      case 'snake':
        // ثعبان بسيط (أنبوب)
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.5, -0.5, 0),
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.5, 0.3, 0)
        ]);
        geometry = new THREE.TubeGeometry(curve, 20, 0.2, 8, false);
        material = new THREE.MeshStandardMaterial({ 
          color: 0x228B22, 
          metalness: 0.3, 
          roughness: 0.7 
        });
        break;
        
      case 'jar':
        // إناء بسيط
        geometry = new THREE.CylinderGeometry(0.3, 0.5, 0.8, 16);
        material = new THREE.MeshStandardMaterial({ 
          color: 0xA0522D, 
          metalness: 0.2, 
          roughness: 0.8 
        });
        break;
        
      default:
        // شكل افتراضي (كرة)
        geometry = new THREE.SphereGeometry(0.5, 16, 16);
        material = new THREE.MeshStandardMaterial({ 
          color: 0xFFFFFF, 
          metalness: 0.5, 
          roughness: 0.5 
        });
    }
    
    // إنشاء الشبكة
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // تخزين الرمز
    this.symbols[symbolName] = mesh;
  }

  /**
   * دالة callback عند تحميل أحد الملفات
   * @private
   */
  _onAssetLoaded() {
    this.assetsLoaded++;
    
    // حساب نسبة التقدم
    const progress = this.assetsLoaded / this.assetsToLoad;
    
    // استدعاء دالة callback للتقدم
    if (this.onProgressCallback) {
      this.onProgressCallback(progress);
    }
    
    // التحقق من اكتمال تحميل جميع الملفات
    if (this.assetsLoaded === this.assetsToLoad) {
      this._setupReels();
      
      // استدعاء دالة callback للاكتمال
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    }
  }

  /**
   * إعداد البكرات
   * @private
   */
  _setupReels() {
    // تحديد موضع البكرات
    const totalWidth = (this.reelWidth + this.reelGap) * this.reelCount - this.reelGap;
    const startX = -totalWidth / 2 + this.reelWidth / 2;
    
    // إنشاء حاوية للبكرات
    const reelsContainer = new THREE.Group();
    this.scene.add(reelsContainer);
    
    // إنشاء كل بكرة
    for (let i = 0; i < this.reelCount; i++) {
      const reel = new THREE.Group();
      reel.position.x = startX + i * (this.reelWidth + this.reelGap);
      
      // إضافة إطار للبكرة
      const frameGeometry = new THREE.BoxGeometry(this.reelWidth, this.rowCount * this.symbolSize + 0.2, 0.1);
      const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0C3559, 
        metalness: 0.5, 
        roughness: 0.5,
        transparent: true,
        opacity: 0.7
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.z = -0.1;
      reel.add(frame);
      
      // إضافة تفاصيل للإطار (حدود ذهبية)
      const borderGeometry = new THREE.BoxGeometry(this.reelWidth + 0.1, this.rowCount * this.symbolSize + 0.3, 0.05);
      const borderMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xD4AF37, 
        metalness: 0.8, 
        roughness: 0.2
      });
      const border = new THREE.Mesh(borderGeometry, borderMaterial);
      border.position.z = -0.15;
      reel.add(border);
      
      // إضافة الرموز
      const symbols = [];
      const actualSymbols = Object.keys(this.symbols);
      
      for (let j = 0; j < this.rowCount + 2; j++) {
        // اختيار رمز عشوائي
        const randomSymbol = actualSymbols[Math.floor(Math.random() * actualSymbols.length)];
        const symbolObj = this.symbols[randomSymbol].clone();
        
        // تعيين موضع الرمز
        symbolObj.position.y = this.rowCount / 2 - j * this.symbolSize;
        symbolObj.position.z = 0.2;
        
        // تدوير الرمز قليلاً بشكل عشوائي للتنويع
        symbolObj.rotation.x = Math.random() * 0.2 - 0.1;
        symbolObj.rotation.y = Math.random() * 0.2 - 0.1;
        symbolObj.rotation.z = Math.random() * 0.2 - 0.1;
        
        // تخزين نوع الرمز للتحقق من النتائج لاحقاً
        symbolObj.userData = { type: randomSymbol };
        
        // إضافة الرمز إلى البكرة
        reel.add(symbolObj);
        symbols.push(symbolObj);
      }
      
      // إضافة البكرة إلى مصفوفة البكرات
      reel.userData = { symbols };
      reelsContainer.add(reel);
      this.reels.push(reel);
    }
  }

  /**
   * معالجة تغير حجم النافذة
   * @private
   */
  _onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }

  /**
   * تدوير البكرات
   * @param {Function} onComplete - دالة callback عند انتهاء الدوران
   * @param {Array<String>} results - نتائج محددة مسبقاً للبكرات (اختياري)
   */
  spinReels(onComplete, results = null) {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    
    // سرعات عشوائية للبكرات
    const speeds = this.reels.map(() => Math.random() * 0.5 + 1.5);
    
    // مدة الدوران لكل بكرة (تزداد من اليسار إلى اليمين)
    const durations = this.reels.map((_, i) => 1000 + i * 400);
    
    // عدد البكرات المتبقية للتوقف
    let reelsToStop = this.reels.length;
    
    // دوران كل بكرة
    this.reels.forEach((reel, reelIndex) => {
      // تعيين النتائج إذا كانت متوفرة
      let finalSymbols = null;
      if (results && results[reelIndex]) {
        finalSymbols = results[reelIndex];
      }
      
      // دوران البكرة
      this._spinReel(reel, speeds[reelIndex], durations[reelIndex], finalSymbols, () => {
        reelsToStop--;
        
        // عند توقف جميع البكرات
        if (reelsToStop === 0) {
          this.isSpinning = false;
          
          // تقييم النتائج والفوز
          const visibleSymbols = this._getVisibleSymbols();
          
          // استدعاء دالة callback للانتهاء
          if (onComplete) {
            onComplete(visibleSymbols);
          }
        }
      });
    });
  }

  /**
   * دوران بكرة واحدة
   * @param {THREE.Group} reel - البكرة المراد تدويرها
   * @param {number} speed - سرعة الدوران
   * @param {number} duration - مدة الدوران بالمللي ثانية
   * @param {Array<String>} finalSymbols - الرموز النهائية المطلوبة (اختياري)
   * @param {Function} onComplete - دالة callback عند انتهاء الدوران
   * @private
   */
  _spinReel(reel, speed, duration, finalSymbols, onComplete) {
    const symbols = reel.userData.symbols;
    let startTime = null;
    
    // حركة دوران مستمرة
    const spinAnimation = (timestamp) => {
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // تقليل السرعة تدريجياً
      const currentSpeed = speed * (1 - Math.pow(progress, 2));
      
      // تحريك الرموز للأسفل
      symbols.forEach(symbol => {
        symbol.position.y += currentSpeed;
        
        // إعادة الرمز إلى الأعلى عندما يخرج من الأسفل
        if (symbol.position.y > (this.rowCount / 2 + 1) * this.symbolSize) {
          symbol.position.y -= symbols.length * this.symbolSize;
          
          // تبديل الرمز عند إعادة التدوير (إلا في نهاية الدوران)
          if (progress < 0.8) {
            const actualSymbols = Object.keys(this.symbols);
            const randomSymbol = actualSymbols[Math.floor(Math.random() * actualSymbols.length)];
            symbol.userData.type = randomSymbol;
          }
        }
      });
      
      // الاستمرار في الحركة حتى اكتمال المدة
      if (progress < 1) {
        requestAnimationFrame(spinAnimation);
      } else {
        // ضبط الرموز النهائية في مواضعها
        if (finalSymbols) {
          this._arrangeReelToResult(reel, finalSymbols);
        } else {
          this._snapSymbolsToGrid(reel);
        }
        
        // استدعاء دالة callback للانتهاء
        if (onComplete) {
          onComplete();
        }
      }
    };
    
    // بدء الدوران
    requestAnimationFrame(spinAnimation);
  }

  /**
   * ضبط الرموز في شبكة منتظمة
   * @param {THREE.Group} reel - البكرة المراد ضبطها
   * @private
   */
  _snapSymbolsToGrid(reel) {
    const symbols = reel.userData.symbols;
    
    // ضبط موضع كل رمز ليكون في مكان صحيح
    symbols.forEach((symbol, index) => {
      const targetY = this.rowCount / 2 - (index % symbols.length) * this.symbolSize;
      
      // تحريك الرمز إلى الموضع الأقرب
      const difference = symbol.position.y - targetY;
      if (Math.abs(difference) > this.symbolSize / 2) {
        // تحريك إلى الموضع التالي
        if (difference > 0) {
          symbol.position.y = targetY + this.symbolSize * symbols.length;
        } else {
          symbol.position.y = targetY - this.symbolSize * symbols.length;
        }
      } else {
        // ضبط للموضع الأقرب
        symbol.position.y = targetY;
      }
    });
  }

  /**
   * ترتيب الرموز في البكرة حسب النتيجة المطلوبة
   * @param {THREE.Group} reel - البكرة المراد ترتيبها
   * @param {Array<String>} result - الرموز المطلوبة للنتيجة
   * @private
   */
  _arrangeReelToResult(reel, result) {
    const symbols = reel.userData.symbols;
    
    // أولاً، ضبط الرموز في الشبكة
    this._snapSymbolsToGrid(reel);
    
    // تحديد الرموز المرئية
    const visibleIndices = [];
    for (let i = 0; i < symbols.length; i++) {
      const symbolY = symbols[i].position.y;
      if (symbolY <= this.rowCount / 2 && symbolY >= -this.rowCount / 2) {
        visibleIndices.push(i);
      }
    }
    
    // ترتيب الرموز المرئية حسب النتيجة
    for (let i = 0; i < Math.min(result.length, visibleIndices.length); i++) {
      const symbol = symbols[visibleIndices[i]];
      symbol.userData.type = result[i];
      
      // تحديث نموذج الرمز
      const children = [...symbol.children];
      children.forEach(child => symbol.remove(child));
      
      // استنساخ النموذج الجديد
      const newModel = this.symbols[result[i]].clone();
      newModel.position.set(0, 0, 0);
      symbol.add(newModel);
    }
  }

  /**
   * الحصول على الرموز المرئية حالياً
   * @returns {Array<Array<String>>} مصفوفة من الرموز المرئية لكل بكرة
   * @private
   */
  _getVisibleSymbols() {
    const visibleSymbols = [];
    
    this.reels.forEach(reel => {
      const reelSymbols = [];
      const symbols = reel.userData.symbols;
      
      // تحديد الرموز المرئية على الشاشة
      symbols.forEach(symbol => {
        const symbolY = symbol.position.y;
        if (symbolY <= this.rowCount / 2 && symbolY >= -this.rowCount / 2) {
          reelSymbols.push(symbol.userData.type);
        }
      });
      
      // ترتيب الرموز من أعلى إلى أسفل
      reelSymbols.sort((a, b) => {
        const symbolA = symbols.find(symbol => symbol.userData.type === a);
        const symbolB = symbols.find(symbol => symbol.userData.type === b);
        return symbolA.position.y - symbolB.position.y;
      });
      
      visibleSymbols.push(reelSymbols);
    });
    
    return visibleSymbols;
  }

  /**
   * تشغيل تأثير الفوز على رموز معينة
   * @param {Array<Array<Number>>} winningLines - مصفوفة من الخطوط الفائزة
   */
  playWinAnimation(winningLines) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    
    // إنشاء تأثيرات للخطوط الفائزة
    winningLines.forEach(line => {
      line.forEach(position => {
        const reelIndex = Math.floor(position / this.rowCount);
        const symbolIndex = position % this.rowCount;
        
        // الحصول على الرمز المطلوب
        if (reelIndex < this.reels.length) {
          const reel = this.reels[reelIndex];
          const visibleSymbols = this._getVisibleSymbolsInReel(reel);
          
          if (symbolIndex < visibleSymbols.length) {
            const symbol = visibleSymbols[symbolIndex];
            
            // إضافة تأثير توهج
            this._addGlowEffect(symbol);
            
            // تكبير الرمز قليلاً
            gsap.to(symbol.scale, {
              x: 1.2,
              y: 1.2,
              z: 1.2,
              duration: 0.5,
              yoyo: true,
              repeat: 3,
              ease: "power1.inOut"
            });
            
            // دوران الرمز
            gsap.to(symbol.rotation, {
              y: symbol.rotation.y + Math.PI * 2,
              duration: 2,
              repeat: 1,
              ease: "power1.inOut"
            });
          }
        }
      });
    });
    
    // إعادة تعيين الحالة بعد انتهاء التأثيرات
    setTimeout(() => {
      // إزالة تأثيرات التوهج
      this.effects.glows.forEach(glow => {
        if (glow.parent) {
          glow.parent.remove(glow);
        }
      });
      this.effects.glows = [];
      
      // إعادة الرموز إلى حجمها الطبيعي
      this.reels.forEach(reel => {
        const symbols = reel.userData.symbols;
        symbols.forEach(symbol => {
          symbol.scale.set(1, 1, 1);
        });
      });
      
      this.isAnimating = false;
    }, 4000);
  }

  /**
   * الحصول على الرموز المرئية في بكرة معينة
   * @param {THREE.Group} reel - البكرة المطلوبة
   * @returns {Array<THREE.Object3D>} الرموز المرئية
   * @private
   */
  _getVisibleSymbolsInReel(reel) {
    const symbols = reel.userData.symbols;
    const visibleSymbols = [];
    
    // فرز الرموز حسب موضعها العمودي
    const sortedSymbols = [...symbols].sort((a, b) => a.position.y - b.position.y);
    
    // تحديد الرموز المرئية
    sortedSymbols.forEach(symbol => {
      const symbolY = symbol.position.y;
      if (symbolY <= this.rowCount / 2 && symbolY >= -this.rowCount / 2) {
        visibleSymbols.push(symbol);
      }
    });
    
    return visibleSymbols;
  }

  /**
   * إضافة تأثير توهج حول رمز
   * @param {THREE.Object3D} symbol - الرمز المطلوب إضافة التأثير له
   * @private
   */
  _addGlowEffect(symbol) {
    // إنشاء كرة مضيئة حول الرمز
    const glowGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFD700,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    symbol.add(glow);
    
    // إضافة تأثير نبض للتوهج
    gsap.to(glow.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      duration: 0.7,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    // إضافة تأثير تغيير الشفافية
    gsap.to(glowMaterial, {
      opacity: 0.2,
      duration: 0.7,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    // تخزين الإشارة إلى التوهج للإزالة لاحقاً
    this.effects.glows.push(glow);
  }

  /**
   * تشغيل تأثير الفوز الكبير
   */
  playBigWinAnimation() {
    // إضافة جسيمات ذهبية متطايرة
    this._createFireworks();
    
    // تأثير دوران الكاميرا
    gsap.to(this.camera.position, {
      z: 9,
      y: 3,
      duration: 2,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.to(this.camera.position, {
          z: 10,
          y: 0,
          duration: 2,
          delay: 3,
          ease: "power2.inOut"
        });
      }
    });
    
    // تدوير جميع الرموز
    this.reels.forEach(reel => {
      const symbols = reel.userData.symbols;
      symbols.forEach(symbol => {
        gsap.to(symbol.rotation, {
          y: symbol.rotation.y + Math.PI * 4,
          duration: 3,
          ease: "power1.inOut"
        });
      });
    });
  }

  /**
   * إنشاء تأثير الألعاب النارية
   * @private
   */
  _createFireworks() {
    const particleCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesPositions = new Float32Array(particleCount * 3);
    const particlesColors = new Float32Array(particleCount * 3);
    const particlesSizes = new Float32Array(particleCount);
    
    // ألوان للألعاب النارية
    const colors = [
      new THREE.Color(0xD4AF37), // ذهبي
      new THREE.Color(0xFFD700), // ذهبي فاتح
      new THREE.Color(0xFFA500), // برتقالي
      new THREE.Color(0xFF4500), // أحمر
      new THREE.Color(0x800080)  // أرجواني
    ];
    
    // إنشاء نقاط البداية
    const originPoints = [
      new THREE.Vector3(0, 0, 5),
      new THREE.Vector3(-3, 2, 4),
      new THREE.Vector3(3, -1, 4)
    ];
    
    // توزيع الجسيمات
    for (let i = 0; i < particleCount; i++) {
      // اختيار نقطة بداية عشوائية
      const origin = originPoints[Math.floor(Math.random() * originPoints.length)];
      
      // اتجاه عشوائي
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI;
      const radius = Math.random() * 7;
      
      // إحداثيات كروية
      particlesPositions[i * 3] = origin.x + radius * Math.sin(angle2) * Math.cos(angle1);
      particlesPositions[i * 3 + 1] = origin.y + radius * Math.sin(angle2) * Math.sin(angle1);
      particlesPositions[i * 3 + 2] = origin.z + radius * Math.cos(angle2);
      
      // لون عشوائي
      const color = colors[Math.floor(Math.random() * colors.length)];
      particlesColors[i * 3] = color.r;
      particlesColors[i * 3 + 1] = color.g;
      particlesColors[i * 3 + 2] = color.b;
      
      // حجم عشوائي
      particlesSizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particlesColors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particlesSizes, 1));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    const fireworks = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(fireworks);
    
    // تأثيرات حركة للألعاب النارية
    gsap.to(particlesMaterial, {
      opacity: 0,
      duration: 5,
      ease: "power1.out",
      onComplete: () => {
        this.scene.remove(fireworks);
      }
    });
  }

  /**
   * حلقة الرسم الرئيسية (تُستدعى من قبل متصفح الويب)
   */
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // تحريك جسيمات الخلفية
    this.effects.particles.forEach(particles => {
      const positions = particles.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // تحريك بسيط للجسيمات
        positions[i + 1] -= 0.005; // تحريك للأسفل
        
        // إعادة تعيين الجسيمات التي خرجت من المشهد
        if (positions[i + 1] < -10) {
          positions[i + 1] = 10;
          positions[i] = (Math.random() - 0.5) * 30;
          positions[i + 2] = (Math.random() - 0.5) * 10 - 5;
        }
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
    });
    
    // تدوير بطيء للرموز
    this.reels.forEach(reel => {
      const symbols = reel.userData.symbols;
      symbols.forEach(symbol => {
        // تدوير بطيء مستمر للرموز غير المتحركة
        if (!this.isSpinning && !this.isAnimating) {
          symbol.rotation.y += 0.003;
        }
      });
    });
    
    // تحريك الإضاءة الملونة
    this.lights.spotBlue.position.x = Math.sin(Date.now() * 0.0005) * 10;
    this.lights.spotGold.position.x = Math.cos(Date.now() * 0.0007) * 10;
    
    // رسم المشهد
    this.renderer.render(this.scene, this.camera);
  }
}

// تصدير المدير للاستخدام في الملفات الأخرى
const scene3DManager = new Scene3DManager();