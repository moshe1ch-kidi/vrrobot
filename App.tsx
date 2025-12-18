
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Play, RotateCcw, Code2, Ruler, Trophy, CheckCircle, X, Video, Square, Flag, Save, FolderOpen } from 'lucide-react';
import { Vector3 } from 'three';
import BlocklyEditor, { BlocklyEditorHandle } from './components/BlocklyEditor';
import Robot3D from './components/Robot3D';
import SimulationEnvironment from './components/Environment';
import { RobotState } from './types';
import Numpad from './components/Numpad';
import SensorDashboard from './components/SensorDashboard';
import RulerTool from './components/RulerTool';
import ColorPickerTool from './components/ColorPickerTool';
import { CHALLENGES, Challenge, SimulationHistory } from './data/challenges';

// Constants for simulation
const SPEED_MULTIPLIER = 0.05;

// Custom Cursor SVG (Pink Pipette)
const DROPPER_CURSOR_URL = `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlYzQ4OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMiAyMmw1LTUiLz48cGF0aCBkPSJNMTUuNTQgOC40NmE1IDUgMCAxIDAtNy4wNyA3LjA3bDEuNDEgMS40MWEyIDIgMCAwIDAgMi44MyAwbDIuODMtMi44M2EyIDIgMCAwIDAgMC0yLjgzbC0xLjQxLTEuNDF6Ii8+PC9zdmc+') 0 24, crosshair`;

const getEnvironmentConfig = (challengeId?: string) => {
    let wall = { minX: -100, maxX: -101, minZ: -100, maxZ: -101 };
    if (['c9', 'c14', 'c15', 'c16', 'c19', 'c20'].includes(challengeId || '')) {
         wall = { minX: -3, maxX: 3, minZ: -8.25, maxZ: -7.75 };
    }
    let colorZones: {minX: number, maxX: number, minZ: number, maxZ: number, color: number}[] = [];
    if (['c13', 'c14'].includes(challengeId || '')) {
         colorZones.push({ minX: 1.5, maxX: 3.5, minZ: -4, maxZ: -2, color: 0x0000FF });
         colorZones.push({ minX: -3.5, maxX: -1.5, minZ: -4, maxZ: -2, color: 0xFF0000 });
    }
    return { wall, colorZones };
};

