# Script para testar conexão com PostgreSQL
# Execute este script para descobrir o usuário correto

Write-Host "=== TESTANDO CONEXAO COM POSTGRESQL ===" -ForegroundColor Cyan
Write-Host ""

$senha = "@Lucasamya12"
$senhaEncoded = $senha -replace '@', '%40'

# Usuários comuns para testar
$usuarios = @("postgres", "lucas", "admin", "root")

Write-Host "Testando usuarios comuns..." -ForegroundColor Yellow
Write-Host ""

foreach ($usuario in $usuarios) {
    Write-Host "Testando usuario: $usuario" -ForegroundColor Cyan
    
    $dbUrl = "postgresql://${usuario}:${senhaEncoded}@localhost:5432/postgres?schema=public"
    
    # Atualizar .env temporariamente
    $envContent = Get-Content "backend\.env" -Raw
    $envContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$dbUrl`""
    Set-Content -Path "backend\.env" -Value $envContent -NoNewline
    
    # Tentar conectar
    Set-Location backend
    $result = npx prisma db execute --stdin 2>&1 <<< "SELECT 1;"
    Set-Location ..
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCESSO! Usuario correto: $usuario" -ForegroundColor Green
        Write-Host ""
        Write-Host "Atualizando DATABASE_URL para usar o banco 'vigilant'..." -ForegroundColor Yellow
        
        $dbUrlVigilant = "postgresql://${usuario}:${senhaEncoded}@localhost:5432/vigilant?schema=public"
        $envContent = Get-Content "backend\.env" -Raw
        $envContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$dbUrlVigilant`""
        Set-Content -Path "backend\.env" -Value $envContent -NoNewline
        
        Write-Host "Configuracao atualizada!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Agora execute: cd backend && npm run prisma:migrate" -ForegroundColor Cyan
        break
    } else {
        Write-Host "Falhou com usuario: $usuario" -ForegroundColor Red
    }
    Write-Host ""
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Nenhum usuario comum funcionou." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Por favor, informe:" -ForegroundColor Cyan
    $usuarioManual = Read-Host "Qual e o usuario do seu PostgreSQL?"
    
    $dbUrl = "postgresql://${usuarioManual}:${senhaEncoded}@localhost:5432/vigilant?schema=public"
    $envContent = Get-Content "backend\.env" -Raw
    $envContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$dbUrl`""
    Set-Content -Path "backend\.env" -Value $envContent -NoNewline
    
    Write-Host "Configurado com usuario: $usuarioManual" -ForegroundColor Green
    Write-Host "Execute: cd backend && npm run prisma:migrate" -ForegroundColor Cyan
}



