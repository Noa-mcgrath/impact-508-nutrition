const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { onPostBuild } = require('../plugins/site-version');

test('Netlify deployment version is embedded in the page and manifest', t => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'impact-site-version-'));
    const originalVersion = process.env.DEPLOY_ID;
    t.after(() => {
        if (originalVersion === undefined) delete process.env.DEPLOY_ID;
        else process.env.DEPLOY_ID = originalVersion;
        for (const file of fs.readdirSync(directory)) fs.unlinkSync(path.join(directory, file));
        fs.rmdirSync(directory);
    });

    const indexPath = path.join(directory, 'index.html');
    const source = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    const context = {
        constants: { PUBLISH_DIR: directory },
        utils: { build: { failBuild: (message, { error }) => { throw new Error(message, { cause: error }); } } }
    };

    fs.writeFileSync(indexPath, source);
    process.env.DEPLOY_ID = 'deploy-123';
    onPostBuild(context);
    assert.match(fs.readFileSync(indexPath, 'utf8'), /<meta name="site-version" content="deploy-123">/);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(directory, 'site-version.json'), 'utf8')), { version: 'deploy-123' });

    delete process.env.DEPLOY_ID;
    assert.throws(() => onPostBuild(context), /Could not prepare website update detection/);

    process.env.DEPLOY_ID = 'deploy-456';
    assert.throws(() => onPostBuild(context), /Could not prepare website update detection/);
});
