// src/modules/codegen/tests/codegen.test.ts
// Pruebas Fase 1 — CodeGen local Spring Boot.
//
// Ejecutar: npm run test:codegen
// (ts-node; no requiere servidor ni base de datos.)

import assert from 'assert'
import type { Server } from 'http'
import type { AddressInfo } from 'net'
import express from 'express'
import codegenRoutes from '../codegen.routes'
import { errorHandler } from '../../../middlewares/error-handler'
import { validateGenerateRequest, generateSpringBootProject } from '../codegen.service'
import { createZipFromFiles } from '../zip.service'
import { listZipEntries, readZipText } from './zip.utils'
import type { DiagramV2 } from '../types'

let pass = 0
let fail = 0

async function run(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn()
    pass++
    console.log(`  ✓ ${name}`)
  } catch (e) {
    fail++
    console.error(`  ✗ ${name}:`, e instanceof Error ? e.message : e)
    console.error(e)
  }
}

function hasEntry(zip: Buffer, suffix: string): boolean {
  return listZipEntries(zip).some((e) => e.path.endsWith(`/${suffix}`) || e.path === suffix)
}

function entryPaths(zip: Buffer): string[] {
  return listZipEntries(zip).map((e) => e.path)
}

function entry(zip: Buffer, suffix: string): string {
  const path = entryPaths(zip).find((p) => p.endsWith(`/${suffix}`) || p === suffix)
  if (!path) throw new Error(`No existe "${suffix}" en el ZIP`)
  return readZipText(zip, path)
}

function build(payload: unknown) {
  const validated = validateGenerateRequest(payload)
  return generateSpringBootProject(validated)
}

/* ---------------- Datos de prueba ---------------- */

const personaDiagram: DiagramV2 = {
  classes: {
    c1: {
      id: 'c1',
      x: 100,
      y: 100,
      w: 200,
      h: 150,
      name: 'Persona',
      attributes: [
        { vis: '+', name: 'id', type: 'bigint' },
        { vis: '+', name: 'nombre', type: 'string' },
        { vis: '+', name: 'edad', type: 'int' },
      ],
      methods: [],
    },
  },
  links: {},
}

const dosClasesDiagram: DiagramV2 = {
  classes: {
    p: { id: 'p', name: 'Persona', attributes: [{ vis: '+', name: 'id', type: 'bigint' }], methods: [] },
    m: { id: 'm', name: 'Mascota', attributes: [{ vis: '+', name: 'id', type: 'bigint' }, { vis: '-', name: 'nombre', type: 'string' }], methods: [] },
  },
  links: {},
}

const tipoDesconocidoDiagram: DiagramV2 = {
  classes: {
    c: { id: 'c', name: 'Artefacto', attributes: [{ vis: '+', name: 'codigo', type: 'cosa rara' }], methods: [] },
  },
  links: {},
}

const nombresInvalidosDiagram: DiagramV2 = {
  classes: {
    a: {
      id: 'a',
      name: 'persona datos',
      attributes: [
        { vis: '-', name: 'nombre-completo', type: 'string' },
        { vis: '-', name: 'class', type: 'string' },
      ],
      methods: [],
    },
    b: { id: 'b', name: '123Persona', attributes: [], methods: [] },
    c: { id: 'c', name: 'class', attributes: [], methods: [] },
  },
  links: {},
}

const linksDiagram: DiagramV2 = {
  classes: {
    a: { id: 'a', name: 'A', attributes: [{ vis: '+', name: 'id', type: 'bigint' }], methods: [] },
    b: { id: 'b', name: 'B', attributes: [], methods: [] },
    c: { id: 'c', name: 'C', attributes: [], methods: [] },
  },
  links: {
    l1: { id: 'l1', kind: 'Associate', sourceId: 'a', targetId: 'b', labels: { src: '1', tgt: '*' } },
    l2: { id: 'l2', kind: 'Aggregate', sourceId: 'a', targetId: 'c', labels: { src: '1', tgt: '0..*' } },
    l3: { id: 'l3', kind: 'Compose', sourceId: 'a', targetId: 'b' },
    l4: { id: 'l4', kind: 'Generalize', sourceId: 'b', targetId: 'a' },
    l5: { id: 'l5', kind: 'Dependency', sourceId: 'c', targetId: 'a' },
    l6: { id: 'l6', kind: 'AssociateClass', sourceId: 'a', targetId: 'b', assocClassId: 'c' },
  },
}

/* ---------------- Servidor de prueba (solo rutas codegen) ---------------- */

async function startCodegenServer(): Promise<{ port: number; close: () => Promise<void> }> {
  const app = express()
  app.use(express.json())
  app.use('/api/codegen', codegenRoutes)
  app.use(errorHandler)
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s))
  })
  const addr = server.address() as AddressInfo
  return {
    port: addr.port,
    close: () =>
      new Promise((res) => {
        server.close(() => res())
      }),
  }
}

