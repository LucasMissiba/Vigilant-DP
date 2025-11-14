// Script para criar usuário administrador
// Execute: node criar-admin.js

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function criarAdmin() {
  try {
    const email = 'admin@vigilant.com';
    const senha = 'admin123';
    const nome = 'Administrador';

    // Verificar se já existe
    const existe = await prisma.user.findUnique({
      where: { email },
    });

    if (existe) {
      console.log('❌ Usuário já existe!');
      console.log(`Email: ${email}`);
      console.log('Use outra senha ou outro email.');
      return;
    }

    // Gerar hash da senha
    const hashSenha = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.user.create({
      data: {
        email,
        password: hashSenha,
        name: nome,
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('');
    console.log('Credenciais de acesso:');
    console.log(`  Email: ${email}`);
    console.log(`  Senha: ${senha}`);
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    if (error.message.includes('Can\'t reach database')) {
      console.log('');
      console.log('💡 Dica: Certifique-se de que:');
      console.log('  1. O PostgreSQL está rodando');
      console.log('  2. O banco "vigilant" foi criado');
      console.log('  3. As migrações foram executadas (npm run prisma:migrate)');
    }
  } finally {
    await prisma.$disconnect();
  }
}

criarAdmin();


