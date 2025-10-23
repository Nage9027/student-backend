#!/usr/bin/env ts-node
/** @format */

import { execSync } from "child_process";
import path from "path";

const testFiles = [
	"tests/auth.test.ts",
	"tests/admin.test.ts",
	"tests/notification.test.ts",
	"tests/chat.test.ts",
];

console.log("🧪 Running College Management System Tests...\n");

let passedTests = 0;
let failedTests = 0;
const results: Array<{
	file: string;
	status: "PASS" | "FAIL";
	output: string;
}> = [];

for (const testFile of testFiles) {
	console.log(`\n📋 Running ${testFile}...`);
	console.log("─".repeat(50));

	try {
		const output = execSync(`npx jest ${testFile} --verbose --no-coverage`, {
			encoding: "utf8",
			cwd: path.join(__dirname, ".."),
			stdio: "pipe",
		});

		console.log(output);
		results.push({ file: testFile, status: "PASS", output });
		passedTests++;
	} catch (error: any) {
		const output = error.stdout || error.message;
		console.log(output);
		results.push({ file: testFile, status: "FAIL", output });
		failedTests++;
	}
}

console.log("\n" + "=".repeat(60));
console.log("📊 TEST SUMMARY");
console.log("=".repeat(60));

results.forEach((result) => {
	const status = result.status === "PASS" ? "✅" : "❌";
	console.log(`${status} ${result.file}`);
});

console.log("\n📈 STATISTICS:");
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📊 Total: ${passedTests + failedTests}`);

if (failedTests > 0) {
	console.log("\n❌ Some tests failed. Please check the output above.");
	process.exit(1);
} else {
	console.log("\n🎉 All tests passed!");
	process.exit(0);
}
