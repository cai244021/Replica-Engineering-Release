import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type QueryMode = 'index' | 'db';

const DB_MODE_DURATION_MS = 3 * 60 * 1000; // 3 分钟

export const useQueryModeStore = defineStore('queryMode', () => {
	// State
	const queryMode = ref<QueryMode>('index');
	const expireAt = ref<number>(0);
	const remainingSeconds = ref<number>(0);

	let timerId: ReturnType<typeof setInterval> | null = null;

	// Getters
	const isDbMode = computed(() => queryMode.value === 'db');
	const isIndexMode = computed(() => queryMode.value === 'index');
	const countdownText = computed(() => {
		if (queryMode.value !== 'db') return '';
		const m = Math.floor(remainingSeconds.value / 60);
		const s = remainingSeconds.value % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	});

	// Actions
	function startTimer() {
		clearTimer();
		expireAt.value = Date.now() + DB_MODE_DURATION_MS;
		remainingSeconds.value = DB_MODE_DURATION_MS / 1000;

		timerId = setInterval(() => {
			const left = Math.ceil((expireAt.value - Date.now()) / 1000);
			remainingSeconds.value = left > 0 ? left : 0;
			if (left <= 0) {
				switchToIndexMode();
			}
		}, 1000);
	}

	function clearTimer() {
		if (timerId) {
			clearInterval(timerId);
			timerId = null;
		}
		expireAt.value = 0;
		remainingSeconds.value = 0;
	}

	function switchToDbMode() {
		queryMode.value = 'db';
		console.log('[QueryModeStore] 切换到数据库模式');
		startTimer();
	}

	function switchToIndexMode() {
		queryMode.value = 'index';
		console.log('[QueryModeStore] 切换到索引模式');
		clearTimer();
	}

	function toggleMode() {
		if (queryMode.value === 'db') {
			switchToIndexMode();
		} else {
			switchToDbMode();
		}
		console.log('[QueryModeStore] 当前模式:', queryMode.value);
	}

	return {
		queryMode,
		isDbMode,
		isIndexMode,
		remainingSeconds,
		countdownText,
		switchToDbMode,
		switchToIndexMode,
		toggleMode,
		clearTimer
	};
});
