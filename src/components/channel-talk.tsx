"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * ChannelTalk (Channel.io) inquiry widget.
 *
 * Loads the Channel.io SDK and boots the widget so users can open
 * a chat/inquiry panel. The widget is managed by Channel.io itself
 * (it renders its own floating launcher button).
 *
 * Set NEXT_PUBLIC_CHANNEL_IO_PLUGIN_KEY in your env to enable.
 * If the key is missing, the widget silently does nothing.
 */

declare global {
  interface Window {
    ChannelIO?: any;
    ChannelIOInitialized?: boolean;
  }
}

const PLUGIN_KEY = process.env.NEXT_PUBLIC_CHANNEL_IO_PLUGIN_KEY ?? "";

export function ChannelTalk() {
  const pathname = usePathname();
  const shouldShow =
    pathname === "/dashboard" || pathname?.startsWith("/dashboard/");

  useEffect(() => {
    if (!shouldShow) return;
    if (!PLUGIN_KEY) return;
    if (window.ChannelIOInitialized) return;

    const script = document.createElement("script");
    script.src = "https://cdn.channel.io/plugin/ch-plugin-web.js";
    script.async = true;
    script.onload = () => {
      if (window.ChannelIO && !window.ChannelIOInitialized) {
        try {
          window.ChannelIO("boot", { pluginKey: PLUGIN_KEY });
          window.ChannelIOInitialized = true;
        } catch {
          /* ignore */
        }
      }
    };
    document.head.appendChild(script);
  }, [shouldShow]);

  return null;
}

export default ChannelTalk;
