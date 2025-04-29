import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Stats, Text } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Scanline } from "@react-three/postprocessing";
import { folder, Leva, useControls } from "leva";

import Background from "./components/Background/Background";
import { useSceneNavigation } from "./stores/useSceneNavigation";

import { registerScenes } from "./scenes";
registerScenes();

const root = createRoot(document.getElementById("app")!);

root.render(
	<>
		<base href={import.meta.env.BASE_URL}></base>
		<App />
	</>
);

function App() {
	const currentScene = useSceneNavigation((state) => state.currentScene);
	const cameraRef = useSceneNavigation((state) => state.cameraRef);
	const isTransitioning = useSceneNavigation((state) => state.isTransitioning);
	const transitioningScene = useSceneNavigation((state) => state.transitioningScene);

	const lighting = useControls('Lighting', {
		ambientLight: folder({
			intensity: 5,
		}, { collapsed: true }),
	}, { collapsed: true });	

	return (
		<>
			<Leva oneLineLabels={true} />

			<Stats />

			<Canvas style={{ height: '100vh', width: '100vw' }}>
				<ambientLight intensity={lighting.intensity} />

				<Background />

				<PerspectiveCamera position={[0, 0, 6]} makeDefault ref={cameraRef}/>

				<Effects />
				
				{/* 
					scene component `key` is required to 
					prevent re-render when transitioning scenes.
				*/}
				{currentScene?.scene}
				{isTransitioning && transitioningScene?.scene}
			</Canvas>
		</>
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