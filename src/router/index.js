import { createRouter, createWebHistory} from "vue-router";
import Home from '../views/Home.vue'
import Portfolio from '../views/Portfolio.vue'
import About from '../views/About.vue'
import FinalExam from '../views/FinalExam.vue'

const routes = [
    {path: '/', name: 'Home',component: Home},
    {path: '/Portfolio', component: Portfolio},
    {path: '/about', component: About},
    {path: '/final-exam', component: FinalExam},
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router