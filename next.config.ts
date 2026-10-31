import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // O pdfjs (usado pelo pdf-parse na extração de materiais) carrega o próprio
  // worker em tempo de execução; empacotado pelo Next, o arquivo não é achado.
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist']
}

export default nextConfig
