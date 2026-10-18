"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import clsx from "clsx";

interface ImageCropperProps {
  imageSrc: string;
  aspect: number;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  isDark?: boolean;
}

export function ImageCropper({
  imageSrc,
  aspect,
  onCropComplete,
  onCancel,
  isDark = false,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoomValue: number) => {
    setZoom(zoomValue);
  }, []);

  const onCropCompleteInternal = useCallback(
    (_croppedArea: Area, croppedAreaPx: Area) => {
      setCroppedAreaPixels(croppedAreaPx);
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);

    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(blob);
    } catch (error) {
      console.error("Crop failed:", error);
      alert("이미지 크롭에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setProcessing(false);
    }
  }, [imageSrc, croppedAreaPixels, onCropComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className={clsx(
          "relative w-full max-w-3xl mx-4 rounded-3xl shadow-2xl overflow-hidden",
          isDark
            ? "bg-slate-900/95 border border-white/15"
            : "bg-white/95 border border-slate-200"
        )}
      >
        <div className="p-6">
          <h2
            className={clsx(
              "text-2xl font-black mb-4",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            이미지 크롭
          </h2>

          <div className="relative h-[400px] bg-slate-950 rounded-2xl overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropCompleteInternal}
            />
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label
                className={clsx(
                  "block text-sm font-semibold mb-2",
                  isDark ? "text-white/90" : "text-slate-800"
                )}
              >
                확대/축소
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={processing}
                className={clsx(
                  "flex-1 rounded-2xl px-6 py-3 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]",
                  processing
                    ? "bg-slate-400 text-white cursor-not-allowed"
                    : isDark
                      ? "bg-white text-slate-900 hover:bg-slate-100"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                )}
              >
                {processing ? "처리중..." : "적용"}
              </button>
              <button
                onClick={onCancel}
                disabled={processing}
                className={clsx(
                  "flex-1 rounded-2xl px-6 py-3 font-bold border transition-all hover:scale-[1.02] active:scale-[0.98]",
                  processing
                    ? "opacity-50 cursor-not-allowed"
                    : "",
                  isDark
                    ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
                    : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                )}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context를 생성할 수 없습니다.");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas를 Blob으로 변환하는 데 실패했습니다."));
      }
    }, "image/jpeg", 0.92);
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}
