const preLoad = function() {
    return caches.open("offline").then(function(n) {
        return n.addAll(filesToCache)
    })
};
self.addEventListener("install", function(n) {
    n.waitUntil(preLoad())
});
const filesToCache = ["/", "/offline.html"],
    checkResponse = function(n) {
        return new Promise(function(t, e) {
            fetch(n).then(function(n) {
                404 !== n.status ? t(n) : e()
            }, e)
        })
    },
    addToCache = function(n) {
        return caches.open("offline").then(function(t) {
            return fetch(n).then(function(e) {
                return t.put(n, e)
            })
        })
    },
    returnFromCache = function(n) {
        return caches.open("offline").then(function(t) {
            return t.match(n).then(function(n) {
                return n && 404 !== n.status ? n : t.match("offline.html")
            })
        })
    };
self.addEventListener("fetch", function(n) {
    n.respondWith(checkResponse(n.request).catch(function() {
        return returnFromCache(n.request)
    })), n.request.url.startsWith("http") || n.waitUntil(addToCache(n.request))
});