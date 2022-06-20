<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="black"></ion-menu-button>
                </ion-buttons>
                <ion-title>Settings</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content> 
            <div class="page">
                <div id="settingsBar" class="glossy">
                    <div class="settings_button" @click="buttonSelect">PROJECTS</div>
                    <div class="settings_button" @click="buttonSelect">INVOICING</div>
                    <div class="settings_button" @click="buttonSelect">RECORDS</div>
                    <div class="settings_button" @click="buttonSelect">ARCHIVE</div>
                </div>
                <div id="settings_container">
                    <div class="settings_section" v-if="settingsPage == 'PROJECTS'">
                        <div class="settings_item"> <!-- PROJECTS -->
                            <p>You Have {{ Object.keys(userObj['projects']).length == 1 ? Object.keys(userObj['projects']).length + ' Project' : Object.keys(userObj['projects']).length + ' Projects' }}</p>
                            <div class="createButton glossy" @click="createForm(event, `createProject`)">Create Project</div>
                            <div class="item_container">
                                <div class="items">
                                    <div v-for="(projectDict, projectID) in userObj['projects']" :key="projectDict" class="list_item" :data="projectID" @click="editProject($event, `editProject`)" :style="{background: `radial-gradient(circle, ${projectDict['colour'][1]} 0%, ${projectDict['colour'][0]} 100%)`, color: `${pickTextColorBasedOnBgColor(projectDict['colour'][1])}`}">
                                        <div style="pointer-events: none;">
                                            <p style="pointer-events: none;">{{ projectDict.name }}</p>
                                            <p style="font-size: small; pointer-events: none;">Duration: {{ projectDict.duration }} Weeks</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="settings_item"> <!-- COLOURS -->
                            <p>You Have {{ (Object.keys(userObj['colours']).length - 1) == 1 ? (Object.keys(userObj['colours']).length - 1) + ' Colour' : (Object.keys(userObj['colours']).length - 1) + ' Colours' }}</p>
                            <div class="createButton glossy" @click="createForm(event, `createColour`)">Create Colours</div>
                            <div class="item_container">
                                <div class="items">
                                    <template v-for="(colourDict, colourID) in userObj['colours']" :key="colourDict">
                                        <div v-if="colourID != `colourWhite`" class="list_item" :data="colourID" @click="editProject($event, `editColour`)" style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)">
                                            <div class="colour_preview" :style="{backgroundColor: colourDict['colour']}"></div>
                                            <div style="pointer-events: none;">
                                                <p style="pointer-events: none;">{{ colourDict.name }}</p>
                                                <p style="font-size: small;">${{ colourDict.rate }}</p>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <ProjectForms :projectForm="projectRequest" @cancelled="cancelForm"/>
                    </div>
                    <div class="settings_section" v-if="settingsPage == 'INVOICING'">
                        <div class="settings_item"> <!-- USERS -->
                             <p>You Have {{ Object.keys(userObj['users']).length == 1 ? Object.keys(userObj['users']).length + ' User' : Object.keys(userObj['users']).length + ' Users' }}</p>
                            <div class="createButton glossy" @click="createForm(event, `createUser`)">Create User</div>
                            <div class="item_container">
                                <div class="items">
                                    <div v-for="(userDict, userID) in userObj['users']" :key="userDict" class="list_item" :data="userID" @click="editInvoice($event, `editUser`)" style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)">{{ userDict.user }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="settings_item"> <!-- CLIENTS -->
                           <p>You Have {{ Object.keys(userObj['clients']).length == 1 ? Object.keys(userObj['clients']).length + ' Client' : Object.keys(userObj['clients']).length + ' Clients' }}</p>
                            <div class="createButton glossy"  @click="createForm(event,`createClient`)">Create Client</div>
                            <div class="item_container">
                                <div class="items">
                                   <div v-for="(clientDict, clientID) in userObj['clients']" :key="clientDict" class="list_item" :data="clientID" @click="editInvoice($event, `editClient`)" style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)">{{ clientDict.client }}</div>
                                </div>
                            </div>
                        </div>
                        <InvoiceForms :invoiceForm="invoiceRequest" @cancelled="cancelForm"/>
                    </div>
                    <div class="settings_section" v-if="settingsPage == 'RECORDS'">
                        <div class="settings_item"> <!-- CATEGORIES -->
                            <p>You Have {{(Object.keys(userObj['records']['categories']).length) == 1 ? (Object.keys(userObj['records']['categories']).length) + ' Category' : (Object.keys(userObj['records']['categories']).length) + ' Categories' }}</p>
                            <div class="createButton glossy" @click="createForm(event, `createCategory`)">Create Category</div>
                            <div class="item_container">
                                <div class="items">
                                    <template v-for="(status, Category) in userObj['records']['categories']" :key="Category">
                                        <div class="list_item" :data="Category" :category="Category" @click="editRecords($event, `editCategory`)" style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)">
                                            {{ Category }}
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <div class="settings_item"> <!-- PAYEE -->
                           <p>You Have {{ ((userObj['records']['payee']).length) == 1 ? ((userObj['records']['payee']).length) + ' Payee' : ((userObj['records']['payee']).length) + ' Payees' }}</p>
                            <div class="createButton glossy" @click="createForm(event,`createPayee`)">Create Payee</div>
                            <div class="item_container">
                                <div class="items">
                                   <template v-for="payee in userObj['records']['payee']" :key="payee">
                                        <div class="list_item" :data="`payee`" :payee="payee" @click="editRecords($event, `editPayee`)" style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)">
                                            {{ payee }}
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <div class="settings_item"> <!-- CLIENTS -->
                           <p>You Have {{ ((userObj['records']['accounts']).length) == 1 ? ((userObj['records']['accounts']).length) + ' Account' : ((userObj['records']['accounts']).length) + ' Accounts' }}</p>
                            <div class="createButton glossy" @click="createForm(event, `createAccount`)">Create Account</div>
                            <div class="item_container">
                                <div class="items">
                                   <template v-for="Account in userObj['records']['accounts']" :key="Account">
                                        <div class="list_item" :data="`accounts`" :account="Account" @click="editRecords($event, `editAccount`)" style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)">
                                            {{ Account }}
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <RecordForms :recordForm="recordRequest" @cancelled="cancelForm"/>
                    </div>
                    <div class="settings_section" v-if="settingsPage == 'ARCHIVE'">
                        <div class="settings_item"> <!-- ARCHIVE -->
                           <p>You Have {{ Object.keys(userObj['archive']['projects']).length == 1 ? Object.keys(userObj['archive']['projects']).length + ' Archived Project' : Object.keys(userObj['archive']['projects']).length + ' Archived Projects' }}</p>
                            <div class="item_container">
                                <div class="items">
                                   <div v-for="(archiveDict, projectID) in userObj['archive']['projects']" :key="archiveDict" class="list_item" :data="projectID" @click="editArchive($event, `editArchive`)" :style="{background: `radial-gradient(circle, ${archiveDict['colour'][1]} 0%, ${archiveDict['colour'][0]} 100%)`, width: '95%', color: `${pickTextColorBasedOnBgColor(archiveDict['colour'][1])}`}">
                                        <div style="pointer-events: none;">
                                            <p style="pointer-events: none;">{{ archiveDict.name }}</p>
                                            <p style="font-size: small; pointer-events: none;">Duration: {{ archiveDict.duration }} Weeks</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ArchiveForms :archiveForm="archiveRequest" @cancelled="cancelForm"/>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import ProjectForms from '../components/ProjectForms'
