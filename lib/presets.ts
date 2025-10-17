import { Preset } from "./types";

const PRESETS_KEY = "genAnyTone_presets";

/**
 * プリセットをlocalStorageから読み込む
 */
export function loadPresets(): Preset[] {
  try {
    const data = localStorage.getItem(PRESETS_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    return parsed.presets || [];
  } catch (error) {
    console.error("Failed to load presets:", error);
    return [];
  }
}

/**
 * プリセットをlocalStorageに保存
 */
export function savePresets(presets: Preset[]): void {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify({ presets }));
  } catch (error) {
    console.error("Failed to save presets:", error);
  }
}

/**
 * 新しいプリセットを追加
 */
export function addPreset(preset: Preset): Preset[] {
  const presets = loadPresets();
  const newPresets = [...presets, preset];
  savePresets(newPresets);
  return newPresets;
}

/**
 * プリセットを削除
 */
export function deletePreset(index: number): Preset[] {
  const presets = loadPresets();
  const newPresets = presets.filter((_, i) => i !== index);
  savePresets(newPresets);
  return newPresets;
}
