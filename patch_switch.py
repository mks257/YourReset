import sys

with open("src/App.jsx", "r") as f:
    text = f.read()

# Chest press bench
text = text.replace('      case "chestPress": {\n        this.lHandWeight.visible=true; this.rHandWeight.visible=true;',
                    '      case "chestPress": {\n        this.bench.visible=true; this.lHandWeight.visible=true; this.rHandWeight.visible=true;')

text = text.replace('      case "hipThrust": {\n        this.fig.rotation.x=Math.PI/2;',
                    '      case "hipThrust": {\n        this.bench.visible=true; this.fig.rotation.x=Math.PI/2;')
                    
text = text.replace('      case "squat": {\n        const d=p;',
                    '      case "squat": {\n        this.rack.visible=true;\n        const d=p;')

text = text.replace('      case "latPulldown": {\n        this._r(this.lUA,0,0,2.8-p*1.4);',
                    '      case "latPulldown": {\n        this.pulldown.visible=true;\n        this._r(this.lUA,0,0,2.8-p*1.4);')

for pose in ["childPose", "catCow", "pigeonPose", "spinalTwist", "plank", "pushup", "mountainClimber"]:
    text = text.replace(f'      case "{pose}": {{', f'      case "{pose}": {{\n        this.mat.visible=true;')

with open("src/App.jsx", "w") as f:
    f.write(text)
