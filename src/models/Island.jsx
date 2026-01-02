import { useRef, useEffect} from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { a } from '@react-spring/three'
import * as THREE from 'three' 

import islandScene from "../assets/3d/optimized.glb";

const Island =({ isRotating, setIsRotating, setActiveHotspot, ...props}) => {
  const islandRef = useRef()
  const { gl, viewport } = useThree();
  const { nodes, materials } = useGLTF(islandScene);

 
  const hotspots = [
    { id: 'journey', position: [-0.84, 3.076, -1.424], title: 'My Journey', content: 'I had little to no experience with development before college, but during my first semester at Purdue as a computer engineering student, I was able to explore my interests and build a foundation through independent study to learn programming, coursework, and extracurricular activities.' },
    { id: 'skills', position: [2.025, 0.504, 0.487], title: 'Skills', content: 'I’m an engineering student who enjoys working at the intersection of software, hardware, and design. I have experience with Arduino projects and web development. I use languages like Java, JavaScript, C#, and MATLAB, along with tools like Figma, Azure, and HTML/CSS, to build well-documented and meaningful solutions.' },
    { id: 'mementos', position: [-0.624, 2.744, 1.596], title: 'Mementos', content: 'I was always interested in using 3D models for my projects, and this allowed me to incorporate a fun and adorable model as a centerpiece for this website. The best part of this is being able to integrate my interests, such as Wave to Earth’s music, with something that represents me!' },
  ];

  
  const hotspotRefs = useRef({});
  const hotspotGlowRefs = useRef({});

  const lastX = useRef(0);
  const rotationSpeed = useRef(0);
  const dampingFactor = 0.95;
  const isPointerDown = useRef(false);

  const handlePointerDown = (e) => {
    
    // Use nativeEvent.preventDefault when available to avoid ThreeEvent TypeErrors
    if (e.nativeEvent && typeof e.nativeEvent.preventDefault === 'function') {
      e.nativeEvent.preventDefault();
    } else if (typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    setIsRotating(true);
    isPointerDown.current = true;

    const clientX = e.touches
      ? e.touches[0].clientX 
      : e.clientX

    lastX.current = clientX;

    // remove immediate nudge; rely on pointermove to set rotation/speed synchronously
    if (e.pointerId && e.target && e.target.setPointerCapture) {
      try { e.target.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }

    // Also listen on window while pointer is down so dragging stays smooth if pointer leaves canvas
    try { window.addEventListener('pointermove', handlePointerMove, { passive: false }); } catch (err) { /* ignore */ }
  }

  const handlePointerUp = (e) => {

    try { if (e && typeof e.preventDefault === 'function') e.preventDefault(); } catch (err) {}
    setIsRotating(false);
    isPointerDown.current = false;

    if (e.pointerId && e.target && e.target.releasePointerCapture) {
      try { e.target.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }

    try { window.removeEventListener('pointermove', handlePointerMove); } catch (err) { /* ignore */ }
  }

  const handlePointerCancel = (e) => {
    
    isPointerDown.current = false;
    setIsRotating(false);
    if (e.pointerId && e.target && e.target.releasePointerCapture) {
      try { e.target.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }

    try { window.removeEventListener('pointermove', handlePointerMove); } catch (err) { /* ignore */ }
  }

  const handlePointerMove = (e) => {
    // Only prevent default while actively dragging to avoid errors in passive listeners
    if (!isPointerDown.current) return;
    try { if (e && e.cancelable && typeof e.preventDefault === 'function') e.preventDefault(); } catch (err) {}

    const clientX = e.touches
      ? e.touches[0].clientX 
      : e.clientX

    const delta = (clientX - lastX.current) / viewport.width;

    islandRef.current.rotation.y += delta * 0.01 * Math.PI;
    lastX.current = clientX;
    rotationSpeed.current = delta * 0.01 * Math.PI;
  }

  const handleWheel = (e) => {
    try { e.preventDefault(); } catch (err) {}
    // Use deltaX if available for horizontal trackpad scroll, otherwise use deltaY
    const raw = e.deltaX || e.deltaY || 0;
    const factor = 0.002; // tuning scalar for good feel
    const delta = raw * factor;
    islandRef.current.rotation.y += delta;
    rotationSpeed.current = delta;
  }

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      // Keyboard left should rotate left (positive)
      islandRef.current.rotation.y += 0.005 * Math.PI;
      rotationSpeed.current = 0.007;
    } else if (event.key === "ArrowRight") {
      // Keyboard right should rotate right (negative)
      islandRef.current.rotation.y += -0.005 * Math.PI;
      rotationSpeed.current = -0.007;
    }
  }
 
  const handleKeyUp = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      // keep isRotating unchanged on keyup — keyboard shouldn't toggle drag state
    }
  }

  useFrame((state) => {
  
    const t = state.clock.getElapsedTime();
    Object.keys(hotspotRefs.current).forEach((key, idx) => {
      const ref = hotspotRefs.current[key];
      const glow = hotspotGlowRefs.current[key];
    
      if (ref && ref.visible !== false) {
        const pulse = 0.08 * Math.sin(t * 2 + idx);
        const base = 1.0;
        ref.scale.setScalar(base + pulse);
      }
      
      if (glow && glow.material) {
        const glowPulse = 0.12 * Math.sin(t * 1.6 + idx);
   
        glow.scale.setScalar(1.0 + glowPulse * 2);
        glow.material.opacity = 0.12 + 0.03 * Math.sin(t * 2 + idx);
      }
    });

    if (!isRotating) {
      rotationSpeed.current *= dampingFactor;

      if (Math.abs(rotationSpeed.current) < 0.0001) {
        rotationSpeed.current = 0;
    }

    islandRef.current.rotation.y += rotationSpeed.current;

  } else {
    // Stage detection disabled — `setCurrentStage` not provided.
  }
})

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.touchAction = 'none';

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerCancel);
    
    canvas.addEventListener('pointermove', handlePointerMove, { passive: false });
    if (typeof handleWheel === 'function') {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    } else {
      // handleWheel not defined yet in some builds; skipping wheel listener
      console.warn('handleWheel not available; skipping wheel listener')
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerCancel);
      canvas.removeEventListener('pointermove', handlePointerMove, { passive: false });
      try { window.removeEventListener('pointermove', handlePointerMove); } catch (err) { /* ignore */ }
      try {
        if (typeof handleWheel === 'function') canvas.removeEventListener('wheel', handleWheel, { passive: false });
      } catch (err) { /* ignore */ }
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      canvas.style.touchAction = '';
    }

  }, [gl, handlePointerDown, handlePointerUp, handlePointerMove, handlePointerCancel, handleKeyDown, handleKeyUp, viewport.width]);

  return (
    <a.group ref={islandRef} {...props}>
      <mesh geometry={nodes.Object_4.geometry} material={materials.outline_non_culled} />
      <mesh geometry={nodes.Object_6.geometry} material={materials.white} />
      <mesh geometry={nodes.Object_16.geometry} material={materials.outline_culled} position={[7.278, 2.518, -5.455]} scale={0.641} />
      <mesh geometry={nodes.Object_18.geometry} material={materials.big_shapes} position={[0, 0.866, 0]} scale={[1, 0.924, 1]} />
      <mesh geometry={nodes.Object_39.geometry} material={materials.floor_n_mattress} position={[2.293, 0.149, 0.584]} scale={0.819} />
      <mesh geometry={nodes.Object_53.geometry} material={materials.notes} position={[-0.84, 3.076, -1.424]} rotation={[Math.PI / 2, 0, Math.PI / 2]} scale={[1, 1, 0.792]} />
      <mesh geometry={nodes.Object_104.geometry} material={materials.details} position={[-0.624, 2.744, 1.596]} />
      <mesh geometry={nodes.Object_262.geometry} material={materials.notes} position={[-0.76, 3.264, -0.931]} rotation={[-0.233, 0.481, -0.891]} />
      <mesh geometry={nodes.Object_434.geometry} material={materials.outline_culled} position={[-0.76, 3.264, -0.931]} rotation={[-0.233, 0.481, -0.891]} />
      <mesh geometry={nodes.Object_436.geometry} material={materials.leaves} position={[0.258, 1.018, -2.708]} rotation={[0.071, -0.04, -1.089]} />
      <mesh geometry={nodes.Object_557.geometry} material={materials.Material} position={[0.704, 2.379, -0.396]} rotation={[0, -0.025, 0]} />
      <mesh geometry={nodes.Object_566.geometry} material={materials.catsu} position={[2.025, 0.504, 0.487]} rotation={[-0.114, 0.003, -0.035]} />
      <instancedMesh args={[nodes.Object_319.geometry, materials.leaves, 5]} instanceMatrix={nodes.Object_319.instanceMatrix} />
      <instancedMesh args={[nodes.Object_320.geometry, materials.outline_non_culled, 5]} instanceMatrix={nodes.Object_320.instanceMatrix} />
      <instancedMesh args={[nodes.Object_335.geometry, materials.leaves, 6]} instanceMatrix={nodes.Object_335.instanceMatrix} />
      <instancedMesh args={[nodes.Object_336.geometry, materials.outline_non_culled, 6]} instanceMatrix={nodes.Object_336.instanceMatrix} />

      {hotspots.map((h, idx) => (
        <mesh
          key={h.id}
          position={h.position}
          ref={(el) => { hotspotRefs.current[h.id] = el; }}
          onPointerDown={(e) => {
           
            e.stopPropagation();
            
            if (e.nativeEvent && typeof e.nativeEvent.preventDefault === 'function') {
              e.nativeEvent.preventDefault();
            }
            if (setIsRotating) setIsRotating(false);
            if (setActiveHotspot) setActiveHotspot(h);
          }}
          onPointerOver={(e) => {
           
            if (gl && gl.domElement) gl.domElement.style.cursor = 'pointer';
            
            const ref = hotspotRefs.current[h.id];
            if (ref) ref.scale.setScalar(1.4);
            const glow = hotspotGlowRefs.current[h.id];
            if (glow && glow.material) {
              glow.scale.setScalar(1.6);
              glow.material.opacity = 0.32;
            }
          }}
          onPointerOut={(e) => {
            if (gl && gl.domElement) gl.domElement.style.cursor = '';
            const ref = hotspotRefs.current[h.id];
            if (ref) ref.scale.setScalar(1.0);
            const glow = hotspotGlowRefs.current[h.id];
            if (glow && glow.material) {
              glow.scale.setScalar(1.0);
              glow.material.opacity = 0.12;
            }
          }}
        >
        
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial color="#ff7a59" emissive="#ff7a59" emissiveIntensity={0.9} transparent opacity={0.95} />

          <mesh
            ref={(el) => { hotspotGlowRefs.current[h.id] = el; }}
            raycast={() => null}
          >
            <sphereGeometry args={[0.24, 32, 32]} />
            <meshBasicMaterial color="#ffb86b" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </mesh>
      ))}
    </a.group>
  )
}

export default Island;


