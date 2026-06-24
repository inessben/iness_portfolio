const FtpDeploy = require('ftp-deploy');
const path = require('path');
require('dotenv').config();

const ftpDeploy = new FtpDeploy();

const host = process.env.FTP_HOST
  ? process.env.FTP_HOST.replace(/^\w+:\/\//, '').trim()
  : '';
const remotePath = process.env.FTP_REMOTE_PATH
  ? `/${process.env.FTP_REMOTE_PATH.replace(/^\/*|\/*$/g, '')}/`
  : '/public_html/';

const config = {
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  host,
  port: Number(process.env.FTP_PORT) || 21,
  localRoot: path.join(__dirname, 'dist'),
  remoteRoot: remotePath,
  include: ['*', '**/*'],
  deleteRemote: false,
  forcePasv: true,
  sftp: false,
};

console.log('🚀 Déploiement vers Hostinger...');
console.log(`   Hôte  : ${config.host}`);
console.log(`   Dossier distant : ${config.remoteRoot}`);
console.log(`   Fichiers locaux : ${config.localRoot}\n`);

ftpDeploy
  .deploy(config)
  .then(() => {
    console.log('\n✅ Déploiement réussi !');
    console.log('   Votre site est en ligne sur Hostinger.');
  })
  .catch((err) => {
    console.error('\n❌ Erreur de déploiement :', err.message);
    console.error('   Vérifiez vos identifiants dans le fichier .env');
    process.exit(1);
  });

ftpDeploy.on('uploading', (data) => {
  const pct = Math.round((data.transferredFileCount / data.totalFilesCount) * 100);
  process.stdout.write(`\r   [${pct}%] ${data.filename}`);
});
