import * as THREE from 'three';
(window as any).THREE = THREE;
// import {general_folding_scene} from './scenes/paper_folding';
// import { general_folding_scene } from './scenes/paper_folding_2';
import { general_folding_scene } from './scenes/paper_folding_3';
import { rotating_cube_scene } from './scenes/rotating_cube';
import { test_touch_controls_scene } from './scenes/touch_controls_testing';
import { clipping_plane_demo } from './scenes/clipping_plane_demo';
import { business_card } from './scenes/business_card';
import { build_thing_scene, build_thing_from_seed, paper_plane_scene } from './scenes/build_thing';
import { msdf_test } from './scenes/msdf-test';
import { seigaiha_demo } from './scenes/shader_textures';

type SceneKey = '0' //'1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0';
const DEFAULT_SCENE_KEY: SceneKey = '0';

// Find the div with id 'GameView'
const gameView = document.getElementById('GameView') as HTMLDivElement;

export type SceneFunctions = {
    update_scene: () => void;
    camera: THREE.PerspectiveCamera;
    resetter: () => void;
};

const main = (scene_fn: (renderer) => SceneFunctions) => {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.localClippingEnabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    gameView.appendChild(renderer.domElement);

    const { update_scene, camera, resetter } = scene_fn(renderer); //rotating_cube_scene();
    const on_resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    };

    const animate = () => {
        requestAnimationFrame(animate);
        update_scene();
    };
    animate();

    // Adjust the scene when the window is resized
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        on_resize();
    });

    const reset = () => {
        // remove the renderer from the DOM
        gameView.removeChild(renderer.domElement);
        // remove all event listeners
        window.removeEventListener('resize', on_resize);
        document.removeEventListener('keydown', resetter);

        resetter();
    };
    return reset;
};

type SceneFactory = (renderer: THREE.WebGLRenderer) => SceneFunctions;

const scene_selector_main = () => {
    // listen for buttonpresses and reset everything if a button is pressed
    // if user presses 1 on keyboard, then run rotating_cube_scene, if 2, then run paper_folding_scene, etc.

    // prettier-ignore
    const scenes: SceneFactory[] = [business_card]
    console.assert(scenes.length <= 10, 'Too many scenes included. Extra scenes will not be accessible via keyboard shortcuts.');
    const scene_button_map: Map<SceneKey, SceneFactory> = new Map<SceneKey, SceneFactory>();
    scenes.forEach((scene, i) => {
        const key = i.toString() as SceneKey;
        scene_button_map.set(key, scene);
    });

    // default call scene
    let resetter = main(scene_button_map.get(DEFAULT_SCENE_KEY));

    // event listener for keypresses
    document.addEventListener('keydown', (event) => {
        const key = event.key as SceneKey;
        if (scene_button_map.has(key)) {
            resetter();
            resetter = main(scene_button_map.get(key));
        }
    });
};

// must be called last
scene_selector_main();
// main();
