import jso from "javascript-obfuscator";
const { obfuscateMultiple } = jso;
import fs from 'fs';

const scriptsDirContents = fs.readdirSync('BP/scripts', { withFileTypes: true, recursive: true });
let fileMap = {};
for (const file of scriptsDirContents) {
    if (!file.isFile()) continue;
    const fileContents = fs.readFileSync(`${file.parentPath}/${file.name}`).toString('utf-8');
    fileMap[`${file.parentPath}/${file.name}`] = fileContents;
}
fileMap = obfuscateMultiple(fileMap);
for (const file in fileMap) {
    fs.writeFileSync(`${file}`, Buffer.from(fileMap[file].toString()));
}