"use client";

import { useState, useEffect } from "react";
import { PianoRoll } from "./PianoRoll";
import { ChordProgressionBar } from "./ChordProgressionBar";
import { VirtualPiano } from "./VirtualPiano";
import { Harmonizer, BarChord } from "@/lib/music/harmonizer";
import { player } from "@/lib/music/player";
import { useKeyboardRecorder } from "@/lib/hooks/useKeyboardRecorder";
import { Play, RotateCcw, Volume2, Circle, Square, Settings } from "lucide-react";

const BAR_OPTIONS = [4, 8, 16, 32];

export function Composer() {
    const [melody, setMelody] = useState<{ note: string; step: number }[]>([]);
    const [chordSlots, setChordSlots] = useState<BarChord[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [barCount, setBarCount] = useState(4);
    const [beatsPerBar] = useState(4);
    const [selectedMode, setSelectedMode] = useState("ionian");
    const [detectedKey, setDetectedKey] = useState("C");

    const totalSteps = barCount * beatsPerBar;

    const { stopRecording, playNote, stopNote } = useKeyboardRecorder({
        isRecording,
        onRecordingComplete: (recordedNotes) => {
            const stepDuration = 0.25;
            const newMelody: { note: string; step: number }[] = [];

            recordedNotes.forEach(({ note, time }) => {
                const step = Math.floor(time / stepDuration);
                if (step < totalSteps) {
                    newMelody.push({ note, step });
                }
            });

            setMelody(newMelody);
            setIsRecording(false);
        },
    });

    // Auto-harmonize when melody or settings change
    useEffect(() => {
        if (melody.length === 0) {
            setChordSlots([]);
            return;
        }

        const uniqueNotes = Array.from(new Set(melody.map(m => m.note.replace(/\d/, ""))));
        const result = Harmonizer.suggestChords(uniqueNotes, barCount, beatsPerBar, selectedMode);
        setChordSlots(result.chords);
        setDetectedKey(result.key);
    }, [melody, barCount, beatsPerBar, selectedMode]);

    const handlePlay = async () => {
        if (isPlaying) return;
        setIsPlaying(true);

        await player.initialize();

        const stepDuration = 0.25;

        // Play Melody
        melody.forEach(({ note, step }) => {
            player.playMelody([{ note, duration: "8n", time: step * stepDuration }]);
        });

        // Play Chords based on bar positions
        chordSlots.forEach((slot) => {
            const notes = Harmonizer.getChordNotes(slot.chord);
            const time = (slot.bar * beatsPerBar + slot.beat) * stepDuration;
            setTimeout(() => {
                player.playChord(notes, "2n");
            }, time * 1000);
        });

        setTimeout(() => {
            setIsPlaying(false);
        }, totalSteps * stepDuration * 1000 + 500);
    };

    const handleClear = () => {
        setMelody([]);
        setChordSlots([]);
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

    const handleChordChange = (bar: number, beat: number, newChord: string) => {
        setChordSlots(prev => prev.map(slot =>
            slot.bar === bar && slot.beat === beat
                ? { ...slot, chord: newChord }
                : slot
        ));
    };

    const handleChordClick = (chord: string) => {
        const notes = Harmonizer.getChordNotes(chord);
        player.initialize().then(() => {
            player.playChord(notes, "2n");
        });
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-neutral-900/50 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="flex flex-wrap gap-3 items-center">
                    <button
                        onClick={handleRecord}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-all text-sm ${isRecording
                                ? "bg-red-600 hover:bg-red-500 animate-pulse"
                                : "bg-purple-600 hover:bg-purple-500"
                            }`}
                    >
                        {isRecording ? <Square size={16} fill="currentColor" /> : <Circle size={16} />}
                        {isRecording ? "Stop" : "Record"}
                    </button>
                    <button
                        onClick={handlePlay}
                        disabled={isPlaying || melody.length === 0}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        <Play size={16} fill="currentColor" />
                        {isPlaying ? "Playing..." : "Play"}
                    </button>
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-full transition-all text-neutral-400 hover:text-white text-sm"
                    >
                        <RotateCcw size={16} />
                        Clear
                    </button>
                </div>

                {/* Settings */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2 bg-neutral-800/50 rounded-lg px-3 py-1.5">
                        <Settings size={14} className="text-neutral-400" />
                        <span className="text-xs text-neutral-400">Bars:</span>
                        <select
                            value={barCount}
                            onChange={(e) => setBarCount(Number(e.target.value))}
                            className="bg-transparent text-sm font-medium text-white border-none outline-none cursor-pointer"
                        >
                            {BAR_OPTIONS.map(n => (
                                <option key={n} value={n} className="bg-neutral-900">{n}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-neutral-800/50 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-neutral-400">Mode:</span>
                        <select
                            value={selectedMode}
                            onChange={(e) => setSelectedMode(e.target.value)}
                            className="bg-transparent text-sm font-medium text-white border-none outline-none cursor-pointer capitalize"
                        >
                            {Harmonizer.getAvailableModes().map(mode => (
                                <option key={mode} value={mode} className="bg-neutral-900 capitalize">{mode}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-400 text-xs">
                        <Volume2 size={14} />
                        <span>Key: <span className="text-white font-medium">{detectedKey}</span></span>
                    </div>
                </div>
            </div>

            {/* Virtual Piano */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-neutral-200 pl-2 border-l-4 border-purple-500">Live Input</h2>
                    {isRecording && <span className="text-red-400 text-sm animate-pulse">● Recording</span>}
                </div>
                <VirtualPiano onNoteDown={playNote} onNoteUp={stopNote} isRecording={isRecording} />
                <p className="text-center text-xs text-neutral-500">
                    Click keys or use keyboard: Z-M (oct 3), A-J (oct 4), K-; (oct 5)
                </p>
            </div>

            {/* Chord Progression */}
            <div className="space-y-2">
                <h2 className="text-lg font-bold text-neutral-200 pl-2 border-l-4 border-indigo-500">Chord Progression</h2>
                <ChordProgressionBar
                    chords={chordSlots}
                    barCount={barCount}
                    beatsPerBar={beatsPerBar}
                    onChordChange={handleChordChange}
                    onChordClick={handleChordClick}
                />
            </div>

            {/* Piano Roll */}
            <div className="space-y-2">
                <h2 className="text-lg font-bold text-neutral-200 pl-2 border-l-4 border-cyan-500">Melody Grid</h2>
                <PianoRoll
                    melody={melody}
                    onMelodyChange={setMelody}
                    barCount={barCount}
                    beatsPerBar={beatsPerBar}
                />
            </div>
        </div>
    );
}
