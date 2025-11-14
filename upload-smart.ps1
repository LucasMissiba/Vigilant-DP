# Script PowerShell para fazer upload INTELIGENTE (sem node_modules)
# Execute com: .\upload-smart.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP = "147.79.83.189",
    
    [Parameter(Mandatory=$false)]
    [string]$Username = "root"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  UPLOAD INTELIGENTE - VIGILANT" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = "C:\Users\lucas.missiba\Desktop\Codigos\Vigilant"

if (-not (Test-Path $projectPath)) {
    Write-Host "❌ Diretório não encontrado: $projectPath" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Preparando upload (SEM node_modules)..." -ForegroundColor Yellow
Write-Host ""

# Criar arquivo temporário de exclusões
$excludeFile = "$env:TEMP\scp-exclude.txt"
@(
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
    ".idea",
    "*.map",
    ".DS_Store"
) | Out-File -FilePath $excludeFile -Encoding UTF8

Write-Host "🚀 Fazendo upload dos arquivos essenciais..." -ForegroundColor Green
Write-Host "⚠️  Isso pode levar alguns minutos..." -ForegroundColor Yellow
Write-Host ""

# Criar diretório no servidor primeiro
Write-Host "Criando diretório no servidor..." -ForegroundColor Gray
ssh ${Username}@${ServerIP} "mkdir -p /var/www/vigilant"

# Fazer upload usando tar + ssh (mais rápido)
Write-Host "Compactando e enviando arquivos..." -ForegroundColor Gray

# Usar tar para compactar e enviar via SSH (mais eficiente)
cd $projectPath

# Criar arquivo tar localmente primeiro (sem node_modules)
Write-Host "Criando arquivo compactado..." -ForegroundColor Gray
tar --exclude-from=$excludeFile --exclude='node_modules' -czf "$env:TEMP\vigilant-upload.tar.gz" .

# Enviar arquivo compactado
Write-Host "Enviando arquivo compactado..." -ForegroundColor Gray
scp "$env:TEMP\vigilant-upload.tar.gz" ${Username}@${ServerIP}:/tmp/

# Extrair no servidor
Write-Host "Extraindo arquivos no servidor..." -ForegroundColor Gray
ssh ${Username}@${ServerIP} "cd /var/www/vigilant && tar -xzf /tmp/vigilant-upload.tar.gz && rm /tmp/vigilant-upload.tar.gz"

# Limpar arquivo temporário local
Remove-Item "$env:TEMP\vigilant-upload.tar.gz" -ErrorAction SilentlyContinue
Remove-Item $excludeFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Upload concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos no servidor:" -ForegroundColor Cyan
Write-Host "1. cd /var/www/vigilant" -ForegroundColor White
Write-Host "2. npm install" -ForegroundColor White
Write-Host "3. cd backend && npm install && cd .." -ForegroundColor White
Write-Host "4. cd frontend && npm install && cd .." -ForegroundColor White
Write-Host ""

