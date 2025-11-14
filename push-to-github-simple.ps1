# Script simples para push no GitHub
# Execute: .\push-to-github-simple.ps1

Write-Host "PUSH PARA GITHUB - VIGILANT" -ForegroundColor Cyan
Write-Host ""

# Verificar Git
$gitCheck = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCheck) {
    Write-Host "ERRO: Git nao esta instalado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale o Git:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "2. Baixe e instale o Git for Windows" -ForegroundColor White
    Write-Host "3. Reinicie o PowerShell e tente novamente" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou instale via winget:" -ForegroundColor Yellow
    Write-Host "   winget install Git.Git" -ForegroundColor Gray
    exit 1
}

Write-Host "Git encontrado!" -ForegroundColor Green
Write-Host ""

# Inicializar git se necessario
if (-not (Test-Path ".git")) {
    Write-Host "Inicializando repositorio..." -ForegroundColor Yellow
    git init
}

# Configurar remote
Write-Host "Configurando remote..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/LucasMissiba/Vigilant-DP.git

# Adicionar arquivos
Write-Host "Adicionando arquivos..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Fazendo commit..." -ForegroundColor Yellow
git commit -m "Initial commit: VIGILANT - Proactive Journey Management Platform"

# Push
Write-Host "Fazendo push..." -ForegroundColor Yellow
Write-Host "Se pedir credenciais, use seu usuario GitHub e um Personal Access Token" -ForegroundColor Gray
Write-Host ""

git push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tentando branch master..." -ForegroundColor Yellow
    git push -u origin master
}

Write-Host ""
Write-Host "Concluido!" -ForegroundColor Green

