# 使用説明書 — rverythong-skills

Claude Code 用に作成した **オリジナル成果物**(作業規程・セキュリティ/デザイン/コストのルーター・サブエージェント・スクリプト)と、分野別に束ねた**第三者スキルバンドル**(cybersecurity 817 / taste 13)の詳細な使い方。

- 設置方法・全体像は [README.md](README.md)、出典とライセンスは [ATTRIBUTION.md](ATTRIBUTION.md) を参照。
- 各スキルは Claude Code で `/<名前>` で起動、サブエージェントは Agent ツールで `agentType=<名前>`、スクリプトは実コマンドで実行。

## 目次

| # | 成果物 | 種別 | 起動 |
|---|---|---|---|
| 1 | fable | スキル | `/fable` |
| 2 | security-ops | スキル | `/security-ops` |
| 3 | cost-route | スキル | `/cost-route` |
| 4 | design-taste-jp | スキル | `/design-taste-jp` |
| 5 | skills-map | スキル | `/skills-map` |
| 6 | security-analyst | サブエージェント | Agent(security-analyst) |
| 7 | pentest-operator | サブエージェント | Agent(pentest-operator) |
| 8 | cost-report.js | スクリプト | `node ~/.claude/scripts/cost-report.js` |
| 9 | ask-claude | スクリプト | `~/.claude/bin/ask-claude` |
| 10 | 組織層(バンドル/隠蔽) | — | — |

---

## fable（スキル）

**一言でいうと**: Fable 5.0 の出力品質を Opus / Sonnet などで近似するための「観測駆動の自己規律シーケンス」。サブエージェントを呼ぶのではなく、いまの自分の振る舞いを 3 原則 + 5 フェーズ（Phase 0〜4）に沿わせて、「動くはず」で完了と言わせないための作業モード。

**いつ使うか（発火条件）**:
- 実装 / リファクタ / バグ修正 / 多ファイルにまたがる変更に着手するとき
- 「なぜ壊れているか」を突き止めるデバッグ・原因調査
- レビュー・監査・設計判断など、結論の正しさが重要な作業
- ユーザーの誘導（「先週の変更が怪しい」等）を検証せず鵜呑みにしそうなとき
- 「たぶん直った」で報告を書きそうになったとき
- 規模で使い分ける: 上記でも作業が小さいなら縮小版の **Fable-lite** で足りる。軽い一問一答・自明な機械的編集にはどちらも使わない（オーバーヘッドが割に合わない）。

**呼び出し方**: skill として `/fable`。サブエージェントを起動するスキルではなく、**駆動している主体（自分自身）に作業モードを課す**もの。SKILL.md には `name: fable` / `origin: user` のみ定義され、対象モデルは「Opus / Sonnet / その他」を問わない。

**何をするか（中身）**:

冒頭にまず **3 原則** を固定する（以降のすべての判断をここから導く）:
1. 完了条件を先に固定する（検証方法が書けないタスクは未理解とみなす）
2. 自分の主張ではなく観測を信じる（実行結果・diff・出力を見るまで「完了」と言わない）
3. 次の一手は「いま一番リスクが高い場所」で選ぶ（外れたら全部崩れる仮定を先に潰す）

そのうえで 5 フェーズを踏む:

- **Phase 0 — 錨を打つ**: 何かに触る前に 3 行アンカーを書く。`完了条件`（観測可能な形で）/ `検証方法`（具体的コマンド・diff・実行結果）/ `やらないこと`（スコープの外壁）。ゲート = 「検証方法」の行が書けないなら理解不足とみなし、実装に進まず Phase 1 へ。
- **Phase 1 — 偵察**: 計画前に実物を軽く読み、**事実 / 仮定 / 不明** の 3 つに仕分ける。事実 = いまこの場で Read/Grep/Bash/実行で確認したものだけ。仮定（周辺コード・一般常識・人の言葉・過去メモリ由来）はまだ根拠にしない。核心の一文 = 「一番危険なのは事実のふりをした仮定」。
- **Phase 2 — 分解（リスク順）**: 概念ではなく「独立して検証できる単位」で切る。順序はリスク順で、外れたら計画全体が崩れる仮定の検証を最初に置く。簡単なところから片付けて勢いをつけるのは罠。
- **Phase 3 — 実行ループ**: ピースを 1 つ進めるたびに **その場で** 検証する（最後にまとめて検証しない）。各ピースの後、次の一手の前に 4 つの自問を埋める — ①観測は計画と矛盾していないか ②いま最大のリスクはどこか ③次の行動は可逆か ④人間にしか答えられないことで詰まっていないか。行動 vs 調査は「手戻りコスト」と「確認コスト」を比べて決める。
- **Phase 4 — 全体検証（心臓部）**: 5 点すべてを通す。①作った層と別の層で確認（コードなら実際に実行する）②壊しに行く（空入力・境界値・想定外の型を実際に当てる）③原因の説明を観測で裏取り（証拠が無ければ「寄与は未確認」と書く）④依頼原文と突き合わせる ⑤diff を頭から最後まで通読する。

補助構造:
- **Fable-lite**: 5 フェーズが過剰な軽タスク用の縮小版。①3 行アンカーは省略しない ②実装 ③裏取り（Phase 4-3、実行して観測してから「できた」と言う）だけは必ず通す。途中で核心の仮定が揺れる/多ファイルに波及したら full に昇格。
- **Fable の文体**: 結論を先に / 簡潔・高高度 / 選択肢を並べず推奨を 1 つ / やらない選択肢を narrate しない / hedge は必要なときだけ / 日本語で書く。
- **完了報告フォーマット（誠実性の契約）**: 「検証したこと」「検証できていないこと」「やらなかったこと・スコープ外」「残るリスク・不確実性」を含める。落ちたテストは出力とともに落ちたと言い、スキップはスキップと言う。
- **アンチパターン**: 検証方法を決めずに実装開始 / 誘導・過去メモリを事実扱い / 簡単なピースから片付け / 最後にまとめて検証 / コードは直したが説明が観測と食い違う / 実行せず「動くはず」で報告 / 過程の実況で報告を薄める。

**使用例**:
- NeuroGolf の others プールをマージする直前に `/fable` を発火し、Phase 0 の 3 行アンカーを記入（SKILL.md の記入例そのまま）— 完了条件「マージ後 submission.zip の実LB が現ベストを上回り退行が出ない」/ 検証方法「dump_scores.py で採用ネットの score 確認 → 提出 → gap-diagnosis（base 再提出比較）」/ やらないこと「gate 閾値・fresh k（=30固定）・マージ順（base メンバー順保持）は変えない」。
- 「先週の Conv 変更が私的0点の原因では」と誘導されたとき、Phase 1 で「diff で bias 長が変わったのは事実／それが gap の原因は仮定（根拠にしない）／gap を出しているタスク番号は不明 → bisect で埋めてから原因を語る」と仕分けて誘導に釣られない。

**注意・落とし穴**: これはサブエージェントやスクリプトを起動するスキルではなく、あくまで自分の振る舞いを変える自己規律モード（実コマンド・API キー・課金の類は無い）。「full か lite か」の判断自体も Phase 0 の一部。Phase 0 のゲート（検証方法が書けないなら実装に進まない）と Phase 4-3（原因説明を観測で裏取り、無ければ「未確認」と明記）を飛ばすと Fable 品質にならない、と本文が繰り返し警告している。

**関連**: SKILL.md 末尾の「関連スキル」で 3 件を参照（いずれも `~/.claude/skills/` に実在を確認済み）。
- [[anti-hallucination]] — 主張を verified / likely / unknown に分けて書く。Phase 1 の仕分け・Phase 4-3 の裏取り・文体節の hedge を言語表現レベルで支える。
- [[verification-loop]] — build / type / test の機械的ゲート。Phase 4-1「別の層で実行」の具体手段。
- [[council]] — 判断が割れて Phase 3 の自問4（人間案件）に近いとき、複数視点で裁定。

---

## security-ops（スキル）

**一言でいうと**: `~/.claude/skills/` にフラットに同居する **817個の cybersecurity スキル**(mukul975/Anthropic-Cybersecurity-Skills 由来)を引き当て、正しい subagent とモデル階層に委譲するためのルーター(司令塔)スキル。数が多すぎて素の一覧では埋もれるライブラリから「正しいスキルを引き、正しい実行者に渡す」ことに特化する。

**いつ使うか（発火条件）**: セキュリティ寄りの依頼を受けた**最初の一手**として使う。frontmatter の description が挙げる領域:

