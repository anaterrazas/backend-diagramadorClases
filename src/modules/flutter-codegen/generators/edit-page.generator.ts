import type { FlutterClass, FlutterField, FlutterFile, FlutterProject } from '../flutter-codegen.types'

export function generateEditPageFile(flutterClass: FlutterClass): FlutterFile {
  const fields = flutterClass.fields.filter((field) => !field.isId)
  const relationImports = uniqueRelations(flutterClass)
    .map((relation) => `import '../../${relation.targetClassName}/state/${toFileName(relation.targetClassName)}_provider.dart';`)
    .join('\n')
  const relationInit = uniqueRelations(flutterClass)
    .map((relation) => `    Future.microtask(() => context.read<${relation.providerName}>().fetchAll());`)
    .join('\n')
  const declarations = fields.map(generateDeclaration).join('')
  const disposals = fields
    .filter(hasController)
    .map((field) => `    ${field.dartName}Ctrl.dispose();`)
    .join('')
  const loadAssignments = fields.map(generateLoadAssignment).join('')
  const bodyEntries = fields.map(generateBodyEntry).join('')
  const controls = fields.map(generateControl).join('')

  const content = `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/${flutterClass.fileName}.dart';
import '../state/${flutterClass.fileName}_provider.dart';
import '../data/${flutterClass.fileName}_service.dart';
${relationImports}

class ${flutterClass.dartName}EditPage extends StatefulWidget {
  final int? itemId;
  const ${flutterClass.dartName}EditPage({super.key, this.itemId});

  @override
  State<${flutterClass.dartName}EditPage> createState() => _${flutterClass.dartName}EditPageState();
}

class _${flutterClass.dartName}EditPageState extends State<${flutterClass.dartName}EditPage> {
  final _formKey = GlobalKey<FormState>();
  final _svc = ${flutterClass.serviceName}();
${declarations}
  Future<void> _pickDate(void Function(DateTime) setter, {DateTime? initial}) async {
    final picked = await showDatePicker(
      context: context,
      firstDate: DateTime(1970),
      lastDate: DateTime(2100),
      initialDate: initial ?? DateTime.now(),
    );
    if (picked != null) setState(() => setter(picked));
  }

  String _fmtDate(DateTime? d) {
    if (d == null) return '';
    final y = d.year.toString().padLeft(4,'0');
    final m = d.month.toString().padLeft(2,'0');
    final day = d.day.toString().padLeft(2,'0');
    return '$y-$m-$day';
  }

  @override
  void initState() {
    super.initState();
${relationInit}
    if (widget.itemId != null) {
      Future.microtask(() async {
        final it = await _svc.getById(widget.itemId!);
        if (!mounted) return;
        setState(() {
${loadAssignments}        });
      });
    }
  }

  @override
  void dispose() {
${disposals}    super.dispose();
  }

  Future<void> _save() async {
    if(!_formKey.currentState!.validate()) return;

    final body = <String, dynamic>{
${bodyEntries}    };

    final prov = context.read<${flutterClass.providerName}>();
    if (widget.itemId == null) {
      await prov.create(${flutterClass.dartName}.fromJson(body));
    } else {
      await prov.updateItem(widget.itemId!, ${flutterClass.dartName}.fromJson(body));
    }
    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.itemId == null ? 'Crear ${flutterClass.dartName}' : 'Editar ${flutterClass.dartName}')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
${controls}              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: _save,
                icon: const Icon(Icons.save),
                label: const Text('Guardar'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
`

  return {
    path: `lib/features/${flutterClass.folderName}/pages/${flutterClass.fileName}_edit_page.dart`,
    content,
    category: 'page',
  }
}

export function generateEditPageFiles(project: FlutterProject): FlutterFile[] {
  return project.classes.map(generateEditPageFile)
}

function generateDeclaration(field: FlutterField): string {
  if (field.isRelation) return `  int? _${field.dartName};\n`
  if (field.dartType === 'bool') return `  bool ${field.dartName} = false;\n`
  if (field.dartType === 'DateTime') return `  DateTime? ${field.dartName};\n`
  return `  final TextEditingController ${field.dartName}Ctrl = TextEditingController();\n`
}

