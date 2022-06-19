<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="black"></ion-menu-button>
                </ion-buttons>
                <ion-title>Records</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content> 
            <div class="page">
                <div id="selectors">
                    <div id="year_select">
                        <label for="year_selection">Choose a Tax Year:</label>
                        <select id="year_selection"  @change="onchange">
                            <template v-for="(recordDict, recordYear) in userObj['records']" :key="recordDict" >
                                <option v-if="recordYear !== 'categories' && recordYear !== 'headingStates' && recordYear !== 'accounts' && recordYear !== 'payee' && recordYear !== 'savedTransactions'" :data="recordYear">
                                    {{ recordYear }}
                                </option>
                            </template>
                        </select>
                    </div>
                </div>
                <div id="records_outer">
                    <div id="records_container">
                        <div :class="`records_heading`" >
                            <p @click="sortDate">Date</p>
                            <p @click="sortCategory">Category</p>
                            <p @click="sortAmount">Amount</p>
                        </div>
                        <template v-for="recDict in transactionsArray" :key="recDict">
                            <div :class="`records_row ${recDict.type}`" @click="showTrans(event, recDict, recDict.id)">
                                <p>{{recDict.date}}</p>
                                <p>{{recDict.category}}</p>
                                <p>${{numberWithCommas(recDict.amount)}}</p>
                            </div>
                        </template>
                    </div>
                </div>
                <div v-if="showTransPop" id="trans_popup">
                    <p id="trans_pop_month">Month: </p>
                    <p id="trans_pop_date">Date: </p>
                    <p id="trans_pop_type">Type: </p>
                    <p id="trans_pop_account">Account: </p>
                    <p id="trans_pop_category">Category: </p>
                    <p id="trans_pop_item">Item: </p>
                    <p id="trans_pop_payee">Payee: </p>
                    <p id="trans_pop_amount">Amount: </p>
                    <div class="button_item glossy" style="background-color: var(--primary);" @click="editTransaction">Edit</div>
                    <div class="button_item glossy" style="background-color: red;" @click="deleteTransaction">Delete</div>
                    <div class="button_item glossy" style="background-color: var(--secondary);" @click="showTransPop=false">Cancel</div>
                </div>
            </div>
            <TransactionForms :transform="current_request_form" :hasReceipt="receiptStatus" @cancelled="cancelForm" />
        </ion-content>
    </ion-page>
</template>

