const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const navigationScript = source.match(/<script>([\s\S]*?)<\/script>/)[1];

function loadPage(hash, search = '') {
    let onLoad;
    const scrollCalls = [];
    const history = {
        scrollRestoration: 'auto',
        replaceState() { throw new Error('The incoming URL must not be changed'); }
    };
    const window = {
        location: { hash, search, pathname: '/index.html' },
        addEventListener(event, callback) {
            if (event === 'load') onLoad = callback;
        },
        scrollTo(...args) { scrollCalls.push(args); }
    };
    vm.runInNewContext(navigationScript, { window, history });
    onLoad();
    return scrollCalls;
}

test('direct section and pickup links retain their destination on load', () => {
    assert.deepEqual(loadPage('#feedback-title'), []);
    assert.deepEqual(loadPage('#order-online', '?order-type=tea&order-drink=example'), []);
});

test('a page without a section link still starts at the top', () => {
    assert.deepEqual(loadPage(''), [[0, 0]]);
});
