# Script PowerShell para fazer push para o GitHub
# Execute com: .\push-to-github.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  PUSH PARA GITHUB - VIGILANT" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$repoUrl = "https://github.com/LucasMissiba/Vigilant-DP.git"
$projectPath = "C:\Users\lucas.missiba\Desktop\Codigos\Vigilant"

# Verificar se esta no diretorio correto
if (-not (Test-Path "$projectPath\package.json")) {
    Write-Host "Erro: Execute este script na pasta do projeto Vigilant" -ForegroundColor Red
    Write-Host "   Diretorio atual: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Set-Location $projectPath

# Verificar se git esta instalado
try {
    $gitVersion = git --version
    Write-Host "Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git nao encontrado. Instale o Git primeiro:" -ForegroundColor Red
    Write-Host "   https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Verificar se ja e um repositorio git
if (-not (Test-Path ".git")) {
    Write-Host "Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
    Write-Host "Repositorio inicializado" -ForegroundColor Green
} else {
    Write-Host "Repositorio Git ja existe" -ForegroundColor Green
}

# Verificar remote
try {
    $null = git remote get-url origin 2>$null
    Write-Host "Atualizando remote origin..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
} catch {
    Write-Host "Adicionando remote origin..." -ForegroundColor Yellow
    git remote add origin $repoUrl
}

Write-Host "Remote configurado: $repoUrl" -ForegroundColor Green
Write-Host ""

# Verificar status
Write-Host "Verificando status do repositorio..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "Adicionando arquivos..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Fazendo commit..." -ForegroundColor Yellow
$commitMessage = "Initial commit: VIGILANT - Proactive Journey Management Platform"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Nenhuma mudanca para commitar ou commit ja existe" -ForegroundColor Yellow
    Write-Host "   Continuando com push..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Fazendo push para GitHub..." -ForegroundColor Yellow
Write-Host "   Isso pode solicitar suas credenciais do GitHub" -ForegroundColor Gray
Write-Host ""

# Tentar push para main primeiro, depois master
git push -u origin main 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Tentando branch 'master'..." -ForegroundColor Gray
    git push -u origin master 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Push falhou. Possiveis causas:" -ForegroundColor Yellow
        Write-Host "   1. Voce precisa fazer login no GitHub" -ForegroundColor White
        Write-Host "   2. Voce precisa criar a branch no GitHub primeiro" -ForegroundColor White
        Write-Host "   3. Verifique suas credenciais" -ForegroundColor White
        Write-Host ""
        Write-Host "Solucao manual:" -ForegroundColor Cyan
        Write-Host "   Execute manualmente:" -ForegroundColor White
        Write-Host "   git push -u origin main" -ForegroundColor Gray
        Write-Host "   ou" -ForegroundColor White
        Write-Host "   git push -u origin master" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "Push concluido com sucesso!" -ForegroundColor Green
        Write-Host "   Repositorio: $repoUrl" -ForegroundColor Cyan
    }
} else {
    Write-Host ""
    Write-Host "Push concluido com sucesso!" -ForegroundColor Green
    Write-Host "   Repositorio: $repoUrl" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
