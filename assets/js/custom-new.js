document.addEventListener("DOMContentLoaded", function() {
    // base site url (some pages don't include #base_url input)
    var baseRaw = $("#base_url").val() || '';
    var t = baseRaw.replace(/\/$/, ''); // remove trailing slash if any

    // compute paths that work both when `t` is empty (local dev) or is an absolute base URL
    var gamesIndexUrl = t ? t + '/assets/data/games.json' : '/assets/data/games.json';
    var liveSearchUrl = t ? t + '/live-search' : '/live-search';
    var searchPagePrefix = t ? t : '';

    // load local games index for client-side search (fallback if /live-search is not available)
    var localGames = [];
    fetch(gamesIndexUrl).then(function(r) {
        if (r.ok) return r.json();
        throw new Error('no local index');
    }).then(function(json) {
        localGames = json;
    }).catch(function() {
        localGames = [];
    });

    $("#search").on("keyup", function() {
        var e = $.trim($(this).val());
        console.debug('search.keyup ->', e);

        // track last query and allow aborting prior AJAX to avoid race conditions
        if (typeof window._ltg_search_state === 'undefined') window._ltg_search_state = {};
        window._ltg_search_state.lastQuery = e;

        // Build a local result HTML (in case server search isn't reachable)
        function buildLocalResults(term) {
            if (!term) return '<p class="text-muted">Type to search games</p>';
            var q = term.toLowerCase();
            var results = localGames.filter(function(g) {
                return g.title.toLowerCase().indexOf(q) !== -1 || g.slug.indexOf(q) !== -1;
            }).slice(0, 12);
            if (results.length === 0) return '<p class="text-muted">No results found</p>';
            var html = '<div class="search-results-list">';
            results.forEach(function(g) {
                var img = '<img src="' + g.img + '" alt="' + g.title + '" width="48" height="48" onerror="this.src=\'/img/faf-logo.png\'">';
                html += '<div class="search-item d-flex align-items-center justify-content-between" style="padding:8px;border-bottom:1px solid rgba(255, 255, 255, 0.29);">';
                html += '<div class="d-flex align-items-center">' + img + '<div style="margin-left:10px"><a href="' + g.url + '" class="ltg-a-link" style="color:inherit;font-weight:600">' + g.title + '</a></div></div>';
                html += '<div><a class="btn btn-sm btn-warning" href="' + g.url + '">PLAY</a></div>';
                html += '</div>';
            });
            html += '</div>';
            return html;
        }

        // optimistic local render first for snappy UX
    // Link to a dedicated search results page. Use query param for maximum compatibility
    var searchHref = e ? (searchPagePrefix ? searchPagePrefix + "/search/?q=" + encodeURIComponent(e) : "/search/?q=" + encodeURIComponent(e)) : "javascript:void(0);";
        $("#search-result-btn").attr("href", searchHref);
        var localHtml = buildLocalResults(e);
        $(".search-list").html(localHtml);
        // remember last good local HTML so we can restore if something overwrites it
        window._ltg_search_state = window._ltg_search_state || {};
        window._ltg_search_state.lastLocalHtml = localHtml;

        // Short-lived watchdog: if something (service worker/other script) overwrites
        // the local HTML within the next ~2s, restore it. This helps stop the brief
        // "shows then hides" symptom while we gather more diagnostics.
        (function watchAndRestore() {
            try {
                var attempts = 0;
                var maxAttempts = 10; // ~2 seconds at 200ms interval
                var iv = setInterval(function() {
                    attempts++;
                    var target = document.querySelector('.search-list');
                    if (!target) return;
                    var htmlNow = (target.innerHTML || '').trim();
                    var looksLikeResults = htmlNow.indexOf('search-item') !== -1 || htmlNow.indexOf('search-results-list') !== -1 || htmlNow.indexOf('/game/') !== -1 || htmlNow.indexOf('ltg-a-link') !== -1 || htmlNow.indexOf('list-grd') !== -1;
                    var looksLikeOffline = htmlNow.indexOf('offline.html') !== -1 || htmlNow.indexOf('No Content') !== -1 || htmlNow.length < 40;
                    if (!looksLikeResults && (looksLikeOffline || htmlNow === '')) {
                        console.debug('watchdog: detected overwritten search-list (attempt ' + attempts + '), restoring local results');
                        target.innerHTML = window._ltg_search_state.lastLocalHtml || '';
                    }
                    if (looksLikeResults || attempts >= maxAttempts) {
                        clearInterval(iv);
                    }
                }, 200);
            } catch (ex) {
                // swallow any errors here; this feature is purely defensive
                console.debug('watchdog: error', ex && ex.toString());
            }
        })();

        // install a MutationObserver to guard against other scripts (or service worker) replacing results
        if (!window._ltg_search_state.observerInstalled) {
            try {
                var target = document.querySelector('.search-list');
                if (target && window.MutationObserver) {
                    var mo = new MutationObserver(function(mutations) {
                        mutations.forEach(function(m) {
                            var html = target.innerHTML || '';
                            // if replaced by offline page or tiny/no-content, restore local
                            var looksLikeResults = html.indexOf('search-item') !== -1 || html.indexOf('search-results-list') !== -1 || html.indexOf('/game/') !== -1 || html.indexOf('ltg-a-link') !== -1 || html.indexOf('list-grd') !== -1;
                            if (!looksLikeResults) {
                                // small heuristic to avoid fighting legitimate server responses when enabled
                                if ((html.indexOf('offline.html') !== -1) || (html.indexOf('No Content') !== -1) || html.length < 40) {
                                    console.debug('MutationObserver: restoring local search HTML');
                                    target.innerHTML = window._ltg_search_state.lastLocalHtml || '';
                                }
                            } else {
                                // server results look valid — update lastLocalHtml to new content
                                window._ltg_search_state.lastLocalHtml = html;
                            }
                        });
                    });
                    mo.observe(target, { childList: true, subtree: true });
                    window._ltg_search_state.observerInstalled = true;
                }
            } catch (oooo) {
                // ignore
            }
        }

        // still attempt server live-search if available; on success prefer server HTML
        try {
            // abort previous ajax if exists
            if (window._ltg_search_state.currentAjax && window._ltg_search_state.currentAjax.readyState !== 4) {
                try { window._ltg_search_state.currentAjax.abort(); } catch (e) {}
            }
        } catch (xx) {}

        var capturedQuery = e;
        // Toggle for debugging / temporary fix: when true, never call server and keep local results only
        var FORCE_LOCAL_ONLY = true; // set to false to re-enable server live-search

        if (FORCE_LOCAL_ONLY) {
            console.debug('FORCE_LOCAL_ONLY enabled — skipping live-search for', capturedQuery);
            return;
        }

        window._ltg_search_state.currentAjax = $.ajax({
            type: "get",
            url: liveSearchUrl,
            data: {
                search: e
            },
            success: function(a) {
                var html = $.trim(a || '');
                console.debug('live-search.success for', capturedQuery, 'len=', html.length);

                if (!html) {
                    console.debug('live-search returned empty response');
                    return;
                }

                // If server returned the offline page or a generic 'No Content' page, ignore it
                if (html.indexOf('offline.html') !== -1 || html.indexOf('No Content') !== -1) {
                    console.debug('live-search returned offline/no-content page; keeping local results');
                    return;
                }

                // Basic safety: ignore very small responses
                if (html.length < 40) {
                    console.debug('live-search returned very small HTML; ignoring');
                    return;
                }

                // Heuristic: only replace local results when response looks like search results
                var looksLikeResults = html.indexOf('search-item') !== -1 || html.indexOf('search-results-list') !== -1 || html.indexOf('/game/') !== -1 || html.indexOf('ltg-a-link') !== -1 || html.indexOf('list-grd') !== -1;

                // only accept response when it's for the latest query
                if (window._ltg_search_state.lastQuery !== capturedQuery) {
                    console.debug('live-search response is stale for', capturedQuery, 'current=', window._ltg_search_state.lastQuery);
                    return;
                }

                if (looksLikeResults) {
                    console.debug('live-search replacing local results for', capturedQuery);
                    $(".search-list").html(html);
                } else {
                    console.debug('live-search returned HTML that does not look like results; keeping local results');
                }
            },
            error: function(xhr, status, err) {
                if (status !== 'abort') console.debug('live-search.error', status, err && err.toString());
            }
        });
    }), 1024 > $(window).width() ? $(".tag-desktop").parent().attr("href", "javascript:void(0);") : $(".tag-desktop").each(function(e, a) {
        var s = $(this).attr("data-game-slug");
        $(this).parent().attr("href", t + "/game/" + s)
    }), $(window).resize(function() {
        var t = $(window).width(),
            e = $("#base_url").val() || '';
        t < 1024 ? $(".tag-desktop").parent().attr("href", "javascript:void(0);") : $(".tag-desktop").each(function(t, a) {
            var s = $(this).attr("data-game-slug");
            $(this).parent().attr("href", e + "/game/" + s)
        })
    }), $(document).on("submit", "#commentForm", function(e) {
        e.preventDefault();
        let a = $(this),
            s = $("#message"),
            i = $("#submitBtn");
        i.prop("disabled", !0).text("Processing..."), s.html(""), $.ajax({
            url: t + "/comments",
            method: "POST",
            data: a.serialize(),
            success: function(t) {
                t.success && (s.html('<div class="message-success">✅ ' + t.message + "</div>"), a[0].reset(), i.prop("disabled", !1).text("Submit Comment"))
            },
            error: function(xhr) {
                s.html("");
                var res = xhr && xhr.responseJSON ? xhr.responseJSON : null;
                if (res && res.errors) {
                    Object.values(res.errors).forEach(function(arr) {
                        s.append('<div class="message-error">⚠️ ' + (arr[0] || '') + "</div>");
                    });
                } else if (res && res.message) {
                    s.html('<div class="message-error">⚠️ ' + res.message + "</div>");
                } else {
                    s.html('<div class="message-error">⚠️ Something went wrong. Please try again.</div>');
                }
            },
            complete: function() {
                i.prop("disabled", !1).text("Submit Comment")
            }
        })
    });
    let e = $("#game_id").val(),
        a = 0;

    function s() {
        let s = $("#loadMoreBtn");
        s.prop("disabled", !0).text("Loading..."), $.ajax({
            url: t + "/load-comments",
            type: "GET",
            data: {
                game_id: e,
                offset: a
            },
            success: function(t) {
                if (t.html.trim()) {
                    $("#commentSection").show(), $("#commentList").append(t.html), a += t.count, $("#offset").val(a);
                    let e = parseInt($("#commentCount").text());
                    $("#commentCount").text(e + t.count)
                }
                t.count < 5 && s.hide()
            },
            complete: function() {
                s.prop("disabled", !1).text("Load more comments")
            }
        })
    }
    s(), $("#loadMoreBtn").on("click", function() {
        s()
    }), $("#allow-later").click(function() {
        localStorage.setItem("disable-notify", "1")
    }), window.addEventListener("visibilitychange", function() {
        "hidden" === document.visibilityState && setTimeout(() => {
            localStorage.removeItem("disable-notify")
        }, 1e3)
    }), setInterval(() => {
        "1" === localStorage.getItem("disable-notify") && localStorage.removeItem("disable-notify")
    }, 18e5)
});