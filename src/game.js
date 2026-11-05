/** 第二人生剧本 — core game logic */

export const RESOURCE_OPTS = [
  { value: 'tight', label: '拮据' },
  { value: 'ok', label: '温饱' },
  { value: 'comfortable', label: '宽裕' },
  { value: 'rich', label: '富足' },
];

export const CITY_OPTS = [
  { value: 'tier34', label: '三四线' },
  { value: 'provincial', label: '省会' },
  { value: 'tier1', label: '一线' },
  { value: 'overseas', label: '海外' },
];

export const EDU_OPTS = [
  { value: 'dropout', label: '辍学' },
  { value: 'vocational', label: '职高' },
  { value: 'bachelor', label: '本科' },
  { value: 'elite', label: '名校' },
];

export const TRAIT_OPTS = [
  { value: 'steady', label: '求稳' },
  { value: 'gamble', label: '搏一把' },
  { value: 'relation', label: '重关系' },
  { value: 'skill', label: '重能力' },
];

export const FAMILY_OPTS = [
  { value: 'drag', label: '拖累较多' },
  { value: 'neutral', label: '平常' },
  { value: 'support', label: '强力支持' },
];

export const TAG_LABELS = {
  debt: '负债中',
  mentor: '有导师',
  burned: '透支中',
  partner: '开始靠近',
  credential: '能力凭证',
  business: '创业中',
};

export function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function applyDelta(s, d) {
  return {
    money: clamp(s.money + (d.money ?? 0)),
    status: clamp(s.status + (d.status ?? 0)),
    intimacy: clamp(s.intimacy + (d.intimacy ?? 0)),
    energy: clamp(s.energy + (d.energy ?? 0)),
  };
}

export function fmtDelta(d) {
  const parts = [];
  if (d.money) parts.push(`金钱${d.money > 0 ? '+' : ''}${d.money}`);
  if (d.status) parts.push(`地位${d.status > 0 ? '+' : ''}${d.status}`);
  if (d.intimacy) parts.push(`亲密${d.intimacy > 0 ? '+' : ''}${d.intimacy}`);
  if (d.energy) parts.push(`能量${d.energy > 0 ? '+' : ''}${d.energy}`);
  return parts.join(' · ') || '无变化';
}

export function seedStats(resource, city, edu, family) {
  const moneyBase =
    resource === 'tight' ? 16 : resource === 'ok' ? 34 : resource === 'comfortable' ? 56 : 80;
  const cityBoost = city === 'tier1' || city === 'overseas' ? 8 : city === 'provincial' ? 4 : 0;
  const eduBoost =
    edu === 'elite' ? 18 : edu === 'bachelor' ? 10 : edu === 'vocational' ? 4 : 0;
  const familyMoney = family === 'support' ? 8 : family === 'drag' ? -8 : 0;
  const familyIntimacy = family === 'support' ? 10 : family === 'drag' ? -6 : 0;
  const familyEnergy = family === 'drag' ? -8 : family === 'support' ? 4 : 0;
  return {
    money: clamp(moneyBase + (city === 'overseas' ? 6 : 0) + familyMoney),
    status: clamp(20 + eduBoost + cityBoost),
    intimacy: clamp(46 + familyIntimacy),
    energy: clamp((resource === 'tight' ? 40 : 60) + familyEnergy),
  };
}

export function invisibleRule(resource, city, edu, family) {
  if (family === 'drag' && resource === 'tight') {
    return '双重承压：家里要你撑场面，钱包却见底——每一次靠近与冒险，都得先问自己撑不撑得住。';
  }
  if (resource === 'tight' && edu !== 'elite') {
    return '容错极低：一次生病、一次失恋连带失业，就可能把能量和金钱一起打穿。';
  }
  if (resource === 'rich' || edu === 'elite') {
    return '上升通道更宽：同样的冒险与感情投入，失败代价更小，你还能再试一次。';
  }
  if (city === 'tier1' || city === 'overseas') {
    return '机会密、消耗也密：不涨地位就容易被房租、社交与节奏一起拖垮。';
  }
  if (family === 'support') {
    return '家是后盾：你可以比别人多试一次失败，也多一点勇气去靠近人——但别把支持当无限额度。';
  }
  return '中等赛道：事业与感情都靠持续选择慢慢拉开差距，急不得也懒不得。';
}

