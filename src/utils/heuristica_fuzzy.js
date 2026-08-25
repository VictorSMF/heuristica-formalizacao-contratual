/**
 * MOTOR HEURÍSTICO FUZZY (QWERTY Levenshtein Euclidiano)
 * Migrado da versão original do meu script, em Power Query (M)
 * É desacroplado e recebe as configurações do domínio por Injeção de Dependência
 */

// Importa a função do arquivo correto de normalização
const { removerAcentosPreservandoCedilha } = require('./normalizador_texto');

// Calcula o custo euclidiano de substituir um caractere por outro baseado no teclado.
function calcularCustoSubstituicao(c1, c2, configHeuristica) {
    if (c1 === c2) return 0;

    const p1 = configHeuristica.tecladoCoords[c1];
    const p2 = configHeuristica.tecladoCoords[c2];

    if (p1 && p2) {
        const dx = p1[0] - p2[0];
        const dy = p1[1] - p2[1];
        // Distância de Pitágoras: d = √(Δx² + Δy²)
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Limita o custo máximo ao equivalente de apagar e reescrever
        const custoCalculado =
            configHeuristica.levenshtein.coefLinear +
            dist * configHeuristica.levenshtein.fatorEscala;
        return Math.min(configHeuristica.levenshtein.custoInsDel * 2, custoCalculado);
    }

    return 1.5; // Fallback para caracteres fora do mapa (ex: números, símbolos)
}

// Motor Levenshtein Modificado (QWERTY)
function qwertyLevenshtein(s, t, configHeuristica) {
    const sChars = s.toUpperCase().split('');
    const tChars = t.toUpperCase().split('');
    const sLen = sChars.length;
    const tLen = tChars.length;

    if (sLen === 0) return tLen * configHeuristica.levenshtein.custoInsDel;
    if (tLen === 0) return sLen * configHeuristica.levenshtein.custoInsDel;

    // Otimização de memória: Usamos apenas 2 linhas (anterior e atual) em vez da matriz inteira
    let prevRow = Array.from(
        { length: tLen + 1 },
        (_, i) => i * configHeuristica.levenshtein.custoInsDel
    );
    let currRow = new Array(tLen + 1).fill(0);

    for (let i = 1; i <= sLen; i++) {
        currRow[0] = i * configHeuristica.levenshtein.custoInsDel;
        const c1 = sChars[i - 1];

        for (let j = 1; j <= tLen; j++) {
            const c2 = tChars[j - 1];

            const costSub = prevRow[j - 1] + calcularCustoSubstituicao(c1, c2, configHeuristica);
            const costDel = prevRow[j] + configHeuristica.levenshtein.custoInsDel;
            const costIns = currRow[j - 1] + configHeuristica.levenshtein.custoInsDel;

            currRow[j] = Math.min(costSub, costDel, costIns);
        }

        // Troca as referências para a próxima iteração
        let temp = prevRow;
        prevRow = currRow;
        currRow = temp;
    }

    return prevRow[tLen];
}

// Busca Inteligente: Divide o texto em tokens e testa contra os alvos

function fuzzyContainsAny(texto, listaAlvos, configHeuristica) {
    if (!texto || !listaAlvos || listaAlvos.length === 0) return false;

    // Usando a função importada do utilitário de texto
    const limpo = removerAcentosPreservandoCedilha(texto);

    // Equivalente ao Text.SplitAny do Power Query
    const tokens = limpo.split(/[ _\-./()[\]:;]+/).filter(t => t.length >= 3);

    return tokens.some(tok => {
        return listaAlvos.some(alvo => {
            const alvoLimpo = alvo.toUpperCase();
            const distancia = qwertyLevenshtein(tok, alvoLimpo, configHeuristica);
            const maxAllowed = alvoLimpo.length * configHeuristica.toleranciaFuzzy;

            return distancia <= maxAllowed || tok.includes(alvoLimpo);
        });
    });
}

// Exporta apenas as funções
module.exports = {
    qwertyLevenshtein,
    fuzzyContainsAny
};
