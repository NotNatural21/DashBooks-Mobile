<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="black"></ion-menu-button>
                </ion-buttons>
                <ion-title>{{name}}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content> 
            <div class="page">
                <div id="time_Container">
                    <div id="weeks_container">
                        <template v-for="(weekDict, weekID) in projectDict['weeks']" :key="weekDict">
                            <template v-if="weekDict['invoiceSent'] == true">
                                <div class="week_button" :label="weekID" @click="weekButton" :data="weekID" style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%); color: white;" @contextmenu="rightClickWeek">{{ weekID }}</div>
                            </template>
                            <template v-else>
                                <div class="week_button" :label="weekID" @click="weekButton" :data="weekID" style="background: radial-gradient(circle, rgb(209 53 255) 0%, rgb(93 26 120) 100%); color: white;" @contextmenu="rightClickWeek">{{ weekID }}</div>
                            </template>
                        </template>
                        <div class="week_button" color="secondary" @click="addWeek" :style="{background: `radial-gradient(circle, ${projectDict['colour'][1]} 0%, ${projectDict['colour'][0]} 100%)`, color: `${pickTextColorBasedOnBgColor(projectDict['colour'][1])}`}">+</div>
                    </div>
                    <div id="switch_container">
                        Select Cells
                        <label class="switch">
                            <input id="switch_toggle" @click="toggleSelection" type="checkbox" checked>
                            <span class="slider round"></span>
                        </label>
                        Scroll Timesheet
                    </div>
                    <div id="time_sheet_outer" :style="{background: `${projectDict['colour'][0]}`, color: `${pickTextColorBasedOnBgColor(projectDict['colour'][0])}`}">
                        <div id="time_sheet_container">
                            <template v-if="weekID != ``">
                                <template v-for="(col, index) in columnLetter" :key="col">
                                    <div :colID="col" class="timesheet_column">
                                        <div :cellID="`${col}-2`" class="dateCell">{{ dayList[index] }}</div>
                                        <div :cellID="`${col}-1`" class="dateCell">{{ dateList[index] }}</div>
                                        <template v-if="col == `Z`">
                                            <div  v-for="(time, index) in timeList" :key="time" :cellID="`Z${index}`" class="dateCell">{{ time }}</div>
                                        </template>
                                        <template v-else>
                                            <div  v-for="(time, index) in timeList" :key="time" :cellID="`${col}${index}`" class="cell" @touchstart="cellDown" @touchmove="cellHovered" @touchend="cellRelease"/>
                                        </template>
                                        <!-- Colour Details -->
                                        <template v-if="col == `Z`">
                                            <div  v-for="(time, index) in colourList" :key="time" :cellID="`Z${index + timeList.length}`" class="dateCell">{{ time }}</div>
                                        </template>
                                        <template v-else>
                                            <div  v-for="(time, index) in colourList" :key="time" :cellID="`${col}${index + timeList.length}`" class="dateCell"/>
                                        </template>
                                        <!-- Weekly Cells -->
                                        <template v-if="col == `Z`">
                                            <div  v-for="(time, index) in infoList" :key="time" :cellID="`Z${index + timeList.length + colourList.length}`" class="dateCell">{{ time }}</div>
                                        </template>
                                        <template v-if="col == `A`">
                                            <div  v-for="(time, index) in infoList" :key="time" :cellID="`${col}${index + timeList.length + colourList.length}`" class="infoCellA"></div>
                                        </template>
                                        <template v-if="col == `H`">
                                            <div  v-for="(time, index) in infoList" :key="time" :cellID="`${col}${index + timeList.length + colourList.length}`" class="infoCell"></div>
                                        </template>
                                        <!-- Total TimeSheet Cells -->
                                        <template v-if="col == `Z`">
                                            <div  v-for="(time, index) in totalList" :key="time" :cellID="`Z${index + timeList.length + colourList.length + 2}`" class="dateCell">{{ time }}</div>
                                        </template>
                                        <template v-if="col == `A` && weekInterval == 1">
                                            <div  v-for="(time, index) in totalList" :key="time" :cellID="`${col}${index + timeList.length + colourList.length + 2}`" class="totalCellOne"></div>
                                        </template>
                                        <template v-if="col == `A` && weekInterval == 2">
                                            <div  v-for="(time, index) in totalList" :key="time" :cellID="`${col}${index + timeList.length + colourList.length + 2}`" class="totalCellTwo"></div>
                                        </template>
                                    </div>
                                </template>
                            </template>
                        </div>
                    </div>
                    <div id="colour_container">
                        <div v-for="colourID in Object.keys(userObj['colours'])" :key="colourID" :colourid="colourID" class="colour_item" :style="`background-color:${userObj['colours'][colourID]['colour']};`" @click="colourCell">
                            <p v-bind:style="`color: ${pickTextColorBasedOnBgColor(userObj['colours'][colourID]['colour'])}`">{{ userObj['colours'][colourID]['name'] }}</p>
                        </div>
                        <div class="colour_item" style="background-color: #000" @click="current_request_form=`createColourForm`">
                            <p style="color: #fff">+</p>
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { userDict } from '../main.ts';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { addToDate, dateToAmerica } from '../../public/generalFunctions.js';
import $ from 'jquery'
export default {
    name: 'TimeSheetView',
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
            projectID: this.$route.params.projectID,
            projectDict: userDict['projects'][this.$route.params.projectID],
            weekID: '',
            selectedCellsList: [],
            dateList: [],
            timeList: [],
            colourList: [],
            columnLetter: [],
            weekDict: {},
            colourIDList: [],
            dayList: [],
            totalList: [],
            infoList: [],
            weekInterval: '',
            timeInterval: 0,
            cellClicked: false,
            name: userDict['projects'][this.$route.params.projectID]['name']
        }
    },
    beforeMount(){
        this.colourIDList = [];
        this.colourIDList = Object.keys(userDict['colours'])
    },
    methods: {
        toggleSelection(){
            if($('#switch_toggle')[0].checked){//User wants to scroll
                $(`#time_sheet_container`).css({"overflow": "auto"});
                $(`.cell`).css({"pointer-events": "none"});
            }else{//User wants to select cells
                $(`#time_sheet_container`).css({"overflow": "hidden"});
                $(`.cell`).css({"pointer-events": "all"});
            }
        },
        rightClickWeek(e) {
            e.preventDefault();
			let position = $(e.target).position();  
			$(`#week_button_menu`).removeClass('visible');
			setTimeout(() => {
				$(`#week_button_menu`).addClass('visible');
				this.week = $(e.target).attr('data')
			}, 1)
			$('#week_button_menu').css({
				left: position.left + 128.25 +'px', //16.75 should be 145
				top: position.top + 5 + 'px' //95 should be 100
			})
			const scope = document.getElementById("app");
			scope.addEventListener("click", (e) => {
				if(e.target.offsetParent != $('#week_button_menu')){
					$(`#week_button_menu`).removeClass('visible');
				}
			}) 
		},
		toggleCheckMark(){
			this.projectDict['weeks'][this.week]['invoiceSent'] = !this.projectDict['weeks'][this.week]['invoiceSent'] 
			this.projectDict['weeks'][this.week]['invoiced'] = this.projectDict['weeks'][this.week]['invoiceSent'] 
		},
        pickTextColorBasedOnBgColor(bgColor) {
            let color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
            let r = parseInt(color.substring(0, 2), 16); // hexToR
            let g = parseInt(color.substring(2, 4), 16); // hexToG
            let b = parseInt(color.substring(4, 6), 16); // hexToB
            let uicolors = [r / 255, g / 255, b / 255];
            let c = uicolors.map((col) => {
                if (col <= 0.03928) {
                return col / 12.92;
                }
                return Math.pow((col + 0.055) / 1.055, 2.4);
            });
            let L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
            return (L > 0.179) ? '#000000' : '#ffffff';
        },
        addWeek(){
            let colourIds = Object.keys(userDict['colours'])
            let duration = this.projectDict['duration'];
            if(this.projectDict['weekInterval'] == 1){
                let date = this.projectDict['weeks'][`${duration}`]['startDate'];
                date = addToDate(date, 14);
                this.projectDict['weeks'][`${duration + 1}`] = {'startDate': date, 'colouredCells': {}, 'invoiced': false, 'invoiceSent': false, 'total': '0.00'};
                colourIds.forEach(colourID => {
                    if(colourID != 'colourWhite'){
                        this.projectDict['weeks'][`${duration}`]['colouredCells'][colourID] = [];
                    }
                });
                this.projectDict['duration'] += 1;

            }else if(this.projectDict['weekInterval'] == 2){
                let lastKey = `${duration - 1} - ${duration}`;
                let date = this.projectDict['weeks'][lastKey]['startDate'];
                date = addToDate(date, 14);
                this.projectDict['weeks'][`${duration + 1} - ${duration + 2}`] = {'startDate': date, 'colouredCells': {}, 'invoiced': false, 'invoiceSent': false, 'total': '0.00'};
                colourIds.forEach(colourID => {
                    if(colourID != 'colourWhite'){
                        this.projectDict['weeks'][`${duration + 1} - ${duration + 2}`]['colouredCells'][colourID] = [];
                    }
                });
                this.projectDict['duration'] += 2;
            }
        },
        weekButton(event){
            this.weekID = $(event.target).attr('data')
            $('.week_button').each((index, weekButton) => {
				$(weekButton).removeClass('active_button');
			});
			$(event.target).addClass('active_button')
            this.loadTimeSheet();
        },
        loadTimeSheet(){
            this.weekDict = this.projectDict['weeks'][this.weekID];
            this.dateList = [`Time | Date`];
			this.dateList.push(this.weekDict['startDate']);
			for(let i = 1; i < (this.projectDict['weekInterval'] * 7); i++){
				this.dateList.push(addToDate(this.weekDict['startDate'], i))
			}
            this.timeList = [...this.projectDict['timeList']];
            this.colourList = []
            
            for (let colourID of Object.keys(userDict['colours'])) {
                if(colourID != 'colourWhite'){
                    this.colourList.push(userDict['colours'][colourID]['name']);  
                }
            }

			this.colourList.push("Total Hours:");
			this.colourList.push("Total Daily $:");
            this.infoList = []
            this.infoList.push("Weekly Hours:");
			this.infoList.push("Weekly $:");
            if(this.projectDict['weekInterval'] == 1){
				this.columnLetter = ['Z', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
			}else{
				this.columnLetter = ['Z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
			}
            //Day list
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            this.dayList = ['Day'];
            this.dateList.forEach(date => {
                if(date != `Time | Date`){
                    let newDate = new Date(dateToAmerica(date))
                    this.dayList.push(days[newDate.getDay()])
                }
            });
            this.totalList = ["Timesheet Hours:"];
			this.totalList.push("Timesheet Total $:");
            this.weekInterval = this.projectDict['weekInterval'];
            this.timeInterval = this.projectDict['timeInterval'];

            this.$nextTick(() => {
                $('.timesheet_column').each(function(i, obj) {
                    if(i == 7){
                        $(obj).css("border-right", "1px solid black");
                        $(obj).css("margin-right", "5px");
                    }
                });
                $(`.cell`).css({"background-color": 'white', "border-color": "black"});
				for(const colourID of Object.keys(this.weekDict['colouredCells'])){
                    this.weekDict['colouredCells'][colourID].forEach(cellID => {
                        $(`[cellid=${cellID}]`).css({"background-color": userDict['colours'][colourID]['colour'], "border-color": "black"});
					});
				}
                //Set border for bottom of timelist timesheet section
				$(`.timesheet_column > div:nth-child(${this.projectDict['timeList'].length + 2})`).css("margin-bottom", "7px");
                $(`.timesheet_column > div:nth-child(${this.projectDict['timeList'].length + 2})`).css("border-bottom", "1px solid black");

                $(`.timesheet_column > div:nth-child(${this.timeList.length + this.colourList.length})`).css("margin-bottom", "5px");
				$(`.timesheet_column > div:nth-child(${this.timeList.length + this.colourList.length})`).css("border-bottom", "1px solid black");
                this.updateColourTotals();
            });
            
        },
        cellDown(event){
			this.cellClicked = true;
			const cellID = $(event.target).attr('cellid');
			this.selectCell(event.target);
            if(this.selectedCellsList != []){
                this.selectedCellsList.forEach(cellIDR => {
                    let colouredCells = this.listOfValuesArr(this.weekDict['colouredCells']);
                    if(colouredCells.includes(cellIDR)){
                        let cellColour = '';
                        for(const [colourID, colourDict] of Object.entries(this.weekDict['colouredCells'])){
                            if(colourDict.includes(cellIDR)){
                                cellColour = userDict['colours'][colourID]['colour'];
                            }
                        }
                        
                        this.cellDeSelect(cellIDR, cellColour);
                    } else {
                        this.cellDeSelect(cellIDR, "white"); 
                    }
                    
                });
            }
			
			if(!(this.selectedCellsList.includes(cellID) && this.selectedCellsList.length == 1)){
				this.selectedCellsList = [cellID];
			}else{
				this.selectedCellsList = []
			}
		},
		cellHovered(event){
            let element = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
			const cellID = $(element).attr('cellid');
            if(cellID != undefined){
                const cellNum = parseInt(cellID.substring(1));
                if(cellNum < this.projectDict['timeList'].length){
                    if(this.cellClicked && (!this.selectedCellsList.includes(cellID))){
                        this.selectCell(element);
                        this.selectedCellsList.push(cellID);
                    }
                }
            }

		},
		cellRelease(){
			this.cellClicked = false;
		},
		selectCell(element){
			element.style.borderColor = "cyan";
			element.style.background = "#D1D3D9";
		},
		cellDeSelect(ID, colour){
			$(`[cellid=${ID}]`).css({"background-color": colour,  "border-color": "black"});
		},
		listOfValues(obj){
			let valueList = [];
			for(const [key, value] of Object.entries(obj)){
				valueList.push(value)
				key;
			}
			return valueList;
		},
		listOfValuesArr(obj){
			let valueList = [];
			for(const [key, value] of Object.entries(obj)){
				for (const element of value) {
					valueList.push(element)
				}
				key;
			}
			return valueList;
		},
		minCell(arr){
			let smallestNum = arr[0].substring(1);
			for(let i = 0; i < arr.length; i++){
				if(parseInt(arr[i].substring(1)) < smallestNum){
					smallestNum = parseInt(arr[i].substring(1))
				}
			}
			return smallestNum;
		},
		maxCell(arr){
			let smallestNum = arr[0].substring(1);
			for(let i = 0; i < arr.length; i++){
				if(parseInt(arr[i].substring(1)) > smallestNum){
					smallestNum = parseInt(arr[i].substring(1))
				}
			}
			return smallestNum;
		},
        updateColourTotals(){
			let cellTotal = this.projectDict['timeList'].length;
			for(const [colourID, cellArr] of Object.entries(this.weekDict['colouredCells'])){
				if(colourID != 'colourWhite'){
					let colourTotals = {};
					if(this.projectDict['weekInterval'] == 1){
						colourTotals = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0, 'G': 0};
					}else{
						colourTotals = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0, 'G': 0, 'H': 0, 'I': 0, 'J': 0, 'K': 0, 'L': 0, 'M': 0, 'N': 0};
					}
					cellArr.forEach(cellID => {
						colourTotals[cellID.charAt(0)] += parseFloat((this.projectDict['timeInterval']/60).toFixed(9))
					});
					for(let [collID, colourTotal] of Object.entries(colourTotals)){
						$(`[cellid=${collID}${cellTotal}]`).text(`${colourTotal.toFixed(2)}`)
					}
					cellTotal++;
				}
				
			}
			let columns = {};
			if(this.projectDict['weekInterval'] == 1){
				columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
			}else{
				columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
			}
			let weekTotal = 0;
			let weekMoney = 0;
			let timeTotal = 0;
			let timeMoney = 0;
			for(let i = 0; i < this.projectDict['weekInterval'] * 7; i++){
				let cellTotal = this.projectDict['timeList'].length;
				let colTotal = 0;
				let colMoney = 0;

                for (let colourID of Object.keys(userDict['colours'])) {
                    if(colourID != 'colourWhite'){
                        let cellID = `${columns[i]}${cellTotal}`;
						colTotal += parseFloat($(`[cellid=${cellID}]`).text())
						colMoney += parseFloat($(`[cellid=${cellID}]`).text()) * userDict['colours'][colourID]['rate']
						cellTotal++;  
                    }
                }

				weekTotal += colTotal;
				weekMoney += colMoney;
				$(`[cellid=${columns[i]}${cellTotal}]`).text(`${colTotal.toFixed(2)}H`)
				$(`[cellid=${columns[i]}${cellTotal + 1}]`).text(`$${colMoney.toFixed(2)}`)
				if(i % 7 == 6){
					$(`[cellid=${columns[i - 6]}${cellTotal + 2}]`).text(`${weekTotal.toFixed(2)}H`);
					$(`[cellid=${columns[i - 6]}${cellTotal + 3}]`).text(`$${weekMoney.toFixed(2)}`);
					timeTotal += weekTotal;
					timeMoney += weekMoney;
					weekTotal = 0;
					weekMoney = 0;
				}
				
			}
            if(!this.weekDict.invoiced || !this.weekDict.invoiceSent ){
                this.weekDict['total'] = timeMoney.toFixed(2);
                this.weekDict['totalHours'] = timeMoney.toFixed(2);
            }
            $(`[cellid=A${cellTotal + 4}]`).text(`${timeTotal.toFixed(2)}H`);
			$(`[cellid=A${cellTotal + 5}]`).text(`$${timeMoney.toFixed(2)}`);
            let neededHours = this.projectDict['targetHours'] - timeTotal <= 0 ? 0 : this.projectDict['targetHours'] - timeTotal;
            $(`#hours_left`).text(this.numberWithCommas(neededHours))
		},
        colourCell(event){
            let today = new Date();
            let dd = String(today.getDate()).padStart(2, '0');
            let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            let yyyy = today.getFullYear();

            today = mm + '/' + dd + '/' + yyyy;
            if(!(today in userDict['timeLogged'])){
                userDict['timeLogged'] = {}
                userDict['timeLogged'][today] = {'hours': 0, 'pay': 0}
            }
            let totalTime = 0
            let totalPay = userDict['timeLogged'][today]['pay']
			const colourID = $(event.target).attr('colourid');
			this.selectedCellsList.forEach(cellID => {
				for(const colourIDm of Object.keys(userDict['colours'])){
					if(colourIDm != 'colourWhite'){
						if(this.weekDict['colouredCells'][colourIDm].includes(cellID)){
							this.weekDict['colouredCells'][colourIDm].splice(this.weekDict['colouredCells'][colourIDm].indexOf(cellID), 1)
                            totalTime -= Math.round((1/(60/this.projectDict['timeInterval'])) * 1000) / 1000;
                            totalPay -= userDict['colours'][colourIDm]['rate'] * Math.round((1/(60/this.projectDict['timeInterval'])) * 1000) / 1000;
						}
					}
				}
				if(colourID != 'colourWhite'){
					this.weekDict['colouredCells'][colourID].push(cellID);
				}
				$(`[cellid=${cellID}]`).css({"background-color": userDict['colours'][colourID]['colour'], "border-color": "black"});
			});
            if(colourID != 'colourWhite'){
                totalTime += this.selectedCellsList.length * Math.round((1/(60/this.projectDict['timeInterval'])) * 1000) / 1000;
                totalPay += totalTime * userDict['colours'][colourID]['rate'];
            }
            userDict['timeLogged'][today]['hours'] = totalTime + userDict['timeLogged'][today]['hours'];
            userDict['timeLogged'][today]['pay'] = totalPay;
			this.selectedCellsList = [];
			this.loadTimeSheet();
		},
        numberWithCommas(num) {
			return ((parseFloat(num).toFixed(2)).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));
		},

    }
}
</script>
<style scoped>
#time_Container{
    display: flex;
    align-items: center;
	justify-content: flex-start;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 5px;
}
#weeks_container{
	display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    overflow-x: auto;
    border-radius: 10px;
    background-color: #ffffff3b;
    width: 100%;
    overflow-x: auto;
    margin-top: 3px;
}

