@echo off
echo ========================================
echo   VIGILANT - Script de Setup
echo ========================================
echo.

echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado. Instale Node.js primeiro.
    pause
    exit /b 1
)
echo Node.js encontrado!
echo.

echo [2/4] Instalando dependencias...
cd backend
call npm install
cd ..\frontend
call npm install
cd ..
echo Dependencias instaladas!
echo.

echo [3/4] Configurando ambiente...
if not exist backend\.env (
    copy backend\env.example backend\.env
    echo Arquivo .env criado no backend
)
echo Ambiente configurado!
echo.

echo [4/4] Gerando Prisma Client...
cd backend
call npm run prisma:generate
cd ..
echo Prisma Client gerado!
echo.

echo ========================================
echo   CONFIGURACAO NECESSARIA:
echo ========================================
echo.
echo 1. Instale e configure PostgreSQL
echo 2. Crie um banco de dados chamado 'vigilant'
echo 3. Edite backend\.env e configure DATABASE_URL:
echo    DATABASE_URL="postgresql://usuario:senha@localhost:5432/vigilant?schema=public"
echo 4. Execute: cd backend ^&^& npm run prisma:migrate
echo.
echo ========================================
echo   Para iniciar os servidores:
echo ========================================
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   npm run start:dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm run dev
echo.
pause



