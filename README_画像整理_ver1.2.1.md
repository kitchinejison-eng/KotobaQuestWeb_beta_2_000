# ことばクエスト ver1.2.1 PC｜画像フォルダー整理版

この版では、画像を用途別の `images/` フォルダーにまとめ、参照しているHTML/JavaScript/CSS/アプリマニフェスト/オフラインキャッシュも書き換えました。元画像の画質は変更していません。

## 新しいフォルダー
- `images/app-icons/`：アプリ用アイコン
- `images/branding/`：ロゴ
- `images/practice/articulation/`：発声・構音用の図
- `images/practice/vocabulary/`：単語のイラスト・写真
- `images/practice/naming/`：呼称訓練用イラスト
- `images/practice/gestures/`：動作模倣のイラスト
- `images/practice/voice/`：発話例の画像
- `images/practice/matching/`：文字と画像の照合
- `images/questions/`：各種トレーニング問題の画像
- `images/scenes/icons/`：生活場面のアイコン
- `images/scenes/photos/`：生活場面の写真
- `images/story/`：会話・物語・アバターの画像（旧 `images/ivent`）
- `images/characters/`：キャラクター画像
- `images/games/shiba-burger/`：しばバーガーの背景画像

## ファイルの移動について
- 旧パス→新パスの対応表は `IMAGE_RELOCATION_MANIFEST.json` を参照してください。
- **完全版：** ZIPを新しいフォルダーに展開し、`START_HERE.html` から起動します。
- **差し替え版：** 以前の軽量化版をバックアップしてから上書きし、`CLEANUP_MOVED_IMAGES.bat` を実行してください。旧画像の位置が残ったままでも、新しいコードは新パスを利用します。
- `CLEANUP_MOVED_IMAGES.bat` は `IMAGE_RELOCATION_MANIFEST.json` に列挙した旧画像だけを削除します。学習記録のブラウザ保存データには触れません。
- 画像名や配置をさらに変更する場合は、HTML/JavaScript/CSSの参照先も必ず変更してください。
- `node tools/verify-image-paths.cjs` で画像参照検証が可能です。

## 動作検証の範囲
画像パス、JavaScript構文、静的HTML/CSS参照、元画像バイトの保持、差し替え適用後の整合性を自動チェックしています。WebGLの実描画・マイク・音声再生などは実機確認が必要です。
