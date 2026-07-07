#!/usr/bin/env node
/**
 * cost-report.js — Claude Code の実使用量を月次で集計する。
 *
 * 集計源: ~/.claude/projects/(以下すべての *.jsonl)。各 assistant 行の
 * message.usage(input / output / cache_creation / cache_read)と message.model
 * を読み、月 × モデルで合計してコストを推定する。
 *
 * ⚠️ 単価は「概算」。最新の Anthropic 価格に合わせて下の RATES を編集すること。
 *    opus[1m] の長コンテキスト(>200K)割増はここでは概算に含めない(実額は上振れしうる)。
 *
 * 使い方:
 *   node ~/.claude/scripts/cost-report.js                 # 全月サマリ
 *   node ~/.claude/scripts/cost-report.js --month 2026-07 # 指定月の内訳
 *   node ~/.claude/scripts/cost-report.js --threshold 40  # 当月が $40 超なら警告(exit 1)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// 1M トークンあたり USD(概算・要編集)。cacheRead は入力の ~0.1x、cacheWrite(5m)は ~1.25x。
const RATES = {
  haiku:  { input: 1.0,  output: 5.0,  cacheWrite: 1.25,  cacheRead: 0.10 },
  sonnet: { input: 3.0,  output: 15.0, cacheWrite: 3.75,  cacheRead: 0.30 },
  opus:   { input: 15.0, output: 75.0, cacheWrite: 18.75, cacheRead: 1.50 },
  // fable の公開単価は不明。暫定で sonnet 帯として概算(要見直し)。
  fable:  { input: 3.0,  output: 15.0, cacheWrite: 3.75,  cacheRead: 0.30 },
};

function rateFor(model) {
  const m = String(model || '').toLowerCase();
  if (m.includes('haiku')) return RATES.haiku;
  if (m.includes('opus')) return RATES.opus;
  if (m.includes('fable')) return RATES.fable;
  return RATES.sonnet; // sonnet / unknown はここ
}

function args() {
  const a = process.argv.slice(2);
  const out = { month: null, threshold: null };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--month') out.month = a[++i];
    else if (a[i] === '--threshold') out.threshold = Number(a[++i]);
  }
  return out;
}

function* jsonlFiles(dir) {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* jsonlFiles(p);
    else if (e.isFile() && p.endsWith('.jsonl')) yield p;
  }
}

async function main() {
  const { month: onlyMonth, threshold } = args();
  const root = path.join(os.homedir(), '.claude', 'projects');
  // agg[month][model] = {msgs, input, output, cacheW, cacheR, cost}
  const agg = {};
  // 同一 message.id は同一課金レスポンス。サイドチェーン再生・再開/フォークで複製されるため
  // 重複排除する(排除しないと実測 ~2x 過大計上・--threshold 過剰発火)。isSidechain は
  // 本物のサブエージェント課金なので落とさない。id 単独で dedup する。
  const seen = new Set();

  for (const file of jsonlFiles(root)) {
    let stream;
    try { stream = fs.createReadStream(file, { encoding: 'utf8' }); } catch { continue; }
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    for await (const line of rl) {
      if (!line.includes('"usage"')) continue; // 高速化: usage 行だけ
      let obj;
      try { obj = JSON.parse(line); } catch { continue; }
      const msg = obj.message;
      if (!msg || !msg.usage || msg.role !== 'assistant') continue;
      const mid = msg.id;
      if (mid) { if (seen.has(mid)) continue; seen.add(mid); } // 重複課金レスポンスを1回だけ計上
      const ts = obj.timestamp || msg.timestamp;
      if (!ts) continue;
      const mon = String(ts).slice(0, 7); // YYYY-MM
      if (onlyMonth && mon !== onlyMonth) continue;
      const model = msg.model || 'unknown';
      const u = msg.usage;
      const inp = +u.input_tokens || 0;
      const outp = +u.output_tokens || 0;
      const cw = +u.cache_creation_input_tokens || 0;
      const cr = +u.cache_read_input_tokens || 0;
      const r = rateFor(model);
      const cost = (inp * r.input + outp * r.output + cw * r.cacheWrite + cr * r.cacheRead) / 1e6;

      agg[mon] = agg[mon] || {};
      const key = String(model);
      const cell = agg[mon][key] || (agg[mon][key] = { msgs: 0, input: 0, output: 0, cacheW: 0, cacheR: 0, cost: 0 });
      cell.msgs++; cell.input += inp; cell.output += outp; cell.cacheW += cw; cell.cacheR += cr; cell.cost += cost;
    }
  }

  const months = Object.keys(agg).sort();
  if (months.length === 0) { console.log('使用量データが見つかりません (~/.claude/projects/**/*.jsonl)'); return; }

  const nowMonth = new Date().toISOString().slice(0, 7);
  const fmt = n => '$' + n.toFixed(2);
  const k = n => (n / 1000).toFixed(0) + 'k';

  console.log('# Claude Code 月次コスト(概算・notional)');
  console.log('※ これは「全量を素の API 従量で叩いた場合」の概算。サブスク定額プランなら実請求ではなく');
  console.log('  使用量の目安。従量(credits)なら実額に近い。cacheR 列=キャッシュ読込トークン(安いが量が多い)。\n');
  let grand = 0;
  for (const mon of months) {
    const models = agg[mon];
    let mTotal = 0;
    const rows = Object.entries(models).sort((a, b) => b[1].cost - a[1].cost);
    const mark = mon === nowMonth ? '  ← 当月' : '';
    console.log(`## ${mon}${mark}`);
    console.log('model                     msgs     in      out    cacheR     cost');
    for (const [model, c] of rows) {
      mTotal += c.cost;
      console.log(
        `${model.padEnd(24)} ${String(c.msgs).padStart(5)} ${k(c.input).padStart(7)} ${k(c.output).padStart(7)} ${k(c.cacheR).padStart(8)} ${fmt(c.cost).padStart(9)}`
      );
    }
    console.log(`${'合計'.padEnd(24)} ${''.padStart(5)} ${''.padStart(7)} ${''.padStart(7)} ${''.padStart(8)} ${fmt(mTotal).padStart(9)}\n`);
    grand += mTotal;
  }
  console.log(`総計(全月): ${fmt(grand)}`);

  if (threshold != null && !Number.isNaN(threshold)) {
    const cur = Object.values(agg[nowMonth] || {}).reduce((s, c) => s + c.cost, 0);
    if (cur > threshold) {
      console.error(`\n⚠️  当月 ${nowMonth} = ${fmt(cur)} が閾値 ${fmt(threshold)} を超過`);
      process.exit(1);
    } else {
      console.log(`\n✅ 当月 ${nowMonth} = ${fmt(cur)}(閾値 ${fmt(threshold)} 以内)`);
    }
  }
}

main().catch(e => { console.error('cost-report error:', e.message); process.exit(2); });
