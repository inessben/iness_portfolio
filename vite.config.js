import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                index: 'index.html',
                skills: 'skills/skills.html',
                projects: 'projects/projects.html'
            }
        }
    }
});
