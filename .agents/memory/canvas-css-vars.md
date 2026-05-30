---
name: Canvas cannot use CSS custom properties
description: HTML5 canvas fillStyle/shadowColor/strokeStyle do not parse CSS var(); read the computed hex instead.
---

# Canvas 2D context cannot use CSS `var(...)`

Setting `ctx.fillStyle = 'var(--accent)'` (or `shadowColor`, `strokeStyle`) is a
silent no-op / invalid color — the canvas 2D API does not resolve CSS custom
properties. The draw either fails or falls back to the previous/black color with
no error.

**Why:** canvas color parsing is CSS `<color>` only; it has no access to the
cascade, so custom properties are meaningless to it.

**How to apply:** resolve the value first and pass a concrete color string:

```js
const accent = getComputedStyle(document.documentElement)
  .getPropertyValue('--accent').trim() || '#E63946';
ctx.shadowColor = accent;
```

Read it once per render/setup (getComputedStyle is not free). If the value can
change at runtime (e.g. light/dark theme toggle that swaps the var), re-read it
when you re-run the draw setup, since reading it once on mount will go stale.
