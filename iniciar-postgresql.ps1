# Script rápido para iniciar PostgreSQL
Write-Host "=== INICIANDO POSTGRESQL ===" -ForegroundColor Cyan

# Tentar encontrar e iniciar o serviço PostgreSQL
$services = Get-Service | Where-Object { $_.Name -like "*postgres*" }

if ($services) {
    foreach ($svc in $services) {
        Write-Host "Servico encontrado: $($svc.DisplayName)" -ForegroundColor Green
        
        if ($svc.Status -eq 'Running') {
            Write-Host "✅ PostgreSQL ja esta rodando!" -ForegroundColor Green
        } else {
            Write-Host "Iniciando servico..." -ForegroundColor Yellow
            try {
                Start-Service $svc.Name
                Start-Sleep -Seconds 3
                Write-Host "✅ Servico iniciado com sucesso!" -ForegroundColor Green
            } catch {
                Write-Host "❌ Erro: $_" -ForegroundColor Red
                Write-Host "Tente executar como Administrador!" -ForegroundColor Yellow
            }
        }
    }
} else {
    Write-Host "❌ Nenhum servico PostgreSQL encontrado." -ForegroundColor Red
    Write-Host ""
    Write-Host "Tente:" -ForegroundColor Yellow
    Write-Host "1. Abrir pgAdmin (pode demorar na primeira vez)" -ForegroundColor White
    Write-Host "2. OU iniciar manualmente via Servicos do Windows" -ForegroundColor White
    Write-Host "   (Win+R > services.msc > procurar por PostgreSQL)" -ForegroundColor Gray
}

# Verificar se está acessível
Start-Sleep -Seconds 2
Write-Host ""
Write-Host "Verificando conexao..." -ForegroundColor Yellow
$port = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue -InformationLevel Quiet

if ($port) {
    Write-Host "✅ PostgreSQL esta acessivel na porta 5432!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Agora execute:" -ForegroundColor Cyan
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  npm run prisma:migrate" -ForegroundColor White
} else {
    Write-Host "⚠️  PostgreSQL ainda nao esta acessivel." -ForegroundColor Yellow
    Write-Host "Aguarde alguns segundos e tente novamente." -ForegroundColor Yellow
}


