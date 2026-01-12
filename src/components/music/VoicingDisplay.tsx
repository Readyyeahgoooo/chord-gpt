"use client";

import { cn } from "@/lib/utils";
import { Harmonizer } from "@/lib/music/harmonizer";

interface VoicingDisplayProps {
    chord: string | null;
    className?: string;
}

const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_KEYS = ["C#", "D#", "F#", "G#", "A#"];
const ALL_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function VoicingDisplay({ chord, className }: VoicingDisplayProps) {
    const chordNotes = chord ? Harmonizer.getChordNotes(chord) : [];
    const activeNotes = new Set(chordNotes.map(n => n.replace(/\d/, ""))); // Remove octave

    const isNoteActive = (note: string) => activeNotes.has(note);

    if (!chord) {
        return (
            <div className={cn(
                "bg-neutral-900/50 rounded-xl border border-white/10 p-6 backdrop-blur-sm text-center",
                className
            )}>
                <p className="text-neutral-500 text-sm">Select a chord to view voicing</p>
            </div>
        );
    }

    return (
        <div className={cn(
            "bg-neutral-900/50 rounded-xl border border-white/10 p-4 backdrop-blur-sm",
            className
        )}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-white">{chord}</h3>
                    <p className="text-xs text-neutral-400">
                        Notes: {chordNotes.join(" - ")}
                    </p>
                </div>
            </div>

            {/* Mini Piano Visualization */}
            <div className="flex justify-center">
                <div className="relative inline-flex">
                    {/* White Keys */}
                    <div className="flex">
                        {WHITE_KEYS.map((note) => {
                            const active = isNoteActive(note);
                            return (
                                <div
                                    key={note}
                                    className={cn(
                                        "w-10 h-24 border border-neutral-300 rounded-b-md mx-px transition-all",
                                        active
                                            ? "bg-gradient-to-b from-cyan-200 to-cyan-400 border-cyan-500 shadow-lg shadow-cyan-400/30"
                                            : "bg-gradient-to-b from-white to-neutral-100"
                                    )}
                                >
                                    <div className="flex h-full items-end justify-center pb-1">
                                        <span className={cn(
                                            "text-[10px] font-medium",
                                            active ? "text-cyan-800" : "text-neutral-400"
                                        )}>
                                            {note}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Black Keys */}
                    <div className="absolute top-0 left-0 flex pointer-events-none">
                        {/* C# */}
                        <div className="w-10" />
                        <BlackKey note="C#" isActive={isNoteActive("C#")} />
                        {/* D# */}
                        <div className="w-3" />
                        <BlackKey note="D#" isActive={isNoteActive("D#")} />
                        {/* Gap for E */}
                        <div className="w-10" />
                        {/* F# */}
                        <div className="w-3" />
                        <BlackKey note="F#" isActive={isNoteActive("F#")} />
                        {/* G# */}
                        <div className="w-3" />
                        <BlackKey note="G#" isActive={isNoteActive("G#")} />
                        {/* A# */}
                        <div className="w-3" />
                        <BlackKey note="A#" isActive={isNoteActive("A#")} />
                    </div>
                </div>
            </div>

            {/* Chord Intervals */}
            <div className="mt-4 flex justify-center gap-2">
                {chordNotes.map((note, idx) => (
                    <div
                        key={idx}
                        className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs text-indigo-200"
                    >
                        {note}
                    </div>
                ))}
            </div>
        </div>
    );
}

function BlackKey({ note, isActive }: { note: string; isActive: boolean }) {
    return (
        <div
            className={cn(
                "w-6 h-14 rounded-b-sm -mx-3 z-10 transition-all",
                isActive
                    ? "bg-gradient-to-b from-indigo-600 to-indigo-800 shadow-lg shadow-indigo-500/30"
                    : "bg-gradient-to-b from-neutral-700 to-neutral-900"
            )}
        />
    );
}
