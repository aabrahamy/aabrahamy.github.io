import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Loader from '../components/Loader'

import Island from '../models/Island';

const Home = () => {
    const adjustIslandForScreenSize = () => {
        let screenScale = null;
        let screenPosition = [-1.8, -12, -43]
        let rotation = [0.1, 4.7, 0];

        if(window.innerWidth < 768) {
            screenScale = [8, 8, 8];
        } else {
            screenScale = [9, 9, 9];
        }

        return [screenScale, screenPosition, rotation];
    }

    const [islandScale, islandPosition, islandRotation] = adjustIslandForScreenSize();

    return (
        <section className="w-full h-screen relative">
            <Canvas 
            className="w-full h-screen bg-transparent"
            camera={{ near: 0.1, far: 1000 }} 
            >
                <Suspense fallback={<Loader />}>
                <directionalLight />
                <ambientLight />
                <pointLight />
                <spotLight />
                <hemisphereLight />

                    <Island
                    position={islandPosition}
                    scale={islandScale}
                    rotation={islandRotation}
                    />
                </Suspense>
            </Canvas>
        </section>
    )
}


export default Home