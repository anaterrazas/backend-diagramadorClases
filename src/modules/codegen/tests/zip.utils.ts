// src/modules/codegen/tests/zip.utils.ts
// Utilidades de TEST para leer ZIPs en memoria sin dependencias externas.
// Parsea el End of Central Directory + entradas del Central Directory y
// descomprime el contenido (métodos 0 = stored, 8 = deflate) con zlib.

import { inflateRawSync } from 'zlib'

const EOCD_SIG = 0x06054b50
const CD_SIG = 0x02014b50
const LOCAL_SIG = 0x04034b50

export interface ZipEntryMeta {
  path: string
  method: number
  localOffset: number
  compressedSize: number
  uncompressedSize: number
}

function findEocd(buffer: Buffer): number {
  const len = buffer.length
  for (let i = len - 22; i >= Math.max(0, len - 22 - 65535); i--) {
    if (buffer.readUInt32LE(i) === EOCD_SIG) return i
  }
  throw new Error('ZIP inválido: no se encontró el End of Central Directory')
}

export function listZipEntries(buffer: Buffer): ZipEntryMeta[] {
  const eocd = findEocd(buffer)
  const count = buffer.readUInt16LE(eocd + 10)
  const cdOffset = buffer.readUInt32LE(eocd + 16)

  const entries: ZipEntryMeta[] = []
  let off = cdOffset
  for (let n = 0; n < count; n++) {
    if (buffer.readUInt32LE(off) !== CD_SIG) {
      throw new Error('ZIP inválido: firma incorrecta en una entrada del directorio')
    }
    const method = buffer.readUInt16LE(off + 10)
    const compressedSize = buffer.readUInt32LE(off + 20)
    const uncompressedSize = buffer.readUInt32LE(off + 24)
    const nameLen = buffer.readUInt16LE(off + 28)
    const extraLen = buffer.readUInt16LE(off + 30)
    const commentLen = buffer.readUInt16LE(off + 32)
    const localOffset = buffer.readUInt32LE(off + 42)
    const path = buffer.subarray(off + 46, off + 46 + nameLen).toString('utf8')
    entries.push({ path, method, localOffset, compressedSize, uncompressedSize })
    off += 46 + nameLen + extraLen + commentLen
  }
  return entries
}

export function readZipEntry(buffer: Buffer, meta: ZipEntryMeta): Buffer {
  if (buffer.readUInt32LE(meta.localOffset) !== LOCAL_SIG) {
    throw new Error('ZIP inválido: no se encontró el local header')
  }
  const nameLen = buffer.readUInt16LE(meta.localOffset + 26)
  const extraLen = buffer.readUInt16LE(meta.localOffset + 28)
  const dataStart = meta.localOffset + 30 + nameLen + extraLen
  const compressed = buffer.subarray(dataStart, dataStart + meta.compressedSize)

  let out: Buffer
  if (meta.method === 0) {
    out = compressed
  } else if (meta.method === 8) {
    out = inflateRawSync(compressed)
  } else {
    throw new Error(`Método de compresión no soportado en "${meta.path}": ${meta.method}`)
  }

  if (out.length !== meta.uncompressedSize) {
    throw new Error(`Tamaño descomprimido inesperado en "${meta.path}"`)
  }
  return out
}

export function readZipText(buffer: Buffer, path: string): string {
  const meta = listZipEntries(buffer).find((e) => e.path === path)
  if (!meta) throw new Error(`No existe "${path}" en el ZIP`)
  return readZipEntry(buffer, meta).toString('utf8')
}