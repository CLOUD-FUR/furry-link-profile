"use client";

import { useEffect, useMemo, useState } from "react";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";

/**
 * 프로필 카드 내부에 렌더링되는 tsParticles 기반 효과 컴포넌트.
 *
 * 지원 효과:
 *  - snow      : 눈송이가 위에서 아래로 떨어짐 (커스텀 config, preset-snow와 유사)
 *  - confetti  : 색종이 조각이 폭발하며 떨어짐 (커스텀 config, preset-confetti와 유사)
 *  - stars     : 별이 반짝이며 떠다님 (커스텀 config, preset-stars와 유사)
 *  - fireworks : 불꽃놀이 (emitter 기반 커스텀 config)
 *  - sakura    : 분홍 꽃잎이 위에서 아래로 흩날리며 회전 (emoji char "🌸" 기반)
 *  - hearts    : 빨간/분홍 하트가 아래에서 위로 떠오름 (emoji char "♥"/"❤" 기반)
 *  - bubbles   : 투명한 거품이 아래에서 위로 올라감 (circle 기반)
 *
 * 모든 효과는 fullScreen: false 로 프로필 카드 영역에만 적용된다.
 * 컴포넌트 언마운트 시 tsParticles가 container.destroy()를 자동으로 호출한다.
 */

type ProfileEffect =
  | "snow"
  | "confetti"
  | "stars"
  | "fireworks"
  | "sakura"
  | "hearts"
  | "bubbles";

/* ---------- engine 초기화 (한 번만) ---------- */

let enginePromise: Promise<void> | null = null;

async function initEngine(engine: Engine): Promise<void> {
  // slim 번들: circle, star, emoji, image, polygon, line, square 등
  // 기본 shape + move, opacity, size, out-modes, rotate, tilt, wobble, emitters 등 포함
  await loadSlim(engine);
}

/* ---------- 효과별 options ---------- */

function snowOptions(): ISourceOptions {
  return {
    fullScreen: { enable: false },
    background: { color: "transparent" },
    particles: {
      number: { value: 80, density: { enable: true } },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.4, max: 0.9 },
        animation: { enable: true, speed: 0.5, sync: false },
      },
      size: {
        value: { min: 1, max: 4 },
      },
      move: {
        enable: true,
        direction: "bottom" as any,
        straight: false,
        speed: { min: 1, max: 2.5 },
        outModes: { default: "out" as any },
      },
      wobble: {
        enable: true,
        distance: 10,
        speed: { min: -2, max: 2 },
      },
    },
    detectRetina: true,
  };
}

function confettiOptions(): ISourceOptions {
  return {
    fullScreen: { enable: false },
    background: { color: "transparent" },
    particles: {
      number: { value: 0, density: { enable: false } },
      color: {
        value: [
          "#fbbf24",
          "#f87171",
          "#60a5fa",
          "#34d399",
          "#a78bfa",
          "#f472b6",
          "#facc15",
        ],
      },
      shape: {
        type: ["square", "circle"],
      },
      opacity: {
        value: { min: 0.7, max: 1 },
      },
      size: {
        value: { min: 3, max: 7 },
      },
      move: {
        enable: true,
        gravity: { enable: true, acceleration: 15 },
        direction: "none" as any,
        straight: false,
        speed: { min: 10, max: 25 },
        outModes: { default: "destroy" as any, top: "destroy" as any },
      },
      rotate: {
        enable: true,
        animation: { enable: true, speed: { min: 5, max: 15 }, sync: false },
      },
      tilt: {
        enable: true,
        animation: { enable: true, speed: { min: 0, max: 10 }, sync: false },
        direction: "random" as any,
      },
      wobble: {
        enable: true,
        distance: 10,
        speed: { min: -5, max: 5 },
      },
    },
    emitters: [
      {
        life: { count: 0, duration: 0.1 },
        rate: { delay: 0.2, quantity: 8 },
        size: { width: 0, height: 0 },
        position: { x: 50, y: 0 },
        particles: {
          move: {
            direction: "bottom" as any,
            speed: { min: 10, max: 25 },
          },
        },
      },
    ],
    detectRetina: true,
  };
}

