import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";

type PresentationModeProps = {
  isOpen: boolean;
  onClose: () => void;
  content: string;
};

export function PresentationMode({ isOpen, onClose, content }: PresentationModeProps) {
  // Simple heuristic to split content into "slides" (paragraphs or headings)
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (content) {
      // Split by double newline to approximate paragraphs/blocks
      const rawSlides = content.split(/\n\n+/).filter((s) => s.trim().length > 0);
      setSlides(rawSlides);
      setCurrentSlide(0);
    }
  }, [content]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => {
          if (prev < slides.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 5000); // 5 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  if (!isOpen) return null;

  const nextSlide = () => setCurrentSlide((p) => Math.min(p + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((p) => Math.max(p - 1, 0));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-3xl text-[#E5E4E2]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D4AF37]/20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-serif font-bold text-[#D4AF37] tracking-widest uppercase">
              Executive Briefing
            </h2>
            <div className="flex gap-1">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlide ? "w-8 bg-[#D4AF37]" : "w-2 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 transition"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span className="text-sm font-medium">{isPlaying ? "Pause" : "Auto-Play"}</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center p-12 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              className="max-w-4xl w-full text-center"
            >
              <div className="text-3xl md:text-5xl leading-relaxed font-serif text-white/90 [&_h1]:text-6xl [&_h1]:text-[#D4AF37] [&_h1]:mb-6 [&_h2]:text-4xl [&_h2]:mb-4 [&_h3]:text-3xl [&_h3]:mb-4 [&_strong]:text-[#D4AF37] [&_strong]:font-bold [&_code]:text-emerald-400 [&_code]:bg-emerald-400/10 [&_code]:px-2 [&_code]:rounded-lg">
                <MarkdownRenderer content={slides[currentSlide] || ""} />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls overlay */}
          <div className="absolute inset-y-0 left-0 w-32 flex items-center justify-center">
            <button 
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-4 rounded-full bg-black/50 text-white/50 hover:bg-white/10 hover:text-white transition disabled:opacity-0"
            >
              <ChevronLeft size={32} />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 w-32 flex items-center justify-center">
            <button 
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="p-4 rounded-full bg-black/50 text-white/50 hover:bg-white/10 hover:text-white transition disabled:opacity-0"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
