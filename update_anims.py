import sys

with open("src/App.jsx", "r") as f:
    text = f.read()

old_switch = """    switch(pose) {
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
    }"""

new_switch = """    switch(pose) {
      case "squat":
        this.rack.visible=true;
        const sd = p*1.1; this.fig.position.y = -sd*0.5;
        this._r(this.lUL, -sd, 0, 0.1); this._r(this.rUL, -sd, 0, -0.1);
        this._r(this.lLL, sd*1.2, 0, 0); this._r(this.rLL, sd*1.2, 0, 0);
        this._r(this.torso, sd*0.3, 0, 0);
        break;
      case "chestPress":
        this.bench.visible=true; this.lDb.visible=true; this.rDb.visible=true;
        this.fig.rotation.x = -Math.PI/2; this.fig.position.y = 0.45;
        this.camera.position.set(2, 2.5, 2);
        this._r(this.lUA, -Math.PI/2, 0, -1.3 + p*1.6); this._r(this.rUA, -Math.PI/2, 0, 1.3 - p*1.6);
        this._r(this.lFA, 0.1, 0, 0); this._r(this.rFA, 0.1, 0, 0);
        break;
      case "shoulderPress":
        this.lDb.visible=true; this.rDb.visible=true;
        const sp = 2.8 - p*1.8;
        this._r(this.lUA, 0, 0, sp); this._r(this.rUA, 0, 0, -sp);
        this._r(this.lFA, 0, 0, 0); this._r(this.rFA, 0, 0, 0);
        break;
      case "lateralRaise":
        this.lDb.visible=true; this.rDb.visible=true;
        const lr = 0.2 + p*1.3;
        this._r(this.lUA, 0, 0, lr); this._r(this.rUA, 0, 0, -lr);
        this._r(this.lFA, -0.2, 0, 0); this._r(this.rFA, -0.2, 0, 0);
        break;
      case "bicepCurl":
        this.lDb.visible=true; this.rDb.visible=true;
        const bc = p * 2.3;
        this._r(this.lUA, 0.1, 0, 0.1); this._r(this.rUA, 0.1, 0, -0.1);
        this._r(this.lFA, -bc, 0, 0); this._r(this.rFA, -bc, 0, 0);
        break;
      case "latPulldown":
        this._r(this.lUA, 0, 0, 2.8 - p*1.6); this._r(this.rUA, 0, 0, -2.8 + p*1.6);
        this._r(this.lFA, -0.6, 0, 0); this._r(this.rFA, -0.6, 0, 0);
        break;
      case "pushup":
        this.mat.visible=true; this.fig.rotation.x = Math.PI/2; this.fig.position.y = 0.4 - p*0.3;
        const pu = 0.3 + p*1.2;
        this._r(this.lUA, -1.4, 0, -pu); this._r(this.rUA, -1.4, 0, pu);
        this._r(this.lFA, -0.5, 0, 0); this._r(this.rFA, -0.5, 0, 0);
        break;
      case "lunge":
        const lung = p*0.8; this.fig.position.y = -lung*0.4;
        this._r(this.lUL, -lung, 0, 0); this._r(this.rUL, lung*0.5, 0, 0);
        this._r(this.lLL, lung*1.2, 0, 0); this._r(this.rLL, lung*1.2, 0, 0);
        break;
      case "rdl":
        this.lDb.visible=true; this.rDb.visible=true;
        const r = p*1.2;
        this._r(this.torso, r, 0, 0);
        this._r(this.lUL, -r*0.2, 0, 0); this._r(this.rUL, -r*0.2, 0, 0);
        this._r(this.lUA, r*0.8, 0, 0.1); this._r(this.rUA, r*0.8, 0, -0.1);
        break;
      case "mountainClimber":
        this.mat.visible=true; this.fig.rotation.x = Math.PI/2; this.fig.position.y = 0.3;
        const mc = s > 0 ? s : -s;
        this._r(this.lUL, s > 0 ? -mc : 0, 0, 0); this._r(this.rUL, s < 0 ? -mc : 0, 0, 0);
        break;
      case "jumpingJacks":
        const j = p; this.fig.position.y = j*0.35;
        this._r(this.lUA, 0, 0, 0.4 + j*2.1); this._r(this.rUA, 0, 0, -0.4 - j*2.1);
        this._r(this.lUL, 0, 0, 0.1 + j*0.5); this._r(this.rUL, 0, 0, -0.1 - j*0.5);
        break;
      case "plank":
        this.mat.visible=true; this.fig.rotation.x = Math.PI/2; this.fig.position.y = 0.2;
        this._r(this.lUA, -1.3, 0, 0); this._r(this.rUA, -1.3, 0, 0);
        this._r(this.lFA, -1.4, 0, 0); this._r(this.rFA, -1.4, 0, 0);
        break;
      case "childPose":
        this.mat.visible=true; this.fig.position.y = -0.2;
        this._r(this.lUL, -2.2, 0, 0); this._r(this.rUL, -2.2, 0, 0);
        this._r(this.lUA, 2.5, 0, 0.2); this._r(this.rUA, 2.5, 0, -0.2);
        break;
      default: // Idle
        this._r(this.lUA, 0,0, 0.2 + s*0.06); this._r(this.rUA, 0,0, -0.2 - s*0.06);
        this._r(this.lUL, 0,0, 0.05); this._r(this.rUL, 0,0, -0.05);
    }"""

text = text.replace(old_switch, new_switch)

with open("src/App.jsx", "w") as f:
    f.write(text)
