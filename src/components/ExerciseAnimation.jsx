import { useState, useEffect, useRef } from "react";
import { T } from "../theme";

const ExerciseAnimation = ({ type, color = T.pink }) => {
  const [frame, setFrame] = useState(0);
  const raf = useRef();

  useEffect(() => {
    let t = 0;
    const tick = () => { t += 0.03; setFrame(t); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const s = Math.sin(frame);
  const s2 = Math.sin(frame * 0.7);
  const pulse = 0.5 + 0.5 * s;

  const common = { stroke: color, strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
  const bodyColor = "rgba(255,255,255,0.15)";
  const W = 140, H = 140, cx = 70;

  const anims = {
    jumpingJacks: (
      <g>
        <circle cx={cx} cy={30 + s * 4} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={40 + s * 4} x2={cx} y2={80 + s * 4} {...common} />
        <line x1={cx} y1={55 + s * 4} x2={cx - 25 - pulse * 15} y2={40 + s * 4 - pulse * 15} {...common} />
        <line x1={cx} y1={55 + s * 4} x2={cx + 25 + pulse * 15} y2={40 + s * 4 - pulse * 15} {...common} />
        <line x1={cx} y1={80 + s * 4} x2={cx - 20 - pulse * 15} y2={110 + s * 4} {...common} />
        <line x1={cx} y1={80 + s * 4} x2={cx + 20 + pulse * 15} y2={110 + s * 4} {...common} />
      </g>
    ),
    chestPress: (
      <g>
        <rect x={20} y={90} width={100} height={8} rx={3} fill={bodyColor} stroke={color} strokeWidth={1.5} />
        <ellipse cx={cx} cy={84} rx={35} ry={7} fill={bodyColor} stroke={color} strokeWidth={1.5} />
        <circle cx={cx + 30} cy={80} r={9} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx - 15} y1={80} x2={cx - 30} y2={60 - pulse * 18} {...common} />
        <line x1={cx + 5} y1={80} x2={cx + 20} y2={60 - pulse * 18} {...common} />
        <rect x={cx - 38} y={52 - pulse * 18} width={14} height={5} rx={2} fill={color} opacity={0.8} />
        <rect x={cx + 20} y={52 - pulse * 18} width={14} height={5} rx={2} fill={color} opacity={0.8} />
      </g>
    ),
    chestFly: (
      <g>
        <rect x={20} y={90} width={100} height={8} rx={3} fill={bodyColor} stroke={color} strokeWidth={1.5} />
        <ellipse cx={cx} cy={84} rx={35} ry={7} fill={bodyColor} stroke={color} strokeWidth={1.5} />
        <circle cx={cx + 30} cy={80} r={9} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx - 15} y1={80} x2={cx - 35 - pulse * 15} y2={72 - pulse * 8} {...common} />
        <line x1={cx + 5} y1={80} x2={cx + 40 + pulse * 15} y2={72 - pulse * 8} {...common} />
        <circle cx={cx - 37 - pulse * 15} cy={70 - pulse * 8} r={5} fill={color} opacity={0.8} />
        <circle cx={cx + 42 + pulse * 15} cy={70 - pulse * 8} r={5} fill={color} opacity={0.8} />
      </g>
    ),
    inclinePress: (
      <g>
        <line x1={15} y1={110} x2={90} y2={70} stroke={color} strokeWidth={2} opacity={0.5} />
        <line x1={90} y1={70} x2={120} y2={70} stroke={color} strokeWidth={2} opacity={0.5} />
        <ellipse cx={55} cy={88} rx={32} ry={7} fill={bodyColor} stroke={color} strokeWidth={1.5} transform="rotate(-25 55 88)" />
        <circle cx={82} cy={68} r={9} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={45} y1={82} x2={30} y2={60 - pulse * 16} {...common} />
        <line x1={62} y1={78} x2={77} y2={58 - pulse * 16} {...common} />
        <rect x={22} y={52 - pulse * 16} width={13} height={4} rx={2} fill={color} opacity={0.8} />
        <rect x={77} y={52 - pulse * 16} width={13} height={4} rx={2} fill={color} opacity={0.8} />
      </g>
    ),
    pushup: (
      <g>
        <line x1={20} y1={90 - pulse * 20} x2={110} y2={75 - pulse * 5} {...common} strokeWidth={10} stroke={bodyColor} />
        <line x1={20} y1={90 - pulse * 20} x2={110} y2={75 - pulse * 5} stroke={color} strokeWidth={2} />
        <circle cx={112} cy={70 - pulse * 5} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={40} y1={86 - pulse * 18} x2={40} y2={105} {...common} />
        <line x1={85} y1={77 - pulse * 12} x2={85} y2={95} {...common} />
        <circle cx={40} cy={107} r={4} fill={color} opacity={0.7} />
        <circle cx={85} cy={97} r={4} fill={color} opacity={0.7} />
      </g>
    ),
    tricepPushdown: (
      <g>
        <circle cx={cx} cy={20} r={6} fill={color} opacity={0.5} />
        <line x1={cx} y1={26} x2={cx} y2={55} stroke={color} strokeWidth={1.5} strokeDasharray="3,3" opacity={0.5} />
        <line x1={cx} y1={55} x2={cx - 12} y2={62} {...common} />
        <line x1={cx} y1={55} x2={cx + 12} y2={62} {...common} />
        <circle cx={cx} cy={42} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={52} x2={cx} y2={85} {...common} />
        <line x1={cx} y1={60} x2={cx - 14} y2={62} {...common} />
        <line x1={cx} y1={60} x2={cx + 14} y2={62} {...common} />
        <line x1={cx - 14} y1={62} x2={cx - 12} y2={75 + pulse * 12} {...common} />
        <line x1={cx + 14} y1={62} x2={cx + 12} y2={75 + pulse * 12} {...common} />
        <line x1={cx} y1={85} x2={cx - 15} y2={110} {...common} />
        <line x1={cx} y1={85} x2={cx + 15} y2={110} {...common} />
      </g>
    ),
    stairmaster: (
      <g>
        {[0,1,2,3].map(i => (
          <rect key={i} x={20 + i * 22} y={75 - i * 12} width={22} height={35 + i * 12} rx={2} fill={bodyColor} stroke={color} strokeWidth={1.5} opacity={0.5} />
        ))}
        <circle cx={65} cy={38} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={65} y1={48} x2={65} y2={70} {...common} />
        <line x1={65} y1={60} x2={50} y2={72} {...common} />
        <line x1={65} y1={60} x2={78} y2={68} {...common} />
        <line x1={65} y1={70} x2={50} y2={85 - pulse * 10} {...common} />
        <line x1={65} y1={70} x2={80} y2={85 + pulse * 8} {...common} />
      </g>
    ),
    gobletSquat: (
      <g>
        <rect x={cx - 8} y={45 + pulse * 10} width={16} height={8} rx={3} fill={color} opacity={0.8} />
        <circle cx={cx} cy={32 + pulse * 10} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={43 + pulse * 10} x2={cx} y2={70 + pulse * 6} {...common} />
        <line x1={cx} y1={58 + pulse * 10} x2={cx - 10} y2={53 + pulse * 10} {...common} />
        <line x1={cx} y1={58 + pulse * 10} x2={cx + 10} y2={53 + pulse * 10} {...common} />
        <line x1={cx} y1={70 + pulse * 6} x2={cx - 22} y2={95 - pulse * 12} {...common} />
        <line x1={cx} y1={70 + pulse * 6} x2={cx + 22} y2={95 - pulse * 12} {...common} />
        <line x1={cx - 22} y1={95 - pulse * 12} x2={cx - 28} y2={115} {...common} />
        <line x1={cx + 22} y1={95 - pulse * 12} x2={cx + 28} y2={115} {...common} />
      </g>
    ),
    hipThrust: (
      <g>
        <rect x={15} y={70} width={50} height={10} rx={3} fill={bodyColor} stroke={color} strokeWidth={1.5} />
        <line x1={40} y1={60 - pulse * 20} x2={115} y2={60 - pulse * 20} stroke={color} strokeWidth={3} opacity={0.8} />
        <line x1={35} y1={68} x2={80} y2={60 - pulse * 20} {...common} strokeWidth={12} stroke={bodyColor} />
        <line x1={35} y1={68} x2={80} y2={60 - pulse * 20} stroke={color} strokeWidth={2} />
        <circle cx={85} cy={68} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={35} y1={68} x2={25} y2={100} {...common} />
        <line x1={55} y1={70} x2={65} y2={100} {...common} />
        <line x1={25} y1={100} x2={28} y2={115} {...common} />
        <line x1={65} y1={100} x2={62} y2={115} {...common} />
      </g>
    ),
    rdl: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <line x1={25} y1={110} x2={115} y2={110} stroke={color} strokeWidth={3} opacity={0.6} />
        <circle cx={25} cy={110} r={8} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
        <circle cx={115} cy={110} r={8} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
        <circle cx={cx} cy={30 + pulse * 12} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={41 + pulse * 12} x2={cx - 10} y2={90 - pulse * 18} {...common} />
        <line x1={cx - 5} y1={75 - pulse * 12} x2={cx - 20} y2={108 - pulse * 20} {...common} />
        <line x1={cx - 5} y1={75 - pulse * 12} x2={cx + 10} y2={108 - pulse * 20} {...common} />
        <line x1={cx - 10} y1={90 - pulse * 18} x2={cx - 20} y2={118} {...common} />
        <line x1={cx - 10} y1={90 - pulse * 18} x2={cx + 10} y2={118} {...common} />
      </g>
    ),
    lunge: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <circle cx={cx} cy={30} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={41} x2={cx} y2={75} {...common} />
        <line x1={cx} y1={58} x2={cx - 18} y2={68} {...common} />
        <line x1={cx} y1={58} x2={cx + 18} y2={68} {...common} />
        <line x1={cx} y1={75} x2={cx + 28} y2={90 + pulse * 10} {...common} />
        <line x1={cx + 28} y1={90 + pulse * 10} x2={cx + 32} y2={118} {...common} />
        <line x1={cx} y1={75} x2={cx - 28} y2={95 - pulse * 10} {...common} />
        <line x1={cx - 28} y1={95 - pulse * 10} x2={cx - 15} y2={118} {...common} />
      </g>
    ),
    cableKickback: (
      <g>
        <circle cx={cx - 10} cy={40} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx - 10} y1={50} x2={cx - 10} y2={75} {...common} />
        <line x1={cx - 10} y1={50} x2={cx + 35} y2={72} {...common} />
        <line x1={cx + 5} y1={60} x2={cx - 10} y2={78} {...common} />
        <line x1={cx - 10} y1={75} x2={cx - 25} y2={118} {...common} />
        <line x1={cx - 10} y1={75} x2={cx + 10 + pulse * 25} y2={90 - pulse * 20} {...common} />
      </g>
    ),
    latPulldown: (
      <g>
        <line x1={30} y1={20} x2={110} y2={20} stroke={color} strokeWidth={3} opacity={0.5} />
        <line x1={cx} y1={20} x2={cx} y2={32} stroke={color} strokeWidth={1.5} strokeDasharray="3,3" opacity={0.5} />
        <line x1={cx - 28} y1={32 + pulse * 20} x2={cx + 28} y2={32 + pulse * 20} stroke={color} strokeWidth={3} opacity={0.8} />
        <circle cx={cx} cy={42 + pulse * 5} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={53 + pulse * 5} x2={cx} y2={80} {...common} />
        <line x1={cx} y1={60 + pulse * 3} x2={cx - 28} y2={32 + pulse * 20} {...common} />
        <line x1={cx} y1={60 + pulse * 3} x2={cx + 28} y2={32 + pulse * 20} {...common} />
        <rect x={cx - 25} y={80} width={50} height={8} rx={3} fill={bodyColor} stroke={color} strokeWidth={1.5} opacity={0.5} />
        <line x1={cx} y1={88} x2={cx - 18} y2={112} {...common} />
        <line x1={cx} y1={88} x2={cx + 18} y2={112} {...common} />
      </g>
    ),
    seatedRow: (
      <g>
        <line x1={10} y1={75} x2={cx - 20 - pulse * 15} y2={75} stroke={color} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5} />
        <circle cx={10} cy={75} r={5} fill={color} opacity={0.5} />
        <circle cx={cx + 10} cy={48} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx + 10} y1={59} x2={cx + 10} y2={80} {...common} />
        <rect x={cx - 15} y={80} width={55} height={8} rx={3} fill={bodyColor} stroke={color} strokeWidth={1.5} opacity={0.5} />
        <line x1={cx + 5} y1={68} x2={cx - 20 - pulse * 15} y2={72} {...common} />
        <line x1={cx + 5} y1={68} x2={cx - 15 - pulse * 15} y2={78} {...common} />
        <line x1={cx + 10} y1={88} x2={cx - 10} y2={112} {...common} />
        <line x1={cx + 10} y1={88} x2={cx + 30} y2={112} {...common} />
      </g>
    ),
    dbRow: (
      <g>
        <rect x={45} y={80} width={70} height={10} rx={3} fill={bodyColor} stroke={color} strokeWidth={1.5} />
        <circle cx={100} cy={55} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={100} y1={65} x2={75} y2={80} {...common} />
        <line x1={75} y1={80} x2={45} y2={90 + pulse * 18} {...common} />
        <rect x={25} y={85 + pulse * 18} width={18} height={6} rx={2} fill={color} opacity={0.8} />
        <line x1={75} y1={80} x2={55} y2={82} {...common} />
        <line x1={75} y1={80} x2={80} y2={90} {...common} />
        <line x1={100} y1={65} x2={100} y2={90} {...common} />
        <line x1={100} y1={90} x2={105} y2={118} {...common} />
      </g>
    ),
    facePull: (
      <g>
        <circle cx={10} cy={60} r={7} fill={color} opacity={0.5} />
        <line x1={17} y1={60} x2={cx - 15 - pulse * 10} y2={55} stroke={color} strokeWidth={1.5} strokeDasharray="3,3" opacity={0.5} />
        <line x1={17} y1={60} x2={cx - 15 - pulse * 10} y2={65} stroke={color} strokeWidth={1.5} strokeDasharray="3,3" opacity={0.5} />
        <circle cx={cx + 10} cy={42} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx + 10} y1={53} x2={cx + 10} y2={85} {...common} />
        <line x1={cx + 10} y1={65} x2={cx - 15 - pulse * 10} y2={55} {...common} />
        <line x1={cx + 10} y1={65} x2={cx - 15 - pulse * 10} y2={65} {...common} />
        <line x1={cx + 10} y1={85} x2={cx - 5} y2={112} {...common} />
        <line x1={cx + 10} y1={85} x2={cx + 25} y2={112} {...common} />
      </g>
    ),
    rowingMachine: (
      <g>
        <line x1={10} y1={100} x2={130} y2={90} stroke={color} strokeWidth={2} opacity={0.4} />
        <rect x={cx - 10} y={82} width={22} height={8} rx={3} fill={bodyColor} stroke={color} strokeWidth={1.5} />
        <circle cx={cx - 5 + pulse * 8} cy={58} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx - 5 + pulse * 8} y1={69} x2={cx - 5 + pulse * 5} y2={82} {...common} />
        <line x1={15} y1={82} x2={cx - 10 - pulse * 15} y2={68} stroke={color} strokeWidth={2} strokeDasharray="4,3" opacity={0.5} />
        <line x1={cx - 5 + pulse * 8} y1={72} x2={cx - 10 - pulse * 15} y2={68} {...common} />
        <line x1={cx - 5 + pulse * 5} y1={82} x2={cx - 20 - pulse * 10} y2={100} {...common} />
        <line x1={cx - 5 + pulse * 5} y1={82} x2={cx + 15 + pulse * 10} y2={100} {...common} />
      </g>
    ),
    catCow: (
      <g>
        <line x1={15} y1={108} x2={125} y2={108} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <circle cx={cx + 30} cy={68} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <path d={`M ${cx - 20} 88 Q ${cx} ${70 - s * 15} ${cx + 20} 80`} {...common} strokeWidth={8} stroke={bodyColor} />
        <path d={`M ${cx - 20} 88 Q ${cx} ${70 - s * 15} ${cx + 20} 80`} stroke={color} strokeWidth={2} fill="none" />
        <line x1={cx - 20} y1={88} x2={cx - 22} y2={108} {...common} />
        <line x1={cx - 5} y1={86} x2={cx - 7} y2={108} {...common} />
        <line x1={cx + 18} y1={80} x2={cx + 18} y2={108} {...common} />
        <line x1={cx + 35} y1={82} x2={cx + 35} y2={108} {...common} />
      </g>
    ),
    pigeonPose: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <circle cx={cx} cy={35} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={46} x2={cx - 5} y2={85} {...common} />
        <line x1={cx - 5} y1={85} x2={cx - 30} y2={105} {...common} />
        <line x1={cx - 30} y1={105} x2={cx + 5} y2={115} {...common} />
        <line x1={cx - 5} y1={85} x2={cx + 40} y2={100} {...common} />
        <line x1={cx} y1={60} x2={cx - 30} y2={80 + pulse * 12} {...common} />
        <line x1={cx} y1={60} x2={cx + 20} y2={75} {...common} />
      </g>
    ),
    inclineWalk: (
      <g>
        <rect x={10} y={85} width={120} height={15} rx={5} fill={bodyColor} stroke={color} strokeWidth={1.5} transform="rotate(-12 70 92)" opacity={0.6} />
        {[0,1,2].map(i => (
          <circle key={i} cx={25 + i * 35 + (frame * 20 % 35)} cy={88 - (25 + i * 35 + (frame * 20 % 35)) * 0.22} r={3} fill={color} opacity={0.5} />
        ))}
        <circle cx={cx + 5} cy={48} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx + 5} y1={59} x2={cx + 5} y2={80} {...common} />
        <line x1={cx + 5} y1={68} x2={cx - 14} y2={74} {...common} />
        <line x1={cx + 5} y1={68} x2={cx + 20} y2={72} {...common} />
        <line x1={cx + 5} y1={80} x2={cx - 10} y2={100 - pulse * 8} {...common} />
        <line x1={cx + 5} y1={80} x2={cx + 18} y2={100 + pulse * 8} {...common} />
      </g>
    ),
    childPose: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <path d={`M 30 ${100 + s * 3} Q 70 ${70 - s * 5} 110 ${95 + s * 2}`} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.3} />
        <path d={`M 30 ${100 + s * 3} Q 70 ${70 - s * 5} 110 ${95 + s * 2}`} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
        <circle cx={110} cy={90 + s * 2} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={55} y1={75 - s * 3} x2={25} y2={90 + s * 3} {...common} />
        <line x1={55} y1={75 - s * 3} x2={30} y2={110} {...common} />
      </g>
    ),
    shoulderPress: (
      <g>
        <circle cx={cx} cy={30} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={41} x2={cx} y2={80} {...common} />
        <line x1={cx} y1={55} x2={cx - 22} y2={48} {...common} />
        <line x1={cx} y1={55} x2={cx + 22} y2={48} {...common} />
        <line x1={cx - 22} y1={48} x2={cx - 22} y2={30 - pulse * 18} {...common} />
        <line x1={cx + 22} y1={48} x2={cx + 22} y2={30 - pulse * 18} {...common} />
        <rect x={cx - 30} y={22 - pulse * 18} width={16} height={5} rx={2} fill={color} opacity={0.8} />
        <rect x={cx + 15} y={22 - pulse * 18} width={16} height={5} rx={2} fill={color} opacity={0.8} />
        <line x1={cx} y1={80} x2={cx - 18} y2={112} {...common} />
        <line x1={cx} y1={80} x2={cx + 18} y2={112} {...common} />
      </g>
    ),
    lateralRaise: (
      <g>
        <circle cx={cx} cy={32} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={43} x2={cx} y2={80} {...common} />
        <line x1={cx} y1={58} x2={cx - 30 - pulse * 15} y2={55 - pulse * 18} {...common} />
        <line x1={cx} y1={58} x2={cx + 30 + pulse * 15} y2={55 - pulse * 18} {...common} />
        <circle cx={cx - 33 - pulse * 15} cy={53 - pulse * 18} r={5} fill={color} opacity={0.8} />
        <circle cx={cx + 33 + pulse * 15} cy={53 - pulse * 18} r={5} fill={color} opacity={0.8} />
        <line x1={cx} y1={80} x2={cx - 18} y2={112} {...common} />
        <line x1={cx} y1={80} x2={cx + 18} y2={112} {...common} />
      </g>
    ),
    bicepCurl: (
      <g>
        <circle cx={cx} cy={32} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={43} x2={cx} y2={80} {...common} />
        <line x1={cx} y1={80} x2={cx - 18} y2={112} {...common} />
        <line x1={cx} y1={80} x2={cx + 18} y2={112} {...common} />
        <line x1={cx} y1={58} x2={cx + 20} y2={68} {...common} />
        <line x1={cx + 20} y1={68} x2={cx + 22} y2={95} {...common} />
        <rect x={cx + 15} y={90} width={14} height={5} rx={2} fill={color} opacity={0.8} />
        <line x1={cx} y1={58} x2={cx - 20} y2={65} {...common} />
        <line x1={cx - 20} y1={65} x2={cx - 22} y2={65 - pulse * 30} {...common} />
        <rect x={cx - 30} y={60 - pulse * 30} width={14} height={5} rx={2} fill={color} opacity={0.8} />
      </g>
    ),
    hammerCurl: (
      <g>
        <circle cx={cx} cy={32} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={43} x2={cx} y2={80} {...common} />
        <line x1={cx} y1={80} x2={cx - 18} y2={112} {...common} />
        <line x1={cx} y1={80} x2={cx + 18} y2={112} {...common} />
        <line x1={cx} y1={58} x2={cx - 22} y2={65} {...common} />
        <line x1={cx - 22} y1={65} x2={cx - 22} y2={90 - pulse * 28} {...common} />
        <rect x={cx - 28} y={85 - pulse * 28} width={6} height={14} rx={2} fill={color} opacity={0.8} />
        <line x1={cx} y1={58} x2={cx + 22} y2={65} {...common} />
        <line x1={cx + 22} y1={65} x2={cx + 22} y2={68 + pulse * 18} {...common} />
        <rect x={cx + 20} y={62 + pulse * 18} width={6} height={14} rx={2} fill={color} opacity={0.8} />
      </g>
    ),
    tricepExtension: (
      <g>
        <circle cx={cx} cy={32} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={43} x2={cx} y2={80} {...common} />
        <line x1={cx} y1={80} x2={cx - 18} y2={112} {...common} />
        <line x1={cx} y1={80} x2={cx + 18} y2={112} {...common} />
        <line x1={cx} y1={55} x2={cx - 15} y2={40} {...common} />
        <line x1={cx} y1={55} x2={cx + 15} y2={40} {...common} />
        <line x1={cx - 15} y1={40} x2={cx - 8} y2={40 + pulse * 28} {...common} />
        <line x1={cx + 15} y1={40} x2={cx + 8} y2={40 + pulse * 28} {...common} />
        <rect x={cx - 10} y={38 + pulse * 28} width={20} height={7} rx={3} fill={color} opacity={0.8} />
      </g>
    ),
    jumpRope: (
      <g>
        <circle cx={cx} cy={30 - pulse * 8} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={41 - pulse * 8} x2={cx} y2={78 - pulse * 6} {...common} />
        <path d={`M ${cx - 22} ${65 - pulse * 6} Q ${cx} ${95 + s2 * 12} ${cx + 22} ${65 - pulse * 6}`} stroke={color} strokeWidth={2} fill="none" />
        <line x1={cx} y1={58 - pulse * 8} x2={cx - 22} y2={65 - pulse * 6} {...common} />
        <line x1={cx} y1={58 - pulse * 8} x2={cx + 22} y2={65 - pulse * 6} {...common} />
        <line x1={cx} y1={78 - pulse * 6} x2={cx - 18} y2={105 - pulse * 10} {...common} />
        <line x1={cx} y1={78 - pulse * 6} x2={cx + 18} y2={105 - pulse * 10} {...common} />
      </g>
    ),
    plank: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <line x1={18} y1={95} x2={115} y2={82} {...common} strokeWidth={10} stroke={bodyColor} />
        <line x1={18} y1={95} x2={115} y2={82} stroke={color} strokeWidth={2} />
        <circle cx={118} cy={78} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={35} y1={92} x2={35} y2={110} {...common} />
        <line x1={75} y1={85} x2={75} y2={103} {...common} />
        <line x1={18} y1={95} x2={15} y2={110} {...common} />
        <circle cx={70} cy={86} r={3 + pulse * 2} fill={color} opacity={0.3} />
      </g>
    ),
    russianTwist: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <circle cx={cx} cy={55} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={66} x2={cx - 5} y2={95} {...common} />
        <line x1={cx - 5} y1={95} x2={cx - 25} y2={108} {...common} />
        <line x1={cx - 5} y1={95} x2={cx + 20} y2={105} {...common} />
        <line x1={cx} y1={72} x2={cx - 20 + s * 30} y2={68 + s * 8} {...common} />
        <circle cx={cx - 25 + s * 30} cy={65 + s * 8} r={7} fill="none" stroke={color} strokeWidth={2} opacity={0.8} />
      </g>
    ),
    legRaise: (
      <g>
        <line x1={15} y1={85} x2={125} y2={85} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <line x1={25} y1={78} x2={85} y2={78} {...common} strokeWidth={8} stroke={bodyColor} />
        <circle cx={92} cy={78} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={25} y1={78} x2={28} y2={78 - pulse * 40} {...common} />
        <line x1={45} y1={78} x2={48} y2={78 - pulse * 40} {...common} />
        <line x1={28} y1={78 - pulse * 40} x2={48} y2={78 - pulse * 40} {...common} />
      </g>
    ),
    mountainClimber: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <circle cx={110} cy={55} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={20} y1={92} x2={100} y2={65} {...common} strokeWidth={8} stroke={bodyColor} />
        <line x1={20} y1={92} x2={100} y2={65} stroke={color} strokeWidth={2} />
        <line x1={40} y1={87} x2={40} y2={108} {...common} />
        <line x1={80} y1={74} x2={80} y2={95} {...common} />
        <line x1={20} y1={92} x2={45 + pulse * 25} y2={80 - pulse * 18} {...common} />
        <line x1={20} y1={92} x2={25} y2={110} {...common} />
      </g>
    ),
    burpee: (
      <g>
        {pulse > 0.5 ? (
          <g>
            <circle cx={cx} cy={20} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
            <line x1={cx} y1={31} x2={cx} y2={65} {...common} />
            <line x1={cx} y1={48} x2={cx - 20} y2={38} {...common} />
            <line x1={cx} y1={48} x2={cx + 20} y2={38} {...common} />
            <line x1={cx} y1={65} x2={cx - 20} y2={90} {...common} />
            <line x1={cx} y1={65} x2={cx + 20} y2={90} {...common} />
            {[-1,1].map(d => <line key={d} x1={cx + d * 25} y1={82} x2={cx + d * 35} y2={68} stroke={color} strokeWidth={2} opacity={0.6} />)}
          </g>
        ) : (
          <g>
            <circle cx={110} cy={55} r={10} fill={bodyColor} stroke={color} strokeWidth={2} />
            <line x1={15} y1={90} x2={100} y2={64} {...common} strokeWidth={8} stroke={bodyColor} />
            <line x1={15} y1={90} x2={100} y2={64} stroke={color} strokeWidth={2} />
            <line x1={35} y1={85} x2={35} y2={108} {...common} />
            <line x1={75} y1={71} x2={75} y2={94} {...common} />
            <line x1={15} y1={90} x2={12} y2={112} {...common} />
            <line x1={15} y1={90} x2={30} y2={110} {...common} />
          </g>
        )}
      </g>
    ),
    treadmill: (
      <g>
        <rect x={10} y={88} width={120} height={14} rx={5} fill={bodyColor} stroke={color} strokeWidth={1.5} opacity={0.6} />
        {[0,1,2,3].map(i => (
          <line key={i} x1={20 + i * 28 - (frame * 25 % 28)} y1={88} x2={20 + i * 28 - (frame * 25 % 28)} y2={102} stroke={color} strokeWidth={1} opacity={0.4} />
        ))}
        <circle cx={cx} cy={40} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={51} x2={cx} y2={78} {...common} />
        <line x1={cx} y1={65} x2={cx - 18} y2={70} {...common} />
        <line x1={cx} y1={65} x2={cx + 18} y2={70} {...common} />
        <line x1={cx} y1={78} x2={cx - 15} y2={100 - pulse * 10} {...common} />
        <line x1={cx} y1={78} x2={cx + 15} y2={100 + pulse * 8} {...common} />
      </g>
    ),
    jumpSquat: (
      <g>
        <circle cx={cx} cy={25 - pulse * 20} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={36 - pulse * 20} x2={cx} y2={72 - pulse * 15} {...common} />
        <line x1={cx} y1={55 - pulse * 18} x2={cx - 18} y2={48 - pulse * 16} {...common} />
        <line x1={cx} y1={55 - pulse * 18} x2={cx + 18} y2={48 - pulse * 16} {...common} />
        <line x1={cx} y1={72 - pulse * 15} x2={cx - 22} y2={95 + pulse * 8} {...common} />
        <line x1={cx} y1={72 - pulse * 15} x2={cx + 22} y2={95 + pulse * 8} {...common} />
        <line x1={cx - 22} y1={95 + pulse * 8} x2={cx - 25} y2={115} {...common} />
        <line x1={cx + 22} y1={95 + pulse * 8} x2={cx + 25} y2={115} {...common} />
      </g>
    ),
    kbSwing: (
      <g>
        <line x1={15} y1={118} x2={125} y2={118} stroke={color} strokeWidth={1.5} opacity={0.3} />
        <circle cx={cx} cy={90 - pulse * 55} r={9} fill="none" stroke={color} strokeWidth={2.5} />
        <rect x={cx - 6} y={83 - pulse * 55} width={12} height={5} rx={2} fill="none" stroke={color} strokeWidth={2} />
        <circle cx={cx} cy={35 + pulse * 8} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={46 + pulse * 8} x2={cx} y2={80 + pulse * 5} {...common} />
        <line x1={cx} y1={62 + pulse * 6} x2={cx - 12} y2={75 - pulse * 15} {...common} />
        <line x1={cx} y1={62 + pulse * 6} x2={cx + 12} y2={75 - pulse * 15} {...common} />
        <line x1={cx} y1={80 + pulse * 5} x2={cx - 22} y2={105 - pulse * 8} {...common} />
        <line x1={cx} y1={80 + pulse * 5} x2={cx + 22} y2={105 - pulse * 8} {...common} />
        <line x1={cx - 22} y1={105 - pulse * 8} x2={cx - 25} y2={118} {...common} />
        <line x1={cx + 22} y1={105 - pulse * 8} x2={cx + 25} y2={118} {...common} />
      </g>
    ),
    stepUp: (
      <g>
        <rect x={50} y={88} width={75} height={28} rx={4} fill={bodyColor} stroke={color} strokeWidth={1.5} opacity={0.6} />
        <circle cx={cx} cy={38} r={11} fill={bodyColor} stroke={color} strokeWidth={2} />
        <line x1={cx} y1={49} x2={cx} y2={75} {...common} />
        <line x1={cx} y1={62} x2={cx - 18} y2={68} {...common} />
        <line x1={cx} y1={62} x2={cx + 18} y2={68} {...common} />
        <line x1={cx} y1={75} x2={cx + 22} y2={88 - pulse * 15} {...common} />
        <line x1={cx} y1={75} x2={cx - 15} y2={105 + pulse * 8} {...common} />
        <line x1={cx - 15} y1={105 + pulse * 8} x2={cx - 18} y2={118} {...common} />
      </g>
    ),
  };

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:"block", filter:`drop-shadow(0 0 8px ${color}44)` }}>
      <circle cx={cx} cy={H/2} r={60} fill={`${color}08`} />
      {anims[type] || anims.jumpingJacks}
    </svg>
  );
};

export default ExerciseAnimation;
