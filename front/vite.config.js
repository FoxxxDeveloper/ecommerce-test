import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permitir conexiones externas
    port: 5173, // Cambia el puerto si es necesario
    hmr: {
      host: 'localhost', // O tu IP local, si lo prefieres
    }
  }
})


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'

// // https://vitejs.dev/config/
// export default defineConfig({
//   base: '/sistemas/test/', // Asegúrate de incluir esta línea
//   plugins: [react()],
// })