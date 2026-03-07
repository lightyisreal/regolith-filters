import { build, BuildOptions } from "rolldown";
import { cp, readFile, rm } from "node:fs/promises";
import process from "node:process";
import { join } from "node:path";

await cp("BP/scripts", "BP/tmp_scripts", { recursive: true });

await rm("BP/scripts", {
	recursive: true,
	force: true,
});

const bpManifest = JSON.parse((await readFile("BP/manifest.json")).toString());
const bpDependencies = bpManifest.dependencies;
let bpScriptEntryPoint = "index.ts";

for (const module of bpManifest.modules) {
	if (module.type === "script") {
		bpScriptEntryPoint = module.entry.replace("scripts/", "");
		if (module.entry.endsWith(".ts")) {
			module.entry = module.entry.replace(".ts", ".js");
		}
		break;
	}
}

const overwrittenConfig: BuildOptions = {
	input: join("BP/tmp_scripts", bpScriptEntryPoint),
	transform: {
		target: "es2020",
	},
	output: {
		dir: "BP/scripts",
		format: "esm",
	},
    external: (() => {
		const modules = [];
		for (const dep of bpDependencies) {
			if (!dep.module_name?.startsWith("@minecraft/")) continue;
			modules.push(dep.module_name);
		}
		return modules;
	})()
};

const regolithConfig = process.argv[2] ? JSON.parse(process.argv[2]) : {};

// deno-lint-ignore no-explicit-any
function deepMerge(target: any, source: any): any {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  return { ...target, ...source };
}

// Merge the two configs, with the regolith config taking precedence over the overwritten config
const config: BuildOptions = deepMerge(overwrittenConfig, regolithConfig);

console.log("Building with config:", JSON.stringify(config));

await build(config);

await rm("BP/tmp_scripts", {
	recursive: true,
	force: true,
});
