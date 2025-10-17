# GenAnyTone - 純正律音波ジェネレータ

和音練習用チューナーのテスト用音波生成ツール。構成音ごとにcent単位で出力を調整できる純正律の音波ジェネレータです。

![GenAnyTone](https://img.shields.io/badge/Next.js-15.5.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC?logo=tailwind-css)

## 📋 目次

- [概要](#概要)
- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [セットアップ](#セットアップ)
- [使い方](#使い方)
- [プロジェクト構成](#プロジェクト構成)
- [開発](#開発)
- [ライセンス](#ライセンス)

## 🎯 概要

GenAnyToneは、和音練習用チューナーの研究者や純正律の音波生成が必要なユーザー向けのWebアプリケーションです。

### 特徴

- **精密な音程調整**: 0.1cent単位で音程を微調整可能
- **リアルタイム編集**: 再生中でも音量やcent値をリアルタイムで変更
- **複数の波形**: 正弦波、矩形波、三角波、ノコギリ波をサポート
- **プリセット機能**: よく使う設定を保存・読み込み
- **自動保存**: 設定をlocalStorageに自動保存

## ✨ 主な機能

### 1. 基準周波数設定
- A4の周波数を300～500Hzの範囲で設定可能
- デフォルト値: 442Hz

### 2. 構成音の管理
- **追加**: 音名、オクターヴ、cent調整を指定して構成音を追加
- **編集**: cent値をインラインで編集（-100～100の範囲）
- **削除**: 不要な構成音を個別に削除
- **音量調整**: 各構成音の音量を0～100の範囲で調整
- **自動ソート**: 音高順（低音→高音）に自動整列

### 3. 音声生成
- **4種類の波形**
  - 正弦波 (sine)
  - 矩形波 (square)
  - 三角波 (triangle)
  - ノコギリ波 (sawtooth)
- **再生制御**: 再生/停止ボタンで簡単操作
- **リアルタイム更新**: 再生中でも音量・cent値を変更可能

### 4. プリセット機能
- **保存**: 現在の基準周波数と全構成音を名前付きで保存
- **読み込み**: 保存済みプリセットをワンクリックで復元
- **削除**: 不要なプリセットを削除
- **永続化**: localStorageに保存

### 5. デフォルト構成音
初回起動時に以下の構成音が設定されます:
- Bb4: 0 cent
- D4: -13.6 cent
- F4: 2 cent

## 🛠 技術スタック

### フロントエンド
- **Framework**: [Next.js 15.5.6](https://nextjs.org/) (App Router)
- **UI Library**: [React 19.1.0](https://react.dev/)
- **Language**: [TypeScript 5.x](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.x](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
  - Radix UI primitives
  - Customizable component library

### 音声処理
- **Web Audio API**: ブラウザネイティブの音声生成

### 状態管理
- **React Hooks**: useState, useEffect, useRef
- **LocalStorage**: データ永続化

## 🚀 セットアップ

### 前提条件
- Node.js 20.x 以降
- npm または yarn

### インストール

1. リポジトリのクローン
```bash
git clone <repository-url>
cd gen-any-tone
```

2. 依存関係のインストール
```bash
npm install
# または
yarn install
```

3. 開発サーバーの起動
```bash
npm run dev
# または
yarn dev
```

4. ブラウザで開く
```
http://localhost:3000
```

### ビルド

本番環境用のビルド:
```bash
npm run build
npm start
```

## 📖 使い方

### 基本的な使い方

1. **基準周波数の設定**
   - 「基準周波数設定」カードでA4の周波数を入力（300-500Hz）

2. **構成音の追加**
   - 音名を選択（A, Bb, C, C#, D, Eb, E, F, F#, G, G#）
   - オクターヴを選択（1-6）
   - cent調整を入力（-100～100、デフォルト: 0）
   - 「構成音を追加」ボタンをクリック

3. **構成音の編集**
   - リスト内のcent値または音量スライダーを直接操作
   - 変更はリアルタイムで反映されます

4. **音声の再生**
   - 波形を選択（正弦波、矩形波、三角波、ノコギリ波）
   - 「▶ 再生」ボタンをクリック
   - 「■ 停止」ボタンで停止

5. **プリセットの保存**
   - プリセット名を入力
   - 「現在の設定を保存」ボタンをクリック

6. **プリセットの読み込み**
   - 保存済みプリセット一覧から「読み込み」ボタンをクリック

## 📁 プロジェクト構成

```
gen-any-tone/
├── app/                      # Next.js App Router
│   ├── globals.css          # グローバルスタイル
│   ├── layout.tsx           # ルートレイアウト
│   └── page.tsx             # メインページ（Home）
├── components/               # Reactコンポーネント
│   ├── ui/                  # shadcn/ui コンポーネント
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── slider.tsx
│   └── PresetManager.tsx    # プリセット管理コンポーネント
├── lib/                      # ユーティリティ・ロジック
│   ├── types.ts             # TypeScript型定義
│   ├── audio.ts             # Web Audio API ラッパー
│   ├── presets.ts           # プリセット管理
│   └── utils.ts             # 汎用ユーティリティ
├── public/                   # 静的ファイル
├── components.json           # shadcn/ui設定
├── next.config.ts           # Next.js設定
├── package.json             # 依存関係
├── tsconfig.json            # TypeScript設定
├── tailwind.config.ts       # Tailwind CSS設定
├── 仕様書.md                 # 詳細仕様書
└── README.md                # このファイル
```

### 主要ファイルの説明

#### `lib/types.ts`
型定義を管理:
- `NoteName`: 音名の型（A, Bb, C, ...）
- `Octave`: オクターヴの型（1-6）
- `WaveType`: 波形の型（sine, square, triangle, sawtooth）
- `Note`: 構成音のインターフェース
- `Preset`: プリセットのインターフェース

#### `lib/audio.ts`
音声生成ロジック:
- `calculateFrequency()`: 周波数計算（cent調整含む）
- `sortNotesByPitch()`: 音高順ソート
- `AudioGenerator`: Web Audio API ラッパークラス
  - `play()`: 音声再生
  - `stop()`: 音声停止
  - `updateVolume()`: 音量更新
  - `updateCents()`: cent値更新

#### `lib/presets.ts`
プリセット管理:
- `loadPresets()`: プリセット読み込み
- `savePresets()`: プリセット保存
- `addPreset()`: プリセット追加
- `deletePreset()`: プリセット削除

#### `components/PresetManager.tsx`
プリセットUI管理コンポーネント

#### `app/page.tsx`
メインアプリケーションロジックとUI

## 🔧 開発

### 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Lint実行
npm run lint
```

### 対応ブラウザ

- **デスクトップ**: Google Chrome 最新版（Windows）
- **モバイル**: 
  - iOS: Google Chrome 最新版、Safari 最新版
  - Android: Google Chrome 最新版

### Web Audio API対応

このアプリケーションはWeb Audio APIを使用しています。非対応環境での動作は想定していません。

## 🎵 技術詳細

### 周波数計算式

構成音の周波数は以下の式で計算されます:

```
周波数 = 基準周波数 × 2^(半音数/12) × 2^(cent/1200)
```

- **基準周波数**: A4の周波数（デフォルト: 442Hz）
- **半音数**: A4からの半音差
- **cent**: 微調整値（-100～100）

### データ永続化

- **アプリ設定**: `localStorage.appSettings`
  - 基準周波数
  - 現在の構成音リスト

- **プリセット**: `localStorage.genAnyTone_presets`
  - 保存されたプリセットの配列

## 📝 ライセンス

このプロジェクトのライセンス情報については、プロジェクトオーナーにお問い合わせください。

## 🙏 謝辞

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

詳細な仕様については[仕様書.md](./仕様書.md)を参照してください。
