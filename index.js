//Constantes Principales
const dotenv = require('dotenv');
const { Client,GatewayIntentBits, ActivityType } = require('discord.js');

//Base de Datos
const { initializeMongoose } = require('./src/functions/database/mongoose');

//Carga de Comandos
const { registerCommands } = require('./src/functions/client/registerCommands.js');
const { loadCommands } = require('./src/functions/client/loadCommands.js');
const guildAddHandler = require('./src/utils/commands/guildAdd.js');

//Carga de Eventos
const interactionCreateHandler = require('./src/events/client/interactionCreate.js');
const inviteHandler = require('./src/events/client/invite.js');

//Conexion Nitrado
const { Gameserver } = require('./src/services/nitradoApi/gameserver.js'); 
const { initializeNitradoBot } = require('./src/services/nitradoApi/conectNitrado.js');


//Manejador de Errores
const errorHandler = require ('./src/utils/client/errorHandler');
const globalErrorHandler = require('./src/utils/client/globarErrorHandler');

//Configuracion ENV
dotenv.config({path: './config/.env'});

const TOKEN = process.env.tokenBot;
const nitrado_id = process.env.nitrado_id;
const nitrado_token = process.env.nitrado_token;

//Crear Cliente Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
    ],
});

//Cargar Mapas
client.creadorcommands = new Map();

//Crear Comandos del Bot
let commands = [];
loadCommands(client, commands);
registerCommands(client,commands);
guildAddHandler(client, commands);

//Nitrado
const gameServer = new Gameserver(nitrado_id, nitrado_token);

initializeNitradoBot(client, gameServer);

//Declaracion de Eventos
interactionCreateHandler(client);
globalErrorHandler(client);
errorHandler(client);
inviteHandler(client);

//Arrancar bot
initializeMongoose()
    .then(() => {
        console.log("Conexión a MongoDB exitosa");
        
        // Arrancar bot
        client.on("ready", () => {
            console.log(`Entrando como ${client.user.tag}`);
            registerCommands(client, commands);
        });

        client.login(TOKEN);
    })
    .catch((err) => {
        console.error("No se pudo establecer conexión a MongoDB", err);
    });