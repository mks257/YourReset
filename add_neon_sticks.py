import sys

with open("src/App.jsx", "r") as f:
    text = f.read()

old_lights = """    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8); mainLight.position.set(2, 4, 3); this.scene.add(mainLight);
    this.glow = new THREE.PointLight(accentColor, 2.5, 5); this.glow.position.set(0, 1, 1); this.scene.add(this.glow);"""

new_lights = """    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8); mainLight.position.set(2, 4, 3); this.scene.add(mainLight);
    this.glow = new THREE.PointLight(accentColor, 2.5, 5); this.glow.position.set(0, 1, 1); this.scene.add(this.glow);

    // Aesthetic Neon Sticks
    for(let i=0; i<3; i++) {
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.5), new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 4 }));
        stick.position.set(-1.5 + i*1.5, 1.2, -1.2); stick.rotation.z = Math.PI/4;
        this.scene.add(stick);
    }"""

text = text.replace(old_lights, new_lights)

with open("src/App.jsx", "w") as f:
    f.write(text)
