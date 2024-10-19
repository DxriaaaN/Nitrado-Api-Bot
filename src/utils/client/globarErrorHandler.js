module.exports = () => {
    try{
        process.on('unhandledRejection', (error) => {
            console.error('Unhandled promise rejection', error);
        });

        process.on('uncaughtException', (error) => {
            console.error('Uncaught exception', error);
        });

        process.on('uncaughtExceptionMonitor', (error) => {
            console.error('Uncaught exception (Monitor): ', error);
        });

    }catch(error){
        console.error('Hubo un problema al agarrar el error.', error);
    }
};