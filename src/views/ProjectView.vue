<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="black"></ion-menu-button>
                </ion-buttons>
                <ion-title>TimeSheets</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content> 
            <div class="page">
                <h4>TimeSheets:</h4>
                <p>You have logged {{ hours }}H and earnt ${{ numberWithCommas(pay) }} today</p>
                <div class="item_container">
                    <div class="items">
                        <div v-for="(projectDict, projectID) in userObj['projects']" :key="projectDict" class="list_item" :data="projectID" @click="$router.push({ name: 'TimeSheets', params: { 'projectID': projectID } })" :style="{background: `radial-gradient(circle, ${projectDict['colour'][1]} 0%, ${projectDict['colour'][0]} 100%)`, color: `${pickTextColorBasedOnBgColor(projectDict['colour'][1])}`}">
                            <div>
                                <p>{{ projectDict.name }}</p>
                                <p style="font-size: small;">Duration: {{ projectDict.duration }} Weeks</p>
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
import { userDict } from '../main.ts';
export default {
    name: 'ProjectView',
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
        return{
            userObj: userDict,
            today: '',
            hours: "0.00",
            pay: "0.00"
        }
    },
    beforeMount(){
        let date = new Date();
        let dd = String(date.getDate()).padStart(2, '0');
        let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = date.getFullYear();
        this.today = mm + '/' + dd + '/' + yyyy;
        console.log(userDict)
        if(!(this.today in userDict['timeLogged'])){
            userDict['timeLogged'] = {}
            userDict['timeLogged'][this.today] = {'hours': 0, 'pay': 0};
        }
        this.hours = userDict['timeLogged'][this.today]['hours'].toFixed(2)
        this.pay = userDict['timeLogged'][this.today]['pay'].toFixed(2)
    },
    methods: {
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
        numberWithCommas(num) {
			return ((parseFloat(num).toFixed(2)).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));
		}
    }
};
</script>


<style>
.item_container{
    width: 100%;
    height: calc(100vh - var(--navbar_height) - 150px - 18px);
    overflow-y: auto;
}
.items{
    display: flex;
    flex-direction: column-reverse;
    justify-content: flex-end;
    align-items: center;
    gap: 3px;
    flex-wrap: wrap;
    gap: 15px;
    width: 100%;
}
.list_item{
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    width: 90%;
    height: 110px;
    padding: 0 20px;
    color: white;
    cursor: pointer;
    font-family: Lato;
    font-weight: 900;
    font-size: 1.6em;
    border-radius: 5px;
    gap: 10px;
}
h4{
    margin: 0px;
    display: flex;
    justify-content: center;
}
ion-toolbar{
    --background: var(--primary)
}
ion-toolbar > *{
    color: white;
}
</style>
