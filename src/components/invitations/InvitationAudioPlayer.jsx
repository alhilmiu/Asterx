import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function InvitationAudioPlayer({ audioUrl, autoPlay = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioUrl) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (autoPlay && !hasInteracted) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch(() => {
            // Browser autoplays might be blocked until user interacts
            setIsPlaying(false);
          });
      }
    }
  }, [audioUrl, autoPlay, hasInteracted]);

  if (!audioUrl) return null;

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    setHasInteracted(true);
  }

  return (
    <>
      <audio ref={audioRef} src={audioUrl} loop preload="auto" />
      <button
        type="button"
        onClick={togglePlay}
        className="invitation-audio-btn"
        aria-label={isPlaying ? "Matikan Musik" : "Putar Musik"}
        title={isPlaying ? "Matikan Musik" : "Putar Musik"}
      >
        {isPlaying ? (
          <div className="audio-anim-waves">
            <Volume2 size={20} />
            <span className="wave-bar bar-1"></span>
            <span className="wave-bar bar-2"></span>
            <span className="wave-bar bar-3"></span>
          </div>
        ) : (
          <VolumeX size={20} />
        )}
      </button>
    </>
  );
}
