/*
AVALIADOR SUBJETIVO (Engine LLM / Ollama)
 
Responsável por fallback de extrações ambíguas e análise qualitativa
utilizando modelos de linguagem locais
*/

/*
Sanitiza respostas alucinadas da IA (comentários dentro de JSONs,
caracteres de controle e fórmulas residuais).
*/
function sanitizarJson(texto) {
    const linhas = texto.split(/\r?\n/);
    const linhasLimpa = linhas
        .map(linha => {
            let dentroDeString = false;
            let novo = '';
            for (let i = 0; i < linha.length; i++) {
                const char = linha[i];
                if (char === '"') {
                    dentroDeString = !dentroDeString;
                    novo += char;
                } else if (
                    !dentroDeString &&
                    (char === '#' || (char === '/' && linha[i + 1] === '/'))
                ) {
                    break;
                } else {
                    novo += char;
                }
            }
            return novo;
        })
        .join('\n');

    const regexOperacao = /(-?\d+(?:\.\d+)?)\s*([*/+-])\s*(-?\d+(?:\.\d+)?)/g;
    return linhasLimpa.replace(regexOperacao, 'null');
}

// Localiza e extrai a estrutura de array JSON válida na resposta do modelo.
function extrairArrayJson(texto) {
    if (!texto) return null;
    let t = texto.trim();
    if (t.startsWith('```json')) t = t.slice(7);
    else if (t.startsWith('```')) t = t.slice(3);
    if (t.endsWith('```')) t = t.slice(0, -3);
    t = sanitizarJson(t.trim());

    try {
        const obj = JSON.parse(t);
        if (Array.isArray(obj)) return obj;
        if (obj && typeof obj === 'object') {
            for (const key of Object.keys(obj)) {
                if (Array.isArray(obj[key])) return obj[key];
            }
            return [obj];
        }
    } catch {
        const inicio = t.indexOf('[');
        const fim = t.lastIndexOf(']');
        if (inicio !== -1 && fim > inicio) {
            try {
                const obj = JSON.parse(t.slice(inicio, fim + 1));
                if (Array.isArray(obj)) return obj;
                if (obj && typeof obj === 'object') {
                    for (const key of Object.keys(obj)) {
                        if (Array.isArray(obj[key])) return obj[key];
                    }
                    return [obj];
                }
            } catch {
                /* Erro ignorado intencionalmente no fallback por ora*/
            }
        }
    }
    return null;
}

/**
 * Executa a avaliação subjetiva/extração via IA.
 *
 * @param {Object} linhaDados - Dados brutos da linha { numeroLinha, conteudo }
 * @param {string} origem - Nome/Identificador do documento
 * @param {Array<string>} template - Colunas esperadas no retorno
 * @param {Object} configDominio - Configurações injetadas do regras_dominio.js
 */
async function avaliarSubjetivo(linhaDados, origem, template, configDominio) {
    const loteStr = `[Linha_${linhaDados.numeroLinha}] ${linhaDados.conteudo}`;
    const prompt = configDominio.gerarPrompt(origem, template, loteStr);

    const payload = {
        model: configDominio.ia.modelName,
        prompt,
        stream: false,
        options: {
            temperature: configDominio.ia.temperature,
            top_p: configDominio.ia.topP
        }
    };

    for (let tentativa = 1; tentativa <= configDominio.ia.maxTentativas; tentativa++) {
        try {
            const resp = await fetch(configDominio.ia.ollamaUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(configDominio.ia.timeoutMs)
            });

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            const array = extrairArrayJson(data.response || '');

            if (!array || array.length === 0) {
                throw new Error('Falha ao extrair array JSON do modelo');
            }

            return array[0] || {};
        } catch (e) {
            console.error(
                `   └─ [AVISO SUBJETIVO] Tentativa ${tentativa}/${configDominio.ia.maxTentativas} falhou: ${e.message}`
            );

            if (tentativa === configDominio.ia.maxTentativas) {
                return {};
            }
            await new Promise(r => setTimeout(r, 2000 * tentativa));
        }
    }
}

module.exports = {
    avaliarSubjetivo,
    sanitizarJson,
    extrairArrayJson
};
