import { createI18n } from 'vue-i18n';
import en from './locales/en';
import uk from './locales/uk';

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('lang') ?? 'uk',
    fallbackLocale: localStorage.getItem('lang') ?? 'uk',
    messages: {
        en,
        uk
    },
});

export default i18n;