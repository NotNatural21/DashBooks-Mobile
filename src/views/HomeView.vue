<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="black"></ion-menu-button>
                </ion-buttons>
                <ion-title>DashBoard</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content> 
            <div class="page">
                <h4>Welcome To DashBooks!</h4>
                <div class="tile_container">
                    <div class="tile"> <!-- INCOME -->
                        <div class="top_display">
                            <p>Income: {{ currentYear }}</p>
                        </div>
                        <div class="mid_display">
                            <p style="font-size: large; color: green;">${{ numberWithCommas(netData.income) }}</p>
                            <p>Total Income for {{ currentYear }}</p>
                        </div>
                        <div class="bar_grapgh" style="overflow-y: auto; justify-content: flex-start; margin-top: 10px;">
                            <template v-for="(item, keys) in incomeSum" :key="keys">
                                <div class="incomeBar" :style="{width: `${(220 * Math.abs(item / netData.income))}px`}">{{ keys }}: ${{ numberWithCommas(item) }}</div>
                            </template>
                        </div>
                    </div>
                    <div class="tile"> <!-- EXPENSES -->
                        <div class="top_display">
                            <p>Expenses: {{ currentYear }}</p>
                        </div>
                        <div class="mid_display">
                            <p style="font-size: large; color: red;">${{ numberWithCommas(netData.expenses) }}</p>
                            <p>Total Expenses for {{ currentYear }}</p>
                        </div>
                        <div class="bar_grapgh" style="justify-content: flex-start; margin-top: 10px;">
                            <template v-for="(item, keys) in expenseSum" :key="keys">
                                <div class="expenseBar" :style="{width: `${(220 * Math.abs(item / netData.expenses))}px`}">{{ keys }}: ${{ numberWithCommas(item) }}</div>
                            </template>
                        </div>
                    </div>
                    <div class="tile"> <!-- OVERVIEW -->
                        <div class="top_display">
                            <p>Net Profit: {{ currentYear }}</p>
                        </div>
                        <div class="mid_display">
                            <p :style="`font-size: larger; color: ${netData.income + netData.expenses >= 0 ? 'green' : 'red'}`">${{ numberWithCommas(netData.income + netData.expenses) }}</p>
                            <p>Net Profit for {{ currentYear }}</p>
                        </div>
                        <div class="bar_grapgh" style="height: 150px">
                            <div class="incomeBar" :style="{width: `${(Math.min(220 * Math.abs(netData.income / netData.expenses), 220))}px`}">Income: &nbsp; &nbsp; ${{ numberWithCommas(netData.income) }}</div>
                            <div class="expenseBar" :style="{width: `${(Math.min(220 * Math.abs(netData.expenses / netData.income), 220))}px`}">Expenses: ${{ numberWithCommas(netData.expenses) }}</div>
                        </div>
                    </div>
                </div>
                <div class="tile_container">
                     <template v-for="(item, projID) in projectDict" :key="projID">
                        <div class="tile">
                            <div class="top_display">
                                <p style="font-size:x-large; border-bottom: 1px solid black;">{{ item.name }}</p>
                                WEEKS:
                            </div>
                            <div class="weeks_container">
                                <div class="inner_weeks">
                                    <template v-for="(weekDict, week) in item.weeks" :key="week">
                                        <div class="week" :style="`${weekDict.invoiced ? 'background-color: #53b700': !weekDict.invoiced && weekDict.invoiceSent ? 'background-color: #FFB135' : '' }`">
                                            <p style="font-size:large;">{{ weekDict.startDate }}</p>
                                            <p class="week_total" @click="totalWeeks" :amount="weekDict.total">${{ numberWithCommas(weekDict.total) }}</p>
                                            <p v-if="!weekDict.invoiceSent && checkDate(projID, week) && parseFloat(weekDict.total) != 0" style="color:#FF4F00">Invoice!</p>
                                            <p v-else-if="!weekDict.invoiced && weekDict.invoiceSent" class="mark_done right_width" @click="markDone(event, projID, week)">Paid</p>
                                            <p v-else class="right_width"></p>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
                <div id="total_container" v-if="showTotal">
                    <p id="total_amount" style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)" @click="removeTotal">Total: ${{ numberWithCommas(total) }}</p>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { userDict } from '../main.ts';
