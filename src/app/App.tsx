import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, ChevronDown } from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import coverImage from "../imports/IMG_8908-1.JPG";
import bunnyImage from "../imports/607264C9-FB5F-4FB3-8E45-6D8D227E3C8A-1.PNG";
// import audioFile from "../imports/Caera et Óengus Óg.wav";
const audioFile = "../imports/Caera_et_Óengus_Óg.wav";

interface LyricLine {
  start: number;
  end: number;
  text: string;
}

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const totalDuration = 127; // 2:07 in seconds

  // Parsed lyrics with timecodes
  const lyricLines: LyricLine[] = [
    { start: 0, end: 12, text: "♪" },
    { start: 13, end: 16, text: "Tout divaguant, allant jouant," },
    { start: 17, end: 20, text: "Avant toi, je dormais comme un loir." },
    { start: 21, end: 24, text: "Tout homme voguant, la passion est grande:" },
    { start: 25, end: 28, text: "Cela me rend plein de vin et de drames." },
    { start: 28, end: 32, text: "Je pleure de bonheur,\nEt je pleure de délice." },
    { start: 32, end: 36, text: "Même mis dans la bière,\nLe cœur toujours se crispe." },
    { start: 36, end: 39, text: "Je vis comme je crie,\nQue tous les hommes de la Terre" },
    { start: 40, end: 44, text: "Apprennent: l'amour est\nLa première lueur." },
    { start: 44, end: 47, text: "Tout chancelant, allant rêvant," },
    { start: 48, end: 51, text: "Avant toi, je vivais sans émoi." },
    { start: 52, end: 55, text: "Cœur tout brûlant, la fièvre est grande:" },
    { start: 56, end: 59, text: "Cela me rend plein de sel et de toi." },
    { start: 60, end: 63, text: "Tout vacillant, allant tremblant," },
    { start: 64, end: 67, text: "Avant toi, je flottais comme une épave." },
    { start: 68, end: 71, text: "Tout mon corps souffrant, la fièvre est grande:" },
    { start: 72, end: 75, text: "Cela me rend plein de cris et de laves." },
    { start: 76, end: 79, text: "Je pleure de bonheur,\nEt je pleure de délice." },
    { start: 79, end: 82, text: "Même mis dans la bière,\nLe cœur toujours se crispe." },
    { start: 83, end: 86, text: "Je vis comme je crie,\nQue tous les hommes de la Terre" },
    { start: 87, end: 90, text: "Apprennent: l'amour est\nLa première lueur." },
    { start: 90, end: 93, text: "Je pleure de bonheur,\nEt je pleure de délice." },
    { start: 94, end: 97, text: "Même mis dans la bière,\nLe cœur toujours se crispe." },
    { start: 97, end: 100, text: "Je vis comme je crie,\nQue tous les hommes de la Terre" },
    { start: 101, end: 104, text: "Apprennent: l'amour est\nLa première lueur." },
    { start: 104, end: 107, text: "Tout divaguant, allant jouant," },
    { start: 107, end: 110, text: "Avant toi, je dormais comme un loir." },
    { start: 111, end: 113, text: "Tout homme voguant, la passion est grande:" },
    { start: 114, end: 117, text: "Cela me rend plein de vin et de drames." },
    { start: 118, end: 127, text: "♥︎" },
  ];

  // Sync current time with audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('timeupdate', updateTime);
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, []);

  // Update active lyric based on current time
  useEffect(() => {
    const currentIndex = lyricLines.findIndex(
      (line) => currentTime >= line.start && currentTime <= line.end
    );
    
    if (currentIndex !== -1 && currentIndex !== activeLyricIndex) {
      setActiveLyricIndex(currentIndex);
      
      // Auto-scroll to active lyric
      if (lyricsContainerRef.current && showLyrics) {
        const activeElement = lyricsContainerRef.current.children[currentIndex] as HTMLElement;
        if (activeElement) {
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }
    }
  }, [currentTime, lyricLines, activeLyricIndex, showLyrics]);

  // Handle repeat
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [repeat]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return; // Don't handle clicks while dragging
    
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * totalDuration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateProgressFromEvent(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    updateProgressFromEvent(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateProgressFromEvent(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updateProgressFromEvent(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const updateProgressFromEvent = (clientX: number) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newTime = percentage * totalDuration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Add global mouse/touch event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRepeat = () => {
    setRepeat(!repeat);
  };

  const handleSkipToStart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleLyricClick = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const line = lyricLines[index];
    audio.currentTime = line.start;
    setCurrentTime(line.start);
    setActiveLyricIndex(index);
    
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Audio Element */}
      <audio ref={audioRef} src={audioFile} preload="auto" />

      {/* Background with gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${coverImage})`,
          filter: 'blur(50px)',
          transform: 'scale(1.2)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-rose-900/80 via-rose-800/70 to-pink-900/90" />

      {/* Main Player Container */}
      <div className="relative w-full max-w-md">
        <div className="bg-gradient-to-b from-rose-950/50 to-pink-950/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-rose-300/20">
          {/* Header Text */}
          <div className="text-center mb-6">
            <p className="text-rose-200 text-sm font-light italic">
              L'amour ne se paie qu'avec l'amour
            </p>
          </div>

          {/* Album Cover */}
          <div className="relative mb-8">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src={coverImage}
                alt="Album Cover"
                className="w-full h-full object-cover"
                style={{ objectPosition: '75% center' }}
              />
            </div>
          </div>

          {/* Song Info */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-white text-xl font-semibold mb-1">
                Caera et Óengus Óg
              </h1>
              <p className="text-rose-200 text-sm">
                Tre Amourno
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg ml-4 flex-shrink-0">
              <img 
                src={bunnyImage} 
                alt="Bunny" 
                className="w-10 h-10 object-cover rounded-full"
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div 
              ref={progressBarRef}
              className="h-1 bg-rose-950/50 rounded-full cursor-pointer group relative"
              onClick={handleProgressClick}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <div 
                className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full relative transition-all duration-100"
                style={{ width: `${(currentTime / totalDuration) * 100}%` }}
              >
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-opacity ${
                  isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
                }`} />
              </div>
            </div>
          </div>

          {/* Time Display */}
          <div className="flex justify-between text-xs text-rose-200 mb-6">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Shuffle */}
            <button 
              className="text-rose-200 hover:text-white transition-colors p-2"
              aria-label="Shuffle"
            >
              <Shuffle size={20} />
            </button>

            {/* Previous */}
            <button 
              onClick={handleSkipToStart}
              className="text-rose-200 hover:text-white transition-colors p-2"
              aria-label="Previous"
            >
              <SkipBack size={24} fill="currentColor" />
            </button>

            {/* Play/Pause */}
            <button 
              onClick={handlePlayPause}
              className="w-14 h-14 rounded-full bg-white hover:bg-rose-50 transition-all flex items-center justify-center shadow-lg hover:scale-105"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={28} fill="black" className="text-black" />
              ) : (
                <Play size={28} fill="black" className="text-black ml-1" />
              )}
            </button>

            {/* Next */}
            <button 
              onClick={handleSkipToStart}
              className="text-rose-200 hover:text-white transition-colors p-2"
              aria-label="Next"
            >
              <SkipForward size={24} fill="currentColor" />
            </button>

            {/* Repeat */}
            <button 
              onClick={handleRepeat}
              className={`transition-colors p-2 ${
                repeat ? 'text-rose-400' : 'text-rose-200 hover:text-white'
              }`}
              aria-label="Repeat"
            >
              <Repeat size={20} />
            </button>
          </div>

          {/* Lyrics Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowLyrics(true)}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              ТЕКСТ
            </button>
          </div>
        </div>
      </div>

      {/* Lyrics Modal */}
      {showLyrics && (
        <div 
          className="fixed inset-0 bg-gradient-to-b from-rose-950 to-pink-950 z-50 flex flex-col"
        >
          {/* Top Bar with Close Button */}
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setShowLyrics(false)}
              className="text-rose-200 hover:text-white transition-colors p-2"
            >
              <ChevronDown size={24} />
            </button>
            <div className="flex-1" />
          </div>

          {/* Song Info */}
          <div className="px-4 pb-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
              <ImageWithFallback
                src={coverImage}
                alt="Album Cover"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-semibold text-base truncate">
                Caera et Óengus Óg
              </h2>
              <p className="text-rose-200 text-sm truncate">
                Tre Amourno
              </p>
            </div>
          </div>

          {/* Single Tab */}
          <div className="flex border-b border-rose-300/20">
            <div className="flex-1 px-4 py-3 text-white text-sm font-medium border-b-2 border-rose-400 text-center">
              ТЕКСТ
            </div>
          </div>

          {/* Lyrics Content - Scrollable */}
          <div 
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto px-5 py-8"
          >
            <div className="space-y-4 pb-64">
              {lyricLines.map((line, index) => (
                <div
                  key={index}
                  onClick={() => handleLyricClick(index)}
                  className={`cursor-pointer transition-all duration-300 whitespace-pre-line font-bold ${
                    index === activeLyricIndex
                      ? 'text-white text-2xl'
                      : 'text-rose-300/40 text-sm'
                  }`}
                >
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
