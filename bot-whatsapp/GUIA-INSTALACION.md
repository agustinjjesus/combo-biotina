# Bot de WhatsApp con IA — Guía de instalación completa

Stack: **VPS DigitalOcean (Ubuntu 24.04) + Easypanel + PostgreSQL + Redis + n8n + Evolution API + Claude (Anthropic)**

Dominio del negocio: `productoscapilarespg.com` (el sitio principal sigue en GitHub Pages; el bot usa **subdominios** nuevos, no toca el sitio).

---

## 0. DNS (hacer primero)

En el panel donde administras el dominio `productoscapilarespg.com`, crea estos registros **A** apuntando a la IP de tu VPS:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | `panel` | IP del VPS |
| A | `n8n` | IP del VPS |
| A | `evo` | IP del VPS |

> ⚠️ No toques los registros existentes del dominio raíz (`@`, `www`) — esos son de tu página en GitHub Pages.

Espera unos minutos a que propague (puedes verificar con `ping panel.productoscapilarespg.com`).

---

## 1. Instalar Easypanel en el VPS

Conéctate por SSH y ejecuta:

```bash
ssh root@TU_IP_DEL_VPS

curl -fsSL https://raw.githubusercontent.com/agustinjjesus/combo-biotina/main/bot-whatsapp/setup-vps.sh -o setup-vps.sh
bash setup-vps.sh
```

El script instala Docker, firewall, fail2ban y Easypanel. Al terminar:

1. Abre `http://TU_IP:3000` y crea tu usuario administrador.
2. En **Settings → General**, pon el dominio del panel: `panel.productoscapilarespg.com`. A partir de ahí entras por `https://panel.productoscapilarespg.com`.
3. (Opcional pero recomendado) cierra el puerto 3000: `ufw delete allow 3000/tcp`.

---

## 2. Crear el proyecto y los servicios en Easypanel

Crea un proyecto llamado **`bot`**. Dentro de él vas a crear 4 servicios.

> 💡 **Hostnames internos:** los servicios del mismo proyecto se comunican entre sí por el hostname interno que Easypanel muestra en las credenciales de cada servicio (formato `proyecto_servicio`, ej. `bot_postgres`). Usa siempre ese hostname, no la IP pública.

### 2.1 PostgreSQL

1. **+ Service → Postgres**
2. Nombre: `postgres` — versión 16 (o la que ofrezca por defecto).
3. Easypanel genera usuario/contraseña. **Guárdalos.**
4. Necesitamos **dos bases de datos** (una para n8n, otra para Evolution). Entra a la pestaña **Console** del servicio postgres y ejecuta:

```bash
psql -U postgres
CREATE DATABASE n8n;
CREATE DATABASE evolution;
\q
```

5. Crea también la tabla de historial de conversaciones (la usa el bot para tener memoria):

```bash
psql -U postgres -d n8n
```
```sql
CREATE TABLE IF NOT EXISTS chat_history (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history (session_id, id);
```

### 2.2 Redis

1. **+ Service → Redis**
2. Nombre: `redis`. Guarda la contraseña generada.

### 2.3 n8n

1. **+ Service → App**
2. Nombre: `n8n`
3. **Image:** `docker.n8n.io/n8nio/n8n:latest`
4. **Domain:** `n8n.productoscapilarespg.com` → puerto **5678** (HTTPS activado).
5. **Environment** (pestaña Environment del servicio). Reemplaza `PG_PASSWORD`, etc. con tus valores reales:

```env
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=bot_postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=PG_PASSWORD

N8N_HOST=n8n.productoscapilarespg.com
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.productoscapilarespg.com/
GENERIC_TIMEZONE=America/Argentina/Buenos_Aires
N8N_ENCRYPTION_KEY=UNA_CLAVE_LARGA_ALEATORIA
```

> Genera valores aleatorios con: `openssl rand -hex 24`
>
> ⚠️ **No cargues acá `ANTHROPIC_API_KEY`, `EVOLUTION_URL`, `EVOLUTION_API_KEY` ni `ESCALATION_GROUP_JID`.** En versiones recientes de n8n, las expresiones (`$env.ALGO`) corren en un *task runner* aislado que **no tiene acceso a las variables de entorno custom del contenedor** — solo a una lista fija muy corta (`PATH`, `GENERIC_TIMEZONE`, etc.). Por más que declares la variable en Easypanel, el workflow nunca la va a poder leer (falla con `access to env vars denied`) y `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` **no soluciona esto**. Esas claves se configuran directamente en el workflow — ver sección 4.

