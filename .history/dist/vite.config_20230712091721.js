export default {

    build:
    {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                main: 'index.html',
                skills: 'skills.html',
                projects: 'projects.html'
            }
        }
    }
}