import ArchiveForms from '../components/ArchiveForms'
import InvoiceForms from '../components/InvoiceForms'
import RecordForms from '../components/RecordForms'
import userDict from "../../public/userData.json"
import $ from 'jquery'
export default {
    name: 'HomeView',
    components: {
        ArchiveForms,
        ProjectForms,
        RecordForms,
        InvoiceForms,
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
            settingsPage: '',
            userObj: userDict,
            invoiceRequest: '',
            recordRequest: '',
            archiveRequest: '',
            projectRequest: ''
        }
    },
    methods: {
        createForm(event, form){
            if(form.includes('Project') || form.includes('Colour')){
                this.projectRequest = form;
            }else if(form.includes('User') || form.includes('Client')){
                this.invoiceRequest = form;
            }else{
                this.recordRequest = form;
            }
            this.$nextTick(() => {
                $(".form_container")[0].scrollIntoView();
            });
        },
        cancelForm(){
            this.projectRequest = ``;
            this.invoiceRequest = ''
            this.recordRequest = ''
            this.archiveRequest = ''
        },
        buttonSelect(event){
            $('.settings_button').each(function(i, obj) {
                $(obj).removeClass('active_button')
            });
            $(event.target).addClass('active_button');
            this.settingsPage = $(event.target).text();
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
        editArchive(event, form){
            const ID = $(event.target).attr('data');
            this.archiveRequest = form;
            this.$nextTick(() => {
                $(`#edit_projectID_archive`).attr(`projectid`, ID);
            });
        },
        editProject(event, form){
            const ID = $(event.target).attr('data');
            this.projectRequest = form;
            this.$nextTick(() => {
                $(".form_container")[0].scrollIntoView();
                if(form.includes('Project')){
                    $(`#edit_projectID`).attr(`projectid`, ID);
                    $(`#edit_project_name`).val(userDict['projects'][ID]['name']);
                    $(`#edit_project_duration`).val(userDict['projects'][ID]['duration']);
                    $(`#edit_project_target`).val(userDict['projects'][ID]['targetHours']);
                    $('#edit_project_archive').prop('checked', false);
                    $(`#edit_project_colour`).val(userDict['projects'][ID]['colour'][0]);
                }else{
                    $(`#edit_colourID`).attr(`colourid`, ID);
					$(`#edit_colour_name`).val(userDict['colours'][ID]['name']);
					$(`#edit_colour_rate`).val(userDict['colours'][ID]['rate']);
					$(`#edit_colour_colour`).val(userDict['colours'][ID]['colour']);
                }
            });
        }, 
        editInvoice(event, form){
            const ID = $(event.target).attr('data');
            this.invoiceRequest = form;
            this.$nextTick(() => {
                $(".form_container")[0].scrollIntoView();
                if(form.includes('User')){
                    $(`#edit_user`).val(userDict['users'][ID]['user']);
					$(`#edit_user_name`).val(userDict['users'][ID]['name']);
					$(`#edit_user_addOne`).val(userDict['users'][ID]['addOne']);
					$(`#edit_user_addTwo`).val(userDict['users'][ID]['addTwo']);
					$(`#edit_user_city`).val(userDict['users'][ID]['city']);
					$(`#edit_user_country`).val(userDict['users'][ID]['country']);
					$(`#edit_user_contact`).val(userDict['users'][ID]['contact']);
					$(`#edit_userID`).attr(`userid`, ID);
                }else{
					$(`#edit_client`).val(userDict['clients'][ID]['client']);
					$(`#edit_client_name`).val(userDict['clients'][ID]['name']);
					$(`#edit_client_addOne`).val(userDict['clients'][ID]['addOne']);
					$(`#edit_client_addTwo`).val(userDict['clients'][ID]['addTwo']);
					$(`#edit_client_city`).val(userDict['clients'][ID]['city']);
					$(`#edit_client_country`).val(userDict['clients'][ID]['country']);
					$(`#edit_client_contact`).val(userDict['clients'][ID]['contact']);
					$(`#edit_clientID`).attr(`clientid`, ID);
                }
            });
        },
        editRecords(event, form){
            this.recordRequest = form;
            this.$nextTick(() => {
                $(".form_container")[0].scrollIntoView();
                if(form.includes('Category')){
					let category = $(event.target).attr(`category`)
                    $(`#edit_category_old`).attr(`oldcategory`, category);
                    $(`#edit_category`).val(category);
                    $(`#edit_category_status`).prop('checked', userDict['records']['categories'][category]);
                }else if(form.includes('Payee')){
                    let payee = $(event.target).attr(`payee`);
                    $(`#edit_payee_old`).attr(`oldpayee`, payee);
                    $(`#edit_payee`).val(payee);
                }else{
                    let account = $(event.target).attr(`account`)
                    $(`#edit_account_old`).attr(`oldaccount`, account);
                    $(`#edit_account`).val(account);
                }
            });
        },
    }
};
</script>


