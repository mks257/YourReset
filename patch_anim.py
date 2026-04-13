import sys

with open("src/App.jsx", "r") as f:
    lines = f.readlines()

out = []
in_switch = False
for line in lines:
    if "/* ── WARM-UPS ───────────────────────────────────────────── */" in line:
        in_switch = True
        out.append("""      /* ── WARM-UPS ───────────────────────────────────────────── */
      case "jumpingJacks": {
        const o=p;
        this._r(this.lUA,0,0,o*2.7); this._r(this.rUA,0,0,-o*2.7); // Arms to top of head
        this._r(this.lFA,0,0,0); this._r(this.rFA,0,0,0);
        this._r(this.lUL,0,0,o*0.4); this._r(this.rUL,0,0,-o*0.4); // Legs jump out
        this._r(this.lLL,0,0,0); this._r(this.rLL,0,0,0);
        this.fig.position.y=Math.sin(p*Math.PI)*0.15; // Bounce up
        break;
      }
      case "armCircles": {
        this._r(this.lUA,Math.cos(t)*1.4,0,0.3+Math.sin(t)*1.1);
        this._r(this.rUA,Math.cos(t+Math.PI)*1.4,0,-0.3-Math.sin(t+Math.PI)*1.1);
        break;
      }
      case "highKnees": {
        const str=s;
        this._r(this.lUL,str>0?-str*1.8:0,0,0); this._r(this.rUL,str<0?str*1.8:0,0,0); // Knees up
        this._r(this.lLL,str>0?str*1.5:0,0,0); this._r(this.rLL,str<0?-str*1.5:0,0,0);
        this._r(this.lUA,-str*0.8,0,0.2); this._r(this.rUA,str*0.8,0,-0.2);
        this._r(this.lFA,-1.5,0,0); this._r(this.rFA,-1.5,0,0);
        this.fig.position.y=Math.abs(s)*0.1;
        break;
      }
      case "hipCircles": {
        this._r(this.torso,Math.sin(t)*0.2,Math.cos(t)*0.2,Math.sin(t*0.7)*0.1);
        this._r(this.lUA,0,0,0.3); this._r(this.rUA,0,0,-0.3);
        break;
      }

      /* ── STRETCHES / COOL-DOWN ──────────────────────────────── */
      case "childPose": {
        this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.18,0.2);
        this._r(this.lUA,-Math.PI*0.8,0,0.2); this._r(this.rUA,-Math.PI*0.8,0,-0.2);
        this._r(this.lUL,1.5,0.2,0.2); this._r(this.rUL,1.5,-0.2,-0.2);
        this._r(this.lLL,-2.0,0,0); this._r(this.rLL,-2.0,0,0);
        break;
      }
      case "catCow": {
        const arch=s*0.4;
        this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.3,0.0);
        this._r(this.torso,arch,0,0); this._r(this.head,-arch,0,0);
        this._r(this.lUA,-Math.PI/2,0,0.2); this._r(this.rUA,-Math.PI/2,0,-0.2);
        this._r(this.lUL,Math.PI/2,0.1,0); this._r(this.rUL,Math.PI/2,-0.1,0);
        this._r(this.lLL,-Math.PI/2,0,0); this._r(this.rLL,-Math.PI/2,0,0);
        break;
      }
      case "pigeonPose": {
        this.fig.rotation.x=1.2; this.fig.position.set(0,0.3,-0.1);
        this._r(this.lUA,-0.8,0,0.2); this._r(this.rUA,-0.8,0,-0.2);
        this._r(this.lUL,-1.4,0.6,1.0); this._r(this.rUL,0.2,0,0);
        this._r(this.lLL,0.8,0,0);
        break;
      }
      case "hamstringStretch": {
        const bend=1.3+s*0.2;
        this._r(this.torso,bend,0,0); this._r(this.head,-0.2,0,0);
        this._r(this.lUA,bend,0,0.1); this._r(this.rUA,bend,0,-0.1);
        break;
      }
      case "shoulderStretch": {
        this._r(this.lUA,0,0,1.5);
        this._r(this.rUA,1.5,0,-0.5); this._r(this.rFA,-1.5,0,0);
        break;
      }
      case "spinalTwist": {
        this.fig.position.set(0,0.15,0);
        this._r(this.torso,0.2,s*0.8,0); this._r(this.head,0,s*0.6,0);
        this._r(this.lUL,1.5,0.2,0.1); this._r(this.rUL,1.5,-0.2,-0.1);
        this._r(this.lLL,-1.5,0,0); this._r(this.rLL,-1.5,0,0);
        break;
      }
      case "deepBreath": {
        const exp=p;
        this._r(this.lUA,0,0,0.2+exp*1.2); this._r(this.rUA,0,0,-0.2-exp*1.2);
        this._r(this.torso,-exp*0.1,0,0);
        this.fig.position.y=exp*0.04;
        break;
      }
      case "quadStretch": {
        this._r(this.rUL,0,0,0); this._r(this.rLL,2.4,0,0);
        this._r(this.rUA,-Math.PI/2,0,0);
        break;
      }

      /* ── MAIN EXERCISES ─────────────────────────────────────── */
      case "chestPress": {
        this.lHandWeight.visible=true; this.rHandWeight.visible=true;
        this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.25,0.2);
        this._r(this.lUA,0,0,1.4-p*1.2); this._r(this.rUA,0,0,-1.4+p*1.2);
        this._r(this.lFA,0,0,-1.5+p*1.5); this._r(this.rFA,0,0,1.5-p*1.5);
        this._r(this.lUL,-0.8,0,0); this._r(this.rUL,-0.8,0,0);
        this._r(this.lLL,1.5,0,0); this._r(this.rLL,1.5,0,0);
        break;
      }
      case "squat": {
        const d=p;
        this._r(this.lUL,-d*1.9,0.1,0.1); this._r(this.rUL,-d*1.9,-0.1,-0.1);
        this._r(this.lLL,d*2.1,0,0); this._r(this.rLL,d*2.1,0,0);
        this._r(this.torso,d*0.6,0,0);
        this._r(this.lUA,d*1.5,0,0.2); this._r(this.rUA,d*1.5,0,-0.2);
        this._r(this.lFA,-d*0.5,0,0); this._r(this.rFA,-d*0.5,0,0);
        this.fig.position.y=-d*0.48;
        break;
      }
      case "hipThrust": {
        this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.3,-0.1);
        this.lHandWeight.visible=true; this.rHandWeight.visible=true;
        this._r(this.torso,-p*0.5,0,0);
        this._r(this.lUL,-1.4+p*0.8,0.2,0.1); this._r(this.rUL,-1.4+p*0.8,-0.2,-0.1);
        this._r(this.lLL,1.5-p*0.5,0,0); this._r(this.rLL,1.5-p*0.5,0,0);
        this.fig.position.y = p*0.2;
        break;
      }
      case "rdl": {
        const h=p;
        this.lHandWeight.visible=true; this.rHandWeight.visible=true;
        this._r(this.torso,h*1.2,0,0);
        this._r(this.lUL,-h*1.1,0.05,0); this._r(this.rUL,-h*1.1,-0.05,0);
        this._r(this.lLL,h*0.2,0,0); this._r(this.rLL,h*0.2,0,0);
        this._r(this.lUA,-h*0.2,0,0.1); this._r(this.rUA,-h*0.2,0,-0.1);
        break;
      }
      case "shoulderPress": {
        this.lHandWeight.visible=true; this.rHandWeight.visible=true;
        this._r(this.lUA,0,0,1.5+p*1.5); this._r(this.rUA,0,0,-1.5-p*1.5);
        this._r(this.lFA,-1.5+p*1.5,0,0); this._r(this.rFA,-1.5+p*1.5,0,0);
        break;
      }
      case "bicepCurl": {
        this.lHandWeight.visible=true; this.rHandWeight.visible=true;
        this._r(this.lUA,0.1,0,0.2); this._r(this.rUA,0.1,0,-0.2);
        this._r(this.lFA,-p*2.2,0,0); this._r(this.rFA,-(1-p)*2.2,0,0);
        break;
      }
      case "latPulldown": {
        this._r(this.lUA,0,0,2.8-p*1.4); this._r(this.rUA,0,0,-2.8+p*1.4);
        this._r(this.lFA,-0.2-p*1.2,0,0); this._r(this.rFA,-0.2-p*1.2,0,0);
        break;
      }
      case "plank": {
        this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.15,0);
        this._r(this.lUA,-Math.PI/2,0,0.2); this._r(this.rUA,-Math.PI/2,0,-0.2);
        this._r(this.lFA,Math.PI/2,0,0); this._r(this.rFA,Math.PI/2,0,0);
        this._r(this.lUL,-0.1,0.05,0); this._r(this.rUL,-0.1,-0.05,0);
        break;
      }
      case "pushup": {
        this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.15+p*0.25,0);
        this._r(this.lUA,-1.5+p*1.4,0,0.5); this._r(this.rUA,-1.5+p*1.4,0,-0.5);
        this._r(this.lFA,-1.4+p*1.4,0,0); this._r(this.rFA,-1.4+p*1.4,0,0);
        this._r(this.lUL,-0.05,0.05,0); this._r(this.rUL,-0.05,-0.05,0);
        break;
      }
      case "lunge": {
        const step=p;
        this._r(this.lUL,-step*1.5,0,0); this._r(this.rUL,step*0.8,0,0);
        this._r(this.lLL,step*1.6,0,0); this._r(this.rLL,step*1.4,0,0);
        this._r(this.torso,step*0.2,0,0);
        this.fig.position.y=-step*0.35;
        this.fig.position.z=step*0.1;
        break;
      }
      case "mountainClimber": {
        this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.25,0);
        this._r(this.lUA,-Math.PI/2,0,0.1); this._r(this.rUA,-Math.PI/2,0,-0.1);
        this._r(this.lUL,p>0.5?-1.8:0, 0,0); this._r(this.rUL,p<0.5?-1.8:0, 0,0);
        this._r(this.lLL,p>0.5?1.8:0, 0,0);  this._r(this.rLL,p<0.5?1.8:0, 0,0);
        break;
      }
      case "burpee": {
        if(p<0.33) {
          const d=p/0.33;
          this.fig.rotation.x=0;
          this._r(this.lUL,-d*1.9,0.1,0.1); this._r(this.rUL,-d*1.9,-0.1,-0.1);
          this._r(this.lLL,d*2.1,0,0); this._r(this.rLL,d*2.1,0,0);
          this._r(this.torso,d*0.6,0,0);
          this._r(this.lUA,-d*1.5,0,0.2); this._r(this.rUA,-d*1.5,0,-0.2);
          this.fig.position.y=-d*0.48;
        } else if(p<0.66) {
          this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.15,0);
          this._r(this.lUA,-Math.PI/2,0,0.1); this._r(this.rUA,-Math.PI/2,0,-0.1);
        } else {
          const jmp=(p-0.66)/0.34;
          this.fig.rotation.x=0;
          this._r(this.lUA,0,0,3.0); this._r(this.rUA,0,0,-3.0);
          this.fig.position.y=Math.sin(jmp*Math.PI)*0.4;
        }
        break;
      }
      case "kbSwing": {
        const sw=s;
        this.lHandWeight.visible=true; this.rHandWeight.visible=true;
        this._r(this.torso,sw>0?sw*1.2:0,0,0);
        this._r(this.lUL,sw>0?-sw*1.1:0,0.1,0.05); this._r(this.rUL,sw>0?-sw*1.1:-0.1,0.05);
        this._r(this.lUA,sw*2.0,0,0.1); this._r(this.rUA,sw*2.0,0,-0.1);
        break;
      }
      case "jumpRope": {
        const jmp=Math.abs(s);
        this._r(this.lUA,0,0,0.3); this._r(this.rUA,0,0,-0.3);
        this._r(this.lFA,-0.5,0,Math.sin(t*4)*0.6); this._r(this.rFA,-0.5,0,-Math.sin(t*4)*0.6);
        this._r(this.lUL,-0.1,0.05,0.03); this._r(this.rUL,-0.1,-0.05,-0.03); 
        this._r(this.lLL,0.2,0,0); this._r(this.rLL,0.2,0,0);
        this.fig.position.y=jmp*0.12;
        break;
      }
      case "lateralRaise": {
        this.lHandWeight.visible=true; this.rHandWeight.visible=true;
        this._r(this.lUA,0,0,0.2+p*1.3); this._r(this.rUA,0,0,-(0.2+p*1.3));
        this._r(this.lFA,0,0,-0.2); this._r(this.rFA,0,0,0.2);
        this._r(this.torso,0.1,0,0);
        break;
      }
      case "russianTwist": {
        const tw=s;
        this.fig.position.set(0,0.15,0);
        this._r(this.torso,-0.4,tw*0.9,0); this._r(this.head,0,tw*0.5,0);
        this._r(this.lUA,1.0,tw*0.5,0.2); this._r(this.rUA,1.0,tw*0.5,-0.2);
        this._r(this.lUL,-1.4,0,0.1); this._r(this.rUL,-1.4,0,-0.1);
        this._r(this.lLL,1.5,0,0); this._r(this.rLL,1.5,0,0);
        break;
      }
      case "inclineWalk": {
        const str=s;
        this._r(this.lUL,-str*0.8,0.03,0); this._r(this.rUL,str*0.8,-0.03,0);
        this._r(this.lLL,str>0?str*0.5:0,0,0); this._r(this.rLL,str<0?-str*0.5:0,0,0);
        this._r(this.lUA,str*0.6,0,0.2); this._r(this.rUA,-str*0.6,0,-0.2);
        this._r(this.lFA,-1.5,0,0); this._r(this.rFA,-1.5,0,0);
        this._r(this.torso,0.15,0,0);
        break;
      }\n""")
    elif in_switch:
        if "      /* idle */" in line:
            in_switch = False
            out.append(line)
    else:
        out.append(line)

with open("src/App.jsx", "w") as f:
    f.writelines(out)
