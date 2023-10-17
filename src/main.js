import { createApp, h } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n.js';
import axios from 'axios'
import VueAxios from 'vue-axios'

import './assets/sass/main.scss'

const app = createApp({
    render: ()=>h(App),
    setup() {
        const { t } = useI18n({ useScope: 'global' }) // call `useI18n`, and spread `t` from  `useI18n` returning

        return { t } // return render context that included `t`
    }
})

app.use(router).use(VueAxios, axios).use(i18n)

app.mount('#app')