- 攻撃 / 侵入テスト（認可済みの exploit 検証、レッドチーム）
- 防御 / 検知（検知ルール作成、脅威ハンティング、SOC）
- DFIR(フォレンジック / インシデントレスポンス)
- 脅威インテリジェンス
- クラウドセキュリティ監査
- マルウェア解析
- ID / ゼロトラスト
- ICS / OT
- AI / LLM セキュリティ
- Web / API セキュリティ
- コンプライアンス / ガバナンス

具体例: ログからの侵害調査、脆弱性の悪用検証(認可済)、フォレンジック、脅威インテリ、クラウド監査、マルウェア解析、検知ルール作成、コンプラ対応。

**呼び出し方**:

- ルーター本体: `/security-ops`(領域判定 → grep で実在スキル特定 → subagent 委譲を行う)。
- 委譲先の実行者は 2 つの subagent(Agent ツールで起動、いずれも `model: sonnet`):
  - `agentType=security-analyst` — 防御・検知・DFIR・脅威インテリ・クラウド監査・マルウェア解析・コンプラ。攻撃系(exploit 実行)はやらない。
  - `agentType=pentest-operator` — **認可済み**の侵入テスト・レッドチーム・exploit 検証のみ。認可ゲートを内蔵し、署名済み rules of engagement / スコープが無ければ拒否する。
- 委譲時は「対象スキル名・認可の有無・完了条件」を明示して渡す。

**何をするか（中身）**:

大原則(必ず守る) 3 点:

1. **認可ゲートが先。** 攻撃系スキルは全て「authorized testing 限定」の Legal Notice 付き。実行系(exploit/attack/breakout)は、**書面の許可・スコープ(rules of engagement)を確認できるまで実行しない**。無ければ「認可の確認が必要」と返す。防御・検知・解析・コンプラは通常このゲート不要。
2. **推測でスキル名を作らない。** 817 個は実在名で引く([[anti-hallucination]])。grep で実物を確認してから呼ぶ。
3. **実行は /fable で。** 見つけたスキルの Workflow をなぞる前に [[fable]] Phase 0(完了条件・検証方法・やらないこと)を打つ。スキルに検証節("Validation Criteria" / "Verification" / "Detection" 等)があれば Phase 4 の検証に使い、無ければ完了条件と観測データの突合で自前に検証する。

3 ステップの手順:

- **1. 領域を判定する** — 依頼を上記 11 領域にマッピングする。各領域は代表的なスキル名の verb 接頭辞で識別する。例: 攻撃系=`exploiting-` `attacking-` `abusing-` `bypassing-` `coercing-` `escaping-` `conducting-*-penetration-test` `executing-red-team-` `building-c2-`。防御系=`detecting-` `hunting-` `building-detection-` `building-soc-` `configuring-*-ids`。DFIR=`analyzing-*(memory/disk/log/artifact)` `acquiring-` `extracting-` `collecting-` `conducting-*-incident-response` `containing-` `eradicating-`。他に脅威インテリ / クラウド / マルウェア解析 / ID・ゼロトラスト / ICS・OT / AI・LLM / Web・API / コンプラの接頭辞表を持つ。
- **2. 実在スキルを引く** — 名前だけでなく description も含めて全文検索する。SKILL.md 内のコマンド例:
  - キーワードで候補を出す: `grep -rl -i "kerberoast" ~/.claude/skills/*/SKILL.md | sed 's#.*/skills/##;s#/SKILL.md##'`
  - 名前接頭辞で領域一覧: `ls ~/.claude/skills/ | grep -E '^(detecting|hunting)-'`
  - description を並べて中身で選ぶ: `for d in $(grep -rl -i "<keyword>" ~/.claude/skills/*/SKILL.md); do echo "== $(dirname "$d" | xargs basename)"; grep -m1 '^description:' "$d"; done`
  - MITRE ATT&CK / NIST / OWASP マッピングからも引ける(各 SKILL.md の frontmatter に `mitre_attack:` `nist_csf:`)。テクニック ID 引き: `grep -rl "T1611" ~/.claude/skills/*/SKILL.md`。
- **3. 実行者に委譲する** — 基本形は「**Opus(メインセッション)が判断・攻撃面設計・帰属分析を持ち、実行は Sonnet 5 の subagent に渡す**」。委譲テーブル:

| 依頼の性質 | 委譲先 | 理由 |
|---|---|---|
| 防御・検知・DFIR・脅威インテリ・クラウド監査・コンプラ | **security-analyst** subagent | 該当スキルを読んで手順実行・証拠付き報告 |
| 攻撃・侵入テスト・レッドチーム(**認可確認済**) | **pentest-operator** subagent | 認可ゲート内蔵、スコープ内で exploit スキルを実行・記録 |
| 帰属・キャンペーン相関・攻撃面のアーキ判断 | Opus 本体で保持 | 深い推論はメインで、実行だけ subagent へ |

「やってはいけない」3 点: (1) 認可の裏付けなしに攻撃系スキルを実行する / (2) 存在しないスキル名を推測で呼ぶ(必ず grep で実在確認) / (3) 見つけたスキルの Workflow を検証なしで「できた」と報告する([[fable]] Phase 4 を通す)。

**使用例**:

- 例1(防御・DFIR): 「メモリダンプから侵害を調べたい」→ `/security-ops` で DFIR 領域と判定 → `grep -rl -i "memory" ~/.claude/skills/*/SKILL.md` 等で `analyzing-memory-dumps-with-volatility` などの実在スキルを特定 → security-analyst subagent に「対象スキル名・完了条件」を添えて委譲(認可ゲート不要)。
- 例2(攻撃・認可必須): 「AD で kerberoasting を検証したい」→ `grep -rl -i "kerberoast" ~/.claude/skills/*/SKILL.md` で `performing-kerberoasting-attack` / `exploiting-kerberoasting-with-impacket` 等を特定 → **まず署名済み rules of engagement / スコープを確認** → 確認できたら pentest-operator subagent に委譲、無ければ「認可の確認が必要」と返して着手しない。

**注意・落とし穴**:

- **認可ゲートは越えない。** 攻撃系(exploit/attack/breakout)は書面の許可・スコープが確認できるまで実行しない。pentest-operator も同ゲートを内蔵し、第三者資産・本番への無許可攻撃を拒否する。
- **スキル名の捏造禁止。** 817 個は実在名で引く必要があり、必ず grep で存在確認してから呼ぶ。ライブラリ本体には現在 998 のスキルディレクトリが存在し、cyber スキルはその中にフラットに同居している。
- **検証なしの完了報告禁止。** 見つけたスキルの Workflow をなぞっただけで「できた」としない。[[fable]] Phase 4 の検証(スキルに検証節が無い場合は完了条件と観測データの突合)を通す。
- スキルによっては "Validation Criteria" / "Verification" / "Detection" 等の検証節が無いものも多い点に留意する。

**関連**:

- [[fable]] — 実行時の作業規程(Phase 0〜4)。security-ops が引いたスキルを回す土台。(実ファイル `~/.claude/skills/fable/SKILL.md` 実在)
- [[anti-hallucination]] — スキル名・IOC・CVE 番号を推測で書かない。(実ファイル `~/.claude/skills/anti-hallucination/SKILL.md` 実在)
- subagent: **security-analyst**(防御、`~/.claude/agents/security-analyst.md`)/ **pentest-operator**(攻撃・認可、`~/.claude/agents/pentest-operator.md`) — いずれも `model: sonnet`。
- ライブラリ本体: `~/.claude/skills/`(817件)。復元/除去 manifest = `~/.claude/skills/.cyber-skills-manifest.txt`(実在)。

---

## cost-route（スキル）

**一言でいうと**: タスクを「モデル階層(Haiku/Sonnet/Opus)× 実行経路(Claude Code 内 / Kimi 委譲 / Claude API 直叩き)」に振り分け、重い作業だけを高い経路へ流してコスト浪費を止めるための作業ルーティング規程。デフォルトが `opus[1m]` + `effortLevel: xhigh`(最重量)の環境で「軽い作業にまで最重量を払い続ける」浪費を抑えることが目的。

**いつ使うか（発火条件）**: `description` に基づく。
- 現環境のデフォルトが `opus[1m]` + `xhigh` で、軽い作業に重いモデルを払い続けている浪費を止めたいとき。
- **セッション冒頭**に、これから走らせる作業の重さを見積もって経路を決めたいとき。
- **重い作業の前**に、モデル階層・実行経路を選び直したいとき。
- 月次コスト(notional)を可視化・監視したいとき(`cost-report.js`)。

