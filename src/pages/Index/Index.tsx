import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useControls, folder } from 'leva';

import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Scanline } from '@react-three/postprocessing';

import Dotti from '../../components/Dotti/Dotti';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import { Mesh } from 'three';
import Background from '../../components/Background/Background';

const BUTTONS = [
    { label: "Button 1", action: () => console.log('Button 1 clicked') },
    { label: "Button 2", action: () => console.log('Button 2 clicked') },
    { label: "Button 3", action: () => console.log('Button 3 clicked') },
    { label: "Button 4", action: () => console.log('Button 4 clicked') },
]

export default function Index() {
    const lighting = useControls('Lighting', {
        ambientLight: folder({
            intensity: 5,
        }, { collapsed: true }),
    }, { collapsed: true });


    return (
        <Canvas style={{ height: '100vh', width: '100vw' }}>
            <ambientLight intensity={lighting.intensity} />
            <pointLight position={[10, 10, 10]} />


			<Background />

            <PerspectiveCamera position={[0, 0, 6]} makeDefault />
            <OrbitControls  />

            <Effects />

            <Dotti />
            <Buttons />
        </Canvas>
    )
}

function Effects() {
    const effects = useControls('Effects', {
        bloom: folder({
            luminanceThreshold: 0.5,
            luminanceSmoothing: 5,
            height: 500,
            bOpacity: 0.5,
        }, { collapsed: true }),
        noise: folder({
            nOpacity: 0.1,
        }, { collapsed: true }),
        scanline: folder({
            density: 1,
            sOpacity: 0.2,
        }, { collapsed: true }),
    }, { collapsed: true });

    useFrame((_, delta) => {
        effects.nOpacity = Math.abs(Math.sin(delta * 0.5)) * 0.1;
    });

    return (
        <EffectComposer>
            <Bloom 
                luminanceThreshold={effects.luminanceThreshold}
                luminanceSmoothing={effects.luminanceSmoothing}
                height={effects.height}
                opacity={effects.bOpacity}
            />
            <Noise opacity={effects.nOpacity} />
            <Scanline density={1} opacity={effects.sOpacity}/>
        </EffectComposer>
    )
}

function Buttons() {
    const [positions, setPositions] = useState<[number, number, number][]>(BUTTONS.map(() => [0, 0, 0]));
    const [rotations, setRotations] = useState<[number, number, number][]>(BUTTONS.map(() => [0, 0, 0]));
    const refs = Array.from({ length: BUTTONS.length }, () => useRef<Mesh>(null));

    const controls = useControls('Buttons', {
        distance: 1.7,
        pointerInfluence: 0.1,
        buttonSize: 0.2,
        color: '#ffffff',
    }, { collapsed: true });

    useFrame(({pointer}) => {        
        const newPositions = BUTTONS.map((_, index) => {
            // Start at 90 and go clockwise
            const angle = Math.PI/2 - Math.PI*2 * (index / BUTTONS.length);
            const posX = Math.cos(angle) * controls.distance - pointer.x * controls.pointerInfluence;
            const posY = Math.sin(angle) * controls.distance - pointer.y * controls.pointerInfluence;
            const posZ = 0;

            const rotX = pointer.x * controls.pointerInfluence;
            const rotY = pointer.y * controls.pointerInfluence;
            const rotZ = 0;

            return {
                position: [posX, posY, posZ] as [number, number, number],
                rotation: [rotX, rotY, rotZ] as [number, number, number],
            }
        });

        setPositions(newPositions.map(pos => pos.position));
        setRotations(newPositions.map(pos => pos.rotation));        
    });

    function pointerEnter(e: ThreeEvent<PointerEvent>, index: number) {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';

        if(!refs[index].current) return;
        gsap.to(refs[index].current.scale, {
            x: 1.1,
            y: 1.1,
            z: 1.1,
            duration: 0.5,
            ease: 'power3.out',
        });
        gsap.to(refs[index].current.material, {
            emissiveIntensity: 0.005,
            duration: 0.5,
            ease: 'power3.out',
        });
    }

    function pointerLeave(e: ThreeEvent<PointerEvent>, index: number) {
        e.stopPropagation();
        document.body.style.cursor = 'auto';

        if(!refs[index].current) return;
        gsap.to(refs[index].current.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.5,
            ease: 'power3.out',
        });
        gsap.to(refs[index].current.material, {
            emissiveIntensity: 0.001,
            duration: 0.5,
            ease: 'power3.out',
        });
    }

    return (
        <>
            {BUTTONS.map((button, index) => {

                return <Text
                    font="/fonts/SpaceMono-Regular.ttf"
                    key={index}
                    position={positions[index]}
                    rotation={rotations[index]}
                    fontSize={controls.buttonSize}
                    color={controls.color}
                    onClick={button.action}
                    onPointerEnter={(e) => pointerEnter(e, index)}
                    onPointerLeave={(e) => pointerLeave(e, index)}
                    ref={refs[index]}
                >
                    {button.label}
                    <meshStandardMaterial color="white" emissive={[255,255,255]} emissiveIntensity={0.001} />
                </Text>
            })}
        </>
    )
}
