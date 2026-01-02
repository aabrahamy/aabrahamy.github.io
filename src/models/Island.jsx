import { useRef, useEffect} from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { a } from '@react-spring/three'

import islandScene from "../assets/3d/cozy_day.glb";

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
      <group position={[-0.153, 0.878, -1.464]} scale={[1, 0.898, 1]}>
        <mesh

          geometry={nodes.Object_20.geometry}
          material={materials.big_shapes}
        />
        <mesh
          
          
          geometry={nodes.Object_21.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.866, 2.1, 0]} rotation={[0, 0, 1.532]} scale={[0.938, 1, 1]}>
        <mesh
          
          
          geometry={nodes.Object_27.geometry}
          material={materials.outline_culled}
        />
        <mesh
          
          
          geometry={nodes.Object_28.geometry}
          material={materials.big_shapes}
        />
      </group>
      <group position={[0.353, 0.608, -2.627]} scale={[1, 0.898, 1]}>
        <mesh
          
          
          geometry={nodes.Object_30.geometry}
          material={materials.big_shapes}
        />
        <mesh
          
          
          geometry={nodes.Object_31.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.909, 1.638, 0.024]} scale={[1, 0.898, 1]}>
        <mesh
          
          
          geometry={nodes.Object_33.geometry}
          material={materials.big_shapes}
        />
        <mesh
          
          
          geometry={nodes.Object_34.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group
        position={[0.767, 1.234, -1.432]}
        rotation={[Math.PI / 2, 0, -Math.PI / 2]}
        scale={[1.169, 1, 0.888]}>
        <mesh
          
          
          geometry={nodes.Object_36.geometry}
          material={materials.big_shapes}
        />
        <mesh
          
          
          geometry={nodes.Object_37.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group
        position={[-0.84, 3.076, -1.424]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        scale={[1, 1, 0.792]}>
        <mesh
          
          
          geometry={nodes.Object_53.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_54.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group
        position={[-0.803, 2.666, -0.974]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        scale={[1, 1, 0.726]}>
        <mesh
          
          
          geometry={nodes.Object_56.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_57.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.785, 3.139, -0.935]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <mesh
          
          
          geometry={nodes.Object_59.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_60.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group
        position={[-0.838, 2.499, -1.544]}
        rotation={[Math.PI / 2, 0, -Math.PI / 2]}
        scale={0.799}>
        <mesh
          
          
          geometry={nodes.Object_62.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_63.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.853, 2.469, -1.695]} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
        <mesh
          
          
          geometry={nodes.Object_65.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_66.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.847, 2.388, -1.414]} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
        <mesh
          
          
          geometry={nodes.Object_68.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_69.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.252, 1.999, -1.121]} rotation={[-Math.PI, 1.191, 0]}>
        <mesh
          
          
          geometry={nodes.Object_71.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_72.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.275, 1.988, -1.397]} rotation={[-Math.PI, 1.093, 0]}>
        <mesh
          
          
          geometry={nodes.Object_74.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_75.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.009, 1.985, -1.068]} rotation={[-Math.PI, 1.364, 0]}>
        <mesh
          
          
          geometry={nodes.Object_77.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_78.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.686, 2.793, 2.221]} rotation={[1.645, -0.046, -0.008]}>
        <mesh
          
          
          geometry={nodes.Object_80.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_81.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.68, 2.606, 2.218]} rotation={[1.631, 0.016, -0.02]}>
        <mesh
          
          
          geometry={nodes.Object_83.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_84.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.775, 3.425, -1.046]} rotation={[0.801, 0, Math.PI / 2]}>
        <mesh
          
          
          geometry={nodes.Object_86.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_87.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.778, 3.439, -1.792]} rotation={[-1.472, 0.003, 1.586]}>
        <mesh
          
          
          geometry={nodes.Object_89.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_90.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.773, 2.745, -1.808]} rotation={[-2.205, 0.003, 1.586]}>
        <mesh
          
          
          geometry={nodes.Object_92.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_93.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.768, 2.867, -1.154]} rotation={[2.534, 0, Math.PI / 2]}>
        <mesh
          
          
          geometry={nodes.Object_95.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_96.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.638, 2.573, 1.053]} rotation={[1.554, 0.072, -0.006]}>
        <mesh
          
          
          geometry={nodes.Object_98.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_99.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.625, 2.524, 1.053]} rotation={[1.61, 0.077, -0.01]}>
        <mesh
          
          
          geometry={nodes.Object_101.geometry}
          material={materials.notes}
        />
        <mesh
          
          
          geometry={nodes.Object_102.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.624, 2.744, 1.596]}>
        <mesh
          
          
          geometry={nodes.Object_104.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_105.geometry}
          material={materials.big_shapes}
        />
      </group>
      <group position={[0.363, 0.61, 1.407]}>
        <mesh
          
          
          geometry={nodes.Object_107.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_108.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.149, 0.795, 1.894]} rotation={[0.572, 1.337, -0.766]}>
        <mesh
          
          
          geometry={nodes.Object_110.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_111.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.194, 1.432, 1.667]}>
        <mesh
          
          
          geometry={nodes.Object_113.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_114.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.909, 1.628, 0.024]}>
        <mesh
          
          
          geometry={nodes.Object_116.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_117.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.484, 2.26, -0.303]}>
        <mesh
          
          
          geometry={nodes.Object_119.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_120.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.239, 2.329, 0.318]}>
        <mesh
          
          
          geometry={nodes.Object_122.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_123.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.225, 2.223, -0.318]}>
        <mesh
          
          
          geometry={nodes.Object_125.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_126.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.376, 2.22, -1.63]}>
        <mesh
          
          
          geometry={nodes.Object_128.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_129.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.252, 2.021, -1.821]}>
        <mesh
          
          
          geometry={nodes.Object_131.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_132.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.051, 2.006, -1.679]}>
        <mesh
          
          
          geometry={nodes.Object_134.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_135.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.252, 2.195, -1.823]}>
        <mesh
          
          
          geometry={nodes.Object_137.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_138.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.251, 2.22, -1.824]} rotation={[0.065, 0.027, -0.054]}>
        <mesh
          
          
          geometry={nodes.Object_140.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_141.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.736, 2.673, 0.319]} rotation={[1.575, 0, -1.571]}>
        <mesh
          
          
          geometry={nodes.Object_143.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_144.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.702, 2.987, 0.324]} rotation={[-0.039, -0.009, 0.013]}>
        <mesh
          
          
          geometry={nodes.Object_146.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_147.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.287, 2.416, -0.367]} rotation={[-0.032, -0.367, 0.167]} scale={0.925}>
        <mesh
          
          
          geometry={nodes.Object_149.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_150.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.485, 2.488, -0.3]} rotation={[0.125, -0.599, 0.111]}>
        <mesh
          
          
          geometry={nodes.Object_152.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_153.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.641, 3.466, 1.231]} rotation={[0, 1.386, 0]}>
        <mesh
          
          
          geometry={nodes.Object_155.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_156.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.71, 3.416, 1.686]}>
        <mesh
          
          
          geometry={nodes.Object_158.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_159.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.745, 3.525, 1.714]} rotation={[0.151, -0.212, 0.038]}>
        <mesh
          
          
          geometry={nodes.Object_161.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_162.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.752, 3.557, 1.684]} rotation={[-0.023, 0.04, 0.266]}>
        <mesh
          
          
          geometry={nodes.Object_164.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_165.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.584, 2.874, -0.047]} rotation={[-0.025, 0.396, -1.205]} scale={1.323}>
        <mesh
          
          
          geometry={nodes.Object_167.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_168.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.611, 2.868, -0.061]} rotation={[-0.077, 0.376, -1.27]}>
        <mesh
          
          
          geometry={nodes.Object_170.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_171.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.593, 2.807, -0.323]} rotation={[-0.071, 0.052, -1.295]}>
        <mesh
          
          
          geometry={nodes.Object_173.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_174.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.657, 3.497, 1.473]} scale={0.94}>
        <mesh
          
          
          geometry={nodes.Object_178.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_179.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.553, 2.822, 1.81]}>
        <mesh
          
          
          geometry={nodes.Object_185.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_186.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.597, 3.105, 1.201]}>
        <mesh
          
          
          geometry={nodes.Object_190.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_191.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.59, 2.832, 1.5]}>
        <mesh
          
          
          geometry={nodes.Object_193.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_194.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.623, 2.38, 1.951]}>
        <mesh
          
          
          geometry={nodes.Object_198.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_199.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.58, 2.143, 1.451]}>
        <mesh
          
          
          geometry={nodes.Object_201.geometry}
          material={materials.details_non_culled}
        />
        <mesh
          
          
          geometry={nodes.Object_202.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.379, 2.429, -1.631]} rotation={[0.019, -0.617, 0.017]}>
        <mesh
          
          
          geometry={nodes.Object_206.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_207.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.138, 2.057, -1.687]}>
        <mesh
          
          
          geometry={nodes.Object_209.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_210.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.224, 2.042, -1.708]}>
        <mesh
          
          
          geometry={nodes.Object_212.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_213.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.252, 2.006, -1.174]} rotation={[0, -1.078, 0]}>
        <mesh
          
          
          geometry={nodes.Object_215.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_216.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.704, 3.388, -0.232]} rotation={[0.051, -0.105, -1.578]} scale={1.08}>
        <mesh
          
          
          geometry={nodes.Object_218.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_219.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.689, 3.362, 0.336]} rotation={[-1.68, -0.003, -0.699]}>
        <mesh
          
          
          geometry={nodes.Object_221.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_222.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.814, 3.517, 0.362]} rotation={[0.004, 0.001, 0]}>
        <mesh
          
          
          geometry={nodes.Object_224.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_225.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.811, 3.521, -0.214]} rotation={[0.004, 0.001, 0]}>
        <mesh
          
          
          geometry={nodes.Object_227.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_228.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.659, 3.712, 1.468]} rotation={[0.018, 0, 0.071]}>
        <mesh
          
          
          geometry={nodes.Object_234.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_235.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.64, 3.545, 1.228]} rotation={[0, -0.617, 0.014]}>
        <mesh
          
          
          geometry={nodes.Object_237.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_238.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.657, 3.462, 1.046]}>
        <mesh
          
          
          geometry={nodes.Object_240.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_241.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.612, 1.498, 2.037]}>
        <mesh
          
          
          geometry={nodes.Object_245.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_246.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.596, 1.678, 1.99]} rotation={[-0.189, 0.003, -0.184]}>
        <mesh
          
          
          geometry={nodes.Object_248.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_249.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.743, 0.84, -2.627]} rotation={[-1.397, 0.493, -1.591]}>
        <mesh
          
          
          geometry={nodes.Object_253.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_254.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.791, 0.216, 0.618]}>
        <mesh
          
          
          geometry={nodes.Object_256.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_257.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.791, 0.217, -0.585]}>
        <mesh
          
          
          geometry={nodes.Object_259.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_260.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.23, 2.371, 0.539]} rotation={[2.685, -1.536, 1.303]}>
        <mesh
          
          
          geometry={nodes.Object_264.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_265.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.258, 2.514, 0.177]}>
        <mesh
          
          
          geometry={nodes.Object_267.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_268.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.684, 2.843, 1.685]}>
        <mesh
          
          
          geometry={nodes.Object_274.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_275.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.685, 3.032, 1.685]}>
        <mesh
          
          
          geometry={nodes.Object_277.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_278.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.436, 2.051, -0.313]}>
        <mesh
          
          
          geometry={nodes.Object_282.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_283.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.376, 2.393, -1.63]}>
        <mesh
          
          
          geometry={nodes.Object_285.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_286.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.641, 3.511, 1.23]}>
        <mesh
          
          
          geometry={nodes.Object_288.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_289.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.553, 2.893, 1.81]}>
        <mesh
          
          
          geometry={nodes.Object_291.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_292.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.599, 2.873, -0.337]} rotation={[-0.35, 0.147, -0.904]}>
        <mesh
          
          
          geometry={nodes.Object_294.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_295.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.207, 1.374, 1.643]}>
        <mesh
          
          
          geometry={nodes.Object_299.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_300.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.241, 1.326, 1.627]}>
        <mesh
          
          
          geometry={nodes.Object_302.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_303.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.194, 1.283, 1.664]}>
        <mesh
          
          
          geometry={nodes.Object_305.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_306.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.613, 1.353, 2.038]}>
        <mesh
          
          
          geometry={nodes.Object_308.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_309.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.859, 1.898, 0.162]} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
        <mesh
          
          
          geometry={nodes.Object_311.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_312.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.862, 1.898, -0.109]} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
        <mesh
          
          
          geometry={nodes.Object_314.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_315.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.863, 1.898, -0.38]} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
        <mesh
          
          
          geometry={nodes.Object_317.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_318.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.685, 3.091, 1.685]} rotation={[0, -0.617, 0]}>
        <mesh
          
          
          geometry={nodes.Object_320.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_321.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.143, 0.726, 1.898]} rotation={[0.002, -0.019, -0.072]}>
        <mesh
          
          
          geometry={nodes.Object_323.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_324.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.144, 0.69, 1.9]} rotation={[-0.02, -0.009, -0.029]}>
        <mesh
          
          
          geometry={nodes.Object_326.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_327.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.691, 3.405, -0.235]} rotation={[-1.717, -0.058, -1.15]}>
        <mesh
          
          
          geometry={nodes.Object_329.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_330.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.051, 2.182, -1.681]} rotation={[-0.078, -0.618, -0.078]}>
        <mesh
          
          
          geometry={nodes.Object_332.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_333.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.473, 2.526, -0.31]} rotation={[0.21, -0.732, 0.32]}>
        <mesh
          
          
          geometry={nodes.Object_335.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_336.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.547, 3.411, 1.981]}>
        <mesh
          
          
          geometry={nodes.Object_340.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_341.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.597, 3.105, 1.201]}>
        <mesh
          
          
          geometry={nodes.Object_347.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_348.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.623, 2.38, 1.951]}>
        <mesh
          
          
          geometry={nodes.Object_352.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_353.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.859, 1.898, 0.162]} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
        <mesh
          
          
          geometry={nodes.Object_355.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_356.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.863, 1.898, -0.102]} rotation={[1.54, -0.011, -1.654]} scale={0.961}>
        <mesh
          
          
          geometry={nodes.Object_358.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_359.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group
        position={[0.863, 1.898, -0.38]}
        rotation={[Math.PI / 2, 0, -Math.PI / 2]}
        scale={1.01}>
        <mesh
          
          
          geometry={nodes.Object_361.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_362.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.21, 2.036, 1.708]} rotation={[Math.PI, -1.308, Math.PI]} scale={0.422}>
        <mesh
          
          
          geometry={nodes.Object_368.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_369.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.614, 2.273, 1.464]} rotation={[-0.031, 0.707, 0.284]}>
        <mesh
          
          
          geometry={nodes.Object_371.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_372.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.858, 1.895, 0.413]} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
        <mesh
          
          
          geometry={nodes.Object_406.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_407.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.795, 0.216, 0.618]}>
        <mesh
          
          
          geometry={nodes.Object_417.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_418.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.794, 0.217, -0.585]}>
        <mesh
          
          
          geometry={nodes.Object_420.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_421.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.584, 2.197, 1.943]} scale={0.988}>
        <mesh
          
          
          geometry={nodes.Object_425.geometry}
          material={materials.details}
        />
        <mesh
          
          
          geometry={nodes.Object_426.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.258, 1.018, -2.708]} rotation={[0.071, -0.04, -1.089]}>
        <mesh
          
          
          geometry={nodes.Object_436.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_437.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.232, 0.951, -2.825]} rotation={[-0.387, -0.454, -0.832]}>
        <mesh
          
          
          geometry={nodes.Object_439.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_440.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.266, 1.356, -2.614]} rotation={[-2.991, -1.257, 2.486]}>
        <mesh
          
          
          geometry={nodes.Object_442.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_443.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.508, 1.366, -2.844]} rotation={[-3.092, -0.365, 2.365]}>
        <mesh
          
          
          geometry={nodes.Object_445.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_446.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.394, 0.824, -2.589]} rotation={[-0.011, -0.283, -1.811]}>
        <mesh
          
          
          geometry={nodes.Object_448.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_449.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.613, 1.527, -3.074]} rotation={[-1.158, -0.505, -2.106]}>
        <mesh
          
          
          geometry={nodes.Object_451.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_452.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.5, 1.024, -2.537]} rotation={[3.132, -0.028, 2.355]}>
        <mesh
          
          
          geometry={nodes.Object_454.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_455.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.364, 0.956, -2.77]} rotation={[-2.698, -0.838, 3.119]}>
        <mesh
          
          
          geometry={nodes.Object_457.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_458.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.467, 1.12, -2.464]} rotation={[-2.362, 0.147, 2.839]}>
        <mesh
          
          
          geometry={nodes.Object_460.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_461.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.37, 0.968, -2.315]} rotation={[2.915, 0.97, 2.113]}>
        <mesh
          
          
          geometry={nodes.Object_463.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_464.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.34, 1.105, -2.855]} rotation={[-0.173, -1.049, -0.941]}>
        <mesh
          
          
          geometry={nodes.Object_466.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_467.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.192, 1.134, -2.859]} rotation={[0.108, 0.487, -0.447]}>
        <mesh
          
          
          geometry={nodes.Object_469.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_470.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.289, 2.321, -1.153]} rotation={[0.134, 0.119, 0.258]}>
        <mesh
          
          
          geometry={nodes.Object_476.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_477.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group
        position={[-0.091, 2.249, 1.807]}
        rotation={[2.502, 0.969, 0.976]}
        scale={[-0.255, 0.255, 0.255]}>
        <mesh
          
          
          geometry={nodes.Object_479.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_480.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[0.246, 1.77, 2.429]} rotation={[0.989, 0.004, 2.34]} scale={0.446}>
        <mesh
          
          
          geometry={nodes.Object_482.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_483.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[0.387, 1.99, 2.364]} rotation={[1.416, 0.068, 2.286]} scale={0.455}>
        <mesh
          
          
          geometry={nodes.Object_485.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_486.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[0.066, 2.115, 2.119]} rotation={[0.377, 0.3, 2.794]} scale={0.444}>
        <mesh
          
          
          geometry={nodes.Object_488.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_489.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[0.311, 1.677, 2.361]} rotation={[1.725, 0.323, 2.04]} scale={0.444}>
        <mesh
          
          
          geometry={nodes.Object_491.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_492.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[0.36, 1.561, 2.465]} rotation={[1.138, 0.126, -3.005]} scale={0.427}>
        <mesh
          
          
          geometry={nodes.Object_494.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_495.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group
        position={[0.274, 0.172, 2.502]}
        rotation={[0.016, -0.132, 2.877]}
        scale={[0.29, 0.435, 0.442]}>
        <mesh
          
          
          geometry={nodes.Object_497.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_498.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group
        position={[0.331, 0.275, 2.352]}
        rotation={[0.369, 0.498, -2.996]}
        scale={[0.401, 0.449, 0.446]}>
        <mesh
          
          
          geometry={nodes.Object_500.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_501.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[0.201, 0.513, 2.412]} rotation={[0.744, 0.223, 2.746]} scale={0.398}>
        <mesh
          
          
          geometry={nodes.Object_503.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_504.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[-0.383, 2.732, 1.755]} rotation={[0.97, 0.534, 2.713]} scale={0.427}>
        <mesh
          
          
          geometry={nodes.Object_506.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_507.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[-0.476, 2.847, 1.696]} rotation={[2.454, 1.077, 0.771]} scale={0.264}>
        <mesh
          
          
          geometry={nodes.Object_509.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_510.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group
        position={[-0.298, 2.585, 1.689]}
        rotation={[2.028, 1.066, 1.488]}
        scale={[-0.288, 0.288, 0.288]}>
        <mesh
          
          
          geometry={nodes.Object_512.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_513.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[-0.613, 2.893, 1.463]} rotation={[-1.702, 0.121, 2.276]} scale={0.287}>
        <mesh
          
          
          geometry={nodes.Object_515.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_516.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[-0.585, 2.889, 1.479]} rotation={[-2.035, 0.29, 2.156]} scale={0.261}>
        <mesh
          
          
          geometry={nodes.Object_518.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_519.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[-0.606, 2.927, 1.502]} rotation={[-0.908, -0.617, 1.836]} scale={0.287}>
        <mesh
          
          
          geometry={nodes.Object_521.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_522.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[-0.6, 2.977, 1.492]} rotation={[-1.529, -0.428, 1.677]} scale={0.204}>
        <mesh
          
          
          geometry={nodes.Object_524.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_525.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[-0.54, 2.886, 1.494]} rotation={[-1.324, 0.22, 1.425]} scale={0.256}>
        <mesh
          
          
          geometry={nodes.Object_527.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_528.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[-0.527, 2.921, 1.557]} rotation={[-0.708, -0.553, 1.87]} scale={0.189}>
        <mesh
          
          
          geometry={nodes.Object_530.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_531.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[0.304, 2.361, -1.845]} rotation={[-0.882, -0.482, -0.577]}>
        <mesh
          
          
          geometry={nodes.Object_533.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_534.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[0.166, 0.781, 2.219]} rotation={[0.923, 0.844, 2]} scale={0.457}>
        <mesh
          
          
          geometry={nodes.Object_536.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_537.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[-0.199, 0.874, 2.088]} rotation={[-0.611, -0.061, 2.583]} scale={0.287}>
        <mesh
          
          
          geometry={nodes.Object_539.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_540.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[-0.009, 0.815, 1.858]} rotation={[-1.565, 0.536, -2.165]} scale={0.287}>
        <mesh
          
          
          geometry={nodes.Object_542.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_543.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[-0.054, 0.798, 1.943]} rotation={[-0.574, 0.381, -2.983]} scale={0.287}>
        <mesh
          
          
          geometry={nodes.Object_545.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_546.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[-0.057, 0.816, 1.923]} rotation={[-1.238, -0.471, 1.745]} scale={0.287}>
        <mesh
          
          
          geometry={nodes.Object_548.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_549.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[0, 0.819, 1.904]} rotation={[-2.341, 1.11, -0.511]} scale={0.264}>
        <mesh
          
          
          geometry={nodes.Object_551.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_552.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[-0.134, 0.845, 2.039]} rotation={[-0.699, 0.205, 2.017]} scale={0.224}>
        <mesh
          
          
          geometry={nodes.Object_554.geometry}
          material={materials.leaves}
        />
        <mesh
          
          
          geometry={nodes.Object_555.geometry}
          material={materials.outline_non_culled}
        />
      </group>
      <group position={[0.704, 2.379, -0.396]} rotation={[0, -0.025, 0]}>
        <mesh
          
          
          geometry={nodes.Object_557.geometry}
          material={materials.Material}
        />
        <mesh
          
          
          geometry={nodes.Object_558.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[2.025, 0.504, 0.487]} rotation={[-0.114, 0.003, -0.035]}>
        <mesh
          
          
          geometry={nodes.Object_566.geometry}
          material={materials.catsu}
        />
        <mesh
          
          
          geometry={nodes.Object_567.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[2.216, 0.337, 1.023]} rotation={[0.866, 0.227, -0.16]}>
        <mesh
          
          
          geometry={nodes.Object_571.geometry}
          material={materials.catsu}
        />
        <mesh
          
          
          geometry={nodes.Object_572.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[2.232, 0.44, 0.968]} rotation={[0.05, -0.766, -1.204]}>
        <mesh
          
          
          geometry={nodes.Object_574.geometry}
          material={materials.catsu}
        />
        <mesh
          
          
          geometry={nodes.Object_575.geometry}
          material={materials.outline_culled}
        />
      </group>
      <group position={[2.128, 0.337, 1.103]} rotation={[1.314, -0.456, -0.129]}>
        <mesh
          
          
          geometry={nodes.Object_577.geometry}
          material={materials.catsu}
        />
        <mesh
          
          
          geometry={nodes.Object_578.geometry}
          material={materials.outline_culled}
        />
      </group>
      <mesh
        
        
        geometry={nodes.Object_4.geometry}
        material={materials.outline_non_culled}
      />
      <mesh
        
        
        geometry={nodes.Object_6.geometry}
        material={materials.white}
      />
      <mesh
        
        
        geometry={nodes.Object_8.geometry}
        material={materials.white}
      />
      <mesh
        
        
        geometry={nodes.Object_10.geometry}
        material={materials.white}
      />
      <mesh
        
        
        geometry={nodes.Object_12.geometry}
        material={materials.white}
      />
      <mesh
        
        
        geometry={nodes.Object_14.geometry}
        material={materials.white}
        position={[7.278, 2.518, -5.455]}
        scale={0.641}
      />
      <mesh
        
        
        geometry={nodes.Object_16.geometry}
        material={materials.outline_culled}
        position={[7.278, 2.518, -5.455]}
        scale={0.641}
      />
      <mesh
        
        
        geometry={nodes.Object_18.geometry}
        material={materials.big_shapes}
        position={[0, 0.866, 0]}
        scale={[1, 0.924, 1]}
      />
      <mesh
        
        
        geometry={nodes.Object_23.geometry}
        material={materials.big_shapes}
        position={[0, 1.977, 1.57]}
        scale={[1, 0.898, 1]}
      />
      <mesh
        
        
        geometry={nodes.Object_25.geometry}
        material={materials.big_shapes}
        position={[0, 0.505, 1.57]}
        scale={[1, 0.898, 1]}
      />
      <mesh
        
        
        geometry={nodes.Object_39.geometry}
        material={materials.floor_n_mattress}
        position={[2.293, 0.149, 0.584]}
        scale={0.819}
      />
      <mesh
        
        
        geometry={nodes.Object_41.geometry}
        material={materials.outline_culled}
        position={[0, 1.977, 1.57]}
        scale={[1, 0.898, 1]}
      />
      <mesh
        
        
        geometry={nodes.Object_43.geometry}
        material={materials.outline_culled}
        position={[0, 0.505, 1.57]}
        scale={[1, 0.898, 1]}
      />
      <mesh
        
        
        geometry={nodes.Object_45.geometry}
        material={materials.outline_culled}
        position={[0, 0.866, 0]}
        scale={[1, 0.924, 1]}
      />
      <mesh
        
        
        geometry={nodes.Object_47.geometry}
        material={materials.outline_culled}
        position={[-0.153, 0.878, -1.464]}
        scale={[1, 0.898, 1]}
      />
      <mesh
        
        
        geometry={nodes.Object_49.geometry}
        material={materials.outline_culled}
        position={[2.293, 0.149, 0.584]}
        scale={0.819}
      />
      <mesh
        
        
        geometry={nodes.Object_51.geometry}
        material={materials.outline_non_culled}
        position={[2.293, 0.149, 0.584]}
        scale={0.819}
      />
      <mesh
        
        
        geometry={nodes.Object_176.geometry}
        material={materials.details}
        position={[0.331, 2.125, 1.435]}
        rotation={[0, 0.242, 0]}
      />
      <mesh
        
        
        geometry={nodes.Object_181.geometry}
        material={materials.details}
        position={[-0.615, 2.884, 2.004]}
      />
      <mesh
        
        
        geometry={nodes.Object_183.geometry}
        material={materials.details}
        position={[-0.611, 3.081, 2.038]}
      />
      <mesh
        
        
        geometry={nodes.Object_188.geometry}
        material={materials.details}
        position={[-0.615, 2.881, 1.214]}
      />
      <mesh
        
        
        geometry={nodes.Object_196.geometry}
        material={materials.details}
        position={[-0.584, 2.197, 1.943]}
        scale={0.988}
      />
      <mesh
        
        
        geometry={nodes.Object_204.geometry}
        material={materials.details}
        position={[-0.572, 2.181, 1.672]}
      />
      <mesh
        
        
        geometry={nodes.Object_230.geometry}
        material={materials.details}
        position={[-0.549, 2.259, 1.219]}
      />
      <mesh
        
        
        geometry={nodes.Object_232.geometry}
        material={materials.details}
        position={[-0.549, 2.522, 1.223]}
        rotation={[0.113, 0.212, -0.032]}
      />
      <mesh
        
        
        geometry={nodes.Object_243.geometry}
        material={materials.details_non_culled}
        position={[-0.603, 2.389, 1.699]}
        rotation={[0, 0, -0.001]}
      />
      <mesh
        
        
        geometry={nodes.Object_251.geometry}
        material={materials.details}
        position={[-0.547, 3.411, 1.981]}
      />
      <mesh
        
        
        geometry={nodes.Object_262.geometry}
        material={materials.notes}
        position={[-0.76, 3.264, -0.931]}
        rotation={[-0.233, 0.481, -0.891]}
      />
      <mesh
        
        
        geometry={nodes.Object_270.geometry}
        material={materials.details}
        position={[0.429, 2.126, 1.826]}
        rotation={[1.462, -0.262, -0.223]}
      />
      <mesh
        
        
        geometry={nodes.Object_272.geometry}
        material={materials.details}
        position={[0.241, 2.138, 1.045]}
        rotation={[1.664, -0.225, -0.186]}
      />
      <mesh
        
        
        geometry={nodes.Object_280.geometry}
        material={materials.details}
        position={[-0.549, 2.253, 1.219]}
      />
      <mesh
        
        
        geometry={nodes.Object_297.geometry}
        material={materials.details_non_culled}
        position={[-0.608, 2.402, 1.645]}
        rotation={[0, 0, -0.001]}
      />
      <mesh
        
        
        geometry={nodes.Object_338.geometry}
        material={materials.details}
        position={[0.375, 2.032, 1.414]}
        rotation={[0, 0.367, 0]}
      />
      <mesh
        
        
        geometry={nodes.Object_343.geometry}
        material={materials.details}
        position={[-0.615, 2.884, 2.004]}
      />
      <mesh
        
        
        geometry={nodes.Object_345.geometry}
        material={materials.details}
        position={[-0.611, 3.081, 2.038]}
      />
      <mesh
        
        
        geometry={nodes.Object_350.geometry}
        material={materials.details}
        position={[-0.615, 2.886, 1.214]}
      />
      <mesh
        
        
        geometry={nodes.Object_364.geometry}
        material={materials.outline_culled}
        position={[-0.584, 2.197, 1.943]}
      />
      <mesh
        
        
        geometry={nodes.Object_366.geometry}
        material={materials.details}
        position={[0.474, 2.045, 1.824]}
        rotation={[0, 0.367, 0]}
        scale={0.422}
      />
      <mesh
        
        
        geometry={nodes.Object_374.geometry}
        material={materials.outline_culled}
        position={[-0.624, 2.744, 1.596]}
      />
      <mesh
        
        
        geometry={nodes.Object_376.geometry}
        material={materials.outline_culled}
        position={[-0.549, 2.253, 1.219]}
      />
      <mesh
        
        
        geometry={nodes.Object_378.geometry}
        material={materials.outline_culled}
        position={[-0.549, 2.253, 1.219]}
      />
      <mesh
        
        
        geometry={nodes.Object_380.geometry}
        material={materials.outline_culled}
        position={[-0.549, 2.259, 1.219]}
      />
      <mesh
        
        
        geometry={nodes.Object_382.geometry}
        material={materials.outline_culled}
        position={[-0.549, 2.522, 1.223]}
        rotation={[0.113, 0.212, -0.032]}
      />
      <mesh
        
        
        geometry={nodes.Object_384.geometry}
        material={materials.outline_culled}
        position={[-0.615, 2.881, 1.214]}
        scale={1.026}
      />
      <mesh
        
        
        geometry={nodes.Object_386.geometry}
        material={materials.outline_culled}
        position={[-0.615, 2.886, 1.214]}
      />
      <mesh
        
        
        geometry={nodes.Object_388.geometry}
        material={materials.outline_culled}
        position={[-0.615, 2.886, 1.214]}
      />
      <mesh
        
        
        geometry={nodes.Object_390.geometry}
        material={materials.outline_culled}
        position={[-0.572, 2.181, 1.672]}
      />
      <mesh
        
        
        geometry={nodes.Object_392.geometry}
        material={materials.outline_culled}
        position={[0.375, 2.032, 1.414]}
        rotation={[0, 0.367, 0]}
      />
      <mesh
        
        
        geometry={nodes.Object_394.geometry}
        material={materials.outline_culled}
        position={[0.474, 2.045, 1.824]}
        rotation={[0, 0.367, 0]}
        scale={0.422}
      />
      <mesh
        
        
        geometry={nodes.Object_396.geometry}
        material={materials.outline_culled}
        position={[0.241, 2.138, 1.045]}
        rotation={[1.664, -0.225, -0.186]}
      />
      <mesh
        
        
        geometry={nodes.Object_398.geometry}
        material={materials.outline_culled}
        position={[-0.615, 2.884, 2.004]}
      />
      <mesh
        
        
        geometry={nodes.Object_400.geometry}
        material={materials.outline_culled}
        position={[-0.615, 2.884, 2.004]}
      />
      <mesh
        
        
        geometry={nodes.Object_402.geometry}
        material={materials.outline_culled}
        position={[-0.611, 3.081, 2.038]}
      />
      <mesh
        
        
        geometry={nodes.Object_404.geometry}
        material={materials.outline_culled}
        position={[-0.611, 3.081, 2.038]}
      />
      <mesh
        
        
        geometry={nodes.Object_409.geometry}
        material={materials.outline_culled}
        position={[-0.547, 3.411, 1.981]}
      />
      <mesh
        
        
        geometry={nodes.Object_411.geometry}
        material={materials.outline_culled}
        position={[-0.547, 3.411, 1.981]}
        scale={0.985}
      />
      <mesh
        
        
        geometry={nodes.Object_413.geometry}
        material={materials.outline_culled}
        position={[0.241, 2.138, 1.045]}
        rotation={[1.664, -0.225, -0.186]}
      />
      <mesh
        
        
        geometry={nodes.Object_415.geometry}
        material={materials.outline_culled}
        position={[0.331, 2.125, 1.435]}
        rotation={[0, 0.242, 0]}
      />
      <mesh
        
        
        geometry={nodes.Object_423.geometry}
        material={materials.outline_culled}
        position={[-0.584, 2.197, 1.943]}
      />
      <mesh
        
        
        geometry={nodes.Object_428.geometry}
        material={materials.outline_culled}
        position={[-0.584, 2.197, 1.943]}
        scale={0.988}
      />
      <mesh
        
        
        geometry={nodes.Object_430.geometry}
        material={materials.outline_culled}
        position={[-0.608, 2.402, 1.645]}
        rotation={[0, 0, -0.001]}
      />
      <mesh
        
        
        geometry={nodes.Object_432.geometry}
        material={materials.outline_culled}
        position={[-0.603, 2.389, 1.699]}
        rotation={[0, 0, -0.001]}
      />
      <mesh
        
        
        geometry={nodes.Object_434.geometry}
        material={materials.outline_culled}
        position={[-0.76, 3.264, -0.931]}
        rotation={[-0.233, 0.481, -0.891]}
      />
      <mesh
        
        
        geometry={nodes.Object_472.geometry}
        material={materials.outline_culled}
        position={[-0.63, 2.804, 1.475]}
        rotation={[-2.793, 0.431, 1.615]}
        scale={0.087}
      />
      <mesh
        
        
        geometry={nodes.Object_474.geometry}
        material={materials.outline_culled}
        position={[-0.043, 0.818, 1.907]}
        rotation={[3.001, 0.423, 2.009]}
        scale={0.082}
      />
      <mesh
        
        
        geometry={nodes.Object_560.geometry}
        material={materials.Material}
        position={[0.711, 2.033, -0.516]}
        rotation={[Math.PI, -1.37, Math.PI]}
      />
      <mesh
        
        
        geometry={nodes.Object_562.geometry}
        material={materials.outline_culled}
        position={[0.711, 2.033, -0.516]}
        rotation={[Math.PI, -1.37, Math.PI]}
      />
      <mesh
        
        
        geometry={nodes.Object_564.geometry}
        material={materials.floor_n_mattress}
        position={[-0.106, 0.164, -0.113]}
      />
      <mesh
        
        
        geometry={nodes.Object_569.geometry}
        material={materials.catsu}
        position={[2.039, 0.156, 1.106]}
        rotation={[-2.381, -0.926, -1.998]}
      />
      <mesh
        
        
        geometry={nodes.Object_580.geometry}
        material={materials.catsu}
        position={[2.353, 0.315, 0.177]}
        rotation={[0.061, 0.032, 0.078]}
      />
      <mesh
        
        
        geometry={nodes.Object_582.geometry}
        material={materials.outline_culled}
        position={[2.04, 0.16, 1.103]}
        rotation={[-2.381, -0.926, -1.998]}
      />
      <mesh
        
        
        geometry={nodes.Object_584.geometry}
        material={materials.outline_culled}
        position={[2.358, 0.365, 0.09]}
        rotation={[0.061, 0.032, 0.078]}
        scale={1.058}
      />
    </a.group>
  )
}

export default Island;


