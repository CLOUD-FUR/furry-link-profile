"use client";

import { useMemo, useState } from "react";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";

/**
 * tsParticles 기반 프로필 효과 컴포넌트.
 *
 * snow / confetti 는 app.embed.im Script 방식을 사용하므로 여기서 제외.
 * 이 컴포넌트가 처리하는 효과 (2개):
 *  - stars     : 별이 반짝이며 떠다님
 *  - bubbles   : 거품이 아래에서 위로 올라감
 *
 * 모든 효과는 fullScreen: enable 로 뷰포트 전체에 렌더링된다.
 * 컴포넌트 언마운트 시 tsParticles가 container.destroy()를 자동으로 호출한다.
 */

type ProfileEffect = "stars" | "bubbles";

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
    const valid: ProfileEffect[] = ["stars", "bubbles"];
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
