module.exports = (client) => {
    try{
        client.on('error', (error) => {
            console.error('Discord tuvo un error de cliente.', error);
        });

        client.on('warn', (warning) => {
            console.warn('Discord tuvo una advertencia.', warning);
        });
    }catch(error) {
        console.error('Hubo un problema al capturar el error', error)
        return
    }
};