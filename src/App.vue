<script setup lang="ts">
import { baseApi } from './utils/env';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import en from 'element-plus/dist/locale/en.mjs';
import NewProductDialog from '@/views/NewProductDialog.vue';
import NewPartDialog from '@/views/NewPartDialog.vue';
const { locale } = useI18n();
const route = useRoute();

const elementLocale = computed(() => {
	// @ts-ignore
	locale.value = parent.dsLang || 'zh';
	localStorage.setItem('language', locale.value);
	return locale.value === 'zh' ? zhCn : en;
});

import { useBaseInfoStore } from '@/store';
const baseInfoStore = useBaseInfoStore();
baseInfoStore.fetchSpaceUrl();
</script>

<template>
	<el-config-provider :locale="elementLocale">
		<RouterView :key="route.fullPath" />
		<NewProductDialog :visible="false" />
		<NewPartDialog :visible="false" />
	</el-config-provider>
</template>
