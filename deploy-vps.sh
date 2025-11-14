#!/bin/bash

# Script de Deploy Automático VIGILANT em VPS Ubuntu
# Execute: bash deploy-vps.sh

set -e

echo "=========================================="
echo "  VIGILANT - Deploy em VPS Ubuntu"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se é root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Por favor, execute como root ou com sudo${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/7] Atualizando sistema...${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}[2/7] Instalando Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

echo -e "${YELLOW}[3/7] Instalando PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

echo -e "${YELLOW}[4/7] Configurando PostgreSQL...${NC}"
sudo -u postgres psql <<EOF
CREATE DATABASE vigilant;
CREATE USER vigilant_user WITH PASSWORD '@Lucasamya12';
GRANT ALL PRIVILEGES ON DATABASE vigilant TO vigilant_user;
\q
EOF

echo -e "${YELLOW}[5/7] Instalando Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo -e "${YELLOW}[6/7] Instalando PM2...${NC}"
npm install -g pm2

echo -e "${YELLOW}[7/7] Criando diretórios...${NC}"
mkdir -p /var/www/vigilant
chown -R $SUDO_USER:$SUDO_USER /var/www/vigilant

echo ""
echo -e "${GREEN}=========================================="
echo "  Instalação Base Concluída!"
echo "==========================================${NC}"
echo ""
echo "Próximos passos:"
echo "1. Envie o código para /var/www/vigilant/"
echo "2. Configure o arquivo backend/.env"
echo "3. Execute: cd backend && npm install && npm run build"
echo "4. Execute: pm2 start dist/main.js --name vigilant-backend"
echo "5. Configure Nginx (veja VPS_UBUNTU_DEPLOY.md)"
echo ""


