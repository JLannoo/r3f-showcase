import gsap from "gsap";
import { createRef, ReactNode, RefObject } from "react";
import { PerspectiveCamera } from "three";
import { create } from "zustand";

type SceneOptions = {
    id: string;
    scene: ReactNode;
    name: string;
    description: string;
    path: string;

    cameraPosition: [number, number, number];
    cameraRotation: [number, number, number];
}

type SceneHistoryState = {
    scene: {
        id: string;
    }
}

export class Scene {
    id: string;
    scene: ReactNode;
    name: string;
    description: string;
    path: string;

    cameraRotation: [number, number, number];
    cameraPosition: [number, number, number];

    constructor(options: SceneOptions) {
        this.id = options.id;
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
    currentScenePath: "/",
    currentScene: null,
    scenes: {},
    cameraRef: createRef<PerspectiveCamera>(),
    transitionTime: 2,
    isTransitioning: false,
    transitioningScene: null,

    go: (sceneId: string, options: GoSceneOptions = { createHistory: true }) => {
        const { scenes, cameraRef, transitionTime, currentScene } = get();

        let tTime = options.transitionTime ?? transitionTime;

        if(sceneId === currentScene?.id) {
            console.warn(`Already in scene ${sceneId}.`);
            return;
        }

        const scene = scenes[sceneId];
        if(!scene) {
            console.warn(`Scene with id ${sceneId} not found.`);
            return;
        }

        set({ transitioningScene: scene, isTransitioning: true });
        
        const { cameraPosition, cameraRotation } = scene;
        if (cameraRef.current) {
            gsap.to(cameraRef.current.position, {
                x: cameraPosition[0],
                y: cameraPosition[1],
                z: cameraPosition[2],
                duration: tTime,
                ease: "power3.out",
                onComplete: () => {
                    set({ currentScene: scene, currentScenePath: scene.path, isTransitioning: false });
                }
            });
            gsap.to(cameraRef.current.rotation, {
                x: cameraRotation[0],
                y: cameraRotation[1],
                z: cameraRotation[2],
                duration: tTime,
                ease: "power3.out",
            });
        } else {
            set({ currentScene: scene, currentScenePath: scene.path, isTransitioning: false });
        }

        const historyData: SceneHistoryState = {
            scene: {
                id: sceneId,
            },
        };

        if(options?.createHistory) {
            history.pushState(historyData, "", scene.path);
        }
        document.title = scenes[sceneId].name;
        document.body.style.cursor = "auto";
    },
    next: () => {
        const { currentScene, scenes, go } = get();
        const sceneKeys = Object.keys(scenes);
        const currentSceneIndex = sceneKeys.findIndex((key) => scenes[key].id === currentScene?.id);
        const nextIndex = (currentSceneIndex + 1) % sceneKeys.length;
        const nextScene = scenes[sceneKeys[nextIndex]];
        
        go(nextScene.id);
    },
    previous: () => {
        const { currentScene, scenes, go } = get();
        const sceneKeys = Object.keys(scenes);
        const currentSceneIndex = sceneKeys.findIndex((key) => scenes[key].id === currentScene?.id);
        const previousIndex = (currentSceneIndex - 1 + sceneKeys.length) % sceneKeys.length;
        const previousScene = scenes[sceneKeys[previousIndex]];
        
        go(previousScene.id);
    },
    
    registerScene: (scene: Scene) => {
        const { scenes, go } = get();

        console.log(`Registering scene '${scene.name}' with id ${scene.id} at path ${scene.path}`);

        if (scenes[scene.id]) {
            console.warn(`Scene with id ${scene.id} already exists. Overwriting.`);
        }

        set({ scenes: { ...scenes, [scene.id]: scene } });
        
        // First render
        if(Object.keys(get().scenes).length === 1) {
            history.replaceState({ scene: { id: scene.id } }, "", scene.path);
            go(scene.id, { createHistory: false, transitionTime: 0 });
        }
    },
}));

window.addEventListener("popstate", (e) => {
    const { scene } = e.state as SceneHistoryState;
    
    const { go } = useSceneNavigation.getState();
    if(scene.id) {
        go(scene.id, { createHistory: false });
    } else {
        go("/", { createHistory: false });
    }
});

