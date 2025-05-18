import gsap from "gsap";
import { createRef, ReactNode, RefObject } from "react";
import { PerspectiveCamera } from "three";
import { create } from "zustand";

type SceneOptions = {
    scene: ReactNode;
    name: string;
    description: string;
    path: string;

    cameraPosition: [number, number, number];
    cameraRotation: [number, number, number];
}

type SceneHistoryState = {
    scene: {
        path: string;
    }
}

export class Scene {
	scene: ReactNode;
	name: string;
	description: string;
	path: string;

	cameraRotation: [number, number, number];
	cameraPosition: [number, number, number];

	constructor(options: SceneOptions) {
		this.scene = options.scene;
		this.name = options.name;
		this.description = options.description;
		this.path = options.path;

		this.cameraPosition = options.cameraPosition;
		this.cameraRotation = options.cameraRotation;
	}
}

interface SceneNavigationStore {
    scenes: Record<string, Scene>;
    currentScene: Scene | null;
    currentScenePath: string;
    cameraRef: RefObject<PerspectiveCamera | null>;
    transitionTime: number;
    isTransitioning: boolean;
    transitioningScene: Scene | null;
    tweens: gsap.core.Tween[];

    go: (sceneId: string, option?: GoSceneOptions) => void;
    next: () => void;
    previous: () => void;

    registerScene: (scene: Scene) => void;
}

type GoSceneOptions = {
    createHistory?: boolean;
    transitionTime?: number;
}


export const useSceneNavigation = create<SceneNavigationStore>((set, get) => ({
	currentScenePath: window.location.pathname || "/",
	currentScene: null,
	scenes: {},
	cameraRef: createRef<PerspectiveCamera>(),
	transitionTime: 2,
	isTransitioning: false,
	transitioningScene: null,
	tweens: [],

	go: (scenePath: string, options: GoSceneOptions = { createHistory: true }) => {
		const { scenes, cameraRef, transitionTime, currentScene, tweens, go } = get();

		let tTime = options.transitionTime ?? transitionTime;

		const scene = scenes[scenePath];

		if(!scene) {
			console.warn(`Scene at ${scenePath} not found.`);
			return;
		}

		if(currentScene?.path !== scenePath) {
			set({ transitioningScene: scene, isTransitioning: true });
		}

		if(tweens.length) {
			tweens.forEach((tween) => tween.kill());
			set({ tweens: [] });
		}


		const { cameraPosition, cameraRotation } = scene;
		if (cameraRef.current) {
			const positionTween = gsap.to(cameraRef.current.position, {
				x: cameraPosition[0],
				y: cameraPosition[1],
				z: cameraPosition[2],
				duration: tTime,
				ease: "power3.out",
				onComplete: () => {
					set({
						currentScene: scene,
						currentScenePath: scene.path,
						isTransitioning: false,
						transitioningScene: null,
						tweens: [],
					});
				}
			});
			const rotationTween = gsap.to(cameraRef.current.rotation, {
				x: cameraRotation[0],
				y: cameraRotation[1],
				z: cameraRotation[2],
				duration: tTime,
				ease: "power3.out",
			});

			set({ tweens: [positionTween, rotationTween] });
		} else {
			// Wait for scene to load
			setTimeout(() => {
				go(scenePath, { createHistory: options.createHistory, transitionTime: tTime });
			}, 1000);
			return;
		}

		const historyData: SceneHistoryState = {
			scene: {
				path: scenePath,
			},
		};

		if(options?.createHistory) {
			history.pushState(historyData, "", scene.path);
		}
		document.title = scenes[scenePath].name;
		document.body.style.cursor = "auto";
	},
	next: () => {
		const { currentScene, scenes, go } = get();
		const sceneKeys = Object.keys(scenes);
		const currentSceneIndex = sceneKeys.findIndex((key) => scenes[key].path === currentScene?.path);
		const nextIndex = (currentSceneIndex + 1) % sceneKeys.length;
		const nextScene = scenes[sceneKeys[nextIndex]];

		go(nextScene.path);
	},
	previous: () => {
		const { currentScene, scenes, go } = get();
		const sceneKeys = Object.keys(scenes);
		const currentSceneIndex = sceneKeys.findIndex((key) => scenes[key].path === currentScene?.path);
		const previousIndex = (currentSceneIndex - 1 + sceneKeys.length) % sceneKeys.length;
		const previousScene = scenes[sceneKeys[previousIndex]];

		go(previousScene.path);
	},

	registerScene: (scene: Scene) => {
		const { currentScenePath, scenes, go } = get();

		console.log(`Registering scene '${scene.name}' at ${scene.path}`);

		if (scenes[scene.path]) {
			console.warn(`Scene with path ${scene.path} already exists. Overwriting.`);
		}

		set({ scenes: { ...scenes, [scene.path]: scene } });

		// First render
		if(currentScenePath == "/" && Object.keys(get().scenes).length === 1) {
			history.replaceState({ scene: { path: scene.path } }, "", scene.path);
			go(scene.path, { createHistory: false, transitionTime: 0 });
		} else if(currentScenePath === scene.path) {
			go(scene.path, { createHistory: false, transitionTime: 0 });
		}
	},
}));

window.addEventListener("popstate", (e) => {
	const { go, tweens, transitioningScene, currentScene } = useSceneNavigation.getState();
	const { scene } = e.state as SceneHistoryState;

	if(tweens.length) {
		tweens.forEach((tween) => tween.kill());
		useSceneNavigation.setState({
			tweens: [],
			isTransitioning: false,
			transitioningScene: currentScene,
			currentScene: transitioningScene,
			currentScenePath: transitioningScene?.path ?? "/",
		});
	}

	if(scene.path) {
		go(scene.path, { createHistory: false });
	} else {
		go("/", { createHistory: false });
	}
});

