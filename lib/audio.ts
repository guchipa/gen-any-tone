import { Note, NoteName, WaveType } from "./types";

// 音名から半音数への変換マップ (A4 = 0 を基準)
const NOTE_TO_SEMITONE: Record<NoteName, number> = {
  A: 0,
  Bb: 1,
  C: 3,
  "C#": 4,
  D: 5,
  Eb: 6,
  E: 7,
  F: 8,
  "F#": 9,
  G: 10,
  "G#": 11,
};

/**
 * 構成音から周波数を計算する
 * @param note 構成音
 * @param baseFrequency A4の基準周波数
 * @returns 計算された周波数 (Hz)
 */
export function calculateFrequency(note: Note, baseFrequency: number): number {
  // A4からの半音数を計算
  const semitonesFromA4 =
    NOTE_TO_SEMITONE[note.noteName] + (note.octave - 4) * 12;

  // centを考慮した周波数計算
  // 1セントは半音の1/100なので、2^(cent/1200)を掛ける
  const centFactor = Math.pow(2, note.cents / 1200);

  // 周波数 = 基準周波数 × 2^(半音数/12) × cent補正
  const frequency =
    baseFrequency * Math.pow(2, semitonesFromA4 / 12) * centFactor;

  return frequency;
}

/**
 * 音高順に構成音をソートする
 * @param notes 構成音の配列
 * @param baseFrequency A4の基準周波数
 * @returns ソートされた構成音の配列
 */
export function sortNotesByPitch(notes: Note[], baseFrequency: number): Note[] {
  return [...notes].sort((a, b) => {
    const freqA = calculateFrequency(a, baseFrequency);
    const freqB = calculateFrequency(b, baseFrequency);
    return freqA - freqB;
  });
}

/**
 * 音声生成クラス
 */
export class AudioGenerator {
  private audioContext: AudioContext | null = null;
  private oscillators: Map<string, OscillatorNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private masterGain: GainNode | null = null;
  private waveType: WaveType = "sine";

  /**
   * AudioContextを初期化
   */
  private initAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      // マスターボリュームは1.0 (デバイス側で調整)
      this.masterGain.gain.value = 1.0;
    }
  }

  /**
   * 構成音のユニークキーを生成（centは含めない）
   */
  private getNoteKey(note: Note): string {
    return `${note.noteName}${note.octave}`;
  }

  /**
   * 波形タイプを設定
   */
  setWaveType(waveType: WaveType): void {
    this.waveType = waveType;
    // 既に再生中の音波にも適用
    this.oscillators.forEach((oscillator) => {
      oscillator.type = waveType;
    });
  }

  /**
   * 音声を再生
   * @param notes 構成音の配列
   * @param baseFrequency A4の基準周波数
   */
  play(notes: Note[], baseFrequency: number): void {
    if (notes.length === 0) return;

    this.initAudioContext();
    if (!this.audioContext || !this.masterGain) return;

    // 既存の音を停止
    this.stop();

    // 各構成音に対してオシレータを生成
    notes.forEach((note) => {
      if (!this.audioContext || !this.masterGain) return;

      const frequency = calculateFrequency(note, baseFrequency);
      const noteKey = this.getNoteKey(note);

      // オシレータの生成
      const oscillator = this.audioContext.createOscillator();
      oscillator.type = this.waveType;
      oscillator.frequency.value = frequency;

      // ゲインノードの生成 (音量調整用)
      const gainNode = this.audioContext.createGain();
      // volume は 0-100 なので 0-1 に正規化
      gainNode.gain.value = note.volume / 100;

      // 接続: オシレータ → ゲイン → マスターゲイン → スピーカー
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      // 再生開始
      oscillator.start();

      // 保存
      this.oscillators.set(noteKey, oscillator);
      this.gainNodes.set(noteKey, gainNode);
    });
  }

  /**
   * 音声を停止
   */
  stop(): void {
    // すべてのオシレータを停止
    this.oscillators.forEach((oscillator) => {
      oscillator.stop();
      oscillator.disconnect();
    });

    // すべてのゲインノードを切断
    this.gainNodes.forEach((gainNode) => {
      gainNode.disconnect();
    });

    // クリア
    this.oscillators.clear();
    this.gainNodes.clear();
  }

  /**
   * 特定の構成音の音量を更新
   * @param note 構成音
   * @param volume 新しい音量 (0-100)
   */
  updateVolume(note: Note, volume: number): void {
    const noteKey = this.getNoteKey(note);
    const gainNode = this.gainNodes.get(noteKey);

    if (gainNode) {
      gainNode.gain.value = volume / 100;
    }
  }

  /**
   * 特定の構成音のcentを更新 (周波数を変更)
   * @param note 構成音
   * @param cents 新しいcent値
   * @param baseFrequency A4の基準周波数
   */
  updateCents(note: Note, cents: number, baseFrequency: number): void {
    const noteKey = this.getNoteKey(note);
    const oscillator = this.oscillators.get(noteKey);

    if (oscillator) {
      const updatedNote = { ...note, cents };
      const newFrequency = calculateFrequency(updatedNote, baseFrequency);
      oscillator.frequency.value = newFrequency;
    }
  }

  /**
   * 再生中かどうかを確認
   */
  isPlaying(): boolean {
    return this.oscillators.size > 0;
  }

  /**
   * リソースをクリーンアップ
   */
  dispose(): void {
    this.stop();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.masterGain = null;
  }
}
