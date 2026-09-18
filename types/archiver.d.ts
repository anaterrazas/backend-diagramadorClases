// types/archiver.d.ts
// Declaración mínima del paquete `archiver` (no trae tipos y @types/archiver
// no está instalado). Cubre únicamente la API usada por el módulo codegen.
declare module 'archiver' {
  import type { Transform } from 'stream'

  interface ArchiverOptions {
    zlib?: { level?: number }
  }

  interface AppendOptions {
    name: string
  }

  interface ArchiverStream extends Transform {
    append(source: Buffer | string, options: AppendOptions): this
    finalize(): Promise<void>
  }

  interface ArchiverFactory {
    (format: string, options?: ArchiverOptions): ArchiverStream
  }

  const archiver: ArchiverFactory
  export = archiver
}