function starsOptions(): ISourceOptions {
  return {
    fullScreen: { enable: false },
    background: { color: "transparent" },
    particles: {
      number: { value: 60, density: { enable: true } },
      color: { value: ["#ffffff", "#fde68a", "#bfdbfe"] },
      shape: { type: "star" },
      opacity: {
        value: { min: 0.2, max: 1 },
        animation: {
          enable: true,
          speed: 1.2,
          sync: false,
        },
      },
      size: {
        value: { min: 1, max: 3 },
      },
      move: {
        enable: true,
        direction: "none" as any,
        random: true,
        straight: false,
        speed: { min: 0.1, max: 0.4 },
        outModes: { default: "out" as any },
      },
    },
    detectRetina: true,
  };
}

function fireworksOptions(): ISourceOptions {
  return {
    fullScreen: { enable: false },
    background: { color: "transparent" },
    particles: {
      number: { value: 0 },
      color: {
        value: [
          "#fbbf24",
          "#f87171",
          "#60a5fa",
          "#34d399",
          "#a78bfa",
          "#f472b6",
          "#ffffff",
        ],
      },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.4, max: 0.9 },
        animation: {
          enable: true,
          speed: 1.5,
          sync: false,
          startValue: "max" as any,
          destroy: "min" as any,
        },
      },
      size: {
        value: { min: 1, max: 3 },
        animation: {
          enable: true,
          speed: 2,
          sync: false,
          startValue: "min" as any,
          destroy: "max" as any,
        },
      },
      move: {
        enable: true,
        gravity: { enable: true, acceleration: 8 },
        speed: { min: 5, max: 15 },
        direction: "none" as any,
        random: true,
        straight: false,
        outModes: { default: "destroy" as any },
      },
      life: {
        duration: { value: { min: 1, max: 2.5 } },
        count: 1,
      },
    },
    emitters: [
      {
        life: { count: 0, duration: 0.1, delay: 0.4 },
        rate: { delay: 0.15, quantity: 1 },
        size: { width: 0, height: 0 },
        position: { x: 50, y: 30 },
        particles: {
          move: {
            direction: "none" as any,
            speed: { min: 8, max: 16 },
          },
          number: { value: 0 },
          color: {
            value: [
              "#fbbf24",
              "#f87171",
              "#60a5fa",
              "#34d399",
              "#a78bfa",
              "#f472b6",
            ],
          },
          size: {
            value: { min: 2, max: 4 },
          },
          opacity: {
            value: { min: 0.6, max: 1 },
          },
          life: {
            duration: { value: { min: 0.8, max: 1.8 } },
            count: 1,
          },
        },
      },
    ],
    detectRetina: true,
  };
}

function sakuraOptions(): ISourceOptions {
  // 벚꽃 꽃잎 — emoji char "🌸" 을 shape로 사용
  // @tsparticles/slim 에는 shape-emoji 가 포함되어 있음
  return {
    fullScreen: { enable: false },
    background: { color: "transparent" },
    particles: {
      number: { value: 40, density: { enable: true } },
      color: { value: ["#fbcfe8", "#f9a8d4", "#fda4af", "#fecdd3"] },
      shape: {
        type: "emoji",
        options: {
          emoji: {
            value: ["🌸", "🌺", "💮"],
          },
        },
      },
      opacity: {
        value: { min: 0.6, max: 1 },
      },
      size: {
        value: { min: 8, max: 16 },
      },
      move: {
        enable: true,
        direction: "bottom" as any,
        straight: false,
        speed: { min: 0.8, max: 2 },
        outModes: { default: "out" as any },
      },
      rotate: {
        enable: true,
        animation: {
          enable: true,
          speed: { min: -3, max: 3 },
          sync: false,
        },
      },
      wobble: {
        enable: true,
        distance: 12,
        speed: { min: -2, max: 2 },
      },
      tilt: {
        enable: true,
        animation: {
          enable: true,
          speed: { min: 0, max: 10 },
          sync: false,
        },
        direction: "random" as any,
      },
    },
    detectRetina: true,
  };
}

