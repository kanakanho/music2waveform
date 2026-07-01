# wgsl-template

TypeScript + Vite + WebGPU + WGSL で、回転する立方体を描画する最小構成のテンプレートです。

WebGPU の初期化、レンダリングパイプライン作成、頂点/インデックス/ユニフォームバッファ管理、WGSL シェーダによるライティング付き描画までを一通り含んでいます。

WebGPU はブラウザ標準 API をそのまま利用しており、ランタイム向けの外部ライブラリに依存しない構成です。

開発サーバー起動中はシェーダを編集しながらレンダリング結果をすぐに確認できます。

## セットアップ

```sh
pnpm install
pnpm dev
```

ビルドとプレビュー

```sh
pnpm build
pnpm preview
```

## スクリプト

- `pnpm dev`: 開発サーバ起動
- `pnpm build`: TypeScript チェック + Vite ビルド
- `pnpm preview`: ビルド成果物のローカル確認
- `pnpm lint`: ESLint 実行
- `pnpm lint:fix`: ESLint の自動修正

## ディレクトリ構成

```text
src/
	main.ts            # canvas作成、WebGPU初期化、テンプレート起動
	template.ts        # パイプライン/バッファ/レンダーループ本体
	math/
		mat.ts           # 行列演算を補助する関数
	shader/
		shader.wgsl      # 実際に使用する頂点/フラグメントシェーダ
		vert.ts          # 頂点シェーダ文字列（参考用）
		frag.ts          # フラグメントシェーダ文字列（参考用）
```

## 補足

- このテンプレートは WebGPU 対応ブラウザでの実行を想定しています。
- `vite.config.ts` では GitHub Pages で公開するための設定が含まれています。

