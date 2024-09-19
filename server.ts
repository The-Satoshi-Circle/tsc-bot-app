import { Application, Router, Context } from "https://deno.land/x/oak/mod.ts";

// Funzione per simulare il recupero dell'username dall'oggetto di stato della sessione (ctx.state)
async function getUsername(ctx: Context): Promise<string> {
    // Supponiamo che l'username sia disponibile in ctx.state.user.username
    // Se stai usando autenticazione OAuth o un altro metodo, questo deve essere implementato
    const username = ctx.state.user?.username || "Guest";
    return username;
}

const router = new Router();

router.get("/", async (ctx) => {
    // Otteniamo l'username dell'utente
    const username = await getUsername(ctx);

    // Generiamo la risposta HTML
    ctx.response.body = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Satoshi Circle</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <div class="header">
            <span id="username"></span> <!-- Questo sarà popolato con il vero username -->
            <span id="toshi">TOSHI: 0</span>
        </div>
        <div class="menu">
            <h1 class="title">Satoshi Circle</h1>
            <button class="menu-btn" id="game-btn">Game</button>
            <button class="menu-btn" id="task-btn">Task</button>
        </div>
        <div class="game-section hidden" id="game-section">
            <canvas id="gameCanvas" width="400" height="400"></canvas>
            <div class="score">Score: <span id="score">0</span></div>
            <button id="start-btn">Press Start</button>
        </div>
        <div class="task-section hidden" id="task-section">
            <h2>Complete Tasks</h2>
            <button class="task-btn" id="join-group">Join @thesatoshicircle (100 TOSHI)</button>
            <button class="task-btn" id="subscribe-channel">Subscribe to @thesatoshicircle_news (200 TOSHI)</button>
        </div>
        <script>
            // Passiamo l'username al frontend come variabile JS
            const username = "${username}"; // Qui il server inserirà dinamicamente lo username dell'utente
            document.addEventListener('DOMContentLoaded', () => {
                document.getElementById('username').textContent = username; // Sostituisce il contenuto del <span> con lo username effettivo
            });
        </script>
        <script src="script.js"></script>
    </body>
    </html>`;
});

const app = new Application();

// Aggiungi eventuali middleware per gestire le sessioni o l'autenticazione
app.use(async (ctx, next) => {
    // Simulazione: Supponiamo che stai aggiungendo l'username al contesto
    ctx.state.user = { username: "kinto47" }; // Cambia questa linea in base al metodo di autenticazione reale
    await next();
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8080");
await app.listen({ port: 8080 });
