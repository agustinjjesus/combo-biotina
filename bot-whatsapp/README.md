# Bot de WhatsApp con IA — Productos Capilares PG

Bot que responde mensajes de clientes por WhatsApp usando Claude (Anthropic), corriendo en un VPS propio con Easypanel.

## Arquitectura

```
Cliente (WhatsApp)
   │
   ▼
Evolution API  ──webhook──▶  n8n (workflow)
   ▲                            │
   │                            ├─▶ PostgreSQL (historial por cliente)
   └────respuesta───────────────┴─▶ Claude API (genera la respuesta)

Todo corre en Easypanel (Docker) sobre el VPS. Redis lo usa Evolution API como caché.
```

## Archivos

| Archivo | Qué es |
|---|---|
| `setup-vps.sh` | Script de instalación del VPS (Docker + Easypanel + firewall) |
| `GUIA-INSTALACION.md` | Guía paso a paso completa: DNS, servicios, WhatsApp, workflow |
| `n8n-workflow-whatsapp-claude.json` | Workflow de n8n listo para importar |

## Inicio rápido

1. Ejecuta `setup-vps.sh` en el VPS (ver guía, sección 1).
2. Sigue `GUIA-INSTALACION.md` secciones 2 a 4.
3. Pega tu prompt de ventas en el nodo indicado del workflow y activa.
