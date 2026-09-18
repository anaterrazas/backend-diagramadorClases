"use strict";
// src/modules/codegen/dto.generator.ts
// Genera el DTO (POJO sin anotaciones) por entidad.
Object.defineProperty(exports, "__esModule", { value: true });
exports.dtoGenerator = dtoGenerator;
const java_name_utils_1 = require("./java-name.utils");
const JAVA_LANG_TYPES = new Set(['String', 'Long', 'Integer', 'Float', 'Double', 'Boolean', 'Byte', 'Short']);
const TYPE_IMPORTS = {
    BigDecimal: 'java.math.BigDecimal',
    LocalDate: 'java.time.LocalDate',
    LocalDateTime: 'java.time.LocalDateTime',
    LocalTime: 'java.time.LocalTime',
    UUID: 'java.util.UUID',
};
function dtoImports(cls) {
    const imports = new Set();
    for (const f of cls.fields) {
        if (!JAVA_LANG_TYPES.has(f.javaType) && TYPE_IMPORTS[f.javaType])
            imports.add(TYPE_IMPORTS[f.javaType]);
    }
    return [...imports].sort();
}
function dtoGenerator(cls, basePackage) {
    const lines = [];
    lines.push(`package ${basePackage}.dto;`);
    lines.push('');
    const imports = dtoImports(cls);
    for (const i of imports)
        lines.push(`import ${i};`);
    if (imports.length)
        lines.push('');
    lines.push(`public class ${cls.className}Dto {`);
    for (const f of cls.fields) {
        lines.push('');
        lines.push(`  private ${f.javaType} ${f.name};`);
    }
    for (const f of cls.fields) {
        const cap = (0, java_name_utils_1.capitalize)(f.name);
        lines.push('');
        lines.push(`  public ${f.javaType} get${cap}() {`);
        lines.push(`    return this.${f.name};`);
        lines.push('  }');
        lines.push('');
        lines.push(`  public void set${cap}(${f.javaType} ${f.name}) {`);
        lines.push(`    this.${f.name} = ${f.name};`);
        lines.push('  }');
    }
    lines.push('}');
    return lines.join('\n') + '\n';
}
