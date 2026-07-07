> version: v1 / 分析日: YYYY-MM-DD / 分析時点 commit: <git rev-parse HEAD | not a git repo>
> changelog: v1 初版
> **STATUS: DRAFT — 未回答の質問あり** ← 未解決質問が無ければこの行を削除

# Refactor Instructions: <プロジェクト / スコープ名>

## 1. Objective

<目的を 2-3 行で。既存仕様を壊さず、負債を減らし、今後変更しやすい状態にする。
今回のスコープ(全体 / モジュール / 負債種別)を明記>

## 2. Project Understanding

<Phase 1 の要約。各主張に file:line の根拠。推論には (inferred) タグ>

## 3. Behaviors To Preserve

<絶対に壊してはいけない挙動。それぞれに検証手段を併記>

- B-1: <挙動> — 検証: <テスト名 or 再現手順>

## 4. Non-Negotiables

実装担当への必須制約:

- 着手前に `git rev-parse HEAD` を実行し、本指示書冒頭メタデータの commit と比較する。
  **不一致なら着手せず停止して報告**(file:line 参照がずれている可能性がある)
- 最初に `git status` を確認する。既存の未コミット変更の一覧を記録し、
  自分の変更対象と重なるファイルがあれば**停止して質問**。重ならないファイルには触れない
- 編集前に Baseline Commands(セクション 7)を実行し、結果を記録する
- 変更は小さく戻しやすい単位にする。**ユーザーが明示しない限り commit しない**
  (diff をフェーズ単位で分けて報告する)
- 無関係な整形やついでのリファクタリングをしない / 既存挙動を勝手に変えない
- allowed files の外を変更する必要が生じたら(テスト・型定義・snapshot 等)、
  変更前に理由を報告して承認を得る
- 正しさが不明な場合は実装を止めて質問する
- 各フェーズごとに検証し、Reporting Format(セクション 11)どおりに報告する

Dependency Policy:

- 依存追加・lockfile 更新・tool バージョン変更は**原則禁止**。
  必要なら理由を添えて Stop And Ask

<プロジェクト固有の制約があれば追記>

## 5. Stop And Ask Conditions

<実装を止めて質問すべき条件。例: 仕様がコードから判断できない / テストと実装が矛盾 /
公開 API・DB schema・保存データ・認証・課金・外部連携・互換性に影響>

## 6. Execution Environment & Setup

- Runtime: <例: node 20.x(根拠 file:line)>
- Package manager: <例: pnpm 9>
- セットアップ手順: <install コマンド>
- 作業ディレクトリ: <パス>
- 必要な env vars: <一覧 or .env.example 参照>
- 外部サービス前提: <DB / Docker / なし>

## 7. Baseline Commands

| コマンド | verified | expected status | known failures | proceed condition |
|---|---|---|---|---|
| `<cmd>` | executed-green / executed-failing / defined-only | exit 0, N passed | <failure signature or なし> | `stop` / `proceed-with-known-failures` |

<proceed condition は上記 2 値のみ(監視側はこの literal 値で判定する):
`stop` = baseline 外の失敗が出たら即停止 / `proceed-with-known-failures` = 既知の失敗に
限り続行可>


<1 つも見つからない場合: `No verified baseline commands found` と探索した設定ファイルを記録し、
手動の再現手順を定義するか「実装前に確認すべき質問」に回す。コマンドを発明して埋めない>

## 8. Debt Map

### DEBT-01: <短いタイトル>

- 根拠: <file:line + anchor(関数名・シンボル名・検索可能な文字列)。行番号は分析時点>
- なぜ負債か: <理由>
- 影響範囲: <波及するモジュール・挙動>
- 変更リスク: Low / Medium / High + 理由
- 改善案: <具体的な変更内容>
- 検証方法: <この変更が安全だと示す実在コマンド・テスト>
- 判定: 実装可(implement now)/ 提案のみ(propose only)

## 9. Implementation Phases

### Phase 1: <名前> <回答待ちなら [BLOCKED ON Q-N]>

- 対応 DEBT: DEBT-NN / depends_on: なし / unblocks: Phase 2
- allowed files: <変更してよいファイル一覧>
- 想定 diff 規模: <N ファイル・約 N 行>
- 手順: <具体的な変更手順>
- exit criteria: <実行コマンド + 期待結果>
- rollback plan: <戻す対象・戻し方・戻した後の再検証コマンド>

## 10. Verification Requirements

<フェーズごとの検証ゲートの総覧(exit criteria の一覧表)>

## 11. Reporting Format

各フェーズ完了時に報告する(Monitoring Protocol の「提出すべき証拠」と同一):

- 各コマンドの cwd / command / exit code / 所要時間 / 要約(機密はマスク。
  生ログ全文は要求時のみ)
- `git diff --stat` によるフェーズごとの変更規模
- 触ったファイルの一覧 → 対応する DEBT-NN / 未解決事項

## 12. Out-of-scope Items

<今回やらないこと>

---

## Monitoring Protocol

(監視者はこのセクションを refactor-monitor スキルで実行する)

### フェーズ完了ゲート

<フェーズごとに: 完了の定義 / 監視者自身が実行する確認コマンドと期待結果 /
baseline 実測値との比較方法>

### 提出すべき証拠

セクション 11 Reporting Format と同一(二重定義しない)。

### Red Flags(停止トリガー)

- allowed files に無いファイルへの**未報告**変更(報告+承認済みの追加変更は除く)
- Behaviors To Preserve に関わるテストの書き換え・削除・skip 化
- 「テストが通った」報告に exit code・実行記録が添付されていない
- 1 フェーズの diff が想定規模を大きく超える
- Stop And Ask 条件に該当するのに質問せず進んでいる
- 未承認の依存変更(package / lockfile / toolchain / env 設定)

### 介入手順

(1) 実装を停止 → (2) 最後に green だったフェーズへ rollback plan で復帰 →
(3) 原因分類: 指示書の曖昧さ → 改訂(version 繰り上げ)/ 仕様不明 → 質問へ差し戻し /
実装担当の逸脱 → 該当フェーズやり直し

### 受け入れ判定

- [ ] Baseline Commands を全件再実行し、baseline 実測以上(既知の失敗を除く)
- [ ] Behaviors To Preserve がすべて維持(該当テスト green)
- [ ] Out-of-scope・「提案のみ」項目に踏み込んだ変更が無い(diff レビュー)
- [ ] Reporting Format どおりの最終報告がある
- [ ] 未承認の allowed files 外変更・依存変更が無い
