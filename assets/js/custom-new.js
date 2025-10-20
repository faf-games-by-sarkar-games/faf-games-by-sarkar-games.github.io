document.addEventListener("DOMContentLoaded", function() {
    var t = $("#base_url").val();
    $("#search").on("keyup", function() {
        var e = $.trim($(this).val());
        $.ajax({
            type: "get",
            url: t + "/live-search",
            data: {
                search: e
            },
            success: function(a) {
                "" != $.trim(e) ? $("#search-result-btn").attr("href", t + "/search/" + e) : $("#search-result-btn").attr("href", "javascript:void(0);"), $(".search-list").html(a)
            }
        })
    }), 1024 > $(window).width() ? $(".tag-desktop").parent().attr("href", "javascript:void(0);") : $(".tag-desktop").each(function(e, a) {
        var s = $(this).attr("data-game-slug");
        $(this).parent().attr("href", t + "/game/" + s)
    }), $(window).resize(function() {
        var t = $(window).width(),
            e = $("#base_url").val();
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
            error: function(t) {
                s.html("");
                let e = t.responseJSON;
                e ? .errors ? Object.values(e.errors).forEach(t => {
                    s.append('<div class="message-error">⚠️ ' + t[0] + "</div>")
                }) : e ? .message ? s.html('<div class="message-error">⚠️ ' + e.message + "</div>") : s.html('<div class="message-error">⚠️ Something went wrong. Please try again.</div>')
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