const calculateSensorReadings = (x: number, z: number, rotation: number, challengeId?: string) => {
    const rad = (rotation * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const env = getEnvironmentConfig(challengeId);
    const gyro = Math.round(rotation % 360);
    const isTouching = (x + sin * 1.6 >= env.wall.minX && x + sin * 1.6 <= env.wall.maxX && z + cos * 1.6 >= env.wall.minZ && z + cos * 1.6 <= env.wall.maxZ);
    let distance = 255;
    for(let d = 0; d < 25.5; d += 0.5) {
        const tx = (x + sin * 1.05) + sin * d;
        const tz = (z + cos * 1.05) + cos * d;
        if (tx >= env.wall.minX && tx <= env.wall.maxX && tz >= env.wall.minZ && tz <= env.wall.maxZ) {
            distance = Math.round(d * 10);
            break;
        }
    }
    let color = "white";
    let intensity = 100;
    let rawDecimalColor = 16777215;
    const cx = x + sin * 0.8;
    const cz = z + cos * 0.8;
    if (challengeId === 'c21') {
        const d = Math.sqrt(Math.pow(cx - (-6), 2) + Math.pow(cz - 0, 2));
        if (d >= 5.8 && d <= 6.2) { rawDecimalColor = 0; color = "black"; intensity = 5; }
    }
    for (const zone of env.colorZones) {
        if (cx >= zone.minX && cx <= zone.maxX && cz >= zone.minZ && cz <= zone.maxZ) {
            rawDecimalColor = zone.color;
            color = zone.color === 0xFF0000 ? "red" : "blue";
            intensity = 50;
        }
    }
    return { gyro, isTouching, distance, color, intensity, rawDecimalColor };
};

const CameraFollower = ({ 
    targetX, 
    targetY, 
    targetZ, 
    isFollowing, 
    onResetCamera, 
    activeChallenge 
}: { 
    targetX: number, 
    targetY: number, 
    targetZ: number, 
    isFollowing: boolean, 
    onResetCamera: boolean,
    activeChallenge: Challenge | null
}) => {
    const { camera, controls } = useThree();
    const lastTarget = useRef(new Vector3(targetX, targetY, targetZ));
    
    useEffect(() => {
        if (onResetCamera && controls) {
            const defaultPos: [number, number, number] = activeChallenge?.startCameraPosition ?? [5, 8, 8];
            camera.position.set(...defaultPos);
            // @ts-ignore
            controls.target.set(targetX, 0, targetZ);
            controls.update();
        }
    }, [onResetCamera, activeChallenge]);

    useFrame(() => {
        const currentTarget = new Vector3(targetX, targetY - 0.6, targetZ);
        const delta = new Vector3().subVectors(currentTarget, lastTarget.current);
        if (isFollowing && controls) {
            camera.position.add(delta);
            // @ts-ignore
            if (controls.target) controls.target.add(delta);
        }
        lastTarget.current.copy(currentTarget);
    });
    return null;
}

const App: React.FC = () => {
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isRulerActive, setIsRulerActive] = useState(false);
  const [isColorPickerActive, setIsColorPickerActive] = useState(false);
  const [isCameraFollowing, setIsCameraFollowing] = useState(false);
  const [resetCameraTrigger, setResetCameraTrigger] = useState(false);
  const [pickerHoverColor, setPickerHoverColor] = useState<string | null>(null);
  const [showChallenges, setShowChallenges] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [challengeSuccess, setChallengeSuccess] = useState(false);

  // Refs for Blockly control
  const editorRef = useRef<BlocklyEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const historyRef = useRef<SimulationHistory>({
      maxDistanceMoved: 0, touchedWall: false, detectedColors: [], totalRotation: 0
  });
  
  const [numpadConfig, setNumpadConfig] = useState({
    isOpen: false, value: 0, onConfirm: (val: number) => {}
  });

  const initialState: RobotState = {
    x: 0, y: 0, z: 0, rotation: 180, speed: 100, ledLeftColor: 'black', ledRightColor: 'black', isMoving: false, isTouching: false,
  };

  const [robotState, setRobotState] = useState<RobotState>(initialState);
  const robotRef = useRef(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const startStateRef = useRef(initialState);
  const activeChallengeIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    window.showBlocklyNumpad = (v, c) => setNumpadConfig({ isOpen: true, value: Number(v), onConfirm: (val) => { c(val); setNumpadConfig(p => ({ ...p, isOpen: false })); } });
    window.showBlocklyColorPicker = () => { setIsColorPickerActive(true); setIsRulerActive(false); };
  }, []);

  useEffect(() => { activeChallengeIdRef.current = activeChallenge?.id; }, [activeChallenge]);

  const sensorReadings = useMemo(() => calculateSensorReadings(robotState.x, robotState.z, robotState.rotation, activeChallenge?.id), [robotState.x, robotState.z, robotState.rotation, activeChallenge]);

  const updateRobotState = (newState: Partial<RobotState>) => {
    const updated = { ...robotRef.current, ...newState };
    if (isNaN(updated.x)) updated.x = robotRef.current.x;
    if (isNaN(updated.y)) updated.y = robotRef.current.y;
    if (isNaN(updated.z)) updated.z = robotRef.current.z;
    robotRef.current = updated;
    setRobotState(updated);
  };

  const createRobotApi = (signal: AbortSignal) => ({
      setSpeed: async (s: number) => updateRobotState({ speed: Math.max(0, Math.min(100, s)) }),
      stop: async () => { updateRobotState({ isMoving: false }); await new Promise(r => setTimeout(r, 50)); },
      move: async (distanceCm: number) => {
        updateRobotState({ isMoving: true });
        const duration = (Math.abs(distanceCm) * 20) / (Math.max(1, robotRef.current.speed) / 100);
        const steps = Math.ceil(duration / 16) || 1;
        const distPerStep = (distanceCm * 0.1) / steps; 
        for (let i = 0; i < steps; i++) {
            if (signal.aborted) throw new Error("Simulation aborted");
            await new Promise(r => setTimeout(r, duration/steps));
            const rad = (robotRef.current.rotation * Math.PI) / 180;
            const nx = robotRef.current.x + Math.sin(rad) * distPerStep;
            const nz = robotRef.current.z + Math.cos(rad) * distPerStep;
            
            let ny = 0;
            if (activeChallengeIdRef.current === 'c3') {
                if (nz <= -1.5 && nz >= -16.5) {
                    ny = Math.max(0, Math.min(1, ((-nz) - 1.5) * (1.0 / 15.0)));
                } else if (nz < -16.5) {
                    ny = 1.0;
                }
            }
            const sd = calculateSensorReadings(nx, nz, robotRef.current.rotation, activeChallengeIdRef.current);
            updateRobotState({ x: nx, y: ny, z: nz, isTouching: sd.isTouching });
            historyRef.current.maxDistanceMoved = Math.max(historyRef.current.maxDistanceMoved, Math.sqrt(Math.pow(nx - startStateRef.current.x, 2) + Math.pow(nz - startStateRef.current.z, 2)));
        }
        updateRobotState({ isMoving: false });
      },
      turn: async (angleDeg: number) => {
        updateRobotState({ isMoving: true });
        const duration = (Math.abs(angleDeg) * 10) / (Math.max(1, robotRef.current.speed) / 100);
        const steps = Math.ceil(duration / 16) || 1;
        const angPerStep = angleDeg / steps;
        for (let i = 0; i < steps; i++) {
            if (signal.aborted) throw new Error("Simulation aborted");
            await new Promise(r => setTimeout(r, duration/steps));
            const nr = robotRef.current.rotation + angPerStep;
            const sd = calculateSensorReadings(robotRef.current.x, robotRef.current.z, nr, activeChallengeIdRef.current);
            updateRobotState({ rotation: nr, isTouching: sd.isTouching });
            historyRef.current.totalRotation += angPerStep;
        }
        updateRobotState({ isMoving: false });
      },
      setLed: (s: string, c: string) => {
          if (s === 'left' || s === 'both') updateRobotState({ ledLeftColor: c });
          if (s === 'right' || s === 'both') updateRobotState({ ledRightColor: c });
      },
      wait: async (ms: number) => { await new Promise(r => setTimeout(r, ms)); },
      getDistance: async () => calculateSensorReadings(robotRef.current.x, robotRef.current.z, robotRef.current.rotation, activeChallengeIdRef.current).distance,
      getTouch: async () => {
          const val = calculateSensorReadings(robotRef.current.x, robotRef.current.z, robotRef.current.rotation, activeChallengeIdRef.current).isTouching;
          if (val) historyRef.current.touchedWall = true;
          return val;
      },
      getGyro: async () => calculateSensorReadings(robotRef.current.x, robotRef.current.z, robotRef.current.rotation, activeChallengeIdRef.current).gyro,
      getColor: async () => {
          const val = calculateSensorReadings(robotRef.current.x, robotRef.current.z, robotRef.current.rotation, activeChallengeIdRef.current).color;
          if (!historyRef.current.detectedColors.includes(val)) historyRef.current.detectedColors.push(val);
          return val;
      },
      isTouchingColor: async (th: string) => {
          const { rawDecimalColor } = calculateSensorReadings(robotRef.current.x, robotRef.current.z, robotRef.current.rotation, activeChallengeIdRef.current);
          const ch = "#" + rawDecimalColor.toString(16).toUpperCase().padStart(6, '0');
          return th.toUpperCase() === ch.toUpperCase();
      },
      broadcast: async (msgColor: string) => {
          console.log(`Broadcast message sent: ${msgColor}`);
          // Multi-thread broadcast logic would go here if execution allowed
          await new Promise(r => setTimeout(r, 100));
      },
      getCircumference: async () => 3.77
  });

  const handleRun = async () => {
    if (isRunning) {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setIsRunning(false);
        return;
    }
    setIsRunning(true);
    setChallengeSuccess(false);
    historyRef.current = { maxDistanceMoved: 0, touchedWall: false, detectedColors: [], totalRotation: 0 };
    startStateRef.current = { ...robotRef.current };
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const robot = createRobotApi(abortControllerRef.current.signal);
    try {
      await new Function('robot', `return (async () => { ${generatedCode} })();`)(robot);
      if (activeChallenge && activeChallenge.check(startStateRef.current, robotRef.current, historyRef.current)) setChallengeSuccess(true);
    } catch (e: any) {
      if (e.message !== "Simulation aborted") console.error(e);
    } finally { setIsRunning(false); }
  };

  const handleReset = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    
    // Use challenge-specific starting state if available
    const challengeInitialState = {
        ...initialState,
        x: activeChallenge?.startPosition?.x ?? initialState.x,
        z: activeChallenge?.startPosition?.z ?? initialState.z,
        rotation: activeChallenge?.startRotation ?? initialState.rotation
    };

    updateRobotState(challengeInitialState);
    setIsRunning(false);
    setChallengeSuccess(false);
    
    // Force camera reset to challenge-specific view
    setResetCameraTrigger(true);
    setTimeout(() => setResetCameraTrigger(false), 50);
  };

  // Effect to trigger reset when challenge changes
  useEffect(() => {
    handleReset();
  }, [activeChallenge]);

  const toggleRuler = () => {
      setIsRulerActive(!isRulerActive);
      setIsColorPickerActive(false);
  };

  const handleSave = () => {
      if (!editorRef.current) return;
      const xml = editorRef.current.getXml();
      const blob = new Blob([xml], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `robot_project_${new Date().toISOString().slice(0, 10)}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
      if (fileInputRef.current) {
          fileInputRef.current.click();
      }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          const content = event.target?.result as string;
          if (editorRef.current) {
              editorRef.current.setXml(content);
          }
      };
      reader.readAsText(file);
      // Reset input to allow loading the same file again
      e.target.value = '';
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="bg-slate-800 text-white p-4 flex justify-between items-center shadow-md z-10" dir="rtl">
        {/* Right Section: Title and ALL Controls clustered together */}
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <Code2 className="w-6 h-6 text-blue-400" />
                <h1 className="text-xl font-black hidden sm:block tracking-tight">מעבדת רובוטיקה</h1>
            </div>

            <div className="w-px h-6 bg-slate-700 hidden sm:block"></div>

            {/* Buttons clustered together on the right side */}
            <div className="flex items-center gap-3" dir="ltr">
                {/* Simulation Controls */}
                <div className="flex items-center bg-slate-900/40 p-1 rounded-xl gap-1 border border-slate-700 shadow-inner">
                    <button 
                        onClick={handleRun} 
                        className={`p-1.5 rounded-lg transition-all shadow-sm ${
                            isRunning 
                            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                        title={isRunning ? 'עצור' : 'הפעל (דגל ירוק)'}
                    >
                        {isRunning ? <Square size={22} fill="currentColor" /> : <Flag size={22} fill="currentColor" />}
                    </button>
                    <button 
                        onClick={handleReset} 
                        className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title="איפוס רובוט"
                    >
                        <RotateCcw size={22} />
                    </button>
                </div>

                {/* Save/Load Cluster (Icons only) */}
                <div className="flex items-center gap-1 bg-slate-900/40 p-1 rounded-xl border border-slate-700">
                    <button 
                        onClick={handleSave} 
                        className="p-1.5 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-green-400 rounded-lg transition-all flex items-center justify-center"
                        title="שמור פרויקט"
                    >
                        <Save size={22} />
                    </button>
                    <button 
                        onClick={handleLoad} 
                        className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 rounded-lg transition-all flex items-center justify-center"
                        title="טען פרויקט"
                    >
                        <FolderOpen size={22} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".xml" onChange={onFileChange} />
                </div>

                {/* Ruler Tool */}
                <button 
                    onClick={toggleRuler} 
                    className={`p-2 rounded-xl transition-all border ${
                        isRulerActive ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                    }`}
                    title="סרגל מדידה"
                >
                    <Ruler size={22} />
                </button>

                {/* Challenges Button (Grouped with others) */}
                <button 
                    onClick={() => setShowChallenges(true)} 
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-black transition-all border shadow-lg ${
                        activeChallenge ? 'bg-yellow-500 border-yellow-400 text-black hover:bg-yellow-400' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                    }`}
                    dir="rtl"
                >
                    <Trophy size={18} /> 
                    <span className="hidden md:inline">{activeChallenge ? activeChallenge.title : "משימות"}</span>
                    {!activeChallenge && <span className="md:hidden">משימות</span>}
                </button>
            </div>
        </div>
        
        {/* Left Section (Empty for now to keep things on the right) */}
        <div></div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side: Code Editor */}
        <div className="w-1/2 border-r border-slate-300 relative flex flex-col">
            <div className="flex-1 relative">
                <BlocklyEditor ref={editorRef} onCodeChange={setGeneratedCode} onEval={useCallback(async (s) => {
                    const robot = createRobotApi(new AbortController().signal);
                    try { return await new Function('robot', `return (async () => { return ${s} })();`)(robot); } catch { return "Error"; }
                }, [])} />
            </div>
        </div>

        {/* Right Side: 3D Simulation */}
        <div className="w-1/2 relative bg-gray-900" style={{ cursor: isColorPickerActive ? DROPPER_CURSOR_URL : 'auto' }}>
            {/* Viewport Controls */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <button 
                    onClick={() => { setIsCameraFollowing(false); setResetCameraTrigger(true); setTimeout(() => setResetCameraTrigger(false), 100); }} 
                    className={`p-2 rounded-lg shadow-lg border transition-all ${!isCameraFollowing ? 'bg-blue-500 border-blue-400 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    title="מבט קבוע"
                >
                    <Video size={18} />
                </button>
                <button 
                    onClick={() => setIsCameraFollowing(true)} 
                    className={`p-2 rounded-lg shadow-lg border transition-all ${isCameraFollowing ? 'bg-blue-500 border-blue-400 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    title="עקוב אחרי הרובוט"
                >
                    <Video size={18} className="rotate-45" />
                </button>
            </div>

            <SensorDashboard 
                distance={sensorReadings.distance} 
                isTouching={sensorReadings.isTouching} 
                gyroAngle={sensorReadings.gyro} 
                detectedColor={sensorReadings.color} 
                lightIntensity={sensorReadings.intensity} 
                overrideColor={isColorPickerActive ? pickerHoverColor : null} 
                onColorClick={() => { setIsColorPickerActive(!isColorPickerActive); setIsRulerActive(false); }} 
            />

            <Canvas shadows camera={{ position: [5, 8, 8], fov: 45 }}>
                <SimulationEnvironment challengeId={activeChallenge?.id} />
                <Robot3D state={robotState} />
                <CameraFollower 
                    targetX={robotState.x} 
                    targetY={robotState.y} 
                    targetZ={robotState.z} 
                    isFollowing={isCameraFollowing} 
                    onResetCamera={resetCameraTrigger} 
                    activeChallenge={activeChallenge}
                />
                
                {isRulerActive && <RulerTool />}
                {isColorPickerActive && <ColorPickerTool onColorHover={setPickerHoverColor} onColorSelect={(h) => { setPickerHoverColor(h); setIsColorPickerActive(false); }} />}
                
                <OrbitControls 
                    makeDefault 
                    minDistance={3} 
                    maxDistance={100} 
                    enabled={!isRulerActive && !isColorPickerActive} 
                />
            </Canvas>
        </div>

        {/* Overlays */}
        <Numpad isOpen={numpadConfig.isOpen} initialValue={numpadConfig.value} onClose={() => setNumpadConfig(p => ({ ...p, isOpen: false }))} onConfirm={numpadConfig.onConfirm} />
        
        {showChallenges && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
                <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <h2 className="text-2xl font-bold">משימות</h2>
                        <button onClick={() => setShowChallenges(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} /></button>
                    </div>
                    <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50">
                        {CHALLENGES.map((c, i) => (
                            <button key={c.id} onClick={() => { setActiveChallenge(c); setShowChallenges(false); }} className={`text-right p-5 rounded-xl border-2 transition-all ${activeChallenge?.id === c.id ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100 shadow-inner' : 'border-transparent bg-white shadow-sm hover:shadow-md hover:border-slate-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-slate-800">{i + 1}. {c.title}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                        c.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                                        c.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>{c.difficulty}</span>
                                </div>
                                <p className="text-gray-500 text-sm leading-relaxed">{c.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {challengeSuccess && activeChallenge && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-md" dir="rtl">
                <div className="bg-white p-10 rounded-3xl shadow-2xl text-center border-b-8 border-green-500 transform animate-in fade-in zoom-in duration-300">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy size={48} className="text-green-600" />
                    </div>
                    <h2 className="text-4xl font-black mb-2 text-slate-800">כל הכבוד!</h2>
                    <p className="text-slate-600 mb-8 font-medium">השלמת את המשימה בהצלחה:<br/><span className="text-blue-600 font-bold">{activeChallenge.title}</span></p>
                    <button 
                        onClick={() => setChallengeSuccess(false)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        מעולה!
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
