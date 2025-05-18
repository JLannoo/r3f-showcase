import { useEffect, useRef, useState } from "react";
import { Texture } from "three";
import { useThree } from "@react-three/fiber";

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

function renderToTexture(text: string, sizeX: number, sizeY: number, rows: number, cols: number, color: string, backgroundColor: string) {
	const canvas = document.createElement("canvas");
	canvas.width = sizeX;
	canvas.height = sizeY;
	const ctx = canvas.getContext("2d")!;

	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, sizeX, sizeY);

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
	texture.colorSpace = "srgb";
	return texture;
}

/**
 * Custom hook to create a dynamic background texture
 * that updates with random characters.
 *
 * Has `Leva` controls for customization.
 */
export default function useBackground() {
	const [texture, setTexture] = useState<Texture>(null!);

	const aspect = useRef<number>(1);

	const { scene } = useThree();

	const controls = useControls("Background", {
		backgroundColor: "#050505",
		textColor: "#0e0e0e",
		resolution: 512,
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

		return () => {
			clearInterval(interval);
			texture?.dispose();
			scene.background = null;
		};
	}, [controls]);

	useEffect(() => {
		const newTexture = renderToTexture(
			text,
			controls.resolution * aspect.current,
			controls.resolution,
			controls.characterRows,
			controls.characterCols,
			controls.textColor,
			controls.backgroundColor,
		);

		setTexture((oldTexture) => {
			oldTexture?.dispose();
			return newTexture;
		});

		return () => {
			texture?.dispose();
		};
	}, [text]);

	useEffect(() => {
		const onResize = () => {
			const newAspect = window.innerWidth / window.innerHeight;
			if (aspect.current) {
				aspect.current = newAspect;
			}
		};

		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	useEffect(() => {
		scene.background = texture;
	}, [texture]);
}