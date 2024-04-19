import dts from "bun-plugin-dts";

const args = process.argv.slice(2);

const release = args.includes("--release");

console.info(`Building for ${release ? "release" : "development"}...`);

const build = await Bun.build({
	entrypoints: ["src/index.ts"],
	minify: release,
	naming: "[name].[ext]",
	outdir: "./dist",
	root: ".",
	target: "bun",
	plugins: [
		dts({
			output: {
				noBanner: true,
			},
		}),
	],
});

if (!build.success) {
	console.info(build);
}
