module.exports = (client) => {

    try {
        client.on('messageCreate', async(message) => {

            if (message.mentions.has(client.user)) {
                if (message.content.toLowerCase().includes('invitacion')) {
                    try{
                        const inviteLink =  "https://discord.com/oauth2/authorize?client_id=1297228595172868177&permissions=8&integration_type=0&scope=bot";
                        return message.channel.send(`Aqui esta la invitacion del bot que solicitaste: ${inviteLink}`);
                    } catch (error) {
                        console.log('Hubo un problema al generar la invitacion', error);
                        return message.channel.send('Hubo un error al generar la invitacion, intenta de nuevo.');
                    }
                }
            }
        });
    } catch (error) {
        console.error('No se pudo enviar la invitacion', error);
    }
}