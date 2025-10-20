// /assets/js/firebase.js
// Requires firebase-app-compat.js and firebase-database-compat.js loaded before this file.

(function(){
  // === Firebase Config (updated as you requested) ===
  const firebaseConfig = {
    apiKey: "AIzaSyDS-449TLsfMZVnbjCAo3Z90ZXZb5W_o04",
    authDomain: "faf-games-io-b1d5e.firebaseapp.com",
    databaseURL: "https://faf-games-io-b1d5e-default-rtdb.firebaseio.com",
    projectId: "faf-games-io-b1d5e",
    storageBucket: "faf-games-io-b1d5e.firebasestorage.app",
    messagingSenderId: "279291998273",
    appId: "1:279291998273:web:4804e18701ca069baf56c0",
    measurementId: "G-5FMD2QV5Y1"
  };

  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.database();

  // --------------------
  // Cookie-based user id
  // --------------------
  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
  }
  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }
  function createUserId() {
    return 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6);
  }
  function getUserId() {
    let uid = getCookie('faf_uid_v1');
    if (!uid) {
      uid = createUserId();
      // keep cookie for 3 years
      setCookie('faf_uid_v1', uid, 365 * 3);
    }
    return uid;
  }

  // Helper: Get game ID from hidden input
  function getGameId() {
    const el = document.getElementById('game_id');
    return el ? el.value : 'unknown_game';
  }

  // Update display of counts and user's current vote state (set active classes)
  function renderCountsAndVote(gameData, userId) {
    const likeEls = document.getElementsByClassName('game-like-count');
    const dislikeEls = document.getElementsByClassName('game-dislike-count');
    const likeButtons = document.getElementsByClassName('game-like-button');
    const dislikeButtons = document.getElementsByClassName('game-dislike-button');

    const likes = (gameData && gameData.likes) ? gameData.likes : 0;
    const dislikes = (gameData && gameData.dislikes) ? gameData.dislikes : 0;
    const votes = (gameData && gameData.votes) ? gameData.votes : {};
    const myVote = votes[userId] || null;

    Array.from(likeEls).forEach(el => el.textContent = likes);
    Array.from(dislikeEls).forEach(el => el.textContent = dislikes);

    Array.from(likeButtons).forEach(btn => {
      if (myVote === 'like') btn.classList.add('voted');
      else btn.classList.remove('voted');
    });
    Array.from(dislikeButtons).forEach(btn => {
      if (myVote === 'dislike') btn.classList.add('voted');
      else btn.classList.remove('voted');
    });
  }

  // ---------------------------
  // Atomic vote toggle via transaction
  // ---------------------------
  function voteToggle(gameId, userId, newVote) {
    const gameRef = db.ref('games/' + gameId);

    // run a transaction on the whole game node so we can atomically update counts and votes map
    gameRef.transaction(function(current) {
      if (!current) {
        // initialize structure if not present
        current = { likes: 0, dislikes: 0, votes: {} };
      }
      if (!current.votes) current.votes = {};

      const prev = current.votes[userId] || null;

      // If user clicking same vote again -> remove their vote (toggle off)
      if (prev === newVote) {
        // decrease corresponding count and delete vote
        if (newVote === 'like') current.likes = Math.max(0, (current.likes || 0) - 1);
        if (newVote === 'dislike') current.dislikes = Math.max(0, (current.dislikes || 0) - 1);
        delete current.votes[userId];
        return current;
      }

      // If user had previous opposite vote, remove it
      if (prev === 'like') current.likes = Math.max(0, (current.likes || 0) - 1);
      if (prev === 'dislike') current.dislikes = Math.max(0, (current.dislikes || 0) - 1);

      // Add new vote
      if (newVote === 'like') current.likes = (current.likes || 0) + 1;
      if (newVote === 'dislike') current.dislikes = (current.dislikes || 0) + 1;

      // Set user's vote
      current.votes[userId] = newVote;
      return current;
    }, function(error, committed, snapshot) {
      if (error) {
        console.error('Vote transaction failed:', error);
      } else if (!committed) {
        console.log('Vote transaction not committed (no change).');
      } else {
        const gameData = snapshot.val();
        renderCountsAndVote(gameData, userId);
      }
    });
  }

  // ---------------------------
  // DOM wiring
  // ---------------------------
  document.addEventListener('DOMContentLoaded', function() {
    const userId = getUserId();
    const gameId = getGameId();

    // Subscribe to realtime changes for this game to update counts and vote button state
    const gameRef = db.ref('games/' + gameId);
    gameRef.on('value', function(snapshot) {
      const data = snapshot.val() || { likes: 0, dislikes: 0, votes: {} };
      renderCountsAndVote(data, userId);
    });

    // Click handling for like/dislike buttons
    document.addEventListener('click', function(e) {
      const likeBtn = e.target.closest('.game-like-button');
      const dislikeBtn = e.target.closest('.game-dislike-button');

      if (likeBtn) {
        likeBtn.disabled = true;
        voteToggle(gameId, userId, 'like');
        setTimeout(() => likeBtn.disabled = false, 600);
      }
      if (dislikeBtn) {
        dislikeBtn.disabled = true;
        voteToggle(gameId, userId, 'dislike');
        setTimeout(() => dislikeBtn.disabled = false, 600);
      }
    });

    // --------- Comments (unchanged) ----------
    const form = document.getElementById('commentForm');
    const commentList = document.getElementById('commentList');
    const commentCountEl = document.getElementById('commentCount');

    if (form) {
      form.addEventListener('submit', function(ev) {
        ev.preventDefault();
        const name = form.querySelector('input[name="name"]').value.trim();
        const email = form.querySelector('input[name="email"]').value.trim();
        const description = form.querySelector('textarea[name="description"]').value.trim();
        const message = document.getElementById('message');

        if (!name || !email || !description) {
          if (message) message.innerText = 'Please fill all fields';
          return;
        }

        const newCommentRef = db.ref('comments/' + gameId).push();
        newCommentRef.set({
          name,
          email,
          description,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
          form.reset();
          if (message) {
            message.innerText = 'Comment submitted!';
            setTimeout(()=> { message.innerText = ''; }, 2500);
          }
        }).catch(err => {
          console.error(err);
          if (message) message.innerText = 'Error sending comment';
        });
      });

      // Realtime comments
      const commentsRef = db.ref('comments/' + gameId).limitToLast(50);
      commentsRef.on('value', function(snapshot) {
        const data = snapshot.val() || {};
        if (commentList) commentList.innerHTML = '';
        const commentsArr = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        commentsArr.sort((a,b) => (a.timestamp||0) - (b.timestamp||0));
        commentsArr.forEach(c => {
          const div = document.createElement('div');
          div.className = 'single-comment mb-2';
          const time = c.timestamp ? new Date(c.timestamp).toLocaleString() : '';
          div.innerHTML = `<strong>${escapeHtml(c.name)}</strong> <small class="text-muted"> ${time} </small>
                           <p>${escapeHtml(c.description)}</p>`;
          if (commentList) commentList.appendChild(div);
        });
        if (commentCountEl) commentCountEl.textContent = commentsArr.length;
      });
    }
  });

  // Prevent XSS
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // expose for debug if needed
  window._LG_FB = {
    db,
    getUserId,
    voteToggle
  };

})();