**呼び出し方**:
- スキルとして `/cost-route` を実行する。
- 中身は「規程 + ヒューリスティック + コマンド集」なので、判断の指針として参照しつつ、実際の切替は下記の各コマンド/ラッパーを手で叩く。

**何をするか（中身）**:

方針は明記されている: **既定は据え置き(最重量のまま)、タスクに応じて手動で軽い経路へ切り替える**。上げるのは一時的で、既定は軽い経路に戻す。

1. **前提確認(プラン依存)**。節約の効き方はプランで変わる。
   - **従量(API credits)**: トークン/モデルを下げれば実請求が下がる。直叩き経路が効く。
   - **サブスク定額(Max 等)**: 実額は固定。下げても請求は変わらないが、利用上限への到達リスクと notional コストが下がる。従量の直叩きへ出して得なのは、定額の上限に当たっているときだけ。
   - `node ~/.claude/scripts/cost-report.js` の値は **notional(素の API 従量換算)であって実請求ではない**。まず自分のプランを踏まえて解釈する。

2. **3 階層 × 3 経路で振り分ける**。

   モデル階層(何を使うか):
   | 階層 | 使いどころ |
   |---|---|
   | **Haiku** | 決定的・低リスクの機械作業: フォーマット、定型変換、ログ要約、分類、doc 更新、コメント解析 |
   | **Sonnet** | 実装・リファクタ・レビューの主戦力。多くの作業はここで足りる |
   | **Opus** | アーキ判断、深い原因調査、多ファイル不変条件、曖昧要件の分解。**ここぞだけ** |

   実行経路(どこで走らせるか):
   | 経路 | 使いどころ | 切替 |
   |---|---|---|
   | **Claude Code 内** | 対話的・文脈が要るもの | `/model haiku` `/model sonnet` `/model opus` で都度切替 |
   | **Kimi 委譲** | 実装・リファクタの一括処理(トークン節約) | `~/.claude/bin/ask-kimi`(対象リポジトリ直下から) |
   | **Claude API 直叩き** | 重い反復ジョブ。Claude Code の巨大 context overhead を捨て prompt caching を効かせる | `~/.claude/bin/ask-claude`(要 `ANTHROPIC_API_KEY`) |

3. **判断ヒューリスティック(セッション冒頭 or 重い作業前)**。
   1. 軽い定型か? → `/model haiku` に落とす、または ask-kimi へ委譲。
   2. 実装・リファクタか? → Sonnet で足りる。大きければ ask-kimi(委譲でメイン文脈を汚さない)。
   3. 深い判断・原因調査・多ファイル不変条件か? → Opus に上げる。ただしこの turn だけ、終わったら下げる。
   4. 重い反復・バッチ(同型を大量)か? → ask-claude で直叩き(`--system` を共有して caching)。
   5. 迷ったら `[[fable]]` Phase 0 の「完了条件」を書く。判断の重さ = モデルの重さ。

4. **可視化と閾値**(実スクリプト `~/.claude/scripts/cost-report.js`)。集計源は `~/.claude/projects/` 以下の全 `*.jsonl` で、各 assistant 行の `message.usage`(input/output/cache_creation/cache_read)と `message.model` を月 × モデルで合計し、内蔵の概算単価 `RATES`(haiku/sonnet/opus/fable)で notional コストを推定する。フラグは 2 つ:
   - `--month YYYY-MM`: 指定月の内訳のみ表示。
   - `--threshold N`: 当月合計が `$N` 超なら警告して `exit 1`(以内なら `exit 0` 相当のメッセージ)。
   同一 `message.id` は重複排除(再開/フォークで約 2 倍過大計上を防ぐ)。

**使用例**:

```bash
# 月次サマリ(モデル別)を見る
node ~/.claude/scripts/cost-report.js

# 当月内訳を見る
node ~/.claude/scripts/cost-report.js --month 2026-07

# 当月が閾値超なら警告(exit 1)
node ~/.claude/scripts/cost-report.js --threshold 40

# 実装の一括処理を Kimi へ委譲(対象リポジトリ直下から)
~/.claude/bin/ask-kimi <<'EOF'
このモジュールのテストを追加してリファクタして
EOF

# 重い反復ジョブを API 直叩き。system を共有して prompt caching を効かせる
export ANTHROPIC_API_KEY=sk-ant-...
~/.claude/bin/ask-claude --system prompt.md "<user prompt>"
cat big.txt | ~/.claude/bin/ask-claude "この内容を要約"
```

シナリオ例: セッション冒頭に `/cost-route` を参照 →「今日は doc 更新と定型変換だけ」と判断 → `/model haiku` に落とす。途中で多ファイルの不変条件を伴う原因調査が必要になったら、その turn だけ `/model opus` に上げ、終わったら戻す。

**注意・落とし穴**（実ファイル記載のもの）:
- `cost-report.js` の出力は **notional(素の API 従量換算)であって実請求ではない**。単価 `RATES` は「概算・要編集」であり、`opus[1m]` の長コンテキスト(>200K)割増は概算に含まれず実額が上振れしうる。
- `ask-claude` は **`ANTHROPIC_API_KEY` 必須**(未設定なら明示エラー `exit 3`)。既定モデルは `claude-sonnet-5`(`ASK_CLAUDE_MODEL` で上書き)、既定 max_tokens は 4096(`ASK_CLAUDE_MAX_TOKENS`/`--max`)。モデル ID 例: `claude-haiku-4-5-20251001` / `claude-sonnet-5` / `claude-opus-4-8` / `claude-fable-5`。
- **Batch API による一括 50%off はラッパー未実装**。`ask-claude` は同期 1 発で、`/v1/messages/batches` 対応は将来拡張予定。
- `ask-kimi` は**呼び出し時のカレントディレクトリで実行**され、そこのファイルを直接編集する。必ず委譲したいリポジトリ直下から呼ぶこと。内部は `kimi -p` 単体(`-y/--yolo`・`--auto` とは併用不可)。kimi バイナリは `~/.kimi-code/bin/kimi` または PATH から解決(見つからなければ `exit 127`、`KIMI_BIN` で上書き可)。
- **`~/.claude/scripts/hooks/cost-tracker.js` は信頼しない**。Stop フック配線では使用量を取得できず空回り(全行ゼロ)。コストは `cost-report.js` で見る。
- 原則として **Opus に上げたまま軽作業を続けない**(上げるのは一時的、既定は軽い経路)。

**関連**（実ファイルが参照する成果物）:
- `[[fable]]` — 判断の重さを見積もる土台(Phase 0 の完了条件)。
- `[[agentic-engineering]]` / `/model-route` — モデル階層の一般則。
- ラッパー: `~/.claude/bin/ask-kimi`(実装委譲)/ `~/.claude/bin/ask-claude`(API 直叩き)。
- subagent の階層: 軸ワーカー(doc-updater 等)は `model: haiku`、実装/レビューは sonnet、深い分析は opus。

（実在確認済み: `cost-report.js` / `hooks/cost-tracker.js` / `ask-kimi` / `ask-claude` の 4 ファイル、スキル `fable`・`agentic-engineering` は存在。`model-route` はスキルではなくコマンド `~/.claude/commands/model-route.md` として実在。）

---

## design-taste-jp（スキル）

**一言でいうと**: taste-skill 系のデザイン/フロントエンド・スキル群(旗艦 `design-taste-frontend` ほか)を日本語運用に適応させる「薄い統治層」。スキル本体は訳さず、Design Read と全ユーザー向け出力を日本語で行い、和文タイポグラフィ固有の配慮を上乗せする。

**いつ使うか（発火条件）**:
- 日本語プロダクト / 日本語話者向けの LP・ポートフォリオ・redesign・UI を作るとき(日本語話者向けの画面を作るとき「最初に使う」もの)。
- taste 系スキルを日本語の依頼で回すとき。
- デザイン依頼を日本語で受け、Design Read と出力を日本語で行いつつ、訳すと壊れる固有名詞は英語のまま保ちたいとき。

**呼び出し方**: skill として `/design-taste-jp` で起動。front matter に `user-invocable: false` は無く(土台の `taste-skill` は `user-invocable: false`)、ユーザーから直接呼べる。使い方は「まず土台の taste 系スキルで方向性(Design Read)を決め、その上に本スキルの日本語ルールを重ねる」二層構成。

