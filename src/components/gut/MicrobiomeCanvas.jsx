import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function MicrobiomeCanvas({ accent, violet }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth || 400;
    const H = el.clientHeight || 300;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.z = 6;

    /* particles */
    const palette = [
      new THREE.Color(accent),
      new THREE.Color(violet),
      new THREE.Color("#4fffb0"),
      new THREE.Color("#5bc8ff"),
      new THREE.Color("#ff5fa0"),
    ];
    const meshes = [];
    for (let i = 0; i < 70; i++) {
      const r   = 0.04 + Math.random() * 0.09;
      const geo = new THREE.SphereGeometry(r, 7, 7);
      const mat = new THREE.MeshBasicMaterial({
        color:       palette[i % palette.length],
        transparent: true,
        opacity:     0.45 + Math.random() * 0.45,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 4.5,
        (Math.random() - 0.5) * 3,
      );
      mesh.userData = {
        ox: mesh.position.x,
        oy: mesh.position.y,
        speed:  0.004 + Math.random() * 0.006,
        phase:  Math.random() * Math.PI * 2,
        ampX:   0.15 + Math.random() * 0.25,
        ampY:   0.1  + Math.random() * 0.2,
      };
      scene.add(mesh);
      meshes.push(mesh);
    }

    /* connecting lines between close pairs */
    const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(accent), transparent:true, opacity:0.12 });
    for (let i = 0; i < meshes.length; i++) {
      for (let j = i+1; j < meshes.length; j++) {
        if (meshes[i].position.distanceTo(meshes[j].position) < 1.8) {
          const geo = new THREE.BufferGeometry().setFromPoints([
            meshes[i].position.clone(), meshes[j].position.clone(),
          ]);
          scene.add(new THREE.Line(geo, lineMat));
        }
      }
    }

    let raf, t = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      t += 0.008;
      meshes.forEach(m => {
        m.position.x = m.userData.ox + Math.cos(t * m.userData.speed * 80 + m.userData.phase) * m.userData.ampX;
        m.position.y = m.userData.oy + Math.sin(t * m.userData.speed * 60 + m.userData.phase) * m.userData.ampY;
      });
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [accent, violet]);

  return <div ref={mountRef} style={{ position:"absolute", inset:0, zIndex:0 }} />;
}
