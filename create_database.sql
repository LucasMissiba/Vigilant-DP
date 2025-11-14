-- Script SQL para criar o banco de dados VIGILANT
-- Execute este script no pgAdmin ou via psql

-- Criar banco de dados
CREATE DATABASE vigilant
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Brazil.1252'
    LC_CTYPE = 'Portuguese_Brazil.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Verificar se foi criado
SELECT datname FROM pg_database WHERE datname = 'vigilant';



