# Web 原型 section 布局（中文伴读翻译）

> **文件性质**：本文是 `layouts.md`（OpenDesign 上游，锁定 commit 0701042）的中文翻译，**仅供人阅读，非执行件**；上游同步时需对照新版重新核对。HTML 代码块保留英文原样。

**8 个可直接粘贴的 section 骨架。** 放进 `assets/template.html` 的 `<main id="content">`。不要从零写 section——挑最接近的布局、粘贴、换文案。

## 预检（粘贴任何东西之前做一次）

1. **通读 `assets/template.html`** 直到 `<style>` 块结束。下面用到的每个 class 都必须在那里存在。缺了哪个，就补进 `<style>`，不要在每个 section 上内联。
2. **写文案之前先定 section 清单。** 默认节奏：
   - **Landing**：1 hero → 2 features → 3 stat-row 或 quote → 4 split → 6 cta-strip → footer
   - **Marketing / 编辑型**：1 hero-center → 7 log-list → 4 split → 6 cta-strip
   - **Pricing / docs**：1 hero-center → 表格驱动 → 6 cta-strip
3. **每屏一种强调色，最多用两次。** hero eyebrow 和主按钮已经用掉了；第三次使用要精打细算。

## 类清单（必须存在于 `template.html`）

> `section` `container` `hero` `hero-center` `hero-split` `hero-cta` `eyebrow` `lead` `h1` `h2` `h3` `meta` `num` `btn` `btn-primary` `btn-secondary` `btn-ghost` `btn-arrow` `card` `card-flat` `card-rule` `feature` `feature-mark` `stat` `stat-num` `stat-label` `stat-unit` `quote` `quote-mark` `quote-author` `pill` `tag` `field` `input` `textarea` `ds-table` `num-col` `ph-img` `content-img` `square` `portrait` `wide` `rule` `rule-strong` `grid-2` `grid-3` `grid-4` `grid-2-1` `grid-1-2` `row` `row-between` `stack` `log-row` `pull` `topnav` `pagefoot`

要用清单之外的 class，先在 `<style>` 里定义，或用 `style="…"` 内联。绝不在 `<section>` 上发明一个没有 CSS 支撑的全局 class。

---

## 布局 1 —— Hero，居中

页面以一句论点开场时用（大多数 landing、大多数营销页）。一个 eyebrow、一个 h1（≤14 词）、一句导语、两个 CTA。

```html
<section class="section hero" data-od-id="hero">
  <div class="container hero-center">
    <p class="eyebrow">EYEBROW · CONTEXT</p>
    <h1>One sharp sentence about what this is.</h1>
    <p class="lead">One concrete-value subhead — what changes for the reader.</p>
    <div class="hero-cta">
      <button class="btn btn-primary">Primary action</button>
      <button class="btn btn-secondary">Secondary</button>
    </div>
  </div>
</section>
```

## 布局 2 —— Hero，分栏（文字 + 视觉）

有真实产品视觉（产品 UI、截图、照片）时用。左半文案，右半一个 `ph-img` 脚手架。Step 3 期间，把整个脚手架替换为以 data URI 内嵌的获取图像，用 `<img class="content-img" width="[intrinsic width]" height="[intrinsic height]">`。不要把脚手架的 `wide` class 或 16:9 比例挪到真实图像上。只有当获取或内嵌确实失败时，才把脚手架作为带标签的兜底保留。

```html
<section class="section" data-od-id="hero-split">
  <div class="container hero-split">
    <div>
      <p class="eyebrow">EYEBROW · ROLE</p>
      <h1>Headline that names the change.</h1>
      <p class="lead" style="margin-top: 20px;">A short subhead — concrete, not corporate. Two sentences max.</p>
      <div class="hero-cta" style="margin-top: 28px;">
        <button class="btn btn-primary">Primary action</button>
        <button class="btn btn-ghost btn-arrow">Read the story</button>
      </div>
    </div>
    <div class="ph-img wide" aria-label="Hero visual placeholder">[ Hero visual · 16:9 ]</div>
  </div>
</section>
```

## 布局 3 —— Feature 三联

三个功能格。以一个小 `<h2>` 给整行定调。不要每个标题都挂图标——每格一个得体的标记，单色线性。

```html
<section class="section" data-od-id="features">
  <div class="container stack" style="gap: 56px;">
    <div style="max-width: 36ch;">
      <p class="eyebrow">WHAT'S DIFFERENT</p>
      <h2>Three things you'll notice in the first ten minutes.</h2>
    </div>
    <div class="grid-3">
      <div class="feature card-flat">
        <div class="feature-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3v18M3 12h18"/></svg>
        </div>
        <h3>Specific feature one</h3>
        <p>Two-sentence description that names the user value, not the technology.</p>
      </div>
      <div class="feature card-flat">
        <div class="feature-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>
        </div>
        <h3>Specific feature two</h3>
        <p>Two-sentence description that names the user value, not the technology.</p>
      </div>
      <div class="feature card-flat">
        <div class="feature-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M4 12h10M4 17h16"/></svg>
        </div>
        <h3>Specific feature three</h3>
        <p>Two-sentence description that names the user value, not the technology.</p>
      </div>
    </div>
  </div>
</section>
```

## 布局 4 —— Stat 行（数据看板）

有真实数字时用。最多三个统计——四个就像宣传册了。**不要编数据。** 没有数字就换别的布局。

