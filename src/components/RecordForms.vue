<template>
    <!-- Create Category -->
	<div class="form_container" v-if="recordForm == `createCategory`">
		<div class="form">
			<label for="create_category">Category:</label>
			<input id="create_category" type="text" />

            <label for="create_category_status">Include Category in Pivot Table:</label>
            <input id="create_category_status" type="checkbox" checked/>

			<fieldset>
                <div class="button_item glossy" style="background-color: var(--primary);" @click="createCategory">Create Category</div>
                <div class="button_item glossy" style="background-color: var(--secondary);" @click="this.$emit('cancelled', '')">Cancel</div>
			</fieldset>
		</div>
	</div>

	<!-- Edit Category -->
	<div class="form_container" v-if="recordForm == `editCategory`">
		<div class="form">
			<div id="edit_category_old" oldcategory='invalid' style="display:none;"></div>
			<label for="edit_category">Category:</label>
			<input id="edit_category" type="text" />

            <label for="edit_category_status">Include Category in Pivot Table:</label>
            <input id="edit_category_status" type="checkbox" checked/>

			<fieldset>
                <div class="button_item glossy" style="background-color: var(--primary);" @click="editCategory">Save Category</div>
                <div class="button_item glossy" style="background-color: red;" @click="deleteCategory">Delete</div>
                <div class="button_item glossy" style="background-color: var(--secondary);" @click="this.$emit('cancelled', '')">Cancel</div>
			</fieldset>
		</div>
	</div>
	

	<!-- Create Accounts -->
	<div class="form_container" v-if="recordForm == `createAccount`">
		<div class="form">
			<label for="create_account">Account:</label>
			<input id="create_account" type="text" />

			<fieldset>
                <div class="button_item glossy" style="background-color: var(--primary);" @click="createAccount">Create Account</div>
                <div class="button_item glossy" style="background-color: var(--secondary);" @click="this.$emit('cancelled', '')">Cancel</div>
			</fieldset>
		</div>
	</div>

	<!-- Edit Accounts -->
	<div class="form_container" v-if="recordForm == `editAccount`">
		<div class="form">
			<div id="edit_account_old" oldaccount='invalid'></div>
			<label for="edit_account">Account:</label>
			<input id="edit_account" type="text" />

			<fieldset>
                <div class="button_item glossy" style="background-color: var(--primary);" @click="editAccount">Save Account</div>
                <div class="button_item glossy" style="background-color: red;" @click="deleteAccount">Delete</div>
                <div class="button_item glossy" style="background-color: var(--secondary);" @click="this.$emit('cancelled', '')">Cancel</div>
			</fieldset>
		</div>
	</div>
	
	<!-- Create Payee -->
	<div class="form_container" v-if="recordForm == `createPayee`">
		<div class="form">
			<label for="create_payee">Payee:</label>
			<input id="create_payee" type="text" />

			<fieldset>
                <div class="button_item glossy" style="background-color: var(--primary);" @click="createPayee">Create Payee</div>
                <div class="button_item glossy" style="background-color: var(--secondary);" @click="this.$emit('cancelled', '')">Cancel</div>
			</fieldset>
		</div>
	</div>

	<!-- Edit Payee-->
	<div class="form_container" v-if="recordForm == `editPayee`">
		<div class="form">
			<div id="edit_payee_old" oldpayee='invalid'></div>
			<label for="edit_payee">Payee:</label>
			<input id="edit_payee" type="text" />

			<fieldset>
                <div class="button_item glossy" style="background-color: var(--primary);" @click="editPayee">Save Payee</div>
                <div class="button_item glossy" style="background-color: red;" @click="deletePayee">Delete</div>
                <div class="button_item glossy" style="background-color: var(--secondary);" @click="this.$emit('cancelled', '')">Cancel</div>
			</fieldset>
		</div>
	</div>
</template>

