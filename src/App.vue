<template>
    <ion-app>
        <ion-split-pane content-id="main-content">
            <ion-menu content-id="main-content" type="overlay"> <!-- Menu -->
                <ion-content>
                    <ion-list id="navItems">
                        <ion-list-header>Menu</ion-list-header>
                        <ion-menu-toggle auto-hide="false" v-for="(p, i) in appPages" :key="i">
                            <ion-item @click="selectedIndex = i" router-direction="root" :router-link="p.url" lines="none" detail="false" class="hydrated" :class="{ selected: selectedIndex === i }">
                                <ion-icon slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
                                <ion-label>{{ p.title }}</ion-label>
                            </ion-item>
                        </ion-menu-toggle>
                    </ion-list>
                    <ion-list>
                        <ion-menu-toggle auto-hide="false">
                            <ion-item @click="triggerUpload" lines="none" detail="false" class="hydrated">
                                <ion-icon slot="start" :ios="cloudUploadOutline" :md="cloudUploadOutline"></ion-icon>
                                <ion-label>Upload Save</ion-label>
                            </ion-item>
                            <input type="file" id="uploadSave" accept=".dbss" @change="uploadSaveContents"/>
                        </ion-menu-toggle>

                        <ion-menu-toggle auto-hide="false">
                            <ion-item @click="exportData" lines="none" detail="false" class="hydrated">
                                <ion-icon slot="start" :ios="downloadOutline" :md="downloadOutline"></ion-icon>
                                <ion-label>Export Data</ion-label>
                            </ion-item>
                        </ion-menu-toggle>
                    </ion-list>
                </ion-content>
            </ion-menu>
            <ion-router-outlet id="main-content"></ion-router-outlet>
        </ion-split-pane>
    </ion-app>
</template>

<script>
import { saveChecker, userDict } from './main.ts';
import { IonApp, IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenu, IonMenuToggle, IonRouterOutlet, IonSplitPane } from '@ionic/vue';
import { ref } from 'vue';
import { App } from '@capacitor/app';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Dialog } from '@capacitor/dialog';
import JSZip from 'jszip';
import $ from 'jquery'
import { useRoute } from 'vue-router';
import { gridOutline, settingsOutline, briefcaseOutline, receiptOutline, fileTrayFullOutline, helpCircleOutline, cloudUploadOutline, downloadOutline } from 'ionicons/icons';

