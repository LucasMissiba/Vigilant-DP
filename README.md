# VIGILANT - Proactive Journey Management Platform

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## 📋 About the Project

VIGILANT is a comprehensive platform for HR departments to manage overtime and time bank, ensuring legal compliance (CLT/CCT), automation, cost control, and transparency. The platform transforms time management from a cost center into a strategic tool.

**English | [Português](#português)**

## 🎯 Strategic Objectives

- **Legal Compliance**: Zero fines or violations related to journey management
- **Automation & Efficiency**: 95% reduction in overtime calculation errors
- **Cost Control**: Reduction in monthly cash out with paid overtime
- **Transparency**: 80% increase in manager and employee satisfaction

## ✨ Key Features

- ⏰ **Electronic Time Clock Integration** - Excel/TXT file import
- 📊 **Rule Engine** - Strategy Pattern for CLT/CCT compliance
- 💰 **Automatic Calculations** - Overtime and time bank balance
- 📈 **Real-time Dashboards** - Employee, Manager, and Admin portals
- 🔔 **Proactive Alerts** - Critical balance notifications
- 📤 **Payroll Integration** - Export for payroll systems
- 🔐 **Security** - 2FA authentication and end-to-end encryption

## 🏗️ Tech Stack

- **Backend**: NestJS (TypeScript) - RESTful API with modular architecture
- **Frontend**: React + TypeScript + Vite - Modern and responsive interface
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with 2FA support
- **Rule Engine**: Strategy Pattern for flexible CLT/CCT rule configuration
- **Architecture**: Microservices-ready, Cloud-Native

## 📦 Estrutura do Projeto

```
vigilant/
├── backend/          # API NestJS
├── frontend/         # Aplicação React
└── docs/            # Documentação do projeto
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/LucasMissiba/Vigilant-DP.git
cd Vigilant-DP

# Install dependencies
npm run install:all

# Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Development

```bash
# Backend (port 3001)
npm run dev:backend

# Frontend (port 5173)
npm run dev:frontend
```

### Production Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

## 📚 Core Modules

- **RF01 - Time Clock Integration**: Import time records via Excel/TXT files
- **RF02 - Rule Engine**: Flexible CLT/CCT rule configuration
- **RF03 - Overtime/Bank Calculation**: Automatic overtime and time bank balance calculation
- **RF04 - Balance Management**: Auditable history of all transactions
- **RF05 - Employee Portal**: Real-time balance access and detailed statements
- **RF06 - Manager Portal**: Dashboard with consolidated balances and alerts
- **RF07 - Payroll Integration**: Export file generation for payroll systems
- **RF08 - Proactive Alerts**: Automatic alerts for managers
- **RF09 - Forced Compensation**: Schedule mandatory balance compensation

## 🔒 Security

- SSL/TLS end-to-end encryption
- 2FA authentication for administrative users
- Immutable audit logs
- LGPD compliance

## 📝 License

ISC

---

## Português

### 📋 Sobre o Projeto

O VIGILANT é uma plataforma dedicada de gestão de jornada para o Departamento Pessoal/Recursos Humanos (DP/RH), focada na mitigação de passivos trabalhistas e otimização do capital através da gestão proativa do banco de horas.

### 🎯 Objetivos Estratégicos

- **Conformidade Legal**: Zero multas ou autuações relacionadas à gestão de jornada
- **Automação e Eficiência**: Redução de 95% dos erros de cálculo de horas extras
- **Controle de Custos**: Redução no cash out mensal com horas extras pagas
- **Transparência**: Aumento de 80% na satisfação de gestores e colaboradores

## 🔒 Segurança

- Criptografia SSL/TLS end-to-end
- Autenticação 2FA para usuários administrativos
- Logs de auditoria imutáveis
- Conformidade com LGPD

## 📝 Licença

ISC



