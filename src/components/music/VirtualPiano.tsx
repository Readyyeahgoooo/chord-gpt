"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface VirtualPianoProps {
    onNoteDown: (note: string) => void;
    onNoteUp: (note: string) => void;
    isRecording?: boolean;
}

const OCTAVES = [4, 5];
const NOTES = [
    { note: "C", type: "white" },
    { note: "C#", type: "black" },
    { note: "D", type: "white" },
    { note: "D#", type: "black" },
    { note: "E", type: "white" },
    { note: "F", type: "white" },
    { note: "F#", type: "black" },
    { note: "G", type: "white" },
    { note: "G#", type: "black" },
    { note: "A", type: "white" },
    { note: "A#", type: "black" },
    { note: "B", type: "white" }
];

export function VirtualPiano({ onNoteDown, onNoteUp, isRecording }: VirtualPianoProps) {
    const [activeNote, setActiveNote] = useState<string | null>(null);

    const handleMouseDown = (note: string) => {
        setActiveNote(note);
        onNoteDown(note);
    };

    const handleMouseUp = (note: string) => {
        setActiveNote(null);
        onNoteUp(note);
    };

    const handleMouseLeave = (note: string) => {
        if (activeNote === note) {
            setActiveNote(null);
            onNoteUp(note);
        }
    };

    return (
        <div className={cn(
            "flex select-none justify-center py-6 px-4 bg-neutral-900/40 rounded-xl border border-white/5 backdrop-blur-sm relative min-w-fit overflow-x-auto",
            isRecording ? "border-red-500/20 shadow-[0_0_30px_-5px_rgba(239,68,68,0.1)]" : ""
        )}>
            <div className="flex relative">
                {OCTAVES.map((octave, octaveIdx) => (
                    <div key={octave} className="flex relative shrink-0">
                        {NOTES.map(({ note, type }) => {
                            const fullNote = `${note}${octave}`;
                            if (type === "white") {
                                return (
                                    <div
                                        key={fullNote}
                                        onMouseDown={() => handleMouseDown(fullNote)}
                                        onMouseUp={() => handleMouseUp(fullNote)}
                                        onMouseLeave={() => handleMouseLeave(fullNote)}
                                        className={cn(
                                            "w-12 h-44 bg-white border border-neutral-300 rounded-b-lg mx-[1px] cursor-pointer transition-all active:scale-[0.99] active:bg-neutral-200 z-10 shadow-sm",
                                            activeNote === fullNote && "bg-cyan-100 shadow-inner"
                                        )}
                                    >
                                        <div className="flex h-full items-end justify-center pb-2">
                                            <span className="text-xs font-semibold text-neutral-400 opacity-50 select-none pointer-events-none">{fullNote}</span>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })}

                        {/* Black keys layer */}
                        <div className="absolute top-0 left-0 flex w-full h-full pointer-events-none z-20">
                            {/* Offset for first key */}
                            <div className="w-[32px]" />
                            {NOTES.map(({ note, type }, idx) => {
                                const whiteKeyWidth = 48 + 2; // w-12 + margins
                                // This logic is simplified; real pianos have non-uniform spacing.
                                // We'll rely on flex with spacers based on musical intervals.

                                if (type === "white") {
                                    const next = NOTES[idx + 1];
                                    if (next?.type === "black") {
                                        const blackNote = `${next.note}${octave}`;
                                        return (
                                            <div
                                                key={blackNote}
                                                className="pointer-events-auto"
                                                onMouseDown={() => handleMouseDown(blackNote)}
                                                onMouseUp={() => handleMouseUp(blackNote)}
                                                onMouseLeave={() => handleMouseLeave(blackNote)}
                                            >
                                                <div className={cn(
                                                    "w-10 h-28 bg-neutral-900 border-x border-b border-neutral-700 rounded-b-md -mx-5 z-20 cursor-pointer transition-all active:scale-[0.99] active:bg-neutral-800 shadow-md",
                                                    "bg-gradient-to-b from-neutral-800 to-black",
                                                    activeNote === blackNote && "from-indigo-900 to-black border-indigo-500"
                                                )} />
                                            </div>
                                        );
                                    }
                                    // Spacers for gaps between black keys
                                    if (["E", "B"].includes(note)) return null;
                                    return <div key={`space-${note}`} className="w-8" />;
                                }
                                return null;
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
