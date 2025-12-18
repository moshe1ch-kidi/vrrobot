
import React, { useMemo } from 'react';
import { Grid, Environment as DreiEnvironment, ContactShadows, Text } from '@react-three/drei';
import '../types';

interface EnvironmentProps {
    challengeId?: string;
}

const SimulationEnvironment: React.FC<EnvironmentProps> = ({ challengeId }) => {
  
  const config = useMemo(() => {
      const isFrontWall = ['c9', 'c14', 'c15', 'c16', 'c19', 'c20'].includes(challengeId || '');
      const isSlalom = ['c7', 'c8'].includes(challengeId || '');
      const isColors = ['c13', 'c14'].includes(challengeId || '');
      const isLineFollow = ['c21'].includes(challengeId || '');
      const isSlope = challengeId === 'c3';
      const isBrakingTrack = challengeId === 'c4';

      return { isFrontWall, isSlalom, isColors, isLineFollow, isSlope, isBrakingTrack };
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

      {/* Red Grid Pattern */}
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
      
      {/* Starting Box */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.4, 1.5, 4, 1, Math.PI/4]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* RAMP for c3 (Uphill) */}
      {config.isSlope && (
          <group position={[0, 0, 0]}>
              <mesh rotation={[0.0665, 0, 0]} position={[0, 0.5, -9]} receiveShadow castShadow>
                  <boxGeometry args={[4.2, 0.05, 15]} />
                  <meshStandardMaterial color="#f8fafc" />
              </mesh>
              <mesh position={[-2.1, 0.6, -9]} rotation={[0.0665, 0, 0]}>
                  <boxGeometry args={[0.1, 0.3, 15]} />
                  <meshStandardMaterial color="#ff4d4d" />
              </mesh>
              <mesh position={[2.1, 0.6, -9]} rotation={[0.0665, 0, 0]}>
                  <boxGeometry args={[0.1, 0.3, 15]} />
                  <meshStandardMaterial color="#ff4d4d" />
              </mesh>
              <mesh position={[0, 0.5, -20]} receiveShadow castShadow>
                  <boxGeometry args={[4.2, 1.0, 8]} />
                  <meshStandardMaterial color="#ffffff" />
              </mesh>
              <Text position={[0, 1.1, -20]} fontSize={0.6} color="#ff4d4d">
                FINISH
              </Text>
          </group>
      )}

      {/* BRAKING TRACK for c4 (Braking test) */}
      {config.isBrakingTrack && (
          <group position={[0, 0, 0]}>
              {/* Asphalt Lane */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -15]} receiveShadow>
                  <planeGeometry args={[5, 30]} />
                  <meshStandardMaterial color="#334155" />
              </mesh>
              
              {/* White Side Lines */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.4, 0.03, -15]}>
                  <planeGeometry args={[0.1, 30]} />
                  <meshBasicMaterial color="white" />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.4, 0.03, -15]}>
                  <planeGeometry args={[0.1, 30]} />
                  <meshBasicMaterial color="white" />
              </mesh>

              {/* Distance Markers (Every 5 units = 50cm in simulation scale) */}
              {[...Array(31)].map((_, i) => (
                  <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, -i]}>
                      <planeGeometry args={[4.8, 0.05]} />
                      <meshBasicMaterial color={i % 5 === 0 ? "white" : "#475569"} />
                  </mesh>
              ))}

              {/* Danger Zone at the end (Z < -25) */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -28]}>
                  <planeGeometry args={[5, 4]} />
                  <meshStandardMaterial color="#ef4444" opacity={0.6} transparent />
              </mesh>

              <Text position={[0, 0.05, -2]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.4} color="white">
                BRAKING TEST
              </Text>
              
              <Text position={[-3, 0.05, -10]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.3} color="#475569">
                100 CM
              </Text>
              <Text position={[-3, 0.05, -20]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.3} color="#475569">
                200 CM
              </Text>
              <Text position={[0, 0.1, -30]} fontSize={0.6} color="#ef4444" rotation={[0,0,0]}>
                DANGER!
              </Text>
          </group>
      )}

      {/* LINE FOLLOWER TRACK */}
      {config.isLineFollow && (
         <group position={[-6, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
             <mesh>
                 <ringGeometry args={[5.8, 6.2, 128]} /> 
                 <meshBasicMaterial color="black" />
             </mesh>
         </group>
      )}

      {/* THE WALL */}
      {config.isFrontWall && (
          <group position={[0, 0.5, -8]}> 
            <mesh receiveShadow castShadow>
                <boxGeometry args={[6, 1, 0.5]} /> 
                <meshStandardMaterial color="#ef4444" roughness={0.2} />
            </mesh>
            <Text position={[0, 0.2, 0.3]} fontSize={0.4} color="white">OBSTACLE</Text>
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
