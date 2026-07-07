---
name: security-ops
description: 817個の cybersecurity スキルライブラリ(mukul975/Anthropic-Cybersecurity-Skills)のルーター。セキュリティ作業(攻撃/侵入テスト・防御/検知・DFIR・脅威インテリ・クラウド・マルウェア解析・ID/ゼロトラスト・ICS/OT・AI/LLM・コンプラ)の依頼時に、膨大なライブラリから適切なスキルを見つけ、正しい subagent とモデル階層に委譲する。Legal Notice(認可)ゲートと /fable 検証を強制する。セキュリティ関連の依頼を受けたら最初にこれを使う。
origin: user
---

# security-ops (セキュリティ作業のルーター)

`~/.claude/skills/` に **817個の cybersecurity スキル**がフラットに入っている。数が多すぎて素の一覧では埋もれる — このスキルは「正しいスキルを引き、正しい実行者(subagent × モデル)に渡す」ための司令塔。

## いつ使うか

セキュリティ寄りの依頼を受けた最初の一手。例: ログからの侵害調査、脆弱性の悪用検証(認可済)、フォレンジック、脅威インテリ、クラウド監査、マルウェア解析、検知ルール作成、コンプラ対応。

## 大原則(必ず守る)

1. **認可ゲートが先。** 攻撃系スキルは全て「authorized testing 限定」の Legal Notice 付き。実行系(exploit/attack/breakout)は、**書面の許可・スコープ(rules of engagement)を確認できるまで実行しない**。無ければ「認可の確認が必要」と返す。防御・検知・解析・コンプラは通常このゲート不要。
2. **推測でスキル名を作らない。** 817個は実在名で引く([[anti-hallucination]])。下の手順で grep して実物を確認してから呼ぶ。
3. **実行は /fable で。** 見つけたスキルの Workflow をなぞる前に [[fable]] Phase 0(完了条件・検証方法・やらないこと)を打つ。スキルに検証節("Validation Criteria" / "Verification" / "Detection" 等、名称は様々で無いスキルも多い)があれば Phase 4 の検証に使い、無ければ完了条件と観測データの突合で自前に検証する。

## ステップ

### 1. 領域を判定する

| 領域 | 代表的な verb 接頭辞(スキル名) |
|---|---|
| 攻撃 / 侵入テスト | `exploiting-` `attacking-` `abusing-` `bypassing-` `coercing-` `escaping-` `conducting-*-penetration-test` `executing-red-team-` `building-c2-` |
| 防御 / 検知 | `detecting-` `hunting-` `building-detection-` `building-soc-` `configuring-*-ids` `deploying-*edr/honeypot` |
| DFIR(フォレンジック/IR) | `analyzing-*(memory/disk/log/artifact)` `acquiring-` `extracting-` `collecting-` `conducting-*-incident-response` `containing-` `eradicating-` |
| 脅威インテリ | `analyzing-threat-` `building-threat-` `collecting-threat-` `correlating-` `generating-threat-` `*-ioc-` |
| クラウド | `auditing-aws/gcp/azure-` `detecting-aws/azure-` `implementing-aws/gcp/azure-` `enumerating-cloud-` `conducting-cloud-` `emulating-cloud-` |
| マルウェア解析 | `analyzing-*-malware` `deobfuscating-` `analyzing-cobalt-strike-` `analyzing-ransomware-` `extracting-config-` |
| ID / ゼロトラスト | `implementing-*-zero-trust` `configuring-*-mfa` `building-identity-` `implementing-pam-` `deploying-*zero-trust` |
| ICS / OT | `detecting-*scada/modbus/dnp3` `implementing-iec-62443-` `implementing-*-ot-` `detecting-attacks-on-*` |
| AI / LLM セキュリティ | `detecting-*prompt-injection` `defending-llms-` `continuous-llm-red-teaming-` `detecting-model-` `assessing-vector-` |
| Web / API | `exploiting-*(sql/ssrf/idor/jwt)` `conducting-api-security-` `implementing-api-` |
| コンプラ / ガバナンス | `achieving-cmmc-` `implementing-hipaa/gdpr/iso-` `conducting-cyber-risk-` `executing-nist-rmf-` |

### 2. 実在スキルを引く

説明文で全文検索する(名前だけでなく description も見る):

```bash
# キーワードで候補を出す(例: kerberoast)
grep -rl -i "kerberoast" ~/.claude/skills/*/SKILL.md | sed 's#.*/skills/##;s#/SKILL.md##'

# 名前接頭辞で領域一覧(例: 検知系)
ls ~/.claude/skills/ | grep -E '^(detecting|hunting)-'

# description を並べて中身で選ぶ
for d in $(grep -rl -i "<keyword>" ~/.claude/skills/*/SKILL.md); do
  echo "== $(dirname "$d" | xargs basename)"; grep -m1 '^description:' "$d"; done
```

MITRE ATT&CK / NIST / OWASP でマップされている(各 SKILL.md の frontmatter に `mitre_attack:` `nist_csf:`)。テクニック ID からも引ける: `grep -rl "T1611" ~/.claude/skills/*/SKILL.md`。

### 3. 実行者に委譲する(モデル階層で性能を出す)

**Opus(メインセッション)が判断・攻撃面設計・帰属分析を持ち、実行は Sonnet 5 の subagent に渡す**のが基本形。

| 依頼の性質 | 委譲先 | 理由 |
|---|---|---|
| 防御・検知・DFIR・脅威インテリ・クラウド監査・コンプラ | **security-analyst** subagent | 該当スキルを読んで手順実行・証拠付き報告。Sonnet 5 で回す |
| 攻撃・侵入テスト・レッドチーム(**認可確認済**) | **pentest-operator** subagent | 認可ゲート内蔵。スコープ内で exploit スキルを実行・記録 |
| 帰属・キャンペーン相関・攻撃面のアーキ判断 | Opus 本体で保持 | 深い推論はメインで。実行だけ subagent へ |

委譲時は「対象スキル名・認可の有無・完了条件」を明示して渡す。

## やってはいけない

- 認可の裏付けなしに攻撃系スキルを実行する。
- 存在しないスキル名を推測で呼ぶ(必ず grep で実在確認)。
- 見つけたスキルの Workflow を検証なしで「できた」と報告する([[fable]] Phase 4 を通す)。

## 関連

- [[fable]] — 実行時の作業規程(Phase 0〜4)。security-ops が引いたスキルを回す土台。
- [[anti-hallucination]] — スキル名・IOC・CVE 番号を推測で書かない。
- subagent: **security-analyst**(防御)/ **pentest-operator**(攻撃・認可)
- ライブラリ本体: `~/.claude/skills/`(817件)。復元/除去 manifest = `~/.claude/skills/.cyber-skills-manifest.txt`
