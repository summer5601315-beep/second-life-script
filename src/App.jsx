import { useMemo, useState } from 'react';
import {
  RESOURCE_OPTS,
  CITY_OPTS,
  EDU_OPTS,
  TRAIT_OPTS,
  FAMILY_OPTS,
  TAG_LABELS,
  seedStats,
  invisibleRule,
  buildDeck,
  applyDelta,
  classTier,
  endingLine,
  buildShareText,
} from './game.js';

const STAT_META = [
  { key: 'money', label: '金钱', color: '#e8b86d' },
  { key: 'status', label: '地位', color: '#9b8cff' },
  { key: 'intimacy', label: '亲密', color: '#f0a0b8' },
  { key: 'energy', label: '能量', color: '#6dd5c0' },
];

function StatBars({ stats, startStats }) {
  return (
    <div className="stat-bars">
      {STAT_META.map(({ key, label, color }) => {
        const v = stats[key];
        const start = startStats?.[key];
        return (
          <div className="stat-row" key={key}>
            <div className="stat-head">
              <span>{label}</span>
              <span className="stat-val">
                {start != null ? `${start} → ${v}` : v}
              </span>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${v}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricGrid({ stats }) {
  return (
    <div className="metrics">
      {STAT_META.map(({ key, label, color }) => (
        <div className="metric" key={key}>
          <div className="metric-val" style={{ color }}>
            {stats[key]}
          </div>
          <div className="metric-label">{label}</div>
        </div>
      ))}
    </div>
  );
}

function ChipSelect({ label, options, value, onChange }) {
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      <div className="chips">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`chip ${value === o.value ? 'active' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState('landing');
  const [resource, setResource] = useState('ok');
  const [city, setCity] = useState('provincial');
  const [edu, setEdu] = useState('bachelor');
  const [trait, setTrait] = useState('steady');
  const [family, setFamily] = useState('neutral');
  const [stats, setStats] = useState(() => seedStats('ok', 'provincial', 'bachelor', 'neutral'));
  const [startStats, setStartStats] = useState(() =>
    seedStats('ok', 'provincial', 'bachelor', 'neutral'),
  );
  const [turn, setTurn] = useState(0);
  const [tags, setTags] = useState([]);
  const [log, setLog] = useState([]);
  const [rule, setRule] = useState('');
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState(null);

  const preview = useMemo(
    () => seedStats(resource, city, edu, family),
    [resource, city, edu, family],
  );

  const deck = buildDeck(trait, tags, resource, city);
  const totalTurns = deck.length;
  const card = deck[Math.min(turn, totalTurns - 1)];
  const tier = classTier(stats, tags);

  function startRun() {
    const seeded = seedStats(resource, city, edu, family);
    setStats(seeded);
    setStartStats(seeded);
    setTags([]);
    setLog([]);
    setTurn(0);
    setRule(invisibleRule(resource, city, edu, family));
    setFlash(null);
    setPhase('play');
  }

  function pick(choice) {
    const nextStats = applyDelta(stats, choice.delta);
    const nextTags =
      choice.tag && !tags.includes(choice.tag) ? [...tags, choice.tag] : [...tags];
    const shortTitle = card.title;
    const nextLog = [...log, `${shortTitle}→${choice.label}`];
    setFlash(choice.delta);
    setStats(nextStats);
    setTags(nextTags);
    setLog(nextLog);
    window.setTimeout(() => {
      setFlash(null);
      if (turn + 1 >= totalTurns) {
        setPhase('end');
      } else {
        setTurn((t) => t + 1);
      }
    }, 280);
  }

  function resetAll() {
    setPhase('setup');
    setTurn(0);
    setTags([]);
    setLog([]);
    setRule('');
    setCopied(false);
    setFlash(null);
  }

  async function copyShare() {
    const text = buildShareText({
      resource,
      city,
      edu,
      family,
      trait,
      startStats,
      stats,
      tags,
      log,
      tier,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="app">
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />
      <div className="shell">
        {phase === 'landing' && (
          <section className="card hero">
            <div className="badge">免费体验 · 一局标准剧本</div>
            <h1>第二人生剧本</h1>
            <p className="tagline">换个出身，重写一局人生</p>
            <p className="lede">
              选一个出身，用八道关键选择，看事业、阶层与亲密关系如何分叉。
              第一波写给想看清自己赛道的她——当然，他也欢迎来重开一局。
            </p>
            <ul className="bullets">
              <li>开局定资源、城市、教育、家庭与性格</li>
              <li>8 回合事件，每回合 3 个选择，标签会连锁</li>
              <li>结局给阶层落点、起点对比与可分享复盘</li>
            </ul>
            <button type="button" className="btn primary lg" onClick={() => setPhase('setup')}>
              开始这一局
            </button>
            <p className="soft-cta">解锁对照局 / 复盘报告 · 即将开放</p>
          </section>
        )}

        {phase === 'setup' && (
          <>
            <header className="topbar">
              <button type="button" className="linkish" onClick={() => setPhase('landing')}>
                ← 返回
              </button>
              <span>开局设定</span>
              <span className="spacer" />
            </header>
            <section className="card">
              <h2>选你的出身</h2>
              <p className="muted">先定赛道。预览会即时给出起点四维。</p>
              <ChipSelect
                label="资源档"
                options={RESOURCE_OPTS}
                value={resource}
                onChange={setResource}
              />
              <ChipSelect label="起点城市" options={CITY_OPTS} value={city} onChange={setCity} />
              <ChipSelect label="教育通道" options={EDU_OPTS} value={edu} onChange={setEdu} />
              <ChipSelect
                label="家庭支持"
                options={FAMILY_OPTS}
                value={family}
                onChange={setFamily}
              />
              <ChipSelect
                label="性格倾向"
                options={TRAIT_OPTS}
                value={trait}
                onChange={setTrait}
              />
            </section>
            <section className="card">
              <h2>起点预览</h2>
              <MetricGrid stats={preview} />
              <div className="callout">
                <div className="callout-lead">本局隐形规则</div>
                <p>{invisibleRule(resource, city, edu, family)}</p>
              </div>
              <button type="button" className="btn primary lg" onClick={startRun}>
                开始这一局
              </button>
            </section>
          </>
        )}

        {phase === 'play' && (
          <>
            <header className="topbar">
              <span className="turn-pill">
                {turn + 1} / {totalTurns}
              </span>
              <span>进行中</span>
              <span className="spacer" />
            </header>
            <div className="progress">
              <div
                className="progress-fill"
                style={{ width: `${((turn + 1) / totalTurns) * 100}%` }}
              />
            </div>
            <section className="card compact">
              <MetricGrid stats={stats} />
              {flash && (
                <div className="flash">
                  {STAT_META.filter((m) => flash[m.key]).map((m) => (
                    <span key={m.key} style={{ color: m.color }}>
                      {m.label}
                      {flash[m.key] > 0 ? '+' : ''}
                      {flash[m.key]}
                    </span>
                  ))}
                </div>
              )}
              {tags.length > 0 && (
                <div className="tag-row">
                  {tags.map((t) => (
                    <span className={`tag tag-${t}`} key={t}>
                      {TAG_LABELS[t] || t}
                    </span>
                  ))}
                </div>
              )}
              <p className="rule-line">{rule}</p>
            </section>
            <section className="card event">
              <div className="event-meta">{card.turnLabel}</div>
              <h2>{card.title}</h2>
              <p className="event-body">{card.body}</p>
              <div className="choices">
                {card.choices.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`choice ${i === 0 ? 'featured' : ''}`}
                    onClick={() => pick(c)}
                  >
                    <span className="choice-label">{c.label}</span>
                    <span className="choice-hint">{c.hint}</span>
                    {c.tag ? (
                      <span className="choice-tag">可能获得：{TAG_LABELS[c.tag] || c.tag}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {phase === 'end' && (
          <>
            <header className="topbar">
              <span>一局复盘</span>
              <span className="spacer" />
            </header>
            <section className="card">
              <div className={`tier-badge tone-${tier.tone}`}>{tier.label}</div>
              <p className="tier-detail">{tier.detail}</p>
              <div className="callout">
                <div className="callout-lead">你的画像</div>
                <p>{endingLine(stats, tags)}</p>
              </div>
              <h3>终点四维</h3>
              <MetricGrid stats={stats} />
              {tags.length > 0 && (
                <div className="tag-row">
                  {tags.map((t) => (
                    <span className={`tag tag-${t}`} key={t}>
                      {TAG_LABELS[t] || t}
                    </span>
                  ))}
                </div>
              )}
            </section>
            <section className="card">
              <h2>起点 vs 终点</h2>
              <StatBars stats={stats} startStats={startStats} />
            </section>
            <section className="card">
              <h2>你的选择轨迹</h2>
              <ol className="log">
                {log.map((line, i) => (
                  <li key={i}>
                    <span className="log-n">回合 {i + 1}</span>
                    {line}
                  </li>
                ))}
              </ol>
              <div className="share-box">
                <div className="callout-lead">分享卡片文案</div>
                <pre className="share-text">
                  {buildShareText({
                    resource,
                    city,
                    edu,
                    family,
                    trait,
                    startStats,
                    stats,
                    tags,
                    log,
                    tier,
                  })}
                </pre>
                <button type="button" className="btn secondary" onClick={copyShare}>
                  {copied ? '已复制 ✓' : '复制复盘文案'}
                </button>
              </div>
              <button type="button" className="btn primary lg" onClick={resetAll}>
                换出身再开一局
              </button>
              <p className="soft-cta">想对比另一出身？解锁对照局 / 复盘报告 · 即将开放</p>
            </section>
          </>
        )}

        <footer className="foot">第二人生剧本 · MVP</footer>
      </div>
    </div>
  );
}
