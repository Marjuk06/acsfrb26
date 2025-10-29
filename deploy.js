const fs = require('fs');
const path = require('path');

function incrementVersion() {
    const htmlFiles = [
        'public/index.html',
        'public/chapters.html',
        'public/lectures.html',
        'public/video-player.html',
        'public/pdf-viewer.html'
    ];

    const version = Date.now();

    htmlFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Update CSS version - handle both numeric and string versions
            content = content.replace(
                /href="style\.css\?v=[^"]*"/g,
                `href="style.css?v=${version}"`
            );

            // Update JS version - handle both numeric and string versions
            content = content.replace(
                /src="script\.js\?v=[^"]*"/g,
                `src="script.js?v=${version}"`
            );

            // If no version exists, add it
            content = content.replace(
                /href="style\.css"/g,
                `href="style.css?v=${version}"`
            );

            content = content.replace(
                /src="script\.js"/g,
                `src="script.js?v=${version}"`
            );

            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${filePath} with version ${version}`);
        }
    });

    // Update service worker cache name
    const swPath = 'public/sw.js';
    if (fs.existsSync(swPath)) {
        let swContent = fs.readFileSync(swPath, 'utf8');
        swContent = swContent.replace(
            /const CACHE_NAME = 'acs-batch26-v[^']*';/g,
            `const CACHE_NAME = 'acs-batch26-v${Math.floor(version / 1000)}';`
        );
        fs.writeFileSync(swPath, swContent, 'utf8');
        console.log(`Updated service worker with new cache version`);
    }

    console.log(`\n🚀 Deployment ready! Version: ${version}`);
    console.log(`📝 Don't forget to run: firebase deploy`);
}

incrementVersion();
