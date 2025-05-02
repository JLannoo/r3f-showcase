import { Text } from "@react-three/drei";
import { Scene } from "../../stores/useSceneNavigation";
import { Vector3 } from "three";

const SCENE_POSITION = new Vector3(10, 0, 0);

function Test() {
	return (
		<group position={SCENE_POSITION}>
			<Text>
                Test
			</Text>
		</group>
	);
}

const scene = new Scene({
	id: "test",
	scene: <Test key="test"/>,
	name: "Test",
	description: "Test",
	path: "/test",
	cameraPosition: [SCENE_POSITION.x, 0, 6],
	cameraRotation: [0, 0, 0],
});

export default scene;