const AUDIO_EFFECTS = {
    DOTTI_SPEECH: 'audio/dotti/speech.mp3',
}
export type AudioEffect = keyof typeof AUDIO_EFFECTS;

class AudioManager {
    private audioContext: AudioContext;
    private gainNode: GainNode;
    private isMuted: boolean;
    private audioBufferCache: Map<string, AudioBuffer> = new Map();

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.isMuted = false;
    }

    private playSound(buffer: AudioBuffer) {
        if (this.isMuted) return;

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.gainNode);
        source.start(0);
    }

    private async loadSound(url: string): Promise<AudioBuffer> {
        return new Promise((resolve, reject) => {
            if (this.audioBufferCache.has(url)) {
                resolve(this.audioBufferCache.get(url)!);
                return;
            }

            fetch(url)
                .then(response => response.arrayBuffer())
                .then(data => this.audioContext.decodeAudioData(data))
                .then(buffer => {
                    this.audioBufferCache.set(url, buffer);
                    resolve(buffer);
                })
                .catch(error => {
                    console.error('Error loading sound:', error);
                    reject(error);
                });
        });
    }

    public mute() {
        this.isMuted = true;
        this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    }

    public unmute() {
        this.isMuted = false;
        this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    }

    public playEffect(effect: AudioEffect) {
        if (this.isMuted) return;

        const url = AUDIO_EFFECTS[effect];
        if(!this.audioBufferCache.has(url)) {
            this.loadSound(url).then(buffer => this.playSound(buffer));
        } else {
            const buffer = this.audioBufferCache.get(url);
            if (buffer) {
                this.playSound(buffer);
            }
        }
    }

    public isAbleToPlay() {        
        return this.audioContext.state === 'running';
    }

    public resume() {
        return this.audioContext.resume();
    }
}


export default new AudioManager();