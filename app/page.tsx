import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import BouquetBuilder from "@/components/sections/BouquetBuilder";
import MemoriesSection from "@/components/sections/Memories";
import MessageSection from "@/components/sections/Message";
import MusicPlayerSection from "@/components/sections/MusicPlayer";
import VideoPlayerSection from "@/components/sections/VideoPlayer";

const TeddyGuide = dynamic(() => import("@/components/guide/TeddyGuide"), { ssr: false });

export default function Home() {
  return (
    <>
      <Hero />
      <MusicPlayerSection />
      <VideoPlayerSection />
      <BouquetBuilder />
      <MessageSection />
      <MemoriesSection />
      <TeddyGuide />
    </>
  );
}