**何をするか（中身）**: 本スキルは実装を持たず、4つの運用ルールと土台スキルの割り当て表からなる。

- **土台スキルの割り当て(登録名=ディレクトリ名で呼ぶ)**:
  - 総合(アンチスロップ): `taste-skill`(旗艦・内部名 `design-taste-frontend`)/ `gpt-tasteskill`
  - ミニマル / エディトリアル: `minimalist-skill`
  - 高級・エージェンシー質感: `soft-skill`
  - ブルータリスト: `brutalist-skill`
  - 既存改修: `redesign-skill`
  - 画像から実装 / 参考画像生成: `image-to-code-skill` / `imagegen-frontend-web` / `imagegen-frontend-mobile`
  - ブランド / デザインシステム: `brandkit` / `stitch-skill`
  - 完全出力(省略禁止): `output-skill`
- **ルール1(出力言語)**: Design Read と全ユーザー向け出力を日本語で書く。旗艦の「Reading this as: …」も日本語化(例:「これは技術購買者向けの B2B SaaS ランディング、Linear 系のミニマル言語、Tailwind + Geist + 抑えたモーション寄りと読みました。」)。曖昧なら日本語で1問だけ聞く(多問ダンプ禁止)。
- **ルール2(訳さない固有名詞)**: フォント名(Geist / Inter / Noto Sans JP)、フレームワーク・技術(Tailwind / GSAP / CSS プロパティ名)、美意識ジャーゴン(Awwwards / Linear-style / bento / brutalist / glassmorphism / editorial)、コード・クラス名・変数は英語のまま保つ。訳語を捏造しない([[anti-hallucination]])。
- **ルール3(和文タイポグラフィ=本スキルの改良点)**: taste-skill に無い追加知見。
  - フォント: 本文=Noto Sans JP / Hiragino Kaku Gothic / Yu Gothic / Zen Kaku Gothic、見出しに明朝(Noto Serif JP)でコントラスト、Web フォントはサブセット化。
  - 行間: 本文 1.7〜2.0(ラテンの 1.4〜1.6 より広く)。
  - 字間・約物: `font-feature-settings: "palt"` で仮名詰め、約物の空きと全角/半角の統一に注意。
  - 禁則処理: 行頭に `。、` を置かない。CSS `line-break: strict;` `word-break: normal;` `overflow-wrap: anywhere` を用途で使い分け。
  - 和欧混植: `font-family` で欧文→和文の順に指定、ベースライン/サイズ差を調整、数字は等幅/tabular に注意。
  - 改行の意味: 日本語は分かち書きしないので `<br>` / `<wbr>` / `word-break` で意図した位置に折る。「6行折り返しの禁」(gpt-tasteskill のルール)は和文でも有効。
  - 字面の圧: 漢字は密度が高いため、ラテン向けの VISUAL_DENSITY をそのまま使うと詰まって見える → 密度ダイヤルを1〜2下げるか余白を増やす。
- **ルール4(品質ゲート)**: `web/design-quality.md` のアンチテンプレ方針(AI紫グラデ/中央寄せ hero/等幅3カード等の禁止)を必ず適用。[[fable]] Phase 0 で完了条件(どの画面が・どのブレークポイントで・何を満たせば完成か)を固定し、Phase 4 で実機確認(320/375/768/1024/1440、和文の折り返し崩れ・フォント落ちを実際に見る)。

**使用例**:
- 日本語の SaaS ランディングページ依頼を受けたとき: `/design-taste-jp` を起動 → 旗艦 `taste-skill` で Design Read を行い、その要約を「これは技術購買者向けの B2B SaaS ランディング、Linear 系のミニマル、Tailwind + Geist 寄りと読みました。」と日本語で提示 → 実装時に本文 line-height を 1.8、`font-feature-settings: "palt"`、和欧混植の font-family(欧文→Noto Sans JP)を適用。
- 既存の日本語コーポレートサイトの改修依頼: 土台に `redesign-skill`(audit-first)を選び、その上に本スキルの禁則・行間・密度ダイヤルのルールを重ねて日本語運用で回す。

**注意・落とし穴**:
- 13スキルを丸ごと和訳しない(ジャーゴン破壊・誤訳リスク)。本スキルは運用ルールの上乗せに留める。
- ラテン前提の行間・密度のまま日本語を流し込まない(詰まって安っぽく見える)。
- Design Read を英語で出さない。
- 既存デザイン資産(frontend-design / ui-ux-pro-max / design-system)と重複するときは、より具体的な方(taste の美意識別スキル)を土台にし、本スキルで日本語運用を被せる。

**関連**:
- 土台: `taste-skill` ほか taste 系スキル群(実体は `~/.claude/skills/`、manifest=`~/.claude/skills/.taste-skills-manifest.txt`。manifest は Leonxlnx/taste-skill v1.0.0 由来の 13 スキルを列挙)。
- [[fable]](完了条件=Phase 0 / 実機確認=Phase 4)、[[anti-hallucination]](固有名詞・訳語の扱い)。
- 品質ゲート: `web/design-quality.md`(アンチテンプレ方針)。

---

## skills-map（スキル）

**一言でいうと**: `~/.claude/skills/` に大量にあるスキルの分野別インデックス兼交通整理役。「どの作業を、どのルーター/スキル/subagent に流すか」を一枚の表で示し、スキルの取り違え・競合を無くす入口。

**いつ使うか（発火条件）**:
- セキュリティ・デザイン・コスト・作業規程などで「どのスキルを使えばいい?」と迷ったとき
- 分野が重複して、どのスキルを呼ぶか競合しそうなとき
- `/` メニューに出てこない隠しスキル（830件）へどう到達するか確認したいとき
- 隠しスキルをメニューに戻したい／バンドルごと削除したいとき

**呼び出し方**: skill として `/skills-map` を実行する。frontmatter は `name: skills-map` / `origin: user` のみで、subagent 化やツール限定の指定はない（純粋な参照ドキュメント）。

**何をするか（中身）**:

このスキルは実行アクションを持たず、次の 4 ブロックを提示する参照表として機能する。

1. **背景の宣言**: `~/.claude/skills/` のうち **830件（cybersecurity 817 + design 13）が `/` メニューから隠されている**（各 `SKILL.md` frontmatter に `user-invocable: false` を付与）。Claude は説明文で自動ロードできるが、人間は下の分野ルーターを入口にする、という運用方針。

2. **「分野 → 入口」ルーター表**（このスキルの核）:

   | 分野 | 入口（ルーター/skill） | 実行者（subagent） | 束ねる対象 |
   |---|---|---|---|
   | 🔐 セキュリティ | `/security-ops` | `security-analyst`（防御）/ `pentest-operator`（攻撃・要認可） | 隠し 817（`exploiting-`/`detecting-`/`analyzing-`/`hunting-` 他） |
   | 🎨 デザイン/フロント | `/design-taste-jp`（日本語運用） | — | 隠し 13（`taste-skill`/`minimalist-skill`/`soft-skill` 他）+ 既存 `frontend-design` `ui-ux-pro-max` `design-system` `liquid-glass-design` |
   | 💰 コスト/モデル | `/cost-route` | — | `cost-report.js`・`ask-kimi`（実装委譲）・`ask-claude`（API直叩き） |
   | 🧭 作業規程/品質(meta) | `/fable` | — | `/anti-hallucination` `/verification-loop` `/council` |

   上表以外（言語別パターン・テスト・DevOps 等の既存スキル）は従来どおり `/` メニューから直接呼ぶ。

3. **競合の解き方（重複分野の優先順位）**:
   - 具体的なルーターを最優先。デザインなら `/design-taste-jp` → そこから美意識別スキル（`minimalist-skill` 等）を土台に選ぶ。汎用 `design` を直に呼ばない。
   - 隠しスキルは直接呼ばず、ルーター経由 or Claude の自動ロードに任せる。名前は grep で実在確認（例: `grep -rl kerberoast ~/.claude/skills/*/SKILL.md`）。
   - meta（fable/anti-hallucination）は常時下敷き。どの分野の作業でも完了条件と裏取りはここに従う。

4. **隠し設定の実体と戻し方**:
   - 隠した830件は各 `SKILL.md` の frontmatter に `user-invocable: false` を付けただけ（自動ロードは可、`/` メニューに出ないだけ）。
   - 対象リストは `~/.claude/skills/.cyber-skills-manifest.txt`（817）と `.taste-skills-manifest.txt`（13）。
   - メニューに戻す: 各 SKILL.md の `user-invocable: false` 行を消す（manifest でループ）。バンドルごと除去: 各 manifest 冒頭コメント（2行目 `Remove:` 行）のワンライナーで一括削除（`this_file` を実際の manifest パスに置換）。

