"use strict";
// src/modules/codegen/controller.generator.ts
// Genera el REST Controller (CRUD) por entidad. Soporta dos variantes:
// - includeDto = true  → el Controller responde con DTOs.
// - includeDto = false → el Controller trabaja directamente con la Entity.
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllerGenerator = controllerGenerator;
function dtoController(cls, project) {
    const cn = cls.className;
    return `package ${project.basePackage}.controller;

import ${project.basePackage}.dto.${cn}Dto;
import ${project.basePackage}.service.${cn}Service;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/${cls.tableName}")
public class ${cn}Controller {

  private final ${cn}Service service;

  public ${cn}Controller(${cn}Service service) {
    this.service = service;
  }

  @PostMapping
  public ${cn}Dto create(@RequestBody ${cn}Dto d) {
    d.setId(null);
    return service.create(d);
  }

  @GetMapping
  public List<${cn}Dto> findAll() {
    return service.findAll();
  }

  @GetMapping("/{id}")
  public ${cn}Dto findOne(@PathVariable Long id) {
    return service.findById(id);
  }

  @PutMapping("/{id}")
  public ${cn}Dto update(@PathVariable Long id, @RequestBody ${cn}Dto d) {
    return service.update(id, d);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }
}
`;
}
function entityController(cls, project) {
    const cn = cls.className;
    return `package ${project.basePackage}.controller;

import ${project.basePackage}.entity.${cn};
import ${project.basePackage}.service.${cn}Service;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/${cls.tableName}")
public class ${cn}Controller {

  private final ${cn}Service service;

  public ${cn}Controller(${cn}Service service) {
    this.service = service;
  }

  @PostMapping
  public ${cn} create(@RequestBody ${cn} entity) {
    entity.setId(null);
    return service.create(entity);
  }

  @GetMapping
  public List<${cn}> findAll() {
    return service.findAll();
  }

  @GetMapping("/{id}")
  public ${cn} findOne(@PathVariable Long id) {
    return service.findById(id);
  }

  @PutMapping("/{id}")
  public ${cn} update(@PathVariable Long id, @RequestBody ${cn} entity) {
    return service.update(id, entity);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }
}
`;
}
function controllerGenerator(cls, project) {
    return project.includeDto ? dtoController(cls, project) : entityController(cls, project);
}