6. **Mounts:** agrega un volumen en `/home/node/.n8n` (para que no pierdas datos al redeployar).
7. Deploy. Entra a `https://n8n.productoscapilarespg.com` y crea tu cuenta de administrador.

### 2.4 Evolution API

1. **+ Service → App**
2. Nombre: `evolution`
3. **Image:** `evoapicloud/evolution-api:latest`
4. **Domain:** `evo.productoscapilarespg.com` → puerto **8080** (HTTPS activado).
5. **Environment:**

```env
SERVER_URL=https://evo.productoscapilarespg.com
AUTHENTICATION_API_KEY=LA_MISMA_CLAVE_QUE_PUSISTE_EN_N8N

DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://postgres:PG_PASSWORD@bot_postgres:5432/evolution
DATABASE_SAVE_DATA_INSTANCE=true
DATABASE_SAVE_DATA_NEW_MESSAGE=true
DATABASE_SAVE_MESSAGE_UPDATE=true
DATABASE_SAVE_DATA_CONTACTS=true
DATABASE_SAVE_DATA_CHATS=true

CACHE_REDIS_ENABLED=true
CACHE_REDIS_URI=redis://default:REDIS_PASSWORD@bot_redis:6379/1
CACHE_REDIS_PREFIX_KEY=evolution
CACHE_LOCAL_ENABLED=false

LOG_LEVEL=ERROR
DEL_INSTANCE=false
```

6. **Mounts:** volumen en `/evolution/instances`.
7. Deploy. Verifica que `https://evo.productoscapilarespg.com` responda (muestra un JSON de bienvenida).

---

## 3. Conectar WhatsApp (Evolution API)

1. Abre el **Manager** de Evolution: `https://evo.productoscapilarespg.com/manager` e ingresa con tu `AUTHENTICATION_API_KEY`.
2. Crea una instancia llamada `pg` (canal **Baileys**).
3. Escanea el **QR** desde el celular del negocio: WhatsApp → Dispositivos vinculados → Vincular dispositivo.
4. Cuando figure **Connected**, WhatsApp ya está vinculado.

---

## 4. Importar y configurar el workflow en n8n

El workflow ya incluye el prompt de ventas cargado y la lógica de **escalamiento**: cuando llega un audio, o cuando Claude decide que hay que avisar al equipo (venta a cerrar, pago contra entrega en Zona Norte, mensaje fuera de tema, etc.), el bot le manda un aviso automático al **grupo de WhatsApp del equipo** — no reemplaza a Dolores/dueño, los avisa.

1. En n8n: **Workflows → Import from URL** (o "Import from File" si no aparece esa opción) → pega/sube `n8n-workflow-whatsapp-claude.json` (está en esta misma carpeta del repo).
2. Crea la credencial de Postgres: **Credentials → New → Postgres**
   - Host: `bot_postgres` — Database: `n8n` — User: `postgres` — Password: la tuya — Port: `5432` — SSL: disable.
   - Asígnala a los **ocho** nodos de Postgres del workflow: `Cargar historial`, `Guardar conversación`, `Leer estado bot`, `Guardar estado bot`, `Leer estado cliente`, `Chequear duplicado`, `Registrar mensaje`, `Registrar imagen recibida`.
3. Crea dos credenciales de tipo **Header Auth** (`Credentials → New → Header Auth`) — son las que reemplazan a las variables de entorno que no funcionan (ver nota de la sección 2.3):
   - **"Anthropic x-api-key"**: Name = `x-api-key`, Value = tu clave de Anthropic (`sk-ant-...`).
   - **"Evolution apikey"**: Name = `apikey`, Value = tu `AUTHENTICATION_API_KEY` de Evolution.
   - Asigná la credencial de Anthropic al nodo **Claude API**.
   - Asigná la credencial de Evolution a los nodos que llaman a Evolution: **Notificar audio recibido**, **Enviar WhatsApp**, **Notificar escalamiento**, **Confirmar comando**, **Notificar comprobante recibido**, **Notificar falla Claude**, **Notificar falla envio**.
