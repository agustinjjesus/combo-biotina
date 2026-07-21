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

# Permite usar $env en el workflow (para las claves de API)
N8N_BLOCK_ENV_ACCESS_IN_NODE=false

# --- Claves que usa el workflow del bot ---
ANTHROPIC_API_KEY=sk-ant-TU_CLAVE_DE_ANTHROPIC
EVOLUTION_URL=http://bot_evolution:8080
EVOLUTION_API_KEY=LA_MISMA_CLAVE_QUE_PONGAS_EN_EVOLUTION

# Grupo de WhatsApp del equipo (Dolores/dueño) donde el bot avisa cuando
# hay que escalar una conversación. Ver sección 4.1 para obtener este ID.
# Podés dejarlo como PENDIENTE por ahora y completarlo más adelante.
ESCALATION_GROUP_JID=PENDIENTE
```

> Genera valores aleatorios con: `openssl rand -hex 24`

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
   - Asígnala a los dos nodos de Postgres del workflow (`Cargar historial` y `Guardar conversación`).
3. **Activa** el workflow (switch arriba a la derecha / botón "Publish").
4. Copia la **URL de producción** del nodo Webhook. Debería ser:
   `https://n8n.productoscapilarespg.com/webhook/whatsapp`

### 4.1 Obtener el ID del grupo de WhatsApp del equipo (para las alertas)

El bot necesita saber a qué grupo avisar. Ese grupo debe incluir al **número de WhatsApp del negocio** (el que vincules en el paso 3) más Dolores y/o el dueño.

1. Crea (o usa uno existente) un grupo de WhatsApp con: el número del negocio + Dolores + dueño.
2. Con el workflow ya **activado** en n8n, pide que alguien escriba cualquier mensaje en ese grupo.
3. En n8n, ve a la pestaña **Executions** (arriba, al lado de "Editor") → abre la ejecución más reciente.
4. Haz clic en el nodo **"Webhook Evolution"** y mira su salida (Output) → busca el campo `data.key.remoteJid`. Va a ser un texto que termina en `@g.us` (por ejemplo `120363012345678901@g.us`).
5. Copia ese valor completo.
6. Ve al servicio `n8n` en Easypanel → pestaña **Entorno** → reemplaza la línea `ESCALATION_GROUP_JID=PENDIENTE` por:
   ```
   ESCALATION_GROUP_JID=120363012345678901@g.us
   ```
   (con el valor real que copiaste)
7. Dale **Implementar/Deploy** de nuevo para que tome el cambio.

> El bot **nunca responde dentro de ese grupo ni procesa mensajes que lleguen ahí** — el filtro ignora todos los mensajes de grupos. Solo lo usa para *enviar* avisos hacia afuera.

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
| Error 401 en el nodo Claude API | `ANTHROPIC_API_KEY` mal puesta en el Environment de n8n (redeploy después de cambiarla). |
| Error en nodos Postgres | Credencial de Postgres en n8n (host `bot_postgres`, base `n8n`) y que exista la tabla `chat_history`. |
| Claude responde pero no llega al cliente | `EVOLUTION_URL` y `EVOLUTION_API_KEY` en el Environment de n8n; nombre de instancia correcto. |
| No llegan los avisos de escalamiento al grupo | `ESCALATION_GROUP_JID` mal puesto (debe terminar en `@g.us`) o el número del negocio no es miembro del grupo. Ver sección 4.1. |
| WhatsApp desconectado | Manager de Evolution → reconectar/escanear QR de nuevo. |

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

- [ ] Rotar la contraseña de root del VPS (y idealmente usar llaves SSH + `PasswordAuthentication no`).
- [ ] Puerto 3000 cerrado (`ufw delete allow 3000/tcp`) una vez que el panel tenga dominio.
- [ ] `AUTHENTICATION_API_KEY` de Evolution y `N8N_ENCRYPTION_KEY` largas y aleatorias.
- [ ] La API key de Anthropic solo vive en el Environment de n8n (nunca en el repo ni en chats).
- [ ] Backups: en DigitalOcean activa los snapshots semanales del droplet.
