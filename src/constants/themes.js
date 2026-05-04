export const THEMES = [
  { id: "cyber", name: "Cyber Dark", bg: "#05060f", card: "#0b0d1c", card2: "#101224", border: "rgba(255,255,255,0.07)", pink: "#ff5fa0", teal: "#2de2c8", amber: "#ffb84d", violet: "#b388ff", green: "#4fffb0", red: "#ff6060", blue: "#5bc8ff", text: "#f0eeff", muted: "#55557a" },
  { id: "light", name: "Clean Light", bg: "#ffffff", card: "#f4f7f6", card2: "#eaeef2", border: "rgba(0,0,0,0.06)", pink: "#f06292", teal: "#4db6ac", amber: "#ffb74d", violet: "#ba68c8", green: "#81c784", red: "#e57373", blue: "#64b5f6", text: "#2c3e50", muted: "#90a4ae" },
  { id: "midnight", name: "Midnight Ocean", bg: "#020c1b", card: "#0a192f", card2: "#112240", border: "rgba(100,255,218,0.1)", pink: "#f50057", teal: "#64ffda", amber: "#ff9100", violet: "#651fff", green: "#00e676", red: "#d50000", blue: "#00b0ff", text: "#ccd6f6", muted: "#8892b0" },
  { id: "sunset", name: "Sunset Horizon", bg: "#1f0c1b", card: "#2d1326", card2: "#3b1a32", border: "rgba(255,183,77,0.1)", pink: "#ff4081", teal: "#1de9b6", amber: "#ffab40", violet: "#e040fb", green: "#00e676", red: "#ff1744", blue: "#00e5ff", text: "#ffebee", muted: "#bcaaa4" }
];

export const getGlobalCSS = (T) => `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${T.bg};color:${T.text};font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.09);border-radius:3px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes ping{0%{transform:scale(1);opacity:.6}80%,100%{transform:scale(2.8);opacity:0}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes glow{0%,100%{opacity:.6}50%{opacity:1}}
  .fu{animation:fadeUp 0.38s ease both}
  .d0{animation-delay:0s}.d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}.d4{animation-delay:.24s}.d5{animation-delay:.3s}
`;
