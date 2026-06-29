const fs = require("fs");
const path = require("path");

function fixGradleVersion(config) {
  return {
    ...config,
    // Patches the gradle wrapper after prebuild generates it
    // React Native 0.76 is incompatible with Gradle 9.x (kotlin metadata version mismatch)
  };
}

// Also run as a standalone post-prebuld hook
const wrapperPath = path.join(
  __dirname,
  "..",
  "android",
  "gradle",
  "wrapper",
  "gradle-wrapper.properties"
);

if (fs.existsSync(path.dirname(wrapperPath))) {
  const content = fs.readFileSync(wrapperPath, "utf-8");
  const patched = content.replace(
    /gradle-\d+\.\d+(?:\.\d+)?-bin\.zip/g,
    "gradle-8.10.2-bin.zip"
  );
  fs.writeFileSync(wrapperPath, patched, "utf-8");
}

module.exports = fixGradleVersion;
