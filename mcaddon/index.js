import archiver from "archiver";
import { createWriteStream } from "fs";
import { readFile } from "fs/promises";

const regolithConfig = JSON.parse((await readFile(`${process.env.ROOT_DIR}/config.json`)).toString());

const output = createWriteStream(`${process.env.ROOT_DIR}/build/${regolithConfig.name}.mcaddon`);
const archive = archiver("zip", {
    zlib: { level: 9 },
});

output.on("close", function () {
    console.log(`Compressed ${archive.pointer()} total bytes.`);
    console.log(`${regolithConfig.name}.mcaddon has been created successfully.`);
});

output.on("end", function () {
    console.log("Data has been drained");
});

archive.on("warning", function (err) {
    if (err.code === "ENOENT") {
        // log warning
    } else {
        // throw error
        throw err;
    }
});

archive.on("error", function (err) {
    throw err;
});

archive.pipe(output);

archive.directory("BP", `${regolithConfig.name}_BP`);
archive.directory("RP", `${regolithConfig.name}_RP`);

archive.finalize();