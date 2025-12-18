
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, BoxGeometry } from 'three';
import { RobotState } from '../types';

interface Robot3DProps {
  state: RobotState;
}

const THEME = {
    yellow: '#FACC15',
    white: '#FFFFFF',
    cyan: '#22D3EE',
    magenta: '#D946EF',
    black: '#171717',
    darkGrey: '#374151',
    lightGrey: '#9CA3AF'
};

const LegoWheel = ({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  return (
    <group position={position} rotation={rotation || [0, 0, Math.PI / 2]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.4, 40]} />
        <meshStandardMaterial color={THEME.black} roughness={0.8} />
      </mesh>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} rotation={[Math.PI/2, 0, 0]} position={[0, (i - 2) * 0.08, 0]}>
             <torusGeometry args={[0.6, 0.02, 16, 48]} />
             <meshStandardMaterial color="#111" />
        </mesh>
      ))}
      <group position={[0, 0, 0]}>
         <mesh>
            <cylinderGeometry args={[0.35, 0.35, 0.42, 32]} />
            <meshStandardMaterial color={THEME.cyan} roughness={0.3} />
         </mesh>
         {[1, -1].map((side) => (
            <group key={side} position={[0, side * 0.211, 0]} rotation={[side === 1 ? 0 : Math.PI, 0, 0]}>
                <mesh rotation={[Math.PI/2, 0, 0]}>
                    <ringGeometry args={[0.25, 0.35, 32]} />
                    <meshStandardMaterial color={THEME.cyan} />
                </mesh>
                <mesh rotation={[Math.PI/2, 0, 0]}>
                    <boxGeometry args={[0.6, 0.1, 0.01]} />
                    <meshStandardMaterial color={THEME.cyan} />
                </mesh>
                <mesh rotation={[Math.PI/2, 0, Math.PI/2]}>
                    <boxGeometry args={[0.6, 0.1, 0.01]} />
                    <meshStandardMaterial color={THEME.cyan} />
                </mesh>
                <mesh position={[0, 0.001, 0]} rotation={[Math.PI/2, 0, 0]}>
                    <circleGeometry args={[0.06, 16]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
            </group>
         ))}
      </group>
    </group>
  );
};

const CasterWheel = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#D0D0D0" metalness={0.9} roughness={0.1} />
      </mesh>
      <group position={[0, 0.1, 0]}>
        <mesh position={[0, 0.05, 0]}>
           <cylinderGeometry args={[0.22, 0.22, 0.2, 32]} /> 
           <meshStandardMaterial color={THEME.cyan} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
           <boxGeometry args={[0.25, 0.4, 0.35]} />
           <meshStandardMaterial color={THEME.cyan} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};

const LegoLight = ({ position, color }: { position: [number, number, number], color: string }) => {
  const c = color.toLowerCase();
  const isOff = c === 'black' || c === '#000000' || c === '#000';
  const displayColor = isOff ? '#333' : color;
  const intensity = isOff ? 0 : 3;
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow>
         <boxGeometry args={[0.25, 0.3, 0.25]} />
         <meshStandardMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
         <boxGeometry args={[0.18, 0.22, 0.18]} /> 
         <meshStandardMaterial color={displayColor} emissive={displayColor} emissiveIntensity={intensity} toneMapped={false} />
      </mesh>
      {!isOff && <pointLight position={[0, 0.3, 0]} color={displayColor} intensity={1.5} distance={3} decay={2} />}
    </group>
  );
};

const TouchSensor = ({ position, pressed }: { position: [number, number, number], pressed: boolean }) => {
    const plungerPos = pressed ? 0.02 : 0.15;
    return (
        <group position={position}>
            <mesh position={[0, 0.2, -0.2]}>
                <boxGeometry args={[0.4, 0.1, 0.4]} />
                <meshStandardMaterial color={THEME.magenta} />
            </mesh>
            <group position={[0, -0.1, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.45, 0.4, 0.4]} />
                    <meshStandardMaterial color={THEME.white} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.15, -0.15]}>
                    <boxGeometry args={[0.45, 0.2, 0.2]} />
                    <meshStandardMaterial color={THEME.darkGrey} />
                </mesh>
            </group>
            <group position={[0, -0.1, plungerPos]}>
                <mesh rotation={[Math.PI/2, 0, 0]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.2, 32]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                <group position={[0, 0, 0.1]}>
                    <mesh><boxGeometry args={[0.2, 0.05, 0.05]} /><meshStandardMaterial color="#111" /></mesh>
                    <mesh><boxGeometry args={[0.05, 0.2, 0.05]} /><meshStandardMaterial color="#111" /></mesh>
                </group>
            </group>
        </group>
    );
};

