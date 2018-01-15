var mysql = require('sync-mysql'); /// https://github.com/ForbesLindesay/sync-mysql
var https = require('https');


var urlFipeBrands = "https://fipeapi.appspot.com/api/1/[tipo]/marcas.json";
var urlFipeModels = "https://fipeapi.appspot.com/api/1/[tipo]/veiculos/:idBrand.json";

var con = new mysql({
    host: "localhost",
    user: "root",
    password: "",
    database: "mydb"
  });

  
initIntegrator();

function initIntegrator(){
    var aUrlCars = urlFipeBrands.replace("[tipo]", "carros");
    var aUrlMotorcycle = urlFipeBrands.replace("[tipo]", "carros");
    var aUrlTruck = urlFipeBrands.replace("[tipo]", "caminhoes");
    
    requestBrandsFipeWS(aUrlCars, 0);
    requestBrandsFipeWS(aUrlMotorcycle, 1);
    requestBrandsFipeWS(aUrlTruck, 2);
    
}

function searchAllBrands(){
    var result = con.query("Select * from brand");
    console.log("fields");
    console.log(result);        
    return result;
    
}

function requestBrandsFipeWS(pUrl, pTypeVehicle){

    https.get(pUrl, (resp) => {
    let data = '';
    
    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
        data += chunk;
    });
    
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
        
        /// TO-DO Insere marca se não existe
        insertBrandsIfNotExist(JSON.parse(data), pTypeVehicle);
    });
    
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}

function insertBrandsIfNotExist(pBrandArray, pTypeVehicle){
    arrayBrandsBD = searchAllBrands();
    var brandId;
    console.log("arrayBrandsBD");
    console.log(arrayBrandsBD);
    
    if (arrayBrandsBD){
        for (var i=0; i<pBrandArray.length; i++){

            var exists = arrayBrandsBD.filter(function( objDB ) {
                return objDB.idFipe == pBrandArray[i].id;
            });
            
            // if not exists
            if (exists.length == 0){
                brandId = insertBrand(pBrandArray[i], pTypeVehicle);
            } else{
                brandId = exists[0].id;
                console.log(pBrandArray[i].fipe_name+" já esta inserido");
            }
            requestModelsFipeWS(pBrandArray[i].id, brandId, pTypeVehicle);
        }
    }
}

function insertBrand(pObjBrandFipe, pTypeVehicle){
    
    var result = con.query("INSERT INTO brand(name, idFipe, typeVehicle) Values(?, ?, ?);", [pObjBrandFipe.fipe_name, pObjBrandFipe.id,pTypeVehicle] );
    console.log(pObjBrandFipe.fipe_name+" inserido com sucesso!");
    
    return result.insertId;
}

function searchModelsByBrand(pIdBrand){
    var result = con.query("Select * from model where idBrand = ?", [pIdBrand]);
    console.log("fieldsModel");
    console.log(result);        
    return result;
}

function requestModelsFipeWS(pBrandIdFipe, pBrandId, pTypeVehicle){
    var urlSpecific = urlFipeModels;
    urlSpecific = urlSpecific.replace(":idBrand", pBrandIdFipe);
    if (pTypeVehicle == 0){
        urlSpecific = urlSpecific.replace("[tipo]", 'carros');
    } else if (pTypeVehicle == 1){
        urlSpecific = urlSpecific.replace("[tipo]", 'motos');
    } else if (pTypeVehicle == 2){
        urlSpecific = urlSpecific.replace("[tipo]", 'caminhoes');
    }
    console.log(urlSpecific);
    https.get(urlSpecific, (resp) => {
        let data = '';
        
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            console.log(data);
            insertModelsIfNotExist(JSON.parse(data), pBrandIdFipe, pBrandId);
        });
        
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
}

function insertModelsIfNotExist(pModelArray, pBrandIdFipe, pBrandId){
    console.log("arrayModelsBD");
    
    arrayModelsBD = searchModelsByBrand(pBrandId);
    
    console.log(arrayModelsBD);
    
    if (arrayModelsBD){
        for (var i=0; i<pModelArray.length; i++){

            var exists = arrayModelsBD.filter(function( rowModel ) {
                return rowModel.idFipe == pModelArray[i].id;
            });
            
            // if not exists
            if (exists.length == 0){
                insertModel(pModelArray[i],pBrandId);
            } else{
                console.log(pModelArray[i].fipe_name+" já esta inserido");
            }
        }
    }
}

function insertModel(pObjModelFipe,pMyBrandId){
    var result = con.query("INSERT INTO model(name, idBrand, idFipe) Values(?, ?, ?);",
                         [pObjModelFipe.fipe_name,pMyBrandId, pObjModelFipe.id] );
    console.log(pObjModelFipe.fipe_name+" inserido com sucesso!");
}
