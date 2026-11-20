const fs = require('node:fs');
const path = require('node:path');

exports.onPostBuild = ({ constants, utils }) => {
    try {
        const version = process.env.DEPLOY_ID;
        if (!version || !/^[a-zA-Z0-9-]+$/.test(version)) {
            throw new Error('A valid Netlify DEPLOY_ID is required.');
        }

        const indexPath = path.join(constants.PUBLISH_DIR, 'index.html');
        const html = fs.readFileSync(indexPath, 'utf8');
        const placeholder = '<meta name="site-version" content="__SITE_VERSION__">';
        if (html.split(placeholder).length !== 2) {
            throw new Error('Expected exactly one site-version placeholder in index.html.');
        }

        fs.writeFileSync(indexPath, html.replace(placeholder, `<meta name="site-version" content="${version}">`));
        fs.writeFileSync(path.join(constants.PUBLISH_DIR, 'site-version.json'), JSON.stringify({ version }));
    } catch (error) {
        utils.build.failBuild('Could not prepare website update detection.', { error });
    }
};
