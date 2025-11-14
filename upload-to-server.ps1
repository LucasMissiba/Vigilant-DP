# Script PowerShell para fazer upload dos arquivos para o servidor Ubuntu
# Execute com: .\upload-to-server.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$Username = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$SSHKey = ""
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  UPLOAD VIGILANT PARA SERVIDOR" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o WinSCP está disponível ou usar SCP nativo
$useSCP = $true

# Diretórios e arquivos para excluir
$excludePatterns = @(
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    "*.log",
    ".env",
    ".env.local",
    "coverage",
    ".vscode",
    ".idea"
)

Write-Host "📦 Preparando arquivos para upload..." -ForegroundColor Yellow

# Criar arquivo temporário com lista de exclusões
$excludeFile = "exclude-list.txt"
$excludePatterns | Out-File -FilePath $excludeFile -Encoding UTF8

Write-Host ""
Write-Host "🚀 Iniciando upload para $Username@$ServerIP..." -ForegroundColor Green
Write-Host ""

# Usar SCP se disponível (Windows 10+ tem OpenSSH)
try {
    $scpPath = Get-Command scp -ErrorAction Stop
    
    Write-Host "Usando SCP nativo do Windows..." -ForegroundColor Yellow
    
    # Criar comando SCP
    $scpCommand = "scp"
    $scpArgs = @(
        "-r",
        "-o", "StrictHostKeyChecking=no"
    )
    
    if ($SSHKey) {
        $scpArgs += "-i", $SSHKey
    }
    
    $scpArgs += "."
    $scpArgs += "$Username@${ServerIP}:/var/www/vigilant/"
    
    Write-Host "Executando: $scpCommand $($scpArgs -join ' ')" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  ATENÇÃO: Este processo pode demorar alguns minutos..." -ForegroundColor Yellow
    Write-Host ""
    
    & $scpPath $scpArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Upload concluído com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Próximos passos:" -ForegroundColor Cyan
        Write-Host "1. Conecte-se ao servidor: ssh $Username@$ServerIP" -ForegroundColor White
        Write-Host "2. Execute: cd /var/www/vigilant && bash deploy-final.sh" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Erro no upload. Verifique a conexão e tente novamente." -ForegroundColor Red
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ SCP não encontrado. Use uma das opções abaixo:" -ForegroundColor Red
    Write-Host ""
    Write-Host "OPÇÃO 1: Instalar OpenSSH no Windows" -ForegroundColor Yellow
    Write-Host "  - Abra 'Configurações' > 'Aplicativos' > 'Recursos Opcionais'" -ForegroundColor White
    Write-Host "  - Instale 'Cliente OpenSSH'" -ForegroundColor White
    Write-Host ""
    Write-Host "OPÇÃO 2: Usar WinSCP (GUI)" -ForegroundColor Yellow
    Write-Host "  - Baixe: https://winscp.net" -ForegroundColor White
    Write-Host "  - Conecte-se ao servidor" -ForegroundColor White
    Write-Host "  - Faça upload para: /var/www/vigilant" -ForegroundColor White
    Write-Host ""
    Write-Host "OPÇÃO 3: Usar Git (Recomendado)" -ForegroundColor Yellow
    Write-Host "  - Faça commit e push para um repositório Git" -ForegroundColor White
    Write-Host "  - No servidor: git clone seu-repositorio /var/www/vigilant" -ForegroundColor White
    Write-Host ""
}

# Limpar arquivo temporário
if (Test-Path $excludeFile) {
    Remove-Item $excludeFile
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

