// PIPELINE DE AUDITORIA (Orquestrador)

const { normalizarTexto } = require('../utils/normalizador_textual');
const { segmentarDocumento } = require('../segmenters/document_segmenter');
const { avaliarDeterministico } = require('./avaliador_deterministico');
// eslint-disable-next-line no-unused-vars
const AvaliadorSubjetivo = require('./avaliador_subjetivo');

async function executarAuditoria(textoBruto, tipoDocumento, configDominio) {
    console.log(
        `\n[PIPELINE] Iniciando auditoria para documento tipo: [${tipoDocumento.toUpperCase()}]`
    );

    // 1. HIGIENIZAÇÃO E SEGMENTAÇÃO
    console.log(`[PIPELINE] Normalizando e fatiando documento...`);
    const textoNormalizado = normalizarTexto(textoBruto);
    const blocosTexto = segmentarDocumento(textoNormalizado, configDominio);

    const regrasAplicaveis = configDominio.auditoria_deterministica[tipoDocumento];
    if (!regrasAplicaveis) {
        throw new Error(`Tipo de documento não mapeado nas regras de domínio: ${tipoDocumento}`);
    }

    // 2. MOTOR DETERMINÍSTICO (Fase 1)
    console.log(`[PIPELINE] Rodando Motor Determinístico (Regex/Heurística)...`);

    // Roteamento inteligente para Regex: Se existir um bloco administrativo, foca nele, senão vai no texto todo
    const textoParaRegex = blocosTexto['administrativo'] || textoNormalizado;

    // Chamada corrigida passando as regras e as configurações de pontuação
    const resultadoDeterministico = avaliarDeterministico(
        textoParaRegex,
        regrasAplicaveis,
        configDominio.pontuacao
    );

    let scoreAtual = resultadoDeterministico.score;
    let infracoes = [...resultadoDeterministico.infracoes];

    // 3. FALLBACK PARA O MOTOR SUBJETIVO (Fase 2: LLM)
    const regrasFalhas = infracoes.filter(inf => inf.id === 'REG-003' || inf.id === 'REG-002');

    if (regrasFalhas.length > 0) {
        console.log(
            `[PIPELINE] Ambiguidades detectadas. Acionando Motor Subjetivo (Ollama) para poupar RAM...`
        );

        // Em breve conectaremos a IA de fato aqui, usando o bloco reduzido:
        // const contextoParaIA = blocosTexto['administrativo'];
    }

    // 4. CONSOLIDAÇÃO E SCORING FINAL
    scoreAtual = Math.max(scoreAtual, configDominio.pontuacao.piso_minimo);

    let statusFinal = 'CRÍTICO';
    if (scoreAtual >= configDominio.pontuacao.limiares_decisao.corte_aprovado) {
        statusFinal = 'APROVADO';
    } else if (scoreAtual >= configDominio.pontuacao.limiares_decisao.corte_atencao) {
        statusFinal = 'ATENÇÃO';
    }

    return {
        status: statusFinal,
        score: scoreAtual,
        penalidadesTotais: configDominio.pontuacao.base_inicial - scoreAtual,
        infracoes: infracoes
    };
}

module.exports = {
    executarAuditoria
};
