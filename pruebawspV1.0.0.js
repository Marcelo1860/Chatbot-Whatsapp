/*Realiza busqueda tirando primero que se enncontraron relutados y un boton de "ver resultados" y despues al apretarlo una lista*/


const { Client, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs')
const exceljs = require('exceljs');
const moment = require('moment');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode-terminal');
const XLSX = require('xlsx');
const { Console } = require('console');
const WwebjsSender = require("@deathabyss/wwebjs-sender");
const app = express();
const client = new Client();
var dataExcel = Array();
var chat_id = new Array();
var esta = new Boolean(false);
var sec_busc = new Boolean(false);
var body_busq = "";

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

    if (msg.body == 'Quiero info'){
        leerExcel('productos.xlsx'); 
        
            if(!chat_id.includes(msg.from)){
                console.log("hola no lo inlcuye");
                chat_id.push(msg.from);
                let embed = new WwebjsSender.MessageEmbed()
                    .sizeEmbed(26)
                    .setTitle("Hola Hola!")
                    .setDescription('Soy un bot para buscar elementos de pintureria. Ya tengo el registo de tu numero, si deseas despedirte dime "Chau bot". Ingrese el producto a buscar:')

                    WwebjsSender.send({
                        client: client,
                        number: from,
                        embed: embed,
                    });
                    //sendMessage(from,'Ya tengo el registo de tu numero, si deseas despedirte dime "Chau bot"')
                    //sendMessage(from,'Ingrese el producto a buscar: ')
            }

            else {
                console.log("ahora si está");
                sendMessage(from,'Ya tengo tu numero agendado,ingrese el producto a buscar: ')
            }
        
    }

    else if (msg.body == 'Chau bot'){

        for(var i =0; i < chat_id.length; i++){
            if(chat_id[i] == msg.from){
                chat_id.splice(i,1);
                console.log("Se elimina elemento");
                sendMessage(from,'Nos vemos!! Solo dime "Quiero info" ya ahi estaré')
                

            }
        }
    }

    else if (msg.body != ''){
        if(chat_id.includes(msg.from)){
            sendMessage(from,'A la orden, ya busco su producto!')
            if (body == "Ver resultados"){
                sec_busc = true;
                busquedaExcel(from,body_busq);
            }
            else{
                sec_busc = false;
                busquedaExcel(from,body);
                
            }
        }
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
          //console.log(j.Producto)
        }
      })
      const contador = 0;

      var cant_selec = seleccionados.length;

      if(cant_selec > 0){
          body_busq = el_valor;
      }

      seleccionados.forEach(elel => {

          console.log(elel);

      });

      if(sec_busc == false){


      let embed = new WwebjsSender.MessageEmbed()
      .sizeEmbed(26)
      .setTitle("✅ | Busqueda exitosa!")
      .setDescription("Hay resultados")


  let button1 = new WwebjsSender.MessageButton()
      .setCustomId("confirm")
      .setLabel("Ver resultados");


  WwebjsSender.send({
      client: client,
      number: from,
      embed: embed,
      button: [button1],
  });
}

else{
          seleccionados.forEach(elel => {

        sendMessage(from,elel);

        });
}
  console.log(cant_selec);

      /*seleccionados.forEach(elel => {

        sendMessage(from,elel);

        });*/

     
        /*sendMessage(from,"Aqui tiene algunos de los resultados obtenidos");
        for (var i = 0; i < 9; i++) {
            sendMessage(from,seleccionados[i]);
         }*/
      

    
}



client.initialize();

app.listen(9000, () => {
    console.log('API ESTA ARRIBA!');
})