import { useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";

interface RecordedNote {
    note: string;
    time: number; // in seconds from start
    duration: number;
}

interface UseKeyboardRecorderProps {
    onRecordingComplete: (notes: RecordedNote[]) => void;
    isRecording: boolean;
}

// Map keyboard keys to notes
const KEY_TO_NOTE: Record<string, string> = {
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
    'k': 'C5',
    'o': 'C#5',
    'l': 'D5',
    'p': 'D#5',
    ';': 'E5',
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
        }, 10000); // 10 seconds of inactivity
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

    useEffect(() => {
        if (!isRecording) {
            if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current);
                inactivityTimer.current = null;
            }
            return;
        }

        startTime.current = Date.now();
        recordedNotes.current = [];
        resetInactivityTimer();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isRecording) return;

            const note = KEY_TO_NOTE[e.key.toLowerCase()];
            if (!note || activeNotes.current.has(note)) return;

            const currentTime = (Date.now() - startTime.current) / 1000;
            activeNotes.current.set(note, currentTime);

            // Play the note
            synth.current?.triggerAttack(note);

            resetInactivityTimer();
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (!isRecording) return;

            const note = KEY_TO_NOTE[e.key.toLowerCase()];
            if (!note || !activeNotes.current.has(note)) return;

            const noteStartTime = activeNotes.current.get(note)!;
            const currentTime = (Date.now() - startTime.current) / 1000;
            const duration = currentTime - noteStartTime;

            recordedNotes.current.push({
                note,
                time: noteStartTime,
                duration,
            });

            activeNotes.current.delete(note);

            // Release the note
            synth.current?.triggerRelease(note);

            resetInactivityTimer();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);

            // Release all active notes
            activeNotes.current.forEach((_, note) => {
                synth.current?.triggerRelease(note);
            });
        };
    }, [isRecording, resetInactivityTimer]);

    return { stopRecording };
}
