// Copia o worker do pdf.js para public/, de onde o leitor de PDF o carrega.
// Roda no npm install, no dev e no build, então acompanha a versão instalada
// do pdfjs-dist. O arquivo copiado não é versionado (.gitignore).
import { copyFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const origem = join(
  dirname(require.resolve('pdfjs-dist/package.json')),
  'build',
  'pdf.worker.min.mjs'
)
const destino = join('public', 'pdfjs', 'pdf.worker.min.mjs')

mkdirSync(dirname(destino), { recursive: true })
copyFileSync(origem, destino)
