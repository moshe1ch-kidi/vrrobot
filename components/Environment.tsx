import React, { useMemo } from 'react';
import { Grid, Environment as DreiEnvironment, ContactShadows, Text } from '@react-three/drei';
import '../types';

interface EnvironmentProps {
    challengeId?: string;
}

const SimulationEnvironment: React.FC<EnvironmentProps> = ({ challengeId }) => {
  
  // Logic to determine environment layout based on challenge
  const config = useMemo(() => {
      const isFrontWall = ['c9', 'c14', 'c15', 'c16', 'c19', 'c20'].includes(challengeId || '');
      const isSlalom = ['c7', 'c8'].includes(challengeId || '');
      const isColors = ['c13', 'c14'].includes(challengeId || '');
      const isLineFollow = ['c21'].includes(challengeId || '');

      return { isFrontWall, isSlalom, isColors, isLineFollow };
  }, [challengeId]);

  return (
    <>
      <DreiEnvironment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Grid Pattern */}
      <Grid 
        infiniteGrid 
        fadeDistance={50} 
        sectionSize={5} 
        cellSize={1} 
        sectionColor="#9ca3af" 
        cellColor="#e5e7eb" 
      />

      <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
      
      {/* Default: The Black Ring (Tape) - Existing small ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0.01, 5]}>
        <ringGeometry args={[4, 5, 64]} />
        <meshBasicMaterial color="black" />
      </mesh>

      {/* --- DYNAMIC OBJECTS --- */}

      {/* LINE FOLLOWER TRACK (Large Oval/Circle) */}
      {/* Centered at (-6, 0) with Radius 6. Robot starts at (0,0) which is on the circumference. Tangent is Z axis. */}
      {config.isLineFollow && (
         <group position={[-6, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
             {/* The Track Line */}
             <mesh>
                 <ringGeometry args={[5.8, 6.2, 128]} /> 
                 <meshBasicMaterial color="black" />
             </mesh>
             {/* Start Line Indicator (Green) */}
             <mesh position={[6, 0, 0.01]} rotation={[0, 0, 0]}>
                 <planeGeometry args={[0.4, 1]} />
                 <meshBasicMaterial color="#22c55e" opacity={0.5} transparent />
             </mesh>
         </group>
      )}

      {/* THE WALL */}
      {/* If challenge requires Front Wall, move it to Z axis. Else default side. */}
      {config.isFrontWall ? (
          <group position={[0, 0.5, -8]}> {/* In Front of Robot (Robot starts at 0 facing -Z) */}
            <mesh receiveShadow castShadow>
                <boxGeometry args={[4, 1, 1]} /> {/* Wide wall */}
                <meshStandardMaterial color="#ef4444" roughness={0.2} />
            </mesh>
             <Text
                position={[0, 1, 0.6]}
                fontSize={0.5}
                color="#b91c1c"
                anchorX="center"
                anchorY="middle"
            >
                קיר / Wall
            </Text>
          </group>
      ) : (
          /* Default Side Wall */
          <group position={[-5, 0.5, 0]}>
            <mesh receiveShadow castShadow>
            <boxGeometry args={[1, 1, 30]} />
            <meshStandardMaterial color="#ef4444" roughness={0.2} />
            </mesh>
             <mesh position={[0, 0.51, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[1, 30]} />
                <meshBasicMaterial color="#b91c1c" />
            </mesh>
          </group>
      )}

      {/* SLALOM CONES */}
      {config.isSlalom && (
          <group>
              {[1, 2, 3, 4].map((i) => (
                  // UPDATED DISTANCE: Multiplier changed from 2.5 to 5 (50cm spacing)
                  <group key={i} position={[0, 0, -5 * i]}>
                      <mesh castShadow position={[0, 0.25, 0]}>
                          <cylinderGeometry args={[0.05, 0.15, 0.5, 16]} />
                          <meshStandardMaterial color="orange" />
                      </mesh>
                      <mesh position={[0, 0, 0]}>
                          <cylinderGeometry args={[0.2, 0.2, 0.02, 16]} />
                          <meshStandardMaterial color="black" />
                      </mesh>
                  </group>
              ))}
          </group>
      )}

      {/* COLORED MATS */}
      {config.isColors && (
          <group>
               {/* Blue Mat */}
               <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.01, -3]}>
                    <planeGeometry args={[2, 2]} />
                    <meshBasicMaterial color="#0000FF" />
               </mesh>
                {/* Red Mat */}
               <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0.01, -3]}>
                    <planeGeometry args={[2, 2]} />
                    <meshBasicMaterial color="#FF0000" />
               </mesh>
          </group>
      )}

    </>
  );
};

export default SimulationEnvironment;