/* ---------------- Tests ---------------- */

async function main(): Promise<void> {
  console.log('\n=== FASE 1 — CodeGen local Spring Boot ===\n')

  await run('Test 1 — proyecto simple genera ZIP con estructura completa', async () => {
    const { files, project } = build({ projectName: 'demo-sources', includeDto: true, diagram: personaDiagram })
    assert.strictEqual(project.classes.length, 1)
    assert.strictEqual(project.basePackage, 'com.example.demosources')
    assert.strictEqual(project.applicationClassName, 'DemoSourcesApplication')

    const zip = await createZipFromFiles(files)
    assert.ok(zip.length > 0, 'el ZIP no está vacío')
    assert.strictEqual(zip.readUInt32LE(0), 0x04034b50, 'el ZIP empieza con un local header PK')

    for (const suffix of [
      'pom.xml',
      'DemoSourcesApplication.java',
      'Persona.java',
      'PersonaRepository.java',
      'PersonaService.java',
      'PersonaController.java',
      'PersonaDto.java',
      'application.properties',
    ]) {
      assert.ok(hasEntry(zip, suffix), `falta ${suffix} en el ZIP`)
    }

    const entity = entry(zip, 'Persona.java')
    assert.ok(entity.includes('public class Persona'), 'entity tiene la clase Persona')
    assert.ok(entity.includes('@Table(') && entity.includes('name = "persona"'), 'entity tiene @Table(name=persona)')
    assert.ok(entity.includes('private Long id;'), 'id mapeado a Long')
    assert.ok(entity.includes('private String nombre;'), 'nombre mapeado a String')
    assert.ok(entity.includes('private Integer edad;'), 'edad mapeado a Integer')
    assert.ok(entity.includes('public Long getId()'), 'existe getId')

    const repo = entry(zip, 'PersonaRepository.java')
    assert.ok(repo.includes('extends JpaRepository<Persona, Long>'), 'repository extiende JpaRepository<Persona, Long>')

    const service = entry(zip, 'PersonaService.java')
    assert.ok(service.includes('public class PersonaService'), 'existe PersonaService')
    for (const m of ['create', 'findAll', 'findById', 'update', 'delete']) {
      assert.ok(service.includes(`public ${m === 'create' ? 'PersonaDto ' : m === 'findAll' ? 'List<PersonaDto> ' : m === 'findById' ? 'PersonaDto ' : m === 'update' ? 'PersonaDto ' : 'void '}${m}(`), `Service expone ${m}`)
    }

    const controller = entry(zip, 'PersonaController.java')
    assert.ok(controller.includes('@RestController'), 'controller es @RestController')
    assert.ok(controller.includes('@RequestMapping("/api/persona")'), 'controller mapeado a /api/persona')

    const dto = entry(zip, 'PersonaDto.java')
    assert.ok(dto.includes('public class PersonaDto'), 'dto PersonaDto generado')
    assert.ok(dto.includes('private String nombre;'), 'dto incluye nombre')

    const pom = entry(zip, 'pom.xml')
    assert.ok(pom.includes('<java.version>17</java.version>'), 'pom usa Java 17')
    assert.ok(pom.includes('spring-boot-starter-parent'), 'pom usa spring-boot-starter-parent')
    assert.ok(pom.includes('spring-boot-starter-web'), 'pom incluye Spring Web')
    assert.ok(pom.includes('spring-boot-starter-data-jpa'), 'pom incluye Spring Data JPA')
    assert.ok(pom.includes('postgresql'), 'pom incluye PostgreSQL')
    assert.ok(pom.includes('spring-boot-starter-validation'), 'pom incluye validation')

    const props = entry(zip, 'application.properties')
    assert.ok(props.includes('spring.datasource.url=jdbc:postgresql://localhost:5432/'), 'properties con URL postgres')
  })

  await run('Test 2 — includeDto=false: NO genera DTO y el resto compila', async () => {
    const { files } = build({ projectName: 'demo-sources', includeDto: false, diagram: personaDiagram })
    const zip = await createZipFromFiles(files)
    assert.ok(!hasEntry(zip, 'PersonaDto.java'), 'no debe existir PersonaDto.java')
    assert.ok(hasEntry(zip, 'Persona.java') && hasEntry(zip, 'PersonaService.java'), 'entity/service sí existen')
    const service = entry(zip, 'PersonaService.java')
    assert.ok(service.includes('import com.example.demosources.entity.Persona;'), 'service sin DTO usa la entity')
    assert.ok(!service.includes('PersonaDto'), 'service sin DTO no menciona DTO')
    const controller = entry(zip, 'PersonaController.java')
    assert.ok(!controller.includes('PersonaDto'), 'controller sin DTO no menciona DTO')
  })

  await run('Test 3 — múltiples clases generan Entity/Repository/Service/Controller por cada una', async () => {
    const { files } = build({ projectName: 'demo-sources', includeDto: true, diagram: dosClasesDiagram })
    const zip = await createZipFromFiles(files)
    for (const cn of ['Persona', 'Mascota']) {
      for (const suffix of [`${cn}.java`, `${cn}Repository.java`, `${cn}Service.java`, `${cn}Controller.java`, `${cn}Dto.java`]) {
        assert.ok(hasEntry(zip, suffix), `falta ${suffix}`)
      }
    }
    const mascota = entry(zip, 'Mascota.java')
    assert.ok(mascota.includes('public class Mascota'), 'entity Mascota')
    assert.ok(mascota.includes('private String nombre;'), 'Mascota tiene campo nombre')
  })

  await run('Test 4 — tipo UML desconocido NO genera Java inválido (→ String)', async () => {
    const { files } = build({ projectName: 'demo-sources', includeDto: true, diagram: tipoDesconocidoDiagram })
    const zip = await createZipFromFiles(files)
    const entity = entry(zip, 'Artefacto.java')
    assert.ok(entity.includes('private String codigo;'), 'tipo desconocido mapeado a String')
  })

  await run('Test 5 — nombres inválidos se sanean a identificadores Java válidos', async () => {
    const { files } = build({ projectName: 'demo-sources', includeDto: true, diagram: nombresInvalidosDiagram })
    const zip = await createZipFromFiles(files)

    const pd = entry(zip, 'PersonaDatos.java')
    assert.ok(pd.includes('public class PersonaDatos'), '"persona datos" → PersonaDatos')
    assert.ok(pd.includes('private String nombreCompleto;'), '"nombre-completo" → nombreCompleto')
    assert.ok(pd.includes('private String class_;'), '"class" (atributo) → class_')

    const p123 = entry(zip, 'Persona123.java')
    assert.ok(p123.includes('public class Persona123'), '"123Persona" → Persona123')

    const klass = entry(zip, 'Class.java')
    assert.ok(klass.includes('public class Class'), '"class" → Class (PascalCase válido)')
  })

  await run('Test 6 — links de todo tipo NO rompen la generación (Generalize sí se traduce)', async () => {
    const { files, project } = build({ projectName: 'demo-sources', includeDto: false, diagram: linksDiagram })
    assert.strictEqual(project.classes.length, 3)
    const zip = await createZipFromFiles(files)

    const a = entry(zip, 'A.java')
    assert.ok(a.includes('public class A'), 'entity A')
    assert.ok(a.includes('@Inheritance('), 'A es padre y lleva @Inheritance')
    const b = entry(zip, 'B.java')
    assert.ok(b.includes('public class B extends A'), 'B extiende A (Generalize)')
  })

  await run('Test 7 — HTTP /api/codegen/spring-boot devuelve ZIP y valida entradas', async () => {
    const srv = await startCodegenServer()
    try {
      const url = `http://127.0.0.1:${srv.port}/api/codegen/spring-boot`

      const ok = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: 'demo-sources', includeDto: true, diagram: personaDiagram }),
      })
      assert.strictEqual(ok.status, 200, 'HTTP 200')
      assert.strictEqual(ok.headers.get('content-type'), 'application/zip', 'Content-Type: application/zip')
      const cd = ok.headers.get('content-disposition') || ''
      assert.ok(cd.includes('attachment;') && cd.includes('demo-sources.zip'), `Content-Disposition correcta (${cd})`)
      const buf = Buffer.from(await ok.arrayBuffer())
      assert.ok(buf.length > 0, 'body no vacío')
      assert.strictEqual(buf.readUInt32LE(0), 0x04034b50, 'body es ZIP')

      const bad = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      assert.strictEqual(bad.status, 400, 'sin diagram → HTTP 400')
      const err = (await bad.json()) as Record<string, unknown>
      assert.ok(typeof err.message === 'string' && err.message.length > 0, 'error JSON descriptivo')
    } finally {
      await srv.close()
    }
  })

  await run('Test 8 — diagrama vacío genera proyecto vacío (no falla)', async () => {
    const { files, project } = build({ projectName: 'demo-sources', includeDto: true, diagram: { classes: {}, links: {} } })
    assert.strictEqual(project.classes.length, 0)
    const zip = await createZipFromFiles(files)
    assert.ok(hasEntry(zip, 'pom.xml'), 'pom.xml presente aunque no haya clases')
    assert.strictEqual(listZipEntries(zip).filter((e) => e.path.includes('/entity/')).length, 0, 'sin entities')
  })

  console.log('\n=== RESULTADO ===')
  console.log(`PASS: ${pass}`)
  console.log(`FAIL: ${fail}`)
  if (fail > 0) {
    console.log('Exit code 1 (hay fallos)')
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error('❌', e)
  process.exitCode = 1
})