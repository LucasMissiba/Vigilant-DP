#!/bin/bash

# Script Final de Deploy - Execute APÓS fazer upload dos arquivos
# Execute com: bash deploy-final.sh

set -e

echo "=========================================="
echo "  CONFIGURAÇÃO FINAL DO VIGILANT"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    print_info "Por favor, execute este script no diretório /var/www/vigilant"
    exit 1
fi

# Passo 1: Instalar dependências
print_info "Instalando dependências..."
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
print_success "Dependências instaladas"

# Passo 2: Configurar variáveis de ambiente
print_info "Configurando variáveis de ambiente..."
if [ ! -f "backend/.env" ]; then
    print_info "Criando backend/.env..."
    cat > backend/.env <<EOF
DATABASE_URL="postgresql://postgres:@Lucassamya12@localhost:5432/vigilant?schema=public"
NODE_ENV=production
PORT=3001
API_PREFIX=api/v1
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h
TWO_FACTOR_APP_NAME=VIGILANT
FRONTEND_URL=http://localhost
EOF
    print_success "Arquivo backend/.env criado"
else
    print_info "Arquivo backend/.env já existe"
fi

if [ ! -f "frontend/.env" ]; then
    print_info "Criando frontend/.env..."
    cat > frontend/.env <<EOF
VITE_API_URL=http://localhost/api/v1
EOF
    print_success "Arquivo frontend/.env criado"
else
    print_info "Arquivo frontend/.env já existe"
fi

# Passo 3: Executar migrações
print_info "Executando migrações do banco de dados..."
cd backend
npx prisma generate
npx prisma migrate deploy
cd ..
print_success "Migrações executadas"

# Passo 4: Build do backend
print_info "Fazendo build do backend..."
cd backend
npm run build
cd ..
print_success "Backend buildado"

# Passo 5: Build do frontend
print_info "Fazendo build do frontend..."
cd frontend
npm run build
cd ..
print_success "Frontend buildado"

# Passo 6: Criar diretório de logs
print_info "Criando diretório de logs..."
mkdir -p logs
print_success "Diretório de logs criado"

# Passo 7: Iniciar com PM2
print_info "Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js
pm2 save
print_success "Aplicação iniciada com PM2"

# Resumo
echo ""
echo "=========================================="
print_success "DEPLOY CONCLUÍDO!"
echo "=========================================="
echo ""
echo "Comandos úteis:"
echo "  pm2 status          - Ver status"
echo "  pm2 logs            - Ver logs"
echo "  pm2 restart all     - Reiniciar"
echo "  pm2 stop all        - Parar"
echo ""
echo "Acesse: http://seu-ip-ou-dominio"
echo ""

