import { Note, Chord, Key, Scale, Mode } from "tonal";

export interface ChordSuggestion {
    chord: string;
    notes: string[];
    type: "diatonic" | "modal" | "jazz" | "borrowed";
    fit: number; // 0-1 score
}

export interface BarChord {
    bar: number;
    beat: number;
    chord: string;
    alternatives: string[];
}

export interface HarmonizationResult {
    chords: BarChord[];
    key: string;
    scale: string;
    mode: string;
}

// Common modes and their chord qualities
const MODE_CHORDS: Record<string, string[]> = {
    ionian: ["maj7", "m7", "m7", "maj7", "7", "m7", "m7b5"],
    dorian: ["m7", "m7", "maj7", "7", "m7", "m7b5", "maj7"],
    phrygian: ["m7", "maj7", "7", "m7", "m7b5", "maj7", "m7"],
    lydian: ["maj7", "7", "m7", "m7b5", "maj7", "m7", "m7"],
    mixolydian: ["7", "m7", "m7b5", "maj7", "m7", "m7", "maj7"],
    aeolian: ["m7", "m7b5", "maj7", "m7", "m7", "maj7", "7"],
    locrian: ["m7b5", "maj7", "m7", "m7", "maj7", "7", "m7"],
};

// Jazz chord extensions
const JAZZ_EXTENSIONS = ["9", "11", "13", "add9", "6/9"];

export class Harmonizer {
    static suggestChords(
        melodyNotes: string[],
        barCount: number = 4,
        beatsPerBar: number = 4,
        preferredMode?: string
    ): HarmonizationResult {
        const detectedKey = this.detectKey(melodyNotes);
        const mode = preferredMode || "ionian";
        const scale = Key.majorKey(detectedKey);

        const chords: BarChord[] = [];
        const diatonicChords = scale.chords;

        // Generate chord for each bar (one chord per bar for simplicity, can be refined)
        for (let bar = 0; bar < barCount; bar++) {
            // Determine which melody notes fall in this bar
            const barStartStep = bar * beatsPerBar;
            const barEndStep = barStartStep + beatsPerBar;

            // For now, use a common progression pattern based on bar position
            // This can be made smarter by analyzing actual melody notes
            const progressionPattern = this.getProgressionPattern(barCount);
            const chordIndex = progressionPattern[bar % progressionPattern.length];
            const mainChord = diatonicChords[chordIndex] || diatonicChords[0];

            // Generate alternatives
            const alternatives = this.getAlternativeChords(detectedKey, chordIndex, mode);

            chords.push({
                bar,
                beat: 0, // One chord per bar on beat 1
                chord: mainChord,
                alternatives
            });
        }

        return {
            chords,
            key: detectedKey,
            scale: scale.type,
            mode
        };
    }

    static getProgressionPattern(barCount: number): number[] {
        // Common progressions based on bar count
        if (barCount <= 4) return [0, 3, 4, 0]; // I - IV - V - I
        if (barCount <= 8) return [0, 0, 3, 3, 4, 4, 0, 0]; // Extended
        // 16 bars: verse-like progression
        return [0, 5, 3, 4, 0, 5, 3, 4, 5, 3, 0, 4, 0, 5, 4, 0];
    }

    static getAlternativeChords(key: string, degree: number, mode: string): string[] {
        const alternatives: string[] = [];
        const scale = Key.majorKey(key);
        const modeChords = MODE_CHORDS[mode.toLowerCase()] || MODE_CHORDS.ionian;

        // Get the scale degrees
        const scaleNotes = scale.scale;
        const root = scaleNotes[degree];

        if (!root) return alternatives;

        // Add modal alternatives
        const modalQualities = ["m7", "maj7", "7", "dim7", "m7b5"];
        modalQualities.forEach(quality => {
            const chordName = `${root}${quality}`;
            if (!alternatives.includes(chordName)) {
                alternatives.push(chordName);
            }
        });

        // Add jazz extensions
        JAZZ_EXTENSIONS.forEach(ext => {
            const chordName = `${root}${ext}`;
            alternatives.push(chordName);
        });

        // Add suspended chords
        alternatives.push(`${root}sus2`, `${root}sus4`);

        // Add borrowed chords (from parallel minor/major)
        const parallelKey = key.includes("m") ? key.replace("m", "") : `${key}m`;
        try {
            const parallelScale = key.includes("m") ? Key.majorKey(parallelKey) : Key.minorKey(parallelKey);
            if (parallelScale.chords[degree]) {
                alternatives.push(parallelScale.chords[degree]);
            }
        } catch (e) {
            // Ignore if parallel key fails
        }

        return alternatives.slice(0, 8); // Limit to 8 alternatives
    }

    static detectKey(notes: string[]): string {
        if (notes.length === 0) return "C";

        // Count note occurrences
        const noteCounts: Record<string, number> = {};
        notes.forEach(note => {
            const pc = Note.pitchClass(note);
            if (pc) {
                noteCounts[pc] = (noteCounts[pc] || 0) + 1;
            }
        });

        // Find most common note (likely tonic or dominant)
        const sorted = Object.entries(noteCounts).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
            return sorted[0][0];
        }

        return "C";
    }

    static getChordNotes(chordName: string): string[] {
        return Chord.get(chordName).notes;
    }

    static getChordVoicing(chordName: string, octave: number = 4): string[] {
        const chord = Chord.get(chordName);
        return chord.notes.map((note, i) => {
            // Spread voicing across octaves
            const noteOctave = octave + Math.floor(i / 4);
            return `${note}${noteOctave}`;
        });
    }

    static getAvailableModes(): string[] {
        return ["ionian", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian"];
    }

    static getJazzScales(): string[] {
        return ["melodic minor", "harmonic minor", "whole tone", "diminished", "altered"];
    }
}
