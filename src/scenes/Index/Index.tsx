import { useMemo, useRef, useState } from "react";
import { Mesh, MeshStandardMaterial } from "three";
import gsap from "gsap";

import { useControls } from "leva";
import { Html, Text } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";

import Dotti from "../../components/Dotti/Dotti";
import StoreMonitor from "../../components/StoreMonitor/StoreMonitor";

import { Scene, useSceneNavigation } from "../../stores/useSceneNavigation";
import { useDottiSpeech } from "../../stores/useDottiSpeech";

const BUTTONS = [
	{ label: "Button 1", action: () => console.log("Button 1 clicked") },
	{ label: "Button 2", action: () => console.log("Button 2 clicked") },
	{ label: "Button 3", action: () => console.log("Button 3 clicked") },
	{ label: "Button 4", action: () => console.log("Button 4 clicked") },
];

function Index() {
	return (
		<>
			<Html fullscreen pointerEvents='none' className='pointer-events-none'>
				<StoreMonitor title="Dotti" store={useDottiSpeech} className='left-60' />
			</Html>
			<Dotti />
			<Buttons />
		</>
	);
}

function Buttons() {
	const [positions, setPositions] = useState<[number, number, number][]>(BUTTONS.map(() => [0, 0, 0]));
	const [rotations, setRotations] = useState<[number, number, number][]>(BUTTONS.map(() => [0, 0, 0]));
	const refs = Array.from({ length: BUTTONS.length }, () => useRef<Mesh>(null));

	const go = useSceneNavigation((state) => state.go);

	const controls = useControls("Buttons", {
		distance: 1.7,
		pointerInfluence: 0.1,
		buttonSize: 0.2,
		color: "#ffffff",
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
			};
		});

		setPositions(newPositions.map(pos => pos.position));
		setRotations(newPositions.map(pos => pos.rotation));
	});

	function pointerEnter(e: ThreeEvent<PointerEvent>, index: number) {
		e.stopPropagation();
		document.body.style.cursor = "pointer";

		if(!refs[index].current) return;
		gsap.to(refs[index].current.scale, {
			x: 1.1,
			y: 1.1,
			z: 1.1,
			duration: 0.5,
			ease: "power3.out",
		});
		gsap.to(refs[index].current.material, {
			emissiveIntensity: 0.005,
			duration: 0.5,
			ease: "power3.out",
		});
	}

	function pointerLeave(e: ThreeEvent<PointerEvent>, index: number) {
		e.stopPropagation();
		document.body.style.cursor = "auto";

		if(!refs[index].current) return;
		gsap.to(refs[index].current.scale, {
			x: 1,
			y: 1,
			z: 1,
			duration: 0.5,
			ease: "power3.out",
		});
		gsap.to(refs[index].current.material, {
			emissiveIntensity: 0.001,
			duration: 0.5,
			ease: "power3.out",
		});
	}

	const textMaterial = useMemo(() => new MeshStandardMaterial({
		color: 0xffffff,
		emissive: 0xffffff,
		emissiveIntensity: 0.001,
	}), []);

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
					onClick={() => go("/test")}
					onPointerEnter={(e) => pointerEnter(e, index)}
					onPointerLeave={(e) => pointerLeave(e, index)}
					ref={refs[index]}
					material={textMaterial}
				>
					{button.label}
				</Text>;
			})}
		</>
	);
}

const scene = new Scene({
	path: "/",
	name: "Index",
	description: "Index scene",
	scene: <Index key="index"/>,
	cameraPosition: [0, 0, 6],
	cameraRotation: [0, 0, 0],
});

export default scene;
