// src/modules/codegen/dto.generator.ts
// Genera el DTO (POJO sin anotaciones) por entidad.

import type { JavaClass } from './types'
import { capitalize } from './java-name.utils'

const JAVA_LANG_TYPES = new Set(['String', 'Long', 'Integer', 'Float', 'Double', 'Boolean', 'Byte', 'Short'])

const TYPE_IMPORTS: Record<string, string> = {
  BigDecimal: 'java.math.BigDecimal',
  LocalDate: 'java.time.LocalDate',
  LocalDateTime: 'java.time.LocalDateTime',
  LocalTime: 'java.time.LocalTime',
  UUID: 'java.util.UUID',
}

function dtoImports(cls: JavaClass): string[] {
  const imports = new Set<string>()
  for (const f of cls.fields) {
    if (!JAVA_LANG_TYPES.has(f.javaType) && TYPE_IMPORTS[f.javaType]) imports.add(TYPE_IMPORTS[f.javaType])
  }
  return [...imports].sort()
}

export function dtoGenerator(cls: JavaClass, basePackage: string): string {
  const lines: string[] = []
  lines.push(`package ${basePackage}.dto;`)
  lines.push('')
  const imports = dtoImports(cls)
  for (const i of imports) lines.push(`import ${i};`)
  if (imports.length) lines.push('')
  lines.push(`public class ${cls.className}Dto {`)
  for (const f of cls.fields) {
    lines.push('')
    lines.push(`  private ${f.javaType} ${f.name};`)
  }
  for (const f of cls.fields) {
    const cap = capitalize(f.name)
    lines.push('')
    lines.push(`  public ${f.javaType} get${cap}() {`)
    lines.push(`    return this.${f.name};`)
    lines.push('  }')
    lines.push('')
    lines.push(`  public void set${cap}(${f.javaType} ${f.name}) {`)
    lines.push(`    this.${f.name} = ${f.name};`)
    lines.push('  }')
  }
  lines.push('}')
  return lines.join('\n') + '\n'
}