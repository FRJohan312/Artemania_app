const fs = require('fs');
const path = require('path');

function transformFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');

    // 1. Asegurar import de safe area
    if (!content.includes('react-native-safe-area-context')) {
        const importLine = "import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';\n";
        content = importLine + content;
    } else if (!content.includes('useSafeAreaInsets')) {
        content = content.replace(/'react-native-safe-area-context';/g, "{ SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';");
        content = content.replace(/"react-native-safe-area-context";/g, '{ SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";');
    }

    // 2. Asegurar el hook insets
    if (!content.includes('const insets = useSafeAreaInsets();')) {
        const pattern = /(export default function \w+\(.*?\)\s*\{|const \w+ = \(.*?\)\s*=>\s*\{)/;
        const match = content.match(pattern);
        if (match) {
            const endPos = match.index + match[0].length;
            content = content.slice(0, endPos) + "\n  const insets = useSafeAreaInsets();" + content.slice(endPos);
        }
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
            console.log(`Transforming ${file}...`);
            transformFile(fullPath);
        }
    }
}

const screensDir = path.join(__dirname, 'src', 'screens');
if (fs.existsSync(screensDir)) {
    walkDir(screensDir);
} else {
    console.log("No se encontró el directorio src/screens");
}
