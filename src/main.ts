// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { reactive } from 'vue';
import { IonicVue } from '@ionic/vue';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { App } from '@capacitor/app';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

export function saveChecker(saveFile){
    if(saveFile['saveVersion'] == 4){
        saveFile['records']['accounts'] = [];
        saveFile['records']['categories'] = ['Contract Work'];
        saveFile['saveVersion'] = 5;
    }
    if(saveFile['saveVersion'] == 5){
        saveFile['records']['homeExpenses'] = {};
        saveFile['saveVersion'] = 6;
    }
    if(saveFile['saveVersion'] == 6){
        saveFile['colours']['colourWhite']['name'] = 'Clear';
        for(const[projectID, projectDict] of Object.entries(saveFile['projects'])){
            for(const[weekID, weekDict] of Object.entries(projectDict['weeks'])){
                weekDict['invoiced'] = false;
            }
        }
        saveFile['saveVersion'] = 7;
    }
    if(saveFile['saveVersion'] == 7){
        for(const[projectID, projectDict] of Object.entries(saveFile['projects'])){
            projectDict['targetHours'] = 0;
        }
        saveFile['saveVersion'] = 8;
    }
    if(saveFile['saveVersion'] == 8){
        for(const[yearID, recordsDict] of Object.entries(saveFile['records'])){
            if(yearID != 'accounts' && yearID != 'categories' && yearID != 'homeExpenses'){
                if(recordsDict['transactions'] != undefined){
                    for(const[transID, transDict] of Object.entries(recordsDict['transactions'])){
                        transDict['receiptID'] = '';
                    }
                }
                
            }
        }
        saveFile['saveVersion'] = 9;
    }
    if(saveFile['saveVersion'] == 9){
        delete saveFile['records']['homeExpenses']
        saveFile['records']['savedTransactions'] = {}
        saveFile['saveVersion'] = 10;
    }
    if(saveFile['saveVersion'] == 10){
        const categoryCopy = [... saveFile['records']['categories']];
        saveFile['records']['categories'] = {};
        categoryCopy.forEach(item => {
            saveFile['records']['categories'][item] = true;
        });
        saveFile['saveVersion'] = 11;
    }
    if(saveFile['saveVersion'] == 11){
        saveFile['records']['payee'] = [];
        saveFile['saveVersion'] = 12;
    }
    if(saveFile['saveVersion'] == 12){
        for(const[yearID, recordsDict] of Object.entries(saveFile['records'])){
            if(yearID != 'accounts' && yearID != 'categories' && yearID != 'homeExpenses'){
                if(recordsDict['transactions'] != undefined){
                    for(const[transID, transDict] of Object.entries(recordsDict['transactions'])){
                        transDict['payee'] = '';
                        transID;
                    }
                }
            }
        }
        saveFile['saveVersion'] = 13;
    }
    if(saveFile['saveVersion'] == 13){
        saveFile['showGST'] = true;
        saveFile['saveVersion'] = 14;
    }
    if(saveFile['saveVersion'] == 14){
        saveFile['saveVersion'] = 15;
    }
    if(saveFile['saveVersion'] == 15){
        for(const[projectID, projectDict] of Object.entries(saveFile['projects'])){
            for(const[weekID, weekDict] of Object.entries(projectDict['weeks'])){
                for(const[colourID, cellsArr] of Object.entries(weekDict['colouredCells'])){
                    cellsArr.forEach((cellID, i) => {
                        const cellInt = parseInt(cellID.substring(1)) - 1;
                        const cellCol = cellID.charAt(0);
                        cellsArr[i] = `${cellCol}${cellInt}`
                    })
                }
            }
        }
        saveFile['saveVersion'] = 16;
    }
    if(saveFile['saveVersion'] == 16){
        saveFile['timeLogged'] = {"01/01/1970": 0}
        saveFile['saveVersion'] = 17
    }
    if(saveFile['saveVersion'] == 17){
        for(const[objKey, objDict] of Object.entries(saveFile['timeLogged'])){
            saveFile['timeLogged'][objKey] = {'hours': objDict, 'pay': 0}
        }
        saveFile['saveVersion'] = 18
    }
    if(saveFile['saveVersion'] == 18){
        for(const[projectID, projectDict] of Object.entries(saveFile['projects'])){
            for(const[weekID, weekDict] of Object.entries(projectDict['weeks'])){
                let weekTotal = 0
                for(const [colourID, cellList] of Object.entries(weekDict['colouredCells'])){
                    if(cellList.length != 0){
                        const qty = (Math.round((1/(60/projectDict['timeInterval'])) * 1000) / 1000) * cellList.length;
                        const total = qty * parseFloat(saveFile['colours'][colourID]['rate']);
                        weekTotal += total
                    }
                } 
                weekDict['total'] = weekTotal.toFixed(2)
            }
        }
        saveFile['saveVersion'] = 19
    }
    if(saveFile['saveVersion'] == 19){
        saveFile['archive'] = {}
        saveFile['archive']['projects'] = {}
        saveFile['saveVersion'] = 20
    }
    if(saveFile['saveVersion'] == 20){
        for(const[projectID, projectDict] of Object.entries(saveFile['projects'])){
            delete projectDict['colours'];
            projectDict['colour'] = ["#014a88", '#35a2ff']
        }
        saveFile['saveVersion'] = 21
    }
    if(saveFile['saveVersion'] == 21){
        for(const[yearID, recordsDict] of Object.entries(saveFile['records'])){
            if(yearID != 'accounts' && yearID != 'categories' && yearID != 'homeExpenses'){
                if(recordsDict['transactions'] != undefined){
                    for(const[transID, transDict] of Object.entries(recordsDict['transactions'])){
                        transDict['receiptID'] = '';
                        transDict['id'] = transID;
                    }
                }
                
            }
        }
        saveFile['records']['headingStates'] = [ 'month', 'date', 'type', 'account', 'category', 'item', 'payee', 'amount', "receiptID" ]
        saveFile['saveVersion'] = 22
    }
    if(saveFile['saveVersion'] == 22){
        for(const[projectID, projectDict] of Object.entries(saveFile['projects'])){
            for(const[weekID, weekDict] of Object.entries(projectDict['weeks'])){
                if(weekDict['invoiced']){
                    weekDict['invoiceSent'] = true;
                }else{
                    weekDict['invoiceSent'] = false;
                }
            }
        }
        saveFile['saveVersion'] = 23
    }
    return saveFile
}
const userDictMaster = {"projects": {}, "clients": {}, "colours": {'colourWhite':{'name': 'Clear', 'colour': '#ffffff'}}, "users": {}, "records": {"accounts": [],"payee": [], "categories": {}, 'savedTransactions': {}, 'headingStates': [ 'month', 'date', 'type', 'account', 'category', 'item', 'payee', 'amount', "receiptID" ]}, "saveVersion": 23, "showGST": true, "version": "", "timeLogged": {"01/01/1970": {'hours': 0, 'pay': 0}}, 'archive': {'projects': {}}}
let userDictRead = undefined;
try {
    await Filesystem.mkdir({ path: "DashBooks", directory: Directory.Documents, recursive: false })
} catch (error) {
    //Hi Dad
}
try {
    await Filesystem.mkdir({ path: "DashBooks/Receipts", directory: Directory.Documents, recursive: false })
} catch (error) {
    //Hi Dad
}
try {
    let listFiles = await Filesystem.readdir({ path: "DashBooks", directory: Directory.Documents })
    if(!(Object.values(listFiles).indexOf('userData.ssdb') > -1)) {
        let string = JSON.stringify(userDictMaster)
        await Filesystem.writeFile({ path: "DashBooks/userData.ssdb", data: string, directory: Directory.Documents, recursive: false, encoding: Encoding.UTF8 })
    }
} catch (error) {
    //Hi Dad
}
userDictRead = await Filesystem.readFile({ path: "DashBooks/userData.ssdb", directory: Directory.Documents, encoding: Encoding.UTF8 })
let parsedUser = JSON.parse(userDictRead['data']);
export const userDict = reactive({...parsedUser})





const app = createApp(App)
    .use(IonicVue)
    .use(router);
  
router.isReady().then(() => {
    app.mount('#app');
});