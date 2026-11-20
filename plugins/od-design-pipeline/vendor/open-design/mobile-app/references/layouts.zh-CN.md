# 移动端 App 屏幕原型（中文伴读翻译）

> **文件性质**：本文是 `layouts.md`（OpenDesign 上游，锁定 commit 0701042）的中文翻译，**仅供人阅读，非执行件**；HTML 代码块保留英文原样（那是粘贴用的源码），说明文字翻译。上游同步时需对照新版重新核对。

**6 个即贴即用的屏幕原型。** 放进 `assets/template.html` 的 `<main class="content">`。不要从零写屏幕——选最接近的原型，粘贴，换文案。

## 预检

1. **至少通读 `assets/template.html` 到 `<style>` 块**——下面每个类都在那里定义。灵动岛、状态栏、Home 指示条、标签栏已经画好；不要内联重画。
2. **只选一个原型。** 一块移动屏幕只干一件事。把"信息流 + 结账 + 个人页"混进一张 mock 是移动原型显得假的头号原因。
3. **原型隐含标签栏就保留；否则整块删除 `<nav class="tabbar">`。** Onboarding、详情、结账屏一般不显示标签栏。

## 类清单

> `pad` `stack` `row` `row-between` `grid-2` `grid-3` `header` `greeting` `h2` `h3` `meta` `num` `card` `card.accent` `card.flat` `list-row` `avatar` `tag` `pill` `tabbar` `tab` `tab.active` `btn-primary` `btn-secondary` `ph-img` `progress`

要用的类不在这张清单上，先在种子的 `<style>` 里定义它。

---

## 原型 A — Feed 信息流（首页 / 推荐 / 收件箱）

顶部：问候 + 标题。主体：4–6 个列表行，细线分隔。标签栏：有。

```html
<div class="header" data-od-id="header">
  <div>
    <p class="greeting">Tuesday · April 22</p>
    <h1>Inbox</h1>
  </div>
  <button class="icon-btn" aria-label="Compose">
    <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
  </button>
</div>

<section class="pad" data-od-id="filters" style="margin-bottom: 8px;">
  <div class="row" style="overflow-x: auto; padding-bottom: 4px;">
    <span class="pill">All · 14</span>
    <span class="tag">Mentions</span>
    <span class="tag">Following</span>
    <span class="tag">Shared</span>
  </div>
</section>

<section class="pad" data-od-id="feed">
  <div class="list-row">
    <div class="avatar"></div>
    <div class="body">
      <div class="title">Mira Hassan · Sync engine v3 review</div>
      <div class="sub">"Merged the chunker — egress is down 38% on Northwind."</div>
    </div>
    <span class="meta">2m</span>
  </div>
  <div class="list-row">
    <div class="avatar"></div>
    <div class="body">
      <div class="title">#engineering · 7 new replies</div>
      <div class="sub">Latency spike between 03:40 and 04:10 — probably the cron.</div>
    </div>
    <span class="meta">14m</span>
  </div>
  <div class="list-row">
    <div class="avatar"></div>
    <div class="body">
      <div class="title">Northwind Studios · Invoice paid</div>
      <div class="sub">$2,184 · April · auto-receipt sent to billing@</div>
    </div>
    <span class="meta">1h</span>
  </div>
  <div class="list-row">
    <div class="avatar"></div>
    <div class="body">
      <div class="title">Daniel Park · Re: Next Tuesday's review</div>
      <div class="sub">"I'll have the Q2 numbers by Monday EOD."</div>
    </div>
    <span class="meta">3h</span>
  </div>
</section>
```

## 原型 B — Detail 详情（单条目）

顶部 hero 图，眉题 + 标题 + 元信息，正文，主操作悬浮底部。标签栏：无。

```html
<div class="ph-img wide" style="border-radius: 0; aspect-ratio: 4/3;" data-od-id="hero">[ Hero image ]</div>

<section class="pad" style="padding-top: 18px;" data-od-id="meta">
  <span class="pill">Studio session</span>
  <h1 class="h2" style="margin: 10px 0 6px;">Filebase v3 — what we shipped, what we cut.</h1>
  <p class="meta">Mira Hassan · April 22 · 9 min read</p>
</section>

<section class="pad stack" style="margin-top: 18px; gap: 14px;" data-od-id="body">
  <p>The biggest unlock in v3 was the new content-defined chunker. On Final Cut projects, post-edit re-uploads dropped 38× — from full multi-GB pushes to the few hundred KB that actually changed.</p>
  <p>What we cut: per-folder compression. It looked great on benchmarks; on real footage it was slower than no compression at all because the chunker was already doing the dedup work.</p>
  <p>Next quarter: dual-region replication on R2 + S3, rolling out to Enterprise first.</p>
</section>

<section class="pad" style="padding-top: 24px; padding-bottom: 8px;" data-od-id="cta">
  <button class="btn-primary">Save to library</button>
</section>
```

## 原型 C — Onboarding 引导（N 步之 1）