import $ from 'jquery'
export default {
    name: 'HomeView',
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
            currentYear: '',
			netData: {'income': 0, 'expenses': 0},
            expenseSum: {},
            incomeSum: {},
			total: 0,
			years: [],
            projectDict: {},
            showTotal: false,
        }
    },
    mounted(){
        let date = new Date();
        let month = date.getMonth();
        let thisYear = date.getFullYear();
        if(month < 3){
            this.currentYear = `${thisYear - 1} - ${thisYear}`;
        }else{
            this.currentYear = `${thisYear} - ${thisYear + 1}`;
        }
		for(const objKey of Object.keys(userDict['records'])){
            if(objKey != 'accounts' && objKey != 'categories' && objKey != 'payee' && objKey != 'savedTransactions'){
                this.years.push(objKey)
			}
            
		}
        this.projectDict = userDict['projects']
        this.netData.income = 0;
        this.netData.expenses = 0;
        this.expenseSum = {};
        this.incomeSum = {};
        if(this.currentYear in userDict['records']){
            for(const [objKey, objDict] of Object.entries(userDict['records'][this.currentYear]['transactions'])){
                if(objDict.type == 'Credit'){
                    this.netData.income += objDict.amount;
                    objDict.category in this.incomeSum ? this.incomeSum[objDict.category] += 0: this.incomeSum[objDict.category] = 0;
                    this.incomeSum[objDict.category] += objDict.amount;
                }else if(objDict.type == 'Debit' && userDict['records']['categories'][objDict.category]){
                    this.netData.expenses += objDict.amount;
                    objDict.category in this.expenseSum ? this.expenseSum[objDict.category] += 0: this.expenseSum[objDict.category] = 0;
                    this.expenseSum[objDict.category] += objDict.amount;
                    objKey;
                }
            }
        }else{
            userDict['records'][this.currentYear] = {assets: {}, transactions: {}}
        }
    },
    methods: {
        markDone(event, projectID, weekID){
            this.userObj['projects'][projectID]['weeks'][weekID]['invoiced'] = true; 
        },
        removeTotal(){
            this.showTotal = false;
            this.total = 0
        },
        totalWeeks(event){
            this.showTotal = true;
            this.total += parseFloat($(event.target).attr('amount'))
        },
        numberWithCommas(num) {
			return ((parseFloat(num).toFixed(2)).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));
		},
        checkDate(projectID, weekID){
            let weekDict = userDict['projects'][projectID]['weeks'][weekID]
            let newDate = weekDict['startDate'].split('/');
            newDate = `${newDate[1]}/${newDate[0]}/${newDate[2]}`;
            const d = new Date(newDate);
            const t = new Date();
            const date2 = new Date(d.getTime() + 12096e5);
            if(date2.getTime() <= t.getTime()){
                if(parseFloat(weekDict['total']) == 0){
                    userDict['projects'][projectID]['weeks'][weekID]['invoiced'] = true;
                    userDict['projects'][projectID]['weeks'][weekID]['invoiceSent'] = true;
                }
                return true
            }else{
                return false
            }

        },
		loadNetData(event){
			this.currentYear = $(event.target).attr('data');
            this.netData.income = 0;
            this.netData.expenses = 0;
            this.expenseSum = {};
            this.incomeSum = {};
			for(const [objKey, objDict] of Object.entries(userDict['records'][this.currentYear]['transactions'])){
				if(objDict.type == 'Credit'){
					this.netData.income += objDict.amount;
                    objDict.category in this.incomeSum ? this.incomeSum[objDict.category] += 0: this.incomeSum[objDict.category] = 0;
                    this.incomeSum[objDict.category] += objDict.amount;
				}else if(objDict.type == 'Debit'){
                    objKey;
					this.netData.expenses += objDict.amount
                    objDict.category in this.expenseSum ? this.expenseSum[objDict.category] += 0: this.expenseSum[objDict.category] = 0;
                    this.expenseSum[objDict.category] += objDict.amount 
				}
			}
		}
    }
};
</script>


<style>
.page{
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
}

.tile_container{
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
.tile{
	width: 280px;
	min-width: 280px;
	height: 100%;
    min-height: 250px;
    max-height: 250px;
    margin: 0px 15px;
	background-color: white;
	box-shadow: 2px 4px 10px -4px #000000a4;
    border: 1px solid black;
    border-radius: 8px;
    margin-bottom: 8px;
}

.top_display{
	display: flex;
	justify-content: space-around;
    flex-direction: column;
	align-items: center;
	height: 50px;
	width: 100%;
}
.mid_display{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 13px;
}
.bar_grapgh{
    width: 100%;
    max-height: 135px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-evenly;
    overflow-y: auto;
}
.incomeBar{
    margin-left: 13px;
    background-color: #53b700;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    white-space: nowrap;
    padding-left: 7px;
}
.expenseBar{
    margin-left: 13px;
    background-color: #00a6a4;
    height: 30px;
    min-height: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    white-space: nowrap;
    padding-left: 7px;
    margin-bottom: 2px;
}

.weeks_container{
    height: 170px;
    overflow-y: auto;
    
}
.inner_weeks{
    display: flex;
    flex-direction: column-reverse;
    justify-content: flex-end;
    align-items: center;
    gap: 3px;
}
.week{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 8px;
    width: 96%;
    height: 40px;
    border-radius: 2px;
}
.week > p:first-child{
    display: flex;
    justify-content: flex-end;
    width: 40%;
}

.week_total{
    cursor: pointer;
    width: 80px;
    min-width: 80px;
    display: flex;
    justify-content: center;
}

.mark_done{
    cursor: pointer;
    border: 1px solid black;
    background-color: var(--primary);
    color: white;
    border-radius: 7px;
}

.right_width{
    min-width: 70px;
    width: 70px;
    display: flex;
    justify-content: center;
}
#total_container{
    z-index: 500;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    pointer-events: none;
}

#total_amount{
    width: 15%;
    height: 5%;
    min-width: 250px;
    display: flex;
    color: white;
    border-radius: 25px 0px 0px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
    font-size: larger;
    position: fixed;
    bottom: 0;
}
</style>

<style>
p{
	margin: 0px !important;
}
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}

ion-toolbar{
    --background: var(--primary)
}

ion-toolbar > *{
    color: white;
}
</style>