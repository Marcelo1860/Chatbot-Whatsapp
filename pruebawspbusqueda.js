const { Client, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs')
const exceljs = require('exceljs');
const moment = require('moment');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode-terminal');
const XLSX = require('xlsx');
const { Console } = require('console');
const { sendMessageButton } = require('C:/universidad/bot-whatsapp-main/controllers/send');
const Buttons = require('whatsapp-web.js/src/structures/Buttons');
const app = express();
const client = new Client();
var dataExcel = Array();
var chat_id = new Array();
var esta = new Boolean(false);
var boton = new Buttons("hola",Buttons.ButtonSpec[1])

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

client.on('message', async msg => {

    const {from, to , body} = msg;

    if(esta == false){

    switch(body){
        case 'Quiero info':
            esta = true;
            sendMessage(from,'Ingrese el producto a buscar: ')
            leerExcel('productos.xlsx'); 
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
        case 'Boton':
            await sendMessageButton(

                
                {
                    title:"¿Que te interesa ver?",
                    message:"Recuerda todo este contenido es gratis y estaria genial que me siguas!",
                    footer:"Gracias",
                    buttons:[
                        {body:"😎 Cursos"},
                        {body:"👉 Youtube"},
                        {body:"😁 Telegram"}
                    ]
                }
            )
            break
    }
}

else {
    busquedaExcel(from,body);
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

function leerExcel(ruta) {

    const workbook = XLSX.readFile(ruta);
    const workbookSheets = workbook.SheetNames;
    //console.log(workbookSheets);

    const sheet = workbookSheets[0];

    dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    //console.log(dataExcel.Producto);

    for(const itemfile of dataExcel){
        
        //console.log(itemfile['Producto']);
    }

}

function busquedaExcel(from,el_valor) {

    let seleccionados = [];
    console.log("el_valor");
    console.log(el_valor);

    dataExcel.forEach(j => {
        //if(j.nombre.startsWith(elValor))
        if (j.Producto.includes(el_valor)) {
          // si lo incluye agregalo al array de los seleccionados

          seleccionados.push(j.Producto);
          console.log(j.Producto)
        }
      })
      const contador = 0;

      seleccionados.forEach(elel => {

          console.log(elel);

      });

     
        sendMessage(from,"Aqui tiene algunos de los resultados obtenidos");
        for (var i = 0; i < 9; i++) {
            sendMessage(from,seleccionados[i]);
         }
      

    
}



client.initialize();

app.listen(9000, () => {
    console.log('API ESTA ARRIBA!');
})