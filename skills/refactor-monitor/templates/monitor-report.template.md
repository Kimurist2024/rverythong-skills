# Monitor Report — Phase N(または Final)

- 対象: <refactor-instructions.md version vN / Phase N>
- 監視者実行コマンド:
  | command | cwd | exit code | 所要時間 | 結果要約 |
  |---|---|---|---|---|
- Gate: PASS / FAIL(根拠となる exit criteria との照合結果)
- Baseline 比較: <劣化なし / 劣化項目(known failures および proceed condition との照合結果を含む)>
- Diff 監査: <allowed files 内 / 逸脱あり(詳細)> / 想定規模との比較: <N ファイル・N 行>
- 依存変更: <なし / あり(承認記録の有無)>
- 証拠監査: <Reporting Format 準拠 / 不足項目>
- Red Flags: <なし / 発火項目と介入内容>
- 判定: PROCEED / STOP(フェーズ時)、ACCEPT / ACCEPT WITH NOTES / REJECT(最終時)
- REJECT / STOP の場合の差し戻し理由(再現可能な証拠付き):
