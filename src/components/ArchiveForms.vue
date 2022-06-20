<template>
    <!-- Edit Project -->
	<div class="form_container" v-if="archiveForm == `editArchive`">
		<div class="form">
            <div id="edit_projectID_archive" projectid="invalid"></div>
            <label for="project_archive">Archive?</label>
            <input id="project_archive" type="checkbox" checked/>

			<fieldset>
                <div class="button_item glossy" style="background-color: var(--primary);" @click="editArchive">Save Archive</div>
                <div class="button_item glossy" style="background-color: red;" @click="deleteArchive">Delete</div>
                <div class="button_item glossy" style="background-color: var(--secondary);" @click="this.$emit('cancelled', '')">Cancel</div>
			</fieldset>
		</div>
	</div>
</template>

<script>
import userDict from "../../public/userData.json"
import $ from 'jquery'
import { Dialog } from '@capacitor/dialog';
export default {
    name: 'ArchiveForms',
    emits: ["cancelled"],
    props: {
        archiveForm: String
    },
    methods: {
        editArchive(){
            const projectID = $(`#edit_projectID_archive`).attr('projectid');
            if(!($('#project_archive')[0].checked)){
                userDict['projects'][projectID] = {...userDict['archive']['projects'][projectID]}
                delete userDict['archive']['projects'][projectID]
            }
            this.$emit('cancelled', '');
        },
        async deleteArchive(){
            const projectID = $(`#edit_projectID_archive`).attr('projectid');
            const { value } = await Dialog.confirm({
                title: 'Confirm',
                message: `Are you sure you want to delete ${userDict['archive']['projects'][projectID]['name']}?`,
            });
            if(value){
                delete userDict['archive']['projects'][projectID];
            }
            this.$emit('cancelled', '');
        }
    }
}
</script>

<style scoped>
input {
	width: 200px;
    height: 28px;
    min-height: 28px;
	padding: 2px;
	font-family: 'Segoe UI', sans-serif;
	font-size: 15px;
	background-color: transparent;
	border: 1px solid black;
	border-bottom: 3px solid black;
	border-radius: 5px;
	outline: unset;
	transition: 0.2s ease border;
}

.form_error {
	border-color: red !important;
}

.form_container {
	position: absolute;
	z-index: 1000;
	inset: 0px;
	opacity: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	font-family: 'Segoe UI', sans-serif;
	transition: 0.2s ease all;
    backdrop-filter: blur(15px);
}

.form{
	display: flex;
	position: relative;
	flex-direction: column;
	justify-content: flex-start;
	align-items: center;
	gap: 10px;
	padding: 20px;
	background-color: white;
    border: 1px solid black;
	border-radius: 5px;
	transition: 0.3s ease all;
    height: 315px;
    overflow-y: auto;
}

.form fieldset{
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 10px;
	margin-top: 20px;
	border: unset;
}

select{
	margin: 10px 0px;
	border-radius: 10px;
	padding: 5px;
	width: 110px;
	outline: none;
    background: white;
}

#project_archive{
    height: 30px;
    background-color: white;
    color: white;
}
</style>
