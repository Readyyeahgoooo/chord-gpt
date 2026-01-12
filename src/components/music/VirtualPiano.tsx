"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface VirtualPianoProps {
    onNoteDown: (note: string) => void;
    onNoteUp: (note: string) => void;
    isRecording?: boolean;
}

const OCTAVES = [3, 4, 5, 6];

// Define white and black keys with their positions
const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_KEYS = [
    { note: "C#", position: 0 },  // Between C and D
    { note: "D#", position: 1 },  // Between D and E
    { note: "F#", position: 3 },  // Between F and G
    { note: "G#", position: 4 },  // Between G and A
    { note: "A#", position: 5 },  // Between A and B
];

export function VirtualPiano({ onNoteDown, onNoteUp, isRecording }: VirtualPianoProps) {
    const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

    const handleMouseDown = (note: string) => {
        setActiveNotes(prev => new Set(prev).add(note));
        onNoteDown(note);
    };

    const handleMouseUp = (note: string) => {
        setActiveNotes(prev => {
            const next = new Set(prev);
            next.delete(note);
            return next;
        });
        onNoteUp(note);
    };

    const handleMouseLeave = (note: string) => {
        if (activeNotes.has(note)) {
            handleMouseUp(note);
        }
    };

    const WHITE_KEY_WIDTH = 40; // pixels
    const BLACK_KEY_WIDTH = 28;
    const BLACK_KEY_OFFSET = WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;

    return (
        <div className={cn(
            "flex select-none justify-center py-6 px-4 bg-neutral-900/40 rounded-xl border border-white/5 backdrop-blur-sm relative overflow-x-auto",
            isRecording ? "border-red-500/30 shadow-[0_0_30px_-5px_rgba(239,68,68,0.15)]" : ""
        )}>
            <div className="relative flex">
                {OCTAVES.map((octave) => (
                    <div key={octave} className="relative" style={{ width: WHITE_KEY_WIDTH * 7 }}>
                        {/* White Keys */}
                        <div className="flex">
                            {WHITE_KEYS.map((note) => {
                                const fullNote = `${note}${octave}`;
                                const isActive = activeNotes.has(fullNote);
                                return (
                                    <div
                                        key={fullNote}
                                        onMouseDown={() => handleMouseDown(fullNote)}
                                        onMouseUp={() => handleMouseUp(fullNote)}
                                        onMouseLeave={() => handleMouseLeave(fullNote)}
                                        onTouchStart={(e) => { e.preventDefault(); handleMouseDown(fullNote); }}
                                        onTouchEnd={() => handleMouseUp(fullNote)}
                                        style={{ width: WHITE_KEY_WIDTH }}
                                        className={cn(
                                            "h-40 bg-gradient-to-b from-white to-neutral-100 border border-neutral-300 rounded-b-md cursor-pointer transition-all active:scale-[0.99] shadow-sm relative z-10",
                                            isActive && "from-cyan-100 to-cyan-200 border-cyan-400 shadow-lg shadow-cyan-200/50"
                                        )}
                                    >
                                        <div className="absolute bottom-2 left-0 right-0 text-center">
                                            <span className="text-[10px] font-medium text-neutral-400 select-none pointer-events-none">
                                                {note}{octave}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Black Keys - positioned absolutely */}
                        {BLACK_KEYS.map(({ note, position }) => {
                            const fullNote = `${note}${octave}`;
                            const isActive = activeNotes.has(fullNote);
                            const leftOffset = BLACK_KEY_OFFSET + (position * WHITE_KEY_WIDTH);

                            return (
                                <div
                                    key={fullNote}
                                    onMouseDown={() => handleMouseDown(fullNote)}
                                    onMouseUp={() => handleMouseUp(fullNote)}
                                    onMouseLeave={() => handleMouseLeave(fullNote)}
                                    onTouchStart={(e) => { e.preventDefault(); handleMouseDown(fullNote); }}
                                    onTouchEnd={() => handleMouseUp(fullNote)}
                                    style={{
                                        width: BLACK_KEY_WIDTH,
                                        left: leftOffset,
                                    }}
                                    className={cn(
                                        "absolute top-0 h-24 bg-gradient-to-b from-neutral-800 to-black border border-neutral-700 rounded-b-md cursor-pointer transition-all active:scale-[0.98] shadow-md z-20",
                                        isActive && "from-indigo-700 to-indigo-900 border-indigo-500 shadow-lg shadow-indigo-500/30"
                                    )}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