**使用例**:
- 「Kerberoasting を検出したい」→ まず `/skills-map` を開く → セキュリティ行の入口 `/security-ops`（実行者 `security-analyst`）へ。個別の `detecting-kerberoasting-attacks` を直接呼ばない。
- 「ミニマルな LP を作りたい」→ `/skills-map` でデザイン行を確認 → `/design-taste-jp` を入口に `minimalist-skill` を土台に選ぶ（汎用 `design` は直呼びしない）。
- 「隠したセキュリティスキルを全部消したい」→ `.cyber-skills-manifest.txt` 2行目の `Remove all with:` ワンライナーの `this_file` を実パスに置換して実行。

**注意・落とし穴**:
- このスキル自体はコードを実行しない参照ドキュメント。実作業は入口ルーター先の subagent／スクリプトが行う。
- `pentest-operator`（攻撃系）は「要認可」と明記。無断で攻撃系スキルに流さない。
- 隠しスキルは `/` メニューに出ないだけで無効化ではない。Claude の自動ロードは生きているため、名前が不確かなときは grep で実在確認してから使う。
- 隠し件数「830（817+13）」・manifest の件数・4ルーター（`/security-ops`・`/design-taste-jp`・`/cost-route`・`/fable`）とその配下スクリプト（`cost-report.js`＝`~/.claude/scripts/`、`ask-kimi`／`ask-claude`＝`~/.claude/bin/`）はいずれも実在を確認済み。
- `ask-claude` は API 直叩き（要 API キー）、`ask-kimi` は実装委譲用ラッパー、`cost-report.js` はコスト集計という役割分担（詳細は各入口スキル側）。

**関連**:
- [[fable]] — 全分野共通の作業規程（meta の下敷き）。
- [[security-ops]] / [[design-taste-jp]] / [[cost-route]] — 各分野ルーター。
- 束ねられる隠しスキル manifest: `~/.claude/skills/.cyber-skills-manifest.txt`、`~/.claude/skills/.taste-skills-manifest.txt`。

---

## security-analyst（サブエージェント）

**一言でいうと**: 防御側（ブルーチーム）セキュリティの実行担当サブエージェント。`~/.claude/skills/` にある大量のサイバーセキュリティスキルを実名で引き、その Workflow をなぞって検知作成・DFIR・脅威ハンティング・脅威インテリ・クラウド監査・マルウェア解析・ログ/インシデント調査・コンプラ作業を証拠付きで実行する。攻撃（exploit 実行）は一切やらない。

**いつ使うか（発火条件）**: 実ファイルの `description` に基づく。以下の防御系タスクで PROACTIVELY に使う。
- 検知エンジニアリング（detection engineering）
- DFIR / フォレンジック
- 脅威ハンティング（threat hunting）
- 脅威インテリジェンス（threat intelligence）
- クラウドセキュリティ監査（cloud security auditing）
- マルウェア解析（malware analysis）
- ログ / インシデント調査（log/incident investigation）
- コンプライアンス作業（compliance work）

逆に、実運用システムへの攻撃的な exploit 実行は対象外で、`pentest-operator` に渡す（後述）。

**呼び出し方**: Agent（Task）ツールで `agentType=security-analyst` を指定して起動する。モデルは `sonnet` 固定。付与ツールは `Read` / `Write` / `Edit` / `Bash` / `Grep` / `Glob` の 6 つ（frontmatter の `tools` に定義）。親から渡す依頼には、完了条件・対象ログ/成果物のパス・「攻撃実行はしない」前提を明示すると噛み合う。

**何をするか（中身）**:

大原則は 3 つ。
1. 防御・解析・検知に徹する。exploit 実行・侵入・データ持ち出しはやらない。依頼が攻撃に転じたら実行せず「`pentest-operator` + 認可確認が必要」と親に返す。
2. 観測を証拠にする。ログ・ダンプ・成果物から見えた事実だけを結論にし、IOC・CVE 番号・攻撃者名を推測で書かない（[[anti-hallucination]]）。
3. スキルは実在名で引く。grep で確認してから読む。名前を捏造しない。

ワークフローは 3 ステップ。

### 1. 領域を判定してスキルを引く
キーワード grep で候補スキルを探す。実ファイル記載のコマンドそのまま:
```bash
# キーワードで候補(例: ランサムウェアのフォレンジック)
grep -rl -i "ransomware" ~/.claude/skills/*/SKILL.md | sed 's#.*/skills/##;s#/SKILL.md##' | head
# 領域接頭辞: detecting- hunting- analyzing- performing-*-forensics conducting-*-incident-response
# MITRE テクニックID からも: grep -rl "T1486" ~/.claude/skills/*/SKILL.md
```
候補が複数なら各スキルの `description:` を並べて最適を 1 つ選ぶ。

### 2. スキルを読み、[[fable]] で回す
- 着手前に 3 行アンカー（完了条件 / 検証方法 / やらないこと）を立てる。
- スキルの "Workflow" を 1 ステップずつ実行し、その場で観測を確認する。
- スキルに検証節（"Validation Criteria" 等、名称は様々・無いスキルも多い）があればチェックリストに使い、無ければ完了条件と観測データの突合で自前に検証する。

### 3. 証拠付きで報告する
- 見つけた事実（ログ行・ハッシュ・タイムライン）を引用元とともに示す。
- 各結論に裏取り観測を 1 つずつ添える。無ければ「未確認」と明示する。
- 検知ルール / IR 手順 / 監査結果などの成果物は `Write` で出力する。

得意領域とスキル接頭辞の対応表（実ファイルより）:

| 領域 | 接頭辞 |
|---|---|
| 検知エンジニアリング | `detecting-` `building-detection-` `implementing-siem-` `building-sigma` |
| 脅威ハンティング | `hunting-` `performing-threat-hunting-` |
| DFIR / フォレンジック | `analyzing-*(memory/disk/log)` `performing-*-forensics` `acquiring-` `triaging-` `conducting-*-incident-response` |
| 脅威インテリ | `analyzing-threat-` `building-threat-` `profiling-threat-actor-` `processing-stix-` |
| クラウド防御 | `auditing-aws/gcp/azure-` `detecting-aws/azure-` `securing-*` `implementing-cloud-` |
| マルウェア解析 | `analyzing-*-malware` `reverse-engineering-*-malware` `deobfuscating-` `performing-malware-triage-` |
| ID / ゼロトラスト | `implementing-*-zero-trust` `configuring-*-mfa` `implementing-pam-` |
| コンプラ | `implementing-hipaa/gdpr/iso-` `achieving-cmmc-` `performing-*-audit` `conducting-cyber-risk-` |

**使用例**:
- ランサムウェア侵害の初動フォレンジック依頼 → `grep -rl -i "ransomware" ~/.claude/skills/*/SKILL.md` で `investigating-ransomware-attack-artifacts` / `analyzing-ransomware-network-indicators` 等を発見 → `description` で最適な 1 件を選び、その Workflow をなぞってタイムライン・IOC を抽出 → 検知ルールや IR 手順を `Write` で成果物化し、裏取り観測付きで親に報告。
- MITRE テクニック起点の脅威ハンティング → `grep -rl "T1486" ~/.claude/skills/*/SKILL.md` で該当スキルを引き、`hunting-` / `detecting-` 系の Workflow で対象ログを走査。

**注意・落とし穴**:
- 攻撃系スキル（`exploiting-` `attacking-` `abusing-` `escaping-` `conducting-*-penetration-test`）の**実行は不可**。設計 / 検知観点で**読む**のは可。攻撃実行が必要になったら `pentest-operator` + 認可確認へ回す。
- 存在しないスキル名・IOC・CVE を推測で出さない。必ず grep で実在確認してから読む。
- スキルの Workflow を実行しただけで、検証せずに「完了」と言わない。検証節が無いスキルは完了条件と観測データの突合で自前検証する。
- 親（`security-ops` / メインセッション）への報告は日本語で、検証したこと・未確認・残リスクを添える。
- （ファイル記載の前提）参照ライブラリは「817個の cybersecurity スキル」と明記されている。なお `~/.claude/skills/` 配下のスキルディレクトリ総数は 998 件で、この中に防御・攻撃・非セキュリティ系が混在する。攻撃系は前述のとおり実行対象外。

