// بافت اکلیل سایت (public/textures) را می‌سازد؛ خروجی در /out. اجرا داخل کانتینر:
// docker compose --profile dev run --rm -v "<مسیر خروجی>:/out" web-dev sh -c "cp /out/make.mjs /app/x.mjs && node /app/x.mjs"

import sharp from 'sharp'

// RNG قطعی تا هر بار همان بافت ساخته شود
function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) }

// زمینه تیره: سفید و شامپاینی می‌درخشد
const DARK = [[196, 164, 124], [228, 211, 189], [214, 160, 180], [255, 255, 255], [205, 180, 150]]
// زمینه روشن: سفید دیده نمی‌شود و رنگ کدر «گردوخاک» می‌شود؛ طلای اشباع و رزگلد با لبه تیز
const LIGHT = [[201, 156, 72], [222, 184, 112], [212, 132, 160], [178, 132, 74], [232, 196, 140]]

/** تایل بی‌درز: هر ذره با دنباله گاوسی، و لبه‌ها پیچیده (wrap) تا تکرار درز نداشته باشد */
function tile({ size, specks, glints, alphaMin, alphaMax, seed, palette, sharp: crisp = 1 }) {
  const PALETTE = palette
  const r = rng(seed)
  const acc = new Float32Array(size * size * 4) // premultiplied rgb + alpha
  function dot(cx, cy, rad, col, a) {
    const ext = Math.ceil(rad * 3)
    for (let dy = -ext; dy <= ext; dy++) for (let dx = -ext; dx <= ext; dx++) {
      const d2 = dx * dx + dy * dy
      const w = a * Math.exp(-d2 / (2 * rad * rad))
      if (w < 0.004) continue
      const x = ((Math.round(cx) + dx) % size + size) % size, y = ((Math.round(cy) + dy) % size + size) % size
      const i = (y * size + x) * 4
      const keep = 1 - w
      acc[i] = acc[i] * keep + col[0] * w; acc[i + 1] = acc[i + 1] * keep + col[1] * w; acc[i + 2] = acc[i + 2] * keep + col[2] * w
      acc[i + 3] = acc[i + 3] * keep + w
    }
  }
  for (let n = 0; n < specks; n++) {
    const col = PALETTE[Math.floor(r() * PALETTE.length)]
    const rad = (0.35 + r() ** 3 * 0.9) * crisp
    dot(r() * size, r() * size, rad, col, alphaMin + r() * (alphaMax - alphaMin))
  }
  // درخشش‌های چهارپر (مثل نور روی اکلیل)
  for (let n = 0; n < glints; n++) {
    const cx = r() * size, cy = r() * size, len = 3 + r() * 5, a = 0.55 + r() * 0.35
    const col = palette === DARK && r() < 0.6 ? [255, 255, 255] : PALETTE[0]
    for (let t = -len; t <= len; t += 0.5) {
      const fall = a * (1 - Math.abs(t) / len) ** 1.6
      dot(cx + t, cy, 0.45, col, fall); dot(cx, cy + t, 0.45, col, fall)
    }
    dot(cx, cy, 0.9, palette === DARK ? [255, 255, 255] : PALETTE[4], a)
  }
  const out = Buffer.alloc(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    const a = Math.min(1, acc[i * 4 + 3])
    const div = acc[i * 4 + 3] || 1
    out[i * 4] = acc[i * 4] / div; out[i * 4 + 1] = acc[i * 4 + 1] / div; out[i * 4 + 2] = acc[i * 4 + 2] / div
    out[i * 4 + 3] = Math.round(a * 255)
  }
  return sharp(out, { raw: { width: size, height: size, channels: 4 } }).png({ compressionLevel: 9, palette: false })
}

await tile({ size: 320, specks: 260, glints: 2, alphaMin: 0.35, alphaMax: 0.75, seed: 7, palette: LIGHT, sharp: 0.75 }).toFile('/out/glitter-fine.png')
await tile({ size: 320, specks: 750, glints: 8, alphaMin: 0.45, alphaMax: 0.95, seed: 11, palette: LIGHT, sharp: 0.75 }).toFile('/out/glitter-rich.png')
await tile({ size: 320, specks: 1300, glints: 12, alphaMin: 0.25, alphaMax: 0.8, seed: 13, palette: DARK }).toFile('/out/glitter-dark.png')

// پیش‌نمایش روی زمینه سفید چینی، صورتی ملایم و آلویی
const fine = await sharp('/out/glitter-fine.png').toBuffer(), rich = await sharp('/out/glitter-rich.png').toBuffer(), dark = await sharp('/out/glitter-dark.png').toBuffer()
const panel = (bg, t) => sharp({ create: { width: 640, height: 320, channels: 3, background: bg } }).composite([{ input: t, tile: true }]).png().toBuffer()
const p1 = await panel('#fbf8f7', fine), p2 = await panel('#fbf8f7', rich), p3 = await panel('#21151a', dark)
await sharp({ create: { width: 640, height: 980, channels: 3, background: '#000' } })
  .composite([{ input: p1, top: 0, left: 0 }, { input: p2, top: 330, left: 0 }, { input: p3, top: 660, left: 0 }])
  .png().toFile('/out/preview.png')
for (const f of ['glitter-fine.png', 'glitter-rich.png', 'glitter-dark.png']) { const m = await sharp('/out/' + f).metadata(); console.log(f, m.size) }
