import { createCanvas, loadImage } from "canvas";
import { createWriteStream } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";

let config = {
    /**
     * @type {{
     *  path: string;
     *  rotations: number[];
     * }[]}
     */
    files: []
};

try {
    const parsedFile = await readFile("data/image_rotate/config.json");

    config = JSON.parse(parsedFile.toString('utf-8'));
} catch (e) {
    console.error(e);
    await mkdir("data/image_rotate", { recursive: true });
    await writeFile("data/image_rotate/config.json", JSON.stringify(config));
}

for (const file of config.files) {
    try {
        const loadedImage = await loadImage(file.path);
        for (const angle of file.rotations) {
            const canvas = createCanvas(loadedImage.width, loadedImage.height);
            const ctx = canvas.getContext("2d");
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((angle * Math.PI) / 180);
            ctx.drawImage(loadedImage, - (canvas.width / 2), - (canvas.height / 2));
            ctx.restore();
            const newFile = file.path.replace(".png", `_${angle}.png`);
            const out = createWriteStream(newFile);
            console.log(`Writing file ${newFile}`);
            canvas.createPNGStream().pipe(out);
        }
        continue;
    } catch (e) {
        continue;
    }
}