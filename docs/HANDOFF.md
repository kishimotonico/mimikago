# 引き継ぎドキュメント

このドキュメントは mimikago プロジェクトの現状と今後の作業を後任が把握するためのものです。

## プロジェクト概要

DLsite/FANZAからダウンロードした音声作品（ASMR等）をローカルで管理・再生するデスクトップアプリ。タグベースの検索と物理フォルダー管理を両立する設計。

**技術スタック:** Tauri v2 (Rust) + React 19 + TypeScript + SQLite + Vite + pnpm

## 現在のステータス

Phase 1（プロトタイプ）の要件をすべて実装済み。ビルドは全て通る状態。

```
npx tsc --noEmit     → エラーなし
npx vite build       → 249.74KB
cargo check          → OK
```

## コミット履歴

```
97fdf6a docs: add README.md and developer guide in Japanese
fb64001 feat: complete remaining Phase 1 requirements
b16d96a fix: add keyboard support to tag delete buttons in FullView
315bf50 feat: add Space key global shortcut for play/pause toggle
d4ea8cb feat: add Escape key to close panels and modals
d6fbdab fix: improve robustness and accessibility
4cfba8c fix: address critical bugs from code review
a183bb4 fix: pass physicalPath to CoverImage for asset URL construction
b586fbe fix: resolve Rust compilation issues
f9d8900 fix: layout and asset URL improvements
d246e56 feat: initial Tauri + React + TypeScript project setup
56c2a07 add docs
6c10b1b initial commit
```

## アーキテクチャ

### バックエンド（Rust）

サービス層パターンを採用。将来のHTTPサーバー化（リモートストリーミング）を見据えた設計。

```
Tauriコマンド (commands.rs) → 薄いラッパー
  ↓
サービス層 (service.rs) → ビジネスロジック
  ↓
DB (db.rs) / スキャナー (scanner.rs)
```

**モジュール一覧:**

| ファイル | 責務 |
|---------|------|
| `lib.rs` | Tauriアプリの初期化、プラグイン登録、コマンドハンドラ登録 |
| `commands.rs` | Tauriコマンド定義。`State<Mutex<AppService>>`経由でサービス層にアクセス |
| `service.rs` | ルートフォルダー管理、スキャン、タグ更新、メタファイル書き戻し |
| `db.rs` | SQLite CRUD。Mutex保護のConnection、WALモード |
| `scanner.rs` | ファイルシステム再帰走査、`.meta.json`検出・自動生成 |
| `models.rs` | 全データモデル。`serde`の`camelCase`シリアライゼーション |

**DBスキーマ:**

| テーブル | 用途 |
|---------|------|
| `works` | 作品テーブル（`urls_json`, `playlists_json`はJSON列） |
| `tags` | タグマスタ |
| `work_tags` | 多対多リレーション |
| `app_settings` | KVストア（ルートフォルダー、最終スキャン日時等） |

**Rust依存関係（主要）:** tauri 2, rusqlite 0.31 (bundled), walkdir 2, uuid 1, chrono 0.4, serde/serde_json 1

### フロントエンド（React + TypeScript）

インラインスタイルで全UIを構築（CSSフレームワーク不使用）。CSS変数は`global.css`で定義。

**コンポーネント構成:**

```
App.tsx
├── Header              # 検索バー、表示モード切り替え、スキャンボタン
├── SearchConditionsBar  # フィルター条件表示、ソート選択
├── LibraryGrid         # グリッド表示
│   └── WorkCard        # 個別カード
├── LibraryTable        # テーブル表示
├── DetailPanel         # クイックビュー（右パネル）
├── FullView            # 作品フルビュー（画面全体）
├── PlayerBar           # 固定プレイヤーバー（画面下部）
├── FullScreenPlayer    # フル画面プレイヤー
├── SettingsModal       # 設定ダイアログ
├── NewWorkPopup        # スキャン結果ポップアップ
├── SetupScreen         # 初回セットアップ
├── CoverImage          # カバー画像（プレースホルダー、エラー、行方不明表示付き）
└── UrlButtons          # URL外部リンクボタン
```

**カスタムフック:**

| フック | 責務 |
|-------|------|
| `usePlayer` | HTML5 Audio管理。再生/停止/シーク/音量/ループ/トラック切り替え/±10秒ジャンプ |
| `useLibrary` | 作品一覧取得、フィルタリング、ソート、スキャン実行、タグ更新 |

**フロントエンド依存関係:** react 19, react-dom 19, @tauri-apps/api 2, @tauri-apps/plugin-dialog 2

## データフロー

### メタファイルとDBの関係

```
.meta.json (Source of Truth)
  ↓ スキャン時に読み込み
SQLite DB (パフォーマンスキャッシュ)
  ↓ UIから編集時
.meta.json に書き戻し（同一操作内）
```

### スキャンフロー

1. `mark_all_missing()` で全作品を「行方不明」にマーク
2. ルートフォルダーを再帰走査し `.meta.json` を検出
3. 見つかった作品は `mark_found()` で「正常」に復帰
4. メタファイルのないフォルダーに音声ファイルがあれば `.meta.json` を自動生成
5. 最終的にmissingのまま残った作品 = 物理パスが消失

### 音声再生フロー

1. フロントエンドでトラック選択
2. `asset://localhost/` プロトコルでパス構築（各セグメントを`encodeURIComponent`）
3. HTML5 Audio の `src` に設定して再生
4. イベントリスナーで状態同期（`timeupdate`, `durationchange`, `ended`, `play`, `pause`）

## 実装済み機能（Phase 1完了）

