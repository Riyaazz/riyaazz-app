import Alpine from 'alpinejs';

export const tracksComponent = () => ({
    tracks: Alpine.$persist([]),
    availableTaals: [],
    availableInstruments: [],
    selectedTaal: 'teental',
    selectedInstrument: 'santoor',

    get filteredTracks() {
        if (!this.tracks.length) return [];
        return this.tracks.filter(t => {
            const taalMatch = t.taal === this.selectedTaal;
            const instrumentMatch = this.selectedInstrument === 'all' || t.instrument === this.selectedInstrument;
            return taalMatch && instrumentMatch;
        });
    },

    async init() {
        await this.fetchTracks();
        this.populateFilters();
        window.tracks = this; // For debugging
    },
    async fetchTracks() {
        if (this.tracks.length > 0) return;
        try {
            const response = await fetch('tracks.json');
            this.tracks = await response.json();
        } catch (error) {
            console.error('Failed to fetch tracks.json:', error);
        }
    },
    populateFilters() {
        if (!this.tracks.length) return;
        const taals = [...new Set(this.tracks.map(t => t.taal))];
        this.availableTaals = taals;
        if (taals.length > 0) {
            this.selectedTaal = taals[0];
        }
        const instruments = [...new Set(this.tracks.map(t => t.instrument))].sort();
        this.availableInstruments = ['all', ...instruments];
        this.selectedInstrument = 'all';
    }
});
