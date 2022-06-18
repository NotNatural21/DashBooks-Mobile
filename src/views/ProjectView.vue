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
        <ion-content :fullscreen="true"> 
            <!-- CONTENT GOES HERE -->
        </ion-content>
    </ion-page>
</template>

<script>
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';

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
    }
};
</script>


<style scoped >

</style>