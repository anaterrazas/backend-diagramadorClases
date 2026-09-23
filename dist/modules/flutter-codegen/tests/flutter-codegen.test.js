"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const zip_utils_1 = require("../../codegen/tests/zip.utils");
const flutter_codegen_service_1 = require("../flutter-codegen.service");
const request = {
    app_name: 'mi_flutter_app',
    api_base_url: 'http://localhost:8080',
    diagram: {
        classes: {
            p: {
                id: 'p',
                name: 'Person',
                attributes: [{ name: 'nombre', type: 'String' }],
            },
            m: {
                id: 'm',
                name: 'Mascota',
                attributes: [{ name: 'nombre', type: 'String' }],
            },
            t: {
                id: 't',
                name: 'tiene',
                attributes: [
                    { name: 'estado', type: 'bool' },
                    { name: 'personId', type: 'int' },
                    { name: 'mascotaId', type: 'int' },
                ],
            },
        },
        links: {},
    },
};
async function main() {
    const zip = await (0, flutter_codegen_service_1.generateFlutterZip)(request);
    assert_1.default.strictEqual(zip.readUInt32LE(0), 0x04034b50, 'el resultado debe ser un ZIP válido');
    const paths = (0, zip_utils_1.listZipEntries)(zip).map((entry) => entry.path);
    for (const path of [
        'lib/main.dart',
        'lib/core/api_client.dart',
        'lib/core/app_providers.dart',
        'lib/features/Person/models/person.dart',
        'lib/features/Person/data/person_service.dart',
        'lib/features/Person/state/person_provider.dart',
        'lib/features/Person/pages/person_list_page.dart',
        'lib/features/Person/pages/person_create_page.dart',
        'lib/features/Person/pages/person_edit_page.dart',
        'lib/features/Mascota/models/mascota.dart',
        'lib/features/Mascota/data/mascota_service.dart',
        'lib/features/Mascota/state/mascota_provider.dart',
        'lib/features/Mascota/pages/mascota_list_page.dart',
        'lib/features/Mascota/pages/mascota_create_page.dart',
        'lib/features/Mascota/pages/mascota_edit_page.dart',
        'lib/features/tiene/models/tiene.dart',
        'lib/features/tiene/data/tiene_service.dart',
        'lib/features/tiene/state/tiene_provider.dart',
        'lib/features/tiene/pages/tiene_list_page.dart',
        'lib/features/tiene/pages/tiene_create_page.dart',
        'lib/features/tiene/pages/tiene_edit_page.dart',
    ]) {
        (0, assert_1.default)(paths.includes(path), `falta ${path} en el ZIP`);
    }
    (0, assert_1.default)(!paths.some((path) => path === 'pubspec.yaml' || path.startsWith('android/')));
    console.log(`ZIP Flutter válido con ${paths.length} archivos`);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
