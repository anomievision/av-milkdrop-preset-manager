import { join } from "node:path";

// Command: Analyze
const analyzeSettings = {
	maxLongNameLength: 200,
	defaultInput: join("output", "extracted"),
	defaultOutput: join("output", "analyzed"),
};

// Command: Download
const downloadSettings = {
	collections: [
		{
			name: "cream-of-the-crop",
			repository:
				"https://github.com/projectM-visualizer/presets-cream-of-the-crop.git",
			branch: "master",
		},
		{
			name: "en-d",
			repository: "https://github.com/projectM-visualizer/presets-en-d.git",
			branch: "master",
		},
		{
			name: "milkdrop-original",
			repository:
				"https://github.com/projectM-visualizer/presets-milkdrop-original.git",
			branch: "master",
		},
		{
			name: "milkdrop-texture-pack",
			repository:
				"https://github.com/projectM-visualizer/presets-milkdrop-texture-pack.git",
			branch: "master",
		},
		{
			name: "projectm-classic",
			repository:
				"https://github.com/projectM-visualizer/presets-projectm-classic.git",
			branch: "master",
		},
	],
	defaultCollections: ["milkdrop-original"],
	defaultOutput: join("output", "downloads"),
};

// Command: Extract
const extractSettings = {
	defaultInput: join("output", "downloads"),
	defaultOutput: join("output", "extracted"),
};

// Command: Normalize
const normalizeSettings = {
	defaultInput: join("output", "analyzed"),
	defaultOutput: join("output", "normalized"),
	defaultDirectoryCasing: "lower",
	defaultDirectoryDivider: "-",
	defaultAuthorCasing: "lower",
	defaultAuthorDivider: "-",
	defaultAuthorSeparator: "+",
	defaultCollectionCasing: "lower",
	defaultCollectionDivider: "-",
	defaultCollectionSeparator: "+",
	defaultTagCasing: "lower",
	defaultTagDivider: "-",
	defaultTagSeparator: "+",
	defaultTitleCasing: "lower",
	defaultTitleDivider: "-",
	defaultSplitter: "_",
	defaultMetaOrder: "authors,title",
};

export const settings = {
	analyzeSettings,
	downloadSettings,
	extractSettings,
	normalizeSettings,
};
