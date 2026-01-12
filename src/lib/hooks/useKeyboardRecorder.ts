import { useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";

interface RecordedNote {
    note: string;
    time: number;
    duration: number;
}

interface UseKeyboardRecorderProps {
    onRecordingComplete: (notes: RecordedNote[]) => void;
    isRecording: boolean;
}

const KEY_TO_NOTE: Record<string, string> = {
    // Octave 3 (lower row: z x c v b n m)
    'z': 'C3',
    'x': 'D3',
    'c': 'E3',
    'v': 'F3',
    'b': 'G3',
    'n': 'A3',
    'm': 'B3',
    // Octave 4 (home row: a s d f g h j)
    'a': 'C4',
    'w': 'C#4',
    's': 'D4',
    'e': 'D#4',
    'd': 'E4',
    'f': 'F4',
    't': 'F#4',
    'g': 'G4',
    'y': 'G#4',
    'h': 'A4',
    'u': 'A#4',
    'j': 'B4',
    // Octave 5 (upper row: k l ; ')
    'k': 'C5',
    'o': 'C#5',
    'l': 'D5',
    'p': 'D#5',
    ';': 'E5',
    "'": 'F5',
    '[': 'G5',
    ']': 'A5',
    // Numbers for Octave 5-6 sharps and high notes
    '1': 'F#5',
    '2': 'G#5',
    '3': 'A#5',
    '4': 'B5',
    '5': 'C6',
};

export function useKeyboardRecorder({ onRecordingComplete, isRecording }: UseKeyboardRecorderProps) {
    const recordedNotes = useRef<RecordedNote[]>([]);
    const startTime = useRef<number>(0);
    const activeNotes = useRef<Map<string, number>>(new Map());
    const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
    const synth = useRef<Tone.PolySynth | null>(null);

    const stopRecording = useCallback(() => {
        if (recordedNotes.current.length > 0) {
            onRecordingComplete([...recordedNotes.current]);
        }
        recordedNotes.current = [];
        activeNotes.current.clear();
        if (inactivityTimer.current) {
            clearTimeout(inactivityTimer.current);
            inactivityTimer.current = null;
        }
    }, [onRecordingComplete]);

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimer.current) {
            clearTimeout(inactivityTimer.current);
        }
        inactivityTimer.current = setTimeout(() => {
            stopRecording();
        }, 10000);
    }, [stopRecording]);

    useEffect(() => {
        if (!synth.current) {
            Tone.start();
            synth.current = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "triangle" },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.5 },
            }).toDestination();
        }
    }, []);

    const playNote = useCallback((note: string) => {
        if (!synth.current) {
            Tone.start();
            synth.current = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "triangle" },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.5 },
            }).toDestination();
        }

        if (!isRecording) {
            synth.current?.triggerAttack(note);
            return;
        }

        if (!startTime.current) startTime.current = Date.now();

        if (activeNotes.current.has(note)) return;

        const currentTime = (Date.now() - startTime.current) / 1000;
        activeNotes.current.set(note, currentTime);

        synth.current?.triggerAttack(note);
        resetInactivityTimer();
    }, [isRecording, resetInactivityTimer]);

    const stopNote = useCallback((note: string) => {
        synth.current?.triggerRelease(note);

        if (!isRecording || !activeNotes.current.has(note)) return;

        const noteStartTime = activeNotes.current.get(note)!;
        const currentTime = (Date.now() - startTime.current) / 1000;
        const duration = currentTime - noteStartTime;

        recordedNotes.current.push({
            note,
            time: noteStartTime,
            duration,
        });

        activeNotes.current.delete(note);
        resetInactivityTimer();
    }, [isRecording, resetInactivityTimer]);

    useEffect(() => {
        if (!isRecording) {
            if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current);
                inactivityTimer.current = null;
            }
            startTime.current = 0;
            return;
        }

        startTime.current = Date.now();
        recordedNotes.current = [];
        resetInactivityTimer();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            const note = KEY_TO_NOTE[e.key.toLowerCase()];
            if (note) playNote(note);
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const note = KEY_TO_NOTE[e.key.toLowerCase()];
            if (note) stopNote(note);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);

            activeNotes.current.forEach((_, note) => {
                synth.current?.triggerRelease(note);
            });
        };
    }, [isRecording, resetInactivityTimer, playNote, stopNote]);

    return { stopRecording, playNote, stopNote };
}
