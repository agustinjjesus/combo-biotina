#!/bin/bash
# =============================================================
# Setup VPS - Bot WhatsApp con IA (Productos Capilares PG)
# Instala Docker + Easypanel en Ubuntu 24.04 (DigitalOcean)
#
# Uso (conectado por SSH como root):
#   curl -fsSL https://raw.githubusercontent.com/agustinjjesus/combo-biotina/main/bot-whatsapp/setup-vps.sh -o setup-vps.sh
#   bash setup-vps.sh
# =============================================================
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: ejecuta este script como root."
  exit 1
fi

echo "==> [1/5] Actualizando el sistema..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y

echo "==> [2/5] Instalando utilidades basicas y fail2ban..."
apt-get install -y curl wget git ufw fail2ban htop
systemctl enable --now fail2ban

echo "==> [3/5] Configurando firewall (UFW)..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (Easypanel / Let's Encrypt)
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Easypanel (setup inicial; puedes cerrarlo despues)
ufw --force enable

echo "==> [4/5] Instalando Docker..."
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
else
  echo "    Docker ya esta instalado, saltando."
fi

echo "==> [5/5] Instalando Easypanel..."
docker run --rm -it \
  -v /etc/easypanel:/etc/easypanel \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  easypanel/easypanel setup

IP=$(curl -s -4 ifconfig.me || hostname -I | awk '{print $1}')

cat <<EOF

=============================================================
 LISTO. Easypanel quedo instalado.
=============================================================

 Proximos pasos:

 1. Abre en tu navegador:  http://$IP:3000
    y crea tu usuario administrador de Easypanel.

 2. En Easypanel > Settings, configura el dominio del panel
    (ej: panel.productoscapilarespg.com) para tener HTTPS.

 3. Sigue la guia GUIA-INSTALACION.md para crear los
    servicios: PostgreSQL, Redis, n8n y Evolution API.

 Recomendacion de seguridad:
 - Crea llaves SSH y desactiva el login por contrasena:
     nano /etc/ssh/sshd_config   ->  PasswordAuthentication no
     systemctl restart ssh
 - Cuando el panel tenga dominio con HTTPS, cierra el puerto 3000:
     ufw delete allow 3000/tcp
=============================================================
EOF
