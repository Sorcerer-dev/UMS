const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.jsx')) {
                arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles('p:/UMS/frontend/src');

const replacements = [
    // Backgrounds
    { match: /(?<!dark:)bg-white/g, replacement: 'bg-white dark:bg-slate-800' },
    { match: /(?<!dark:)bg-slate-50(?!0)/g, replacement: 'bg-slate-50 dark:bg-slate-900' },
    { match: /(?<!dark:)bg-slate-100/g, replacement: 'bg-slate-100 dark:bg-slate-800/50' },
    { match: /(?<!dark:)bg-slate-200/g, replacement: 'bg-slate-200 dark:bg-slate-700' },
    // Hover backgrounds
    { match: /(?<!dark:)hover:bg-slate-50(?!0)/g, replacement: 'hover:bg-slate-50 dark:hover:bg-slate-700' },
    { match: /(?<!dark:)hover:bg-slate-100/g, replacement: 'hover:bg-slate-100 dark:hover:bg-slate-700' },
    { match: /(?<!dark:)hover:bg-slate-200/g, replacement: 'hover:bg-slate-200 dark:hover:bg-slate-600' },
    // Text colors
    { match: /(?<!dark:)text-slate-900/g, replacement: 'text-slate-900 dark:text-white' },
    { match: /(?<!dark:)text-slate-800/g, replacement: 'text-slate-800 dark:text-slate-200' },
    { match: /(?<!dark:)text-slate-700/g, replacement: 'text-slate-700 dark:text-slate-300' },
    { match: /(?<!dark:)text-slate-600/g, replacement: 'text-slate-600 dark:text-slate-400' },
    { match: /(?<!dark:)text-slate-500/g, replacement: 'text-slate-500 dark:text-slate-400' },
    // Borders
    { match: /(?<!dark:)border-slate-100/g, replacement: 'border-slate-100 dark:border-slate-700' },
    { match: /(?<!dark:)border-slate-200/g, replacement: 'border-slate-200 dark:border-slate-700' },
    { match: /(?<!dark:)border-slate-300/g, replacement: 'border-slate-300 dark:border-slate-600' },
    // Rings
    { match: /(?<!dark:)ring-slate-200/g, replacement: 'ring-slate-200 dark:ring-slate-700' },
    // Divide
    { match: /(?<!dark:)divide-slate-200/g, replacement: 'divide-slate-200 dark:divide-slate-700' },
    { match: /(?<!dark:)divide-slate-100/g, replacement: 'divide-slate-100 dark:divide-slate-700/50' },
];

let changedFiles = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    for (const rule of replacements) {
        content = content.replace(rule.match, rule.replacement);
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
        console.log(`Updated ${file}`);
    }
}

console.log(`Done. Updated ${changedFiles} files.`);
