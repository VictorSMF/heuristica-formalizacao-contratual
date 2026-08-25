const env = require('./setup');

// Parametrização para o cliente Ollama/Qwen alimentado pelo setupper central.
module.exports = {
    endpoint: env.ia.endpoint,
    modelo: env.ia.modelo,
    parametros: {
        temperature: env.ia.temperatura,
        top_p: env.ia.topP,
        num_predict: env.ia.maxTokens
    }
};
