import sys

with open("src/App.jsx", "r") as f:
    text = f.read()

# 1. Update FigureScene constructor to accept charType
old_constructor = "  constructor(canvas, accentColor) {"
new_constructor = "  constructor(canvas, accentColor, charType = 'female') {\n    this.charType = charType;"
text = text.replace(old_constructor, new_constructor)

# 2. Update _buildFigure to handle proportions
old_build = """  _buildFigure() {
    const skinM = new THREE.MeshStandardMaterial({ color:0x1a1a2e, roughness:0.2, metalness:0.8 });"""

new_build = """  _buildFigure() {
    const isM = this.charType === 'male';
    const skinM = new THREE.MeshStandardMaterial({ color: isM ? 0x222222 : 0x1a1a2e, roughness:0.2, metalness:0.8 });"""
text = text.replace(old_build, new_build)

# 3. Adjust torso and limb scaling in _buildFigure
old_torso = """    // Torso (Sculpted)
    this.torso = new THREE.Group();
    const chest = createPart(new THREE.BoxGeometry(0.38, 0.35, 0.22), skinM);
    const abs = createPart(new THREE.BoxGeometry(0.28, 0.25, 0.18), skinM, 0, -0.25);
    this.torso.add(chest, abs);
    this.torso.position.y = 1.1; this.fig.add(this.torso);"""

new_torso = """    // Torso (Sculpted)
    this.torso = new THREE.Group();
    const chest = createPart(new THREE.BoxGeometry(isM ? 0.48 : 0.38, 0.35, 0.22), skinM);
    const abs = createPart(new THREE.BoxGeometry(isM ? 0.32 : 0.28, 0.25, 0.18), skinM, 0, -0.25);
    this.torso.add(chest, abs);
    this.torso.position.y = isM ? 1.2 : 1.1; this.fig.add(this.torso);"""
text = text.replace(old_torso, new_torso)

# 4. Adjust limb scaling
old_limb_fn = """    const buildLimb = (upperLen, lowerLen, isLeg=false) => {
      const g = new THREE.Group();
      const u = createPart(new THREE.CylinderGeometry(isLeg?0.09:0.07, isLeg?0.07:0.05, upperLen, 12), skinM, 0, -upperLen/2);
      const l = createPart(new THREE.CylinderGeometry(isLeg?0.07:0.05, isLeg?0.05:0.04, lowerLen, 12), skinM, 0, -lowerLen/2);"""

new_limb_fn = """    const buildLimb = (upperLen, lowerLen, isLeg=false) => {
      const g = new THREE.Group();
      const uw = (isLeg ? (isM?0.11:0.09) : (isM?0.09:0.07));
      const lw = (isLeg ? (isM?0.09:0.07) : (isM?0.07:0.05));
      const u = createPart(new THREE.CylinderGeometry(uw, lw, upperLen, 12), skinM, 0, -upperLen/2);
      const l = createPart(new THREE.CylinderGeometry(lw, lw*0.8, lowerLen, 12), skinM, 0, -lowerLen/2);"""
text = text.replace(old_limb_fn, new_limb_fn)

# 5. Adjust limb positions
old_limb_pos = """    this.lArm = buildLimb(0.28, 0.28); this.lArm.position.set(0.22, 0.15, 0); this.torso.add(this.lArm);
    this.rArm = buildLimb(0.28, 0.28); this.rArm.position.set(-0.22, 0.15, 0); this.torso.add(this.rArm);
    this.lLeg = buildLimb(0.42, 0.42, true); this.lLeg.position.set(0.12, -0.4, 0); this.torso.add(this.lLeg);
    this.rLeg = buildLimb(0.42, 0.42, true); this.rLeg.position.set(-0.12, -0.4, 0); this.torso.add(this.rLeg);"""

new_limb_pos = """    const armX = isM ? 0.28 : 0.22;
    this.lArm = buildLimb(0.28, 0.28); this.lArm.position.set(armX, 0.15, 0); this.torso.add(this.lArm);
    this.rArm = buildLimb(0.28, 0.28); this.rArm.position.set(-armX, 0.15, 0); this.torso.add(this.rArm);
    this.lLeg = buildLimb(0.42, 0.42, true); this.lLeg.position.set(isM?0.15:0.12, -0.4, 0); this.torso.add(this.lLeg);
    this.rLeg = buildLimb(0.42, 0.42, true); this.rLeg.position.set(isM?-0.15:-0.12, -0.4, 0); this.torso.add(this.rLeg);"""
text = text.replace(old_limb_pos, new_limb_pos)

# 6. Update Figure3D component to accept and pass charType
old_fig3d_def = "function Figure3D({ animKey, color, height = 220 }) {"
new_fig3d_def = "function Figure3D({ animKey, color, height = 220, charType = 'female' }) {"
text = text.replace(old_fig3d_def, new_fig3d_def)

old_fig3d_effect = '    sceneRef.current = new FigureScene(c, color);\n    sceneRef.current.setPose(animKey);'
new_fig3d_effect = '    sceneRef.current = new FigureScene(c, color, charType);\n    sceneRef.current.setPose(animKey);'
text = text.replace(old_fig3d_effect, new_fig3d_effect)

old_fig3d_dep = '  }, []);'
new_fig3d_dep = '  }, [charType]);'
text = text.replace(old_fig3d_dep, new_fig3d_dep)

with open("src/App.jsx", "w") as f:
    f.write(text)
