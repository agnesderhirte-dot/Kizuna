const fs=require('node:fs');const path=require('node:path');const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const channel={enabled:true,owner:process.env.KIZUNA_GITHUB_OWNER,repo:process.env.KIZUNA_GITHUB_REPO,publisherName:process.env.KIZUNA_PUBLISHER_NAME,certificateThumbprint:process.env.KIZUNA_CERT_THUMBPRINT};
if(!require('../desktop/central-updater.cjs').validConfig(channel))throw Error('Release blockiert: KIZUNA_GITHUB_OWNER, KIZUNA_GITHUB_REPO, KIZUNA_PUBLISHER_NAME und KIZUNA_CERT_THUMBPRINT fehlen/ungültig.');
if(!process.env.CSC_LINK&&!process.env.WIN_CSC_LINK)throw Error('Release blockiert: Windows-Code-Signing-Zertifikat in CSC_LINK oder WIN_CSC_LINK erforderlich (Passwort per CSC_KEY_PASSWORD).');
if(process.argv.includes('--publish')&&!process.env.GH_TOKEN)throw Error('GitHub-Veröffentlichung benötigt GH_TOKEN. Nicht in die App einbauen.');
const file=path.join(root,'desktop/release-channel.json'),previous=fs.readFileSync(file);
function run(script,args=[]){const result=spawnSync(process.execPath,[path.isAbsolute(script)?script:path.join(root,'node_modules',script),...args],{cwd:root,stdio:'inherit',env:process.env});if(result.status!==0)throw Error('Release-Schritt fehlgeschlagen: '+script);}
try {
 fs.writeFileSync(file,JSON.stringify(channel,null,2));
 run('typescript/bin/tsc',['--noEmit']);run('vite/bin/vite.js',['build']);
 const config={...require('../package.json').build,forceCodeSigning:true,publish:[{provider:'github',owner:channel.owner,repo:channel.repo,releaseType:'release'}]};
 config.win={...config.win,signExecutable:true,verifyUpdateCodeSignature:true,signtoolOptions:{publisherName:channel.publisherName}};
 const configPath=path.join(root,'build/release-config.json');fs.writeFileSync(configPath,JSON.stringify(config,null,2));
 run('electron-builder/cli.js',['--win','nsis','--x64','--config',configPath,'--publish',process.argv.includes('--publish')?'always':'never']);
 run(path.join(root,'scripts/sign-update.cjs'));
} finally {fs.writeFileSync(file,previous);}
