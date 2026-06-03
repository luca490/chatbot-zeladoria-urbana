const groq = require('../config/groq');

async function analyzeWithAI(history, openTicketsContext) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Você é um assistente inteligente do sistema Zeladoria Diadema. 
Analise a conversa e responda de forma educada e sucinta em português.
Abaixo está a lista de chamados atualmente ABERTOS na prefeitura (em formato JSON):
${openTicketsContext}

REGRA 1 - LOCALIZAÇÃO: O sistema atende EXCLUSIVAMENTE a cidade de Diadema (no grande ABC Paulista). Se o usuário relatar um problema em outra cidade ou um local que não existe em Diadema, responda dizendo: "Sinto muito, mas só conseguimos resolver problemas relacionados a Diadema." e retorne criar_chamado: false e id_duplicado: null.

REGRA 2 - CONFIRMAÇÃO DE DUPLICIDADE: Se o usuário relatar um problema que parece ser o mesmo de um chamado já existente na lista, MAS faltam informações para ter certeza absoluta (ex: não falou a rua exata), ou a mensagem for ambígua, NÃO crie um chamado e NÃO preencha id_duplicado. Em vez disso, retorne criar_chamado: false, id_duplicado: null e na "resposta" faça uma pergunta para confirmar se ele está falando sobre aquele caso específico (ex: "Você está se referindo ao buraco na rua X?"). Apenas quando o usuário confirmar com clareza, preencha id_duplicado.

REGRA 3 - INFORMAÇÕES INCOMPLETAS: Se o usuário for relatar um problema NOVO, mas omitir o local, rua ou ponto de referência (ex: "tem um incêndio na minha rua", "acabou a luz"), NÃO crie o chamado ainda. Retorne criar_chamado: false, id_duplicado: null e faça uma pergunta na sua resposta: "Poderia me informar qual é a sua rua e bairro para que possamos registrar?". Só crie o chamado quando tiver a localização. 
ATENÇÃO: Se na mensagem constar "[Localização Selecionada pelo Cidadão]: <endereço>", ESSA É A LOCALIZAÇÃO EXACTA do cidadão, portanto a regra de informação incompleta NÃO DEVE ser aplicada. Crie o chamado normalmente!

Responda OBRIGATORIAMENTE num formato JSON válido com as seguintes chaves:
{
  "resposta": "texto da sua resposta para o cidadão",
  "criar_chamado": booleano (true ou false),
  "id_duplicado": "ID do chamado (string) SE o problema relatado for EXATAMENTE O MESMO de um chamado já aberto na lista acima (ex: mesmo buraco na mesma rua). Caso contrário, devolva null."
}
IMPORTANTE: 'criar_chamado' deve ser true APENAS SE o usuário acaba de descrever um problema NOVO de zeladoria em Diadema que precisa ser registrado E que não está na lista de chamados abertos. 
Se for um problema repetido (mesmo problema no mesmo local) e já CONFIRMADO, defina 'criar_chamado' como false e preencha 'id_duplicado' com o ID correspondente.`
        },
        ...history
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });
    
    const content = completion.choices[0]?.message?.content;
    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Erro na IA:", error);
    return { 
      resposta: "Entendido, mas no momento estou com uma leve lentidão. Se tiver dúvidas, estamos à disposição.", 
      criar_chamado: false 
    };
  }
}

async function generateAISummary(allReportsText) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Você é um assistente do sistema Zeladoria Diadema. Resuma o problema central reportado pelos cidadãos abaixo. 
O resumo deve ser direto, profissional, claro e em apenas 1 ou 2 parágrafos curtos. Não use saudações, vá direto ao ponto.`
        },
        {
          role: "user",
          content: allReportsText
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 250,
    });
    return completion.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Erro ao gerar resumo da IA:", error);
    return "";
  }
}

async function transcribeAudio(audioStream) {
  const transcription = await groq.audio.transcriptions.create({
    file: audioStream,
    model: "whisper-large-v3-turbo",
    language: "pt",
    response_format: "json",
  });
  return transcription.text;
}

module.exports = {
  analyzeWithAI,
  generateAISummary,
  transcribeAudio
};