4. El workflow trae `http://bot_evolution:8080` ya cargado como URL de Evolution en esos mismos nodos (no es secreto, es el hostname interno de Docker — no hace falta tocarlo salvo que hayas nombrado distinto al servicio).
5. **Activa** el workflow (switch arriba a la derecha / botón "Publish").
6. Copia la **URL de producción** del nodo Webhook. Debería ser:
   `https://n8n.productoscapilarespg.com/webhook/whatsapp`
7. Importá también `n8n-workflow-monitor-whatsapp.json` (mismo repo) — es un workflow aparte que chequea cada 15 min si el WhatsApp sigue conectado y avisa al grupo si se cae. Asignale las mismas credenciales de Postgres y Header Auth "Evolution apikey" a sus nodos, reemplazá el placeholder del JID del grupo (ver 4.1) y activalo.
8. Importá también `n8n-workflow-analisis-conversaciones.json` (mismo repo) — genera un reporte semanal con IA de por qué no se cierran algunas ventas. Ver sección 4.3 para el detalle. Asignale las mismas tres credenciales (Postgres, Header Auth "Anthropic x-api-key" en el nodo **Analizar con Claude**, Header Auth "Evolution apikey" en **Enviar reporte** y **Notificar falla analisis**), reemplazá el placeholder del JID (ver 4.1) y activalo.

### 4.1 Obtener el ID del grupo de WhatsApp del equipo (para las alertas) y cargarlo en el workflow

El bot necesita saber a qué grupo avisar. Ese grupo debe incluir al **número de WhatsApp del negocio** (el que vincules en el paso 3 de la sección 3) más Dolores y/o el dueño.

1. Crea (o usa uno existente) un grupo de WhatsApp con: el número del negocio + Dolores + dueño. También podés crearlo por API una vez vinculado el WhatsApp:
   ```bash
   curl -X POST "https://evo.productoscapilarespg.com/group/create/pg" \
     -H "Content-Type: application/json" \
     -H "apikey: TU_AUTHENTICATION_API_KEY" \
     -d '{"subject": "Biotina", "participants": ["549XXXXXXXXXX", "549YYYYYYYYYY"]}'
   ```
   (número completo sin `+` ni espacios: `549` + código de área + número, ej. `5491161558641`)
2. Para obtener el JID del grupo, lo más directo es listar los grupos de la instancia ya conectada:
   ```bash
   curl "https://evo.productoscapilarespg.com/group/fetchAllGroups/pg?getParticipants=false" \
     -H "apikey: TU_AUTHENTICATION_API_KEY"
   ```
   Buscá el grupo por su `subject` (nombre) y copiá su campo `id`, termina en `@g.us` (ej. `120363410624881924@g.us`). Si preferís el método manual: con el workflow activo, hacé que alguien escriba cualquier cosa en el grupo, andá a **Executions** en n8n, abrí la ejecución más reciente y mirá la salida del nodo **"Webhook Evolution"** → `data.key.remoteJid`.
3. **Cargá ese JID directamente en el workflow** (no como variable de entorno, ver nota de la sección 2.3). Abrí el workflow en n8n y reemplazá el texto `TU_GRUPO_JID_AQUI@g.us` por tu JID real en los **7 lugares** donde aparece:
   - Nodo **Filtrar y extraer** (Code): línea `const escalationGroup = 'TU_GRUPO_JID_AQUI@g.us';`
   - Nodo **Notificar audio recibido** (jsonBody)
   - Nodo **Notificar escalamiento** (jsonBody)
   - Nodo **Confirmar comando** (jsonBody)
   - Nodo **Notificar comprobante recibido** (jsonBody)
   - Nodo **Notificar falla Claude** (jsonBody)
   - Nodo **Notificar falla envio** (jsonBody)
   - Y 1 lugar más en `n8n-workflow-monitor-whatsapp.json`: nodo **Notificar cambio conexion** (jsonBody).
   - Y 2 lugares más en `n8n-workflow-analisis-conversaciones.json`: nodos **Enviar reporte** y **Notificar falla analisis** (jsonBody).
4. Guardá el workflow (queda guardado automáticamente al activarlo/editarlo, o con el botón de guardar).

