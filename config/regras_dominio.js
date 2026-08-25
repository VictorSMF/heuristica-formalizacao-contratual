/*
PONTO ÚNICO DE VERDADE - POLÍTICAS E REGRAS DE NEGÓCIO INSTITUCIONAIS
Nenhuma regra de auditoria, gatilho de texto ou pontuação deve existir fora deste arquivo.
*/

module.exports = {
    // CATEGORIA 1: Regras de Segmentação e Estrutura do Documento
    segmentacao: {
        segmentos: [
            {
                id: 'tecnico',
                nome: 'Seção Técnica (TR / Especificações)',
                padroes_gatilho: [
                    /cláusula\s+(da\s+)?(objeto|especificação|execução|entrega|obrigações\s+da\s+contratada)/i,
                    /dos?\s+(objetos?|especificações|requisitos\s+técnicos|prazos\s+de\s+entrega)/i,
                    /termo\s+de\s+referência\s+-\s+especificação/i
                ]
            },
            {
                id: 'administrativo',
                nome: 'Seção Administrativa / Jurídica',
                padroes_gatilho: [
                    /cláusula\s+(da\s+)?(pagamento|liquidação|recebimento|reajuste|sanções|penalidades|foro|vigência)/i,
                    /dos?\s+(pagamentos?|recebimentos?|penalidades?|sanções|reajustamento)/i,
                    /da\s+(rescisão|garantia|vigência)/i
                ]
            }
        ],
        segmento_padrao: 'geral'
    },

    // CATEGORIA 2: Auditoria Determinística (Por Tipo Documental)
    auditoria_deterministica: {
        minuta: {
            regras_regex: [
                {
                    id: 'REG-001',
                    nome: 'Presença de CNPJ Válido',
                    descricao: 'Verifica se há um CNPJ formatado no documento.',
                    padrao: /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g,
                    obrigatorio: true,
                    penalidade: 25
                },
                {
                    id: 'REG-002',
                    nome: 'Cláusula de Foro Legal',
                    descricao: 'Verifica menção expressa ao foro aplicável.',
                    padrao: /foro (da comarca de|de) [A-Za-zÀ-ÿ\s]+/i,
                    obrigatorio: true,
                    penalidade: 15
                },
                {
                    id: 'REG-003',
                    nome: 'Prazo de Pagamento Especificado',
                    descricao: 'Busca indicação expressa de prazo de pagamento em dias.',
                    padrao: /pagamento (será|deverá ser) (efetuado|realizado) em até \d+ \((?:dias|dias úteis)\)/i,
                    obrigatorio: true,
                    penalidade: 20
                }
            ],
            termos_proibidos: [
                {
                    termo: 'pagamento antecipado',
                    penalidade: 30,
                    motivo: 'Vedação legal para adiantamento sem garantias prévias.'
                }
            ]
        },
        tr: {
            regras_regex: [],
            termos_proibidos: []
        },
        mapa_riscos: {
            regras_regex: [],
            termos_proibidos: []
        }
    },

    // CATEGORIA 3: Regras de Pontuação e Faixas de Decisão (Scoring)
    pontuacao: {
        base_inicial: 100,
        piso_minimo: 0,
        limiares_decisao: {
            corte_aprovado: 80, // >= 80: APROVADO
            corte_atencao: 50 // 50 a 79: ATENÇÃO | < 50: CRÍTICO
        }
    },

    heuristica: {
        toleranciaFuzzy: 0.2,
        levenshtein: {
            custoInsDel: 1,
            coefLinear: 0.2,
            fatorEscala: 0.3
        },
        tecladoCoords: {
            Q: [0, 0],
            W: [1, 0],
            E: [2, 0],
            R: [3, 0],
            T: [4, 0],
            Y: [5, 0],
            U: [6, 0],
            I: [7, 0],
            O: [8, 0],
            P: [9, 0],
            A: [0.5, 1],
            S: [1.5, 1],
            D: [2.5, 1],
            F: [3.5, 1],
            G: [4.5, 1],
            H: [5.5, 1],
            J: [6.5, 1],
            K: [7.5, 1],
            L: [8.5, 1],
            Ç: [9.5, 1],
            Z: [1.0, 2],
            X: [2.0, 2],
            C: [3.0, 2],
            V: [4.0, 2],
            B: [5.0, 2],
            N: [6.0, 2],
            M: [7.0, 2]
        }
    },

    ia: {
        ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434/api/generate',
        modelName: process.env.MODEL_NAME || 'qwen2.5:7b',
        timeoutMs: parseInt(process.env.IA_TIMEOUT_MS, 10) || 60000,
        temperature: 0.2,
        topP: 0.1,
        maxTentativas: 3
    },

    limiares: {
        maxFalhasConsecutivas: 20,
        completude: 0.5,
        similaridade: 0.2,
        preenchimentoMin: 0.1
    },

    // Mantido exatamente como no seu código original
    gerarPrompt: (origem, template, loteStr) => `
Você é um extrator de dados para auditoria. Analise a linha abaixo e extraia os campos conforme as colunas do template.

ORIGEM: ${origem}

COLUNAS DO TEMPLATE:
${template.join(', ')}

LINHA DE ENTRADA:
${loteStr}

INSTRUÇÕES:
1. Retorne APENAS um array JSON com exatamente 1 objeto.
2. O objeto deve conter a chave "Linha_Origem" com o número do marcador [Linha_X].
3. Para TODAS as colunas do template, extraia o valor correspondente. Se não existir, use null.
4. A coluna "Competencia" deve ser SEMPRE null (será preenchida externamente).
5. A coluna "Origem_NF" deve ser SEMPRE null (será preenchida externamente).
6. A coluna "Item_Contrato_Identificado" deve ser SEMPRE null (será preenchida externamente).
7. Mantenha os nomes das colunas exatamente como estão no template, sem alterar acentos ou espaços.
8. Converta valores monetários para números decimais (ex: "R$ 63,00" -> 63.00).
9. Converta datas para o formato "dd/mm/aaaa" se ainda não estiverem.
10. NÃO INCLUA comentários, cálculos, fórmulas ou explicações.
11. Para campos numéricos, retorne SOMENTE o número já calculado, nunca expressões como "0.8 * 1.131".
12. Se não conseguir extrair um valor, use null.
`
};
