import Alpine from 'alpinejs';
import '@picocss/pico';
import './styles.css';
import Swal from 'sweetalert2'

// A standalone function to create the entire audio engine at once.
async function createAudioEngine() {
    const Tone = await import('tone');
    await Tone.start();

    // Create the core audio nodes immediately after starting the context.
    const player = new Tone.Player({ loop: true });
    const pitchShift = new Tone.PitchShift().toDestination();
    player.connect(pitchShift);
    player.sync().start(0);
    return { Tone, player, pitchShift };
}

// Use a global flag to prevent the dev server's HMR from re-initializing the app
if (!window.isLehraPlayerInitialized) {

    Alpine.data('lehraPlayer', () => ({
        // --- State managed by Alpine ---
        tracks: [],
        availableTaals: [], // To dynamically generate buttons
        availableInstruments: [], // And for instruments
        selectedTaal: 'teental',
        selectedInstrument: 'santoor',
        selectedTrackFile: '',
        bpm: 0,
        semitoneOffset: 0,
        progress: 0,
        baseScale: '--', // The scale of the original track
        picoCssTheme: 'dark', // Default theme for Pico CSS

        // --- Non-reactive internal state ---
        Tone: null,
        player: null,
        pitchShift: null,
        originalBPM: 100,
        isLoading: false,
        isPlaying: false,

        // --- Computed Properties ---
        get filteredTracks() {
            if (!this.tracks.length) return [];

            return this.tracks.filter(t => {
                const taalMatch = t.taal === this.selectedTaal;
                const instrumentMatch = this.selectedInstrument === 'all' || t.instrument === this.selectedInstrument;
                return taalMatch && instrumentMatch;
            });
        },

        get currentPitchName() {
            if (this.baseScale === '--') return '--';

            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const baseIndex = notes.indexOf(this.baseScale.toUpperCase());
            if (baseIndex === -1) return this.baseScale; // Should not happen with good data

            let finalIndex = baseIndex + this.semitoneOffset;

            // Handle positive and negative wrapping around the octave
            finalIndex = ((finalIndex % 12) + 12) % 12;

            return notes[finalIndex];
        },

        // --- Methods ---
        init() {
            this.fetchTracks();

            // Expose component state to window for easier debugging
            window.playerState = this;
            this.progress = 0.0001;

            this.$watch('selectedTaal', () => this.handleFilterChange());
            this.$watch('selectedInstrument', () => this.handleFilterChange());
            this.$watch('selectedTrackFile', () => this.handleTrackChange());
            this.$watch('bpm', () => this.updatePlaybackRate());
            this.$watch('semitoneOffset', () => this.updatePlaybackRate());
        },

        async fetchTracks() {
            try {
                const response = await fetch('tracks.json');
                this.tracks = await response.json();

                // Dynamically populate the available Taals
                const taals = [...new Set(this.tracks.map(t => t.taal))];
                this.availableTaals = taals;
                if (taals.length > 0) {
                    this.selectedTaal = taals[0]; // Select the first one by default
                }

                // Dynamically populate the available Instruments
                const instruments = [...new Set(this.tracks.map(t => t.instrument))].sort();
                this.availableInstruments = ['all', ...instruments]; // Add 'all' to the beginning
                this.selectedInstrument = 'all'; // Default to 'all'

                this.handleFilterChange();
            } catch (error) {
                console.error('Failed to fetch tracks.json:', error);
                alert('Could not load tracks.json.');
            }
        },

        handleFilterChange() {
            // Per user request, stop playback immediately when filters change.
            if (this.Tone) {
                this.Tone.Transport.stop();
                this.isPlaying = false;
                this.progress = 0;
            }

            const availableTracks = this.filteredTracks;
            const currentSelectionStillValid = availableTracks.some(t => t.file === this.selectedTrackFile);

            // If the old selection is no longer valid, or if there's no selection,
            // then we should pick the first available track as a default.
            if (!currentSelectionStillValid) {
                if (availableTracks.length > 0) {
                    this.selectedTrackFile = availableTracks[0].file;
                } else {
                    this.selectedTrackFile = '';
                }
            }
        },

        handleTrackChange() {
            this.updateUIForTrackSelection();
            if (this.Tone) {
                this.loadLehra();
            }
        },

        updateUIForTrackSelection() {
            if (!this.selectedTrackFile) return;
            const trackData = this.tracks.find(t => t.file === this.selectedTrackFile);
            if (trackData) {
                this.originalBPM = trackData.bpm;
                this.bpm = trackData.bpm;
                this.baseScale = trackData.scale || '--';
                this.semitoneOffset = 0;
            }
        },

        async initializeAudio() {
            if (this.Tone) return;
            this.isLoading = true;

            try {
                // Call the standalone function to get the entire audio engine
                const engine = await createAudioEngine();
                this.Tone = engine.Tone;
                this.player = engine.player;
                this.pitchShift = engine.pitchShift;

                await this.loadLehra();
            } catch (e) {
                console.error("Failed to initialize audio:", e);
                if (e.name === 'InvalidStateError') {
                    alert("Audio failed to start. Please refresh the page and try again.");
                } else {
                    alert("An unexpected error occurred while setting up the audio.");
                }
            } finally {
                this.isLoading = false;
            }
        },

        async loadLehra() {
            if (!this.Tone || !this.selectedTrackFile) return;

            this.isLoading = true;
            this.isPlaying = false;
            this.Tone.Transport.stop();
            this.Tone.Transport.position = 0;
            this.progress = 0.0001;

            try {
                await this.player.load(`audio/${this.selectedTrackFile}`);
                this.updatePlaybackRate();
            } catch (e) {
                console.error('Error loading audio buffer:', e);
                Swal.fire({ theme:'dark', icon:'error', title: `Lehra/Nagma: ${this.selectedTrackFile} not available`, timer: 2000})
            } finally {
                this.isLoading = false;
            }
        },

        async togglePlayPause() {
            if (this.isLoading) return;

            // 1. Initialize audio if it's the very first click
            if (!this.Tone) {
                await this.initializeAudio();
                // After init, if player is loaded, start playback
                if (this.player && this.player.loaded) {
                    this.Tone.Transport.start();
                    this.isPlaying = true;
                    this.updateTimeline();
                }
                return;
            }

            // 2. Toggle between play and pause
            if (this.isPlaying) {
                this.Tone.Transport.pause();
                this.isPlaying = false;
            } else {
                this.Tone.Transport.start();
                this.isPlaying = true;
                this.updateTimeline();
            }
        },

        updatePlaybackRate() {
            if (this.player && this.player.loaded) {
                const playbackRate = this.bpm / this.originalBPM;
                const pitchCorrection = -12 * Math.log2(playbackRate);
                this.player.playbackRate = playbackRate;
                this.pitchShift.pitch = parseFloat(this.semitoneOffset) + pitchCorrection;
            }
        },

        updateTimeline() {
            if (!this.isPlaying) return;

            if (this.player && this.player.loaded) {
                const duration = this.player.buffer.duration / this.player.playbackRate;
                this.progress = ((this.Tone.Transport.seconds % duration) / duration) * 100;
            }

            requestAnimationFrame(() => this.updateTimeline());
        }
    }));

    Alpine.start();

    window.isLehraPlayerInitialized = true;
}