<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="black"></ion-menu-button>
                </ion-buttons>
                <ion-title>Invoice</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content> 
            <div class="form_container">
                <div class="form" style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%);">
                    <div id="top">
                        <div class="side">
                            <label for="amount_projects_invoice">Number of Projects To Invoice:</label>
                            <template v-if="isProjects">
                                <select id="amount_projects_invoice" @change="changeProjectNum" style="margin: 0px 0px 10px;">
                                    <option v-for="(projID, index) in projectKeys" :key="projID">
                                        {{ index + 1 }}
                                    </option>
                                </select>
                            </template>
                            <template v-else>
                                <div class="advisory">Go To Settings To Create A Project</div>
                            </template>
                            <div class="project_selection_container">
                                <template v-if="isProjects">
                                    <template v-for="(n, index) in parseInt(amountOfProjects)" :key="index">
                                        <div class="selection_select">
                                            <label :for="`project_selection_${n}`">Choose a Project and Week:</label>
                                            <select :id="`project_selection_${n}`" @change="checkInvoice" onchange="this.className=this.options[this.selectedIndex].className" class="blackText">>
                                                <template v-for="(projDict, projID) in userObj['projects']" :key="projDict" >
                                                    <template v-for="(weekDict, weekID) in projDict['weeks']" :key="weekID">
                                                        <option :data="projID" :weekid="weekID" :class="`${!weekDict.invoiced && checkDate(weekDict.startDate) && parseFloat(weekDict.total) != 0 ? 'redText' : 'blackText'}`">
                                                        {{ projDict.name }} : {{ weekID }} {{!weekDict.invoiced && checkDate(weekDict.startDate) && parseFloat(weekDict.total) != 0 ? ': Invoice Due!' : ''}}
                                                        </option>
                                                    </template>
                                                </template>
                                            </select>
                                            <p style="color: white" :id="`invoice_selection_alert_${n}`"></p>
                                        </div>
                                    </template>
                                </template>
                            </div>
                        </div>
                        <div class="side">
                            <label for="user_selection">Choose a User:</label>
                            <template v-if="isUsers">
                                <select id="user_selection">
                                    <option v-for="(userDict, userID) in userObj['users']" :key="userDict" :data="userID">
                                        {{ userDict['user'] }}
                                    </option>
                                </select>
                            </template>
                            <template v-else>
                                <div class="advisory">Go To Settings To Create A User</div>
                            </template>
                            
                            <label for="client_selection">Choose a Client:</label>
                            <template v-if="isClients">
                                <select id="client_selection">
                                    <option v-for="(projDict, projID) in userObj['clients']" :key="projDict" :data="projID">
                                        {{ projDict['client'] }}
                                    </option>
                                </select>
                            </template>
                            <template v-else>
                                <div class="advisory">Go To Settings To Create A Client</div>
                            </template>

                            <label for="invoice_date">Invoice Date:</label>
                            <input id="invoice_date" type="date" />

                            <label for="invoice_for">Invoice For:</label>
                            <input id="invoice_for" type="text" />
                            
                            <label for="invoice_ID">Invoice ID:</label>
                            <input id="invoice_ID" type="text" />
                            
                            <label for="invoice_include_colours">Include All Colours:</label>
                            <input id="invoice_include_colours" type="checkbox" />
                        </div>
                        <div class="side">
                            OTHER OPTIONS:
                            <label for="invoice_check_invoice">Mark Invoice as Done:</label>
                            <input id="invoice_check_invoice" type="checkbox" @click="checkInvoice" checked/>
                            
                            <label for="invoice_add_records">Add To Records:</label>
                            <input id="invoice_add_records" type="checkbox" @click="changeState" checked/>
                            <template v-if="addToRecord">
                                <label for="select_account">Account:</label>
                                <template v-if="isAccounts">
                                    <select id="select_account">
                                        <option v-for="account in userObj['records']['accounts']" :key="account" :data="account">
                                            {{ account }}
                                        </option>
                                    </select>
                                </template>
                                <template v-else>
                                    <div class="advisory">Go To Settings To Create An Account</div>
                                </template>
                            </template>
                            
                            <label for="invoice_currency_status">Currency Conversion:</label>
                            <input id="invoice_currency_status" type="checkbox" @click="changeCurrencyStatus"/>
                            <template v-if="currencyConversion">
                                <label for="select_currency_from">Currency to Convert From:</label>
                                <select id="select_currency_from">
                                    <option currency="NZD">NZD</option>
                                    <option currency="AUD">AUD</option>
                                    <option currency="CAD">CAD</option>
                                    <option currency="USD">USD</option>
                                    <option currency="EUR">EUR</option>
                                    <option currency="GBP">GBP</option>
                                    <option currency="TWD">TWD</option>
                                </select>
                                <label for="select_currency_to">Currency to Convert To:</label>
                                <select id="select_currency_to">
                                    <option currency="NZD">NZD</option>
                                    <option currency="AUD">AUD</option>
                                    <option currency="CAD">CAD</option>
                                    <option currency="USD">USD</option>
                                    <option currency="EUR">EUR</option>
                                    <option currency="GBP">GBP</option>
                                    <option currency="TWD">TWD</option>
                                </select>
                            </template>
                            
                        </div>
                    </div>
                    <div id="genButton" class="button_item glossy" style="background-color: var(--primary);" @click="generateInvoice">Print Invoice</div>
                </div>	
            </div>

            <div id="invoice_page" style="display: none;">
                <div id="PRINTtheTHING">
                    <div style="-webkit-print-color-adjust: exact" id="invoice_sheet">
                        <div class="inner">
                            <div class="top_section">
                                <div class="top_left">
                                    <h2 id="user_name_invoice"></h2>
                                    <p id="user_addOne_invoice"></p>
                                    <p id="user_addTwo_invoice"></p>
                                    <p id="user_city_invoice"></p>
                                    <p id="user_country_invoice"></p>
                                    <p id="user_contact_invoice"></p>
                                    <div class="box_with_heading">
                                        <p>Client ID</p>
                                        <p id="client_id_invoice"></p>
                                    </div>
                                    <div class="box_with_heading">
                                        <p>Bill To</p>
                                        <p id="client_name_invoice"></p>
                                        <p id="client_addOne_invoice"></p>
                                        <p id="client_addTwo_invoice"></p>
                                        <p id="client_city_invoice"></p>
                                        <p id="client_country_invoice"></p>
                                    </div>
                                </div>
                                <div class="top_right">
                                    <div class="title">INVOICE</div>
                                    <div class="dual_box_heading">
                                        <div class="box_with_heading">
                                            <p>Invoice #</p>
                                            <p id="invoice_id_invoice"></p>
                                        </div>
                                        <div class="box_with_heading">
                                            <p>Date</p>
                                            <p id="invoice_date_invoice"></p>
                                        </div>
                                    </div>
                                    <div class="box_with_heading">
                                        <p>Invoice Period</p>
                                        <p id="invoice_date_period"></p>
                                    </div>
                                    <div class="box_with_heading">
                                        <p>Invoice For</p>
                                        <p id="invoice_for_invoice"></p>
                                    </div>
                                </div>
                            </div>
                            <template v-for="(dict, keyD) in invoiceData" :key="keyD">
                                <div class="bottom_section">
                                    <span class="bottom_section_title">{{ dict.projName }}</span>
                                    <div v-for="(col, index) in columnLetter" :key="col" :colID="col" class="invoice_sheet_column">
                                        <div class="cell heading">{{ columnHeadings[index] }}</div>
                                        <template v-for="(Info, colourID) in dict" :key="colourID">
                                            <div v-if="colourID != 'projTotal' && colourID != 'projName'" class="cell">{{ keys[index] == 'rate' || keys[index] == 'Total' ? `$ ${numberWithCommas(Info[keys[index]])}` : Info[keys[index]] }}</div>
                                        </template>
                                        <div class="cell"></div>
                                        <div v-if="col == 'C'" class="cell" style="border-left: 1px solid black" >Subtotal</div>
                                        <div v-if="col == 'C'" class="cell" style="border-left: 1px solid black" >Tax</div>
                                        <div v-if="col == 'C'" class="cell" style="font-weight: 600;border-left: 1px solid black" >Total</div>

                                        <div v-if="col == 'D'" class="cell">$ {{ numberWithCommas(dict.projTotal.toFixed(2)) }}</div>
                                        <div v-if="col == 'D'" class="cell">$ 0</div>
                                        <div v-if="col == 'D'" class="cell" style="font-weight: 600;">$ {{ numberWithCommas(dict.projTotal.toFixed(2)) }}</div>
                                    </div>
                                </div>
                            </template>
                            <div class="bottom_section">
                                <div class="invoice_sheet_column">
                                    <div class="cell" style="font-weight: 600;">GRAND TOTAL ({{ currencyFrom }})</div>
                                    <div class="cell" style="font-weight: 600;">$ {{ numberWithCommas(invoiceTotal.toFixed(2)) }}</div>
                                    <template v-if="currencyConversion">
                                        <div class="cell" style="font-weight: 600;">GRAND TOTAL ({{ currencyTo }})</div>
                                        <div class="cell" style="font-weight: 600;">$ {{ numberWithCommas(exhangeCurrency(invoiceTotal, currencyFrom, currencyTo)) }}</div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { PDFGenerator } from '@awesome-cordova-plugins/pdf-generator';