<script>
import TransactionForms from '@/components/TransactionForms.vue';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import userDict from "../../public/userData.json"
import $ from 'jquery'
export default {
    name: 'TimeSheetsView',
    components: {
        TransactionForms,
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
            recordDict: {},
            transactionsArray: [],
            current_request_form: '',
            yearID: '',
            receiptStatus: false,
            showTransPop: false,
            sortAmountWay: false,
            sortCategoryWay: true,
            sortDateWay: true,
            currentID: ''
        }
    },
    mounted(){
        let date = new Date();
		let thisYear = date.getFullYear();
		let month = date.getMonth();
		let yearID;
		if(month < 3){ //April is 3rd month
			yearID = `${thisYear - 1} - ${thisYear}`;
		}else{
            yearID = `${thisYear} - ${thisYear + 1}`;
		}
		if(Object.keys(userDict['records']).length == 4){
            userDict['records'][`${thisYear - 1} - ${thisYear}`] = {'transactions': {}, 'assets': {}};
			userDict['records'][`${thisYear} - ${thisYear + 1}`] = {'transactions': {}, 'assets': {}};
		}
		if(!Object.keys(userDict['records']).includes(yearID)){
            userDict['records'][`${thisYear} - ${thisYear + 1}`] = {'transactions': {}, 'assets': {}};
		}
		this.recordDict = userDict['records'][yearID];
        this.transactionsArray = Object.values(this.recordDict['transactions'])
        this.sortDateWay = true;
        this.sortDate();
		this.yearID = yearID;
		setTimeout(() => {
            $(`#year_selection`).val(yearID);
			$('#show_gst_checkbox').prop('checked', userDict['showGST']);
			//this.calculatePivotTable()
		}, 1)
    },
    methods: {
        numberWithCommas(num) {
			return ((parseFloat(num).toFixed(2)).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));
		},
        onchange(){
			this.recordDict = userDict['records'][$(`#year_selection option:selected`).attr('data')];
			//this.calculatePivotTable();
            this.transactionsArray = Object.values(this.recordDict['transactions'])
            this.sortDateWay = true;
            this.sortDate();
		},
        showTrans(event, DICT, ID){
            this.currentID = ID;
            this.showTransPop = true;
            this.$nextTick(() => {
                $('#trans_pop_month').text(`Month: ${DICT.month}`)
                $('#trans_pop_date').text(`Date: ${DICT.date}`)
                $('#trans_pop_type').text(`Type: ${DICT.type}`)
                $('#trans_pop_account').text(`Account: ${DICT.account}`)
                $('#trans_pop_category').text(`Category: ${DICT.category}`)
                $('#trans_pop_item').text(`Item: ${DICT.item}`)
                $('#trans_pop_payee').text(`Payee: ${DICT.payee}`)
                $('#trans_pop_amount').text(`Amount: $${this.numberWithCommas(DICT.amount)}`)
            });
        },
        deleteTransaction(){
            const ID = this.currentID;
            if(confirm(`Are you sure you want to delete this transaction?`)){
                delete userDict['records'][this.yearID]['transactions'][ID];
                this.currentID = '';
                this.showTransPop = false;
                this.transactionsArray = Object.values(this.recordDict['transactions'])
                this.sortDateWay = true;
                this.sortDate();
            }
        },
        sortCategory(){
            if(this.sortCategoryWay){
                this.sortCategoryWay = false
                this.transactionsArray.sort(function(a,b) {return (a.category > b.category) ? 1 : ((b.category > a.category) ? -1 : 0)} );
            }else{
                this.sortCategoryWay = true
                this.transactionsArray.sort(function(a,b) {return (a.category < b.category) ? 1 : ((b.category < a.category) ? -1 : 0)} );
            }
        },
        sortAmount(){
            if(this.sortAmountWay){
                this.sortAmountWay = false
                this.transactionsArray.sort((a, b) => a.amount - b.amount);
            }else{
                this.sortAmountWay = true
                this.transactionsArray.sort((a, b) => b.amount - a.amount);
            }
        },
        sortDate(){
            if(this.sortDateWay){
                this.sortDateWay = false
                this.transactionsArray.sort(function(a,b) {
                    let firstDate = a.date.split('/').reverse().join('/')
                    let secondDate = b.date.split('/').reverse().join('/')
                    return (firstDate < secondDate) ? 1 : ((secondDate < firstDate) ? -1 : 0)
                });
            }else{
                this.sortDateWay = true
                this.transactionsArray.sort(function(a,b) {
                    let firstDate = a.date.split('/').reverse().join('/')
                    let secondDate = b.date.split('/').reverse().join('/')
                    return (firstDate > secondDate) ? 1 : ((secondDate > firstDate) ? -1 : 0)
                });
            }
        },
        editTransaction(){
			this.current_request_form = 'editTransaction';
			const ID = this.currentID
			let transDict = this.recordDict['transactions']
			transDict[ID]['receiptID'] != '' ? this.receiptStatus = true : this.receiptStatus = false
			setTimeout(() => {
				let newDate = transDict[ID]['date'].split("/").reverse().join("-");
				$(`#edit_transID`).attr('transid', ID)
				$(`#edit_transID`).attr('transyear', $(`#year_selection option:selected`).attr('data'))
				$(`#edit_trans_date`).val(newDate)
				$(`#edit_trans_item`).val(transDict[ID]['item'])
				$(`#edit_trans_amount`).val(transDict[ID]['amount'])
				$(`#edit_trans_account`).val(transDict[ID]['account']);
				$(`.vs__selected`).text(transDict[ID]['payee'])
				$(`#edit_trans_type`).val(transDict[ID]['type']);
				$(`#edit_trans_category`).val(transDict[ID]['category']);
			}, 1)
		},
        cancelForm(){
            this.current_request_form=``;
            this.transactionsArray = Object.values(this.recordDict['transactions'])
            this.sortDateWay = true;
            this.sortDate();
            this.showTransPop = false
        },
    }
};
</script>


<style scoped>
#selectors{
	margin-top: 5px;
	height: 30px;
	display: flex;
	width: 100%;
	align-items: center;
	justify-content: space-evenly;
}

select{
	width: 150px;
	height: 31px;
	margin: 0px 1ch 10px;
	padding: 5px;
	border-radius: 10px;
	outline: none;
    background-color: white;
}

#trans_popup{
    background-color: white;
    width: 95%;
    height: 95%;
    overflow: auto;
    position: absolute;
    z-index: 10;
    margin: auto;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border: 1px solid black;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
}

#records_outer{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 98%;
    height: 88%;
    border-radius: 15px;
    border: 1px solid black;
    background-color: var(--secondary);
}

#records_container{
    width: 98%;
    height: 98%;
    background-color: white;
    border-radius: 15px;
    overflow: auto;
}

.records_row {
    display: flex;
    justify-content: space-around;
    border: 1px solid #6865657e;
}

.records_row > p{
    padding: 10px 0px;
    font-size: smaller;
    pointer-events: none;
    min-width: 100px;
    display: flex;
    justify-content: center;
}

.records_heading {
    top: 0px;
	z-index: 10;
	position: sticky;
    display: flex;
    justify-content: space-around;
    border: 1px solid #6865657e;
    background-color: white;
}

.records_heading > p{
    padding: 10px 0px;
    font-size: smaller;
    min-width: 100px;
    display: flex;
    justify-content: center;
}

.button_item{
    padding: 4px 15px;
}

.Debit{
    background-color: #db0b0b5c;
}

.Credit{
    background-color: #00c5005e;
}


ion-toolbar{
    --background: var(--primary)
}
ion-toolbar > *{
    color: white;
}
</style>
