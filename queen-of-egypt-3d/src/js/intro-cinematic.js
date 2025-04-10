/**
 * المشهد السينمائي الافتتاحي
 * يقوم بإنشاء مشهد ثلاثي الأبعاد تمهيدي رائع قبل بدء اللعبة
 */

class IntroCinematic {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.container = null;
    this.objects = {};
    this.lights = {};
    this.animations = {};
    this.timeline = null;
    this.active = false;
  }

  /**
   * بدء المشهد السينمائي
   * @param {HTMLElement} container - عنصر HTML الذي سيحتوي المشهد
   */
  start(container) {
    if (!container) {
      console.error('لم يتم توفير حاوية للمشهد السينمائي');
      return;
    }
    
    this.container = container;
    this.active = true;
    
    // إنشاء المشهد
    this._setupScene();
    
    // إضافة العناصر والإضاءة
    this._setupObjects();
    this._setupLights();
    
    // بدء الرسم والحركة
    this._animate();
    
    // بدء التسلسل الزمني للمشهد السينمائي
    this._startTimeline();
  }

  /**
   * إيقاف المشهد السينمائي
   */
  stop() {
    this.active = false;
    
    // إلغاء حلقة الرسم
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // إفراغ الحاوية
    if (this.container && this.renderer) {
      this.container.removeChild(this.renderer.domElement);
    }
    
    // إفراغ المراجع
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.objects = {};
    this.lights = {};
    this.animations = {};
    this.timeline = null;
  }

  /**
   * إعداد مشهد Three.js
   * @private
   */
  _setupScene() {
    // إنشاء المشهد
    this.scene = new THREE.Scene();
    
    // إضافة ضباب للعمق
    this.scene.fog = new THREE.FogExp2(0x000000, 0.035);
    
    // إنشاء الكاميرا
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.set(0, 5, 20);
    this.camera.lookAt(0, 0, 0);
    
    // إنشاء المعالج
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // إضافة المعالج للحاوية
    this.container.appendChild(this.renderer.domElement);
    
    // ضبط حجم المشهد عند تغيير حجم النافذة
    window.addEventListener('resize', this._onWindowResize.bind(this));
  }

  /**
   * معالجة تغير حجم النافذة
   * @private
   */
  _onWindowResize() {
    if (!this.active || !this.camera || !this.renderer || !this.container) return;
    
    // تحديث نسبة العرض للارتفاع في الكاميرا
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    
    // تحديث حجم المعالج
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  /**
   * إعداد الأجسام في المشهد
   * @private
   */
  _setupObjects() {
    // إنشاء الأرض (طبقة رملية)
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xD2B48C, 
      roughness: 0.8, 
      metalness: 0.2
    });
    this.objects.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.objects.ground.rotation.x = -Math.PI / 2;
    this.objects.ground.position.y = -10;
    this.objects.ground.receiveShadow = true;
    this.scene.add(this.objects.ground);
    
    // إنشاء الأهرامات
    this._createPyramids();
    
    // إنشاء المعبد المصري
    this._createTemple();
    
    // إنشاء تمثال الملكة المصرية (كرمز للعبة)
    this._createQueenStatue();
    
    // إضافة جسيمات (رمال متطايرة)
    this._createSandParticles();
  }

  /**
   * إنشاء الأهرامات
   * @private
   */
  _createPyramids() {
    // مواقع الأهرامات
    const pyramidPositions = [
      { x: -30, z: -50, scale: 15 },
      { x: 0, z: -60, scale: 20 },
      { x: 30, z: -50, scale: 15 }
    ];
    
    // إنشاء الأهرامات
    this.objects.pyramids = [];
    
    pyramidPositions.forEach(position => {
      const pyramidGeometry = new THREE.ConeGeometry(position.scale, position.scale, 4);
      const pyramidMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xD2B48C, 
        roughness: 0.7, 
        metalness: 0.2
      });
      
      const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
      pyramid.position.set(position.x, position.scale / 2 - 10, position.z);
      pyramid.castShadow = true;
      pyramid.receiveShadow = true;
      
      this.scene.add(pyramid);
      this.objects.pyramids.push(pyramid);
    });
  }

  /**
   * إنشاء المعبد المصري
   * @private
   */
  _createTemple() {
    // إنشاء مجموعة للمعبد
    this.objects.temple = new THREE.Group();
    
    // قاعدة المعبد
    const baseGeometry = new THREE.BoxGeometry(20, 2, 15);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xD2B48C, 
      roughness: 0.7, 
      metalness: 0.2
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -9;
    base.receiveShadow = true;
    this.objects.temple.add(base);
    
    // أعمدة المعبد
    const columnPositions = [
      { x: -8, z: -6 }, { x: -4, z: -6 }, { x: 0, z: -6 }, { x: 4, z: -6 }, { x: 8, z: -6 },
      { x: -8, z: 6 }, { x: -4, z: 6 }, { x: 0, z: 6 }, { x: 4, z: 6 }, { x: 8, z: 6 }
    ];
    
    columnPositions.forEach(position => {
      const columnGeometry = new THREE.CylinderGeometry(1, 1, 14, 16);
      const columnMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xF5DEB3, 
        roughness: 0.5, 
        metalness: 0.3
      });
      
      const column = new THREE.Mesh(columnGeometry, columnMaterial);
      column.position.set(position.x, -2, position.z);
      column.castShadow = true;
      column.receiveShadow = true;
      
      this.objects.temple.add(column);
    });
    
    // سقف المعبد
    const roofGeometry = new THREE.BoxGeometry(22, 2, 17);
    const roofMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xF5DEB3, 
      roughness: 0.6, 
      metalness: 0.2
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 5;
    roof.castShadow = true;
    this.objects.temple.add(roof);
    
    // إضافة المعبد للمشهد
    this.scene.add(this.objects.temple);
    
    // تحريك المعبد للخلف
    this.objects.temple.position.z = -10;
  }

  /**
   * إنشاء تمثال الملكة المصرية
   * @private
   */
  _createQueenStatue() {
    // إنشاء مجموعة للتمثال
    this.objects.queenStatue = new THREE.Group();
    
    // جسم التمثال
    const bodyGeometry = new THREE.CylinderGeometry(2, 3, 12, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xD4AF37, 
      roughness: 0.3, 
      metalness: 0.8
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -4;
    body.castShadow = true;
    this.objects.queenStatue.add(body);
    
    // رأس التمثال
    const headGeometry = new THREE.SphereGeometry(2, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFD700, 
      roughness: 0.3, 
      metalness: 0.9
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 3;
    head.castShadow = true;
    this.objects.queenStatue.add(head);
    
    // تاج الملكة
    const crownGeometry = new THREE.CylinderGeometry(1, 2, 3, 8);
    const crownMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFD700, 
      roughness: 0.2, 
      metalness: 0.9,
      emissive: 0xFFD700,
      emissiveIntensity: 0.2
    });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 5.5;
    crown.castShadow = true;
    this.objects.queenStatue.add(crown);
    
    // قاعدة التمثال
    const pedestalGeometry = new THREE.CylinderGeometry(4, 4, 2, 16);
    const pedestalMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513, 
      roughness: 0.7, 
      metalness: 0.2
    });
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.y = -10;
    pedestal.receiveShadow = true;
    this.objects.queenStatue.add(pedestal);
    
    // إضافة توهج حول التمثال
    const glowGeometry = new THREE.SphereGeometry(6, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFD700, 
      transparent: true, 
      opacity: 0.1,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = -4;
    this.objects.queenStatue.add(glow);
    
    // إضافة التمثال للمشهد
    this.scene.add(this.objects.queenStatue);
    
    // تحريك التمثال إلى مركز المشهد
    this.objects.queenStatue.position.z = 0;
    this.objects.queenStatue.position.y = 0;
    
    // تخزين الحالة الأولية لعناصر التمثال للحركة
    this.objects.queenStatueInitialY = this.objects.queenStatue.position.y;
    this.objects.crownInitialY = crown.position.y;
  }

  /**
   * إنشاء جسيمات الرمال المتطايرة
   * @private
   */
  _createSandParticles() {
    // عدد الجسيمات
    const particleCount = 1000;
    
    // إنشاء هندسة النقاط
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    // إنشاء مواضع عشوائية للجسيمات
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 20 - 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    // إنشاء مادة الجسيمات
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xD2B48C,
      size: 0.2,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    // إنشاء نظام الجسيمات
    this.objects.sandParticles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.objects.sandParticles);
  }

  /**
   * إعداد الإضاءة في المشهد
   * @private
   */
  _setupLights() {
    // إضاءة محيطية
    this.lights.ambient = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(this.lights.ambient);
    
    // إضاءة اتجاهية (الشمس)
    this.lights.sun = new THREE.DirectionalLight(0xFFFFDD, 1);
    this.lights.sun.position.set(30, 50, -30);
    this.lights.sun.castShadow = true;
    this.lights.sun.shadow.mapSize.width = 2048;
    this.lights.sun.shadow.mapSize.height = 2048;
    this.lights.sun.shadow.camera.near = 0.5;
    this.lights.sun.shadow.camera.far = 200;
    this.lights.sun.shadow.camera.left = -50;
    this.lights.sun.shadow.camera.right = 50;
    this.lights.sun.shadow.camera.top = 50;
    this.lights.sun.shadow.camera.bottom = -50;
    this.scene.add(this.lights.sun);
    
    // إضاءة نقطية للتأثير
    this.lights.queenLight = new THREE.PointLight(0xFFD700, 2, 20);
    this.lights.queenLight.position.set(0, 0, 0);
    this.objects.queenStatue.add(this.lights.queenLight);
    
    // إضاءة بقعية للتركيز على التمثال
    this.lights.spotLight = new THREE.SpotLight(0xFFFFFF, 1.5);
    this.lights.spotLight.position.set(0, 30, 20);
    this.lights.spotLight.angle = Math.PI / 6;
    this.lights.spotLight.penumbra = 0.5;
    this.lights.spotLight.decay = 1;
    this.lights.spotLight.distance = 100;
    this.lights.spotLight.castShadow = true;
    this.lights.spotLight.shadow.mapSize.width = 1024;
    this.lights.spotLight.shadow.mapSize.height = 1024;
    this.scene.add(this.lights.spotLight);
    this.lights.spotLight.target = this.objects.queenStatue;
  }

  /**
   * بدء التسلسل الزمني للمشهد السينمائي
   * @private
   */
  _startTimeline() {
    // استخدام GSAP للحركة
    // تحريك الكاميرا حول التمثال
    this.animations.cameraMovement = gsap.timeline({ repeat: 0 });
    
    // حركة دائرية للكاميرا حول التمثال
    this.animations.cameraMovement.to(this.camera.position, {
      x: 15,
      z: 10,
      duration: 5,
      ease: "power1.inOut"
    }).to(this.camera.position, {
      x: -15,
      z: 10,
      duration: 5,
      ease: "power1.inOut"
    }).to(this.camera.position, {
      x: 0,
      z: 15,
      y: 8,
      duration: 3,
      ease: "power1.inOut"
    });
    
    // تحريك التمثال للأعلى والأسفل
    this.animations.statueFloat = gsap.to(this.objects.queenStatue.position, {
      y: this.objects.queenStatueInitialY + 1,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    // تذبذب شدة الضوء حول التمثال
    this.animations.lightPulse = gsap.to(this.lights.queenLight, {
      intensity: 4,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    // دوران التاج
    if (this.objects.queenStatue.children[2]) {
      this.animations.crownRotate = gsap.to(this.objects.queenStatue.children[2].rotation, {
        y: Math.PI * 2,
        duration: 6,
        repeat: -1,
        ease: "none"
      });
    }
    
    // حركة جسيمات الرمال
    this.animations.particlesMove = gsap.to(this.objects.sandParticles.rotation, {
      y: Math.PI * 2,
      duration: 200,
      repeat: -1,
      ease: "none"
    });
  }

  /**
   * حلقة الرسم للمشهد
   * @private
   */
  _animate() {
    if (!this.active) return;
    
    this.animationFrame = requestAnimationFrame(this._animate.bind(this));
    
    // تحديث المشهد
    this._updateScene();
    
    // رسم المشهد
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * تحديث المشهد في كل إطار
   * @private
   */
  _updateScene() {
    // تحريك جسيمات الرمال
    if (this.objects.sandParticles) {
      const positions = this.objects.sandParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        // تحريك الجسيمات ببطء للأعلى وإعادتها للأسفل عند خروجها من المشهد
        positions[i + 1] += 0.01;
        
        if (positions[i + 1] > 10) {
          positions[i + 1] = -10;
        }
      }
      this.objects.sandParticles.geometry.attributes.position.needsUpdate = true;
    }
    
    // توجيه الكاميرا نحو التمثال دائماً
    if (this.objects.queenStatue && this.camera) {
      this.camera.lookAt(this.objects.queenStatue.position);
    }
  }
}

// تصدير المشهد السينمائي للاستخدام في الملفات الأخرى
const introCinematic = new IntroCinematic();