import { userDict } from '../main.ts';
import { generateID } from '../../public/generalFunctions.js';
import $ from 'jquery'
export default {
    name: 'TimeSheetsView',
    components: {
        IonButtons,
        IonContent,
        IonHeader,
        IonMenuButton,
        IonPage,
        IonTitle,
        IonToolbar
    },
    data(){
        return {
            userObj: userDict,
            isProjects: false,
            isUsers: false,
            isClients: false,
            isAccounts: false,
			includedColours: {},
			invoiceData: {},
			amountOfProjects: 1,
			invoiceTotal: 0,
			projectKeys: [],
			columnLetter: ['A', 'B', 'C', 'D'],
			columnHeadings: ['Description', 'Rate', 'Quantity', 'Total $'],
			keys: ['name', 'rate', 'QTY', 'Total'],
            addToRecord: true,
            currencyConversion: false,
            currencyFrom: 'NZD',
            currencyTo: '',
            fileName: '',
        }
    },
    mounted(){
        this.$nextTick(() => {
            Object.keys(userDict['projects']).forEach((projectID, index) => {
                let weekID = Object.keys(userDict['projects'][projectID]['weeks'])[0]
                if(userDict['projects'][projectID]['weeks'][weekID]['invoiced']){
                    $(`#invoice_selection_alert_${index + 1}`).text('This week as already been invoiced')
                }else{
                    $(`#invoice_selection_alert_${index + 1}`).text('')
                }
            })
        });
        this.isProjects = Object.keys(userDict['projects']).length != 0;
        this.isUsers = Object.keys(userDict['users']).length != 0;
        this.isClients = Object.keys(userDict['clients']).length != 0;
        this.isAccounts = userDict['records']['accounts'].length != 0;
        if(this.isProjects){
            this.projectKeys = []
            Object.keys(userDict['projects']).forEach((projectID) => {
                this.projectKeys.push(projectID)
                this.projectKeys.push(projectID)
            })
        }
        if(!(this.isProjects && this.isUsers && this.isClients)){
            $('#genButton').addClass('disable')
        }
        if(!(this.addToRecord && this.isAccounts)){
            $('#genButton').addClass('disable')
        }
    },
    methods: {
        changeCurrencyStatus(){
            this.currencyConversion = $('#invoice_currency_status')[0].checked;
        },
        exhangeCurrency(amount, from, to){
            let url = `https://v6.exchangerate-api.com/v6/${process.env.CURRENCY_API_KEY}/latest/${from}`;
            let exchangedAmount;
            let toRate = 1;
            $.ajax({
                url: url,
                async: false,
                method: 'GET',
                dataType: 'JSON',
                success: function (data) {
                    // Do the currency conversion.
                    toRate = data['conversion_rates'][to];
                    exchangedAmount = parseFloat(amount) * parseFloat(toRate);
                },
                error: function (xhr) {
                    console.log('Error:', xhr);
                }
            });

            return exchangedAmount;
        },
        checkDate(date){
            let newDate = date.split('/');
            newDate = `${newDate[1]}/${newDate[0]}/${newDate[2]}`;
            const d = new Date(newDate);
            const t = new Date();
            const date2 = new Date(d.getTime() + 12096e5);
            if(date2.getTime() <= t.getTime()){
                return true
            }else{
                return false
            }

        },
        numberWithCommas(num) {
			return ((parseFloat(num).toFixed(2)).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));
		},
        changeProjectNum(){
            this.amountOfProjects = $(`#amount_projects_invoice option:selected`).val();
            this.$nextTick(() => {
                this.projectKeys.forEach((projectID, index) => {
                    let weekID = Object.keys(userDict['projects'][projectID]['weeks'])[0]
                    if(userDict['projects'][projectID]['weeks'][weekID]['invoiced']){
                        $(`#invoice_selection_alert_${index + 1}`).text('This week as already been invoiced')
                    }else{
                        $(`#invoice_selection_alert_${index + 1}`).text('')
                    }
                })
            });
        },
        checkInvoice(event){
            let projectID = $(`#${event.target.id} option:selected`).attr('data')
            let weekID = $(`#${event.target.id} option:selected`).attr('weekid')
            if(userDict['projects'][projectID]['weeks'][weekID]['invoiced']){
                $(`#invoice_selection_alert_${event.target.id.split('_')[2]}`).text('This week as already been invoiced')
            }else{
                $(`#invoice_selection_alert_${event.target.id.split('_')[2]}`).text('')
            }
        },
        changeState(){
            this.addToRecord = $('#invoice_add_records')[0].checked;
            if(this.addToRecord == false){
                if(!(this.isProjects && this.isUsers && this.isClients)){
                    $('#genButton').addClass('disable')
                }else{
                    $('#genButton').removeClass('disable')
                }
            }else{
                if(this.isAccounts == false){
                    $('#genButton').addClass('disable')
                }
            }
        },
        getFirstLastDate(arr){
            let dateObjArr = [];
            arr.forEach((date) => {
                let newDate = date.split('/');
                newDate = `${newDate[1]}/${newDate[0]}/${newDate[2]}`;
                let d = new Date(newDate);
                dateObjArr.push(d)
            })
            let firstDate = dateObjArr[0];
            let lastDate = dateObjArr[0];
            dateObjArr.forEach((date) => {
                if(date.getTime() <= firstDate.getTime()){
                    firstDate = date;
                }
                if(date.getTime() >= lastDate.getTime()){
                    lastDate = date;
                }
            })
            return [firstDate, lastDate]
        },
		generateInvoice(){
            if(this.currencyConversion){
                this.currencyFrom = $("#select_currency_from option:selected").attr('currency')
                this.currencyTo = $("#select_currency_to option:selected").attr('currency')
                if(this.currencyFrom == this.currencyTo){
                    this.currencyConversion = false;
                }
            }


            this.invoiceTotal = 0
            //Invoice For
			$('#invoice_for_invoice').text($('#invoice_for').val());
			//Invoice ID
            let invoiceID = $('#invoice_ID').val()
			$('#invoice_id_invoice').text(invoiceID);
            //Dicts
			let clientDict = this.userObj['clients'][$("#client_selection option:selected").attr('data')];
			let userDicts = this.userObj['users'][$("#user_selection option:selected").attr('data')];
			//Invoice Date. Uses todays date if none is selected.
            let today = new Date();
            let dd = String(today.getDate()).padStart(2, '0');
            let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            let yyyy = today.getFullYear();
            today = dd + '/' + mm + '/' + yyyy;
            let invoiceDate = $('#invoice_date').val() ? $('#invoice_date').val().split('-')[2] + '/' + $('#invoice_date').val().split('-')[1] + '/' + $('#invoice_date').val().split('-')[0] : today;
			$('#invoice_date_invoice').text(invoiceDate);
			
            //Process All Data
            this.invoiceData = {};
            let allStartDates = [];
            let includeAllColours = $('#invoice_include_colours')[0].checked;
            for(let i = 1; i <= this.amountOfProjects; i++){
                let projectID = $(`#project_selection_${i} option:selected`).attr('data');
                let weekID = $(`#project_selection_${i} option:selected`).attr('weekid');
                if(!Object.keys(this.invoiceData).includes(projectID)){
                    this.invoiceData[projectID] = {};
                    this.invoiceData[projectID]['projTotal'] = 0;
                    this.invoiceData[projectID]['projName'] = userDict['projects'][projectID]['name'];
                }
                allStartDates.push(userDict['projects'][projectID]['weeks'][weekID]['startDate']);
                if($('#invoice_check_invoice')[0].checked){//Set Invoice Status
                    userDict['projects'][projectID]['weeks'][weekID]['invoiceSent'] = true;
                }
                for(const [colourID, cellList] of Object.entries(userDict['projects'][projectID]['weeks'][weekID]['colouredCells'])){
                    if(cellList.length != 0 || includeAllColours){
                        let qty = (Math.round((1/(60/userDict['projects'][projectID]['timeInterval'])) * 1000) / 1000) * cellList.length;
                        let total = qty * parseFloat(userDict['colours'][colourID]['rate']);
                        if(!Object.keys(this.invoiceData[projectID]).includes(colourID)){
                            this.invoiceData[projectID][colourID] = {'QTY': 0, 'Total': 0}
                        }
                        this.invoiceData[projectID][colourID]['name'] = userDict['colours'][colourID]['name'];
                        this.invoiceData[projectID][colourID]['rate'] = userDict['colours'][colourID]['rate'];
                        this.invoiceData[projectID][colourID]['QTY'] += qty;
                        this.invoiceData[projectID][colourID]['Total'] += total;
                        this.invoiceData[projectID]['projTotal'] += total
                        this.invoiceTotal += total;
                    }
                }
                if(this.invoiceData[projectID]['projTotal'] == 0){
                    userDict['projects'][projectID]['weeks'][weekID]['invoiced'] = true;
                }
            }
            //Invoice Period
            let allDate = this.getFirstLastDate(allStartDates)
            let firstDate = allDate[0];
            let lastDate = new Date(allDate[1]);
            lastDate.setDate(allDate[1].getDate() + 13);
            let zeropad_2 = ['00', '0', ''];
            let firstDate_day = zeropad_2[firstDate.getDate().toString().length] + firstDate.getDate().toString();
            let firstDate_month = zeropad_2[(firstDate.getMonth() + 1).toString().length] + (firstDate.getMonth() + 1).toString();
            let lastDate_day = zeropad_2[lastDate.getDate().toString().length] + lastDate.getDate().toString();
            let lastDate_month = zeropad_2[(lastDate.getMonth() + 1).toString().length] + (lastDate.getMonth() + 1).toString();

            let invoicePeriod = `${firstDate_day}/${firstDate_month}/${firstDate.getFullYear()} to ${lastDate_day}/${lastDate_month}/${lastDate.getFullYear()}`;

            $('#invoice_date_period').text(invoicePeriod);

            
			//User
			$('#user_name_invoice').text(userDicts['name']);
			$('#user_addOne_invoice').text(userDicts['addOne']);
			$('#user_addTwo_invoice').text(userDicts['addTwo']);
			$('#user_city_invoice').text(userDicts['city']);
			$('#user_country_invoice').text(userDicts['country']);
			$('#user_contact_invoice').text(userDicts['contact']);

			
			//client
			$('#client_id_invoice').text(clientDict['client']);
			$('#client_name_invoice').text(clientDict['name']);
			$('#client_addOne_invoice').text(clientDict['addOne']);
			$('#client_addTwo_invoice').text(clientDict['addTwo']);
			$('#client_city_invoice').text(clientDict['city']);
			$('#client_country_invoice').text(clientDict['country']);	
            
            this.fileName = `${invoiceDate.split('/').join("-")} - ${invoiceID}`

            //Add To Records
            if($('#invoice_add_records')[0].checked){
                const transID = generateID(userDict);

                let date = new Date();
                let month = date.getMonth();
                let thisYear = date.getFullYear();
                let yearID;
                if(month < 3){
                    yearID = `${thisYear - 1} - ${thisYear}`;
                }else{
                    yearID = `${thisYear} - ${thisYear + 1}`;
                }
                if(Object.keys(userDict['records']).length == 3){
                    let date = new Date();
                    let thisYear = date.getFullYear();
                    userDict['records'][`${thisYear - 1} - ${thisYear}`] = {'transactions': {}, 'assets': {}};
                    userDict['records'][`${thisYear} - ${thisYear + 1}`] = {'transactions': {}, 'assets': {}};
                }
                if(!Object.keys(userDict['records']).includes(yearID)){
                    userDict['records'][yearID] = {'transactions': {}, 'assets': {}};
                }
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                userDict['records'][yearID]['transactions'][transID] = {'month': monthNames[month], 'date': invoiceDate, 'account': $('#select_account option:selected').val(), 'type': 'Credit', 'item': `${clientDict['client']} - ${invoiceID}`, 'category': 'Contract Work', 'amount': parseFloat(this.invoiceTotal), 'receiptID': '', 'id': transID, 'payee': ''}
            }

			setTimeout(() => {
				this.printInvoice();
			}, 1)
		},
		async printInvoice(id="invoice_page"){
			let html = ``;
			html += `<head><link rel="stylesheet" href="file:///android_asset/www/invoicePrint.css"></head>`
			html += '<body>'+$("#"+id).html()+'</body>';
            let options = {
                documentSize: 'A4',
                type: 'share',
                fileName: `${this.fileName}`
            }
            document.addEventListener('deviceready', function(){
                PDFGenerator.fromData(html, options)
                    .then((stats)=> console.log('status', stats) )   // ok..., ok if it was able to handle the file to the OS.  
                    .catch((err)=>console.err(err))
            })
		}
    }
};
</script>


