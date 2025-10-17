// 音名の型定義
export type NoteName =
  | "A"
  | "Bb"
  | "C"
  | "C#"
  | "D"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#";

// オクターヴの型定義
export type Octave = 1 | 2 | 3 | 4 | 5 | 6;

// 波形の種類
export type WaveType = "sine" | "square" | "triangle" | "sawtooth";

// 構成音の型定義
export interface Note {
  noteName: NoteName;
  octave: Octave;
  cents: number; // -100 ～ 100
  volume: number; // 0 ～ 100
}

// プリセットの型定義
export interface Preset {
  name: string;
  baseFrequency: number;
  notes: Note[];
}

// localStorage保存用の設定データ
export interface AppSettings {
  baseFrequency: number;
  notes: Note[];
}

// localStorage保存用のプリセットデータ
export interface PresetStorage {
  presets: Preset[];
}
