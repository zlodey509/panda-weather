import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vitePluginRequire from "vite-plugin-require";
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            imports: [
                'vue-i18n',
                {
                    'vue': ['ref', 'onMounted', 'computed', 'watch', 'reactive'],
                    'vue-router': ['useRouter', 'useRoute'],
                }
            ]
        }),
        // vitePluginRequire({})
    ],
    commonjsOptions: {
      esmExternals: true,
   },
});