export function buildDeck(trait, tags, resource, city) {
  const debt = tags.includes('debt');
  const mentor = tags.includes('mentor');
  const burned = tags.includes('burned');
  const partner = tags.includes('partner');
  const credential = tags.includes('credential');
  const business = tags.includes('business');
  const lowEnergy = burned;

  const rentHit = city === 'tier1' || city === 'overseas' ? -10 : city === 'provincial' ? -5 : -2;

  return [
    {
      id: 'job',
      title: '工作路口',
      turnLabel: '第 1 回合',
      body: '公司给你三条路：留下稳拿奖金，跳去更高天花板，或留职偷偷开副业。身边的姐妹说：别只为别人活。你呢？',
      choices: [
        {
          id: 'stay',
          label: '留下求稳',
          hint: fmtDelta({
            money: trait === 'steady' ? 10 : 6,
            energy: 4,
            status: 1,
          }),
          delta: {
            money: trait === 'steady' ? 10 : 6,
            energy: 4,
            status: 1,
          },
        },
        {
          id: 'jump',
          label: '跳槽搏一把',
          hint: fmtDelta({
            status: trait === 'gamble' ? 14 : 9,
            money: -6,
            energy: -8,
            intimacy: -2,
          }),
          delta: {
            status: trait === 'gamble' ? 14 : 9,
            money: -6,
            energy: -8,
            intimacy: -2,
          },
        },
        {
          id: 'side',
          label: '留职做副业',
          hint: fmtDelta({ money: 8, energy: -12, status: 3 }),
          delta: { money: 8, energy: -12, status: 3 },
          tag: 'burned',
        },
      ],
    },
    {
      id: 'rent',
      title: '城市成本',
      turnLabel: '第 2 回合',
      body:
        city === 'tier1' || city === 'overseas'
          ? '房租、通勤、一点点像样的社交，把现金流咬得很紧。要不要为机会继续留在高成本城市？'
          : '本地机会一般，但开销可控。有人劝你去更大的城市碰运气，也有人说：先把自己安顿好。',
      choices: [
        {
          id: 'staycity',
          label: '继续留在这里',
          hint: fmtDelta({
            money: rentHit + 2,
            energy: 2,
            status: city === 'tier34' ? -2 : 1,
          }),
          delta: {
            money: rentHit + 2,
            energy: 2,
            status: city === 'tier34' ? -2 : 1,
          },
        },
        {
          id: 'movecity',
          label: '搬去更大城市',
          hint: fmtDelta({ status: 10, money: -14, energy: -8, intimacy: -4 }),
          delta: { status: 10, money: -14, energy: -8, intimacy: -4 },
          tag: 'burned',
        },
        {
          id: 'share',
          label: '合租压缩开支',
          hint: fmtDelta({ money: 8, intimacy: -3, energy: -2 }),
          delta: { money: 8, intimacy: -3, energy: -2 },
        },
      ],
    },
    {
      id: 'relation',
      title: '关系来电',
      turnLabel: '第 3 回合',
      body: '一个旧同学突然找你：可能是贵人，也可能是来借钱。你对人有防备，但机会也常常藏在关系里。',
      choices: [
        {
          id: 'open',
          label: '见面聊聊',
          hint: fmtDelta({
            intimacy: trait === 'relation' ? 14 : 8,
            energy: -4,
            status: 2,
          }),
          delta: {
            intimacy: trait === 'relation' ? 14 : 8,
            energy: -4,
            status: 2,
          },
          tag: 'mentor',
        },
        {
          id: 'keep',
          label: '礼貌保持距离',
          hint: fmtDelta({ energy: 3, intimacy: -1 }),
          delta: { energy: 3, intimacy: -1 },
        },
        {
          id: 'lend',
          label: '先借一笔试试信任',
          hint: fmtDelta({ intimacy: 10, money: -14, energy: -3 }),
          delta: { intimacy: 10, money: -14, energy: -3 },
          tag: 'debt',
        },
      ],
    },
    {
      id: 'skill',
      title: '能力跃迁',
      turnLabel: '第 4 回合',
      body: mentor
        ? '贵人愿意带你考证或进项目，但要投入时间和一点学费——你答应了，周末约会可能得往后排。'
        : '你看到一条可考证、可做作品集的路径。短期没钱，长期抬天花板；也意味着少一点社交与约会的空闲。',
      choices: [
        {
          id: 'cert',
          label: '投入考证/作品',
          hint: fmtDelta({
            status: trait === 'skill' || mentor ? 14 : 9,
            money: -8,
            energy: -10,
          }),
          delta: {
            status: trait === 'skill' || mentor ? 14 : 9,
            money: -8,
            energy: -10,
          },
          tag: 'credential',
        },
        {
          id: 'cashnow',
          label: '先赚钱再说',
          hint: fmtDelta({ money: 12, status: -2, energy: -6 }),
          delta: { money: 12, status: -2, energy: -6 },
          tag: 'burned',
        },
        {
          id: 'wait',
          label: '观望，保存体力',
          hint: fmtDelta({ energy: 8, status: -1 }),
          delta: { energy: 8, status: -1 },
        },
      ],
    },
    {
      id: 'cash',
      title: '缺钱压力',
      turnLabel: '第 5 回合',
      body: debt
        ? '账单叠上来了：上一笔人情债开始催。你必须选一条止血方式——朋友圈里别人晒旅行，你在算下个月房租。'
        : resource === 'tight'
          ? '这个月几乎见底。你可以硬扛、借钱，或押技能换下一档收入。'
          : '现金流紧了一档。处理方式会决定你后面还能不能跃迁，也决定你还有没有余力经营关系。',
      choices: [
        {
          id: 'grind',
          label: '加班硬扛',
          hint: fmtDelta({ money: 14, energy: -16, intimacy: -6 }),
          delta: { money: 14, energy: -16, intimacy: -6 },
          tag: 'burned',
        },
        {
          id: 'loan',
          label: '高息周转',
          hint: fmtDelta({ money: 18, energy: 2, status: -5 }),
          delta: { money: 18, energy: 2, status: -5 },
          tag: 'debt',
        },
        {
          id: 'skillcash',
          label: credential || mentor ? '用新技能接一单' : '降价接杂活',
          hint: fmtDelta({
            money: credential || mentor ? 11 : 7,
            status: credential ? 4 : -1,
            energy: -8,
          }),
          delta: {
            money: credential || mentor ? 11 : 7,
            status: credential ? 4 : -1,
            energy: -8,
          },
        },
      ],
    },
    {
      id: 'love',
      title: '靠近或防备',
      turnLabel: '第 6 回合',
      body: lowEnergy
        ? '你已经很累。有人约你认真见面——你想靠近，又怕再耗掉最后一点能量。网上有人说以后会跟机器人结婚，你笑了一下，却没关掉那条消息。'
        : '有人认真约你深聊。你可以打开一点，也可以继续把所有人挡在门外。防备能保护你，也会把友情和爱情一起挡住。',
      choices: [
        {
          id: 'date',
          label: '去，低风险靠近',
          hint: fmtDelta({ intimacy: 14, energy: -5, money: -3 }),
          delta: { intimacy: 14, energy: -5, money: -3 },
          tag: 'partner',
        },
        {
          id: 'text',
          label: '只线上浅聊',
          hint: fmtDelta({ intimacy: 5, energy: 3 }),
          delta: { intimacy: 5, energy: 3 },
        },
        {
          id: 'wall',
          label: '继续防备，全部推掉',
          hint: fmtDelta({ intimacy: -12, energy: 7, status: -2 }),
          delta: { intimacy: -12, energy: 7, status: -2 },
        },
      ],
    },
    {
      id: 'family',
      title: '家庭拉扯',
      turnLabel: '第 7 回合',
      body: partner
        ? '家里有事需要你回去处理；你刚开始靠近的人也希望周末能陪着。两边都要，你会怎么分？'
        : '家里突然要钱、要人。你可以全接、谈条件，或先保自己——女人往往最先被要求「懂事」。',
      choices: [
        {
          id: 'giveall',
          label: '尽量都扛下来',
          hint: fmtDelta({ intimacy: 10, money: -12, energy: -10 }),
          delta: { intimacy: 10, money: -12, energy: -10 },
          tag: 'burned',
        },
        {
          id: 'boundary',
          label: '设边界，给一部分',
          hint: fmtDelta({ intimacy: 3, money: -5, energy: -3, status: 2 }),
          delta: { intimacy: 3, money: -5, energy: -3, status: 2 },
        },
        {
          id: 'self',
          label: '先保自己的跃迁',
          hint: fmtDelta({ status: 6, intimacy: -10, energy: 4, money: 2 }),
          delta: { status: 6, intimacy: -10, energy: 4, money: 2 },
        },
      ],
    },
    {
      id: 'leap',
      title: '阶层关键一跃',
      turnLabel: '第 8 回合',
      body: business
        ? '你已经在小生意路上。要加码扩张，还是先稳住现金流与身边那点关系？'
        : debt
          ? '负债还在。有人给你一个「翻本」机会，风险也高——这一步，可能改写你整局的阶层落点。'
          : '窗口出现了：创业、体制内/大厂稳岗，或继续打磨能力等更大机会。你真正想要的生活，是哪一种？',
      choices: [
        {
          id: 'startup',
          label: debt ? '借势翻本创业' : '押上创业',
          hint: fmtDelta({
            status: trait === 'gamble' ? 16 : 11,
            money: debt ? -10 : -12,
            energy: -14,
            intimacy: -4,
          }),
          delta: {
            status: trait === 'gamble' ? 16 : 11,
            money: debt ? -10 : -12,
            energy: -14,
            intimacy: -4,
          },
          tag: 'business',
        },
        {
          id: 'stable',
          label: '选稳定轨道',
          hint: fmtDelta({
            money: trait === 'steady' ? 10 : 7,
            energy: 6,
            status: credential ? 5 : 2,
          }),
          delta: {
            money: trait === 'steady' ? 10 : 7,
            energy: 6,
            status: credential ? 5 : 2,
          },
        },
        {
          id: 'compound',
          label: mentor || credential ? '跟贵人/证书继续复利' : '慢打磨，等下一窗口',
          hint: fmtDelta({
            status: mentor || credential ? 10 : 5,
            money: 3,
            energy: -4,
            intimacy: partner ? 3 : 0,
          }),
          delta: {
            status: mentor || credential ? 10 : 5,
            money: 3,
            energy: -4,
            intimacy: partner ? 3 : 0,
          },
        },
      ],
    },
  ];
}

