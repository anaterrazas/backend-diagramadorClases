// src/modules/codegen/zip.service.ts
// Empaquetado ZIP en memoria con `archiver`.
//
// Decisión: no se escriben archivos temporales en disco. Los archivos del
// proyecto se proporcionan como strings en memoria y se añaden directo al
// stream de archiver, por lo que no queda basura temporal que limpiar
// (fs-extra no es necesario para construir el ZIP).

import archiver from 'archiver'

/** Crea una zona de archivos (nombre de entrada → contenido) como Buffer ZIP. */
export function createZipFromFiles(files: Record<string, string>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } })
    const chunks: Buffer[] = []

    archive.on('data', (chunk: Buffer) => chunks.push(chunk))
    archive.on('end', () => resolve(Buffer.concat(chunks)))
    archive.on('error', reject)

    for (const [name, content] of Object.entries(files)) {
      archive.append(Buffer.from(content, 'utf8'), { name })
    }

    archive.finalize().catch(reject)
  })
}