**ライブラリ管理:**
- ルートフォルダー指定と初期セットアップフロー
- フルスキャン（手動 + 初回起動時自動）
- `.meta.json` の読み書き + 自動生成
- スキャン結果サマリー表示（登録済み/新規/エラー/行方不明の件数）
- SQLite作品・タグ管理
- タグの追加・削除・テキスト検索
- 作品タイトル編集（スキャン結果ポップアップ内）
- 複数URLの表示・外部ブラウザで開く

**表示:**
- グリッド表示（カバーサイズ4段階: S/M/L/XL）
- テーブル表示（ミニカバー付き）
- 表示モード切り替え（グリッド/テーブル）
- 検索条件バー（条件チップ表示、並び替え6種）
- クイックビュー（右パネル）
- 作品フルビュー

**プレイヤー:**
- 再生/一時停止/停止
- シーク（シークバー）
- ±10秒ジャンプ
- 音量調整
- ループ再生
- トラック切り替え（前/次）
- 連続再生（自動次トラック）
- プレイヤーバー（固定） + フル画面プレイヤー

**エラーハンドリング:**
- カバー画像上のエラーアイコン
- 行方不明作品の半透明表示 + "?" オーバーレイ
- 詳細画面でのエラー内容表示
- 音声ファイル欠損の検出

**キーボード:**
- Space: 再生/一時停止
- Escape: パネル・モーダルを閉じる
- タグ削除ボタンにキーボードアクセシビリティ

## セキュリティ対策

| 項目 | 対策 |
|------|------|
| パストラバーサル | `get_audio_file_path`/`get_cover_image_path`で`canonicalize()` + `starts_with()`検証 |
| Mutex poisoning | 全`lock()`に`map_err()`でエラー伝搬（panicしない） |
| JSONシリアライゼーション | `unwrap_or_default()`を避け`map_err()`で明示的エラー処理 |

## 実装上の注意点

### loopRefパターン（usePlayer.ts）

`usePlayer`のAudioイベントリスナーは`useEffect([], [])`で1回だけ登録し、`loop`状態は`loopRef`経由で参照する。これにより`state.loop`変更時のリスナー再登録・蓄積を防止している。

```typescript
const loopRef = useRef(false);
loopRef.current = state.loop;

useEffect(() => {
  const onEnded = () => {
    if (loopRef.current) { /* loop */ } else { /* auto-advance */ }
  };
  audio.addEventListener("ended", onEnded);
  return () => audio.removeEventListener("ended", onEnded);
}, []); // 依存配列は空
```

### ダブルクリック検出（WorkCard, LibraryTable）

`onClick`で200msタイマーを設定し、200ms以内の2回目クリックでダブルクリックとして処理。React の `onDoubleClick` は使わず独自実装（シングルクリックとの共存のため）。アンマウント時のタイマークリーンアップ必須。

### 検索デバウンス（Header）

検索入力は`localQuery`（即座に反映）と`searchQuery`（200ms遅延）の2段構成。ローカルstateで入力の即時フィードバックを確保しつつ、フィルタリング処理の負荷を軽減。

### asset://プロトコル

Tauriの`asset://localhost/`プロトコルでローカルファイルを配信。パス内の各セグメントを個別に`encodeURIComponent`する必要がある（日本語パス対応）。`window.__TAURI__`の存在チェックでブラウザ単体実行時のフォールバック。

## 既知の制約

- Raspberry Pi (aarch64) でのRustコンパイルは非常に遅い（初回30分以上）
- `cargo`は`$HOME/.cargo/bin/cargo`にあり、デフォルトPATHに含まれない場合がある
- `window.__TAURI__`チェックにより、ブラウザ単体ではカバー画像・音声再生不可
- CSS変数を定義しているが、コンポーネント内はインラインスタイルでハードコード
- 検索はクライアントサイドフィルタリング（大量データではパフォーマンス要検討）
- 合計再生時間はPhase 1では算出未対応（`start`/`end`指定がある場合のみ計算）

## Phase 2以降の未実装項目

要件定義の全文は `docs/requirements-v4.md` を参照。

**Phase 2（優先度高）:**
- DLsiteスクレイピングによるタグ自動取得
- ブックマーク・レジューム機能
- L/R入れ替え（Web Audio API）
- フォルダービュー（作品フルビューのファイルタブ）
- プレイヤーバーのフローティングモード
- 最近再生した作品の表示
- 検索の高度化（AND/OR/除外）
- 並び替え追加（最近再生した順、ランダム順、ID順）
- 複数プレイリスト管理UI
- 作品の移動追従（IDベーススキャン）
- 差分スキャン / 起動時自動スキャン

**Phase 3（将来）:**
- A-Bリピート
- バックグラウンド再生 + グローバルホットキー
- ギャップレス再生
- 再生速度変更
- 作品横断プレイリスト
- リモートストリーミング（Rust側のHTTPサーバー化）

## 開発環境

```bash
# 開発サーバー起動
pnpm tauri dev

# TypeScript型チェック
npx tsc --noEmit

# フロントエンドのみビルド
npx vite build

# Rustのみチェック（PATHにcargoがない場合）
PATH="$HOME/.cargo/bin:$PATH" cargo check --manifest-path src-tauri/Cargo.toml

# プロダクションビルド
pnpm tauri build
```

## 関連ドキュメント

| ファイル | 内容 |
|---------|------|
| `README.md` | ユーザー向けの概要・セットアップ手順 |
| `docs/requirements-v4.md` | 要件定義（Phase 1〜3） |
| `docs/ui-design-v1.md` | UI設計書 |
| `docs/DEVELOPMENT.md` | 開発者ガイド |
