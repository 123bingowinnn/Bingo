"use client";

/**
 * Atmosphere — fixed background layers behind everything else.
 * - Stars  (intensity tied to --star-density via globals.css)
 * - Aurora (intensity tied to --aurora-opacity via globals.css)
 * Both are pure CSS, zero JS animation cost.
 */
export function Atmosphere() {
  return (
    <>
      <div className="bg-stars" aria-hidden />
      <div className="bg-aurora" aria-hidden />
    </>
  );
}
