const fs = require('fs')
//const ora = require('ora');
//const chalk = require('chalk');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');


const SESSION_FILE_PATH = 'C:/universidad/bot_whatsapp/session.json';

let client;
let sessionData;



const withSession =() => {
 console.log('Session iniciada');   
 //const spinner = ora(`Caragndo ${chalk.yellow('Validando session con Whatsapp...')}`);
 sessionData = require(SESSION_FILE_PATH);
 //spinner.start();

 client = new Client({
    authStrategy: new LocalAuth({
        
        session: sessionData
    })
})

 client.on('ready', () => {
    console.log('Client is ready!');
    //spinner.stop();
});

client.on('auth_failure',() => {
    console.log("error de autentucacion");
})

client.initialize();
}

/**
 * Esta funcion GENERA EL QRCODE    ***
 */


const withOutSession = () => {
 console.log('No tenemos session guardada');
 client = new Client({
    authStrategy: new LocalAuth({
        
        session: sessionData
    })
});
 client.on('qr', qr => {
     qrcode.generate(qr, {small:true});
});

 client.on('authenticated', (session) => {   
    // Guardamos credenciales de session para usar luego
    sessionData = session;
    //console.log("hola")
    //console.log(typeof(session) );
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if(err){
            console.log(err);
        }
    });

});

    client.initialize();

}

/** */
(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withOutSession();