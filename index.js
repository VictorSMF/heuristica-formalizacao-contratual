const path = require('path');
const fs = require('fs');

// Configuração Centralizadora
require('./config/setup');
const regrasDominio = require('./config/regras_dominio');

// Importa apenas o parser e o orquestrador (Pipeline)
const { extrairTextoPDF } = require('./src/parsers/pdf_parser');
const { executarAuditoria } = require('./src/engine/pipeline');

async function executarApp() {
    try {
        const pastaData = path.join(__dirname, 'data');
        const caminhoPdf = path.join(pastaData, 'edital_exemplo.pdf');
        const caminhoMd = path.join(pastaData, 'edital_exemplo.md');

        let textoBruto = '';

        // Logica de leitura com fallback:
        if (fs.existsSync(caminhoPdf)) {
            textoBruto = await extrairTextoPDF(caminhoPdf);
        } else if (fs.existsSync(caminhoMd)) {
            textoBruto = fs.readFileSync(caminhoMd, 'utf-8');
        } else {
            throw new Error('Nenhum arquivo de entrada (.pdf ou .md) encontrado em ./data');
        }

        // Delega TODA a orquestração (Normalizar -> Segmentar -> Avaliar -> Fallback IA) para o Pipeline
        const resultado = await executarAuditoria(textoBruto, 'minuta', regrasDominio);

        console.log('\n================ RELATÓRIO DE COMPLIANCE ================');
        console.log(`Status Final: [${resultado.status}]`);
        console.log(`Score: ${resultado.score} / 100`);

        if (resultado.infracoes.length > 0) {
            console.log('\nInfrações Encontradas:');
            console.table(resultado.infracoes);
        }
        console.log('=========================================================\n');
    } catch (error) {
        console.error('[Erro Fatal no Sistema]:', error.message);
    }
}

executarApp();