**関連**:
- [[fable]]（作業の進め方の規律。着手前アンカー + Workflow を 1 ステップずつ検証）
- [[anti-hallucination]]（IOC・CVE・攻撃者名を推測で書かない根拠）
- `pentest-operator`（攻撃的 exploit 実行のハンドオフ先エージェント）
- 親エージェント: `security-ops` / メインセッション
- 参照ライブラリ: `~/.claude/skills/*/SKILL.md`

---

## pentest-operator（サブエージェント）

**一言でいうと**: 認可（署名済み rules of engagement・スコープ）が確認できたときだけ攻撃系セキュリティ作業を実行するレッドチーム実行担当のサブエージェント。認可の裏付けが無ければ着手を拒否する「認可ゲート」を内蔵する。モデルは `sonnet`。

**いつ使うか（発火条件）**: 実ファイルの `description` に基づく。
- **認可された**侵入テスト（penetration testing）を実行するとき
- レッドチーム・エンゲージメント（red-team engagements）を回すとき
- エクスプロイトの検証（exploit validation）を行うとき
- 上記いずれも **明示的な認可コンテキスト**（署名済み rules of engagement／対象スコープ）が前提。無ければ実行せず拒否する
- 逆に**防御（defensive）作業には使わない** — その場合は `security-analyst` を使う旨が description に明記されている

**呼び出し方**: Agent ツールで `agentType=pentest-operator` を指定して起動する。付与ツールは `Read` / `Write` / `Edit` / `Bash` / `Grep` / `Glob`（frontmatter の `tools` で定義）。呼び出し時に**認可情報（対象システムの所有 or 書面許可・スコープ・破壊/持続化の可否）を渡すこと**。渡さないと認可ゲートで差し戻される。親としては `security-ops` またはメインセッションから委譲する想定。

**何をするか（中身）**: `~/.claude/skills/` の攻撃系スキル（接頭辞 `exploiting-` `attacking-` `abusing-` `bypassing-` `escaping-` `conducting-*-penetration-test` `executing-red-team-` 等。各スキルは "authorized testing 限定" の Legal Notice 付き）を引きながら、以下の順で動く。

- **認可ゲート（最優先・例外なし）**: 着手前に必ず認可を確認する。次のいずれも無ければ攻撃を実行せず「認可の裏付け（署名済み rules of engagement・対象スコープ・許可された手法）が必要」と親に返す。
  - 対象システムの所有 or 書面の許可（engagement/契約/CTF/自分のラボ）
  - スコープ（対象ホスト・除外・許可された手法・時間帯）
  - 破壊/持続化の可否

  確認できない相手・第三者資産・本番への無許可攻撃は**拒否する（越えない一線）**。

- **ワークフロー（認可確認後）** の3ステップ:
  1. **スキルを引く**: 実ファイル記載のコマンド例をそのまま使う。
     ```bash
     # 例: kerberoasting
     grep -rl -i "kerberoast" ~/.claude/skills/*/SKILL.md | sed 's#.*/skills/##;s#/SKILL.md##'
     # CVE/テクニックから:
     grep -rl "CVE-2020-1472\|T1558" ~/.claude/skills/*/SKILL.md
     ```
     領域接頭辞（`exploiting- attacking- abusing- performing-*-penetration-test conducting-*`）で候補を絞る。
  2. **`[[fable]]` で回す（スコープ厳守）**: 3行アンカー＝完了条件（何を証明すれば PoC 成立か）／検証方法／**やらないこと＝スコープ外・破壊・持続化**。スキルの Workflow を1ステップずつ実行し、各手で「これはスコープ内か」を再確認（不可逆行動は特に慎重に）。スキルに検証節（"Validation Criteria" 等、名称は様々）があれば成立判定に使い、無ければ完了条件と取得証拠で自前判定する。
  3. **証拠を残して報告する**: 成立の証拠（取得ホスト名・権限昇格の証跡・アクセスできた資産）を最小限で示し、**根本原因の設定不備／脆弱バージョン**を記録、**是正策（remediation）**まで書く。実施ログ（いつ・何を・どのホストに）を残し、スコープ内に留まったことを明示する。

- **やってはいけない（明文の禁止）**: 認可確認前の攻撃実行／スコープ外資産・第三者・本番への無許可攻撃／認可を示せない依頼者に「たぶん大丈夫」で進めること／スコープに明記の無い破壊・データ破壊・不要な持続化。

- **報告**: 親（`security-ops` / メインセッション）へは**日本語**で、認可の確認状況・検証したこと・スコープ順守・是正策を添える。防御/検知観点が要るなら `security-analyst` に渡す。

**使用例**:
- CTF 環境で `kerberoasting` を検証したい → 親が「対象＝自分の CTF ラボ、スコープ＝該当 DC のみ、破壊不可、持続化不可」を明示して Agent(pentest-operator) を起動。エージェントは `grep -rl -i "kerberoast" ~/.claude/skills/*/SKILL.md` で `performing-kerberoasting-attack` 等を引き、fable の3行アンカーを立ててスキル Workflow を実行、取得できた資格情報の証跡と是正策（サービスアカウントのパスワード強度・AES 有効化等）を日本語で報告する。
- 「この本番 Web サイトを攻撃して」と認可情報なしで依頼 → 認可ゲートにより実行せず、「署名済み rules of engagement・対象スコープ・許可された手法が必要」と差し戻す。

**注意・落とし穴**:
- **認可コンテキストが無いと必ず差し戻される**。呼び出し側がスコープ・許可・破壊/持続化可否を渡していないと一切の攻撃行為が走らない（これは例外なしの仕様）。
- **第三者資産・本番への無許可攻撃・所有確認できない相手は拒否**。この一線は越えない設計。
- **破壊・データ破壊・持続化はスコープに明記が無い限り行わない**。不可逆行動は特に慎重に扱う。
- **防御・検知が目的なら誤ったエージェント**。その用途は `security-analyst` に委譲する（description・末尾で明示）。
- 付与ツールに `Bash` が含まれ実際に攻撃コマンドを実行しうるため、スコープ外への波及に注意（各手でスコープ内確認を挟む運用が前提）。

**関連**:
- `[[fable]]`（`~/.claude/skills/fable/SKILL.md`）— 実行時の規律（3行アンカー・1ステップ実行・検証）
- `~/.claude/skills/` の攻撃系スキル群（`exploiting-` `attacking-` `abusing-` `bypassing-` `escaping-` `conducting-*-penetration-test` `executing-red-team-` `performing-*-penetration-test` 等）
- `security-analyst`（`~/.claude/agents/security-analyst.md`）— 防御/検知観点の委譲先
- `security-ops`（`~/.claude/skills/security-ops`）— 親として報告を受ける想定の呼び出し元

---

## cost-report（スクリプト）

**一言でいうと**: `~/.claude/projects/` 配下の全セッションログ（`*.jsonl`）を走査し、各 assistant 応答の `message.usage` を月×モデル別に集計して、Claude Code の使用量を概算コスト（notional / 想定 API 従量）として表示するスタンドアロンの Node.js CLI。`message.id` で重複課金レスポンスを排除してから計上する。

**いつ使うか（発火条件）**:
- 自分の Claude Code 利用トークン量・概算コストを月次で把握したいとき
- 特定月（例: `2026-07`）のモデル別内訳を確認したいとき
- 当月の概算コストが一定額を超えていないか閾値チェックしたいとき（CI 的に `exit 1` を使いたいとき）
- スラッシュコマンドやサブエージェントではなく、ユーザーが手動で `node` から起動する診断用スクリプト

**呼び出し方**:
```bash
node ~/.claude/scripts/cost-report.js                 # 全月サマリ
node ~/.claude/scripts/cost-report.js --month 2026-07 # 指定月の内訳のみ
node ~/.claude/scripts/cost-report.js --threshold 40  # 当月が $40 超なら警告して exit 1
```
フラグは 2 つだけ: `--month <YYYY-MM>`（省略時は全月）、`--threshold <数値>`（USD、省略時はチェックなし）。両者は併用可能。ファイル冒頭に `#!/usr/bin/env node` があるため実行権限があれば直接起動もできるが、ドキュメント記載の正規呼び出しは `node ~/.claude/scripts/cost-report.js`。

**何をするか（中身）**:

