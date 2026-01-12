import * as Tone from "tone";

export class AudioPlayer {
    private synth: Tone.PolySynth | null = null;
    private isInitialized = false;

    async initialize() {
        if (this.isInitialized) return;

        await Tone.start();
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 },
        }).toDestination();

        this.isInitialized = true;
    }

    playChord(notes: string[], duration: string = "1n") {
        if (!this.synth) return;
        // Add octave if missing (Tonal returns pitch classes often)
        const notesWithOctave = notes.map(n => {
            // Simple check if it has octave number. 
            // Regex for note name + optional accidentals + octave number
            if (/\d$/.test(n)) return n;
            return `${n}4`; // Default to 4th octave
        });

        this.synth.triggerAttackRelease(notesWithOctave, duration);
    }

    playMelody(notes: { note: string; duration: string; time: number }[]) {
        if (!this.synth) return;

        const now = Tone.now();
        notes.forEach(({ note, duration, time }) => {
            this.synth?.triggerAttackRelease(note, duration, now + time);
        });
    }

    stop() {
        // interactions with transport if we used it
        Tone.Transport.stop();
        this.synth?.releaseAll();
    }
}

export const player = new AudioPlayer();
