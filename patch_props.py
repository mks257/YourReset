import sys

with open("src/App.jsx", "r") as f:
    text = f.read()

# Replace _buildProps
old_build = """  _buildProps() {
    const barM = new THREE.MeshStandardMaterial({ color:0x888888, roughness:0.3, metalness:0.9 });
    const plM  = new THREE.MeshStandardMaterial({ color:0x222222, roughness:0.4, metalness:0.8 });

    const buildDb = () => {
      const g = new THREE.Group();
      const dbBar = new THREE.Mesh(new THREE.CylinderGeometry(0.017,0.017,0.26,10), barM); dbBar.rotation.z = Math.PI/2; g.add(dbBar);
      [-0.13,0.13].forEach(x=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.052,0.052,0.038,12),plM); p.rotation.z=Math.PI/2; p.position.x=x; g.add(p); });
      return g;
    }

    this.lHandWeight = buildDb(); this.lHandWeight.visible=false; this.lHandWeight.position.set(0,-0.36,0); this.lFA.add(this.lHandWeight);
    this.rHandWeight = buildDb(); this.rHandWeight.visible=false; this.rHandWeight.position.set(0,-0.36,0); this.rFA.add(this.rHandWeight);

    // Bench
    this.bench = new THREE.Group();
    const bmat = new THREE.MeshStandardMaterial({color:0x181828,roughness:0.85});
    this.bench.add(new THREE.Mesh(new THREE.BoxGeometry(1.35,0.09,0.38),bmat));
    [[-0.52,-0.24,0.14],[0.52,-0.24,0.14],[-0.52,-0.24,-0.14],[0.52,-0.24,-0.14]].forEach(([x,y,z])=>{
      const lg=new THREE.Mesh(new THREE.CylinderGeometry(0.028,0.028,0.48,6),bmat); lg.position.set(x,y,z); this.bench.add(lg);
    });
    this.bench.position.set(0,0.26,0); this.bench.visible=false; this.scene.add(this.bench);

    // Kettlebell (Keep it simple and attached to scene for swings)
    this.kb = new THREE.Group();
    this.kb.add(new THREE.Mesh(new THREE.SphereGeometry(0.098,12,12), plM));
    const kbh = new THREE.Mesh(new THREE.TorusGeometry(0.068,0.014,8,16,Math.PI),barM); kbh.position.y=0.095; this.kb.add(kbh);
    this.kb.visible=false; this.scene.add(this.kb);
  }"""

new_build = """  _buildProps() {
    const barM = new THREE.MeshStandardMaterial({ color:0x888888, roughness:0.3, metalness:0.9 });
    const plM  = new THREE.MeshStandardMaterial({ color:0x222222, roughness:0.4, metalness:0.8 });
    const frameMat = new THREE.MeshStandardMaterial({color:0x111111, roughness:0.2, metalness:0.7});
    const padMat = new THREE.MeshStandardMaterial({color:0x0b0d1c, roughness:0.9});

    const buildDb = () => {
      const g = new THREE.Group();
      const dbBar = new THREE.Mesh(new THREE.CylinderGeometry(0.017,0.017,0.26,10), barM); dbBar.rotation.z = Math.PI/2; g.add(dbBar);
      [-0.13,0.13].forEach(x=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.052,0.052,0.038,12),plM); p.rotation.z=Math.PI/2; p.position.x=x; g.add(p); });
      return g;
    }

    this.lHandWeight = buildDb(); this.lHandWeight.visible=false; this.lHandWeight.position.set(0,-0.36,0); this.lFA.add(this.lHandWeight);
    this.rHandWeight = buildDb(); this.rHandWeight.visible=false; this.rHandWeight.position.set(0,-0.36,0); this.rFA.add(this.rHandWeight);

    // Bench
    this.bench = new THREE.Group();
    const bb = new THREE.Mesh(new THREE.BoxGeometry(1.35,0.09,0.38), padMat);
    bb.position.y=0.45; this.bench.add(bb);
    [[-0.52,0.23,0.14],[0.52,0.23,0.14],[-0.52,0.23,-0.14],[0.52,0.23,-0.14]].forEach(([x,y,z])=>{
      const lg=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.45,8),frameMat); lg.position.set(x,y,z); this.bench.add(lg);
    });
    this.bench.position.set(0,0,0); this.bench.visible=false; this.scene.add(this.bench);

    // Squat Rack
    this.rack = new THREE.Group();
    [-0.5, 0.5].forEach(x => {
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 0.1), frameMat);
      pole.position.set(x, 1.1, -0.2); this.rack.add(pole);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.8), frameMat);
      base.position.set(x, 0.05, -0.2); this.rack.add(base);
    });
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 0.1), frameMat);
    topBar.position.set(0, 2.15, -0.2); this.rack.add(topBar);
    this.rack.visible = false; this.scene.add(this.rack);

    // Pulldown Machine
    this.pulldown = new THREE.Group();
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.4, 0.4), frameMat);
    tower.position.set(0, 1.2, -0.4); this.pulldown.add(tower);
    const pdSeat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.4), padMat);
    pdSeat.position.set(0, 0.5, -0.05); this.pulldown.add(pdSeat);
    const kneePad = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8), padMat);
    kneePad.rotation.z = Math.PI/2; kneePad.position.set(0, 0.7, 0.05); this.pulldown.add(kneePad);
    this.pulldown.visible = false; this.scene.add(this.pulldown);

    // Yoga Mat
    this.mat = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.6), new THREE.MeshStandardMaterial({color:0x3b1a32, roughness:0.9, metalness:0.1}));
    this.mat.rotation.x = -Math.PI/2;
    this.mat.position.set(0, 0.01, 0.2);
    this.mat.visible = false;
    this.scene.add(this.mat);

    // Kettlebell
    this.kb = new THREE.Group();
    this.kb.add(new THREE.Mesh(new THREE.SphereGeometry(0.098,12,12), plM));
    const kbh = new THREE.Mesh(new THREE.TorusGeometry(0.068,0.014,8,16,Math.PI),barM); kbh.position.y=0.095; this.kb.add(kbh);
    this.kb.visible=false; this.scene.add(this.kb);
  }"""

text = text.replace(old_build, new_build)

old_setpose = """  setPose(p) {
    this.pose=p; this.t=0;
    [this.lHandWeight,this.rHandWeight,this.bench,this.kb].forEach(o=>{ if(o) o.visible=false; });
    this.fig.rotation.set(0,0,0); this.fig.position.set(0,0,0);
  }"""

new_setpose = """  setPose(p) {
    this.pose=p; this.t=0;
    [this.lHandWeight,this.rHandWeight,this.bench,this.kb,this.rack,this.pulldown,this.mat].forEach(o=>{ if(o) o.visible=false; });
    this.fig.rotation.set(0,0,0); this.fig.position.set(0,0,0);
  }"""

text = text.replace(old_setpose, new_setpose)

old_tick_clear = """    [this.lHandWeight,this.rHandWeight,this.bench,this.kb].forEach(o=>{ if(o) o.visible=false; });"""
new_tick_clear = """    [this.lHandWeight,this.rHandWeight,this.bench,this.kb,this.rack,this.pulldown,this.mat].forEach(o=>{ if(o) o.visible=false; });"""

text = text.replace(old_tick_clear, new_tick_clear)

with open("src/App.jsx", "w") as f:
    f.write(text)
