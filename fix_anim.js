const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const newAnims = `
    switch(pose) {
      /* ── WARM-UPS ───────────────────────────────────────────── */
      case "jumpingJacks": {
        const o=p; // 0 to 1
        this._r(this.lUA,0,0,0.2 + o*2.6); this._r(this.rUA,0,0,-0.2 - o*2.6); // Arms go all the way up (Math.PI is ~3.14)
        this._r(this.lFA,0,0,0); this._r(this.rFA,0,0,0);
        this._r(this.lUL,0,0,0.1 + o*0.4); this._r(this.rUL,0,0,-0.1 - o*0.4); // Legs jump out sideways
        this._r(this.lLL,0,0,0); this._r(this.rLL,0,0,0);
        this.fig.position.y = Math.sin(p*Math.PI)*0.1; // Small bounce
        break;
      }
      case "armCircles": {
        this._r(this.lUA,Math.cos(t)*1.4,0,0.3+Math.sin(t)*1.1);
        this._r(this.rUA,Math.cos(t+Math.PI)*1.4,0,-0.3-Math.sin(t+Math.PI)*1.1);
        this._r(this.lFA,-0.2,0,0); this._r(this.rFA,-0.2,0,0);
        this._r(this.lUL,0,0.06,0.03); this._r(this.rUL,0,-0.06,-0.03);
        this._r(this.lLL,0,0,0); this._r(this.rLL,0,0,0);
        break;
      }
      case "highKnees": {
        const stride=s; // -1 to 1
        // Knee drives up extremely high
        this._r(this.lUL,stride>0?-stride*1.8:0,0,0);
        this._r(this.rUL,stride<0?stride*1.8:0,0,0);
        this._r(this.lLL,stride>0?stride*1.2:0,0,0);
        this._r(this.rLL,stride<0?-stride*1.2:0,0,0);
        // Arms pump
        this._r(this.lUA,-stride*1.2,0,0.2); this._r(this.rUA,stride*1.2,0,-0.2);
        this._r(this.lFA,-1.5,0,0); this._r(this.rFA,-1.5,0,0); // Forearms locked at 90 deg
        this.fig.position.y=Math.abs(s)*0.08;
        break;
      }
      case "hipCircles": {
        this._r(this.torso,Math.sin(t)*0.2,Math.cos(t)*0.2,Math.sin(t*0.7)*0.1);
        this._r(this.lUA,0,0,0.3); this._r(this.rUA,0,0,-0.3);
        break;
      }

      /* ── STRETCHES / COOL-DOWN ──────────────────────────────── */
      case "childPose": {
        this.fig.rotation.x=Math.PI/2 * 0.95; this.fig.position.set(0,0.18,-0.2);
        this._r(this.lUA,-Math.PI*0.8,0,0.1); this._r(this.rUA,-Math.PI*0.8,0,-0.1);
        this._r(this.lFA,0,0,0); this._r(this.rFA,0,0,0);
        this._r(this.lUL,1.5,0.2,0.2); this._r(this.rUL,1.5,-0.2,-0.2); // Knees tucked under
        this._r(this.lLL,-2.0,0,0); this._r(this.rLL,-2.0,0,0);
        break;
      }
      case "catCow": {
        const arch=s*0.4;
        this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.3,0.0);
        this._r(this.torso,arch,0,0); this._r(this.head,-arch,0,0); // Head opposes torso
        this._r(this.lUA,-Math.PI/2,0,0.2); this._r(this.rUA,-Math.PI/2,0,-0.2); // Arms planted straight
        this._r(this.lFA,0,0,0); this._r(this.rFA,0,0,0);
        this._r(this.lUL,Math.PI/2,0.1,0); this._r(this.rUL,Math.PI/2,-0.1,0); // Knees planted
        this._r(this.lLL,-Math.PI/2,0,0); this._r(this.rLL,-Math.PI/2,0,0);
        break;
      }
      case "pigeonPose": {
        this.fig.rotation.x=Math.PI/2*0.6; this.fig.position.set(0,0.3,-0.1);
        this._r(this.lUA,-0.8,0,0.2); this._r(this.rUA,-0.8,0,-0.2);
        this._r(this.lUL,-1.4,0.6,1.0); this._r(this.rUL,0.2,0,-0.1); // Front leg bent externally, back leg straight
        this._r(this.lLL,0.8,0,0); this._r(this.rLL,-0.1,0,0);
        break;
      }
      case "hamstringStretch": {
        const bend=1.4+s*0.1; // Deep bend forward
        this._r(this.torso,bend,0,0); this._r(this.head,-0.2,0,0);
        this._r(this.lUA,bend,0,0.1); this._r(this.rUA,bend,0,-0.1); // Arms dangling to toes
        this._r(this.lUL,0,0.05,0.03); this._r(this.rUL,0,-0.05,-0.03); // Legs straight
        this._r(this.lLL,0,0,0); this._r(this.rLL,0,0,0);
        break;
      }
      case "shoulderStretch": {
        this._r(this.lUA,0,0,1.5); // Arm across chest
        this._r(this.rUA,1.5,0,-0.5); this._r(this.rFA,-1.5,0,0); // Other arm locking it
        break;
      }
      case "spinalTwist": {
        this.fig.position.set(0,0.15,0);
        this._r(this.torso,0.2,s*0.8,0); this._r(this.head,0,s*0.6,0); // Huge twist
        this._r(this.lUL,1.5,0.2,0.1); this._r(this.rUL,1.5,-0.2,-0.1); // Seated
        this._r(this.lLL,-1.5,0,0); this._r(this.rLL,-1.5,0,0);
        break;
      }
      case "deepBreath": {
        const exp=p;
        this._r(this.lUA,0,0,0.2+exp*1.2); this._r(this.rUA,0,0,-0.2-exp*1.2);
        this.fig.position.y=exp*0.04;
        this._r(this.torso,-exp*0.1,0,0);
        break;
      }
      case "quadStretch": {
        this._r(this.lUL,0,0.06,0.03); this._r(this.lLL,0,0,0); // Standing leg
        this._r(this.rUL,0,-0.06,-0.03); this._r(this.rLL,2.4,0,0); // Heel pulled totally to glute
        this._r(this.rUA,-Math.PI/2,0,0); // Arm grabbing foot
        break;
      }

      /* ── MAIN EXERCISES ─────────────────────────────────────── */
      case "chestPress": {
        this.lHandWeight.visible=true; this.rHandWeight.visible=true;
        this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.2,0.2); // Lying down fully
        // Arms push STRAIGHT up. When p=1 (up), forearm and upper arm align.
        this._r(this.lUA,0,0,1.2-p*1.0); this._r(this.rUA,0,0,-1.2+p*1.0); // Upper arm goes from flared out to vertical
        this._r(this.lFA,0,0,-1.4+p*1.3); this._r(this.rFA,0,0,1.4-p*1.3); // Forearm extends
        this._r(this.lUL,-0.8,0,0); this._r(this.rUL,-0.8,0,0); // Knees bent
        this._r(this.lLL,1.5,0,0); this._r(this.rLL,1.5,0,0); // Feet flat
        break;
      }
      case "squat": {
        // p=0 is standing, p=1 is bottom of squat
        const d = p; 
        this._r(this.lUL,-d*1.9,0.1,0.1); this._r(this.rUL,-d*1.9,-0.1,-0.1); // Hips go deep
        this._r(this.lLL,d*2.1,0,0); this._r(this.rLL,d*2.1,0,0); // Knees bend deep
        this._r(this.torso,d*0.6,0,0); // Torso leans forward
        this._r(this.lUA,d*1.5,0,0.2); this._r(this.rUA,d*1.5,0,-0.2); // Arms counter-balance forward
        this._r(this.lFA,-d*0.5,0,0); this._r(this.rFA,-d*0.5,0,0);
        this.fig.position.y = -d*0.48; // Huge drop
        break;
      }
      case "hipThrust": {
        this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.3,-0.1);
        this.lHandWeight.visible=true; this.rHandWeight.visible=true; // Holding weights at hips
        this._r(this.torso,-p*0.5,0,0); // Hips thrust up (p=1 is up)
        this._r(this.lUL,-1.4+p*0.8,0.2,0.1); this._r(this.rUL,-1.4+p*0.8,-0.2,-0.1); // Massive hip extension
        this._r(this.lLL,1.5-p*0.5,0,0); this._r(this.rLL,1.5-p*0.5,0,0);
        this.fig.position.y = p*0.2;
        break;
      }
      case "rdl": {
        // Romanian Deadlift: Hips push back, torso drops, legs mostly straight
        const h=p;
        this.lHandWeight.visible=true; this.rHandWeight.visible=true;
        this._r(this.torso,h*1.2,0,0); // Torso folds completely
        this._r(this.lUL,-h*1.1,0.05,0); this._r(this.rUL,-h*1.1,-0.05,0); // Hips push way back
        this._r(this.lLL,h*0.2,0,0); this._r(this.rLL,h*0.2,0,0); // Very slight knee bend
        this._r(this.lUA,-h*0.2,0,0.1); this._r(this.rUA,-h*0.2,0,-0.1); // Arms hang straight down
        this._r(this.lFA,0,0,0); this._r(this.rFA,0,0,0);
        this.fig.position.z = -h*0.1;
        break;
      }
      case "shoulderPress": {
        this.lHandWeight.visible=true; this.rHandWeight.visible=true;
        const up=p;
        this._r(this.lUA,0,0,1.5+up*1.5); this._r(this.rUA,0,0,-1.5-up*1.5); // Arms push fully overhead
        this._r(this.lFA,-1.5+up*1.4,0,0); this._r(this.rFA,-1.5+up*1.4,0,0); // Forearms extend perfectly straight
        break;
      }
      case "bicepCurl": {
        this.lHandWeight.visible=true; this.rHandWeight.visible=true;
        const curl=p;
        this._r(this.lUA,0.1,0,0.2); this._r(this.rUA,0.1,0,-0.2); // Elbows pinned
        this._r(this.lFA,-curl*2.2,0,0); this._r(this.rFA,-(1-curl)*2.2,0,0); // Full curl to shoulder (2.2 rad)
        break;
      }
      case "latPulldown": {
        const pull=p;
        this._r(this.lUA,0,0,2.8-pull*1.4); this._r(this.rUA,0,0,-2.8+pull*1.4); // Arms start reach UP (2.8), pull down to side (1.4)
        this._r(this.lFA,-0.2-pull*1.2,0,0); this._r(this.rFA,-0.2-pull*1.2,0,0); // Forearms bend in slightly
        break;
      }
      case "plank": {
        this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.15,0); // Fully horizontal
        this._r(this.lUA,-Math.PI/2,0,0.2); this._r(this.rUA,-Math.PI/2,0,-0.2); // Upper arm straight down
        this._r(this.lFA,Math.PI/2,0,0); this._r(this.rFA,Math.PI/2,0,0); // Resting on forearms
        this._r(this.lUL,-0.1,0.05,0); this._r(this.rUL,-0.1,-0.05,0); // Legs rigid
        break;
      }
      case "pushup": {
        this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.15+p*0.25,0); // Deep translation
        this._r(this.lUA,-1.5+p*1.4,0,0.5); this._r(this.rUA,-1.5+p*1.4,0,-0.5); // Push UP
        this._r(this.lFA,-1.4+p*1.3,0,0); this._r(this.rFA,-1.4+p*1.3,0,0); // Forearm unbends
        this._r(this.lUL,-0.05,0.05,0); this._r(this.rUL,-0.05,-0.05,0); 
        this._r(this.lLL,0,0,0); this._r(this.rLL,0,0,0);
        break;
      }
      case "lunge": {
        const step=p; // p=0 is standing, p=1 is deep lunge
        this._r(this.lUL,-step*1.5,0,0); this._r(this.rUL,step*0.8,0,0); // Left leg forward, Right leg trails
        this._r(this.lLL,step*1.6,0,0); this._r(this.rLL,step*1.4,0,0); // Both knees bend deeply 90 degrees
        this._r(this.torso,step*0.2,0,0); 
        this.fig.position.y=-step*0.35;
        this.fig.position.z=step*0.1;
        break;
      }
      case "mountainClimber": {
        this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.25,0);
        this._r(this.lUA,-Math.PI/2,0,0.1); this._r(this.rUA,-Math.PI/2,0,-0.1); // Weight bearing arms
        this._r(this.lFA,0,0,0); this._r(this.rFA,0,0,0);
        this._r(this.lUL,p>0.5?-1.8:0, 0,0); this._r(this.rUL,p<0.5?-1.8:0, 0,0); // Super aggressive knee drive
        this._r(this.lLL,p>0.5?1.8:0, 0,0);  this._r(this.rLL,p<0.5?1.8:0, 0,0);
        break;
      }
      case "burpee": {
        if(p<0.33) {
          const d=p/0.33; // Squat down
          this.fig.rotation.x=0;
          this._r(this.lUL,-d*1.9,0.1,0.1); this._r(this.rUL,-d*1.9,-0.1,-0.1);
          this._r(this.lLL,d*2.1,0,0); this._r(this.rLL,d*2.1,0,0);
          this._r(this.torso,d*0.6,0,0);
          this._r(this.lUA,-d*1.5,0,0.2); this._r(this.rUA,-d*1.5,0,-0.2);
          this.fig.position.y=-d*0.48;
        } else if(p<0.66) {
          this.fig.rotation.x=Math.PI/2; this.fig.position.set(0,0.15,0); // Plank
          this._r(this.lUA,-Math.PI/2,0,0.1); this._r(this.rUA,-Math.PI/2,0,-0.1);
          this._r(this.lFA,0,0,0); this._r(this.rFA,0,0,0);
          this._r(this.lUL,0,0,0); this._r(this.rUL,0,0,0);
          this._r(this.lLL,0,0,0); this._r(this.rLL,0,0,0);
        } else {
          const jmp=(p-0.66)/0.34;
          this.fig.rotation.x=0;
          this._r(this.lUA,0,0,3.0); this._r(this.rUA,0,0,-3.0); // Arms straight up
          this._r(this.lUL,0,0,0); this._r(this.rUL,0,0,0); // Legs straight
          this._r(this.lLL,0,0,0); this._r(this.rLL,0,0,0);
          this.fig.position.y=Math.sin(jmp*Math.PI)*0.4; // Jump up in air
        }
        break;
      }
      case "kbSwing": {
        const sw=s; // complete pendulum swing
        this.lHandWeight.visible=true; this.rHandWeight.visible=true;
        this._r(this.torso,sw>0?sw*1.2:0,0,0); // Hinge forcefully
        this._r(this.lUL,sw>0?-sw*1.1:0,0.1,0.05); this._r(this.rUL,sw>0?-sw*1.1:-0.1,0.05); // Hips snap
        this._r(this.lLL,0,0,0); this._r(this.rLL,0,0,0); // Keep legs relatively straight!
        this._r(this.lUA,sw*2.0,0,0.1); this._r(this.rUA,sw*2.0,0,-0.1); // Arms act as pendulum
        break;
      }
      case "jumpRope": {
        const jmp=Math.abs(s); // Rapid bouncing
        this._r(this.lUA,0,0,0.3); this._r(this.rUA,0,0,-0.3); // Upper arms pinned to sides
        this._r(this.lFA,-0.5,0,Math.sin(t*4)*0.6); this._r(this.rFA,-0.5,0,-Math.sin(t*4)*0.6); // Rapid wrist/forearm spin
        this._r(this.lUL,-0.1,0.05,0.03); this._r(this.rUL,-0.1,-0.05,-0.03); 
        this._r(this.lLL,0.2,0,0); this._r(this.rLL,0.2,0,0); // Knees slightly bent
        this.fig.position.y=jmp*0.12; // Hop!
        break;
      }
      case "lateralRaise": {
        this.lHandWeight.visible=true; this.rHandWeight.visible=true;
        const raise=p;
        this._r(this.lUA,0,0,0.2+raise*1.3); this._r(this.rUA,0,0,-(0.2+raise*1.3)); // Raise arms 90 degrees out sideways
        this._r(this.lFA,0,0,-0.2); this._r(this.rFA,0,0,0.2); // Maintain slight elbow bend
        this._r(this.torso,0.1,0,0); // Slight forward hinge protecting lower back
        break;
      }
      case "russianTwist": {
        const tw=s; // -1 to 1
        this.fig.position.set(0,0.15,0);
        this._r(this.torso,-0.4,tw*0.9,0); // Lean back intensely, twist left/right
        this._r(this.head,0,tw*0.5,0);
        this._r(this.lUA,1.0,tw*0.5,0.2); this._r(this.rUA,1.0,tw*0.5,-0.2); // Arms holding phantom weight up
        this._r(this.lFA,0,0,0); this._r(this.rFA,0,0,0);
        this._r(this.lUL,-1.4,0,0.1); this._r(this.rUL,-1.4,0,-0.1); // Legs hovered/bent
        this._r(this.lLL,1.5,0,0); this._r(this.rLL,1.5,0,0);
        break;
      }
      case "inclineWalk": {
        const str=s;
        this._r(this.lUL,-str*0.8,0.03,0); this._r(this.rUL,str*0.8,-0.03,0); // Striding
        this._r(this.lLL,str>0?str*0.5:0,0,0); this._r(this.rLL,str<0?-str*0.5:0,0,0);
        this._r(this.lUA,str*0.6,0,0.2); this._r(this.rUA,-str*0.6,0,-0.2); // Power walk arms
        this._r(this.lFA,-1.5,0,0); this._r(this.rFA,-1.5,0,0); // Arms pinned at 90!
        this._r(this.torso,0.15,0,0); // Serious incline lean
        break;
      }
      /* idle */
      default: {
        this._r(this.lUA,0,0,0.27+s*0.04); this._r(this.rUA,0,0,-0.27-s*0.04); // Breathe
        this._r(this.lFA,-0.14,0,0); this._r(this.rFA,-0.14,0,0);
        this._r(this.lUL,0,0.07,0.03); this._r(this.rUL,0,-0.07,-0.03);
        this._r(this.lLL,0,0,0); this._r(this.rLL,0,0,0);
      }
    }
`

const regex = /switch\(pose\) \{.*?\n      default: \{.*?\n      \}\n    \}/s;
const replaced = code.replace(regex, newAnims.trim());

fs.writeFileSync('src/App.jsx', replaced);
