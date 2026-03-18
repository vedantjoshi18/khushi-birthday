"use client";

import GlassCard from "@/components/ui/GlassCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const letter = `Khushi, pehle toh I love you bahut zyada. Mai itna khush ho rha tha na yeh banate banate ki tu yeh dekhegi toh kya reaction degi, har moment yeh banate hue mujhe itni zyada khushi hui hai mai kya batau. I love you baby bahut zyada, tere aane ke baad meri zindagi itni achhi ho gayi hai ki mai shayad kabhi bata na paau kitni zyada. Tune mujhe aise zindagi jeena sikhaya jaise shayad hee kabhi jee pata mai. I LOVE YOU SO SO SO MUCH KYA BATAU MAI, HAPPY BIRTHDAY BABYYYYYYYYY. Khoob saara enjoy karna aur humesha haste rehna, aur jab bhi mushkile aaye yaad rakhna mai humesha tere saath hu, HUMESHA HEHE, I LOVE YOU BABYYYYY MUAAAH. `;

export default function MessageSection() {
  const wordsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wordsRef.current) return;

    const words = wordsRef.current.querySelectorAll("span");

    gsap.fromTo(
      words,
      { opacity: 0.15, y: 10 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.03,
        ease: "power2.out",
        scrollTrigger: {
          trigger: wordsRef.current,
          start: "top 75%",
          end: "bottom 45%",
          scrub: 0.8,
        },
      }
    );

    return () => ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }, []);

  return (
    <section id="story" className="relative min-h-screen px-4 py-24 md:px-8">
      <div className="mx-auto max-w-5xl">
        <GlassCard className="relative overflow-hidden p-8 md:p-12">
          <div className="absolute inset-0" />
          <div ref={wordsRef} className="relative text-[clamp(1.1rem,2.4vw,1.7rem)] leading-relaxed text-stone-600">
            {letter.split(" ").map((word, index) => (
              <span key={`${word}-${index}`} className="mr-2 inline-block font-medium text-stone-700">
                {word}
              </span>
            ))}
          </div>
          <div className="relative mt-10 text-center text-[clamp(2rem,6vw,4.5rem)] font-black">
            <span style={{ color: "var(--ink)" }}>
              I Love You ♥
            </span>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