<style scoped>

input {
	width: 200px;
	margin-bottom: 15px;
    height: 28px;
    min-height: 28px;
	padding: 2px;
	font-family: 'Segoe UI', sans-serif;
	font-size: 15px;
	background-color: transparent;
	border: 1px solid white;
	border-bottom: 3px solid white;
	border-radius: 5px;
	outline: unset;
	transition: 0.2s ease border;
    color: white;
}

.form_error {
	border-color: red !important;
}

.form_container {
	position: absolute;
	inset: 0px;
	opacity: 1;
	display: flex;
	justify-content: center;
    flex-direction: column;
	align-items: center;
	font-family: 'Segoe UI', sans-serif;
    width: 98%;
}

.form{
    height: 95%;
    width: 98%;
    display: flex;
    position: relative;
    justify-content: center;
    align-items: flex-start;
    flex-direction: column;
    padding: 20px;
    border-radius: 25px;
    border: 1px solid black;
    overflow: auto;
}

.form button:first-of-type{
	margin-top: 20px;
}

#top{
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    width: 100%;
}

.side{
    display: flex;
	position: relative;
	flex-direction: column;
	justify-content: flex-start;
	align-items: center;
    margin-right: 30px;
}


select{
	width: 230px;
	height: 35px;
	padding: 5px;
	border-radius: 10px;
	outline: none;
    background-color: white;
}

label{
    margin-top: 12px;
    font-family: 'Lato';
    color: white;
}

input[type="checkbox"]{
    height: 30px;
    background-color: white;
}

.advisory{
    font-style: italic;
    color: #850c0c
}

.button_link{
    width: 100% !important;
}
.selection_select{
    padding-bottom: 20px;
}
.selection_select > p{
    height: 21px;
    font-style: italic;
}

.redText{ color:#FF4F00; }
.blackText{ color:black; }

.button_item{
    width: 100%;
    padding: 5px 15px;
    border-radius: 18px;
    color: white;
    display: flex;
    justify-content: center;
}

.disable{
    background-color: grey !important;
    pointer-events: none;
}

ion-toolbar{
    --background: var(--primary)
}
ion-toolbar > *{
    color: white;
}
</style>
