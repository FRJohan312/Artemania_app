const fs = require('fs');
const path = require('path');

function fixPadding(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');

    // Evitar duplicados si ya tiene paddingTop: insets.top
    if (content.includes('paddingTop: insets.top')) {
        return;
    }

    // Caso 1: Tiene un header estilo inline
    if (content.includes('style={styles.header}')) {
        content = content.replace(/style=\{styles\.header\b\}/g, 'style={[styles.header, { paddingTop: insets.top }]}');
    } 
    // Caso 2: Tiene un header que ya es un array de estilos
    else if (content.match(/style=\{\[styles\.header\b/)) {
        content = content.replace(/style=\{\[styles\.header\b/g, 'style={[styles.header, { paddingTop: insets.top }');
    }
    // Caso 3: Contenedor principal styles.container
    else if (content.match(/style=\{\[styles\.container\b/)) {
        content = content.replace(/(style=\{\[styles\.container\b,?\s*\{)/g, '$1 paddingTop: insets.top, ');
    }

    fs.writeFileSync(filepath, content, 'utf8');
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.tsx')) {
            console.log(`Fixing padding in ${file}...`);
            fixPadding(fullPath);
        }
    }
}

const screensDir = path.join(__dirname, 'src', 'screens');
if (fs.existsSync(screensDir)) {
    walkDir(screensDir);
} else {
    console.log("No se encontró el directorio src/screens");
}
