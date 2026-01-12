"use client";

import { useState, useEffect } from "react";
import { PianoRoll } from "./PianoRoll";
import { ChordStrip } from "./ChordStrip";
import { VirtualPiano } from "./VirtualPiano";
import { Harmonizer } from "@/lib/music/harmonizer";
import { player } from "@/lib/music/player";
import { useKeyboardRecorder } from "@/lib/hooks/useKeyboardRecorder";
import { Play, RotateCcw, Volume2, Circle, Square } from "lucide-react";

export function Composer() {
    const [melody, setMelody] = useState<{ note: string; step: number }[]>([]);
    const [chords, setChords] = useState<string[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const { stopRecording, playNote, stopNote } = useKeyboardRecorder({
        isRecording,
        onRecordingComplete: (recordedNotes) => {
            const stepDuration = 0.25;
            const newMelody: { note: string; step: number }[] = [];

            recordedNotes.forEach(({ note, time }) => {
                const step = Math.floor(time / stepDuration);
                if (step < 16) {
                    newMelody.push({ note, step });
                }
            });

            setMelody(newMelody);
            setIsRecording(false);
        },
    });

    // Auto-harmonize when melody changes
    useEffect(() => {
        if (melody.length === 0) {
            setChords([]);
            return;
        }

        const uniqueNotes = Array.from(new Set(melody.map(m => m.note.replace(/\d/, ""))));
        const result = Harmonizer.suggestChords(uniqueNotes);
        setChords(result.chords);
    }, [melody]);

    const handlePlay = async () => {
        if (isPlaying) return;
        setIsPlaying(true);

        await player.initialize();

        const stepDuration = 0.25;

        // Play Melody
        melody.forEach(({ note, step }) => {
            player.playMelody([{ note, duration: "8n", time: step * stepDuration }]);
        });

        // Play Chords
        chords.forEach((chord, idx) => {
            const notes = Harmonizer.getChordNotes(chord);
            setTimeout(() => {
                player.playChord(notes, "2n");
            }, idx * 4 * stepDuration * 1000);
        });

        setTimeout(() => {
            setIsPlaying(false);
        }, 16 * stepDuration * 1000 + 500);
    };

    const handleClear = () => {
        setMelody([]);
        setChords([]);
    };

    const handleRecord = () => {
        if (isRecording) {
            stopRecording();
            setIsRecording(false);
        } else {
            setMelody([]);
            setIsRecording(true);
        }
    };

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-900/50 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="flex gap-4">
                    <button
                        onClick={handleRecord}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all ${isRecording
                                ? "bg-red-600 hover:bg-red-500 animate-pulse"
                                : "bg-purple-600 hover:bg-purple-500"
                            }`}
                    >
                        {isRecording ? <Square size={18} fill="currentColor" /> : <Circle size={18} />}
                        {isRecording ? "Stop Recording" : "Record"}
                    </button>
                    <button
                        onClick={handlePlay}
                        disabled={isPlaying || melody.length === 0}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play size={18} fill="currentColor" />
                        {isPlaying ? "Playing..." : "Play"}
                    </button>
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-full transition-all text-neutral-400 hover:text-white"
                    >
                        <RotateCcw size={18} />
                        Clear
                    </button>
                </div>
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                    <Volume2 size={16} />
                    <span>{isRecording ? "Recording... (stops after 10s idle)" : "Audio Engine Ready"}</span>
                </div>
            </div>

            {/* Virtual Piano */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-200 pl-2 border-l-4 border-purple-500">Live Input</h2>
                    {isRecording && <span className="text-red-400 text-sm animate-pulse">● Recording Input</span>}
                </div>
                <VirtualPiano onNoteDown={playNote} onNoteUp={stopNote} isRecording={isRecording} />
                <p className="text-center text-xs text-neutral-500 mt-2">
                    Click keys above or use keyboard: A W S E D F T G Y H U J K O L P ;
                </p>
            </div>

            {/* Workspace */}
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-neutral-200 pl-2 border-l-4 border-cyan-500">Melody Entry</h2>
                <PianoRoll melody={melody} onMelodyChange={setMelody} />
            </div>

            <div className="space-y-2">
                <h2 className="text-xl font-bold text-neutral-200 pl-2 border-l-4 border-indigo-500">Harmonization</h2>
                <ChordStrip chords={chords} />
            </div>
        </div>
    );
}
