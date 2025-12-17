import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, BoxGeometry } from 'three';
import { RobotState } from '../types';

interface Robot3DProps {
  state: RobotState;
}

// SPIKE Prime Style Palette
const THEME = {
    yellow: '#FACC15', // Hub Body
    white: '#FFFFFF',  // Hub Top/Bottom
    cyan: '#22D3EE',   // Wheels / Accents
    magenta: '#D946EF', // Beams / Frames
    black: '#171717',   // Tires
    darkGrey: '#374151',
    lightGrey: '#9CA3AF'
};

const LegoWheel = ({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  return (
    <group position={position} rotation={rotation || [0, 0, Math.PI / 2]}>
      {/* Tire Main Body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.4, 40]} />
        <meshStandardMaterial color={THEME.black} roughness={0.8} />
      </mesh>
      
      {/* Tire Treads (Visual Ridges) */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} rotation={[Math.PI/2, 0, 0]} position={[0, (i - 2) * 0.08, 0]}>
             <torusGeometry args={[0.6, 0.02, 16, 48]} />
             <meshStandardMaterial color="#111" />
        </mesh>
      ))}
      
      {/* SPIKE Style Rim (Cyan Hub) */}
      <group position={[0, 0, 0]}>
          {/* Main Rim Cylinder */}
         <mesh>
            <cylinderGeometry args={[0.35, 0.35, 0.42, 32]} />
            <meshStandardMaterial color={THEME.cyan} roughness={0.3} />
         </mesh>
         
         {/* Decorative Cross/Spokes on Rim Face */}
         {[1, -1].map((side) => (
            <group key={side} position={[0, side * 0.211, 0]} rotation={[side === 1 ? 0 : Math.PI, 0, 0]}>
                {/* Outer Ring on face */}
                <mesh rotation={[Math.PI/2, 0, 0]}>
                    <ringGeometry args={[0.25, 0.35, 32]} />
                    <meshStandardMaterial color={THEME.cyan} />
                </mesh>
                 {/* Cross */}
                <mesh rotation={[Math.PI/2, 0, 0]}>
                    <boxGeometry args={[0.6, 0.1, 0.01]} />
                    <meshStandardMaterial color={THEME.cyan} />
                </mesh>
                <mesh rotation={[Math.PI/2, 0, Math.PI/2]}>
                    <boxGeometry args={[0.6, 0.1, 0.01]} />
                    <meshStandardMaterial color={THEME.cyan} />
                </mesh>
                {/* Center Axle Hole (Black) */}
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
      {/* Metal Ball */}
      <mesh castShadow>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#D0D0D0" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Housing Structure (Cyan/Blue style) */}
      <group position={[0, 0.1, 0]}>
        {/* The Cup/Socket holding the ball */}
        <mesh position={[0, 0.05, 0]}>
           <cylinderGeometry args={[0.22, 0.22, 0.2, 32]} /> 
           <meshStandardMaterial color={THEME.cyan} roughness={0.5} />
        </mesh>
        
        {/* Support Block connecting to chassis */}
        <mesh position={[0, 0.3, 0]}>
           <boxGeometry args={[0.25, 0.4, 0.35]} />
           <meshStandardMaterial color={THEME.cyan} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};

const LegoLight = ({ position, color }: { position: [number, number, number], color: string }) => {
  // Robust check for "off" state
  const c = color.toLowerCase();
  const isOff = c === 'black' || c === '#000000' || c === '#000';
  
  const displayColor = isOff ? '#333' : color;
  const intensity = isOff ? 0 : 3;

  return (
    <group position={position}>
      {/* Housing (Transparent Clear/Glass) */}
      <mesh position={[0, 0.25, 0]} castShadow>
         <boxGeometry args={[0.25, 0.3, 0.25]} />
         <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.3} 
            roughness={0.1} 
            metalness={0.1}
         />
      </mesh>
      
      {/* Internal Bulb / Light Source */}
      <mesh position={[0, 0.25, 0]}>
         {/* Made slightly larger to ensure visibility */}
         <boxGeometry args={[0.18, 0.22, 0.18]} /> 
         <meshStandardMaterial 
            color={displayColor} 
            emissive={displayColor}
            emissiveIntensity={intensity}
            toneMapped={false} 
         />
      </mesh>

      {/* Actual Light Source for Glow Effect */}
      {!isOff && (
          <pointLight 
            position={[0, 0.3, 0]} 
            color={displayColor} 
            intensity={1.5} 
            distance={3} 
            decay={2} 
          />
      )}
    </group>
  );
};

// SPIKE Prime Force Sensor Design
const TouchSensor = ({ position, pressed }: { position: [number, number, number], pressed: boolean }) => {
    // Animation: Move Plunger Back if pressed
    const plungerPos = pressed ? 0.02 : 0.15;

    return (
        <group position={position}>
            {/* 1. Mounting Arm (Magenta) - Connecting sensor to chassis */}
            <mesh position={[0, 0.2, -0.2]}>
                <boxGeometry args={[0.4, 0.1, 0.4]} />
                <meshStandardMaterial color={THEME.magenta} />
            </mesh>

            {/* 2. Sensor Housing (White Box) */}
            <group position={[0, -0.1, 0]}>
                {/* Main White Body */}
                <mesh castShadow>
                    <boxGeometry args={[0.45, 0.4, 0.4]} />
                    <meshStandardMaterial color={THEME.white} roughness={0.2} />
                </mesh>

                {/* Dark Grey Back Block (Connector Housing) */}
                <mesh position={[0, 0.15, -0.15]}>
                    <boxGeometry args={[0.45, 0.2, 0.2]} />
                    <meshStandardMaterial color={THEME.darkGrey} />
                </mesh>
            </group>

            {/* 3. The Plunger / Button (Black) */}
            <group position={[0, -0.1, plungerPos]}>
                {/* Main Cylinder Shaft */}
                <mesh rotation={[Math.PI/2, 0, 0]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.2, 32]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                
                {/* The "Cross" Tip (Technic Axle style) */}
                <group position={[0, 0, 0.1]}>
                    <mesh>
                        <boxGeometry args={[0.2, 0.05, 0.05]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    <mesh>
                        <boxGeometry args={[0.05, 0.2, 0.05]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                </group>
            </group>
        </group>
    );
};

const ColorSensor = ({ position }: { position: [number, number, number] }) => {
    return (
        <group position={position}>
             {/* 1. Mounting Arm (Magenta) - Connecting sensor to chassis */}
            <mesh position={[0, 0.2, -0.2]}>
                <boxGeometry args={[0.4, 0.1, 0.4]} />
                <meshStandardMaterial color={THEME.magenta} />
            </mesh>

            {/* 2. Sensor Unit (Based on SPIKE Prime Color Sensor) */}
            <group position={[0, -0.1, 0]}>
                {/* Main White Body */}
                <mesh castShadow>
                    <boxGeometry args={[0.45, 0.4, 0.5]} />
                    <meshStandardMaterial color={THEME.white} roughness={0.2} />
                </mesh>

                {/* Dark Grey Back Block (Connector Housing) */}
                <mesh position={[0, 0.15, -0.15]}>
                    <boxGeometry args={[0.45, 0.2, 0.2]} />
                    <meshStandardMaterial color={THEME.darkGrey} />
                </mesh>
                
                {/* Side Detail (Technic Hole Indentation) */}
                <mesh position={[0.23, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                     <circleGeometry args={[0.1, 16]} />
                     <meshStandardMaterial color="#ddd" />
                </mesh>
                <mesh position={[-0.23, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
                     <circleGeometry args={[0.1, 16]} />
                     <meshStandardMaterial color="#ddd" />
                </mesh>

                {/* THE EYE (Lens) - Facing DOWN towards the floor */}
                <group position={[0, -0.201, 0.1]} rotation={[Math.PI/2, 0, 0]}>
                    {/* Black Bezel Ring */}
                    <mesh>
                        <ringGeometry args={[0.08, 0.14, 32]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    {/* Dark Glass Lens */}
                    <mesh position={[0, 0, -0.01]}>
                        <circleGeometry args={[0.08, 32]} />
                        <meshStandardMaterial color="#000" metalness={0.9} roughness={0.1} />
                    </mesh>
                    {/* Emitter Dot */}
                    <mesh position={[0, -0.1, 0]}>
                         <circleGeometry args={[0.03, 16]} />
                         <meshStandardMaterial color="#555" />
                    </mesh>
                </group>
            </group>
        </group>
    );
};

// SPIKE Prime / Ultrasonic Sensor Design (Updated to match circular photo with red glow)
const UltrasonicSensor = ({ position }: { position: [number, number, number] }) => {
    return (
        <group position={position}>
             {/* 1. Main Housing (White Body) - Background */}
             <mesh castShadow position={[0, 0, -0.1]}>
                <boxGeometry args={[1.4, 0.6, 0.4]} />
                <meshStandardMaterial color={THEME.white} roughness={0.2} />
             </mesh>

             {/* 2. The Binocular Face (Black) - Replacing the square faceplate */}
             <group position={[0, 0, 0.15]}>
                 {[-1, 1].map((side) => (
                     <group key={side} position={[side * 0.35, 0, 0]}>
                        {/* The Black Cylinder Housing the eye (The "Binocular" tube) */}
                        <mesh rotation={[Math.PI/2, 0, 0]}>
                            <cylinderGeometry args={[0.28, 0.28, 0.2, 32]} />
                            <meshStandardMaterial color="#111" roughness={0.2} />
                        </mesh>

                        {/* The Red Glow Ring (Vertical) */}
                        {/* Rotation [0,0,0] makes Torus face forward (Z axis) */}
                        <mesh rotation={[0, 0, 0]} position={[0, 0, 0.101]}>
                            <torusGeometry args={[0.18, 0.035, 16, 32]} />
                            <meshStandardMaterial 
                                color="#ff0000" 
                                emissive="#ff0000" 
                                emissiveIntensity={2} 
                                transparent 
                                opacity={0.9} 
                            />
                        </mesh>
                        
                        {/* Inner Metal Mesh (Vertical) */}
                        {/* Rotation [0,0,0] makes Circle face forward (Z axis) */}
                         <mesh rotation={[0, 0, 0]} position={[0, 0, 0.08]}>
                             <circleGeometry args={[0.15, 32]} />
                             <meshStandardMaterial color="#444" metalness={0.8} roughness={0.6} />
                        </mesh>
                        
                         {/* Mesh Grid Texture (Crosshatch) */}
                        <group rotation={[0, 0, Math.PI/4]} position={[0, 0, 0.081]}>
                             {[...Array(5)].map((_, i) => (
                                 <mesh key={i} position={[(i-2)*0.06, 0, 0]}>
                                     <boxGeometry args={[0.005, 0.25, 0.001]} />
                                     <meshBasicMaterial color="#111" opacity={0.5} transparent />
                                 </mesh>
                             ))}
                             <mesh rotation={[0, 0, Math.PI/2]}>
                                  {[...Array(5)].map((_, i) => (
                                     <mesh key={i} position={[(i-2)*0.06, 0, 0]}>
                                         <boxGeometry args={[0.005, 0.25, 0.001]} />
                                         <meshBasicMaterial color="#111" opacity={0.5} transparent />
                                     </mesh>
                                 ))}
                             </mesh>
                        </group>
                     </group>
                 ))}
                 
                 {/* Center Bridge (Black) */}
                 <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[0.3, 0.25, 0.1]} />
                    <meshStandardMaterial color="#111" />
                 </mesh>
             </group>
             
             {/* 3. Bottom Connector (Grey Technic Beam) */}
             <group position={[0, -0.35, 0]}>
                 <mesh>
                     <boxGeometry args={[0.3, 0.2, 0.3]} />
                     <meshStandardMaterial color={THEME.lightGrey} />
                 </mesh>
                 <mesh rotation={[0, 0, Math.PI/2]}>
                     <cylinderGeometry args={[0.08, 0.08, 0.31, 16]} />
                     <meshStandardMaterial color="#111" />
                 </mesh>
             </group>
        </group>
    );
};


const Robot3D: React.FC<Robot3DProps> = ({ state }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.lerp(new Vector3(state.x, 0.6, state.z), 0.1);
      const targetRotation = state.rotation * (Math.PI / 180); 
      const currentRotation = groupRef.current.rotation.y;
      groupRef.current.rotation.y = currentRotation + (targetRotation - currentRotation) * 0.1;
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      {/* --- CHASSIS / HUB (SPIKE Style) --- */}
      
      <group position={[0, 0.5, 0]}>
          {/* Bottom Layer (White) */}
          <mesh position={[0, -0.4, 0]} castShadow>
              <boxGeometry args={[1.5, 0.2, 2]} />
              <meshStandardMaterial color={THEME.white} />
          </mesh>

          {/* Middle Layer (Yellow) */}
          <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[1.45, 0.6, 1.95]} />
              <meshStandardMaterial color={THEME.yellow} />
          </mesh>

          {/* Top Layer (White) */}
          <mesh position={[0, 0.4, 0]} castShadow>
              <boxGeometry args={[1.5, 0.2, 2]} />
              <meshStandardMaterial color={THEME.white} />
          </mesh>

          {/* Dot Matrix Screen Area */}
          <mesh position={[0, 0.51, 0.2]} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[0.8, 0.6]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          
          {/* "Light" Dots on Screen */}
          <group position={[-0.3, 0.511, 0.3]} rotation={[-Math.PI/2, 0, 0]}>
             {[0, 1, 2, 3, 4].map(i => (
                 <mesh key={i} position={[i * 0.15, 0, 0]}>
                    <circleGeometry args={[0.04, 16]} />
                    <meshBasicMaterial color="#333" />
                 </mesh>
             ))}
          </group>

          {/* Center Button (Light Blue) */}
          <mesh position={[0, 0.51, -0.5]} rotation={[-Math.PI/2, 0, 0]}>
            <circleGeometry args={[0.15, 32]} />
            <meshStandardMaterial color={THEME.cyan} />
          </mesh>
      </group>

      {/* --- SIDE BEAMS (Magenta) --- */}
      {/* Left Beam */}
      <mesh position={[-0.8, 0.2, 0]}>
          <boxGeometry args={[0.1, 0.2, 2.2]} />
          <meshStandardMaterial color={THEME.magenta} />
      </mesh>
      {/* Right Beam */}
      <mesh position={[0.8, 0.2, 0]}>
          <boxGeometry args={[0.1, 0.2, 2.2]} />
          <meshStandardMaterial color={THEME.magenta} />
      </mesh>
      
      {/* --- WHEELS --- */}
      {/* Front Left */}
      <LegoWheel position={[-0.95, 0, 0.5]} />

      {/* Front Right */}
      <LegoWheel position={[0.95, 0, 0.5]} />

      {/* Rear Caster Wheel */}
      <CasterWheel position={[0, -0.4, -0.8]} />

      {/* --- LEDS --- */}
      <LegoLight position={[-0.6, 1.0, 0.9]} color={state.ledLeftColor} />
      <LegoLight position={[0.6, 1.0, 0.9]} color={state.ledRightColor} />

      {/* --- SENSORS --- */}
      
      {/* NEW Color Sensor (SPIKE Style) */}
      <ColorSensor position={[0, -0.1, 0.9]} />

      {/* Ultrasonic Sensor (Eyes) - SPIKE Style */}
      <UltrasonicSensor position={[0, 0.5, 1.05]} />

      {/* Force Sensor (SPIKE Style) - Replaces Bumper */}
      <TouchSensor position={[0, -0.2, 1.3]} pressed={state.isTouching} />

      {/* Gyro Sensor (Visual, on side) */}
      <group position={[0.6, 1.1, -0.5]}>
          <mesh>
             <boxGeometry args={[0.4, 0.2, 0.4]} />
             <meshStandardMaterial color={THEME.white} />
          </mesh>
          <mesh position={[0, 0.11, 0]} rotation={[-Math.PI/2, 0, 0]}>
             <circleGeometry args={[0.15, 32]} />
             <meshBasicMaterial color={THEME.cyan} />
          </mesh>
      </group>

    </group>
  );
};

export default Robot3D;