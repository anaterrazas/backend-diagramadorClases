import type { FlutterFile, FlutterProject } from '../flutter-codegen.types'
import { generateApiClientFile } from './api-client.generator'
import { generateAppProvidersFile } from './app-providers.generator'

export function generateMainFile(project: FlutterProject): FlutterFile {
  const pageImports = project.modules
    .map((module) => `import 'features/${module.folderName}/pages/${module.name}_list_page.dart';`)
    .join('')

  const routes = project.modules
    .map((module) => `\'/${module.name}\': (_) => const ${module.className}ListPage(),`)
    .join('\n')

  const drawerItems = project.modules
    .map((module) => `ListTile(
              leading: const Icon(Icons.list),
              title: const Text('${module.className}'),
              onTap: () => Navigator.of(context).pushNamed('/${module.name}'),
            ),`)
    .join('\n')

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
`

  return {
    path: 'lib/main.dart',
    content,
    category: 'routing',
  }
}

export function generateFlutterBaseFiles(project: FlutterProject): FlutterFile[] {
  const files = [
    generateApiClientFile(project),
    generateAppProvidersFile(project),
    generateMainFile(project),
  ]
  project.files = files
  return files
}
