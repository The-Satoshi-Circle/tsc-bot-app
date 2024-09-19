import { Bot, InlineKeyboard, Context, session, SessionFlavor } from "https://deno.land/x/grammy/mod.ts";
import { Conversation, ConversationFlavor, conversations, createConversation } from "https://deno.land/x/grammy_conversations/mod.ts";
import { writeJson } from "https://deno.land/x/jsonfile/mod.ts";


// Definizione del tipo di contesto per supportare le sessioni e le conversazioni
interface MySession {
  lastMessage?: string;
}

type MyContext = Context & SessionFlavor<MySession> & ConversationFlavor;

// Sostituisci con il token del tuo bot
const bot = new Bot<MyContext>("7350066560:AAG8jhPLTbrftjpB_thzlziNIlikkMsK1uU");

// Rimuovi qualsiasi webhook esistente prima di avviare il bot, ignorando eventuali errori 404
try {
  await bot.api.deleteWebhook({ drop_pending_updates: true });
} catch (error) {
  if (error.description !== 'Not Found') {
    console.error("Errore durante la rimozione del webhook:", error);
  }
}

// Aggiungi il middleware delle sessioni
bot.use(session({ initial: (): MySession => ({}) }));

// Aggiungi il middleware delle conversazioni
bot.use(conversations());

// Funzione per gestire il comando /start
bot.command("start", (ctx) => {
  const keyboard = new InlineKeyboard().webApp("Mini-App (Beta)", "https://the-satoshi-circle.github.io/the-satoshi-circle-tma")
    .row()
    .text("Compila il questionario", "fill_questionnaire")
    .row()
    .text("Invia TON Space (ricevi NFT)", "send_message")
    .row()
    .url("Entra nel gruppo", "https://t.me/thesatoshicircle")
    .url("Iscriviti al canale", "https://t.me/thesatoshicirclenews")
    .row()
    .url("Dona 1 TON", "ton://transfer/UQDNc_nDq5FTbfnQfxYwSLexDRebt56jmEDv0PIRy6FAfuIR?amount=1000000000")
    .row();
    
  ctx.reply("Benvenuto! Cosa desideri fare?", {
    reply_markup: keyboard,
    });
});
 


// Funzione per gestire il questionario e salvare i dati in un file JSON
async function questionnaire(conversation: Conversation<MyContext>, ctx: MyContext) {
  const username = ctx.from?.username || "Anonimo";
  const id = ctx.from?.id || "no id";

  await ctx.reply("Benvenuto nel questionario! Qual è il tuo nome?");
  const name = await conversation.wait();
  await ctx.reply(`Ciao, ${name.message?.text}! Quanti anni hai?`);
  const age = await conversation.wait();
  await ctx.reply("Come sei entrato nel mondo crypto? (max 10 parole)");
  const inside = await conversation.wait();
  await ctx.reply("Qual è il tuo exchange di riferimento?");
  const exchange = await conversation.wait();
  await ctx.reply("Possiedi un cold wallet?");
  const cold = await conversation.wait();
  await ctx.reply("Possiedi il wallet di Telegram?");
  const tgwallet = await conversation.wait();
  await ctx.reply("Sai cos'è un NFT?");
  const nft = await conversation.wait();
  

  const data = {
    id: id,
    username: username,
    name: name.message?.text,
    age: age.message?.text,
    inside: inside.message?.text,
    exchange: exchange.message?.text,
    cold: cold.message?.text,
    tgwallet: tgwallet.message?.text,
    nft: nft.message?.text,
  };

  const filePath = "C:/Users/gianl/Desktop/NewProject/questionnaire_responses.json";
  let responses: any[] = [];

  try {
    responses = JSON.parse(await Deno.readTextFile(filePath));
  } catch {
    responses = [];
  }

  responses.push(data);

  try {
    console.log("Salvando i dati in:", filePath);
    await writeJson(filePath, responses, { spaces: 2 });
    console.log("Dati salvati con successo.");
  } catch (error) {
    console.error("Errore durante il salvataggio dei dati:", error);
  }

  await ctx.reply(`Grazie ${name.message?.text}! Se vuoi ricevere il tuo Satoshi Circle NFT, basta comunicare il tuo indirizzo TON Space tramite l'apposito pulsante`);
}

// Crea una conversazione per il questionario
bot.use(createConversation(questionnaire));

// Gestione del pulsante per il questionario
bot.callbackQuery("fill_questionnaire", async (ctx) => {
  await ctx.answerCallbackQuery(); // Rispondi alla callback per evitare il cerchio di caricamento
  await ctx.conversation.enter("questionnaire"); // Avvia la conversazione
});

// Gestione degli errori
bot.catch((err) => {
  console.error("Errore nel bot:", err);
});


bot.callbackQuery("send_message", async (ctx) => {
  await ctx.answerCallbackQuery(); // Risposta immediata per chiudere il "caricamento"
  await ctx.reply("Hai cliccato il pulsante e questo è il messaggio inviato!");
});

// Avvia il bot
bot.start();