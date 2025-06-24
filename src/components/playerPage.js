import { capitalize, Toast } from '../utils';
import Alpine from 'alpinejs';

// A standalone function to create the entire audio engine at once.
async function createAudioEngine() {
    const toneLib = await import('tone');
    await toneLib.start();

    const player = new toneLib.Player({ loop: true });
    const pitchShift = new toneLib.PitchShift().toDestination();
    player.connect(pitchShift);
    player.sync().start(0);
    return { toneLib, player, pitchShift };
}

export const playerPageComponent = () => ({
    tracks: Alpine.$persist([]),
    track: null,
    bpm: 0,
    semitoneOffset: 0,
    progress: 0,
    currentTime: 0,
    duration: 0,

    tone: null,
    player: null,
    pitchShift: null,
    originalBPM: 100,
    isLoading: false,
    isPlaying: false,

    get currentPitchName() {
        if (!this.track) return '--';
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const baseIndex = notes.indexOf(this.track.scale.toUpperCase());
        if (baseIndex === -1) return this.track.scale;

        let finalIndex = baseIndex + this.semitoneOffset;
        finalIndex = ((finalIndex % 12) + 12) % 12;

        return notes[finalIndex];
    },
    capitalize: capitalize,

    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '00:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    async init() {
        await this.ensureTracksLoaded();
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        this.track = this.tracks.find(t => String(t.id) === String(id));
        if (this.track) {
            this.bpm = this.track.bpm;
            this.originalBPM = this.track.bpm;
        }
        this.$watch('bpm', () => this.updatePlaybackRate());
        this.$watch('semitoneOffset', () => this.updatePlaybackRate());

        window.playerPage = this; // For debugging
    },

    async ensureTracksLoaded() {
        if (this.tracks.length > 0) return;
        try {
            const response = await fetch('/tracks.json');
            this.tracks = await response.json();
        } catch (error) {
            console.error('Failed to fetch tracks.json for player:', error);
        }
        this.currentTime = 0;
        try {
            const audioUrl = `/audio/${this.track.file}`;
            const cacheName = `riyaazz-audio-cache-${this.appVersion}`;
            const cache = await window.caches.open(cacheName);
            let response = await cache.match(audioUrl);
            let fetchedFromNetwork = false;

            if (!response) {
                fetchedFromNetwork = true;
                response = await fetch(audioUrl);
                if (response && response.ok) {
                    await cache.put(audioUrl, response.clone());
                } else {
                    throw new Error(`Failed to fetch audio file: ${response.statusText}`);
                }
            }

            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.tone.getContext().decodeAudioData(arrayBuffer);
            this.player.buffer = audioBuffer;

            if (fetchedFromNetwork) {
                Toast('Lehra saved for offline use.');
            }

            this.duration = this.player.buffer.duration;
            this.tone.Transport.loopEnd = this.duration;
            this.tone.Transport.loop = true;
            this.updatePlaybackRate();
        } catch (e) {
            console.error('Error loading audio buffer:', e);
            Toast('Failed to load audio.', { icon: 'error' });
        } finally {
            this.isLoading = false;
        }
    },

    async initializeAudio() {
        if (this.tone) return;
        this.isLoading = true;
        try {
            const engine = await createAudioEngine();
            this.tone = engine.toneLib;
            this.player = engine.player;
            this.pitchShift = engine.pitchShift;
            await this.loadLehra();
        } catch (e) {
            console.error("Failed to initialize audio:", e);
        } finally {
            this.isLoading = false;
        }
    },

    async loadLehra() {
        if (!this.player || !this.track) return;
        this.isLoading = true;
        this.isPlaying = false;
        this.tone.Transport.stop();
        this.tone.Transport.position = 0;
        this.progress = 0;
        this.currentTime = 0;
        try {
            await this.player.load(`/audio/${this.track.file}`);
            this.duration = this.player.buffer.duration;
            this.tone.Transport.loopEnd = this.duration;
            this.tone.Transport.loop = true;
            this.updatePlaybackRate();
        } catch (e) {
            console.error('Error loading audio buffer:', e);
            Toast('Failed to load audio.', { icon: 'error' });
        } finally {
            this.isLoading = false;
        }
    },

    async togglePlayPause() {
        if (this.isLoading) return;
        if (!this.tone) await this.initializeAudio();
        if (!this.player || !this.player.loaded) return;

        if (this.isPlaying) {
            this.tone.Transport.pause();
        } else {
            this.tone.Transport.start();
            requestAnimationFrame(() => this.updateTimeline());
        }
        this.isPlaying = !this.isPlaying;
    },

    updateTimeline() {
        if (!this.isPlaying || !this.player || !this.player.loaded) return;

        this.progress = this.tone.Transport.progress * 100;
        this.currentTime = this.tone.Transport.seconds;
        
        requestAnimationFrame(() => this.updateTimeline());
    },

    seek() {
        if (!this.player || !this.player.loaded) return;
        const newTime = (this.player.buffer.duration / 100) * this.progress;
        this.tone.Transport.seconds = newTime;
    },

    updatePlaybackRate() {
        if (this.player && this.player.loaded) {
            const playbackRate = this.bpm / this.originalBPM;
            this.player.playbackRate = playbackRate;
            const pitchCorrection = -12 * Math.log2(playbackRate);
            this.pitchShift.pitch = this.semitoneOffset + pitchCorrection;
        }
    },

    changeScale(delta) {
        this.semitoneOffset += delta;
    },

    changeBpm(delta) {
        this.bpm = Math.max(20, this.bpm + delta);
    },

    destroy() {
        if (this.tone && this.player) {
            this.tone.Transport.stop();
            this.player.unsync();
            this.tone.Transport.cancel(0);
            this.player.dispose();
            this.pitchShift.dispose();
            this.tone = null;
            this.player = null;
            this.pitchShift = null;
            this.isPlaying = false;
        }
    }
});