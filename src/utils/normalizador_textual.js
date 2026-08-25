// Utilitário para higienização e padronização de textos extraídos de documentos.
// Prepara o texto bruto para a análise determinística e IA.

// Remove caracteres invisíveis (Zero-width spaces, BOM, etc) comuns em PDFs
function removerCaracteresInvisiveis(texto) {
    if (!texto) return '';
    // Regex para capturar caracteres Unicode não imprimíveis e de controle
    return texto.replace(/[\u200B-\u200D\uFEFF]/g, '');
}

// Padroniza aspas inteligentes (do Word) para aspas simples e duplas retas
function padronizarAspas(texto) {
    if (!texto) return '';
    return texto
        .replace(/[\u2018\u2019]/g, "'") // Aspas simples
        .replace(/[\u201C\u201D]/g, '"'); // Aspas duplas
}

// Remove excesso de espaços em branco e padroniza quebras de linha
function limparEspacos(texto) {
    if (!texto) return '';
    return texto
        .replace(/\r\n/g, '\n') // Padroniza quebra de linha do Windows para Unix
        .replace(/\n{3,}/g, '\n\n') // Reduz 3+ quebras de linha para apenas 2 (parágrafo)
        .replace(/[ \t]{2,}/g, ' ') // Reduz múltiplos espaços/tabs para um único espaço
        .trim(); // Remove espaços nas bordas
}

// Remove acentos mas preserva o "Ç" (usado especificamente pelo motor Fuzzy/QWERTY)
function removerAcentosPreservandoCedilha(texto) {
    if (!texto) return '';
    return texto
        .toUpperCase()
        .replace(/[ÃÁÀÂ]/g, 'A')
        .replace(/[ÉÈÊ]/g, 'E')
        .replace(/[ÍÌÎ]/g, 'I')
        .replace(/[ÓÒÔÕ]/g, 'O')
        .replace(/[ÚÙÛ]/g, 'U');
}

/**
 * Pipeline principal de normalização.
 * @param {string} textoBruto - O texto extraído do documento.
 * @returns {string} Texto higienizado pronto para o motor.
 */
function normalizarTexto(textoBruto) {
    if (typeof textoBruto !== 'string') {
        throw new TypeError('[Normalizer] A entrada deve ser uma string.');
    }

    let textoLimpo = removerCaracteresInvisiveis(textoBruto);
    textoLimpo = padronizarAspas(textoLimpo);
    textoLimpo = limparEspacos(textoLimpo);

    return textoLimpo;
}

module.exports = {
    normalizarTexto,
    // Exportados individualmente caso precisemos de higienizações pontuais no futuro
    removerCaracteresInvisiveis,
    padronizarAspas,
    limparEspacos,
    removerAcentosPreservandoCedilha
};
