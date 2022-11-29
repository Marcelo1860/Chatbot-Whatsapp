const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const client = new Client();
var chat_id = new Array();
var esta = new Boolean(false);

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log(qr);
    qrcode.generate(qr,{small:true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {

    if (msg.body == 'Chelobot'){
        
        console.log(msg.from);
        for(var i =0; i < chat_id.length; i++){
            if(chat_id[i] == msg.from){
                esta = true;
                console.log(chat_id[i]);
                
            }
        }
        if (esta == false){
            chat_id.push(msg.from);
            /*for(var i =0; i < chat_id.length; i++){
                console.log(chat_id[i]);
            }*/
        }
        
    }

    else if (msg.body != '') {
        for(var i =0; i < chat_id.length; i++){
            if(chat_id[i] == msg.from){
                msg.reply('De una');
            }
        }
    }
    /*if (msg.body == '!ping') {
        msg.reply('pong');
    }
    if (msg.body == 'Hola') {
        msg.reply('Hola mi nombre es Marcelo');
    }*/
    
});

client.initialize();