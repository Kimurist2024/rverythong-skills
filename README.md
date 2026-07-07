# rverythong-skills

Claude Code 用のスキル・サブエージェント・スクリプト集。**オリジナルの作業規程/ルーター/コスト管理**と、分野別に束ねた**セキュリティ 817 + デザイン 13 の第三者スキルバンドル**をまとめたもの。

> 詳細な使い方は **[MANUAL.md](MANUAL.md)** を参照してください。

## 構成

```
skills/          996 スキル
  ├ オリジナル5    fable / security-ops / cost-route / design-taste-jp / skills-map
  ├ cybersecurity  817(第三者 exploiting-/detecting-/analyzing-/hunting-/...)
  ├ taste/design   13(第三者 taste-skill/minimalist-skill/soft-skill/...)
  └ ECC ほか       161(Everything Claude Code 等の汎用スキル群)
agents/          49 サブエージェント
  ├ security-analyst.md   防御セキュリティ(DFIR/検知/脅威インテリ)
  ├ pentest-operator.md   攻撃セキュリティ(認可ゲート内蔵)
  └ その他47              ECC 標準エージェント群(code-reviewer / architect / ...)
scripts/         cost-report.js   月次コスト集計(セッションログから)
bin/             ask-claude       Anthropic API 直叩きラッパー
manifests/       第三者バンドルの出典・件数・復元手順
licenses/        第三者バンドルの上流ライセンス
```

> **注**: owner の非公開プロジェクトや個人情報に固有の一部エージェント/スキルは意図的に除外しています。詳細は [ATTRIBUTION.md](ATTRIBUTION.md)。

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
