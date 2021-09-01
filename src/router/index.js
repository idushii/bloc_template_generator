import Vue from 'vue';
import VueRouter from 'vue-router';
import Editor from '../views/Editor.vue';
Vue.use(VueRouter);
const routes = [
    {
        path: '/',
        name: 'Home',
        component: Editor
    },
    {
        path: '/about',
        name: 'About',
        // route level utils-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    }
];
const router = new VueRouter({
    routes
});
export default router;
//# sourceMappingURL=index.js.map