# Script para configurar o banco de dados VIGILANT
# Execute este script no PowerShell como Administrador se necessário

Write-Host "=== CONFIGURACAO DO BANCO DE DADOS VIGILANT ===" -ForegroundColor Cyan
Write-Host ""

# Solicitar credenciais
$dbUser = Read-Host "Digite o usuario do PostgreSQL (padrao: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }

$dbPassword = Read-Host "Digite a senha do PostgreSQL" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

Write-Host ""
Write-Host "Configurando arquivo .env..." -ForegroundColor Yellow

# Atualizar .env
$envFile = "backend\.env"
$envContent = Get-Content $envFile -Raw
$newDbUrl = "postgresql://${dbUser}:${dbPasswordPlain}@localhost:5432/vigilant?schema=public"
$envContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$newDbUrl`""
Set-Content -Path $envFile -Value $envContent -NoNewline

Write-Host "Arquivo .env atualizado!" -ForegroundColor Green
Write-Host ""

# Tentar criar banco e executar migrações
Write-Host "Criando banco de dados e executando migracoes..." -ForegroundColor Yellow
Set-Location backend
npm run prisma:migrate -- --name init

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== SUCESSO! ===" -ForegroundColor Green
    Write-Host "Banco de dados criado e migracoes executadas!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "=== ERRO ===" -ForegroundColor Red
    Write-Host "Verifique se:" -ForegroundColor Yellow
    Write-Host "1. O PostgreSQL esta rodando" -ForegroundColor White
    Write-Host "2. As credenciais estao corretas" -ForegroundColor White
    Write-Host "3. O usuario tem permissao para criar bancos" -ForegroundColor White
}

Set-Location ..



