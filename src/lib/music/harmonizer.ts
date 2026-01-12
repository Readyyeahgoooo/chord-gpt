import { Note, Scale, Chord, Key } from "tonal";

export interface HarmonizationResult {
    chords: string[];
    key: string;
    scale: string;
}

export class Harmonizer {
    static suggestChords(melodyNotes: string[], key?: string): HarmonizationResult {
        // 1. Determine Key if not provided
        const detectedKey = key || this.detectKey(melodyNotes);

        // 2. Simplistic harmonization strategy (diatonic chords for now)
        // In a real app, this would be much more complex, using voice leading, etc.
        // For now, let's map notes to likely chords in the key.

        const scale = Key.majorKey(detectedKey);
        const chords = scale.chords;

        // Simple logic: return a progression (I - IV - V - I) in the key
        // This is a placeholder for the "AI" logic which would analyze the specific melody notes
        // and fit chords to them.
        const progression = [chords[0], chords[3], chords[4], chords[0]];

        return {
            chords: progression,
            key: detectedKey,
            scale: scale.type
        };
    }

    static detectKey(notes: string[]): string {
        // Very basic key detection (most frequent note or starting note)
        // Tonal doesn't have a robust "detect key from melody" function out of the box that is perfect,
        // so we'll guess C major if ambiguous or start with the first note.
        if (notes.length === 0) return "C";
        return Note.pitchClass(notes[0]) || "C";
    }

    static getChordNotes(chordName: string): string[] {
        return Chord.get(chordName).notes;
    }
}
