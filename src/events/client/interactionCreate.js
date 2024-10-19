module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {

        if (!interaction.isCommand()) return;

        //Crear Nuestra Coleccion de Comandos;
        const command = client.creadorcommands.get(interaction.commandName);

        if (!command) {
            await interaction.reply({ content: 'Lo siento, no es un comando valido. Intenta con otro diferente'});
            return;
        };

        try{

            await interaction.deferReply();
            await command.run({ interactionm, client });

        } catch(error){
            console.error('Hubo un error al intentar ejecutar el comando', error);
            await interaction.followUp({ content: 'Hubo un error al intentar ejecutar el comando'});
        }
    });
};