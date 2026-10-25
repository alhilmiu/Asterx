import ModernMinimalistTemplate from "./ModernMinimalistTemplate";
import RusticFloralTemplate from "./RusticFloralTemplate";
import RoyalVelvetTemplate from "./RoyalVelvetTemplate";

export default function TemplateRenderer({
  templateKey = "modern-minimalist",
  invitation,
  guestName = "",
  rsvps = [],
  onRsvpSubmit,
}) {
  const normalizedKey = (templateKey || "").toLowerCase();

  if (normalizedKey === "rustic-floral" || normalizedKey.includes("rustic")) {
    return (
      <RusticFloralTemplate
        invitation={invitation}
        guestName={guestName}
        rsvps={rsvps}
        onRsvpSubmit={onRsvpSubmit}
      />
    );
  }

  if (normalizedKey === "royal-velvet" || normalizedKey.includes("royal")) {
    return (
      <RoyalVelvetTemplate
        invitation={invitation}
        guestName={guestName}
        rsvps={rsvps}
        onRsvpSubmit={onRsvpSubmit}
      />
    );
  }

  // Default fallback: Modern Minimalist
  return (
    <ModernMinimalistTemplate
      invitation={invitation}
      guestName={guestName}
      rsvps={rsvps}
      onRsvpSubmit={onRsvpSubmit}
    />
  );
}
