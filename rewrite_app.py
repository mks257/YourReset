import sys

with open("src/App.jsx", "r") as f:
    lines = f.readlines()

out = []
in_figure_scene = False
in_figure_3d = False

for line in lines:
    if 'import * as THREE' in line:
        continue
    
    if line.startswith('class FigureScene {'):
        in_figure_scene = True
        continue
        
    if in_figure_scene:
        if line.startswith('}'):
            in_figure_scene = False
        continue
        
    if line.startswith('/* ── 3D Canvas component ──────────────────────────────────────────────── */'):
        out.append(line)
        continue
        
    if line.startswith('function Figure3D({'):
        in_figure_3d = True
        out.append("""function Figure3D({ animKey, color, height = 220 }) {
  const [error, setError] = useState(false);
  const [ext, setExt] = useState('png');

  const handleError = () => {
    if (ext === 'png') setExt('jpg');
    else if (ext === 'jpg') setExt('webp');
    else setError(true);
  };

  return (
    <div style={{ width: "100%", height, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", borderRadius: 16 }}>
      {!error ? (
        <img 
          src={`./${animKey}.${ext}`} 
          alt={animKey}
          onError={handleError}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.95 }}
        />
      ) : (
        <div style={{ textAlign: "center", color: color, opacity: 0.6, fontSize: "0.8rem", fontWeight: 700 }}>
          {animKey}<br/><br/>📷
        </div>
      )}
      <div style={{ position: "absolute", top:0, left:0, right:0, bottom:0, background: `linear-gradient(to bottom, transparent 60%, ${color}30 100%)`, pointerEvents: "none" }} />
    </div>
  );
}
""")
        continue
        
    if in_figure_3d:
        if line.startswith('}'):
            in_figure_3d = False
        continue

    out.append(line)

with open("src/App.jsx", "w") as f:
    f.writelines(out)