插画块 + 标题 + 副标题 + 分页圆点 + 主 CTA。标签栏：无。状态栏仍可见。

```html
<section class="pad stack" style="height: 100%; padding-top: 24px; padding-bottom: 24px; gap: 24px;" data-od-id="onboarding">
  <div class="ph-img square" style="aspect-ratio: 1/1; max-width: 240px; margin: 0 auto;">[ Illustration ]</div>

  <div style="text-align: center;">
    <p class="meta" style="margin: 0 0 6px;">STEP 2 OF 4</p>
    <h1 style="font-family: var(--font-display); font-size: 26px; margin: 0 0 10px; letter-spacing: -0.02em; line-height: 1.15;">Sync only what changed.</h1>
    <p style="margin: 0 auto; max-width: 26ch; color: var(--muted); font-size: 14px; line-height: 1.5;">No more 4 GB re-uploads when you fix one frame. We diff at the byte level so the network stays quiet.</p>
  </div>

  <!-- pagination dots -->
  <div class="row" style="justify-content: center; gap: 6px;">
    <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--border);"></span>
    <span style="width: 18px; height: 6px; border-radius: 999px; background: var(--accent);"></span>
    <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--border);"></span>
    <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--border);"></span>
  </div>

  <div class="stack" style="gap: 10px; margin-top: auto;">
    <button class="btn-primary">Continue</button>
    <button class="btn-secondary" style="border: 0; color: var(--muted);">Skip</button>
  </div>
</section>
```

> 这个原型要从种子里删掉 `<nav class="tabbar">` 块。

## 原型 D — Profile 个人页（某人的页面）

头像 + 名字 + 元信息行；数据行；下方带标签的内容。标签栏：有（通常是外围 App 的标签）。

```html
<section class="pad" style="padding-top: 8px;" data-od-id="head">
  <div class="row" style="gap: 16px;">
    <div class="avatar" style="width: 64px; height: 64px;"></div>
    <div>
      <h1 class="h2" style="margin: 0;">Mira Hassan</h1>
      <p class="meta" style="margin: 4px 0 0;">CTO · Northwind Studios · Joined 2024</p>
    </div>
  </div>
  <div class="row" style="margin-top: 16px; gap: 8px;">
    <button class="btn-secondary" style="flex: 1; min-height: 38px; font-size: 13px;">Message</button>
    <button class="btn-secondary" style="flex: 1; min-height: 38px; font-size: 13px;">Follow</button>
  </div>
</section>

<section class="pad" data-od-id="stats" style="margin-top: 18px;">
  <div class="grid-3">
    <div class="card flat" style="text-align: center;">
      <div class="num" style="font-size: 22px; letter-spacing: -0.02em;">218</div>
      <div class="meta">Posts</div>
    </div>
    <div class="card flat" style="text-align: center;">
      <div class="num" style="font-size: 22px; letter-spacing: -0.02em;">3.1k</div>
      <div class="meta">Followers</div>
    </div>
    <div class="card flat" style="text-align: center;">
      <div class="num" style="font-size: 22px; letter-spacing: -0.02em;">142</div>
      <div class="meta">Following</div>
    </div>
  </div>
</section>

<section class="pad" data-od-id="tabs" style="margin-top: 12px;">
  <div class="row" style="border-bottom: 1px solid var(--border); gap: 24px;">
    <span style="padding: 12px 0; border-bottom: 2px solid var(--accent); color: var(--fg); font-weight: 500; font-size: 14px;">Posts</span>
    <span style="padding: 12px 0; color: var(--muted); font-size: 14px;">Replies</span>
    <span style="padding: 12px 0; color: var(--muted); font-size: 14px;">Likes</span>
  </div>
</section>

<section class="pad" data-od-id="post-list" style="margin-top: 4px;">
  <div class="list-row" style="grid-template-columns: 1fr;">
    <div class="body">
      <div class="title">"Bandwidth pricing went up 4× — sync engine choice is no longer cosmetic."</div>
      <div class="sub" style="margin-top: 6px;">2 days ago · 142 likes</div>
    </div>
  </div>
  <div class="list-row" style="grid-template-columns: 1fr;">
    <div class="body">
      <div class="title">"Shipped v3 today. The team carried this one."</div>
      <div class="sub" style="margin-top: 6px;">5 days ago · 88 likes</div>
    </div>
  </div>
</section>
```

## 原型 E — Checkout / 表单 结账

堆叠卡片区块（商品摘要 → 明细 → 合计），底部固定 CTA。标签栏：无。

