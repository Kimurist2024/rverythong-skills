# Codex CLI 非対話呼び出しリファレンス(実証済みパターン)

## 基本形(レビュー用・読み取り専用)

```bash
OUT=$(mktemp)
codex exec --sandbox read-only --skip-git-repo-check -C <対象ディレクトリ> - <<'EOF' >"$OUT" 2>&1
<ロール定義 + 対象ファイル相対パス + 観点 + 出力形式>
EOF
CODE=$?
echo "codex exit=$CODE"
tail -60 "$OUT"   # 表示用の短縮。全文は $OUT に保存済みで、必要なら遡って読む
```

## ハマりどころ(すべて実際に踏んだもの)

| 症状 | 原因 | 対処 |
|---|---|---|
| exit 1、`Not inside a trusted directory` | git リポジトリ外で実行 | `--skip-git-repo-check` を付ける |
| プロンプトが届かない | 引数渡しと stdin の混在 | プロンプトは stdin(heredoc `- <<'EOF'`)で渡す |
| 片側レビュー失敗を見逃す | `2>/dev/null` で stderr ごと握り潰し | stderr も `$OUT` に保存し、**exit code を必ず確認** |
| 出力に hook ログが混ざる | PostToolUse 等のフックの stdout | `tail` で末尾の codex 出力部を読む。全文は `$OUT` |

## 運用ルール

- レビュー用途では必ず `--sandbox read-only`(レビュアーに編集させない)
- exit code 非 0 ならそちら側のレビューは**失敗扱い**。`$OUT` の stderr で原因を
  直して再実行する。失敗を無視して片側だけで「dual review 完了」としない
- 長時間かかることがあるため timeout は 300–600 秒を目安に設定する

## 関連

- 実装依頼(レビューではなく)に使う場合はユーザーのグローバル CLAUDE.md の
  「Codex の呼び出し方」(`codex <<EOF`、`mcp__codex__codex`)に従う
