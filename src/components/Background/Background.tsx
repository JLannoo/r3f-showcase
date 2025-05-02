import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Texture } from "three";
import { useFrame } from "@react-three/fiber";

import { useControls } from "leva";

const AVAILABLE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";

function randomChar() {
	return AVAILABLE_CHARACTERS.charAt(Math.floor(Math.random() * AVAILABLE_CHARACTERS.length));
}

function replaceRandomChars(text: string, quantity: number) {
	const charArray = text.split("");
	for (let i = 0; i < quantity; i++) {
		const index = Math.floor(Math.random() * charArray.length);
		charArray[index] = randomChar();
	}
	return charArray.join("");
}

function renderToTexture(text: string, sizeX: number, sizeY: number, rows: number, cols: number, color: string) {
	const canvas = document.createElement("canvas");
	canvas.width = sizeX;
	canvas.height = sizeY;
	const ctx = canvas.getContext("2d")!;

	ctx.clearRect(0, 0, sizeX, sizeY);

	ctx.fillStyle = color;
	ctx.font = `${sizeY/rows}px Space Mono`;
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";

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

	const ref = useRef<Group>(null!);

	const controls = useControls("Background", {
		backgroundColor: "#050505",
		textColor: "#0e0e0e",
		characterCols: 60,
		characterRows: 40,
		replaceQuantity: 100,
		replaceTime: 100,
	}, { collapsed: true });

	const [text, setText] = useState(
		Array(controls.characterCols*controls.characterRows)
			.fill("")
			.map(() => randomChar())
			.join("")
	);

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
			512,
			512,
			controls.characterRows,
			controls.characterCols,
			controls.textColor,
		);
		setTexture(newTexture);

		return () => {
			texture?.dispose();
		};
	}, [text]);

	const plane = useMemo(() => <planeGeometry args={[25, 25]} />, []);

	useFrame((state) => {
		const { camera } = state;
		if(ref.current) {
			ref.current.position.set(camera.position.x, camera.position.y, camera.position.z);
			ref.current.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z);
		}
	});

	return (
		<group ref={ref}>
			<mesh position={[0, 0, -18]}>
				{plane}
				<meshBasicMaterial color={controls.backgroundColor}/>
			</mesh>
			{/*
                The conditional rendering forces the component to at least render the plain background.
                Otherwise, the component will wait for the texture to be created.
                If it is not added on the first render of <App /> the renderer will never take its updates into account.
            */}
			{texture && (
				<mesh position={[0, 0, -17.99]}>
					{plane}
					<meshBasicMaterial map={texture} transparent={true}/>
				</mesh>
			)}
		</group>
	);
}