```html
<section class="section" data-od-id="stats">
  <div class="container">
    <p class="eyebrow" style="margin-bottom: 40px;">BY THE NUMBERS · 2026</p>
    <div class="grid-3">
      <div class="stat">
        <div class="stat-num num">38<span class="stat-unit">×</span></div>
        <p class="stat-label">less data moved over the wire vs. naive sync, on real customer workloads.</p>
      </div>
      <div class="stat">
        <div class="stat-num num">3,184</div>
        <p class="stat-label">paying teams, including 14 of the YC W26 batch.</p>
      </div>
      <div class="stat">
        <div class="stat-num num">$0.04<span class="stat-unit">/GB</span></div>
        <p class="stat-label">average egress saved — typical $1,800/mo bill drops to $200.</p>
      </div>
    </div>
  </div>
</section>
```

## 布局 5 —— Pull quote（证言）

一条决定性的引言加署名。省着用——每页一条，绝不连续两条。

```html
<section class="section" data-od-id="quote">
  <div class="container" style="max-width: 800px;">
    <div class="quote-mark">"</div>
    <blockquote class="quote">Filebase pays for itself in the first month. We were going to hire a dedicated DevOps person to babysit our sync — instead we just switched.</blockquote>
    <p class="quote-author">— Mira Hassan, CTO at Northwind Studios</p>
  </div>
</section>
```

## 布局 6 —— CTA 条（收尾）

页面以一个决定性的请求收尾。居中、大量留白、一个主按钮。除非全页没有其他按钮，否则不加次按钮。

```html
<section class="section" data-od-id="cta-strip" style="text-align: center;">
  <div class="container" style="max-width: 600px;">
    <h2>Stop measuring meetings. Start measuring focus.</h2>
    <p class="lead" style="margin: 16px auto 32px;">Free for solo. $4/mo per teammate after that.</p>
    <button class="btn btn-primary">Start free</button>
  </div>
</section>
```

## 布局 7 —— Log 列表（changelog / 博客索引 / 文章列表）

带日期条目的编辑型列表布局。左侧等宽字体日期，中间标题 + 导语，右侧可选 pull 统计。只加上边框、绝不全包围——盒子感像宣传册。

```html
<section class="section" data-od-id="log">
  <div class="container">
    <div class="row-between" style="margin-bottom: 32px;">
      <h2>Recent changes</h2>
      <a class="btn btn-ghost btn-arrow" href="#">View all</a>
    </div>
    <div>
      <article class="log-row">
        <span class="meta">Apr 27, 2026</span>
        <div>
          <h3>Sync engine v3 — half the wire bytes</h3>
          <p style="margin: 4px 0 0; color: var(--muted); font-size: 14px;">A new content-defined chunker that produces 38× fewer post-edit changes on Final Cut projects.</p>
        </div>
        <span class="pull meta">Engineering</span>
      </article>
      <article class="log-row">
        <span class="meta">Apr 19, 2026</span>
        <div>
          <h3>Per-folder bandwidth budgets</h3>
          <p style="margin: 4px 0 0; color: var(--muted); font-size: 14px;">Cap how much a single project can pull each month — useful for archive folders.</p>
        </div>
        <span class="pull meta">Product</span>
      </article>
      <article class="log-row">
        <span class="meta">Apr 04, 2026</span>
        <div>
          <h3>S3 + R2 dual-region replication</h3>
          <p style="margin: 4px 0 0; color: var(--muted); font-size: 14px;">Two providers, automatic failover. Enterprise tier only for now.</p>
        </div>
        <span class="pull meta">Infra</span>
      </article>
    </div>
  </div>
</section>
```

## 布局 8 —— 对比表（定价、方案矩阵、前后对比）

发丝线边框、等宽数字、一列用强调色边框高亮。不要整行铺 surface 底色——那会大喊"我是一张表格"。

```html
<section class="section" data-od-id="pricing">
  <div class="container">
    <div style="text-align: center; max-width: 36ch; margin: 0 auto 56px;">
      <p class="eyebrow">PRICING</p>
      <h2>One row of features. Three lines of pricing.</h2>
    </div>
    <table class="ds-table">
      <thead>
        <tr>
          <th>Feature</th>
          <th class="num-col">Solo</th>
          <th class="num-col">Team</th>
          <th class="num-col">Enterprise</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Sync engine v3</td><td class="num-col">✓</td><td class="num-col">✓</td><td class="num-col">✓</td></tr>
        <tr><td>Per-folder budgets</td><td class="num-col">—</td><td class="num-col">✓</td><td class="num-col">✓</td></tr>
        <tr><td>SAML / SCIM</td><td class="num-col">—</td><td class="num-col">—</td><td class="num-col">✓</td></tr>
        <tr><td>Dedicated infra</td><td class="num-col">—</td><td class="num-col">—</td><td class="num-col">✓</td></tr>
        <tr style="border-top: 1px solid var(--fg);">
          <td><strong>Monthly</strong></td>
          <td class="num-col"><strong>$0</strong></td>
          <td class="num-col"><strong>$4 / seat</strong></td>
          <td class="num-col"><strong>Talk to us</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
</section>
```

---

## Section 节奏 —— 拿不准时

五段式 landing：

1. Hero（布局 1 或 2）
2. Features（布局 3）
3. Stats *或* quote（布局 4 或 5）
4. Split 细节（自定义，用 `grid-2-1` / `grid-1-2`）
5. CTA + footer（布局 6）

四段式 docs / marketing 索引：

1. Hero 居中（布局 1）
2. Log 列表（布局 7）
3. CTA + footer（布局 6）

连续两个 stat 行、连续两个 quote 块、连续两个 feature 三联——都是视觉疲劳。要交替。
