import sys

with open("src/App.jsx", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False

# 1. Update Imports
new_lines.append('import { useEffect, useRef, useState, useCallback } from "react";\n')
new_lines.append('import * as THREE from "three";\n')

# 2. Skip old import and find the spot for FigureScene (after THEMES or global CSS)
found_engine_start = False
for line in lines[1:]: # Skip the first import line we just replaced
    if "3-D FIGURE ENGINE" in line:
        found_engine_start = True
        new_lines.append(line)
        # Inject FigureScene here
        new_lines.append("""
class FigureScene {
  constructor(canvas, accentColor) {
    this.canvas = canvas; this.ac = accentColor;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 1.4, 4.5);
    
    // Modern Studio Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4); this.scene.add(ambient);
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8); mainLight.position.set(2, 4, 3); this.scene.add(mainLight);
    this.glow = new THREE.PointLight(accentColor, 2.5, 5); this.glow.position.set(0, 1, 1); this.scene.add(this.glow);

    this.group = new THREE.Group(); this.scene.add(this.group);
    this.fig = new THREE.Group(); this.group.add(this.fig);
    this.t = 0; this.pose = "idle";
    
    this._buildFigure();
    this._buildProps();
    this._animate();
  }

  _buildFigure() {
    const skinM = new THREE.MeshStandardMaterial({ color:0x1a1a2e, roughness:0.2, metalness:0.8 });
    const neonM = new THREE.MeshStandardMaterial({ 
      color: this.ac, emissive: this.ac, emissiveIntensity: 3, roughness: 0, metalness: 0 
    });

    const createPart = (geom, mat, x=0, y=0, z=0) => {
      const m = new THREE.Mesh(geom, mat); m.position.set(x,y,z); return m;
    };

    // Torso (Sculpted)
    this.torso = new THREE.Group();
    const chest = createPart(new THREE.BoxGeometry(0.38, 0.35, 0.22), skinM);
    const abs = createPart(new THREE.BoxGeometry(0.28, 0.25, 0.18), skinM, 0, -0.25);
    this.torso.add(chest, abs);
    this.torso.position.y = 1.1; this.fig.add(this.torso);

    // Head (Stylized Hero)
    this.head = new THREE.Group();
    const skull = createPart(new THREE.SphereGeometry(0.14, 16, 16), skinM);
    const visor = createPart(new THREE.CylinderGeometry(0.142, 0.142, 0.04, 16, 1, true, 0, Math.PI), neonM);
    visor.rotation.x = Math.PI/2; visor.position.z = 0.02;
    this.head.add(skull, visor); this.head.position.y = 0.32; this.torso.add(this.head);

    // Arms & Legs (Tapered with Neon Bands)
    const buildLimb = (upperLen, lowerLen, isLeg=false) => {
      const g = new THREE.Group();
      const u = createPart(new THREE.CylinderGeometry(isLeg?0.09:0.07, isLeg?0.07:0.05, upperLen, 12), skinM, 0, -upperLen/2);
      const l = createPart(new THREE.CylinderGeometry(isLeg?0.07:0.05, isLeg?0.05:0.04, lowerLen, 12), skinM, 0, -lowerLen/2);
      l.position.y = -upperLen;
      
      // Neon stripes
      const stripeU = createPart(new THREE.CylinderGeometry(isLeg?0.092:0.072, isLeg?0.072:0.052, 0.03, 12), neonM, 0, -upperLen/2);
      const stripeL = createPart(new THREE.CylinderGeometry(isLeg?0.072:0.052, isLeg?0.052:0.042, 0.03, 12), neonM, 0, -lowerLen/2);
      u.add(stripeU); l.add(stripeL);

      g.upper = u; g.lower = l; g.add(u, l); return g;
    };

    this.lArm = buildLimb(0.28, 0.28); this.lArm.position.set(0.22, 0.15, 0); this.torso.add(this.lArm);
    this.rArm = buildLimb(0.28, 0.28); this.rArm.position.set(-0.22, 0.15, 0); this.torso.add(this.rArm);
    this.lLeg = buildLimb(0.42, 0.42, true); this.lLeg.position.set(0.12, -0.4, 0); this.torso.add(this.lLeg);
    this.rLeg = buildLimb(0.42, 0.42, true); this.rLeg.position.set(-0.12, -0.4, 0); this.torso.add(this.rLeg);
    
    // Quick access for anims
    this.lUA=this.lArm.upper; this.lFA=this.lArm.lower;
    this.rUA=this.rArm.upper; this.rFA=this.rArm.lower;
    this.lUL=this.lLeg.upper; this.lLL=this.lLeg.lower;
    this.rUL=this.rLeg.upper; this.rLL=this.rLeg.lower;
  }

  _buildProps() {
    const frameM = new THREE.MeshStandardMaterial({ color:0x111111, roughness:0.2, metalness:0.8 });
    const barM = new THREE.MeshStandardMaterial({ color:0x888888, roughness:0.3, metalness:0.9 });
    const neonM = new THREE.MeshStandardMaterial({ color:this.ac, emissive:this.ac, emissiveIntensity:2 });

    const buildDb = () => {
      const g = new THREE.Group();
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.28,10), barM); b.rotation.z=Math.PI/2; g.add(b);
      [-0.12, 0.12].forEach(x => {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.04,12), frameM); p.rotation.z=Math.PI/2; p.position.x=x; g.add(p);
      });
      return g;
    }
    this.lDb = buildDb(); this.lDb.visible=false; this.lDb.position.y=-0.32; this.lFA.add(this.lDb);
    this.rDb = buildDb(); this.rDb.visible=false; this.rDb.position.y=-0.32; this.rFA.add(this.rDb);

    this.rack = new THREE.Group();
    [-0.55, 0.55].forEach(x => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 0.08), frameM); p.position.set(x, 1.2, -0.3); this.rack.add(p);
    });
    this.rack.visible=false; this.scene.add(this.rack);

    this.bench = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 1.3), frameM); pad.position.y=0.45; this.bench.add(pad);
    this.bench.visible=false; this.scene.add(this.bench);

    this.mat = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.5), new THREE.MeshStandardMaterial({color:0x222222, roughness:1}));
    this.mat.rotation.x = -Math.PI/2; this.mat.visible=false; this.scene.add(this.mat);
  }

  setPose(p) { this.pose=p; this.t=0; }

  _r(n,x,y,z){ if(n){ n.rotation.x=x; n.rotation.y=y; n.rotation.z=z; } }

  _tick(pose) {
    const t=this.t, s=Math.sin(t), p=(s+1)/2;
    // Reset
    [this.lDb,this.rDb,this.rack,this.bench,this.mat].forEach(o=>o.visible=false);
    this.fig.position.set(0,0,0); this.fig.rotation.set(0,0,0);
    this.torso.rotation.set(0,0,0);
    this.camera.position.set(0, 1.4, 4.5);

    switch(pose) {
      case "squat":
        this.rack.visible=true;
        const sd = p*1.1; this.fig.position.y = -sd*0.5;
        this._r(this.lUL, -sd, 0, 0.1); this._r(this.rUL, -sd, 0, -0.1);
        this._r(this.lLL, sd*1.2, 0, 0); this._r(this.rLL, sd*1.2, 0, 0);
        this._r(this.torso, sd*0.4, 0, 0);
        break;
      case "chestPress":
        this.bench.visible=true; this.lDb.visible=true; this.rDb.visible=true;
        this.fig.rotation.x = -Math.PI/2; this.fig.position.y = 0.5;
        this.camera.position.set(2, 2.5, 2);
        this._r(this.lUA, -Math.PI/2, 0, -1.2 + p*1.5); this._r(this.rUA, -Math.PI/2, 0, 1.2 - p*1.5);
        this._r(this.lFA, 0.1, 0, 0); this._r(this.rFA, 0.1, 0, 0);
        break;
      case "bicepCurl":
        this.lDb.visible=true; this.rDb.visible=true;
        const c = p * 2.2;
        this._r(this.lUA, 0, 0, 0.1); this._r(this.rUA, 0, 0, -0.1);
        this._r(this.lFA, -c, 0, 0); this._r(this.rFA, -c, 0, 0);
        break;
      case "latPulldown":
        this.lUA.visible=true; // Dummy
        this._r(this.lUA, 0, 0, 2.8 - p*1.8); this._r(this.rUA, 0, 0, -2.8 + p*1.8);
        this._r(this.lFA, -0.5, 0, 0); this._r(this.rFA, -0.5, 0, 0);
        break;
      case "jumpingJacks":
        const j = p; this.fig.position.y = j*0.3;
        this._r(this.lUA, 0, 0, 0.3 + j*2); this._r(this.rUA, 0, 0, -0.3 - j*2);
        this._r(this.lUL, 0, 0, 0.1 + j*0.4); this._r(this.rUL, 0, 0, -0.1 - j*0.4);
        break;
      case "plank":
        this.mat.visible=true; this.fig.rotation.x = Math.PI/2; this.fig.position.y = 0.2;
        this._r(this.lUA, -1.4, 0, 0); this._r(this.rUA, -1.4, 0, 0);
        this._r(this.lFA, -1.4, 0, 0); this._r(this.rFA, -1.4, 0, 0);
        break;
      default: // Idle
        this._r(this.lUA, 0,0, 0.2 + s*0.05); this._r(this.rUA, 0,0, -0.2 - s*0.05);
        this._r(this.lUL, 0,0, 0.05); this._r(this.rUL, 0,0, -0.05);
    }
  }

  _animate() {
    this._raf = requestAnimationFrame(() => this._animate());
    this.t += 0.035;
    this._tick(this.pose);
    this.glow.intensity = 2 + Math.sin(this.t * 2) * 0.5;
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if(!w || !h) return;
    this.renderer.setSize(w, h); this.camera.aspect = w/h; this.camera.updateProjectionMatrix();
  }

  destroy() { cancelAnimationFrame(this._raf); this.renderer.dispose(); }
}
""")
        continue
    
    if found_engine_start:
        if "function Figure3D" in line:
            found_engine_start = False # Stop skipping after injecting FigureScene
        else:
            continue

    # 3. Update Figure3D component to use the scene
    if "function Figure3D({" in line:
        new_lines.append("""function Figure3D({ animKey, color, height = 220 }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current; if(!c) return;
    sceneRef.current = new FigureScene(c, color);
    sceneRef.current.setPose(animKey);
    const ro = new ResizeObserver(() => sceneRef.current?.resize()); ro.observe(c);
    return () => { ro.disconnect(); sceneRef.current?.destroy(); };
  }, []);

  useEffect(() => { sceneRef.current?.setPose(animKey); }, [animKey]);

  return (
    <div style={{ width: "100%", height, borderRadius: 16, overflow: "hidden", background: "#05060f", position: "relative" }}>
       <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 50% 40%, ${color}15 0%, transparent 70%)` }} />
       <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block", position: "relative", zIndex: 1 }} />
    </div>
  );
}
""")
        skip = True
        continue
    
    if skip:
        if line.startswith("}"):
            skip = False
        continue
        
    new_lines.append(line)

with open("src/App.jsx", "w") as f:
    f.writelines(new_lines)
