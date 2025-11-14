#!/bin/bash

# Script de Deploy Automatizado - VIGILANT no Ubuntu 24.04 LTS
# Execute com: sudo bash deploy-ubuntu-24.04.sh

set -e  # Parar em caso de erro

echo "=========================================="
echo "  DEPLOY VIGILANT - Ubuntu 24.04 LTS"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor, execute como root ou com sudo"
    exit 1
fi

# Passo 1: Atualizar sistema
print_info "Atualizando sistema..."
apt update && apt upgrade -y
print_success "Sistema atualizado"

# Passo 2: Instalar dependências básicas
print_info "Instalando dependências básicas..."
apt install -y curl wget git build-essential software-properties-common
print_success "Dependências instaladas"

# Passo 3: Instalar Node.js 20.x
print_info "Instalando Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
print_success "Node.js instalado: $(node --version)"

# Passo 4: Instalar PostgreSQL
print_info "Instalando PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
print_success "PostgreSQL instalado"

# Passo 5: Configurar PostgreSQL
print_info "Configurando PostgreSQL..."
sudo -u postgres psql <<EOF
ALTER USER postgres PASSWORD '@Lucassamya12';
CREATE DATABASE vigilant;
\q
EOF
print_success "PostgreSQL configurado"

# Passo 6: Instalar PM2
print_info "Instalando PM2..."
npm install -g pm2
print_success "PM2 instalado"

# Passo 7: Instalar Nginx
print_info "Instalando Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
print_success "Nginx instalado"

# Passo 8: Criar usuário para aplicação (se não existir)
if ! id "vigilant" &>/dev/null; then
    print_info "Criando usuário 'vigilant'..."
    useradd -m -s /bin/bash vigilant
    print_success "Usuário 'vigilant' criado"
else
    print_info "Usuário 'vigilant' já existe"
fi

# Passo 9: Criar diretório da aplicação
print_info "Criando diretório da aplicação..."
mkdir -p /var/www/vigilant
chown vigilant:vigilant /var/www/vigilant
print_success "Diretório criado: /var/www/vigilant"

# Passo 10: Configurar Nginx
print_info "Configurando Nginx..."
cat > /etc/nginx/sites-available/vigilant <<'NGINX_CONFIG'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_CONFIG

ln -sf /etc/nginx/sites-available/vigilant /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
print_success "Nginx configurado"

# Passo 11: Configurar Firewall
print_info "Configurando firewall..."
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
print_success "Firewall configurado"

# Resumo
echo ""
echo "=========================================="
print_success "INSTALAÇÃO CONCLUÍDA!"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo "1. Faça upload dos arquivos da aplicação para /var/www/vigilant"
echo "2. Configure o arquivo backend/.env com suas variáveis"
echo "3. Execute as migrações: cd backend && npx prisma migrate deploy"
echo "4. Build do frontend: cd frontend && npm run build"
echo "5. Configure PM2 com: pm2 start ecosystem.config.js"
echo ""
echo "Para mais detalhes, consulte: DEPLOY_UBUNTU_24.04.md"
echo ""


