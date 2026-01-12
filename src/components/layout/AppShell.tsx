import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
    children: ReactNode;
    className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
    return (
        <div className={cn("min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30", className)}>
            <div className="fixed inset-0 -z-10 h-full w-full bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            <main className="container mx-auto p-4 md:p-8 flex flex-col gap-6 min-h-screen">
                <header className="flex items-center justify-between py-4 border-b border-white/10 mb-8 backdrop-blur-sm sticky top-0 z-50">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        ChordGPT
                    </h1>
                    <div className="text-sm text-neutral-400">
                        AI Music Harmonizer
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}