<script>
import { userDict } from '../main.ts';
import $ from 'jquery'
import { Dialog } from '@capacitor/dialog';
export default {
    name: 'RecordForms',
    emits: ["cancelled"],
    props: {
        recordForm: String
    },
    methods: {
        createCategory(){
            let category = $(`#create_category`).val()
			if(category == ''){ //If no category was provided
				$("#create_category").addClass('form_error');
				return false;
			}
			$("#create_category").removeClass('form_error');
			userDict['records']['categories'][category] = $('#create_category_status')[0].checked
			
			this.$emit('cancelled', '');
        },
        editCategory(){
            let category =  $(`#edit_category_old`).attr(`oldcategory`);
            delete userDict['records']['categories'][category];

			let newCategory = $(`#edit_category`).val();
			if(newCategory == ''){ //If no category was provided
				$("#create_category").addClass('form_error');
				return false;
			}
			$("#create_category").removeClass('form_error');
			userDict['records']['categories'][newCategory] = $('#edit_category_status')[0].checked
 
			this.$emit('cancelled', '');
        },
        async deleteCategory(){
            let category =  $(`#edit_category_old`).attr(`oldcategory`);
            const { value } = await Dialog.confirm({
                title: 'Confirm',
                message: `Are you sure you want to delete ${category}?`,
            });
            if(value){
                delete userDict['records']['categories'][category];
            }
            this.$emit('cancelled', '');
        },
        createPayee(){
            let payee = $(`#create_payee`).val()
			if(payee == ''){ //If no category was provided
				$("#create_payee").addClass('form_error');
				return false;
			}
			$("#create_payee").removeClass('form_error');
			userDict['records']['payee'].push(payee)
			
			this.$emit('cancelled', '');
        },
        editPayee(){
            let oldPayee =  $(`#edit_payee_old`).attr(`oldpayee`);
			const index = userDict['records']['payee'].indexOf(oldPayee);
			if (index > -1) {
				userDict['records']['payee'].splice(index, 1);
			}

			let payee = $(`#edit_payee`).val()
			if(payee == ''){ //If no category was provided
				$("#edit_payee").addClass('form_error');
				return false;
			}
			$("#edit_payee").removeClass('form_error');
			userDict['records']['payee'].push(payee);
 
			this.$emit('cancelled', '');
        },
        async deletePayee(){
            let account =  $(`#edit_payee_old`).attr(`oldpayee`);
            const { value } = await Dialog.confirm({
                title: 'Confirm',
                message: `Are you sure you want to delete ${account}?`,
            });
            if(value){
                const index = userDict['records']['payee'].indexOf(account);
                if (index > -1) {
                    userDict['records']['payee'].splice(index, 1);
                }
            }
            this.$emit('cancelled', '');
        },
        createAccount(){
            let account = $(`#create_account`).val()
			if(account == ''){ //If no category was provided
				$("#create_account").addClass('form_error');
				return false;
			}
			$("#create_account").removeClass('form_error');
			userDict['records']['accounts'].push(account);
			
			this.$emit('cancelled', '');
        },
        editAccount(){
            let account =  $(`#edit_account_old`).attr(`oldaccount`);
			const index = userDict['records']['accounts'].indexOf(account);
			if (index > -1) {
				userDict['records']['accounts'].splice(index, 1);
			}
			let newAccount = $(`#edit_account`).val()
			if(newAccount == ''){ //If no category was provided
				$("#edit_account").addClass('form_error');
				return false;
			}
			$("#edit_account").removeClass('form_error');
			userDict['records']['accounts'].push(newAccount);
 
			this.$emit('cancelled', '');
        },
        async deleteAccount(){
            let account =  $(`#edit_account_old`).attr(`oldaccount`);
            const { value } = await Dialog.confirm({
                title: 'Confirm',
                message: `Are you sure you want to delete ${account}?`,
            });
            if(value){
                const index = userDict['records']['accounts'].indexOf(account);
                if (index > -1) {
                    userDict['records']['accounts'].splice(index, 1);
                }
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
    height: 88%;
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

</style>
