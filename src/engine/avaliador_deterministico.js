/*
Motor de Avaliação Determinística.
Aplica regras exatas (Regex/Termos) sobre o texto higienizado.
 */

function avaliarDeterministico(textoNormalizado, regrasGrupo, configuracaoPontuacao) {
    if (!textoNormalizado || typeof textoNormalizado !== 'string') {
        throw new Error('[Avaliador] Texto inválido para análise determinística.');
    }

    if (!regrasGrupo) {
        throw new Error('[Avaliador] Grupo de regras não informado.');
    }

    const conformidades = [];
    const infrações = [];
    let pontosPerdidos = 0;

    // 1. Avalia Regras de Padrão (Regex)
    if (Array.isArray(regrasGrupo.regras_regex)) {
        for (const regra of regrasGrupo.regras_regex) {
            const match = regra.padrao.test(textoNormalizado);
            regra.padrao.lastIndex = 0; // Reseta o índice da Regex global

            if (match) {
                conformidades.push({
                    id: regra.id,
                    nome: regra.nome,
                    status: 'OK'
                });
            } else if (regra.obrigatorio) {
                pontosPerdidos += regra.penalidade;
                infrações.push({
                    id: regra.id,
                    nome: regra.nome,
                    tipo: 'OMISSAO_OBRIGATORIA',
                    penalidade: regra.penalidade,
                    detalhe: `Regra não atendida: ${regra.descricao}`
                });
            }
        }
    }

    // 2. Avalia Termos Proibidos
    if (Array.isArray(regrasGrupo.termos_proibidos)) {
        for (const item of regrasGrupo.termos_proibidos) {
            const regexTermo = new RegExp(item.termo, 'gi');
            if (regexTermo.test(textoNormalizado)) {
                pontosPerdidos += item.penalidade;
                infrações.push({
                    id: 'TERMO_PROIBIDO',
                    nome: `Uso do termo: "${item.termo}"`,
                    tipo: 'VIOLACAO_DIRETA',
                    penalidade: item.penalidade,
                    detalhe: item.motivo
                });
            }
        }
    }

    // 3. Cálculo do Score e Status Final
    const base = configuracaoPontuacao.base_inicial || 100;
    const scoreFinal = Math.max(0, base - pontosPerdidos);

    let status = 'APROVADO';

    // Usando a chave 'limiares_decisao' do regras_dominio
    if (scoreFinal < configuracaoPontuacao.limiares_decisao.corte_aprovado) status = 'ATENÇÃO';
    if (scoreFinal < configuracaoPontuacao.limiares_decisao.corte_atencao) status = 'CRÍTICO';

    return {
        timestamp: new Date().toISOString(),
        score: scoreFinal,
        status_decisao: status,
        total_penalidades: pontosPerdidos,
        itens_conformes: conformidades,
        infracoes: infrações
    };
}

module.exports = {
    avaliarDeterministico
};
