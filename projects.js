/* Project grid + detail dialog.
   Without JavaScript the full project cards remain visible (progressive enhancement). */
(function () {
    var grid = document.querySelector('.project-grid');
    if (!grid || typeof HTMLDialogElement !== 'function') return;

    var projects = Array.prototype.slice.call(grid.querySelectorAll('.project'));
    if (!projects.length) return;

    var dialog = document.createElement('dialog');
    dialog.className = 'project-dialog';
    dialog.innerHTML =
        '<button type="button" class="dialog-close" aria-label="Close">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
        '<path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<div class="dialog-body"></div>';
    document.body.appendChild(dialog);

    var body = dialog.querySelector('.dialog-body');
    var lastTrigger = null;

    grid.classList.add('is-enhanced');

    projects.forEach(function (project) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'project-open';
        button.setAttribute('aria-haspopup', 'dialog');
        button.innerHTML = 'View details <span aria-hidden="true">&rarr;</span>';
        button.addEventListener('click', function () {
            open(project.id, button);
        });
        project.appendChild(button);

        // Title links only work inside the dialog; keep them out of the card's tab order.
        project.querySelectorAll('.project-title a').forEach(function (link) {
            link.setAttribute('tabindex', '-1');
        });

        // The whole card is clickable, except its own links.
        project.addEventListener('click', function (event) {
            if (event.target.closest('a, button')) return;
            open(project.id, button);
        });
    });

    function open(id, trigger) {
        var project = id && document.getElementById(id);
        if (!project || !grid.contains(project)) return;

        var clone = project.cloneNode(true);
        clone.removeAttribute('id');
        var cloneButton = clone.querySelector('.project-open');
        if (cloneButton) cloneButton.remove();
        clone.querySelectorAll('.project-title a').forEach(function (link) {
            link.removeAttribute('tabindex');
        });
        clone.querySelectorAll('img').forEach(function (img) {
            img.removeAttribute('loading');
        });
        body.replaceChildren(clone);

        var title = clone.querySelector('.project-title');
        dialog.setAttribute('aria-label', title ? title.textContent.trim() : 'Project details');

        lastTrigger = trigger || project.querySelector('.project-open');
        if (!dialog.open) dialog.showModal();
        dialog.scrollTop = 0;
        document.documentElement.classList.add('dialog-open');

        if (location.hash !== '#' + id) {
            history.replaceState(null, '', '#' + id);
        }
    }

    dialog.addEventListener('close', function () {
        document.documentElement.classList.remove('dialog-open');
        history.replaceState(null, '', location.pathname + location.search);
        if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    });

    // Click on the backdrop closes the dialog.
    dialog.addEventListener('click', function (event) {
        if (event.target === dialog) dialog.close();
    });

    dialog.querySelector('.dialog-close').addEventListener('click', function () {
        dialog.close();
    });

    // Deep links such as professional-projects.html#ecoswir-project open the matching project.
    function openFromHash() {
        var id = decodeURIComponent(location.hash.slice(1));
        if (id) open(id);
    }

    window.addEventListener('hashchange', openFromHash);
    openFromHash();
})();
