document.addEventListener('DOMContentLoaded', function() {
  // Determine query: either ?q=... or /search/<term> path
  function getQueryFromUrl() {
    var params = new URLSearchParams(window.location.search);
    if (params.has('q')) return params.get('q') || '';
    // fallback: path like /search/term or /search/term/
    var m = window.location.pathname.match(/\/search\/(.+)$/);
    if (m && m[1]) return decodeURIComponent(m[1]);
    return '';
  }

  var q = (getQueryFromUrl() || '').trim();
  document.getElementById('results-title').textContent = q ? ('Search results for "' + q + '"') : 'Search results';

  var baseRaw = (document.getElementById('base_url') && document.getElementById('base_url').value) || '';
  var t = baseRaw.replace(/\/$/, '');
  var gamesIndexUrl = t ? t + '/assets/data/games.json' : '/assets/data/games.json';

  function renderResults(list) {
    var container = document.getElementById('results-list');
    var countEl = document.getElementById('results-count');
    if (!list || list.length === 0) {
      container.innerHTML = '<p class="text-muted">No results found</p>';
      countEl.textContent = '0 results';
      return;
    }
    countEl.textContent = list.length + ' result' + (list.length === 1 ? '' : 's');
    var html = '<div class="list-group">';
    list.forEach(function(g) {
      var img = '<img src="' + (g.img || '/img/faf-logo.png') + '" alt="' + (g.title||'') + '" onerror="this.src=\'/img/faf-logo.png\'">';
      html += '<div class="search-item d-flex align-items-center justify-content-between">'
        + '<div class="d-flex align-items-center">' + img + '<div style="margin-left:12px">'
        + '<a href="' + g.url + '" class="h6 mb-0" style="display:inline-block">' + (g.title||'Untitled') + '</a>'
        + '<div class="text-muted small">' + (g.slug || '') + '</div>'
        + '</div></div>'
        + '<div><a class="btn btn-sm btn-primary" href="' + g.url + '">Play</a></div>'
        + '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  fetch(gamesIndexUrl).then(function(r){ if (r.ok) return r.json(); throw new Error('no index'); }).then(function(json){
    var list = json || [];
    if (!q) {
      // show some popular items (first 50)
      renderResults(list.slice(0,50));
      return;
    }
    var qq = q.toLowerCase();
    var results = list.filter(function(g){
      if (!g) return false;
      var title = (g.title||'').toLowerCase();
      var slug = (g.slug||'').toLowerCase();
      return title.indexOf(qq) !== -1 || slug.indexOf(qq) !== -1;
    });
    renderResults(results);
  }).catch(function(){
    document.getElementById('results-list').innerHTML = '<p class="text-muted">Search index is not available.</p>';
  });

  // Back button behaviour: go to referrer if available, otherwise history.back(), otherwise homepage
  try {
    var backBtn = document.getElementById('back-origin-btn');
    if (backBtn) {
      var ref = document.referrer || '';
      if (ref) {
        backBtn.style.display = 'inline-block';
        backBtn.addEventListener('click', function(e){ e.preventDefault(); window.location.href = ref; });
      } else if (window.history && window.history.length > 1) {
        backBtn.style.display = 'inline-block';
        backBtn.addEventListener('click', function(e){ e.preventDefault(); window.history.back(); });
      } else {
        // no ref and no history - send to homepage
        backBtn.style.display = 'inline-block';
        backBtn.addEventListener('click', function(e){ e.preventDefault(); window.location.href = '/'; });
      }
    }
  } catch (ex) {
    // ignore
  }
});