1. **集計源の走査**: `path.join(os.homedir(), '.claude', 'projects')` をルートに、ジェネレータ `jsonlFiles(dir)` で再帰的に `.jsonl` を全探索する。ディレクトリが読めなければ静かにスキップ。
2. **行フィルタと高速化**: 各行はまず `line.includes('"usage"')` で足切りしてから `JSON.parse`。`message.usage` を持ち、かつ `message.role === 'assistant'` の行だけを対象にする。
3. **重複排除（要点）**: `message.id` を `Set`（`seen`）で管理し、同一 id は 1 回だけ計上する。サイドチェーン再生・再開/フォークで同一課金レスポンスが複製されるため、排除しないと実測で約 2 倍過大計上され `--threshold` が過剰発火する。コメント上、`isSidechain`（本物のサブエージェント課金）は落とさず、**id 単独で dedup** する方針。
4. **月の決定**: `obj.timestamp || msg.timestamp` の先頭 7 文字（`YYYY-MM`）を月キーにする。タイムスタンプが無い行はスキップ。`--month` 指定時は一致月以外を除外。
5. **コスト計算**: `message.model` を `rateFor()` で単価表 `RATES` にマップし、
   `cost = (input×input単価 + output×output単価 + cache_creation×cacheWrite単価 + cache_read×cacheRead単価) / 1e6`
   を積算する。`agg[month][model]` に `msgs/input/output/cacheW/cacheR/cost` を蓄積。
6. **モデル判定** `rateFor(model)`: モデル名の小文字化で `haiku`→haiku、`opus`→opus、`fable`→fable を含めば各帯、それ以外（`sonnet`/unknown 含む）は sonnet 帯にフォールバック。
7. **単価表 `RATES`（1M トークンあたり USD・概算・要編集）**:
   - haiku: input 1.0 / output 5.0 / cacheWrite 1.25 / cacheRead 0.10
   - sonnet: input 3.0 / output 15.0 / cacheWrite 3.75 / cacheRead 0.30
   - opus: input 15.0 / output 75.0 / cacheWrite 18.75 / cacheRead 1.50
   - fable: 公開単価不明のため暫定で sonnet 帯（3.0 / 15.0 / 3.75 / 0.30、要見直し）
8. **出力**: Markdown 見出し `# Claude Code 月次コスト(概算・notional)` に続き、月ごとに `## <YYYY-MM>`（当月には `← 当月`）と、`model / msgs / in / out / cacheR / cost` 列のテキスト表を出す。行はコスト降順ソート。トークン数は `k(n)`（1000 で割って `k` 付き）、金額は `$X.XX` 形式。各月末に「合計」行、最後に `総計(全月): $X.XX`。
9. **閾値チェック**: `--threshold` 指定時、当月（`new Date().toISOString().slice(0,7)`）の合計コストが閾値超なら `stderr` に警告を出して `process.exit(1)`、以内なら `✅` を表示。
10. **エラー処理**: データ 0 件なら `使用量データが見つかりません (~/.claude/projects/**/*.jsonl)` を出して正常終了。`main()` は `.catch` で `cost-report error: <msg>` を出し `process.exit(2)`。

**使用例**:
```bash
# 全期間のモデル別コストを一覧
node ~/.claude/scripts/cost-report.js

# 2026年7月だけ内訳を見る
node ~/.claude/scripts/cost-report.js --month 2026-07

# 当月が $40 を超えていたら非ゼロ終了（監視スクリプト等に組み込む）
node ~/.claude/scripts/cost-report.js --threshold 40
```

**注意・落とし穴**:
- **notional（概算）であり実請求ではない**: 出力冒頭が明言する通り「全量を素の API 従量で叩いた場合」の概算。サブスク定額プランでは実請求ではなく使用量の目安、従量（credits）なら実額に近い。
- **単価はハードコードの概算**: `RATES` は手動更新前提。最新の Anthropic 価格に合わせて編集しないとズレる。
- **opus の長コンテキスト割増は未反映**: `opus[1m]` の 200K 超割増は含めず、実額は上振れしうる。
- **fable の単価は暫定**: 公開単価不明のため sonnet 帯で概算（要見直し）。unknown モデルも sonnet 単価に丸められる。
- **重複排除は `message.id` 前提**: `id` が無い行は dedup されずそのまま計上される。
- **タイムスタンプ無し・`usage` 無し・非 assistant 行は集計対象外**。集計源が存在しない/空なら「使用量データが見つかりません」で終わる。
- **依存**: Node.js 標準モジュール（`fs`/`path`/`os`/`readline`）のみで外部依存なし。ネットワークや API キーは不要（Anthropic API を叩かず、ローカルの `.jsonl` を読むだけ）。

**関連**:
- 集計源: `~/.claude/projects/**/*.jsonl`（Claude Code のセッションログ。当環境で実在を確認済み）
- 単価表 `RATES` はこのファイル内で完結（外部スキル・スクリプトへの参照なし）

---

## ask-claude（スクリプト）

**一言でいうと**: Anthropic Messages API(`/v1/messages`)へ同期1発でプロンプトを投げる、bash+python3 の薄いラッパー。Claude Code 本体を経由せず必要なプロンプトだけを送るため入力が軽く、`--system` を使えば prompt caching で反復呼び出しの input を大幅に削れる。

**いつ使うか（発火条件）**:
- 重い/反復ジョブを Claude Code の外で安く回したいとき。Claude Code は毎ターン巨大な system prompt + CLAUDE.md + rules + skills + hooks を再送していて input が常に重く、直叩きはそれを回避できる。
- 同一 system プロンプトを繰り返し当てる定型タスク(`--system` でキャッシュし、反復で input 約90%off を狙う)。
- パイプで大きなテキストを流し込んで要約・判定させたいとき(`cat big.txt | ask-claude "..."`)。
- モデルや `max_tokens` を都度切り替えて単発の判断を回したいとき。

**呼び出し方**（script。実コマンド）:
```bash
export ANTHROPIC_API_KEY=sk-ant-...
~/.claude/bin/ask-claude "<プロンプト>"
```
オプション:
- `-m` / `--model <MODEL>`: 使用モデルID(既定は環境変数 `ASK_CLAUDE_MODEL`、無ければ `claude-sonnet-5`)
- `--max <N>`: `max_tokens`(既定は `ASK_CLAUDE_MAX_TOKENS`、無ければ `4096`)
- `--system <STR|FILE>`: system プロンプト。値がファイルパスとして実在すれば中身を読み込む。`prompt caching` 対象になる
- `-h` / `--help`: usage を表示して終了
- `--`: 以降をオプション解釈せずプロンプト本文として扱う

プロンプト本文は「位置引数(`$*`)」で渡すか、引数が無ければ標準入力(`cat`)から読む。

**何をするか（中身）**:
- shebang は `#!/usr/bin/env bash`、`set -euo pipefail`。
- 既定値: `MODEL="${ASK_CLAUDE_MODEL:-claude-sonnet-5}"` / `MAX="${ASK_CLAUDE_MAX_TOKENS:-4096}"` / `SYSTEM=""`。
- while ループでフラグをパースし、未知の `-*` オプションは `exit 2`。
- 事前チェック(いずれも明示エラーで停止):
  - `ANTHROPIC_API_KEY` 未設定 → `exit 3`
  - プロンプトが空(空白のみ含む)→ `exit 2`
  - `--system` がファイルパスとして存在すれば `cat` で中身に展開
  - `python3`(`command -v python3`、無ければ `/opt/homebrew/bin/python3`)が実行可能でなければ `exit 127`
- 実際の API 呼び出しはヒアドキュメント内の Python(標準ライブラリ `urllib` のみ、外部依存なし)で実行:
  - エンドポイント `https://api.anthropic.com/v1/messages`、ヘッダ `x-api-key` / `anthropic-version: 2023-06-01` / `content-type: application/json`。
  - リクエストボディは `{"model", "max_tokens", "messages":[{"role":"user","content":prompt}]}`。
  - `--system` が非空なら `body["system"]` を `[{"type":"text","text":system,"cache_control":{"type":"ephemeral"}}]` として付与(= prompt caching 対象。同一 system の反復呼びで input を大幅削減)。
  - `HTTPError` は `API error <code>` とレスポンス先頭800文字を stderr に出して `exit 1`、`URLError` は `接続失敗 <reason>` で `exit 1`。