export function classTier(s, tags) {
  const score = s.money * 0.3 + s.status * 0.35 + s.intimacy * 0.15 + s.energy * 0.2;
  const debtPenalty = tags.includes('debt') ? 8 : 0;
  const final = score - debtPenalty;
  if (final >= 72) {
    return {
      label: '上层通道打开',
      tone: 'success',
      detail: '资源与地位形成正循环，下一局容错会更高——感情也有余力经营。',
    };
  }
  if (final >= 55) {
    return {
      label: '中产边缘 / 上升中',
      tone: 'accent',
      detail: '还没锁死，也没飞起来；下一阶段看你是否还敢投入能力，以及敢不敢靠近人。',
    };
  }
  if (final >= 40) {
    return {
      label: '温饱拉扯层',
      tone: 'warning',
      detail: '能活，但跃迁窗口窄；负债或透支会把你拖回去，亲密关系也容易被挤掉。',
    };
  }
  return {
    label: '生存优先层',
    tone: 'danger',
    detail: '系统在逼你短视。先回血，再谈阶层与爱情。',
  };
}

export function endingLine(s, tags) {
  const top =
    s.money >= s.status && s.money >= s.intimacy && s.money >= s.energy
      ? '金钱'
      : s.status >= s.intimacy && s.status >= s.energy
        ? '地位'
        : s.intimacy >= s.energy
          ? '亲密'
          : '能量';
  const notes = [];
  if (tags.includes('debt')) notes.push('负债标签还在，短期解渴会卡住长期跃迁');
  if (tags.includes('mentor')) notes.push('你抓住了导师窗口');
  if (tags.includes('partner')) notes.push('你允许自己靠近了一个人');
  if (tags.includes('credential')) notes.push('你投下了能力复利');
  if (tags.includes('business')) notes.push('你押了创业');
  if (tags.includes('burned') && s.energy < 35) notes.push('透支后能量偏低，下一局先回血');
  if (notes.length === 0) notes.push('你主要靠自己扛：稳，但上升更慢');
  return `本局你实际在优化「${top}」。${notes.join('；')}。`;
}

export function buildShareText({ resource, city, edu, family, trait, startStats, stats, tags, log, tier }) {
  const r = RESOURCE_OPTS.find((o) => o.value === resource)?.label;
  const c = CITY_OPTS.find((o) => o.value === city)?.label;
  const e = EDU_OPTS.find((o) => o.value === edu)?.label;
  const f = FAMILY_OPTS.find((o) => o.value === family)?.label;
  const t = TRAIT_OPTS.find((o) => o.value === trait)?.label;
  const tagStr =
    tags.length > 0 ? tags.map((x) => TAG_LABELS[x] || x).join('、') : '无特殊标签';
  const lines = [
    '【第二人生剧本】换个出身，重写一局人生',
    `开局：${r} · ${c} · ${e} · 家庭${f} · ${t}`,
    `阶层落点：${tier.label}`,
    `金钱 ${startStats.money}→${stats.money}｜地位 ${startStats.status}→${stats.status}｜亲密 ${startStats.intimacy}→${stats.intimacy}｜能量 ${startStats.energy}→${stats.energy}`,
    `标签：${tagStr}`,
    `轨迹：${log.join(' → ')}`,
    endingLine(stats, tags),
  ];
  return lines.join('\n');
}
