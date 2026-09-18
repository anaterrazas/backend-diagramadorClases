"use strict";
// src/modules/codegen/app.generator.ts
// Genera la clase principal @SpringBootApplication.
Object.defineProperty(exports, "__esModule", { value: true });
exports.appGenerator = appGenerator;
function appGenerator(basePackage, applicationClassName) {
    return `package ${basePackage};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${applicationClassName} {

	public static void main(String[] args) {
		SpringApplication.run(${applicationClassName}.class, args);
	}
}
`;
}