> El bot **nunca responde dentro de ese grupo ni procesa mensajes que lleguen ahí como si fueran de un cliente** — el filtro ignora todos los mensajes de grupos, salvo los comandos de administración `parar`/`seguir` descritos abajo. Fuera de eso, solo lo usa para *enviar* avisos hacia afuera.

### 4.2 Pausar y reanudar el bot manualmente

El bot se puede pausar/reanudar escribiendo un comando en el **grupo de escalamiento del equipo** (el mismo JID que cargaste en la sección 4.1). El cliente nunca ve esto, es un comando interno. Hay dos modos:

**Global (todos los clientes):**
- Escribir **`parar`** en el grupo → el bot deja de responderle a cualquier cliente (no procesa ni escala nada mientras está pausado) hasta nuevo aviso. Confirma: "⏸️ Bot pausado...".
- Escribir **`seguir`** en el grupo → el bot vuelve a responder normalmente. Confirma: "▶️ Bot reanudado...".

**Por cliente puntual (solo esa conversación, el resto sigue andando normal):**
- Escribir **`parar <número>`** (ej. `parar 1140377694`) → el bot deja de responderle SOLO a ese cliente. Útil cuando alguien del equipo (ej. Tomi) va a cerrar manualmente un envío puntual (zona norte, coordinación especial, etc.) y no querés que el bot siga contestándole mientras tanto.
- Escribir **`seguir <número>`** (ej. `seguir 1140377694`) → reanuda solo a ese cliente.
- El número podés escribirlo con o sin código de país/9 (`1140377694` o `5491140377694`, funciona igual) — internamente se usan los últimos 10 dígitos para identificar al cliente.

El estado se guarda en la tabla `chat_history` (filas especiales con `session_id = '__bot_status__'` para el global y `'__paused_customer__:<10 dígitos>'` para el pausado por cliente), no requiere ninguna variable de entorno nueva. El comando debe escribirse exactamente `parar` / `seguir`, opcionalmente seguido de un espacio y el número (sin texto adicional). Tiene que escribirlo alguien del grupo desde su propio WhatsApp (Dolores o el dueño) — si lo escribe el número del negocio (el que está vinculado al bot), el bot lo ignora, porque el workflow descarta todos sus propios mensajes salientes (`fromMe`).

> Se descartó usar **etiquetas de WhatsApp** para esto: Evolution API (y Baileys por debajo) tiene un bug conocido donde los eventos de etiquetas (`LABELS_ASSOCIATION`) no siempre llegan al webhook, así que no es confiable para algo crítico del negocio.

### 4.3 Análisis semanal de conversaciones (IA)

El workflow `n8n-workflow-analisis-conversaciones.json` lee automáticamente todas las conversaciones de los últimos 7 días guardadas en `chat_history`, se las pasa a Claude para que identifique patrones de por qué no se cerraron algunas ventas, y manda un resumen por WhatsApp al grupo del equipo.

- **Cuándo corre:** automáticamente todos los **lunes a las 9:00 (hora Argentina)**.
- **Disparo manual:** en cualquier momento podés pedir el análisis al toque haciendo un `GET` a `https://n8n.productoscapilarespg.com/webhook/run-analysis` (por ejemplo abriendo esa URL en el navegador). El reporte tarda entre 30 segundos y un par de minutos en llegar al grupo, según cuántas conversaciones haya.
- **Cómo detecta si una venta "se cerró":** se considera que una conversación llegó a la etapa de pago cuando el bot le pasó al cliente los datos de Mercado Pago; se considera "probablemente cerrada" si después de eso el cliente mandó una imagen (comprobante). Esto es una aproximación (el bot no tiene forma de saber si el pago realmente se acreditó) — para una confirmación 100% certera, siempre va a hacer falta que el equipo la valide manualmente.
- **Nada que cargar aparte:** usa las mismas credenciales de Postgres, Anthropic y Evolution ya creadas en la sección 4.

### Conectar Evolution → n8n (webhook)

En el Manager de Evolution, entra a la instancia `pg` → **Events → Webhook**:

- **URL:** `https://n8n.productoscapilarespg.com/webhook/whatsapp`
- **Enabled:** ✅
- **Events:** marca solo `MESSAGES_UPSERT`
- Guarda.

