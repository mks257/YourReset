import sys

with open("src/App.jsx", "r") as f:
    text = f.read()

# 1. Update Lighting in FigureScene constructor
old_lighting = """    // Modern Studio Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4); this.scene.add(ambient);
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8); mainLight.position.set(2, 4, 3); this.scene.add(mainLight);
    this.glow = new THREE.PointLight(accentColor, 2.5, 5); this.glow.position.set(0, 1, 1); this.scene.add(this.glow);"""

new_lighting = """    // Cinematic 3-Point Studio Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.2); this.scene.add(ambient);
    
    // Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2); keyLight.position.set(3, 5, 4); this.scene.add(keyLight);
    
    // Fill Light (Subtle Tint)
    const fillLight = new THREE.PointLight(accentColor, 0.5, 10); fillLight.position.set(-3, 2, 2); this.scene.add(fillLight);
    
    // Dynamic Rim Light (High Contrast Silhouette)
    this.rim = new THREE.SpotLight(accentColor, 15, 8, Math.PI/6, 0.5, 2);
    this.rim.position.set(0, 3, -4); this.rim.lookAt(0, 1.2, 0); this.scene.add(this.rim);

    this.glow = new THREE.PointLight(accentColor, 4, 6); this.glow.position.set(0, 1.2, 1.5); this.scene.add(this.glow);"""
text = text.replace(old_lighting, new_lighting)

# 2. Complete rewrite of _buildFigure for Organic/Muscular look
old_build_figure = """  _buildFigure() {
    const isM = this.charType === 'male';
    const skinM = new THREE.MeshStandardMaterial({ color: isM ? 0x222222 : 0x1a1a2e, roughness:0.2, metalness:0.8 });
    const neonM = new THREE.MeshStandardMaterial({ 
      color: this.ac, emissive: this.ac, emissiveIntensity: 3, roughness: 0, metalness: 0 
    });

    const createPart = (geom, mat, x=0, y=0, z=0) => {
      const m = new THREE.Mesh(geom, mat); m.position.set(x,y,z); return m;
    };

    // Torso (Sculpted)
    this.torso = new THREE.Group();
    const chest = createPart(new THREE.BoxGeometry(isM ? 0.48 : 0.38, 0.35, 0.22), skinM);
    const abs = createPart(new THREE.BoxGeometry(isM ? 0.32 : 0.28, 0.25, 0.18), skinM, 0, -0.25);
    this.torso.add(chest, abs);
    this.torso.position.y = isM ? 1.2 : 1.1; this.fig.add(this.torso);

    // Head (Stylized Hero)
    this.head = new THREE.Group();
    const skull = createPart(new THREE.SphereGeometry(0.14, 16, 16), skinM);
    const visor = createPart(new THREE.CylinderGeometry(0.142, 0.142, 0.04, 16, 1, true, 0, Math.PI), neonM);
    visor.rotation.x = Math.PI/2; visor.position.z = 0.02;
    this.head.add(skull, visor); this.head.position.y = 0.32; this.torso.add(this.head);

    // Arms & Legs (Tapered with Neon Bands)
    const buildLimb = (upperLen, lowerLen, isLeg=false) => {
      const g = new THREE.Group();
      const uw = (isLeg ? (isM?0.11:0.09) : (isM?0.09:0.07));
      const lw = (isLeg ? (isM?0.09:0.07) : (isM?0.07:0.05));
      const u = createPart(new THREE.CylinderGeometry(uw, lw, upperLen, 12), skinM, 0, -upperLen/2);
      const l = createPart(new THREE.CylinderGeometry(lw, lw*0.8, lowerLen, 12), skinM, 0, -lowerLen/2);
      l.position.y = -upperLen;
      
      // Neon stripes
      const stripeU = createPart(new THREE.CylinderGeometry(uw+0.002, lw+0.002, 0.03, 12), neonM, 0, -upperLen/2);
      const stripeL = createPart(new THREE.CylinderGeometry(lw+0.002, lw*0.8+0.002, 0.03, 12), neonM, 0, -lowerLen/2);
      u.add(stripeU); l.add(stripeL);

      g.upper = u; g.lower = l; g.add(u, l); return g;
    };

    const armX = isM ? 0.28 : 0.22;
    this.lArm = buildLimb(0.28, 0.28); this.lArm.position.set(armX, 0.15, 0); this.torso.add(this.lArm);
    this.rArm = buildLimb(0.28, 0.28); this.rArm.position.set(-armX, 0.15, 0); this.torso.add(this.rArm);
    this.lLeg = buildLimb(0.42, 0.42, true); this.lLeg.position.set(isM?0.15:0.12, -0.4, 0); this.torso.add(this.lLeg);
    this.rLeg = buildLimb(0.42, 0.42, true); this.rLeg.position.set(isM?-0.15:-0.12, -0.4, 0); this.torso.add(this.rLeg);
    
    // Quick access for anims
    this.lUA=this.lArm.upper; this.lFA=this.lArm.lower;
    this.rUA=this.rArm.upper; this.rFA=this.rArm.lower;
    this.lUL=this.lLeg.upper; this.lLL=this.lLeg.lower;
    this.rUL=this.rLeg.upper; this.rLL=this.rLeg.lower;
  }"""

