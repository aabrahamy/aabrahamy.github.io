import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Loader from '../components/Loader'

import  Island from '../models/Island';

const Home = () => {
    const adjustIslandForScreenSize = () => {
        let screenScale = null;
        let screenPosition = [0, -2, -5];
        let rotation = [0.1, 4.7, 0];

        if(window.innerWidth < 768) {
            screenScale = [2, 2, 2];
            screenPosition = [0, -2, -5];
        } else {
            screenScale = [2.4, 2.4, 2.4];
            screenPosition = [-0.5, -3.1, -8];
        }

        return [screenScale, screenPosition, rotation];
    }

    const [islandScale, islandPosition, islandRotation] = adjustIslandForScreenSize();
    return (
         <section className="w-full h-screen relative">
            {/* <div className="absolute top-28 left-0 right-0 z-10 items-center justify-center">
                POPUP
            </div> */}
            <Canvas 
            className="w-full h-screen bg-transparent"
            camera={{ near: 0.1, far: 1000}}
            >
                <Suspense fallback={<Loader />}>
                    <directionalLight position={[1, 100, 1]} intensity={1}/>
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