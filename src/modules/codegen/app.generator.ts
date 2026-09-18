// src/modules/codegen/app.generator.ts
// Genera la clase principal @SpringBootApplication.

export function appGenerator(basePackage: string, applicationClassName: string): string {
  return `package ${basePackage};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${applicationClassName} {

	public static void main(String[] args) {
		SpringApplication.run(${applicationClassName}.class, args);
	}
}
`
}