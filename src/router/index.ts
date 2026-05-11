import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import PartDetailView from '@/views/PartDetailView.vue';

const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView
		},
		{
			path: '/part-detail/:physicalId',
			name: 'partDetail',
			component: PartDetailView,
			props: true
		}
	]
});

export default router;
