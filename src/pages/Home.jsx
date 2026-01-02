import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Loader from '../components/Loader'
import HotspotPopup from '../components/HotspotPopup'

import Island from '../models/Island';

const Home = () => {
    const [isRotating, setIsRotating] = useState(false);
    const [activeHotspot, setActiveHotspot] = useState(null);

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
                className={`w-full h-screen bg-transparent ${isRotating ? 
                'cursor-grabbing' : 'cursor-grab'}`}
                camera={{ near: 0.1, far: 1000 }} 
            >
                <Suspense fallback={<Loader />}>
                <directionalLight />
                <ambientLight />
                <hemisphereLight />

                <Island
                position={islandPosition}
                scale={islandScale}
                rotation={islandRotation}
                isRotating={isRotating}
                setIsRotating={setIsRotating}
                setActiveHotspot={setActiveHotspot}
                />
                </Suspense>
            </Canvas>

            {activeHotspot && (
                <HotspotPopup
                  hotspot={activeHotspot}
                  onClose={() => setActiveHotspot(null)}
                />
            )}
        </section>
    )
}


export default Home