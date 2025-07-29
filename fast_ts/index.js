import { build } from "esbuild";
import { cp, rm, readFile } from "fs/promises";

await cp("BP/scripts", "BP/tmp_scripts", { recursive: true });

await rm("BP/scripts", {
    recursive: true,
    force: true
});

const bpManifest = (await readFile("BP/manifest.json")).toString();
const bpDependencies = JSON.parse(bpManifest).dependencies;

const defaultConfig = {
    bundle: false
};

const overwrittenConfig = {
    outdir: "BP/scripts",
    entryPoints: [
        "BP/tmp_scripts/**/*"
    ],
    format: "esm",
    target: "es6"
};

const regolithConfig = process.argv[2] ? JSON.parse(process.argv[2]) : {};

let config = Object.assign(defaultConfig, regolithConfig, overwrittenConfig);

if (config.merge) {
    config.entryPoints = [
        "BP/tmp_scripts/index.ts"
    ];
    config.external = (() => {
        const modules = [];
        for (const dep of bpDependencies) {
            if (!dep.module_name?.startsWith('@minecraft/')) continue;
            modules.push(dep.module_name);
        }
        return modules;
    })();
    config.bundle = true;
    delete config["merge"];
}

await build(config);

await rm("BP/tmp_scripts", {
    recursive: true,
    force: true
});