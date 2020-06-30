// eslint-disable-next-line node/no-unsupported-features/node-builtins
const assert = require('assert').strict;
const fs = require('fs');

const glob = require('glob');

const packageJSON = require('../package.json');

// Validation to assert the output of the build.

validateStandardBuild();
validateEsNextBuild();
validateSassPublicApi();
validateAncillaryOutput();
validateVersionReplacement();

function validateStandardBuild() {
  // Standard build
  assert.ok(fs.existsSync('./dist/index.js'));
  assert.ok(fs.existsSync('./dist/index.mjs'));
  assert.ok(fs.existsSync('./dist/styles.css'));

  // Standard build css contains namespaced classes
  const cssContent = fs.readFileSync('./dist/styles.css', 'utf-8');
  assert.ok(cssContent.includes('.Polaris-Avatar{'));
  assert.ok(
    cssContent.includes('.Polaris-ResourceList-BulkActions__BulkActionButton{'),
  );
}

function validateEsNextBuild() {
  // ESnext build
  assert.ok(fs.existsSync('./dist/esnext/index.ts.esnext'));
  assert.ok(fs.existsSync('./dist/esnext/components/Avatar/Avatar.tsx.esnext'));
  assert.ok(fs.existsSync('./dist/esnext/components/Avatar/Avatar.css'));

  // ESnext build css contains namespaced classes, and
  const cssContent = fs.readFileSync(
    './dist/esnext/components/Avatar/Avatar.css',
    'utf-8',
  );
  assert.ok(cssContent.includes('.Polaris-Avatar{'));

  const jsContent = fs.readFileSync(
    './dist/esnext/components/Avatar/Avatar.scss.esnext',
    'utf-8',
  );

  assert.ok(jsContent.includes("import './Avatar.css';"));
  assert.ok(jsContent.includes('Polaris-Avatar'));
  assert.ok(jsContent.includes('Polaris-Avatar--hidden'));

  assert.ok(
    fs
      .readFileSync(
        './dist/esnext/components/Collapsible/Collapsible.tsx.esnext',
        'utf-8',
      )
      .includes('class Collapsible'),
  );
}

function validateSassPublicApi() {
  assert.ok(fs.existsSync('./dist/styles/_public-api.scss'));
  assert.ok(fs.existsSync('./dist/styles/_public-api.scss'));
  assert.ok(fs.existsSync('./dist/styles/foundation/_spacing.scss'));

  // does not contain any :global definitions
  const files = glob.sync(`./dist/styles/**/*.scss`);
  assert.notStrictEqual(files.length, 0);

  const filesWithGlobalDefinitions = files.filter((file) => {
    return fs.readFileSync(file, 'utf-8').includes(':global');
  });

  assert.deepStrictEqual(filesWithGlobalDefinitions, []);
}

function validateAncillaryOutput() {
  assert.ok(fs.existsSync('./dist/types/latest/src/index.d.ts'));
  // Downleveled for consumers on older TypeScript versions
  assert.ok(fs.existsSync('./dist/types/3.4/src/index.d.ts'));
}

function validateVersionReplacement() {
  const files = glob.sync('./dist/**/*.{js,mjs,esnext,css,scss}');

  assert.notStrictEqual(files.length, 0);

  const fileBuckets = {
    includesTemplateString: [],
    includesVersion: [],
  };

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');

    if (content.includes('POLARIS_VERSION')) {
      fileBuckets.includesTemplateString.push(file);
    }

    if (content.includes(packageJSON.version)) {
      fileBuckets.includesVersion.push(file);
    }
  });

  assert.strictEqual(fileBuckets.includesTemplateString.length, 0);

  assert.deepStrictEqual(fileBuckets.includesVersion, [
    './dist/esnext/components/AppProvider/AppProvider.css',
    './dist/esnext/configure.ts.esnext',
    './dist/index.js',
    './dist/index.mjs',
    './dist/styles.css',
  ]);
}