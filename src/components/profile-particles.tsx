"use client";

import { useMemo, useState } from "react";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";

/**
 * tsParticles 기반 프로필 효과 컴포넌트.
 *
 * snow / confetti 는 app.embed.im Script 방식을 사용하므로 여기서 제외.
 * 이 컴포넌트가 처리하는 효과 (5개):
 *  - stars     : 별이 반짝이며 떠다님
 *  - fireworks : 불꽃놀이 (emitter 기반)
 *  - sakura    : 분홍 꽃잎이 흩날림 (emoji "🌸" 기반)
 *  - hearts    : 하트가 아래에서 위로 떠오름 (emoji "♥"/"❤" 기반)
 *  - bubbles   : 거품이 아래에서 위로 올라감
 *
 * 모든 효과는 fullScreen: enable 로 뷰포트 전체에 렌더링된다.
 * 컴포넌트 언마운트 시 tsParticles가 container.destroy()를 자동으로 호출한다.
 */

type ProfileEffect =
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

function starsOptions(): ISourceOptions {
  return {
    fullScreen: { enable: true, zIndex: 1 },
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
    fullScreen: { enable: true, zIndex: 1 },
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
    fullScreen: { enable: true, zIndex: 1 },
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
    fullScreen: { enable: true, zIndex: 1 },
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
    fullScreen: { enable: true, zIndex: 1 },
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
      return starsOptions();
  }
}

/* ---------- 컴포넌트 ---------- */

export function ProfileParticles({ effect }: { effect: string }) {
  const [id] = useState(
    () => `profile-particles-${effect}-${Math.random().toString(36).slice(2, 9)}`
  );

  const options = useMemo(() => {
    const valid: ProfileEffect[] = [
      "stars",
      "fireworks",
      "sakura",
      "hearts",
      "bubbles",
    ];
    return optionsFor(
      (valid as string[]).includes(effect) ? (effect as ProfileEffect) : "stars"
    );
  }, [effect]);

  // fullScreen: enable 이므로 tsParticles 가 document.body 에 canvas 를
  // position:fixed; inset:0 로 직접 append 한다.
  // 별도 wrapper div 불필요 (canvas 가 pointer-events:none 기본).
  return (
    <ParticlesProvider init={initEngine}>
      <Particles id={id} options={options} />
    </ParticlesProvider>
  );
}

export default ProfileParticles;
