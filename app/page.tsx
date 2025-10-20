"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Note, NoteName, Octave, WaveType, Preset } from "@/lib/types";
import { AudioGenerator, sortNotesByPitch } from "@/lib/audio";
import { PresetManager } from "@/components/PresetManager";

// 音名の選択肢
const NOTE_NAMES: NoteName[] = [
  "A",
  "Bb",
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "G#",
];

// オクターヴの選択肢
const OCTAVES: Octave[] = [1, 2, 3, 4, 5, 6];

// 波形の選択肢
const WAVE_TYPES: { value: WaveType; label: string }[] = [
  { value: "sine", label: "正弦波" },
  { value: "square", label: "矩形波" },
  { value: "triangle", label: "三角波" },
  { value: "sawtooth", label: "ノコギリ波" },
];

// デフォルト構成音
const DEFAULT_NOTES: Note[] = [
  { noteName: "Bb", octave: 4, cents: 0, volume: 50 },
  { noteName: "D", octave: 4, cents: -13.6, volume: 50 },
  { noteName: "F", octave: 4, cents: 2, volume: 50 },
];

export default function Home() {
  // 基準周波数 (A4)
  const [baseFrequency, setBaseFrequency] = useState<number>(442);

  // 構成音リスト
  const [notes, setNotes] = useState<Note[]>(DEFAULT_NOTES);

  // 入力フォームの状態
  const [selectedNoteName, setSelectedNoteName] = useState<NoteName>("A");
  const [selectedOctave, setSelectedOctave] = useState<Octave>(4);
  const [inputCents, setInputCents] = useState<number>(0);

  // 波形タイプ
  const [waveType, setWaveType] = useState<WaveType>("sine");

  // 再生状態
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // エラーメッセージ
  const [errorMessage, setErrorMessage] = useState<string>("");

  // AudioGeneratorのインスタンス
  const audioGeneratorRef = useRef<AudioGenerator | null>(null);

  // AudioGeneratorの初期化
  useEffect(() => {
    audioGeneratorRef.current = new AudioGenerator();

    return () => {
      // クリーンアップ
      if (audioGeneratorRef.current) {
        audioGeneratorRef.current.dispose();
      }
    };
  }, []);

  // localStorageから設定を読み込み
  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setBaseFrequency(settings.baseFrequency || 442);
        setNotes(settings.notes || DEFAULT_NOTES);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  }, []);

  // localStorageに設定を保存
  useEffect(() => {
    localStorage.setItem(
      "appSettings",
      JSON.stringify({ baseFrequency, notes })
    );
  }, [baseFrequency, notes]);

  // 波形タイプ変更時の処理
  useEffect(() => {
    if (audioGeneratorRef.current) {
      audioGeneratorRef.current.setWaveType(waveType);
    }
  }, [waveType]);

  // 構成音を追加
  const addNote = () => {
    setErrorMessage("");

    // バリデーション: cent範囲チェック
    if (inputCents < -100 || inputCents > 100) {
      setErrorMessage("cent調整は -100 から 100 の範囲で入力してください。");
      return;
    }

    // 重複チェック
    const isDuplicate = notes.some(
      (note) =>
        note.noteName === selectedNoteName &&
        note.octave === selectedOctave &&
        note.cents === inputCents
    );

    if (isDuplicate) {
      setErrorMessage("この構成音は既に追加されています。");
      return;
    }

    // 新しい構成音を追加
    const newNote: Note = {
      noteName: selectedNoteName,
      octave: selectedOctave,
      cents: inputCents,
      volume: 50, // デフォルト音量
    };

    setNotes([...notes, newNote]);

    // フォームをリセット
    setInputCents(0);
  };

  // 構成音を削除
  const deleteNote = (index: number) => {
    const newNotes = notes.filter((_, i) => i !== index);
    setNotes(newNotes);

    // 再生中の場合は再起動
    if (isPlaying && audioGeneratorRef.current) {
      audioGeneratorRef.current.stop();
      if (newNotes.length > 0) {
        audioGeneratorRef.current.play(newNotes, baseFrequency);
      } else {
        setIsPlaying(false);
      }
    }
  };

  // 構成音のcent値を更新
  const updateNoteCents = (index: number, cents: number) => {
    if (cents < -100 || cents > 100) return;

    const newNotes = [...notes];
    const oldNote = notes[index];
    newNotes[index] = { ...newNotes[index], cents };
    setNotes(newNotes);

    // 再生中の場合はリアルタイム更新
    if (isPlaying && audioGeneratorRef.current) {
      // 古いnoteのキーで検索して、新しいcent値を適用
      audioGeneratorRef.current.updateCents(oldNote, cents, baseFrequency);
    }
  };

  // 構成音の音量を更新
  const updateNoteVolume = (index: number, volume: number) => {
    const newNotes = [...notes];
    newNotes[index] = { ...newNotes[index], volume };
    setNotes(newNotes);

    // 再生中の場合はリアルタイム更新
    if (isPlaying && audioGeneratorRef.current) {
      audioGeneratorRef.current.updateVolume(newNotes[index], volume);
    }
  };

  // 再生
  const play = () => {
    if (notes.length === 0) return;

    if (audioGeneratorRef.current) {
      audioGeneratorRef.current.play(notes, baseFrequency);
      setIsPlaying(true);
    }
  };

  // 停止
  const stop = () => {
    if (audioGeneratorRef.current) {
      audioGeneratorRef.current.stop();
      setIsPlaying(false);
    }
  };

  // プリセットを読み込み
  const handleLoadPreset = (preset: Preset) => {
    // 再生中の場合は停止
    if (isPlaying) {
      stop();
    }

    setBaseFrequency(preset.baseFrequency);
    setNotes(preset.notes);
  };

  // 音高順にソートされた構成音
  const sortedNotes = sortNotesByPitch(notes, baseFrequency);

  return (
    <main className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">
        GenAnyTone - 純正律音波ジェネレータ
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基準周波数設定 */}
          <Card>
            <CardHeader>
              <CardTitle>基準周波数設定</CardTitle>
              <CardDescription>
                A4の周波数を設定します (300-500 Hz)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="baseFrequency">A4 周波数 (Hz)</Label>
                  <Input
                    id="baseFrequency"
                    type="number"
                    min={300}
                    max={500}
                    value={baseFrequency}
                    onChange={(e) => setBaseFrequency(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 構成音の入力 */}
          <Card>
            <CardHeader>
              <CardTitle>構成音の追加</CardTitle>
              <CardDescription>和音を構成する音を追加します</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="noteName">音名</Label>
                    <Select
                      value={selectedNoteName}
                      onValueChange={(value) =>
                        setSelectedNoteName(value as NoteName)
                      }
                    >
                      <SelectTrigger id="noteName" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NOTE_NAMES.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="octave">オクターヴ</Label>
                    <Select
                      value={String(selectedOctave)}
                      onValueChange={(value) =>
                        setSelectedOctave(Number(value) as Octave)
                      }
                    >
                      <SelectTrigger id="octave" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OCTAVES.map((oct) => (
                          <SelectItem key={oct} value={String(oct)}>
                            {oct}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cents">cent調整</Label>
                    <Input
                      id="cents"
                      type="number"
                      min={-100}
                      max={100}
                      step={0.1}
                      value={inputCents}
                      onChange={(e) => setInputCents(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                )}

                <Button onClick={addNote} className="w-full">
                  構成音を追加
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 構成音リスト */}
          <Card>
            <CardHeader>
              <CardTitle>構成音リスト ({notes.length}個)</CardTitle>
              <CardDescription>音高順に表示されます</CardDescription>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <p className="text-gray-500">構成音が追加されていません</p>
              ) : (
                <div className="space-y-4">
                  {sortedNotes.map((note) => {
                    // 元の配列でのインデックスを取得（ユニークキーとして使用）
                    const originalIndex = notes.findIndex(
                      (n) =>
                        n.noteName === note.noteName &&
                        n.octave === note.octave &&
                        Math.abs(n.cents - note.cents) < 0.001 &&
                        n.volume === note.volume
                    );

                    return (
                      <div
                        key={originalIndex}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-lg">
                            {note.noteName}
                            {note.octave}
                          </span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteNote(originalIndex)}
                          >
                            削除
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {/* cent調整セクション */}
                          <div className="bg-gray-50 dark:bg-blue-950 p-3 rounded-md border border-gray-200 dark:border-gray-800">
                            <Label
                              htmlFor={`cents-${originalIndex}`}
                              className="text-gray-700 dark:text-gray-300 font-semibold"
                            >
                              🎵 cent調整: {note.cents.toFixed(1)}
                            </Label>
                            <div className="mt-2 space-y-2">
                              <Slider
                                id={`cents-slider-${originalIndex}`}
                                min={-100}
                                max={100}
                                step={0.1}
                                value={[note.cents]}
                                onValueChange={(value) =>
                                  updateNoteCents(originalIndex, value[0])
                                }
                              />
                              <Input
                                id={`cents-${originalIndex}`}
                                type="number"
                                min={-100}
                                max={100}
                                step={0.1}
                                value={note.cents}
                                onChange={(e) =>
                                  updateNoteCents(
                                    originalIndex,
                                    Number(e.target.value)
                                  )
                                }
                                className="max-w-[120px]"
                              />
                            </div>
                          </div>

                          {/* 音量調整セクション */}
                          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                            <Label
                              htmlFor={`volume-${originalIndex}`}
                              className="text-gray-700 dark:text-gray-300 font-semibold"
                            >
                              🔊 音量: {note.volume}
                            </Label>
                            <Slider
                              id={`volume-${originalIndex}`}
                              min={0}
                              max={100}
                              step={1}
                              value={[note.volume]}
                              onValueChange={(value) =>
                                updateNoteVolume(originalIndex, value[0])
                              }
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* サイドバー (コントロールパネル) */}
        <div className="space-y-6">
          {/* 再生コントロール */}
          <Card>
            <CardHeader>
              <CardTitle>再生コントロール</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="waveType">波形</Label>
                <Select
                  value={waveType}
                  onValueChange={(value) => setWaveType(value as WaveType)}
                >
                  <SelectTrigger id="waveType" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WAVE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {!isPlaying ? (
                  <Button
                    onClick={play}
                    disabled={notes.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    ▶ 再生
                  </Button>
                ) : (
                  <Button
                    onClick={stop}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    ■ 停止
                  </Button>
                )}
                {notes.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">
                    構成音を追加してください
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* プリセット機能 */}
          <PresetManager
            baseFrequency={baseFrequency}
            notes={notes}
            onLoadPreset={handleLoadPreset}
          />
        </div>
      </div>
    </main>
  );
}
