"use client";

import { useEffect } from "react";

export function ProfileVisitTracker({ handle }: { handle: string }) {
  useEffect(() => {
    if (!handle) return;
    fetch(`/api/profile-visit?handle=${encodeURIComponent(handle)}`).catch(
      () => {}
    );
  }, [handle]);

  return null;
}
