import { useEffect, useMemo, useRef } from "react";
import { Mesh } from "three";
import gsap from "gsap";

import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { folder, useControls } from "leva";

import { useDottiSpeech } from "../../stores/useDottiSpeech";

export default function Dotti() {
    const text = useDottiSpeech((state) => state.partialText);
    const speak = useDottiSpeech((state) => state.speak);

    useEffect(() => {
        const intro = async () => {
            await speak("Hello! I'm Dotti.", { waitEnd: 1000 });            
            await speak("Welcome to my world!");
        }   

        intro();
    }, []);

    const controls = useControls('Dotti', {
        "Geometry": folder({
            segments: 8,
            radius: 1,
            wireframe: true,
            color: '#ffffff',
            opacity: 0.2,
            pointerInfluence: 0.5,
        }, { collapsed: true }),
        "Character": folder({
            eyeHeight: 0.4,
            eyeSpacing: 0.4,
            blink: true,
            blinkFrequency: 0.005,
            blinkDuration: 0.1,
            bobbingAmplitude: 0.04,
            bobbingFrequency: 3,
        }, { collapsed: true }),
    }, { collapsed: true });

    const groupRef = useRef<Mesh>(null!);
    const eye1Ref = useRef<Mesh>(null!);
    const eye2Ref = useRef<Mesh>(null!);

    useFrame((state) => {
        const { pointer } = state;

        // Calculate bobbing
        const bobbing = Math.sin(state.clock.getElapsedTime() * controls.bobbingFrequency) * controls.bobbingAmplitude;

        // Pointer influenced movement
        if (groupRef.current) {
            gsap.to(groupRef.current.rotation, {
                x: -pointer.y * controls.pointerInfluence,
                y: pointer.x * controls.pointerInfluence,
                ease: 'power3.out'
            });

            gsap.to(groupRef.current.position, {
                x: pointer.x * controls.pointerInfluence * 0.05,
                y: pointer.y * controls.pointerInfluence * 0.05 + bobbing,
                ease: 'power3.out'
            });
        }

        // Blink effect
        if (controls.blink) {
            if (Math.random() < controls.blinkFrequency) {
                blink();
            }
        }
    });

    // Helper function to convert polar coordinates to Cartesian
    function polarToCartesian(radius: number, theta: number, phi: number): [number, number, number] {
        const x = radius * Math.sin(theta) * Math.cos(phi);
        const y = radius * Math.cos(theta);
        const z = radius * Math.sin(theta) * Math.sin(phi);
        return [x, y, z];
    };

    // Calculate positions for the eyes using polar coordinates
    const eye1Position = useMemo(() => polarToCartesian(
        controls.radius,
        Math.PI / 2 - controls.eyeHeight,
        -controls.eyeSpacing + Math.PI / 2
    ), [controls.eyeHeight, controls.eyeSpacing]);

    const eye2Position = useMemo(() => polarToCartesian(
        controls.radius,
        Math.PI / 2 - controls.eyeHeight,
        controls.eyeSpacing + Math.PI / 2
    ), [controls.eyeHeight, controls.eyeSpacing]);

    function blink() {
        gsap.to(eye1Ref.current.scale, {
            y: 0.1,
            duration: controls.blinkDuration,
            ease: 'power3.out',
            onComplete: () => {
                gsap.to(eye1Ref.current.scale, {
                    y: 1,
                    duration: controls.blinkDuration,
                    ease: 'power3.out',
                });
            }
        });
        gsap.to(eye2Ref.current.scale, {
            y: 0.1,
            duration: controls.blinkDuration,
            ease: 'power3.out',
            onComplete: () => {
                gsap.to(eye2Ref.current.scale, {
                    y: 1,
                    duration: controls.blinkDuration,
                    ease: 'power3.out',
                });
            }
        });
    }

    function appear() {
        gsap.fromTo(groupRef.current.scale, {
            duration: 1,
            x: 0,
            y: 0,
            z: 0,
        }, {
            duration: 1,
            x: 1,
            y: 1,
            z: 1,
            ease: 'elastic.out(1, 0.5)',
        });
    }

    useEffect(() => {
        appear();
    }, []);

    return (
        <group ref={groupRef}>
            <mesh>
                <sphereGeometry args={[controls.radius, controls.segments, controls.segments]}/>
                <meshStandardMaterial 
                    color={controls.color} 
                    wireframe={controls.wireframe}
                    transparent={true}
                    opacity={controls.opacity}
                />
            </mesh>
            <mesh position={eye1Position} ref={eye1Ref}>
                <ringGeometry args={[0.1, 0.15, controls.segments]} />
                <meshStandardMaterial color={controls.color}  wireframe/>
            </mesh>
            <mesh position={eye2Position} ref={eye2Ref}>
                <ringGeometry args={[0.1, 0.15, controls.segments]} />
                <meshStandardMaterial color={controls.color} wireframe/>
            </mesh>

            <Speech text={text}/>
        </group>
    )
};

type SpeechProps = {
    text: string;
};

function Speech({ text }: SpeechProps) {
    return (
        <Text font="/fonts/SpaceMono-Regular.ttf" 
            fontSize={0.5} 
            color="#ffffff" 
            anchorX="center" 
            anchorY="middle" 
            textAlign="center"
            position={[0, 1.5, 0]}
            maxWidth={8}
        >
            {text}
            <meshStandardMaterial color="#ffffff" />
        </Text>
    )
}