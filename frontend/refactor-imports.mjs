import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    const replaceGeneric = (match, before, quote, relPath) => {
        const absolutePath = path.resolve(path.dirname(file), relPath);
        if (absolutePath.startsWith(srcDir)) {
            let relativeToSrc = path.relative(srcDir, absolutePath).replace(/\\/g, '/');
            return `${before}${quote}@/${relativeToSrc}${quote}`;
        }
        return match;
    };

    content = content.replace(/((?:import|export)[^'"]*?from\s+)(['"])(\.[^'"]+)\2/g, replaceGeneric);
    content = content.replace(/(import\s+)(['"])(\.[^'"]+)\2/g, replaceGeneric);

    // If it imports the jsx directly, fix it (just in case they were importing .jsx)
    content = content.replace(/@\/context\/AuthContext\.jsx/g, '@/context/AuthContext');

    if (content !== fs.readFileSync(file, 'utf8')) {
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log("Refactoring complete");
