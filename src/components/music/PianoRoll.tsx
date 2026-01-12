"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { player } from "@/lib/music/player";

const NOTES = ["C", "B", "A#", "A", "G#", "G", "F#", "F", "E", "D#", "D", "C#"];
const OCTAVES = [5, 4]; // Limited range for now
const STEPS = 16; // 4 bars of 4/4 if each step is a quarter note? Or 1 bar of 16th notes. Let's say 2 bars of 8th notes. 16 steps.

interface NoteEvent {
    note: string; // e.g., "C4"
    step: number; // 0-15
}

interface PianoRollProps {
    melody: NoteEvent[];
    onMelodyChange: (melody: NoteEvent[]) => void;
}

export function PianoRoll({ melody, onMelodyChange }: PianoRollProps) {
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);

    const toggleNote = (noteName: string, step: number) => {
        const existingIndex = melody.findIndex((n) => n.note === noteName && n.step === step);

        if (existingIndex >= 0) {
            // Remove
            const newMelody = [...melody];
            newMelody.splice(existingIndex, 1);
            onMelodyChange(newMelody);
        } else {
            // Add (ensure monophonic for now per step? Or polyphonic? Let's allow polyphonic but simple click)
            // Actually strictly monophonic per step is easier for a start, but let's allow overlapping.
            const newMelody = [...melody, { note: noteName, step }];
            onMelodyChange(newMelody);

            try {
                // Quick preview
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
                <div className="flex-none w-12 pt-6">
                    {OCTAVES.map((octave) =>
                        NOTES.map((note) => (
                            <div
                                key={`${note}${octave}`}
                                className={cn(
                                    "h-8 text-xs flex items-center justify-end pr-2 font-mono",
                                    note.includes("#") ? "text-neutral-500" : "text-neutral-300"
                                )}
                            >
                                {note.includes("#") ? "" : `${note}${octave}`}
                            </div>
                        ))
                    )}
                </div>

                {/* Grid */}
                <div className="flex-1 min-w-[600px] relative">
                    {/* Step Markers */}
                    <div className="flex absolute top-0 left-0 right-0 h-4 items-end">
                        {Array.from({ length: STEPS }).map((_, i) => (
                            <div key={i} className="flex-1 text-[10px] text-center text-neutral-600 border-l border-white/5">{i + 1}</div>
                        ))}
                    </div>

                    <div className="mt-6 border border-white/10 rounded-md overflow-hidden bg-neutral-950">
                        {OCTAVES.map((octave) =>
                            NOTES.map((note) => {
                                const fullNote = `${note}${octave}`;
                                const isBlack = note.includes("#");
                                return (
                                    <div key={fullNote} className="flex h-8">
                                        {Array.from({ length: STEPS }).map((_, step) => {
                                            const active = isNoteActive(fullNote, step);
                                            return (
                                                <div
                                                    key={step}
                                                    className={cn(
                                                        "flex-1 border-r border-b border-white/5 cursor-pointer transition-all duration-150",
                                                        isBlack ? "bg-white/[0.02]" : "bg-transparent",
                                                        step % 4 === 0 && "border-r-white/10", // Bar lines
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
