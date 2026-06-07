#!/usr/bin/env node

import { execFileSync, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "posts/content");
const contentPathInRoot = "posts/content";

const commitMessage = process.argv.slice(2).join(" ").trim() || "Update content";

function run(command, cwd = rootDir) {
	console.log(`\n$ ${command}`);
	execSync(command, { cwd, stdio: "inherit" });
}

function runGit(args, cwd = rootDir) {
	console.log(`\n$ git ${args.join(" ")}`);
	execFileSync("git", args, { cwd, stdio: "inherit" });
}

function output(command, cwd = rootDir) {
	return execSync(command, { cwd, encoding: "utf8" }).trim();
}

function hasChanges(cwd) {
	return output("git status --porcelain", cwd).length > 0;
}

function hasStagedChanges(cwd) {
	try {
		execSync("git diff --cached --quiet", { cwd, stdio: "ignore" });
		return false;
	} catch {
		return true;
	}
}

function getUpstream(cwd) {
	try {
		return output("git rev-parse --abbrev-ref --symbolic-full-name @{u}", cwd);
	} catch {
		return "";
	}
}

function pushCurrentBranch(cwd, fallbackRemote = "origin", fallbackBranch = "main") {
	const upstream = getUpstream(cwd);
	if (upstream.includes("/")) {
		const slashIndex = upstream.indexOf("/");
		const remote = upstream.slice(0, slashIndex);
		const branch = upstream.slice(slashIndex + 1);
		runGit(["push", remote, `HEAD:${branch}`], cwd);
		return;
	}

	runGit(["push", "-u", fallbackRemote, `HEAD:${fallbackBranch}`], cwd);
}

function ensureContentRepo() {
	if (!fs.existsSync(contentDir)) {
		console.error(`内容仓库不存在：${contentDir}`);
		process.exit(1);
	}

	try {
		output("git rev-parse --is-inside-work-tree", contentDir);
	} catch {
		console.error(`不是 Git 仓库：${contentDir}`);
		process.exit(1);
	}
}

function main() {
	ensureContentRepo();

	console.log("准备发布内容仓库...");

	if (hasChanges(contentDir)) {
		run("git add -A", contentDir);
		runGit(["commit", "-m", commitMessage], contentDir);
	} else {
		console.log("内容仓库没有需要提交的改动。");
	}

	pushCurrentBranch(contentDir);

	console.log("\n正在验证主项目构建...");
	run("pnpm build");

	console.log("\n准备更新主仓库 submodule 指针...");
	run(`git add ${contentPathInRoot}`);

	if (hasStagedChanges(rootDir)) {
		runGit(["commit", "-m", `Update content: ${commitMessage}`]);
	} else {
		console.log("主仓库 submodule 指针没有变化，不需要提交。");
	}

	pushCurrentBranch(rootDir, "sharkymew", "main");

	console.log("\n内容发布完成。");
}

main();