#weeks_container > div{
	min-width: 100px;
	width: 100px;
	height: 30px;
    min-height: 30px;
    border: 1px solid black;
}

#switch_container{
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    font-size: smaller;
}
#time_sheet_outer{
    width: 90%;
    height: calc(100% - 105px);
    overflow: auto;
    border-radius: 10px;
}

#time_sheet_container{
	display: flex;
	flex-flow: row nowrap;
	justify-content: flex-start;
	align-items: flex-start;
	width: calc(100% - 20px);
	height: calc(100% - 20px);
	margin: 10px 10px 10px 10px;
    overflow: auto;
}

#colour_container{
    position: absolute;
    bottom: 0px;
	display: flex;
	flex-direction: row;
	align-items: center;
    width: 100%;
    height: 50px;
    padding: 0px 10px;
	overflow-y: auto;
	border-radius: 10px;
	font-family: 'Lato';
}
.week_button{
    position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	width: fit-content;
	min-height: 20px;
	max-height: 50px;
	margin: 0px;
	font-family: inherit;
	font-size: 17px;
	font-weight: bold;
	text-decoration: none;
	border-radius: 10px;
	overflow: hidden;
	cursor: pointer;
}
.colour_item{
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 30px;
	margin-top: 10px;
	border-radius: 10px;
	cursor: pointer;
	border: 1px solid black;
}