new_build_figure = """  _buildFigure() {
    const isM = this.charType === 'male';
    const skinM = new THREE.MeshPhysicalMaterial({ 
      color: isM ? 0x111111 : 0x121225, roughness:0.15, metalness:0.7, 
      clearcoat: 1, clearcoatRoughness: 0.1 
    });
    const neonM = new THREE.MeshStandardMaterial({ 
      color: this.ac, emissive: this.ac, emissiveIntensity: 10, roughness: 0 
    });

    const createPart = (geom, mat, x=0, y=0, z=0) => {
      const m = new THREE.Mesh(geom, mat); m.position.set(x,y,z); return m;
    };

    // Torso (V-Taper)
    this.torso = new THREE.Group();
    const chest = createPart(new THREE.CapsuleGeometry(isM?0.24:0.18, isM?0.32:0.28, 8, 16), skinM);
    const lat = createPart(new THREE.CapsuleGeometry(isM?0.22:0.16, 0.1, 4, 12), skinM, 0, 0.05, -0.05);
    const waist = createPart(new THREE.CapsuleGeometry(isM?0.16:0.14, 0.2, 4, 12), skinM, 0, -0.22);
    this.torso.add(chest, lat, waist);
    this.torso.position.y = isM ? 1.25 : 1.15; this.fig.add(this.torso);

    // Head (Heroic)
    this.head = new THREE.Group();
    const skull = createPart(new THREE.SphereGeometry(0.13, 24, 24), skinM);
    const visor = createPart(new THREE.CylinderGeometry(0.132, 0.132, 0.05, 24, 1, true, 0, Math.PI), neonM);
    visor.rotation.x = Math.PI/2; visor.position.z = 0.02;
    this.head.add(skull, visor);
    
    // Hair
    if(!isM) { // Ponytail for female
      const pt = createPart(new THREE.CapsuleGeometry(0.04, 0.35, 4, 12), neonM, 0, 0.05, -0.15);
      pt.rotation.x = -Math.PI/6; this.head.add(pt);
    } else { // Stylish short hair
       const hair = createPart(new THREE.SphereGeometry(0.135, 12, 12, 0, Math.PI*2, 0, Math.PI/2), skinM);
       hair.position.y = 0.02; hair.scale.set(1, 1.1, 1.1); this.head.add(hair);
    }

    this.head.position.y = 0.35; this.torso.add(this.head);

    // High-Fidelity Limbs (Capsules)
    const buildLimb = (upperLen, lowerLen, isLeg=false) => {
      const g = new THREE.Group();
      const uw = (isLeg ? (isM?0.12:0.1) : (isM?0.09:0.075));
      const lw = (isLeg ? (isM?0.1:0.08) : (isM?0.07:0.06));
      
      const u = createPart(new THREE.CapsuleGeometry(uw, upperLen, 8, 12), skinM, 0, -upperLen/2);
      const l = createPart(new THREE.CapsuleGeometry(lw, lowerLen, 8, 12), skinM, 0, -lowerLen/2);
      l.position.y = -upperLen;
      
      // Neon trim clothing lines
      const trimU = createPart(new THREE.TorusGeometry(uw+0.005, 0.005, 8, 24), neonM, 0, -0.05); trimU.rotation.x=Math.PI/2;
      const trimL = createPart(new THREE.TorusGeometry(lw+0.005, 0.005, 8, 24), neonM, 0, -0.05); trimL.rotation.x=Math.PI/2;
      u.add(trimU); l.add(trimL);

      g.upper = u; g.lower = l; g.add(u, l); return g;
    };

    const armX = isM ? 0.32 : 0.26;
    this.lArm = buildLimb(0.32, 0.32); this.lArm.position.set(armX, 0.15, 0); this.torso.add(this.lArm);
    this.rArm = buildLimb(0.32, 0.32); this.rArm.position.set(-armX, 0.15, 0); this.torso.add(this.rArm);
    this.lLeg = buildLimb(0.45, 0.45, true); this.lLeg.position.set(isM?0.16:0.12, -0.42, 0); this.torso.add(this.lLeg);
    this.rLeg = buildLimb(0.45, 0.45, true); this.rLeg.position.set(isM?-0.16:-0.12, -0.42, 0); this.torso.add(this.rLeg);
    
    this.lUA=this.lArm.upper; this.lFA=this.lArm.lower;
    this.rUA=this.rArm.upper; this.rFA=this.rArm.lower;
    this.lUL=this.lLeg.upper; this.lLL=this.lLeg.lower;
    this.rUL=this.rLeg.upper; this.rLL=this.rLeg.lower;
  }"""
text = text.replace(old_build_figure, new_build_figure)

# 3. Update resize and tick for smoother visuals
old_tick = '    this.t += 0.035;\n    this._tick(this.pose);\n    this.glow.intensity = 2 + Math.sin(this.t * 2) * 0.5;'
new_tick = '    this.t += 0.035;\n    this._tick(this.pose);\n    this.glow.intensity = 4 + Math.sin(this.t * 2.5) * 1.5;\n    if(this.rim) this.rim.intensity = 15 + Math.sin(this.t * 2) * 5;'
text = text.replace(old_tick, new_tick)

with open("src/App.jsx", "w") as f:
    f.write(text)
