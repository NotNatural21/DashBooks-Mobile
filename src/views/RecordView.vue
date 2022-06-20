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
                <div class="button_item glossy" style="background-color: var(--primary);" @click="createForm('createTransaction')">Create Transaction</div>
                <div class="tables_outer"> <!-- Transactions -->
                    <div class="tables_container">
                        <div :class="`records_heading heading`" >
                            <p>Transactions</p>
                        </div>
                        <div :class="`records_heading sticky heading`" >
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
                <div class="button_item glossy" style="background-color: var(--primary);" @click="createForm('createSaved')">Create Saved Transaction</div>
                <div class="tables_outer"> <!-- Saved Transactions -->
                    <div class="tables_container">
                        <div class="records_heading heading" >
                            <p>Saved Transactions</p>
                        </div>
                        <div class="records_heading saved sticky heading" >
                            <p @click="''">Item</p>
                            <p>Add</p>
                            <p>Edit</p>
                        </div>
                        <template v-for="(savedDict, saveKey) in userObj['records']['savedTransactions']" :key="saveKey">
                            <div class="records_row saved">
                                <p>{{savedDict.item}}</p>
                                <p><span class="glossy button_item" @click="addSaved" :data="saveKey" style="background-color: var(--primary);">Add</span></p>
                                <p><span class="glossy button_item" @click="editSaved" :data="saveKey" style="background-color: var(--secondary);">Edit</span></p>
                            </div>
                        </template>
                    </div>
                </div> 
                <div class="button_item glossy" style="background-color: var(--primary);" @click="createForm('createAsset')">Create Asset</div>
                <div class="tables_outer"> <!-- Assets -->
                    <div class="tables_container">
                        <div class="records_heading heading" >
                            <p>Assets</p>
                        </div>
                        <div class="records_heading sticky heading" >
                            <p @click="''">Item</p>
                            <p>Units</p>
                            <p>Total</p>
                        </div>
                        <template v-for="(assetDict,assetKey) in recordDict['assets']" :key="assetKey">
                            <div class="records_row">
                                <p>{{savedDict.item}}</p>
                                <p>{{savedDict.units}}</p>
                                <p>{{savedDict.total}}</p>
                            </div>
                        </template>
                    </div>
                </div>
                <div class="tables_outer">
                    <div class="tables_container">
                        <div class="records_heading sticky heading" >
                            <p>Pivot Table</p>
                            <div style="display: flex; align-items: center;"> 
                                <label for="show_gst_checkbox" style="width: unset;">GST: </label>
                                <input id="show_gst_checkbox" type="checkbox" @click="changeCheckBox" checked/>
                            </div>
                        </div>
                        <div class="row_table">
                            <div class="pivot_col_start sticky heading" style="z-index: 5">
                                <template v-if="showGST">
                                    <p v-for="column in colNamesGST" :key="column" class="p_column">
                                        {{ column }}
                                    </p>
                                </template>
                                <template v-else>
                                    <p v-for="column in colNames" :key="column" class="p_column">
                                        {{ column }}
                                    </p>
                                </template>
                            </div>
                            <div class="pivot_col" v-for="(categoryDict, category) in pivotDict['categories']" :key="category">
                                <p class="p_column">{{ category }}</p>
                                <p class="p_column">{{ numberWithCommas(categoryDict['Apr']) }}</p>
                                <p class="p_column">{{ numberWithCommas(categoryDict['May']) }}</p>
                                <p class="p_column">{{ numberWithCommas(categoryDict['Jun']) }}</p>
                                <p class="p_column">{{ numberWithCommas(categoryDict['Jul']) }}</p>
                                <p class="p_column">{{ numberWithCommas(categoryDict['Aug']) }}</p>
                                <p class="p_column">{{ numberWithCommas(categoryDict['Sep']) }}</p>
                                <p class="p_column">{{ numberWithCommas(categoryDict['Oct']) }}</p>
                                <p class="p_column">{{ numberWithCommas(categoryDict['Nov']) }}</p>
                                <p class="p_column">{{ numberWithCommas(categoryDict['Dec']) }}</p>
                                <p class="p_column">{{ numberWithCommas(categoryDict['Jan']) }}</p>
                                <p class="p_column">{{ numberWithCommas(categoryDict['Feb']) }}</p>
                                <p class="p_column">{{ numberWithCommas(categoryDict['Mar']) }}</p>
                                <template v-if="showGST">
                                    <p class="p_column heading" style="min-width: calc((100% - 30ch) / 14);">{{ numberWithCommas(categoryDict['grandTotal']) }}</p>	
                                    <p class="p_column heading" style="min-width: calc((100% - 30ch) / 14);">{{ numberWithCommas(categoryDict['grandTotal'] * 1.15) }}</p>
                                </template>
                                <template v-else>
                                    <p class="p_column heading" style="min-width: calc(((100% - 30ch) / 14) * 2 + 1px);">${{ numberWithCommas(categoryDict['grandTotal']) }}</p>
                                </template>
                            </div>
                        </div>
                        <div class="bottom_section" style="display: flex">
                            <div class="pivot_col heading sticky" style="margin-top: 10px;">
                                <template v-if="loaded">
                                    <p class="p_column">Tax To Pay:</p>
                                    <p class="p_column">Effective Tax Rate:</p>
                                    <p class="p_column">Take Home:</p>
                                </template>
                            </div>
                            <div class="pivot_col heading" style="margin-top: 10px; left: 150px;">
                                <template v-if="loaded">
                                    <p class="p_column">${{ numberWithCommas(calculateTax(pivotDict['months']['grandTotal'])) }}</p>
                                    <p class="p_column">{{(calculateTax(pivotDict['months']['grandTotal']) / pivotDict['months']['grandTotal'] * 100).toFixed(2)}}%</p>
                                    <p class="p_column">${{ numberWithCommas(pivotDict['months']['grandTotal'] - calculateTax(pivotDict['months']['grandTotal'])) }}</p>
                                </template>
                            </div>
                        </div>

                        <template v-if="showGST">
                            <div class="p_column heading sticky" style="margin-top: 10px; width: 100%;">GST Inclusive</div>
                            <div class="bottom_section" style="display: flex; margin-bottom: 2px;">
                                <div class="pivot_col heading sticky">
                                    <template v-if="loaded">
                                        <p class="p_column">Tax To Pay:</p>
                                        <p class="p_column">Effective Tax Rate:</p>
                                        <p class="p_column">Take Home:</p>
                                    </template>
                                </div>
                                <div class="pivot_col heading" style="left: 150px;">
                                    <template v-if="loaded">
                                        <p class="p_column">${{ numberWithCommas(calculateTax(pivotDict['months']['grandTotal']) * 1.15) }}</p>
                                        <p class="p_column">{{ ((calculateTax(pivotDict['months']['grandTotal'])  * 1.15) / (pivotDict['months']['grandTotal'] * 1.15) * 100).toFixed(2) }}%</p>
                                        <p class="p_column">${{ numberWithCommas(pivotDict['months']['grandTotal'] * 1.15 - calculateTax(pivotDict['months']['grandTotal']) * 1.15) }}</p>
                                    </template>
                                </div>
                            </div>
                        </template>


                    </div>
                </div> 
                <div style="min-height: 1px; opacity: 0;">Hello</div>               
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
            pivotDict: {},
            recordDict: {},
            transactionsArray: [],
            current_request_form: '',
            yearID: '',
            receiptStatus: false,
            showTransPop: false,
            sortAmountWay: false,
            sortCategoryWay: true,
            sortDateWay: true,
            loaded: false,
            showGST: false,
            currentID: '',
            colNamesGST: ["Category:", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Total", "w/ GST"],
            colNames: ["Category:", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Total"]
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
            this.showGST = userDict['showGST'];
			this.calculatePivotTable()
		}, 1)
    },
    methods: {
        createForm(form){
            this.current_request_form = form
            this.$nextTick(() => {
                $(".form_container")[0].scrollIntoView();
            });
        },
        numberWithCommas(num) {
			return ((parseFloat(num).toFixed(2)).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));
		},
        onchange(){
			this.recordDict = userDict['records'][$(`#year_selection option:selected`).attr('data')];
			this.calculatePivotTable();
            this.transactionsArray = Object.values(this.recordDict['transactions'])
            this.sortDateWay = true;
            this.sortDate();
		},
        showTrans(event, DICT, ID){
            this.currentID = ID;
            this.showTransPop = true;
            this.$nextTick(() => {
                $("#trans_popup")[0].scrollIntoView();
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
                $(".form_container")[0].scrollIntoView();
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
        addSaved(event){
			const savedID = $(event.target).attr('data');
			this.current_request_form = 'addSaved';
			setTimeout(() => {
                $(".form_container")[0].scrollIntoView();
				$(`#add_savedID`).attr('savedid', savedID)
			}, 1)
		},
        editSaved(event){
			const savedID = $(event.target).attr('data');
			this.current_request_form = 'editSaved';
			let saveDict = userDict['records']['savedTransactions'][savedID]
			setTimeout(() => {
                $(".form_container")[0].scrollIntoView();
				$(`#edit_savedID`).attr('savedid', savedID)
				$(`#edit_savedTrans_item`).val(saveDict['item'])
				$(`#edit_savedTrans_amount`).val(saveDict['amount'])
				$(`#edit_savedTrans_account`).val(saveDict['account']);
				$(`#edit_savedTrans_type`).val(saveDict['type']);
				$(`#edit_savedTrans_category`).val(saveDict['category']);
			}, 1)
		},
        changeCheckBox(){
			userDict['showGST'] = $('#show_gst_checkbox')[0].checked;
            this.showGST = $('#show_gst_checkbox')[0].checked;
		},
        calculatePivotTable(){
			const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			this.pivotDict = {'categories': {}, 'months': {}};
			for(const [category, status] of Object.entries(userDict['records']['categories'])){
				if(status){
					this.pivotDict['categories'][category] = {'grandTotal': 0}
					this.pivotDict['months'] = {'grandTotal': 0}
				monthNames.forEach((month) => {
					this.pivotDict['categories'][category][month] = 0;
					this.pivotDict['months'][month] = 0;
				});
				}
			}
			if(this.recordDict['transactions'] != undefined){
				for(const [transID, transDict] of Object.entries(this.recordDict['transactions'])){
					if(userDict['records']['categories'][transDict['category']]){
						this.pivotDict['categories'][transDict['category']][transDict['month']] += transDict['amount'];
						this.pivotDict['categories'][transDict['category']]['grandTotal'] += transDict['amount'];
						this.pivotDict['months'][transDict['month']] += transDict['amount'];
						this.pivotDict['months']['grandTotal'] += transDict['amount'];
						transID;
					}
				}
			}
			
			this.loaded = true;
		},
        calculateTax(amount){
			let firstTax = [0.105, 14000];
			let secondTax = [0.175, 48000];
			let thirdTax = [0.3, 70000];
			let fourthTax = [0.33, 180000];
			let fifthTax = [0.39];
			
			if(amount <= 0){
				return 0;
			}

			let firstTaxAmount = amount > firstTax[1] ? firstTax[1] * firstTax[0]: amount * firstTax[0]; //1470 so correct!
			if(amount <= firstTax[1]){
				return firstTaxAmount
			}

			let secondTaxAmount = amount > firstTax[1] && amount < secondTax[1] ? (amount - firstTax[1]) * secondTax[0]: (secondTax[1] - firstTax[1]) * secondTax[0] //5950 so correct
			if(amount <= secondTax[1]){
				return firstTaxAmount + secondTaxAmount
			}

			let thirdTaxAmount = amount > secondTax[1] && amount < thirdTax[1] ? (amount - secondTax[1]) * thirdTax[0]: (thirdTax[1] - secondTax[1]) * thirdTax[0] //6600 so correct
			if(amount <= thirdTax[1]){
				return firstTaxAmount + secondTaxAmount + thirdTaxAmount;
			}

			let fourthTaxAmount = amount > thirdTax[1] && amount < fourthTax[1] ? (amount - thirdTax[1]) * fourthTax[0]: (fourthTax[1] - thirdTax[1]) * fourthTax[0] //36300 so correct
			if(amount <= fourthTax[1]){
				return firstTaxAmount + secondTaxAmount + thirdTaxAmount + fourthTaxAmount;
			}

			let fifthTaxAmount = amount > fourthTax[1] ? (amount - fourthTax[1]) * fifthTax[0]: 0
			if(amount >= fourthTax[1]){
				return firstTaxAmount + secondTaxAmount + thirdTaxAmount + fourthTaxAmount + fifthTaxAmount;
			}

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

.tables_outer{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 88%;
    min-height: 85%;
    height: 85%;
    border-radius: 15px;
    border: 1px solid black;
    background-color: var(--secondary);
    margin-top: 10px;
    margin-bottom: 20px;
}

.tables_container{
    width: 98%;
    height: 98%;
    background-color: white;
    border-radius: 15px;
    overflow: auto;
}
.records_heading {
    display: flex;
    justify-content: space-around;
    border: 1px solid #6865657e;
    background-color: white;
}

.records_heading > p{
    padding: 10px 0px;
    font-size: smaller;
    min-width: 95px;
    display: flex;
    justify-content: center;
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
    min-width: 95px;
    display: flex;
    justify-content: center;
}
.records_heading > p:last-of-type{
    min-width: 78px;
}
.records_row > p:last-of-type{
    min-width: 78px;
}

.saved > p{
    min-width: 50px !important;
    width: 50px;
    pointer-events: all;
}
.saved > p:first-child{
    min-width: 175px !important;
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

#show_gst_checkbox{
	width: 50px;
	height: 30px;
    background-color: white;
}

.pivot_col{
    width: 150px;
    min-width: 150px;
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
}

.pivot_col_start{
    width: 75px;
    min-width: 75px;
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    height: 90%;
}

.p_column{
    padding: 2px 0px;
    border-bottom: 1px solid black;
    border-right: 1px solid black;
    display: flex;
    justify-content: center;
    white-space: nowrap;
}
.sticky{
    top: 0px;
    left: 0px;
	z-index: 10;
	position: sticky;
    background-color: white;
}

.row_table{
    overflow: auto;
    display: flex;
}

.heading{
    background-color: var(--tertiary);
}

.bottom_section > div:last-child{
    width: 100%;
}

ion-toolbar{
    --background: var(--primary)
}
ion-toolbar > *{
    color: white;
}
</style>