export default {
    name: 'App',
    components: {
        IonApp, 
        IonContent, 
        IonIcon, 
        IonItem, 
        IonLabel, 
        IonList, 
        IonListHeader, 
        IonMenu, 
        IonMenuToggle, 
        IonRouterOutlet, 
        IonSplitPane,
    },
    data(){
        return{
            fullFilePath: ''
        }
    },
    setup() {
        const selectedIndex = ref(0);
        const appPages = [
        {
            title: 'DashBoard',
            url: '/folder/DashBoard',
            iosIcon: gridOutline,
            mdIcon: gridOutline
        },
        {
            title: 'Settings',
            url: '/folder/Settings',
            iosIcon: settingsOutline,
            mdIcon: settingsOutline
        },
        {
            title: 'TimeSheets',
            url: '/folder/Projects',
            iosIcon: briefcaseOutline,
            mdIcon: briefcaseOutline
        },
        {
            title: 'Invoicing',
            url: '/folder/Invoicing',
            iosIcon: receiptOutline,
            mdIcon: receiptOutline
        },
        {
            title: 'Records',
            url: '/folder/Records',
            iosIcon: fileTrayFullOutline,
            mdIcon: fileTrayFullOutline
        },
        {
            title: 'Help',
            url: '/folder/Help',
            iosIcon: helpCircleOutline,
            mdIcon: helpCircleOutline
        }
        ];
        const path = window.location.pathname.split('folder/')[1];
        if (path !== undefined) {
        selectedIndex.value = appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
        }
        const route = useRoute();
        return { 
            selectedIndex,
            appPages,
            gridOutline,
            settingsOutline,
            briefcaseOutline,
            receiptOutline,
            fileTrayFullOutline,
            helpCircleOutline,
            cloudUploadOutline,
            downloadOutline,
            isSelected: (url) => url === route.path ? 'selected' : ''
        }
    },
    mounted(){
        App.addListener('appStateChange', ({ isActive }) => {
            console.log('App state changed. Is active?', isActive);
            if(!isActive){
                this.saveUser();
            }
        });
    },
    methods: {
        async triggerUpload(){
            const { value } = await Dialog.confirm({
                title: 'Warning',
                message: `Are you sure you to upload a save file? This will replace all current data and cannot be undone. If you would like to keep your current data, please use "Export Data"`,
            });
            if(value){
                $('#uploadSave').click()
            }
        },
        async uploadSaveContents(){
            let uploadedFile = $('#uploadSave').prop('files')[0];
            let uploadFileName = uploadedFile.name.split('.')[0]
            let u8arr = new Uint8Array(await uploadedFile.arrayBuffer())
            let zipFile = await JSZip.loadAsync(u8arr);
            let u8data = zipFile.files['userData.ssdb']._data.compressedContent;
            let string = new TextDecoder().decode(u8data);
            let userDictRead = saveChecker(JSON.parse(string));
            for(const[key, entry] of Object.entries(userDictRead)){
                userDict[key] = entry;
            }
            this.saveUser();
            let currentpage = this.$route.name
            this.$router.push({ name: 'DashBoard', params: {} })/
            this.$root.$refs.DASHBOARD.loadPage();
            if(currentpage == "Records"){
                this.$root.$refs.RECORDS.getTransArray();
            }
            document.getElementById("uploadSave").value = "";

            //Deal with any Receipts
            Filesystem.rmdir({ path: "DashBooks/Receipts", directory: Directory.Data, recursive: true })
            Filesystem.mkdir({ path: "DashBooks/Receipts", directory: Directory.Data, recursive: true })

            console.log(zipFile.files)
            for(const[key, imgData] of Object.entries(zipFile.files)){
                if(key.includes('Receipts/') && key != `Receipts/`){
                    let imgName = key.split('/')[1]
                    let imageData = this.bytesToBase64(imgData._data.compressedContent);
                    Filesystem.writeFile({ 
                        path: `DashBooks/Receipts/${imgName}`, 
                        data: imageData, 
                        directory: Directory.Data, 
                        recursive: false
                    })
                }
            }
            Dialog.alert({
                title: 'Success',
                message: 'Your save file has been successfully imported',
            });

        },
        async saveUser(){
            let string = JSON.stringify(userDict)
            await Filesystem.writeFile({ path: "DashBooks/userData.ssdb", data: string, directory: Directory.Data, recursive: false, encoding: Encoding.UTF8 })
        },
        async exportData(){
            let zip = new JSZip();
            let usedata = await Filesystem.readFile({ path: "DashBooks/userData.ssdb", directory: Directory.Data })
            zip.file("userData.ssdb", usedata['data'], {base64: true})

            const receipt = zip.folder("Receipts")
            let receiptFiles = await Filesystem.readdir({ path: "DashBooks/Receipts", directory: Directory.Data })
            for (const name of receiptFiles['files']) {
                let imageArr = await Filesystem.readFile({ path: `DashBooks/Receipts/${name}`, directory: Directory.Data })
                receipt.file(name, imageArr['data'], {base64: true})
            }
            let today = new Date();
            let seconds = today.getSeconds();
            let minutes = today.getMinutes();
            let hour = today.getHours();
            let dd = String(today.getDate()).padStart(2, '0');
            let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            let yyyy = today.getFullYear();
            

            today = `${yyyy}${mm}${dd}${hour}${minutes}${seconds}`;
            zip.generateAsync({type:"base64"}).then(function(cont) {
                try {
                    Filesystem.writeFile({ path: `DashBooks/DBExport-${today}.dbss`, data: cont, directory: Directory.Documents, recursive: true }).then(function () {
                        Dialog.alert({
                            title: 'Success',
                            message: 'The data has been successfully exported. You can find your save in "Internal Storage -> Documents -> DashBooks." ',
                        });
                    })
                } catch (error) {
                    Dialog.alert({
                        title: 'Sorry! It looks like there was error',
                        message: `DashBooks failed with error: ${error}`,
                    });
                }
            });
        },
        bytesToBase64(bytes){
            const base64abc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"];
            const base64codes = [ 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255, 255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
            let result = '', i, l = bytes.length;
            for (i = 2; i < l; i += 3) {
                result += base64abc[bytes[i - 2] >> 2];
                result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
                result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
                result += base64abc[bytes[i] & 0x3F];
            }
            if (i === l + 1) { // 1 octet yet to write
                result += base64abc[bytes[i - 2] >> 2];
                result += base64abc[(bytes[i - 2] & 0x03) << 4];
                result += "==";
            }
            if (i === l) { // 2 octets yet to write
                result += base64abc[bytes[i - 2] >> 2];
                result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
                result += base64abc[(bytes[i - 1] & 0x0F) << 2];
                result += "=";
            }
            return result;

        }
    }
};
</script>

<style>
.glossy{
    background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.12) 51%, rgba(0, 0, 0, 0.04));
}
.button_item{
    padding: 12px 15px;
    border-radius: 18px;
    color: white;
}
.page{
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
}
p{
	margin: 0px !important;
}
.form_container{
    touch-action: none;
}
.form{
    touch-action: all;
}
</style>
<style scoped>
#uploadSave{
    width: 0px;
    height: 0px;
    opacity: 0;
}

#downloadSave{
    width: 0px;
    height: 0px;
    opacity: 0;
}


ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu.md ion-note {
  margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 10px;
}

ion-menu.md ion-list#navItems {
  border-bottom: 1px solid var(--ion-color-step-150, #d7d8da);
}

ion-menu.md ion-list#navItems ion-list-header {
  font-size: 22px;
  font-weight: 600;
  min-height: 20px;
}

ion-menu.md ion-list#labels-list ion-list-header {
    font-size: 16px;
    margin-bottom: 18px;
    color: #757575;
    min-height: 26px;
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: #616e7e;
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-note {
  display: inline-block;
  font-size: 16px;

  color: var(--ion-color-medium-shade);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>
