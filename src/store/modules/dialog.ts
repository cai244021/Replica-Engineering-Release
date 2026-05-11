import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDialogStore = defineStore('dialog', {
	state: () => ({
		visible: ref(false),
		isProductDialog: ref(false),
		isPartDialog: ref(false),
		repeat: ref(false),
		isNavigating: ref(false),
		shouldResetForm: ref(false),
		createSource: ref<'home' | 'partDetailTable'>('home'),
		createContextPhysicalIds: ref<string[]>([]),
		createContextRowIds: ref<string[]>([]),
		createContextTypeNames: ref<string[]>([]),
		createContextVersion: ref(0),
		lastCreatedInfo: ref<{ physicalid: string; name: string; type: string; repeat?: boolean; createType?: 'product' | 'part' | 'drawing' } | null>(null),
		lastCreatedVersion: ref(0)
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
		},
		setCreateContext(source: 'home' | 'partDetailTable', physicalIds: string[] = [], rowIds: string[] = [], typeNames: string[] = []) {
			this.createSource = source;
			this.createContextPhysicalIds = physicalIds;
			this.createContextRowIds = rowIds;
			this.createContextTypeNames = typeNames;
			this.createContextVersion += 1;
		},
		clearCreateContext() {
			this.createSource = 'home';
			this.createContextPhysicalIds = [];
			this.createContextRowIds = [];
			this.createContextTypeNames = [];
			this.createContextVersion += 1;
		},
		notifyCreated(info: { physicalid: string; name: string; type: string; repeat?: boolean; createType?: 'product' | 'part' | 'drawing' }) {
			this.lastCreatedInfo = info;
			this.lastCreatedVersion += 1;
		}
	}
});
