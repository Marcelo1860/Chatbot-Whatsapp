const exceljs = require('exceljs');
const XLSX = require('xlsx');
const prompt = require('prompt');
//const workbook = new exceljs.Workbook();
var dataExcel = Array();
prompt.start();


function leerExcel(ruta) {

    const workbook = XLSX.readFile(ruta);
    const workbookSheets = workbook.SheetNames;
    //console.log(workbookSheets);

    const sheet = workbookSheets[0];

    dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    //console.log(dataExcel.Producto);

    /*for(const itemfile of dataExcel){
        
        console.log(itemfile['Producto']);
    }*/

}



function busquedaExcel() {

    let seleccionados = [];

    let el_valor = "Rodillo";

    dataExcel.forEach(j => {
        //if(j.nombre.startsWith(elValor))
        if (j.Producto.includes(el_valor)) {
          // si lo incluye agregalo al array de los seleccionados
          seleccionados.push(j.Producto);
        }
      });

      for(const itemfile of seleccionados){
        
        console.log(itemfile);
    } 
}

leerExcel('productos.xlsx'); 
busquedaExcel();
