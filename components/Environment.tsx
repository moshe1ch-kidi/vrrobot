
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
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Red Grid Pattern - Matching the reference image */}
      <Grid 
        infiniteGrid={false}
        args={[100, 100]}
        fadeDistance={50} 
        sectionSize={5} 
        cellSize={1} 
        sectionColor="#ff4d4d" 
        cellColor="#ffcccc" 
        position={[0, 0.01, 0]}
      />

      <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
      
      {/* Starting Box (Area) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.4, 1.5, 4, 1, Math.PI/4]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* --- DYNAMIC OBJECTS --- */}

      {/* LINE FOLLOWER TRACK */}
      {config.isLineFollow && (
         <group position={[-6, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
             <mesh>
                 <ringGeometry args={[5.8, 6.2, 128]} /> 
                 <meshBasicMaterial color="black" />
             </mesh>
         </group>
      )}

      {/* THE WALL - Only shows when needed for challenges */}
      {config.isFrontWall && (
          <group position={[0, 0.5, -8]}> 
            <mesh receiveShadow castShadow>
                <boxGeometry args={[6, 1, 0.5]} /> 
                <meshStandardMaterial color="#ef4444" roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.51, 0.26]} rotation={[0, 0, 0]}>
                <planeGeometry args={[6, 1]} />
                <meshBasicMaterial color="#b91c1c" />
            </mesh>
             <Text
                position={[0, 0.2, 0.3]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                OBSTACLE
            </Text>
          </group>
      )}

      {/* SLALOM CONES */}
      {config.isSlalom && (
          <group>
              {[1, 2, 3, 4].map((i) => (
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
               <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.03, -3]}>
                    <planeGeometry args={[2, 2]} />
                    <meshBasicMaterial color="#0000FF" />
               </mesh>
               <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0.03, -3]}>
                    <planeGeometry args={[2, 2]} />
                    <meshBasicMaterial color="#FF0000" />
               </mesh>
          </group>
      )}

    </>
  );
};

export default SimulationEnvironment;
