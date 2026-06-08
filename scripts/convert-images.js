import sharp from "sharp";
import { glob } from "glob";
import { dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

const targets = [
	"public/assets/*.{png,jpg,jpeg}",
	"public/assets/**/*.{png,jpg,jpeg}",
	"public/pio/static/**/*.{png,jpg,jpeg}",
	"public/sakura.{png,jpg,jpeg}",
	"src/assets/**/*.{png,jpg,jpeg}",
	"posts/content/images/**/*.{png,jpg,jpeg}",
	"docs/image/**/*.{png,jpg,jpeg}",
	"README.{png,jpg,jpeg}",
	"logo.{png,jpg,jpeg}",
];

const quality = 85;

async function optimizeOriginal(inputPath) {
	const ext = extname(inputPath).toLowerCase();
	const tempPath = `${inputPath}.tmp-${process.pid}${ext}`;
	const inputSize = fs.statSync(inputPath).size;

	try {
		const image = sharp(inputPath);

		if (ext === ".png") {
			await image
				.png({ compressionLevel: 9, adaptiveFiltering: true })
				.toFile(tempPath);
		} else if (ext === ".jpg" || ext === ".jpeg") {
			await image.jpeg({ quality, mozjpeg: true }).toFile(tempPath);
		} else {
			return inputSize;
		}

		const outputSize = fs.statSync(tempPath).size;

		if (outputSize < inputSize) {
			fs.renameSync(tempPath, inputPath);
			const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);
			console.log(
				`✅ Optimized ${path.relative(rootDir, inputPath)}: ${(inputSize / 1024).toFixed(1)}KB → ${(outputSize / 1024).toFixed(1)}KB (${savings}% saved)`,
			);
			return outputSize;
		}

		fs.unlinkSync(tempPath);
		console.log(`⏭️  Kept original: ${path.relative(rootDir, inputPath)}`);
		return inputSize;
	} catch (err) {
		if (fs.existsSync(tempPath)) {
			fs.unlinkSync(tempPath);
		}
		console.error(`❌ Optimize failed: ${inputPath}`, err.message);
		return inputSize;
	}
}

async function convertToWebP(inputPath, quality = 85) {
	const outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, ".webp");
	const tempPath = `${outputPath}.tmp-${process.pid}.webp`;

	if (fs.existsSync(outputPath)) {
		const inputStat = fs.statSync(inputPath);
		const outputStat = fs.statSync(outputPath);
		if (outputStat.mtime > inputStat.mtime && outputStat.size < inputStat.size) {
			console.log(
				`⏭️  Skipped (exists): ${path.relative(rootDir, outputPath)}`,
			);
			return;
		}
	}

	try {
		await sharp(inputPath).webp({ quality, effort: 6 }).toFile(tempPath);

		const inputSize = fs.statSync(inputPath).size;
		const outputSize = fs.statSync(tempPath).size;

		if (outputSize >= inputSize) {
			fs.unlinkSync(tempPath);
			console.log(
				`⏭️  Skipped WebP (not smaller): ${path.relative(rootDir, inputPath)}`,
			);
			return;
		}

		fs.renameSync(tempPath, outputPath);
		const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

		console.log(
			`✅ ${path.relative(rootDir, inputPath)} → ${path.relative(rootDir, outputPath)}`,
		);
		console.log(
			`   ${(inputSize / 1024).toFixed(1)}KB → ${(outputSize / 1024).toFixed(1)}KB (${savings}% saved)`,
		);
	} catch (err) {
		if (fs.existsSync(tempPath)) {
			fs.unlinkSync(tempPath);
		}
		console.error(`❌ Failed: ${inputPath}`, err.message);
	}
}

async function main() {
	const files = await glob(targets, { cwd: rootDir, absolute: true, nodir: true });

	console.log(`Found ${files.length} images to optimize/convert\n`);

	for (const file of files) {
		await optimizeOriginal(file);
		await convertToWebP(file);
	}

	console.log("\n✓ Done!");
}

main().catch(console.error);
