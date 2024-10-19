const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const colors = require('colors');
const EmbedModel = require('../../functions/database/schemas/embedSchema');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

function initializeNitradoBot(client, gameServer) {
    client.once('ready', async () => {
        log(colors.green('Nitrado Bot is Ready.'));
        if (client.user) {
            log(colors.green(`Bot logged in as ${colors.yellow(client.user.tag)}.`));
            log(colors.green(`Running on ${colors.yellow(client.guilds.cache.size.toString())} servers.`));
            log(colors.yellow("Starting Nitrado API Ping..."));

            try {
                const response = await gameServer.ping();
                if (response.status === 'success') {
                    log(colors.green('Ping to Nitrado API was successful.'));
                } else {
                    log(colors.red('Ping to Nitrado API was unsuccessful. Exiting...'));
                    process.exit(1);
                }
            } catch (error) {
                log(colors.red(`Error during ping: ${error.message}`));
                process.exit(1);
            }
        }

        scheduleStatusUpdate(gameServer, client);
        setInterval(() => updateEmbedMessages(client, gameServer), 900000); // 15 minutos
    });

    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        //const adminServer = '1296865098463449119'; Comprueba Rol Autorizado (Remplazar por ID Rol)
       //const canalConsola = '1296440024195141686'; Comprueba Canal de Comandos (Remplazar por ID canal Comandos)
		//const canalAnuncios = '1294050449925869609'; Comprueba Canal de Anuncios (Remplazar por ID del canal donde ira el comando !setupembed)

        //Una vez completado lo de arriba, descomenta la linea de aca abajo
       //	const autorizacionCanal = (message.channel.id !== canalConsola || (message.content === '!setupembed' && message.channel.id === canalAnuncios)); 
			
        //Esta tambien.
		// if (!autorizacionCanal) return;
        
        
        if (!message.member.roles.cache.has(adminServer)) {
            return;
        };

        const { content } = message;
        if (content === '!ping') {
            await handlePingCommand(gameServer, message);
        } else if (content === '!restart') {
            await handleRestartCommand(gameServer, message);
        } else if (content === '!stop') {
            await handleStopCommand(gameServer, message);
        } else if (content === '!start') {
            await handleStartCommand(gameServer, message);
        } else if (content === '!setupembed') {
            await handleSetupEmbedCommand(gameServer, message);
        };
    });
}

async function handlePingCommand(gameServer, message) {
    const response = await gameServer.ping();
    const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle("Ping")
        .setDescription("Haciendo Ping a Nitrado Api")
        .setTimestamp();

    const responseEmbed = await message.reply({ embeds: [embed] });
    log(colors.green(`Ping to Nitrado API was ${response.status === 'success' ? 'successful' : 'unsuccessful'} by ${message.author.tag}.`));
    return await responseEmbed.edit({ embeds: [createResponseEmbed(response.status, response.message)] });
}

async function handleRestartCommand(gameServer, message) {
    const response = await gameServer.restart();
    log(colors.green(`Server restarted by ${message.author.tag}. ${response.status}`));
    await message.reply({ embeds: [createResponseEmbed(response.status, response.message)] });
    await updateEmbedMessages(message.client, gameServer);
    return
}

async function handleStopCommand(gameServer, message) {
    const response = await gameServer.stop();
    log(colors.green(`Server stopped by ${message.author.tag}. ${response.status}`));
    await message.reply({ embeds: [createResponseEmbed(response.status, response.message)] });

    await updateEmbedMessages(message.client, gameServer);
    return;
}

async function handleStartCommand(gameServer, message) {
    const response = await gameServer.restart();
    log(colors.green(`Server started by ${message.author.tag}. ${response.status}`));
    await message.reply({ embeds: [createResponseEmbed(response.status, response.message)] });
    await updateEmbedMessages(message.client, gameServer);
    return;
}

