import { useSceneNavigation } from "../stores/useSceneNavigation";

import Index from "./Index/Index";
import Test from "./Test/test";

export function registerScenes() {
	const scenes = [
		Index,
		Test,
	];

	scenes.forEach((scene) => {
		useSceneNavigation.getState().registerScene(scene);
	});
}