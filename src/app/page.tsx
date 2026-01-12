import { Composer } from "@/components/music/Composer";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-500">
          Compose with AI
        </h1>
        <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
          Draw your melody below and let our music theory engine suggest the perfect harmonization.
        </p>
      </div>
      <Composer />
    </div>
  );
}
