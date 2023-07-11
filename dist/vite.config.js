export default {
    root: 'sources/',
    publicDir: '../public/',
    base: './',
    server:
    {
        host: true,
        // open: !isCodeSandbox // Open if it's not a CodeSandbox
    },
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