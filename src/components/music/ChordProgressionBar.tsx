"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, Music } from "lucide-react";
import { useState } from "react";

interface ChordSlot {
    chord: string;
    alternatives: string[];
    bar: number;
    beat: number;
}

interface ChordProgressionBarProps {
    chords: ChordSlot[];
    barCount: number;
    beatsPerBar: number;
    onChordChange: (bar: number, beat: number, newChord: string) => void;
    onChordClick: (chord: string) => void;
}

export function ChordProgressionBar({
    chords,
    barCount,
    beatsPerBar,
    onChordChange,
    onChordClick
}: ChordProgressionBarProps) {
    const [openSelector, setOpenSelector] = useState<string | null>(null);

    const getChordForPosition = (bar: number, beat: number): ChordSlot | undefined => {
        return chords.find(c => c.bar === bar && c.beat === beat);
    };

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
                <Music size={16} className="text-indigo-400" />
                <span className="text-sm font-medium text-neutral-300">Chord Progression</span>
            </div>

            <div className="flex gap-1 overflow-x-auto">
                {Array.from({ length: barCount }).map((_, bar) => (
                    <div
                        key={bar}
                        className="flex-shrink-0 border border-white/10 rounded-lg bg-neutral-950/50 p-2"
                        style={{ minWidth: beatsPerBar * 60 }}
                    >
                        <div className="text-[10px] text-neutral-500 mb-1 text-center">Bar {bar + 1}</div>
                        <div className="flex gap-1">
                            {Array.from({ length: beatsPerBar }).map((_, beat) => {
                                const chordSlot = getChordForPosition(bar, beat);
                                const key = `${bar}-${beat}`;
                                const isOpen = openSelector === key;

                                return (
                                    <div key={beat} className="relative flex-1">
                                        <button
                                            onClick={() => {
                                                if (chordSlot) {
                                                    onChordClick(chordSlot.chord);
                                                }
                                                setOpenSelector(isOpen ? null : key);
                                            }}
                                            className={cn(
                                                "w-full h-12 rounded-md text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5",
                                                chordSlot
                                                    ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-200 hover:from-indigo-500/30 hover:to-purple-500/30"
                                                    : "bg-neutral-800/50 border border-dashed border-neutral-700 text-neutral-500 hover:border-neutral-500"
                                            )}
                                        >
                                            {chordSlot ? (
                                                <>
                                                    <span className="text-sm">{chordSlot.chord}</span>
                                                    {chordSlot.alternatives.length > 0 && (
                                                        <ChevronDown size={10} className="text-neutral-400" />
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-[10px]">+</span>
                                            )}
                                        </button>

                                        {/* Alternatives Dropdown */}
                                        {isOpen && chordSlot && chordSlot.alternatives.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-white/10 rounded-md shadow-xl z-50 overflow-hidden">
                                                {chordSlot.alternatives.map((alt, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            onChordChange(bar, beat, alt);
                                                            setOpenSelector(null);
                                                        }}
                                                        className="w-full px-2 py-1.5 text-xs text-left hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                                                    >
                                                        {alt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
