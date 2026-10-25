import { useState, useEffect } from "react";

export default function InvitationCountdown({ targetDate, theme = "minimal" }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  useEffect(() => {
    if (!targetDate) return;

    function calculateTime() {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isOver) {
    return (
      <div className={`countdown-wrapper countdown-${theme}`}>
        <p className="countdown-over-text">Acara Sedang / Telah Berlangsung</p>
      </div>
    );
  }

  return (
    <div className={`countdown-wrapper countdown-${theme}`}>
      <div className="countdown-box">
        <span className="countdown-num">{String(timeLeft.days).padStart(2, "0")}</span>
        <span className="countdown-label">Hari</span>
      </div>
      <span className="countdown-divider">:</span>
      <div className="countdown-box">
        <span className="countdown-num">{String(timeLeft.hours).padStart(2, "0")}</span>
        <span className="countdown-label">Jam</span>
      </div>
      <span className="countdown-divider">:</span>
      <div className="countdown-box">
        <span className="countdown-num">{String(timeLeft.minutes).padStart(2, "0")}</span>
        <span className="countdown-label">Menit</span>
      </div>
      <span className="countdown-divider">:</span>
      <div className="countdown-box">
        <span className="countdown-num">{String(timeLeft.seconds).padStart(2, "0")}</span>
        <span className="countdown-label">Detik</span>
      </div>
    </div>
  );
}
