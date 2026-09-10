// Gera ícones PNG do PWA a partir de public/logo.png.
// - Se o Sharp estiver instalado, redimensiona de verdade (recomendado).
// - Senão, cai num placeholder de cor sólida só pra o build não quebrar.
// Rode com: node scripts/gen-icons.mjs
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const OUT = new URL('../public/icons/', import.meta.url)
mkdirSync(OUT, { recursive: true })

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}
function solidPng(size, [r, g, b]) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 2 // RGB
  const row = Buffer.alloc(1 + size * 3)
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = r
    row[1 + x * 3 + 1] = g
    row[1 + x * 3 + 2] = b
  }
  const raw = Buffer.concat(Array.from({ length: size }, () => row))
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

let sharp = null
try {
  sharp = (await import('sharp')).default
} catch {
  /* sem sharp */
}

const logoPath = new URL('../public/logo.png', import.meta.url)
const temLogo = existsSync(logoPath)

for (const s of SIZES) {
  const dest = new URL(`icon-${s}.png`, OUT)
  if (sharp && temLogo) {
    await sharp(readFileSync(logoPath))
      .resize(s, s, { fit: 'contain', background: { r: 15, g: 15, b: 15, alpha: 1 } })
      .png()
      .toFile(dest.pathname.replace(/^\//, ''))
  } else if (temLogo) {
    writeFileSync(dest, readFileSync(logoPath)) // fallback: copia sem redimensionar
  } else {
    writeFileSync(dest, solidPng(s, [15, 15, 15])) // placeholder preto
  }
}

console.log(`Ícones gerados em public/icons/ (${sharp ? 'sharp' : temLogo ? 'cópia da logo' : 'placeholder'})`)
