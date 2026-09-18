"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarTextoHandler = generarTextoHandler;
exports.generarDesdeImagenHandler = generarDesdeImagenHandler;
const ia_service_1 = require("./ia.service");
const response_1 = require("../../utils/response");
async function generarTextoHandler(req, res) {
    try {
        const { diagrama, promptext } = req.body;
        const prompt = `Eres un transformador de diagramas UML en JSON.

TAREA
Recibirás:
1) JSON_ACTUAL: un JSON con el formato de mi diagramador (con objetos 'classes' y 'links').
2) INSTRUCCIONES: texto en español que describe cambios solicitados (agregar atributos, renombrar clases, mover posiciones, cambiar relaciones, etc.).

Tu objetivo es aplicar las INSTRUCCIONES al JSON_ACTUAL y devolver ÚNICAMENTE el JSON actualizado, sin texto adicional, sin comentarios ni Markdown.

──────────────────────────────
📘 FORMATO DEL MODELO
──────────────────────────────
El JSON tiene esta estructura general:

{
  "classes": {
    "<idClase>": {
      "id": "<uuid>",
      "x": <int>,
      "y": <int>,
      "w": <int>,
      "h": <int>,
      "name": "<nombreClase>",
      "attributes": [{ "vis": "+", "name": "campo", "type": "string" }, ...],
      "methods": [{ "vis": "+", "name": "metodo", "type": "string" }, ...]
    },
    ...
  },
  "links": {
    "<idLink>": {
      "id": "<uuid>",
      "kind": "<Associate|Aggregate|Compose|Generalize|Dependency|AssociateClass>",
      "sourceId": "<idClaseOrigen>",
      "targetId": "<idClaseDestino>",
      "labels": { "src": "<mult>", "tgt": "<mult>" },
      "anchorSrc": <objeto|null>,
      "anchorTgt": <objeto|null>,
      "assocClassId": "<idClaseAsociada (solo si kind=AssociateClass)>"
    },
    ...
  }
}

──────────────────────────────
📏 REGLAS DEL MODELO DE DATOS
──────────────────────────────
- Tipos válidos: {int,bigint,float,double,decimal,string,text,bool,date,time,datetime,uuid,json}.
- Visibilidad (vis): {+, -, #, ~}. Por defecto "+".
- Multiplicidades: {'0..1','1','0..*','1..*','*'}. Por defecto "".
- IDs nunca cambian. Los links usan los IDs de las clases.
- Coordenadas y tamaños (x,y,w,h) son enteros en píxeles.
- Mantén siempre el formato del JSON, con claves "classes" y "links".

──────────────────────────────
⚙️ REGLAS ESPECIALES DE RELACIONES
──────────────────────────────
- Tipos (kind) válidos: Associate, Aggregate, Compose, Generalize, Dependency, AssociateClass.
- Los links conectan sourceId → targetId y pueden tener etiquetas en labels.src y labels.tgt.
- Si un link debe CREARSE, genera un id único (por ejemplo un UUID o número aleatorio no repetido).
- Si hay múltiples links entre las mismas clases y no se da un id específico, aplica el cambio a todos.

🧩 AssociateClass = TABLA INTERMEDIA:
- Representa una tabla intermedia (una entidad relacional con su propia clase).
- Al crear o cambiar un link a AssociateClass:
  - Si no existe una clase intermedia, créala automáticamente con nombre "<ClaseA>_<ClaseB>" o "<ClaseB>_<ClaseA>" si la primera ya existe.
  - Esta clase debe tener como mínimo un atributo:
    { "vis": "+", "name": "id", "type": "bigint" }.
  - El link debe incluir la propiedad "assocClassId" apuntando al id de esa clase intermedia.
- Si se elimina el link de tipo AssociateClass, elimina también la clase intermedia si no tiene otros links asociados.

──────────────────────────────
🧠 INSTRUCCIONES QUE DEBES ENTENDER
──────────────────────────────

📄 CLASES
- "Renombra clase <NombreActual> a <NombreNuevo>"
  → Actualiza el campo 'name'.

- "Mueve <Clase> a x=<int>, y=<int>"
  → Cambia directamente las coordenadas x,y.

- "Mueve <Clase> hacia la derecha|izquierda|arriba|abajo N píxeles"
  → Ajusta x,y sumando o restando N (por defecto 50 si no se indica).

- "Centra <Clase> en x=<int> y=<int>"
  → Coloca la clase en las coordenadas dadas.

- "Alinea <ClaseA> con <ClaseB> (horizontal o vertical)"
  → Si horizontal → iguala y. Si vertical → iguala x.

- "Redimensiona <Clase> a w=<int>, h=<int>"
  → Cambia w,h.

📜 ATRIBUTOS
- "Agrega a <Clase>: +campo1:tipo1, -campo2:tipo2, #campo3:tipo3, …"
  → Si existe, actualiza vis y tipo; si no, lo añade.
  → Si no se indica visibilidad, usa "+".
  → Si el tipo no es válido, usa "string".

- "Elimina atributo(s) de <Clase>: campo1, campo2"
  → Elimina por coincidencia exacta del nombre.

🧮 MÉTODOS
- "Agrega método(s) a <Clase>: +metodo1():ret, ~metodo2(p1:tipo):ret"
  → Igual que los atributos. Si ya existe, actualiza visibilidad y tipo de retorno.

🔗 RELACIONES
- "Agrega relación <Tipo> entre <ClaseA> y <ClaseB> [src=<m>, tgt=<m>]"
  → Crea el link. Si Tipo=AssociateClass, crea además la clase intermedia.

- "Cambia tipo de link entre <ClaseA> y <ClaseB> a <Associate|Aggregate|Compose|Generalize|Dependency|AssociateClass>"
  → Actualiza el campo 'kind'. Si se cambia a AssociateClass, crea tabla intermedia si no existe.

- "Elimina relación entre <ClaseA> y <ClaseB> [de tipo <Tipo>] [idLink=<id>]"
  → Elimina los links indicados. Si el link eliminado es AssociateClass, elimina también la clase intermedia asociada (si está aislada).

- "Multiplicidad entre <ClaseA> y <ClaseB>: src=<m>, tgt=<m>"
  → Actualiza labels.src y labels.tgt.

- "Fija anclajes del link <idLink>: anchorSrc.side=<T|B|L|R>, anchorSrc.t=<0..1>, anchorTgt.side=..., anchorTgt.t=..."
  → Actualiza anchorSrc/anchorTgt del link.

──────────────────────────────
✅ VALIDACIÓN Y COMPORTAMIENTO
──────────────────────────────
- No modifiques nada que no se pida.
- Mantén todas las claves existentes y su estructura.
- Si alguna instrucción es ambigua o inválida, ignórala y continúa.
- Conserve el orden de clases y links; agrega nuevos al final.
- Devuelve ÚNICAMENTE el JSON final válido (sin Markdown, texto ni comentarios).

──────────────────────────────
ENTRADA
──────────────────────────────
JSON_ACTUAL:
${JSON.stringify(diagrama, null, 2)}

INSTRUCCIONES:
${promptext}`;
        const raw = await ia_service_1.IAService.generarTexto(prompt);
        console.log(raw);
        const diagram = typeof raw === 'string'
            ? parseMaybeJson(raw) // convierte "```json ...```" o texto → objeto
            : raw;
        return (0, response_1.successResponse)(res, diagram, 'Diagrama Actualizado');
    }
    catch (err) {
        res.status(500).json({ message: 'Error al generar texto', error: err.message });
    }
}
function parseMaybeJson(s) {
    // si viene con ```json ... ```
    const fence = /```json\s*([\s\S]*?)```/i.exec(s);
    if (fence?.[1])
        return JSON.parse(fence[1]);
    // recorta desde la 1.ª '{' hasta la última '}'
    const i = s.indexOf('{'), j = s.lastIndexOf('}');
    if (i >= 0 && j > i)
        return JSON.parse(s.slice(i, j + 1));
    // o JSON.parse directo si ya es JSON puro en string
    return JSON.parse(s);
}
function coerceToJsonObject(candidate) {
    // ya es objeto
    if (candidate && typeof candidate === 'object')
        return candidate;
    // intenta parsear string
    if (typeof candidate === 'string') {
        // 1) ```json ... ```
        const fenced = /```json\s*([\s\S]*?)```/i.exec(candidate);
        if (fenced?.[1]) {
            return JSON.parse(fenced[1]);
        }
        // 2) ``` ... ```
        const fencedAny = /```+\s*([\s\S]*?)```+/i.exec(candidate);
        if (fencedAny?.[1]) {
            return JSON.parse(fencedAny[1]);
        }
        // 3) best effort: primer '{' a último '}'
        const i = candidate.indexOf('{');
        const j = candidate.lastIndexOf('}');
        if (i >= 0 && j > i) {
            return JSON.parse(candidate.slice(i, j + 1));
        }
        // 4) último intento: parse directo
        return JSON.parse(candidate);
    }
    throw new Error('La respuesta del modelo no es JSON parseable');
}
async function generarDesdeImagenHandler(req, res) {
    try {
        const imagePath = req.file?.path; // si usas diskStorage
        const mimeType = req.file?.mimetype;
        if (!imagePath) {
            return res.status(400).json({ success: false, message: 'No se recibió la imagen (campo esperado: "imagen")' });
        }
        const prompt = buildUmlImagePrompt();
        // Llama a tu servicio de IA (debe devolver JSON puro O texto que podamos parsear)
        const raw = await ia_service_1.IAService.generarDesdeImagen({ prompt, imagePath, mimeType });
        // Asegura que sea objeto JSON (sin fences)
        const parsed = coerceToJsonObject(raw);
        console.log(parsed);
        // Respuesta estándar esperada por tu frontend (unwrapDiagramPayload soporta objeto o string)
        return res.json({
            success: true,
            message: 'Diagrama Generado',
            data: parsed
        });
    }
    catch (err) {
        console.error('[generarDesdeImagenHandler] error:', err);
        return res.status(500).json({ success: false, message: 'Error al generar desde imagen', error: err?.message || String(err) });
    }
}
function buildUmlImagePrompt() {
    return (`Eres un analizador de imágenes UML. Recibirás UNA imagen con un diagrama de clases y debes devolver EXCLUSIVAMENTE un objeto JSON válido (sin Markdown, sin backticks, sin texto adicional). La salida debe seguir este esquema EXACTO:

{
  "classes": {
    "<uuid>": {
      "id": "<uuid>",
      "x": <int>,
      "y": <int>,
      "w": <int>,
      "h": <int>,
      "name": "<string>",
      "attributes": [
        { "visibility": "<+|#|-|~>", "name": "<string>", "type": "<int|bigint|float|double|decimal|string|text|bool|date|time|datetime|uuid|json|''>" }
      ],
      "methods": [
        {
          "visibility": "<+|#|-|~>",
          "name": "<string>",
          "returnType": "<int|bigint|float|double|decimal|string|text|bool|date|time|datetime|uuid|json|''>",
          "params": [
            { "name": "<string>", "type": "<int|bigint|float|double|decimal|string|text|bool|date|time|datetime|uuid|json|''>" }
          ]
        }
      ]
    }
  },
  "links": {
    "<uuid>": {
      "id": "<uuid>",
      "kind": "<Associate|Aggregate|Compose|Generalize|Dependency|AssociateClass>",
      "sourceId": "<uuid>",
      "targetId": "<uuid>",
      "labels": { "src": "<'0..1'|'1'|'0..*'|'1..*'|'*'|''>", "tgt": "<'0..1'|'1'|'0..*'|'1..*'|'*'|''>" },
      "anchorSrc": { "side": "<T|B|L|R>", "t": <number 0..1> } | null,
      "anchorTgt": { "side": "<T|B|L|R>", "t": <number 0..1> } | null,
      "assocClassId": "<uuid>"
    }
  }
}

REGLAS ESTRICTAS
1) Salida:
   - Devuelve SOLO un objeto JSON válido. No uses bloques de código, ni \`\`\`, ni explicaciones fuera del JSON.

2) IDs:
   - Usa UUID v4 únicos para todas las claves de "classes" y "links" y para cada campo "id".
   - "sourceId", "targetId" y (si existe) "assocClassId" deben referenciar IDs presentes en "classes".
   - Si "kind" ≠ "AssociateClass", no incluyas "assocClassId".

3) Coordenadas y tamaño:
   - Origen (0,0) en la esquina superior izquierda de la imagen.
   - x,y = esquina superior izquierda de la caja (px); w,h = ancho/alto (px).
   - Usa enteros. Si no puedes medir, estima valores coherentes.

4) Clases:
   - "name" = texto visible del nombre de la clase.
   - "attributes": lista de {visibility,name,type}. Si no se distingue, visibility="+", type="".
   - "methods": lista de {visibility,name,returnType,params[]}. Si no se distingue, visibility="+", returnType=""; params=[] si no hay.
   - Si no hay atributos o métodos, usa [].

5) Relaciones:
   - Associate: línea simple.
   - Aggregate: rombo blanco en el TODO → sourceId = TODO, targetId = PARTE.
   - Compose: rombo negro en el TODO → sourceId = TODO, targetId = PARTE.
   - Generalize: flecha triangular hueca hacia la superclase → sourceId = SUBCLASE, targetId = SUPERCLASE.
   - Dependency: línea discontinua con flecha abierta.
   - AssociateClass: relación + clase de asociación (incluye "assocClassId" con el id de la clase de asociación).

6) Labels y anclajes:
   - "labels.src"/"labels.tgt": solo "0..1","1","0..*","1..*","*" o "".
   - "anchorSrc"/"anchorTgt": si se puede inferir, {side:"T|B|L|R", t:0..1}; si no, null.

7) Valores por defecto:
   - visibility="+", type="" y returnType="" cuando no se distingan.
   - attributes=[] y methods=[] cuando no existan.`);
}