.colour_item p{
    pointer-events: none;
    font-family: 'Lato';
    font-size: 15px;
    white-space: nowrap;
    min-width: 100px;
    padding: 0px 10px;
    display: flex;
    justify-content: center;
}

.timesheet_column{
	width: 100%;
	z-index: 2;
	min-width: 65px;
	border-left: 1px solid black;
	border-top: 1px solid black;
}
.timesheet_column:nth-child(1){
	left: 0px;
	z-index: 10;
	position: sticky;
	min-width: 115px;
	border: 1px solid black;
	pointer-events: none;
}
.timesheet_column > div:nth-child(1){
	top: 0px;
	position: sticky;
	pointer-events: none;
	user-select: none;
}

.timesheet_column > div:nth-child(2){
    top: 26px;
	position: sticky;
	pointer-events: none;
	user-select: none;
}

.dateCell{
    font-size: smaller;
	background-color: white;
	width: 100%;
	height: 25px;
	max-height: 25px;
	border-bottom: 1px solid black;
    color: black;
    user-select: none;
    display: flex;
    justify-content: center;
}
.cell{
	width: 100%;
	height: 25px;
	max-height: 25px;
	border-bottom: 1px dashed black;
    color: black;
    pointer-events: none;
}
.infoCell{
	background-color: white;
	width: calc(700% + 6px);
	height: 25px;
	min-height: 25px;
	max-height: 25px;
	border-bottom: 1px solid black;
	border-right: 1px solid black;
    font-weight: bold;
    font-size: small;
    color: black;
    user-select: none;
    display: flex;
    justify-content: center;
}

