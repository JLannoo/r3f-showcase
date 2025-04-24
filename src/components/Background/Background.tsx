import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import { useEffect, useState } from 'react';
import { Texture } from 'three';

const AVAILABLE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';

function randomChar() {
    return AVAILABLE_CHARACTERS.charAt(Math.floor(Math.random() * AVAILABLE_CHARACTERS.length));
}

function replaceRandomChars(text: string, quantity: number) {
    const charArray = text.split('');
    for (let i = 0; i < quantity; i++) {
        const index = Math.floor(Math.random() * charArray.length);
        charArray[index] = randomChar();
    }
    return charArray.join('');
}

function renderToTexture(text: string, sizeX: number, sizeY: number, rows: number, cols: number, color: string) {
    const canvas = document.createElement('canvas');
    canvas.width = sizeX;
    canvas.height = sizeY;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, sizeX, sizeY);

    ctx.fillStyle = color;
    ctx.font = `${sizeY/rows}px Space Mono`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';    
    
    for(let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const x = (j + 0.5) * (sizeX / cols);
            const y = (i + 0.5) * (sizeY / rows);
            ctx.fillText(text[i * cols + j], x, y);
        }
    }

    const texture = new Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export default function Background() {
    const [texture, setTexture] = useState<Texture>(null!);

    const controls = useControls('Background', {
        backgroundColor: '#050505',
        textColor: '#0e0e0e',
        characterCols: 60,
        characterRows: 40,
        replaceQuantity: 100,
        replaceTime: 100,
    }, { collapsed: true });

    const [text, setText] = useState(
        Array(controls.characterCols*controls.characterRows)
            .fill('')
            .map(() => randomChar())
            .join('')
    )
        
    useEffect(() => {
        const interval = setInterval(() => {            
            setText((prevText) => {
                return replaceRandomChars(prevText, controls.replaceQuantity);
            });
        }, controls.replaceTime);

        return () => clearInterval(interval);
    }, [controls]);

    useEffect(() => {
        const newTexture = renderToTexture(
            text,
            window.innerWidth,
            window.innerHeight,
            controls.characterRows,
            controls.characterCols,
            controls.textColor,
        );
        setTexture(newTexture);

        return () => {
            texture?.dispose();
        };
    }, [text]);    

    return (
        <group position={[0, 0, -10]}>
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[25, 25]} />
                <meshBasicMaterial color={controls.backgroundColor}/>
            </mesh>
            <mesh position={[0, 0, 0.01]}>
                <planeGeometry args={[25, 25]} />
                <meshBasicMaterial map={texture} transparent={true}/>
            </mesh>
        </group>
    );
}