function generateLoadAssignment(field: FlutterField): string {
  if (field.isRelation) return `          _${field.dartName} = it.${field.dartName};\n`
  if (field.dartType === 'bool') return `          ${field.dartName} = it.${field.dartName};\n`
  if (field.dartType === 'DateTime') return `          ${field.dartName} = it.${field.dartName};\n`
  return `          ${field.dartName}Ctrl.text = it.${field.dartName}?.toString() ?? '';\n`
}

function generateBodyEntry(field: FlutterField): string {
  if (field.isRelation) return `      '${field.sourceName}': _${field.dartName},\n`
  if (field.dartType === 'bool') return `      '${field.sourceName}': ${field.dartName},\n`
  if (field.dartType === 'DateTime') return `      '${field.sourceName}': ${field.dartName}?.toIso8601String(),\n`
  if (field.dartType === 'int') return `      '${field.sourceName}': int.tryParse(${field.dartName}Ctrl.text),\n`
  if (field.dartType === 'double') return `      '${field.sourceName}': double.tryParse(${field.dartName}Ctrl.text),\n`
  return `      '${field.sourceName}': ${field.dartName}Ctrl.text,\n`
}

function generateControl(field: FlutterField): string {
  if (field.isRelation) return generateRelationControl(field)
  if (field.dartType === 'bool') {
    return `              SwitchListTile(
                title: const Text('${field.sourceName}'),
                value: ${field.dartName},
                onChanged: (v) => setState(() => ${field.dartName} = v),
              ),
`
  }

  if (field.dartType === 'DateTime') {
    return `              GestureDetector(
                onTap: () => _pickDate((d) => ${field.dartName} = d, initial: ${field.dartName}),
                child: AbsorbPointer(
                  child: TextFormField(
                    decoration: const InputDecoration(labelText: '${field.sourceName} (YYYY-MM-DD)'),
                    controller: TextEditingController(text: _fmtDate(${field.dartName})),
                    validator: (v) => ${field.dartName} == null ? 'Seleccione fecha' : null,
                  ),
                ),
              ),
`
  }

  let keyboardExpression = ''
  if (field.dartType === 'int') keyboardExpression = 'keyboardType: TextInputType.number,'
  if (field.dartType === 'double') keyboardExpression = 'keyboardType: const TextInputType.numberWithOptions(decimal: true),'

  return `              TextFormField(
                controller: ${field.dartName}Ctrl,
                decoration: const InputDecoration(labelText: '${field.sourceName}'),
                ${keyboardExpression}
                validator: (v) => (v==null || v.isEmpty) ? 'Requerido' : null,
              ),
`
}

function hasController(field: FlutterField): boolean {
  return !field.isRelation && field.dartType !== 'bool' && field.dartType !== 'DateTime'
}

function generateRelationControl(field: FlutterField): string {
  const providerName = `${capitalize(field.relatedClassName ?? field.dartName)}Provider`
  return `              Consumer<${providerName}>(
                builder: (_, prov, __) {
                  final items = prov.items;
                  return DropdownButtonFormField<int>(
                    value: _${field.dartName},
                    items: items.map((e) => DropdownMenuItem(
                      value: e.id,
                      child: Text((e.id?.toString() ?? '-') + ' - ' + (e.toJson().values.first?.toString() ?? '')),
                    )).toList(),
                    onChanged: (v) => setState(() => _${field.dartName} = v),
                    decoration: const InputDecoration(labelText: '${field.sourceName}'),
                  );
                },
              ),
`
}

function uniqueRelations(flutterClass: FlutterClass) {
  const seen = new Set<string>()
  return flutterClass.relations.filter((relation) => {
    if (seen.has(relation.targetId)) return false
    seen.add(relation.targetId)
    return true
  })
}

function toFileName(name: string): string {
  return name ? name.charAt(0).toLowerCase() + name.slice(1) : 'related'
}

function capitalize(name: string): string {
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : name
}
