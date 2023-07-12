// vite.config.js

export default {
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                skills: 'skills.html',
                projects: 'projects.html'
            }
        }
    }
}