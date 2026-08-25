# ADR 004: Segmentação Semântica e Roteamento de Contexto para LLM Local

## Status

Aceito

## Contexto

O envio de documentos completos (PDFs de dezenas de páginas) para o modelo local (Ollama / Qwen2.5) causaria alta latência de inferência, risco de estouro da janela de contexto e degradação da atenção do modelo. Isso inviabilizaria a execução no hardware alvo (máquina sem dGPU, cerca de 32GB de RAM total, rodando Windows 11 que consome cerca de 10GB de RAM em estado ocioso).

## Decisão

O módulo `document_segmenter.js` fatiará o documento em blocos semânticos (_Técnico_, _Administrativo_, _Geral_). Quando a Camada Determinística identificar uma falha ou ambiguidade em uma regra específica, o `pipeline.js` enviará para a IA **apenas o segmento correspondente** àquela matéria, em vez do documento integral.

## Consequências

- **Positivas:** Redução drástica da carga de tokens por requisição. Garante respostas em menos tempo e evita estrangulamento da memória RAM e CPU.
- **Negativas:** Se um parágrafo contendo a cláusula auditada não atingir nenhum gatilho de segmentação, ele cairá no bloco `geral` ou em um bloco incorreto, exigindo ajuste fino dos gatilhos no sistema.