function heartsOptions(): ISourceOptions {
  // 하트 — emoji char "❤" / "♥" / "💗" 을 shape로 사용
  // 아래에서 위로 떠오르도록 direction: top
  return {
    fullScreen: { enable: false },
    background: { color: "transparent" },
    particles: {
      number: { value: 30, density: { enable: true } },
      color: { value: ["#ef4444", "#f472b6", "#fb7185", "#fda4af"] },
      shape: {
        type: "emoji",
        options: {
          emoji: {
            value: ["❤", "♥", "💗", "💕"],
          },
        },
      },
      opacity: {
        value: { min: 0.5, max: 1 },
        animation: {
          enable: true,
          speed: 0.8,
          sync: false,
        },
      },
      size: {
        value: { min: 8, max: 18 },
      },
      move: {
        enable: true,
        direction: "top" as any,
        straight: false,
        speed: { min: 0.8, max: 2 },
        outModes: { default: "out" as any },
      },
      wobble: {
        enable: true,
        distance: 10,
        speed: { min: -2, max: 2 },
      },
      rotate: {
        enable: true,
        animation: {
          enable: true,
          speed: { min: -2, max: 2 },
          sync: false,
        },
      },
    },
    detectRetina: true,
  };
}

function bubblesOptions(): ISourceOptions {
  // 거품 — 투명한 원형 입자가 아래에서 위로
  return {
    fullScreen: { enable: false },
    background: { color: "transparent" },
    particles: {
      number: { value: 35, density: { enable: true } },
      color: { value: ["#bfdbfe", "#bae6fd", "#e0f2fe", "#ffffff"] },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.2, max: 0.6 },
        animation: {
          enable: true,
          speed: 0.6,
          sync: false,
        },
      },
      size: {
        value: { min: 4, max: 14 },
        animation: {
          enable: true,
          speed: 1.5,
          sync: false,
          startValue: "min" as any,
          destroy: "max" as any,
        },
      },
      move: {
        enable: true,
        direction: "top" as any,
        straight: false,
        speed: { min: 0.6, max: 1.8 },
        outModes: { default: "out" as any },
      },
      wobble: {
        enable: true,
        distance: 8,
        speed: { min: -1.5, max: 1.5 },
      },
    },
    detectRetina: true,
  };
}

function optionsFor(effect: ProfileEffect): ISourceOptions {
  switch (effect) {
    case "snow":
      return snowOptions();
    case "confetti":
      return confettiOptions();
    case "stars":
      return starsOptions();
    case "fireworks":
      return fireworksOptions();
    case "sakura":
      return sakuraOptions();
    case "hearts":
      return heartsOptions();
    case "bubbles":
      return bubblesOptions();
    default:
      return snowOptions();
  }
}

/* ---------- 컴포넌트 ---------- */

export function ProfileParticles({ effect }: { effect: string }) {
  const [id] = useState(
    () => `profile-particles-${effect}-${Math.random().toString(36).slice(2, 9)}`
  );

  const options = useMemo(() => {
    const valid: ProfileEffect[] = [
      "snow",
      "confetti",
      "stars",
      "fireworks",
      "sakura",
      "hearts",
      "bubbles",
    ];
    return optionsFor(
      (valid as string[]).includes(effect) ? (effect as ProfileEffect) : "snow"
    );
  }, [effect]);

  // 엔진 초기화는 ParticlesProvider init prop 으로 전달하면 된다.
  // ParticlesProvider 가 마운트될 때 한 번 호출된다.

  return (
    <ParticlesProvider init={initEngine}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <Particles
          id={id}
          options={options}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </ParticlesProvider>
  );
}

export default ProfileParticles;
