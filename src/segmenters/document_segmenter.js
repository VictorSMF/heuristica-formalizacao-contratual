/*
Módulo de Segmentação de Documentos.
Separa a string tratada em blocos temáticos consumindo o Ponto Único de Verdade.
*/

/**
 * Segmenta um documento dividindo-o por linhas e agrupando por contexto semântico.
 *
 * @param {string} textoNormalizado - Texto tratado vindo do normalizador_textual.
 * @param {Object} configDominio - As regras de negócio (regras_dominio.js).
 * @returns {Object} Estrutura com os blocos dinâmicos
 */
function segmentarDocumento(textoNormalizado, configDominio) {
    if (!textoNormalizado || typeof textoNormalizado !== 'string') {
        throw new Error('[Segmenter] Texto inválido para segmentação.');
    }

    const paragrafos = textoNormalizado.split('\n\n');
    const blocos = {};
    const configSeg = configDominio.segmentacao;

    // Inicializa dinamicamente as chaves por blocos de categorias ou semanticos no contrato
    configSeg.segmentos.forEach(seg => (blocos[seg.id] = []));
    blocos[configSeg.segmento_padrao] = [];

    let contextoAtual = configSeg.segmento_padrao;

    for (const paragrafo of paragrafos) {
        // Verifica se o parágrafo atual engatilha uma mudança de seção
        for (const seg of configSeg.segmentos) {
            if (seg.padroes_gatilho.some(regex => regex.test(paragrafo))) {
                contextoAtual = seg.id;
                break; // Trocou o contexto, vai para o próximo parágrafo
            }
        }
        // Guarda o parágrafo no "balde" correto
        blocos[contextoAtual].push(paragrafo);
    }

    // Consolida os arrays de volta em textos longos
    const resultado = {};
    Object.keys(blocos).forEach(key => {
        resultado[key] = blocos[key].join('\n\n').trim();
    });

    return resultado;
}

module.exports = {
    segmentarDocumento
};