```html
<section class="pad" style="padding-top: 12px;" data-od-id="title">
  <h1 class="h2">Confirm order</h1>
</section>

<section class="pad" data-od-id="item">
  <div class="card row" style="gap: 14px; align-items: flex-start;">
    <div class="ph-img square" style="width: 64px; height: 64px; aspect-ratio: 1; border-radius: 10px;"></div>
    <div style="flex: 1;">
      <div class="h3">Filebase Team · annual</div>
      <p class="meta" style="margin: 4px 0 0;">$4 / seat / month, billed yearly</p>
    </div>
    <span class="num">$1,920</span>
  </div>
</section>

<section class="pad stack" data-od-id="details" style="margin-top: 14px; gap: 10px;">
  <div class="card flat row-between">
    <span>Seats</span>
    <span class="num">40</span>
  </div>
  <div class="card flat row-between">
    <span>Billing email</span>
    <span class="meta">billing@northwind.studio</span>
  </div>
  <div class="card flat row-between">
    <span>Payment</span>
    <span class="meta">Visa · 4242</span>
  </div>
</section>

<section class="pad" data-od-id="totals" style="margin-top: 14px;">
  <div class="card row-between" style="border-top: 1px solid var(--fg); border-radius: 0; padding: 16px 0; background: transparent;">
    <span style="font-weight: 600;">Total today</span>
    <span class="num" style="font-size: 22px; letter-spacing: -0.01em;">$1,920</span>
  </div>
</section>

<section class="pad" style="padding-top: 16px; padding-bottom: 12px;" data-od-id="cta">
  <button class="btn-primary">Pay $1,920</button>
  <p class="meta" style="text-align: center; margin: 12px 0 0;">By tapping Pay you agree to the terms.</p>
</section>
```

## 原型 F — Focus 专注 / 主打卡片（计时器、地图、单一工具）

一张强调色 hero 卡占主导；下方少量辅助内容。标签栏：有。

```html
<div class="header" data-od-id="header">
  <div>
    <p class="greeting">Tuesday · April 22</p>
    <h1>Two pomodoros to lunch.</h1>
  </div>
  <button class="icon-btn" aria-label="Settings">
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="3" r="0.5"/><circle cx="12" cy="21" r="0.5"/><circle cx="3" cy="12" r="0.5"/><circle cx="21" cy="12" r="0.5"/></svg>
  </button>
</div>

<section class="pad" data-od-id="hero-card" style="margin-top: 4px;">
  <div class="card accent" style="padding: 28px 24px; text-align: center;">
    <p class="meta" style="margin: 0 0 6px; color: rgba(255,255,255,0.72);">FOCUS SESSION</p>
    <div class="num" style="font-size: 64px; line-height: 1; letter-spacing: -0.03em; font-weight: 600; margin: 8px 0 18px;">15:42</div>
    <div class="progress" style="margin-bottom: 18px;"><span style="width: 38%;"></span></div>
    <div class="row" style="justify-content: center; gap: 8px;">
      <button style="padding: 10px 22px; border: 1px solid rgba(255,255,255,0.4); background: rgba(255,255,255,0.12); color: #fff; border-radius: 999px; font: inherit; font-weight: 500;">Skip</button>
      <button style="padding: 10px 22px; border: 0; background: #fff; color: var(--accent); border-radius: 999px; font: inherit; font-weight: 600;">Pause</button>
    </div>
  </div>
</section>

<section class="pad" data-od-id="stats-row" style="margin-top: 18px;">
  <p class="meta" style="margin: 0 0 8px;">TODAY</p>
  <div class="grid-3">
    <div class="card"><div class="num" style="font-size: 22px;">3</div><div class="meta">Sessions</div></div>
    <div class="card"><div class="num" style="font-size: 22px;">75m</div><div class="meta">Focused</div></div>
    <div class="card"><div class="num" style="font-size: 22px;">2</div><div class="meta">Done</div></div>
  </div>
</section>

<section class="pad" data-od-id="up-next" style="margin-top: 18px;">
  <p class="meta" style="margin: 0 0 8px;">UP NEXT</p>
  <div>
    <div class="list-row" style="grid-template-columns: 22px 1fr auto;">
      <span style="width: 18px; height: 18px; border-radius: 50%; background: var(--accent);"></span>
      <div class="body">
        <div class="title" style="text-decoration: line-through; color: var(--muted);">Review Q2 OKRs</div>
        <div class="sub">25m · completed</div>
      </div>
    </div>
    <div class="list-row" style="grid-template-columns: 22px 1fr auto;">
      <span style="width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--border);"></span>
      <div class="body">
        <div class="title">Draft sync-engine post</div>
        <div class="sub">2 sessions estimated</div>
      </div>
    </div>
  </div>
</section>
```

---

## 按 brief 选原型

| brief 提到… | 用 |
|---|---|
| feed、inbox、timeline、list、messages（信息流/收件箱/时间线/列表/消息） | A — Feed |
| article、post、item、recipe、song、product（文章/帖子/条目/菜谱/歌曲/商品） | B — Detail |
| sign-up、welcome、intro、walkthrough（注册/欢迎/介绍/引导） | C — Onboarding |
| profile、account、user page、bio（个人页/账户/简介） | D — Profile |
| checkout、payment、order、form、settings step（结账/支付/下单/表单/设置步） | E — Checkout |
| timer、map、dashboard widget、single big number（计时/地图/小部件/单个大数字） | F — Focus |

两个都沾边时，选更匹配用户在这屏上**主要动作**的那个。
