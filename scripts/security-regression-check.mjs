import assert from "node:assert/strict";
import fs from "node:fs";

import { encryptContent } from "../src/utils/crypto-utils.ts";
import { escapeHtml, safeJsonScriptContent } from "../src/utils/security.ts";

const dangerousJson = safeJsonScriptContent({
	title: '</script><script>alert("xss")</script>',
	amp: "&",
	lineSeparator: "\u2028",
});

assert.equal(
	dangerousJson.toLowerCase().includes("</script"),
	false,
	"JSON-LD serializer must not emit literal closing script tags",
);
assert.match(dangerousJson, /\\u003c\/script\\u003e/);
assert.match(dangerousJson, /\\u0026/);
assert.match(dangerousJson, /\\u2028/);

assert.equal(
	escapeHtml('<img src=x onerror=alert("xss")>'),
	"&lt;img src=x onerror=alert(&quot;xss&quot;)&gt;",
);

const encryptedA = Buffer.from(
	encryptContent("<p>secret</p>", "correct horse battery staple", "post"),
	"base64",
);
const encryptedB = Buffer.from(
	encryptContent("<p>secret</p>", "correct horse battery staple", "post"),
	"base64",
);
assert.notDeepEqual(
	encryptedA.subarray(0, 16),
	encryptedB.subarray(0, 16),
	"encrypted content must use a fresh salt",
);
assert.notDeepEqual(
	encryptedA.subarray(16, 28),
	encryptedB.subarray(16, 28),
	"encrypted content must use a fresh AES-GCM IV",
);

const syncContent = fs.readFileSync("scripts/sync-content.js", "utf8");
assert.equal(
	syncContent.includes("execSync(`git clone"),
	false,
	"sync-content must not build git clone through a shell string",
);
assert.match(syncContent, /redactRepositoryUrl\(CONTENT_REPO_URL\)/);
assert.match(syncContent, /isPathInsideRoot\(CONTENT_DIR\)/);

const passwordProtection = fs.readFileSync(
	"src/components/features/auth/PasswordProtection.astro",
	"utf8",
);
assert.equal(
	passwordProtection.includes("sessionStorage.setItem"),
	false,
	"password unlock flow must not store plaintext passwords",
);
assert.equal(
	passwordProtection.includes("sessionStorage.getItem"),
	false,
	"password unlock flow must not auto-load plaintext passwords",
);

const contentConfig = fs.readFileSync("src/content.config.ts", "utf8");
assert.match(contentConfig, /password requires encrypted: true/);
assert.match(contentConfig, /encrypted posts require password/);

const analyticsScripts = fs.readFileSync(
	"src/layouts/partials/AnalyticsScripts.astro",
	"utf8",
);
assert.match(analyticsScripts, /const gtmEnable = !!gtmId/);
assert.equal(
	analyticsScripts.includes('gtmId = "GTM-KRX3XGVH"'),
	false,
	"GTM must not have a default enabled container ID",
);

const headers = fs.readFileSync("public/_headers", "utf8");
assert.match(headers, /X-Content-Type-Options: nosniff/);
assert.match(headers, /Referrer-Policy: strict-origin-when-cross-origin/);
assert.match(headers, /X-Frame-Options: DENY/);