const ColorSensor = ({ position }: { position: [number, number, number] }) => {
    return (
        <group position={position}>
            <mesh position={[0, 0.2, -0.2]}>
                <boxGeometry args={[0.4, 0.1, 0.4]} />
                <meshStandardMaterial color={THEME.magenta} />
            </mesh>
            <group position={[0, -0.1, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.45, 0.4, 0.5]} />
                    <meshStandardMaterial color={THEME.white} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.15, -0.15]}>
                    <boxGeometry args={[0.45, 0.2, 0.2]} />
                    <meshStandardMaterial color={THEME.darkGrey} />
                </mesh>
                <group position={[0, -0.201, 0.1]} rotation={[Math.PI/2, 0, 0]}>
                    <mesh><ringGeometry args={[0.08, 0.14, 32]} /><meshStandardMaterial color="#111" /></mesh>
                    <mesh position={[0, 0, -0.01]}><circleGeometry args={[0.08, 32]} /><meshStandardMaterial color="#000" metalness={0.9} roughness={0.1} /></mesh>
                </group>
            </group>
        </group>
    );
};

const UltrasonicSensor = ({ position }: { position: [number, number, number] }) => {
    return (
        <group position={position}>
             <mesh castShadow position={[0, 0, -0.1]}>
                <boxGeometry args={[1.4, 0.6, 0.4]} />
                <meshStandardMaterial color={THEME.white} roughness={0.2} />
             </mesh>
             <group position={[0, 0, 0.15]}>
                 {[-1, 1].map((side) => (
                     <group key={side} position={[side * 0.35, 0, 0]}>
                        <mesh rotation={[Math.PI/2, 0, 0]}>
                            <cylinderGeometry args={[0.28, 0.28, 0.2, 32]} />
                            <meshStandardMaterial color="#111" roughness={0.2} />
                        </mesh>
                        <mesh rotation={[0, 0, 0]} position={[0, 0, 0.101]}>
                            <torusGeometry args={[0.18, 0.035, 16, 32]} />
                            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} transparent opacity={0.9} />
                        </mesh>
                        <mesh rotation={[0, 0, 0]} position={[0, 0, 0.08]}>
                             <circleGeometry args={[0.15, 32]} />
                             <meshStandardMaterial color="#444" metalness={0.8} roughness={0.6} />
                        </mesh>
                     </group>
                 ))}
                 <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[0.3, 0.25, 0.1]} />
                    <meshStandardMaterial color="#111" />
                 </mesh>
             </group>
             <group position={[0, -0.35, 0]}>
                 <mesh><boxGeometry args={[0.3, 0.2, 0.3]} /><meshStandardMaterial color={THEME.lightGrey} /></mesh>
                 <mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.08, 0.08, 0.31, 16]} /><meshStandardMaterial color="#111" /></mesh>
             </group>
        </group>
    );
};

const Robot3D: React.FC<Robot3DProps> = ({ state }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.lerp(new Vector3(state.x, 0.6 + state.y, state.z), 0.1);
      const targetRotation = state.rotation * (Math.PI / 180); 
      const currentRotation = groupRef.current.rotation.y;
      groupRef.current.rotation.y = currentRotation + (targetRotation - currentRotation) * 0.1;

      // Match the 1:15 incline (atan(1/15) approx 0.0665 rad)
      if (state.y > 0 && state.y < 1.0) {
          groupRef.current.rotation.x = -0.0665; 
      } else {
          groupRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <group position={[0, 0.5, 0]}>
          <mesh position={[0, -0.4, 0]} castShadow><boxGeometry args={[1.5, 0.2, 2]} /><meshStandardMaterial color={THEME.white} /></mesh>
          <mesh position={[0, 0, 0]} castShadow><boxGeometry args={[1.45, 0.6, 1.95]} /><meshStandardMaterial color={THEME.yellow} /></mesh>
          <mesh position={[0, 0.4, 0]} castShadow><boxGeometry args={[1.5, 0.2, 2]} /><meshStandardMaterial color={THEME.white} /></mesh>
          <mesh position={[0, 0.51, 0.2]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[0.8, 0.6]} /><meshStandardMaterial color="#111" /></mesh>
          <mesh position={[0, 0.51, -0.5]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[0.15, 32]} /><meshStandardMaterial color={THEME.cyan} /></mesh>
      </group>
      <mesh position={[-0.8, 0.2, 0]}><boxGeometry args={[0.1, 0.2, 2.2]} /><meshStandardMaterial color={THEME.magenta} /></mesh>
      <mesh position={[0.8, 0.2, 0]}><boxGeometry args={[0.1, 0.2, 2.2]} /><meshStandardMaterial color={THEME.magenta} /></mesh>
      <LegoWheel position={[-0.95, 0, 0.5]} />
      <LegoWheel position={[0.95, 0, 0.5]} />
      <CasterWheel position={[0, -0.4, -0.8]} />
      <LegoLight position={[-0.6, 1.0, 0.9]} color={state.ledLeftColor} />
      <LegoLight position={[0.6, 1.0, 0.9]} color={state.ledRightColor} />
      <ColorSensor position={[0, -0.1, 0.9]} />
      <UltrasonicSensor position={[0, 0.5, 1.05]} />
      <TouchSensor position={[0, -0.2, 1.3]} pressed={state.isTouching} />
      <group position={[0.6, 1.1, -0.5]}>
          <mesh><boxGeometry args={[0.4, 0.2, 0.4]} /><meshStandardMaterial color={THEME.white} /></mesh>
          <mesh position={[0, 0.11, 0]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[0.15, 32]} /><meshBasicMaterial color={THEME.cyan} /></mesh>
      </group>
    </group>
  );
};

export default Robot3D;
