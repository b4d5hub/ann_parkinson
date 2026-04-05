import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Sparkles, Environment } from '@react-three/drei';

const BrainCore = ({ isSpeaking }) => {
  const sphereRef = useRef();

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      sphereRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      
      // If speaking, make it pulse more aggressively
      if (isSpeaking) {
        sphereRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.05);
      } else {
        sphereRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.02);
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere ref={sphereRef} args={[1, 64, 64]} scale={1.5}>
        <MeshDistortMaterial 
          color="#00F0FF" 
          envMapIntensity={1} 
          clearcoat={1} 
          clearcoatRoughness={0.1} 
          metalness={0.8} 
          roughness={0.2} 
          distort={isSpeaking ? 0.6 : 0.3} 
          speed={isSpeaking ? 4 : 2} 
        />
      </Sphere>
    </Float>
  );
};

const Avatar = ({ isSpeaking = false }) => {
  return (
    <div className="avatar-container">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#B026FF" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#00F0FF" />
        <Environment preset="city" />
        
        <BrainCore isSpeaking={isSpeaking} />
        
        <Sparkles 
          count={100} 
          scale={5} 
          size={isSpeaking ? 6 : 3} 
          speed={isSpeaking ? 0.8 : 0.2} 
          opacity={0.5} 
          color="#00F0FF" 
        />
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default Avatar;