(O por API:)

```bash
curl -X POST "https://evo.productoscapilarespg.com/webhook/set/pg" \
  -H "Content-Type: application/json" \
  -H "apikey: TU_AUTHENTICATION_API_KEY" \
  -d '{
    "webhook": {
      "enabled": true,
      "url": "https://n8n.productoscapilarespg.com/webhook/whatsapp",
      "events": ["MESSAGES_UPSERT"]
    }
  }'
```

---

## 5. Probar

Envía un WhatsApp al número del negocio desde otro teléfono. Deberías ver:

1. En n8n → **Executions**: una ejecución nueva.
2. En WhatsApp: la respuesta del bot generada por Claude, siguiendo tu prompt.
3. El bot **recuerda la conversación** (guarda los últimos 20 mensajes por cliente en Postgres).

### Si algo falla

| Síntoma | Revisar |
|---|---|
| No llega nada a n8n | Webhook de Evolution: URL exacta y evento `MESSAGES_UPSERT` activado. Workflow **activado** en n8n. |
| Error `access to env vars denied` en cualquier nodo | Quedó una referencia a `$env.ALGO` sin migrar — no funciona en esta versión de n8n (task runner aislado). Ver sección 2.3 y 4: hay que usar credenciales o valores hardcodeados en el nodo, no variables de entorno. |
| Error 401 en el nodo Claude API | Revisá la credencial **Header Auth "Anthropic x-api-key"** (nombre de header `x-api-key`, valor tu clave real) asignada al nodo. |
| Error en nodos Postgres | Credencial de Postgres en n8n (host `bot_postgres`, base `n8n`, usuario/contraseña correctos) asignada a los 8 nodos Postgres, y que exista la tabla `chat_history`. Si dice "password authentication failed", la contraseña cambió — recreá la credencial. |
| Claude responde pero no llega al cliente | Credencial **Header Auth "Evolution apikey"** asignada a los nodos de Evolution; nombre de instancia correcto (`pg`); URL `http://bot_evolution:8080` correcta en esos nodos. |
| No llegan los avisos de escalamiento al grupo, o el comando `parar`/`seguir` no responde | El placeholder `TU_GRUPO_JID_AQUI@g.us` no se reemplazó por el JID real en los 7 nodos (sección 4.1), o el número del negocio no es miembro del grupo. |
| WhatsApp desconectado | Manager de Evolution → reconectar/escanear QR de nuevo. |
| No llega el reporte semanal de análisis | Workflow `n8n-workflow-analisis-conversaciones.json` activado, JID reemplazado en sus 2 nodos, y credenciales asignadas (Postgres, Anthropic, Evolution) igual que el workflow principal. |

---

## 6. Modelo de Claude y costos

El workflow usa **`claude-opus-4-8`** (el modelo recomendado por defecto: respuestas de máxima calidad para ventas). Costo aproximado: $5/$25 por millón de tokens (entrada/salida) — con el caché de prompt activado (ya incluido en el workflow), el prompt del sistema se cobra ~10x más barato a partir del segundo mensaje.

Si más adelante quieres bajar costos, puedes cambiar el modelo en el nodo **Claude API** del workflow:

| Modelo | ID | Cuándo usarlo |
|---|---|---|
| Claude Opus 4.8 | `claude-opus-4-8` | Máxima calidad de venta/persuasión (default) |
| Claude Sonnet 5 | `claude-sonnet-5` | Muy buena calidad, ~40% del costo de Opus |
| Claude Haiku 4.5 | `claude-haiku-4-5` | Respuestas simples y rápidas, el más barato |

---

## 7. Seguridad — checklist final

- [x] Rotar la contraseña de root del VPS (y idealmente usar llaves SSH + `PasswordAuthentication no`).
- [x] Puerto 3000 restringido solo a la IP/red del administrador (`ufw allow from TU_IP to any port 3000 proto tcp` en vez de dejarlo abierto a "Anywhere").
- [ ] `AUTHENTICATION_API_KEY` de Evolution y `N8N_ENCRYPTION_KEY` largas y aleatorias.
- [ ] La API key de Anthropic solo vive en la credencial Header Auth de n8n (nunca en el repo ni en chats).
- [x] Backups: en DigitalOcean activa los snapshots semanales del droplet.
