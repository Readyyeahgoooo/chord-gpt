"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { player } from "@/lib/music/player";

const NOTES = ["C", "B", "A#", "A", "G#", "G", "F#", "F", "E", "D#", "D", "C#"];
const OCTAVES = [6, 5, 4, 3]; // C3 to C6 range (high to low for display)

interface NoteEvent {
    note: string;
    step: number;
}

interface PianoRollProps {
    melody: NoteEvent[];
    onMelodyChange: (melody: NoteEvent[]) => void;
    barCount: number;
    beatsPerBar?: number;
}

export function PianoRoll({ melody, onMelodyChange, barCount, beatsPerBar = 4 }: PianoRollProps) {
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);
    const totalSteps = barCount * beatsPerBar;

    const toggleNote = (noteName: string, step: number) => {
        const existingIndex = melody.findIndex((n) => n.note === noteName && n.step === step);

        if (existingIndex >= 0) {
            const newMelody = [...melody];
            newMelody.splice(existingIndex, 1);
            onMelodyChange(newMelody);
        } else {
            const newMelody = [...melody, { note: noteName, step }];
            onMelodyChange(newMelody);

            try {
                player.initialize().then(() => {
                    player.playChord([noteName], "8n");
                });
            } catch (e) {
                console.error("Audio not ready", e);
            }
        }
    };

    const isNoteActive = (noteName: string, step: number) => {
        return melody.some((n) => n.note === noteName && n.step === step);
    };

    return (
        <div className="flex flex-col overflow-x-auto bg-neutral-900/50 rounded-xl border border-white/10 p-4 relative backdrop-blur-sm">
            <div className="flex">
                {/* Keys Column */}
                <div className="flex-none w-12 pt-10 sticky left-0 bg-neutral-900/90 z-10">
                    {OCTAVES.map((octave) =>
                        NOTES.map((note) => (
                            <div
                                key={`${note}${octave}`}
                                className={cn(
                                    "h-6 text-xs flex items-center justify-end pr-2 font-mono",
                                    note.includes("#") ? "text-neutral-500 text-[10px]" : "text-neutral-300"
                                )}
                            >
                                {note.includes("#") ? "" : `${note}${octave}`}
                            </div>
                        ))
                    )}
                </div>

                {/* Grid */}
                <div className="flex-1 relative" style={{ minWidth: totalSteps * 30 }}>
                    {/* Bar Labels */}
                    <div className="flex absolute top-0 left-0 right-0 h-4 items-end">
                        {Array.from({ length: barCount }).map((_, bar) => (
                            <div
                                key={bar}
                                className="text-[10px] text-center text-neutral-500 font-medium border-l border-white/10"
                                style={{ width: beatsPerBar * 30 }}
                            >
                                Bar {bar + 1}
                            </div>
                        ))}
                    </div>

                    {/* Beat markers */}
                    <div className="flex absolute top-4 left-0 right-0 h-4 items-end">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "text-[9px] text-center border-l",
                                    i % beatsPerBar === 0 ? "text-neutral-400 border-white/10" : "text-neutral-600 border-white/5"
                                )}
                                style={{ width: 30 }}
                            >
                                {(i % beatsPerBar) + 1}
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 border border-white/10 rounded-md overflow-hidden bg-neutral-950">
                        {OCTAVES.map((octave) =>
                            NOTES.map((note) => {
                                const fullNote = `${note}${octave}`;
                                const isBlack = note.includes("#");
                                return (
                                    <div key={fullNote} className="flex h-6">
                                        {Array.from({ length: totalSteps }).map((_, step) => {
                                            const active = isNoteActive(fullNote, step);
                                            const isBarStart = step % beatsPerBar === 0;
                                            return (
                                                <div
                                                    key={step}
                                                    style={{ width: 30 }}
                                                    className={cn(
                                                        "border-r border-b border-white/5 cursor-pointer transition-all duration-100",
                                                        isBlack ? "bg-white/[0.02]" : "bg-transparent",
                                                        isBarStart && "border-l border-l-white/10",
                                                        hoveredStep === step && "bg-white/[0.05]",
                                                        active && "bg-cyan-500 shadow-lg shadow-cyan-500/20 border-cyan-400"
                                                    )}
                                                    onMouseEnter={() => setHoveredStep(step)}
                                                    onMouseLeave={() => setHoveredStep(null)}
                                                    onClick={() => toggleNote(fullNote, step)}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
