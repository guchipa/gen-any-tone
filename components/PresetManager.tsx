"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Preset, Note } from "@/lib/types";
import { loadPresets, addPreset, deletePreset } from "@/lib/presets";

interface PresetManagerProps {
  baseFrequency: number;
  notes: Note[];
  onLoadPreset: (preset: Preset) => void;
}

export function PresetManager({
  baseFrequency,
  notes,
  onLoadPreset,
}: PresetManagerProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState<string>("");
  const [saveError, setSaveError] = useState<string>("");

  // 初回マウント時にプリセットを読み込む
  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  // プリセットを保存
  const handleSavePreset = () => {
    setSaveError("");

    // バリデーション
    if (!presetName.trim()) {
      setSaveError("プリセット名を入力してください");
      return;
    }

    if (notes.length === 0) {
      setSaveError("構成音が1つ以上必要です");
      return;
    }

    // 新しいプリセットを作成
    const newPreset: Preset = {
      name: presetName.trim(),
      baseFrequency,
      notes: [...notes],
    };

    // プリセットを追加
    const updatedPresets = addPreset(newPreset);
    setPresets(updatedPresets);
    setPresetName("");
  };

  // プリセットを削除
  const handleDeletePreset = (index: number) => {
    const updatedPresets = deletePreset(index);
    setPresets(updatedPresets);
  };

  // プリセットを読み込み
  const handleLoadPreset = (preset: Preset) => {
    onLoadPreset(preset);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>プリセット</CardTitle>
        <CardDescription>設定の保存と読み込み</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* プリセット保存 */}
        <div className="space-y-2">
          <Label htmlFor="presetName">プリセット名</Label>
          <Input
            id="presetName"
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="例: 純正律の長三和音"
          />
          {saveError && <p className="text-sm text-red-500">{saveError}</p>}
          <Button onClick={handleSavePreset} className="w-full">
            現在の設定を保存
          </Button>
        </div>

        {/* プリセット一覧 */}
        <div className="space-y-2">
          <Label>保存済みプリセット ({presets.length}個)</Label>
          {presets.length === 0 ? (
            <p className="text-sm text-gray-500">
              保存されたプリセットはありません
            </p>
          ) : (
            <div className="space-y-2">
              {presets.map((preset, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="font-semibold">{preset.name}</div>
                  <div className="text-sm text-gray-600">
                    A4: {preset.baseFrequency}Hz, 構成音: {preset.notes.length}
                    個
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleLoadPreset(preset)}
                      size="sm"
                      className="flex-1"
                    >
                      読み込み
                    </Button>
                    <Button
                      onClick={() => handleDeletePreset(index)}
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                    >
                      削除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
