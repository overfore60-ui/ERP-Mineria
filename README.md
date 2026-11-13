# SITCO Aranda: prototipo interactivo

**FEP Caso Minería · Grupo 2 · OVERFORE**
Prototipo navegable para la propuesta de la Compañía Minera Altos de Aranda S.A. (empresa ficticia del caso).

> Es una **simulación**: no hay servidor, base de datos ni nube reales. Todo corre en el navegador con datos de demostración, para mostrar cómo se vería y cómo se comportaría la plataforma.

> **Estado (10 de noviembre de 2026).** El prototipo es la versión en Angular, que está en [`sitco-angular/`](sitco-angular). La versión anterior en HTML se conserva en la rama `respaldo-html`.

---

## Cómo verlo

1. Entra a la dirección publicada o ejecútalo en tu computador (ver [Cómo ejecutarlo](#cómo-ejecutarlo)). Funciona en Chrome o Edge y solo necesita internet para las tipografías de Google Fonts.
2. En el login pulsa **"Explorar como evaluador"**, o elige un perfil de demostración. El operador de pala no inicia sesión: se ve desde "Explorar como evaluador" o con "Cambiar de perfil" en el menú de usuario.
3. Con el botón **"Simular nube"** (abajo a la izquierda) puedes cortar la fibra o crear una sombra de cobertura y ver cómo reacciona la plataforma.

| Dato de demostración | Valor |
|---|---|
| PIN de la credencial de faena (supervisión y portería) | `1234` |
| Código de segundo factor (OTP) | `123456` |
| Código de recuperación de cuenta | `482913` |

Dirección publicada: `https://sitco-aranda.up.railway.app`. Railway debe compilar la carpeta `sitco-angular` con `npm run build` y servir `dist/sitco-angular/browser`.

### Cómo ejecutarlo

El prototipo está hecho en **Angular 22** con estilos en **Tailwind CSS 4**: 37 pantallas organizadas en páginas y componentes reutilizables. Requiere Node.js 22 o superior. Para verlo:

```bash
cd sitco-angular
npm install
npm start
```

y abre `http://localhost:4200`. Su estructura se explica en [`sitco-angular/README.md`](sitco-angular/README.md).

---

## Qué hicimos

Una aplicación web de una sola página, hecha en Angular 22 con Tailwind CSS 4, con:

- **9 perfiles de usuario** con menú, inicio y permisos propios: operador de pala, supervisor de turno, planificación, metalurgia, seguridad, sustentabilidad, contratista, gerencia y administración TI. Si un perfil entra a una sección que no le corresponde, ve "Acceso restringido": es el control de acceso por roles.
- **Trazabilidad de lotes** de la mina al embarque, con reconstrucción del origen de cada lote, ciclo completo y una excepción por arsénico.
- **Conciliación metalúrgica**, plan minero con versiones, y flota de equipos con detenciones.
- **Perforación y pozos** (Operación Mina): pozos con profundidad e índice de dureza, registro desde la App SITCO Terreno para las siete perforadoras sin instrumentación y descarga en CSV para Geología.
- **Centro de control**: despacho de palas y camiones en movimiento, mapa del rajo, geotecnia, modelo 3D por bloques y una arquitectura sobre una vista aérea ilustrada de la faena (rajo, botaderos, planta, relaves, campamento y Nodo de Faena con red LTE) hasta Antofagasta, el puerto y la nube en Santiago, con la fibra A, la fibra B y el satélite reaccionando al simulador de corte. El paisaje es una imagen generada con código (`sitco-angular/herramientas/fondo-arquitectura.mjs`). En el despacho, los camiones suben y bajan por dos rampas con curvas de retorno (oeste al chancador; sur al botadero y, por el borde este, al Stock A), cada uno mira hacia donde avanza, y la ficha del equipo seleccionado va bajo el mapa para no tapar la flota.
- **Acreditación de personas**, seguridad y fatiga, ambiental y huella de carbono, y gestión de terceros.
- **Consola de portería** (Acreditación y Acceso): lo que ve el guardia al leer una credencial. Muestra si la persona puede ingresar y, si tiene un documento vencido, los tres avisos previos que envió el sistema (criterio de aceptación 7). Funciona sin enlace y deja bitácora de ingresos y rechazos.
- **Integrador de sistemas**: los diez sistemas existentes con su tratamiento (se integra, solo lectura, se amplía o se reemplaza), qué intercambia cada conector, dónde corre y su estado. Reacciona al simulador de corte: los conectores que van a la nube pasan a "En bandeja de salida".
- **Módulo y NODO en cada pantalla**: bajo el título se indica a qué módulo de la solución pertenece y, si corre en la faena, la marca NODO, como en la imagen de módulos. La arquitectura de información tiene una pestaña "Módulos de la solución" con el cruce completo.
- **Tablero analítico** con filtros, exportación simulada y desglose por indicador.
- **Terreno**: dos vistas.
  - **Operador de pala: la Botonera de Pala**, como la Figura 3.10 del Subdocumento 3. Cuatro botones de destino (planta, baja ley, estéril y borde), una luz que marca el destino del plan y el toque de credencial al inicio del turno. No hay pantalla, formularios ni PIN. Los registros se guardan sin señal y se envían al volver el enlace.
  - **Supervisor de turno: tableta rugerizada**, con incidentes (hora del hecho y hora de registro por separado), inspecciones con firma, aviso de falla a SAP en tres acciones y clasificación de detenciones.
- **Conectividad y nube**: cola de sincronización, bitácora y simulador de corte con los tres caminos del Subdocumento 3: fibra A, fibra B (otro proveedor y camino) y satélite de órbita baja. El modo local solo se activa si caen los tres; el satélite geoestacionario existente queda para telefonía y correo.
- **Administración**: usuarios, matriz de roles con conflictos de segregación de funciones, parámetros y auditoría.
- **Documentación del prototipo**: arquitectura de información y sistema de diseño.

## Por qué lo hicimos

Las bases exigen un prototipo interactivo (Capítulo 25 de las Bases Técnicas Transversales, TFEP-01/2026). Además, el correo del profesor aclara que el Informe 3 solo necesita un **avance navegable**; la versión completa, con el alcance mínimo del numeral 25.2 y los requisitos RT-25.06 a RT-25.09, se entrega con la propuesta final.

Decidimos **simular** en vez de construir un sistema real, porque lo que se evalúa es el diseño, la experiencia de uso y el comportamiento ante fallas, no un backend en producción. El numeral 25.6 de las bases dice que no se requiere procesamiento real de datos, base de datos, autenticación real ni persistencia. Por eso la conexión a la nube, la sincronización y las exportaciones son un modelo en el navegador.

## De dónde sale la información

| Fuente | Qué aporta |
|---|---|
| Bases Técnicas Transversales (TFEP-01/2026), Cap. 25 | Alcance mínimo del prototipo y reglas de diseño RT-25.01 a RT-25.10 |
| Bases Técnicas del Caso Minería | El caso, los procesos y los 14 criterios de aceptación (en especial el 13: 48 h sin enlace, y el 14: operador de pala con guantes) |
| Bases Administrativas | Exigencias de ingeniería, DevSecOps y calidad (art. 24), y contenido de los subdocumentos |
| Correo del profesor (1 de noviembre de 2026) | Alcance del Informe 3: avance navegable |
| Subdocumento 3, Figura 3.10 | Diseño de la Botonera de Pala |
| Subdocumento 4, ADR-06 y ADR-07 | Botonera sin pantalla; la botonera no usa PIN y el toque de credencial no abre sesión; credencial más PIN solo en supervisión y portería |
| Subdocumento 13, Anexos | Límite de arsénico ilustrativo de 0,40 % |
| `DECISIONES.md` del repo del informe | DEC-006 (canales de terreno) y DEC-007 (identidad por población, en revisión) |

### Cobertura de reglas de diseño

| Requisito | Estado |
|---|---|
| RT-25.02 Retroalimentación visual | Sí: esqueletos de carga, avisos, validaciones y mensajes de error. |
| RT-25.03 WCAG 2.2 AA | Parcial. Ver [Accesibilidad](#accesibilidad). |
| RT-25.04 Responsivo | Sí: sin desborde horizontal en 1920 × 1080, 1366 × 768, 1024 × 768, 768 × 1024 y 375 × 812, revisado pantalla por pantalla el 7 de noviembre de 2026. |
| RT-25.05 Sistema de diseño | Sí: pantalla `/sistema-diseno` con cinco colores base y dos familias tipográficas. |
| RT-25.06 Enlace navegable en línea | Sí: `https://sitco-aranda.up.railway.app`. |
| RT-25.07 Acceso por 6 meses | Pendiente: confirmar que el plan de Railway lo garantice. |
| RT-25.08 Interactividad simulada | Sí: navegación completa, ingreso y validación simulados, carga de archivos, desplegables y estados. |
| RT-25.09 Arquitectura de información | Sí: pantalla `/arquitectura-informacion` con mapa del sitio, diagrama de navegación, taxonomía y menús por perfil. |
| RT-25.10 Exportación a documento interactivo (deseable) | No. |
| Criterio 7 | La consola de portería rechaza a quien tiene un documento vencido y muestra los avisos que se enviaron a 30, 15 y 7 días. |
| Criterio 13 | El simulador de nube muestra la operación local desde el Nodo de Faena durante hasta 48 h y la sincronización automática al volver el enlace. |
| Criterio 14 | La botonera registra el cambio de destino con un toque en el botón de destino, sin teclear ni pantalla táctil. |
| Componentes del 25.4: información contextual emergente | Sí: ayudas con globo en indicadores con línea base, en el límite de arsénico y en la autonomía sin enlace. Se abren con el mouse o el teclado y se cierran con Esc. |

RT-25.01 (máximo de tres interacciones) no está medido todavía.

## Antecedentes

La carpeta [`antecedentes/`](antecedentes) reúne los documentos de los que sale el prototipo. Está dividida en tres partes:

| Carpeta | Qué contiene | Para qué sirve |
|---|---|---|
| [`antecedentes/correo/`](antecedentes/correo) | `Informe3_Aclaraciones_TFEP-01-2026.md`: el comunicado de aclaraciones del Informe 3 | Una parte explica qué es el prototipo y qué se pide en esta entrega (un avance navegable) |
| [`antecedentes/documentos/`](antecedentes/documentos) | Subdocumento 3 y sus anexos, Subdocumento 4 y sus anexos, y los Formularios T-11 y T-12 (PDF) | Describen la solución y la arquitectura que el prototipo muestra |
| [`antecedentes/bases md/`](antecedentes/bases%20md) | `bases-administrativas.md`, `bases-tecnicas-caso-mineria.md` y `bases-tecnicas-transversales.md` | Las tres bases de la licitación: lo que se necesita y cómo debe ser el prototipo |
| [`antecedentes/imagenes/`](antecedentes/imagenes) | `modulos-del-sistema.png`: la foto de los módulos del sistema | Vista general de la solución, de un vistazo |

### Módulos del sistema

![Nueve módulos en dos etapas, sobre lo que la compañía ya tiene](antecedentes/imagenes/modulos-del-sistema.png)

Fuente: Subdocumento 3 (módulos y sistemas existentes).

La solución tiene **nueve módulos**. Los marcados con **NODO** también corren en la faena y siguen funcionando 48 h sin enlace.

| Grupo | Módulos |
|---|---|
| Problema 1 · Trazabilidad comercial | Operación Mina (NODO) → Trazabilidad y Embarque (NODO) → Conciliación Metalúrgica (NODO) |
| Problema 2 · Productividad operacional | Equipos y Mantenimiento |
| Problema 3 · Cumplimiento regulatorio y personas | Acreditación y Acceso (NODO), Seguridad y Salud Ocupacional (NODO), Cumplimiento Ambiental |
| Transversales | Indicadores y Centro Integrado, Administración y Servicios Comunes |
| Integración | Integrador de Sistemas (NODO): un conector por cada sistema existente |

Acreditación y Acceso entrega la habilitación a Operación Mina. Operación Mina pasa los datos del viaje a Trazabilidad y Embarque, y esta pasa los datos del lote a Conciliación Metalúrgica.

Qué se hace con los sistemas que la compañía ya tiene:

- **Se integran:** SAP S/4HANA, despacho de flota, laboratorio, telemetría de fabricantes y control de fatiga.
- **Solo lectura:** historiador de proceso, planificación minera y báscula de camiones.
- **Se amplía:** acceso de portería.
- **Se reemplazan:** planillas y carpetas.

## Supuestos y límites

- **Todos los datos son ficticios.** Empresa, personas, lotes, equipos y cifras son de demostración.
- El **límite de arsénico (0,40 %)** es ilustrativo y se alinea con el Anexo del Subdocumento 13, que aclara que el caso no entrega ese valor. Es un parámetro y se puede cambiar.
- El nombre del producto es **SITCO Aranda**, como en los subdocumentos; **OVERFORE** es el nombre del equipo. Se cambian en un solo lugar (`BRAND`, en `sitco-angular/src/app/core/data.ts`).
- Se asume que el **balance es la fuente de verdad** y que **SAP emite los documentos**; el prototipo no reemplaza a SAP.
- **No muestra verificación facial.** El caso declara una objeción sindical a la biometría en portería, y el Subdocumento 3 deja la verificación facial sujeta a un acuerdo con el sindicato.
- Las exportaciones a PDF y XLSX son simuladas; el CSV descarga datos solo en las pantallas que lo entregan.
- Los mapas, el modelo 3D y la imagen del login son **ilustraciones esquemáticas generadas por código**, no datos reales ni fotos de una mina.
- No cubre toda la propuesta: es un avance. No incluye el Portal para Compradores, que el numeral 25.2 no exige. El pipeline DevSecOps se documenta en la propuesta, no está en el prototipo.

## Estructura

```
sitco-angular/      El prototipo en Angular 22 con Tailwind CSS 4 (páginas y componentes)
antecedentes/       Documentos de referencia: correo, documentos de la solución, bases e imágenes
.github/workflows/  Pipeline de CI: compila la versión Angular en cada push a la rama prototipo
```

## Accesibilidad

Se apunta a WCAG 2.2 nivel AA para el trabajo en faena: objetivos táctiles de 44 px, modo de alto contraste para el sol, texto ampliable, navegación por teclado y mensajes anunciados para lector de pantalla.

Comprobado hasta ahora:

- **Teclado:** el orden de tabulación es lógico, el foco es visible y no hay elementos clicables fuera del alcance del teclado en las 11 pantallas revisadas.
- **Contraste:** una revisión automática de esas pantallas no encontró textos bajo el mínimo. Los contrastes de la paleta coinciden con los que declara la página de sistema de diseño.
- **Objetivos táctiles:** en 1366 px se cumplen en la mayoría de las pantallas.
- **Texto grande:** los tamaños de texto están en `rem`, así que el botón los amplía todos juntos (71 de 71 textos del Inicio del supervisor). Con el texto grande encendido, 25 pantallas revisadas no se desbordan a 375 px ni a 683 px de ancho. Los textos dentro de los gráficos SVG no se amplían.

No está comprobado: el uso con un lector de pantalla real y el modo de alto contraste en pantalla.

## Cambios acordados ya implementados

Acordados el 5 de noviembre de 2026 y hechos en Angular:

- **Objetivos táctiles de 44 × 44 px** en todos los controles, incluidos los encabezados de columna de las tablas, las casillas de fila, las fichas de camión del mapa y el cierre de notificaciones.
- **Pausa del movimiento** del mapa de despacho (WCAG 2.2.2, nivel A): un botón "En vivo" que cambia a "En pausa" al detenerlo, y el mapa parte pausado si el sistema pide reducir animaciones.

Hechos el 5 y 6 de noviembre de 2026.

- **Botonera de Pala** como en la Figura 3.10 del Subdocumento 3: cuatro botones de destino, luz del plan, luz de registrado y toque de credencial simulado, sin PIN ni pantalla. Se quitaron "Detención" y "Aviso de falla" de la vista del operador (RNF-USA-008 y RNF-USA-009). Sin toque de credencial, el registro queda como "operador no identificado" (RF-ACR-011).
- **Login:** en la pestaña Credencial de faena primero se simula acercar la credencial al lector (sin escribir nada), el sistema muestra a quién reconoció y luego pide el PIN; con los dos factores entra directo, como supervisor de turno o como guardia de portería. El operador no inicia sesión.
- **Nombre del producto:** SITCO Aranda.
- **Límite de arsénico:** 0,40 %, con lotes y mezclas de demostración coherentes.
- **Información contextual emergente** (numeral 25.4).
- **Trazabilidad:** supuestos SUP-11 y SUP-03 del Subdocumento 2 en pantalla, y cada etapa del ciclo marcada como medida o supuesta, con su regla y versión (RF-TRZ-005).
- **Conectividad:** dos fibras más satélite de órbita baja, "Nodo de Faena" en vez de "borde de faena", nube en Santiago con réplica en São Paulo, y regla de conflicto al sincronizar (el plan lo gana la nube; los hechos de faena, el Nodo).
- **Revocación y bloqueo:** textos alineados con el Subdocumento 4 (dispositivo en 15 minutos o menos, credencial en 24 horas o menos, sin propagación durante un corte). La autonomía local no se puede bajar de 48 h.
- **Avisos de vencimiento:** 30, 15 y 7 días, a la persona, su empleador y Seguridad (RF-ACR-006).
- **Supervisor en tableta:** firma en la inspección (RNF-USA-007), pestaña "Falla" con aviso a SAP (RF-EQU-005) y hora del hecho en los incidentes (RF-CUM-002).
- **Autoría:** los registros y las versiones del plan quedan a nombre de la persona que los hace.
- **Coherencia de cifras:** tres fabricantes de telemetría, indicadores de la compañía rotulados como "meta interna", conciliación sin cifras contradictorias y valores de ejemplo avisados como tales.
- **Mapa del sitio** con el Centro de control, y color de los gráficos con contraste suficiente.

Hechos el 7 de noviembre de 2026, tras revisar el prototipo contra los módulos de la solución y el capítulo 25:

- **Integrador de sistemas**, **Perforación y pozos** y **Consola de portería**, descritos en [Qué hicimos](#qué-hicimos).
- **Marca de módulo y NODO** bajo el título de cada pantalla, y pestaña "Módulos de la solución" en la arquitectura de información.
- **Responsivo (RT-25.04):** la cabecera cabe en 375 px, el contenido ya no ensancha la página en pantallas angostas, las tablas con texto oculto para lector de pantalla ya no desbordan y la vista de terreno vuelve a dos columnas en escritorio.
- **Ayuda:** la pregunta sobre portería dice ahora 30, 15 y 7 días, igual que los parámetros.
