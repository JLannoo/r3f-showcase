import { create } from "zustand";

import AudioManager from "../lib/AudioManager/AudioManager";

type SpeechOptions = {
    speed?: number;
    waitStart?: number;
    waitEnd?: number;
}

interface DottiSpeechStore {
    canSpeak: boolean;
    isSpeaking: boolean;
    partialText: string;
    fullText: string;
    interval: number | null;
    speed: number;


    speak: (text: string, options?: SpeechOptions) => Promise<void>;
    wait: (ms: number) => Promise<void>;
    mute: () => void;
}

export const useDottiSpeech = create<DottiSpeechStore>((set, get) => ({
    canSpeak: false,
    isSpeaking: false,
    partialText: "",
    fullText: "",
    interval: null,
    speed: 100,
    queue: [],

    speak: async (text: string, options?: SpeechOptions) => {
        return new Promise<void>(async (resolve) => {
            // If the AudioManager is not able to play, show a message and wait for user interaction
            if(!AudioManager.isAbleToPlay()) {    
                set({ partialText: "Click me!"});
    
                window.addEventListener("click", async () => {
                    // Start post-interaction
                    await AudioManager.resume();
                    await get().speak(text, {...options, waitStart: 0 });

                    // Once user interaction and original call is done
                    resolve();
                }, { once: true });
                return;
            };

            // Wait pre-speech
            if(options?.waitStart) {
                await get().wait(options.waitStart);
            }
    
            // Override current speech
            if(get().interval) {
                clearInterval(get().interval!);
                set({ isSpeaking: false, partialText: "" });
            }                        
            
            // Start
            const interval = setInterval(async () => {
                const state = get();
                if (state.partialText.length < text.length) {
                    AudioManager.playEffect("DOTTI_SPEECH");
                    set({ partialText: state.partialText + text[state.partialText.length] });
                } else {
                    // End
                    clearInterval(interval);
                    set({ isSpeaking: false });

                    // Wait post-speech
                    if(options?.waitEnd) {
                        await get().wait(options.waitEnd);
                    }

                    resolve();
                }
            }, options?.speed ?? get().speed);
            
            set({ isSpeaking: true, fullText: text, partialText: "", interval: interval });

        });
    },
    wait: (ms: number) => {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    },
    mute: () => {
        AudioManager.mute();
        set({ canSpeak: false });
    },
}));

