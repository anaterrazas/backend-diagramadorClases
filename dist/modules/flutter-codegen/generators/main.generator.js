"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMainFile = generateMainFile;
exports.generateFlutterBaseFiles = generateFlutterBaseFiles;
const api_client_generator_1 = require("./api-client.generator");
const app_providers_generator_1 = require("./app-providers.generator");
function generateMainFile(project) {
    const pageImports = project.modules
        .map((module) => `import 'features/${module.folderName}/pages/${module.name}_list_page.dart';`)
        .join('');
    const routes = project.modules
        .map((module) => `\'/${module.name}\': (_) => const ${module.className}ListPage(),`)
        .join('\n');
    const drawerItems = project.modules
        .map((module) => `ListTile(
              leading: const Icon(Icons.list),
              title: const Text('${module.className}'),
              onTap: () => Navigator.of(context).pushNamed('/${module.name}'),
            ),`)
        .join('\n');
    const content = `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/app_providers.dart';
${pageImports}

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: AppProviders.all(),
      child: MaterialApp(
        title: 'Auto CRUD',
        theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue),
        routes: {
          '/': (_) => const HomeScreen(),
${routes}
        },
        initialRoute: '/',
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Auto CRUD')),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(child: Text('Módulos')),
${drawerItems}
          ],
        ),
      ),
      body: const Center(child: Text('Inicio')),
    );
  }
}
`;
    return {
        path: 'lib/main.dart',
        content,
        category: 'routing',
    };
}
function generateFlutterBaseFiles(project) {
    const files = [
        (0, api_client_generator_1.generateApiClientFile)(project),
        (0, app_providers_generator_1.generateAppProvidersFile)(project),
        generateMainFile(project),
    ];
    project.files = files;
    return files;
}
