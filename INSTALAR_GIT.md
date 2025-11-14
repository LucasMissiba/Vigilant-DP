# Como Instalar Git no Windows

## Opção 1: Download Direto (Recomendado)

1. Acesse: https://git-scm.com/download/win
2. Baixe o instalador
3. Execute o instalador
4. Use as configurações padrão (Next, Next, Install)
5. Reinicie o PowerShell

## Opção 2: Via Winget (Windows 10/11)

Abra o PowerShell como Administrador e execute:

```powershell
winget install Git.Git
```

## Opção 3: Via Chocolatey

Se você tem Chocolatey instalado:

```powershell
choco install git
```

## Verificar Instalação

Após instalar, verifique:

```powershell
git --version
```

Você deve ver algo como: `git version 2.x.x`

## Configurar Git (Primeira Vez)

```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

## Depois de Instalar

Execute novamente:
```powershell
.\push-to-github-simple.ps1
```