- 出力:
  - **標準出力**: レスポンスの `content` から `type=="text"` ブロックのテキストを連結したもの(+末尾改行)。
  - **標準エラー**: `[ask-claude] model=... in=... out=... cache_read=... cache_write=...` の usage 行(`input_tokens` / `output_tokens` / `cache_read_input_tokens` / `cache_creation_input_tokens`)。

**使用例**:
```bash
# 1行タスク(既定モデル claude-sonnet-5)
~/.claude/bin/ask-claude "この関数名を英語のsnake_caseに直して: 合計金額を計算"

# モデルと出力上限を指定した重い判断タスク
~/.claude/bin/ask-claude -m claude-opus-4-8 --max 8192 "設計案AとBのトレードオフを比較して"

# system をファイルでキャッシュし、標準入力から本文を流す(反復で input 約90%off)
cat big.txt | ~/.claude/bin/ask-claude --system prompt.md "この内容を要約"
```

**注意・落とし穴**:
- **要 `ANTHROPIC_API_KEY`**。未設定だと即 `exit 3` で API は叩かれない。キーは Anthropic に対する実課金であり、コスト見積り(notional)ではなく実請求が発生する。
- **同期1発のみ**。大量の非同期バッチはコメントにある通り Message Batches API(`/v1/messages/batches`、50%off)が本命で、このラッパーは対象外(「必要になったら拡張」と明記)。
- `--system` の値が「たまたま同名ファイルとして存在する」場合、文字列ではなくファイル内容として読まれる(`[ -f "$SYSTEM" ]` 判定のため)。
- モデルIDはコメントの例示(`claude-haiku-4-5-20251001` / `claude-sonnet-5` / `claude-opus-4-8` / `claude-fable-5`)。無効なIDや上限超過は Python 側で `API error <code>` として stderr に出て `exit 1`。
- usage 情報は **stderr** に出るため、stdout だけをパイプ/リダイレクトすれば本文だけを受け取れる。
- 依存は python3 標準ライブラリのみ(`requests` 等は不要)。python3 が見つからなければ `exit 127`。

**関連**:
- 同じ `~/.claude/bin/` 配下の実装委譲ラッパー `ask-kimi`(グローバル CLAUDE.md が規定する Kimi 委譲の入口)と対になる「API 直叩き」側の道具。
- Anthropic Messages API(`https://api.anthropic.com/v1/messages`)/ prompt caching(`cache_control: ephemeral`)/ Message Batches API(`/v1/messages/batches`)。

---

## 組織層：バンドルと隠蔽

この環境は、素の Claude Code に**第三者スキルを大量バンドルし、そのほとんどを `/` メニューから隠す**という組織層を敷いている。`~/.claude/skills/` 直下のエントリは実測 **999 件**(実ディレクトリ 992 + シンボリックリンク 7)。このうち大半を占めるのが外部から取り込んだ 2 つのスキル群で、いずれもフラット(サブディレクトリで分類せず直下に平置き)に配置し、frontmatter の `user-invocable: false` で人間の `/` メニューから外している。`user-invocable: false` を持つ `SKILL.md` は実測 **831 件**(バンドル 830 件 + 1 件)。

### フラット配置と二重の隠蔽

| 項目 | 実測値 |
|---|---|
| skills/ 直下の総エントリ | 999(実ディレクトリ 992 + symlink 7) |
| `user-invocable: false` の `SKILL.md` | 831 件 |
| cyber バンドル(隠しスキル) | 817 件 |
| taste バンドル(隠しスキル) | 13 件 |
| バンドル合計 | 830 件(= 817 + 13) |

隠蔽は「削除」ではなく「メニュー非表示」に留まる点が要点。`user-invocable: false` を付けても **Claude の自動ロード(説明文マッチによる呼び出し)は生きたまま**で、`/` のスラッシュメニューに列挙されなくなるだけ。数百のセキュリティ/デザインスキルで人間側のメニューが埋もれるのを防ぎつつ、Claude からは全量を引ける状態を保つ設計になっている。

### 分野ルーターと skills-map インデックス

830 件をフラットに平置きしたままでは実運用で埋もれるため、上に**分野ごとのルーター** と **横断インデックス**を重ねて束ねている。ルーター自身は `/` メニューに出る(`origin: user`)。

- **`security-ops`** — 817 件の cybersecurity スキル(mukul975/Anthropic-Cybersecurity-Skills)の司令塔。攻撃/侵入テスト・防御/検知・DFIR・脅威インテリ・クラウド監査・マルウェア解析・ID/ゼロトラスト・ICS/OT・AI/LLM・コンプラの依頼を受けたら最初にここへ入り、実在名を grep で確認したうえで適切なスキルと subagent(防御 = `security-analyst` / 攻撃 = `pentest-operator`、後者は書面認可ゲートあり)に委譲する。推測でスキル名を作らせない「実在名で引く」規律と、実行前の Legal Notice(認可)ゲートを強制する。
- **`design-taste-jp`** — 13 件の taste 系デザインスキル(旗艦 `taste-skill`、他 `minimalist-skill` / `soft-skill` / `gpt-tasteskill` 等)を**日本語運用に適応させる薄い統治層**。スキル本体(ラテン文字前提のジャーゴン)は訳さず、Design Read とユーザー向け出力の日本語化・和文タイポ(和文フォント・行間・禁則・和欧混植)の配慮だけを上乗せする。登録名(= ディレクトリ名)で土台スキルを呼ぶ。
- **`skills-map`** — 「どの作業をどのルーター/subagent に流すか」を一望する横断インデックス。分野(🔐 セキュリティ → `/security-ops`、🎨 デザイン → `/design-taste-jp`、💰 コスト → `/cost-route`、🧭 作業規程 → `/fable`)ごとに入口と実行者、束ねる隠しスキル群を対応づけ、重複分野の競合を「具体的なルーター最優先/隠しスキルは直接呼ばずルーター経由」というルールで解く。skills-map 自身は隠し件数を **830 件(817 + 13)** と表記している(実測の `user-invocable: false` 831 件はこの 830 に 1 件を加えた数)。

### manifest — 出典・件数・除去/復帰の台帳

バンドルごとに**由来と一括操作の手順を記録する台帳ファイル**を skills/ 直下に置いている。いずれも隠しファイル(先頭ドット)で、冒頭 2 行がコメント、以降 1 行 1 スキル名(= 削除対象のディレクトリ名)。

| manifest | 出典 | ライセンス | バージョン | 非コメント行(= スキル数) | 総行数(コメント2 含む) |
|---|---|---|---|---|---|
| `.cyber-skills-manifest.txt` | mukul975/Anthropic-Cybersecurity-Skills | **Apache-2.0** | v1.3.0(2026-07-07 コピー) | 817 | 819 |
| `.taste-skills-manifest.txt` | Leonxlnx/taste-skill | **MIT** | v1.0.0(2026-07-07 コピー) | 13 | 15 |

manifest の役割は 3 つ。**(1) 出所の記録**(1 行目コメントに元リポジトリ・バージョン・件数・コピー日)、**(2) 一括除去**(バンドルを丸ごと消すワンライナー)、**(3) メニュー復帰の対象リスト**(各行のスキルから `user-invocable: false` を外す際のループ入力)。

一括除去のワンライナーは**各 manifest の 2 行目コメント**に置かれている(両ファイルで同一ロジック):

```sh
while read s; do [ -n "$s" ] && [ "${s#\#}" = "$s" ] && rm -rf ~/.claude/skills/"$s"; done < this_file
```

`[ -n "$s" ]`(空行スキップ)と `[ "${s#\#}" = "$s" ]`(先頭 `#` のコメント行スキップ)で、非コメント行のスキル名だけを `rm -rf` する。**`this_file` はプレースホルダなので、実行時に実際の manifest 絶対パス**(例: `~/.claude/skills/.cyber-skills-manifest.txt`)**に置換する**必要がある。

`/` メニューへ戻すだけなら削除せず、同じ manifest を入力ループに使い、列挙された各スキルの `SKILL.md` から `user-invocable: false` 行を除去すればよい(自動ロードは元から生きているので、この 1 行を消すとメニューにも再掲される)。

### 第三者バンドルの帰属

隠している 830 スキルは自作ではなく外部 OSS の取り込みであり、出所とライセンスは manifest 冒頭に明記されている。cyber 群 817 件は **mukul975/Anthropic-Cybersecurity-Skills(Apache-2.0)**、taste 群 13 件は **Leonxlnx/taste-skill(MIT)**。再配布・改変時はそれぞれの Apache-2.0 / MIT 条項(帰属表示・ライセンス同梱)に従う。
