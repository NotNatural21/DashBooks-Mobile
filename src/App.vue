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
                            <ion-item @click="''" lines="none" detail="false" class="hydrated">
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
                let string = JSON.stringify(userDict)
                Filesystem.writeFile({ path: "DashBooks/userData.ssdb", data: string, directory: Directory.Documents, recursive: false, encoding: Encoding.UTF8 })
            }
        });
    },
    methods: {
        triggerUpload(){
            $('#uploadSave').click()
        },
        async uploadSaveContents(){
            let uploadedFile = $('#uploadSave').prop('files')[0]
            let u8arr = new Uint8Array(await uploadedFile.arrayBuffer())
            let zipFile = await JSZip.loadAsync(u8arr);
            let u8data = zipFile.files['userData.ssdb']._data.compressedContent;
            let string = new TextDecoder().decode(u8data);
            let userDictRead = saveChecker(JSON.parse(string));
            console.log(userDictRead)
            for(const[key, entry] of Object.entries(userContents)){
                userDict[key] = entry;
            }
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