.infoCellA{
	background-color: white;
	width: calc(700% + 7px);
	height: 25px;
	min-height: 25px;
	max-height: 25px;
	border-bottom: 1px solid black;
	border-right: 1px solid black;
    font-weight: bold;
    font-size: small;
    color: black;
    user-select: none;
    display: flex;
    justify-content: center;
}

.totalCellOne{
	background-color: white;
	width: calc(700% + 5px);
	height: 25px;
	min-height: 25px;
	max-height: 25px;
	border-bottom: 1px solid black;
	border-right: 1px solid black;
    color: black;
    font-size: small;
    user-select: none;
    display: flex;
    justify-content: center;
}

.totalCellTwo{
	background-color: white;
	width: calc(1400% + 19px);
	height: 25px;
	min-height: 25px;
	max-height: 25px;
	border-bottom: 1px solid black;
	border-right: 1px solid black;
    font-weight: bold;
    font-size: small;
    color: black;
    user-select: none;
    display: flex;
    justify-content: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 25px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #0bd933;
  transition: .2s;
}

.slider:before {
    position: absolute;
    content: "";
    aspect-ratio: 1;
    width: 21px;
    left: 6px;
    bottom: 2px;
    background-color: white;
    transition: .2s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

ion-toolbar{
    --background: var(--primary)
}
ion-toolbar > *{
    color: white;
}
</style>