<style scoped>
#settingsBar{
    background-color: var(--secondary);
    width: 100%;
    height: 50px;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-around;
}

.settings_button{
    color: white;
    margin: 0px 10px;
    font-size: 75%;
}

.active_button{
    text-decoration: underline;
}
#settings_container{
    width: 100%;
    height: 100%;
    overflow-y: auto;
}

.settings_section{
    height: 100%;
}

.settings_item{
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
}
.createButton{
    height: 30px;
    width: 90%;
    border-radius: 10px;
    display: flex;
    margin-top: 10px;
    border: 1px solid black;
    background-color: var(--secondary);
    align-items: center;
    justify-content: center;
    color: white;
}
.item_container{
    display: flex;
    justify-content: center;
    margin-top: 10px;
    width: 100%;
    height: calc(100vh - var(--navbar_height) - 180px - 18px);
    overflow-y: auto;
    margin-bottom: 10px;
}
.items{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 15px;
    width: 95%;
}
.list_item{
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    width: 95%;
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
.colour_preview {
    height: 45%;
    aspect-ratio: 1;
    border-radius: 10px;
    border: 1px solid black;
}
p{
	margin: 0px !important;
}
ion-toolbar{
    --background: var(--primary)
}
ion-toolbar > *{
    color: white;
}
</style>
