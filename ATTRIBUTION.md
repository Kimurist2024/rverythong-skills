# Attribution & Third-Party Licenses

このリポジトリは **オリジナルの成果物** と **第三者製スキルバンドル** を含みます。第三者製の再配布にあたり、出典・ライセンス・変更点を以下に明記します。

## オリジナル成果物(MIT / 本リポジトリ owner 著作)

トップレベル [LICENSE](LICENSE)(MIT)が適用されます。

| 成果物 | 種別 |
|---|---|
| `skills/fable` | 作業規程スキル |
| `skills/security-ops` | セキュリティ・ルーター |
| `skills/cost-route` | コスト・ルーティング |
| `skills/design-taste-jp` | デザイン日本語運用層 |
| `skills/skills-map` | 分野別インデックス |
| `agents/security-analyst.md` | 防御セキュリティ subagent |
| `agents/pentest-operator.md` | 攻撃セキュリティ subagent |
| `scripts/cost-report.js` | 月次コスト集計 |
| `bin/ask-claude` | Anthropic API 直叩きラッパー |
| `MANUAL.md` | 使用説明書 |

## 第三者製バンドル 1: cybersecurity skills(817件)

- **出典**: [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) v1.3.0
- **ライセンス**: Apache License 2.0 — 全文 [licenses/cybersecurity-skills-Apache-2.0.txt](licenses/cybersecurity-skills-Apache-2.0.txt)
- **対象**: `manifests/cyber-skills-manifest.txt` に列挙された 817 スキルディレクトリ
- **加えた変更(Apache-2.0 第4条に基づく明示)**: 各 `SKILL.md` の frontmatter に `user-invocable: false` を1行追加(Claude Code の `/` メニューから隠し、ルーター `security-ops` 経由で参照するため)。スキル本文・手順・コードは未改変。

## 第三者製バンドル 2: taste / frontend design skills(13件)

- **出典**: [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) v1.0.0
- **ライセンス**: MIT — 全文 [licenses/taste-skill-MIT.txt](licenses/taste-skill-MIT.txt)
- **対象**: `manifests/taste-skills-manifest.txt` に列挙された 13 スキルディレクトリ
- **加えた変更**: 各 `SKILL.md` の frontmatter に `user-invocable: false` を1行追加。本文は未改変。日本語運用の上乗せは別ファイル `skills/design-taste-jp`(オリジナル)で行っており、上流スキルは改変していない。

## 注記

- 各第三者スキルディレクトリ内の frontmatter には元の `author` / `license` フィールドが保持されています。
- 上流リポジトリが将来ライセンスや内容を変更しうるため、正確な現行条件は各出典リポジトリを参照してください。
