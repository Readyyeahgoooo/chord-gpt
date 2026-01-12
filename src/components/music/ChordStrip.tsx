"use client";

import { player } from "@/lib/music/player";
import { cn } from "@/lib/utils";
import { Harmonizer } from "@/lib/music/harmonizer";

interface ChordStripProps {
    chords: string[];
}

export function ChordStrip({ chords }: ChordStripProps) {
    const playChord = (chord: string) => {
        try {
            const notes = Harmonizer.getChordNotes(chord);
            player.initialize().then(() => {
                player.playChord(notes, "2n");
            });
        } catch (e) {
            console.error("Error playing chord", e);
        }
    };

    return (
        <div className="grid grid-cols-4 gap-4 p-4 bg-neutral-900/50 rounded-xl border border-white/10 backdrop-blur-sm">
            {chords.map((chord, idx) => (
                <button
                    key={idx}
                    onClick={() => playChord(chord)}
                    className={cn(
                        "h-24 rounded-lg flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95",
                        "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 hover:border-indigo-400/50 hover:from-indigo-500/20 hover:to-purple-500/20"
                    )}
                >
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-100">
                        {chord}
                    </span>
                    <span className="text-xs text-neutral-400 uppercase tracking-wider">
                        Step {idx * 4 + 1}
                    </span>
                </button>
            ))}
            {chords.length === 0 && (
                <div className="col-span-4 text-center text-neutral-500 text-sm py-8 italic">
                    Add melody notes to generate harmonization...
                </div>
            )}
        </div>
    );
}
