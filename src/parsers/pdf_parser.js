// Módulo para ingestão e extração de texto de arquivos PDF pesquisáveis.

const fs = require('fs');
const pdf = require('pdf-parse');
const { normalizarTexto } = require('../utils/normalizador_textual');

/**
 * Extrai e normaliza o texto de um arquivo PDF.
 * @param {string} caminhoArquivo - Caminho absoluto ou relativo do PDF.
 * @returns {Promise<string>} Texto extraído e totalmente normalizado.
 */
async function extrairTextoPDF(caminhoArquivo) {
    if (!fs.existsSync(caminhoArquivo)) {
        throw new Error(`[PDFParser] Arquivo não encontrado no caminho: ${caminhoArquivo}`);
    }

    try {
        const buffer = fs.readFileSync(caminhoArquivo);
        const data = await pdf(buffer);

        if (!data || !data.text) {
            throw new Error('[PDFParser] O documento não contém camada de texto extraível.');
        }

        return normalizarTexto(data.text);
    } catch (error) {
        throw new Error(`[PDF Parser] Falha ao extrair texto do PDF: ${error.message}`, {
            cause: error
        });
    }
}

module.exports = {
    extrairTextoPDF
};
