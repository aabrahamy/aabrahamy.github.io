import { useRef, useEffect} from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { a } from '@react-spring/three'

import islandScene from "../assets/3d/optimized.glb";

const Island =({ isRotating, setIsRotating, ...props}) => {
  const islandRef = useRef()
  const { gl, viewport } = useThree();
  const { nodes, materials } = useGLTF(islandScene);

  const lastX = useRef(0);
  const rotationSpeed = useRef(0);
  const dampingFactor = 0.95;


  const handlePointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);

    const clientX = e.touches
      ? e.touches[0].clientX 
      : e.clientX

      lastX.current = clientX;
  }

    const handlePointerUp = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(false);

  }

    const handlePointerMove = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if(isRotating) {
      const clientX = e.touches
      ? e.touches[0].clientX 
      : e.clientX
      
      const delta = (clientX - lastX.current) / viewport.width;

    islandRef.current.rotation.y += delta * 0.01 * Math.PI;
    lastX.current = clientX;
    rotationSpeed.current = delta * 0.01 * Math.PI;
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      if (!isRotating) setIsRotating(true);

      islandRef.current.rotation.y += 0.005 * Math.PI;
      rotationSpeed.current = 0.007;
    } else if (event.key === "ArrowRight") {
      if (!isRotating) setIsRotating(true);

      islandRef.current.rotation.y -= 0.005 * Math.PI;
      rotationSpeed.current = -0.007;
    }
  }
 
  const handleKeyUp = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      setIsRotating(false);
    }
  }

  useFrame(() => {
    if (!isRotating) {
      rotationSpeed.current *= dampingFactor;

      if (Math.abs(rotationSpeed.current) < 0.0001) {
        rotationSpeed.current = 0;
    }

    islandRef.current.rotation.y += rotationSpeed.current;

  } else {
    const rotation = islandRef.current.rotation.y;

    const normalizedRotation =
        ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

      switch (true) {
        case normalizedRotation >= 5.45 && normalizedRotation <= 5.85:
          setCurrentStage(4);
          break;
        case normalizedRotation >= 0.85 && normalizedRotation <= 1.3:
          setCurrentStage(3);
          break;
        case normalizedRotation >= 2.4 && normalizedRotation <= 2.6:
          setCurrentStage(2);
          break;
        case normalizedRotation >= 4.25 && normalizedRotation <= 4.75:
          setCurrentStage(1);
          break;
        default:
          setCurrentStage(null);
    }
  }
})

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    }

  }, [gl, handlePointerDown, handlePointerUp, handlePointerMove]);

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
    </a.group>
  )
}

export default Island;


