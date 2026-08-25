/*
SETUP E INICIALIZAÇÃO DO AMBIENTE

Garante o carregamento das variáveis de ambiente, verificação e criação
dos diretórios essenciais e mapeamento de caminhos do sistema.
*/

const fs = require('fs');
const path = require('path');

const RAIZ_PROJETO = path.join(__dirname, '..');

// Garante que o arquivo .env exista antes do dotenv ser carregado.
const caminhoEnv = path.join(RAIZ_PROJETO, '.env');
const caminhoEnvExample = path.join(RAIZ_PROJETO, '.env.example');

if (!fs.existsSync(caminhoEnv) && fs.existsSync(caminhoEnvExample)) {
    fs.copyFileSync(caminhoEnvExample, caminhoEnv);
}

require('dotenv').config();
const REGRAS_DOMINIO = require('./regras_dominio');

// Mapeamento de diretórios
const PASTA_LOGS = process.env.PASTA_LOGS
    ? path.resolve(RAIZ_PROJETO, process.env.PASTA_LOGS)
    : path.join(RAIZ_PROJETO, 'logs');
const PASTA_TEMPLATES = process.env.PASTA_TEMPLATES
    ? path.resolve(RAIZ_PROJETO, process.env.PASTA_TEMPLATES)
    : path.join(RAIZ_PROJETO, 'templates');
const PASTA_MEDICOES = process.env.PASTA_MEDICOES
    ? path.resolve(RAIZ_PROJETO, process.env.PASTA_MEDICOES)
    : path.join(RAIZ_PROJETO, 'Medicoes');
const PASTA_DATA = path.join(RAIZ_PROJETO, 'data');

const NOME_PLANILHA_PADRAO = process.env.NOME_PLANILHA || 'planilha_gestao.xlsm';

// Garante que a estrutura física de diretórios necessária existe.
function inicializarDiretorios() {
    const diretorios = [PASTA_LOGS, PASTA_TEMPLATES, PASTA_MEDICOES, PASTA_DATA];

    for (const dir of diretorios) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
}

// Validação simples de saúde e integridade da inicialização.
function validarAmbiente() {
    inicializarDiretorios();

    const mapaCaminhos = {
        RAIZ: RAIZ_PROJETO,
        PASTA_LOGS,
        PASTA_TEMPLATES,
        PASTA_MEDICOES,
        PASTA_DATA,
        CAMINHO_MACRO: path.join(PASTA_TEMPLATES, NOME_PLANILHA_PADRAO),
        NOME_ABA_MOLDE: process.env.NOME_ABA_MOLDE || 'Busca Automática Medições',
        ARQUIVO_SAIDA: path.join(PASTA_LOGS, 'Dados_IA_Fallback.json'),
        ARQUIVO_PARCIAL: path.join(PASTA_LOGS, 'Dados_IA_Fallback_parcial.json'),
        ARQUIVO_CSV: path.join(PASTA_LOGS, 'Dados_IA_Fallback.csv')
    };

    return {
        paths: mapaCaminhos,
        dominio: REGRAS_DOMINIO
    };
}

module.exports = validarAmbiente();
