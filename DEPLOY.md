# 🚀 Deploy VIGILANT - Ubuntu 24.04 LTS

## 📋 Pré-requisitos

- Servidor Ubuntu 24.04 LTS com acesso SSH
- Usuário com permissões sudo
- Domínio (opcional)

## ⚡ Deploy Rápido

### Passo 1: Preparar Servidor

Execute no servidor Ubuntu:

```bash
sudo bash deploy-ubuntu-24.04.sh
```

Este script instala:
- Node.js 20.x
- PostgreSQL
- PM2
- Nginx
- Firewall (UFW)

### Passo 2: Upload dos Arquivos

**Opção A: Via SCP (Windows PowerShell)**

```powershell
.\upload-to-server.ps1 -ServerIP "seu-ip" -Username "root"
```

**Opção B: Via Git**

```bash
cd /var/www/vigilant
git clone seu-repositorio.git .
```

**Opção C: Via WinSCP**

Faça upload manual para `/var/www/vigilant`

### Passo 3: Configurar e Iniciar

No servidor:

```bash
cd /var/www/vigilant
bash deploy-final.sh
```

## 🔧 Configuração Manual

### 1. Variáveis de Ambiente

**backend/.env:**
```env
DATABASE_URL="postgresql://postgres:@Lucassamya12@localhost:5432/vigilant?schema=public"
NODE_ENV=production
PORT=3001
API_PREFIX=api/v1
JWT_SECRET=sua-chave-secreta-32-caracteres
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://seu-dominio.com.br
```

**frontend/.env:**
```env
VITE_API_URL=https://seu-dominio.com.br/api/v1
```

### 2. Nginx

Edite `/etc/nginx/sites-available/vigilant`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com.br
```

## 📊 Comandos Úteis

```bash
# PM2
pm2 status
pm2 logs
pm2 restart all
pm2 stop all

# Nginx
sudo systemctl status nginx
sudo nginx -t
sudo systemctl reload nginx

# PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql vigilant

# Logs
pm2 logs vigilant-backend
pm2 logs vigilant-frontend
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Atualizar Aplicação

```bash
cd /var/www/vigilant
git pull
npm install
cd backend && npm install && npm run build && cd ..
cd frontend && npm install && npm run build && cd ..
cd backend && npx prisma migrate deploy && cd ..
pm2 restart all
```

## ✅ Checklist

- [ ] Servidor Ubuntu 24.04 configurado
- [ ] Script `deploy-ubuntu-24.04.sh` executado
- [ ] Arquivos enviados para `/var/www/vigilant`
- [ ] Script `deploy-final.sh` executado
- [ ] Variáveis de ambiente configuradas
- [ ] Nginx configurado e funcionando
- [ ] SSL configurado (opcional)
- [ ] PM2 rodando (`pm2 status`)
- [ ] Aplicação acessível via navegador

## 🆘 Troubleshooting

**Backend não inicia:**
```bash
pm2 logs vigilant-backend
cd backend && npm run build
```

**Frontend não carrega:**
```bash
pm2 logs vigilant-frontend
cd frontend && npm run build
```

**Nginx erro 502:**
```bash
sudo nginx -t
sudo systemctl status nginx
pm2 status  # Verificar se apps estão rodando
```

**Banco de dados:**
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"  # Listar bancos
```

