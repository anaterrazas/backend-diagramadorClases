"use strict";
// src/modules/codegen/service.generator.ts
// Genera el Service (CRUD básico) por entidad. Soporta dos variantes:
// - includeDto = true  → el Service trabaja con DTOs (conversión toEntity/toDto).
// - includeDto = false → el Service trabaja directamente con la Entity.
//
// En esta fase no se generan relaciones JPA avanzadas.
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceGenerator = serviceGenerator;
const java_name_utils_1 = require("./java-name.utils");
function nonIdFields(cls) {
    return cls.fields.filter((f) => !f.isId);
}
function dtoService(cls, project) {
    const cn = cls.className;
    const all = cls.fields.map((f) => `    e.set${(0, java_name_utils_1.capitalize)(f.name)}(d.get${(0, java_name_utils_1.capitalize)(f.name)}());`).join('\n');
    const toDtoAll = cls.fields.map((f) => `    d.set${(0, java_name_utils_1.capitalize)(f.name)}(e.get${(0, java_name_utils_1.capitalize)(f.name)}());`).join('\n');
    const copyLines = nonIdFields(cls)
        .map((f) => `    e.set${(0, java_name_utils_1.capitalize)(f.name)}(d.get${(0, java_name_utils_1.capitalize)(f.name)}());`)
        .join('\n');
    return `package ${project.basePackage}.service;

import ${project.basePackage}.dto.${cn}Dto;
import ${project.basePackage}.entity.${cn};
import ${project.basePackage}.repository.${cn}Repository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ${cn}Service {

  private final ${cn}Repository repo;

  public ${cn}Service(${cn}Repository repo) {
    this.repo = repo;
  }

  private ${cn} toEntity(${cn}Dto d) {
    ${cn} e = new ${cn}();
${all}
    return e;
  }

  private ${cn}Dto toDto(${cn} e) {
    ${cn}Dto d = new ${cn}Dto();
${toDtoAll}
    return d;
  }

  private void copyFromDto(${cn}Dto d, ${cn} e) {
${copyLines}
  }

  public ${cn}Dto create(${cn}Dto d) {
    ${cn} e = toEntity(d);
    e.setId(null);
    ${cn} saved = repo.save(e);
    return toDto(saved);
  }

  public List<${cn}Dto> findAll() {
    return repo.findAll().stream().map(this::toDto).collect(Collectors.toList());
  }

  public ${cn}Dto findById(Long id) {
    return repo.findById(id).map(this::toDto).orElse(null);
  }

  public ${cn}Dto update(Long id, ${cn}Dto d) {
    ${cn} existing = repo.findById(id).orElseThrow(() -> new RuntimeException("${cn} id=" + id));
    copyFromDto(d, existing);
    existing.setId(id);
    return toDto(repo.save(existing));
  }

  public void delete(Long id) {
    repo.deleteById(id);
  }
}
`;
}
function entityService(cls, project) {
    const cn = cls.className;
    const updates = nonIdFields(cls)
        .map((f) => `    existing.set${(0, java_name_utils_1.capitalize)(f.name)}(entity.get${(0, java_name_utils_1.capitalize)(f.name)}());`)
        .join('\n');
    return `package ${project.basePackage}.service;

import ${project.basePackage}.entity.${cn};
import ${project.basePackage}.repository.${cn}Repository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ${cn}Service {

  private final ${cn}Repository repository;

  public ${cn}Service(${cn}Repository repository) {
    this.repository = repository;
  }

  public List<${cn}> findAll() {
    return repository.findAll();
  }

  public Optional<${cn}> findById(Long id) {
    return repository.findById(id);
  }

  public ${cn} create(${cn} entity) {
    entity.setId(null);
    return repository.save(entity);
  }

  public ${cn} update(Long id, ${cn} entity) {
    ${cn} existing = repository.findById(id).orElseThrow(() -> new RuntimeException("${cn} id=" + id));
    existing.setId(id);
${updates}
    return repository.save(existing);
  }

  public void delete(Long id) {
    repository.deleteById(id);
  }
}
`;
}
function serviceGenerator(cls, project) {
    return project.includeDto ? dtoService(cls, project) : entityService(cls, project);
}