async function handleSetupEmbedCommand(gameServer, message) {
    try {
        const status = await gameServer.getStatus(); //Aca se obtiene el estado actual del servidor.

        var statusEs = "";

        switch (status) {
            case 'started':
                var statusEs = "Iniciado / Started";
                break;
            case 'restarting':
                var statusEs = "Reiniciando / Restarting";
                break;
            case 'stopping':
                var statusEs = "Deteniendo / Stopping";
                break;
            case 'stopped':
                var statusEs = "Detenido / Stopped"
                break;
        }

        const players = await gameServer.getOnlinePlayers();

        //Usalo para cambiar la Imagen del Embed.
        const imagenPrendido = "https://media.discordapp.net/attachments/1293535320595239026/1296872832411893801/INICIANDOSE.jpg?ex=6713de71&is=67128cf1&hm=b3bdfaf327bb895723757c6c07a10137f3c5ef52af4e07d54017a9351a3ddd44&=&format=webp&width=550&height=289";
        const imagenApagado = "https://media.discordapp.net/attachments/1293535320595239026/1296872690736435230/APAGADO.jpg?ex=6713de50&is=67128cd0&hm=8b63c393789ce1fa5abee0bd92b3b8d433f005f6b329ca03efb2a29f9df668a6&=&format=webp&width=624&height=468";

        const embed = new EmbedBuilder()
            .setColor('313850')
            .setTitle("Estado del Servidor")
            .setDescription(`Ahora Mismo: ${statusEs}\nJugadores Actuales: ${players.length}`)
            .setImage(status === 'started' ? imagenPrendido : imagenApagado)
            .setTimestamp();

        const msg = await message.channel.send({ embeds: [embed] });

        const embedData = new EmbedModel({
            guildId: message.guild.id,
            channelId: message.channel.id,
            messageId: msg.id,
        });

        await embedData.save();
        return message.reply("Se creo y guardo el embed correctamente.");
    } catch (error) {
        console.log("Hubo un problema al crear el embed", error)
        return;
    };
}

function createResponseEmbed() {
    return new EmbedBuilder()
        .setColor('313850')
        .setTitle("Procesando la peticion.")
        .setDescription(`Espera un momento por favor!`)
        .setTimestamp();
}

async function scheduleStatusUpdate(gameServer, client) {
    await updateStatus(gameServer, client);
    setTimeout(() => scheduleStatusUpdate(gameServer, client), 15000);
}

async function updateStatus(gameServer, client) {
    log(colors.yellow('Updating server status...'));
    const status = await gameServer.getStatus();

    // Evitar cambiar el estado si ya está en el mismo estado
    if (client.user?.presence?.status === status) return;

    switch (status) {
        case 'started':
            client.user?.setStatus('online');
            break;
        case 'stopped':
            client.user?.setStatus('dnd');
            break;
        case 'restarting':
        case 'stopping':
            client.user?.setStatus('idle');
            break;
    }

    const players = await gameServer.getOnlinePlayers();
    log(colors.green(`Server ${status} with ${players.length} players online.`));
    await client.user?.setActivity({ name: `Server ${status}, ${players.length} players online`, type: 'PLAYING' });
    await updateEmbedMessages(client, gameServer);
}

async function updateEmbedMessages(client, gameServer) {
    const embeds = await EmbedModel.find();

    for (const embed of embeds) {
        try {
            const channel = await client.channels.fetch(embed.channelId);

            if (channel) {
                const message = await channel.messages.fetch(embed.messageId);

                //Si cambiaste la imagen arriba, aca tambien debes hacerlo.
                const imagenPrendido = "https://media.discordapp.net/attachments/1293535320595239026/1296872832411893801/INICIANDOSE.jpg?ex=6713de71&is=67128cf1&hm=b3bdfaf327bb895723757c6c07a10137f3c5ef52af4e07d54017a9351a3ddd44&=&format=webp&width=550&height=289";
                const imagenApagado = "https://media.discordapp.net/attachments/1293535320595239026/1296872690736435230/APAGADO.jpg?ex=6713de50&is=67128cd0&hm=8b63c393789ce1fa5abee0bd92b3b8d433f005f6b329ca03efb2a29f9df668a6&=&format=webp&width=624&height=468";

                if (message) {
                    var statusEs = "";
                    const status = await gameServer.getStatus();
                    switch (status) { //Remplazar el status devuelto por un mensaje en español.
                        case 'started':
                            var statusEs = "Iniciado / Started";
                            break;
                        case 'restarting':
                            var statusEs = "Reiniciando / Restarting";
                            break;
                        case 'stopping':
                            var statusEs = "Deteniendo / Stopping";
                            break;
                        case 'stopped':
                            var statusEs = "Detenido / Stopped"
                            break;
                    }
                    const players = await gameServer.getOnlinePlayers();
                    const newEmbed = new EmbedBuilder()
                        .setColor('313850')
                        .setTitle("Estado del servidor")
                        .setDescription(`Ahora Mismo: ${statusEs}\nJugadores Activos: ${players.length}`)
                        .setImage(status === 'started' ? imagenPrendido : imagenApagado)
                        .setTimestamp();

                    await message.edit({ embeds: [newEmbed] });
                    log(colors.green(`Updated embed in channel ${embed.channelId} with new status: ${status}.`));
                }
            }
        } catch (error) {
            log(colors.red(`Error updating embed: ${error.message}`));
        }
    }
}

function log(message) {
    console.log(getTime() + message);
}

function getTime() {
    const dateTime = new Date();
    return colors.gray(`[${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()}] `);
}

module.exports = { initializeNitradoBot };
