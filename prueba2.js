const { Client, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs')
const exceljs = require('exceljs');
const moment = require('moment');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode-terminal');
const app = express();
const client = new Client();
var chat_id = new Array();
var esta = new Boolean(false);


app.use(cors())
app.use(express.urlencoded({ extended:true }))

const sendWithApi = (req,res) => {
    const {message, to } = req.body;
    const newNumber = `${to}@c.us`
    console.log(message, to);

    sendMessage(newNumber, message)
    
    res.send({ status: 'Enviado' })
}

app.post('/send', sendWithApi);


client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log(qr);
    qrcode.generate(qr,{small:true});
});

client.on('ready', () => {
    console.log('Client is ready!');
    listenMessage();
});

const listenMessage = () => {

client.on('message', msg => {

    const {from, to , body} = msg;

    switch(body){
        case 'Quiero info':
            sendMessage(from,'De que busca informacion?')
            break;
        case 'Chau':
            sendMessage(from,'Nos estamos viendo!')
            break;
        case 'Fútbol':
            sendMessage(from,'Belgrano, Boca, River o Talleres?')
            break;
        case 'Belgrano':
            sendMedia(from, 'Belgrano.png')
            break
        case 'Boca':
            sendMedia(from, 'Boca.png')
            break
        case 'River':
            sendMedia(from, 'River.png')
            break
        case 'Talleres':
            sendMedia(from, 'Talleres.png')
            break
    }
    saveHistorial(from, body);

    console.log(from, to , body);
 
});
}

const sendMessage=(to, message) => {
    client.sendMessage(to, message);
}

const sendMedia = (to, file) => {

    const mediaFile = MessageMedia.fromFilePath(`./mediaSend/${file}`)

    client.sendMessage(to, mediaFile)

}

const saveHistorial = (number, message) => {
    const pathChat = `./chats/${number}.xlsx`;
    const workbook = new exceljs.Workbook();
    const today = moment().format('DD-MM-YYYY hh:mm');

    if(fs.existsSync(pathChat)) {
        workbook.xlsx.readFile(pathChat)
        .then(() =>{
            const worksheet = workbook.getWorksheet(1);
            const lastRow = worksheet.lastRow;
            let getRowInsert = worksheet.getRow(++(lastRow.number))
            getRowInsert.getCell('A').value = today;
            getRowInsert.getCell('B').value = message;
            getRowInsert.commit();
            workbook.xlsx.writeFile(pathChat)
            .then(() => {
                console.log('Se agregó chat');
            })
            .catch(() => {
                console.log("Algo ocurrió agregando el chat");
            })
    

        })

    } else{
        //CREAMOS
        const worksheet = workbook.addWorksheet('Chats');
        worksheet.columns = [
            {header:'Fecha',key:'data'},
            {header:'Mensaje',key:'message'},
        ]
        worksheet.addRow([today,message])
        workbook.xlsx.writeFile(pathChat)
        .then(() => {
            console.log('Historial creado!');
        })
        .catch(() => {
            console.log("Algo falló");
        })
    }


}

client.initialize();

app.listen(9000, () => {
    console.log('API ESTA ARRIBA!');
})