import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDialogStore = defineStore('dialog', {
	state: () => ({
		visible: ref(false),
		isProductDialog: ref(false),
		isPartDialog: ref(false),
		repeat: ref(false),
		isNavigating: ref(false),
		shouldResetForm: ref(false)
	}),
	actions: {
		openProductDialog() {
			this.isProductDialog = true;
			this.isPartDialog = false;
			this.visible = true;
			this.repeat = false;
			this.isNavigating = false;
			this.shouldResetForm = false;
		},
		openPartDialog() {
			this.isProductDialog = false;
			this.isPartDialog = true;
			this.visible = true;
			this.repeat = false;
			this.isNavigating = false;
			this.shouldResetForm = false;
		},
		closeDialog() {
			this.visible = false;
			this.isProductDialog = false;
			this.isPartDialog = false;
			this.repeat = false;
			this.isNavigating = false;
			this.shouldResetForm = false;
		},
		setRepeatMode(val: boolean) {
			this.repeat = val;
		},
		startNavigation() {
			this.isNavigating = true;
		},
		endNavigation() {
			this.isNavigating = false;
		},
		setShouldResetForm(val: boolean) {
			this.shouldResetForm = val;
		}
	}
});
