# rverythong-skills

Claude Code 用のスキル・サブエージェント・スクリプト集。**オリジナルの作業規程/ルーター/コスト管理**と、分野別に束ねた**セキュリティ 817 + デザイン 13 の第三者スキルバンドル**をまとめたもの。

> 詳細な使い方は **[MANUAL.md](MANUAL.md)** を参照してください。

## 構成

```
skills/          835 スキル(オリジナル5 + cybersecurity 817 + taste 13)
  fable/                観測駆動の作業規程(3原則+Phase0-4)
  security-ops/         セキュリティ 817 のルーター
  cost-route/           モデル階層×実行経路のコスト・ルーティング
  design-taste-jp/      taste 系の日本語運用層 + 和文タイポ
  skills-map/           分野別インデックス(まずここを開く)
  <817 cybersecurity>   exploiting-/detecting-/analyzing-/hunting-/... (第三者)
  <13 taste/design>     taste-skill/minimalist-skill/soft-skill/... (第三者)
agents/          2 サブエージェント
  security-analyst.md   防御セキュリティ(DFIR/検知/脅威インテリ)
  pentest-operator.md   攻撃セキュリティ(認可ゲート内蔵)
scripts/         cost-report.js   月次コスト集計(セッションログから)
bin/             ask-claude       Anthropic API 直叩きラッパー
manifests/       第三者バンドルの出典・件数・復元手順
licenses/        第三者バンドルの上流ライセンス
```

## クイックスタート

Claude Code のユーザースキルとして使うなら、必要なものを `~/.claude/` 配下にコピーします。

```bash
# スキル(例: オリジナル5点だけ)
cp -R skills/fable skills/security-ops skills/cost-route \
      skills/design-taste-jp skills/skills-map ~/.claude/skills/
# サブエージェント
cp agents/*.md ~/.claude/agents/
# スクリプト
mkdir -p ~/.claude/scripts ~/.claude/bin
cp scripts/cost-report.js ~/.claude/scripts/
cp bin/ask-claude ~/.claude/bin/ && chmod +x ~/.claude/bin/ask-claude
```

第三者バンドル(817+13)も含めて丸ごと使う場合は `skills/` 配下を全部 `~/.claude/skills/` にコピーしてください。各スキルは `user-invocable: false` が付いており `/` メニューには出ません(ルーター `skills-map` / `security-ops` / `design-taste-jp` 経由で使う設計)。メニューに出したい場合は各 `SKILL.md` からその1行を削除します。

## 分野の入口(競合を避ける)

| 分野 | 入口 |
|---|---|
| どこから見るか迷ったら | `/skills-map` |
| セキュリティ | `/security-ops`(+ subagent security-analyst / pentest-operator) |
| デザイン(日本語) | `/design-taste-jp` |
| コスト管理 | `/cost-route`(+ `scripts/cost-report.js`, `bin/ask-claude`) |
| 作業規程・品質 | `/fable` |

## ライセンス

- オリジナル成果物: MIT([LICENSE](LICENSE))
- 第三者バンドル: cybersecurity=Apache-2.0 / taste=MIT。出典・変更点は [ATTRIBUTION.md](ATTRIBUTION.md) と [licenses/](licenses/) を参照。
