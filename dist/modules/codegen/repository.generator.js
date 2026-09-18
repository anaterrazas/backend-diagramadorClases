"use strict";
// src/modules/codegen/repository.generator.ts
// Genera la interfaz Repository (Spring Data JPA) por entidad.
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositoryGenerator = repositoryGenerator;
function repositoryGenerator(cls, basePackage) {
    const idType = cls.fields.find((f) => f.isId)?.javaType ?? 'Long';
    return [
        `package ${basePackage}.repository;`,
        '',
        `import ${basePackage}.entity.${cls.className};`,
        'import org.springframework.data.jpa.repository.JpaRepository;',
        '',
        `public interface ${cls.className}Repository extends JpaRepository<${cls.className}, ${idType}> {`,
        '}',
        '',
    ].join('\n');
}
