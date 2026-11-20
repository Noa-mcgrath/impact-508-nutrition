(() => {
    const currentVersion = document.querySelector('meta[name="site-version"]').content;
    if (currentVersion === '__SITE_VERSION__') return;

    const notice = document.getElementById('site-update');
    let latestVersion;
    let dismissedVersion;
    let checking = false;

    async function checkForUpdate() {
        if (checking || document.hidden || !navigator.onLine) return;
        checking = true;
        try {
            const response = await fetch('site-version.json', { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (typeof data.version !== 'string' || !data.version) {
                throw new Error('Invalid site version');
            }
            latestVersion = data.version;
            notice.hidden = latestVersion === currentVersion || latestVersion === dismissedVersion;
        } catch (error) {
            console.warn('Could not check for website updates:', error);
        } finally {
            checking = false;
        }
    }

    document.getElementById('site-update-refresh').addEventListener('click', () => location.reload());
    document.getElementById('site-update-later').addEventListener('click', () => {
        dismissedVersion = latestVersion;
        notice.hidden = true;
    });
    document.addEventListener('visibilitychange', checkForUpdate);
    window.addEventListener('online', checkForUpdate);
    window.setInterval(checkForUpdate, 60000);
    checkForUpdate();
})();
