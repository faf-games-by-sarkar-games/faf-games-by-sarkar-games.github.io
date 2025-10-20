$(document).ready(function(e) {
     $(".favourite-games-btn").on("click", function() {
        var e = $("#base_url").val(),
            t = $(this).data("game-id");
        $.ajax({
            method: "GET",
            url: e + "/favourite-games/" + t,
            beforeSend: function() {
                $(".favourite-games-btn").html("<i class='fas fa-spinner'></i>")
            },
            success: function(e) {
                $(".favourite-games-btn").html("<i class='fas fa-heart'></i>"), $(".favourite-games-btn").addClass("active")
            }
        })
    }), $(".game-like-old").click(function() {
        var e = $("#base_url").val(),
            t = $("#game-slug").val(),
            a = $(".game-like-action").attr("data-like-action");
        $.ajax({
            method: "GET",
            url: e + "/game-like/" + t + "/" + a,
            beforeSend: function() {
                $(".like-count").html("<i class='fas fa-spinner'></i>")
            },
            success: function(e) {
                console.log(e), 1 == e.status ? ($(".game-like-action").attr("data-like-action", 1), $(".game-like-action").removeClass("active")) : ($(".game-like-action").attr("data-like-action", 0), $(".game-like-action").addClass("active")), $(".like-count").text(e.like_counts), $(".dislike-count").text(e.dislike_counts)
            }
        })
    }), $(".game-dislike-old").on("click", function() {
        var e = $("#base_url").val(),
            t = $("#game-slug").val(),
            a = $(".game-dislike-action").attr("data-dislike-action");
        $.ajax({
            method: "GET",
            url: e + "/game-dislike/" + t + "/" + a,
            beforeSend: function() {
                $(".dislike-count").html("<i class='fas fa-spinner'></i>")
            },
            success: function(e) {
                console.log(e), 1 == e.status ? ($(".game-dislike-action").attr("data-dislike-action", 1), $(".game-like-action").removeClass("active")) : ($(".game-dislike-action").attr("data-dislike-action", 0), $(".game-dislike-action").addClass("active")), $(".dislike-count").text(e.dislike_counts)
            }
        })
    }), $(".game-like-button").click(function(e) {
        e.preventDefault();
        var t = $("#base_url").val(),
            a = $(this).data("game-id");
        $.ajax({
            url: t + "/like",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            dataType: "json",
            type: "POST",
            data: {
                game_id: a
            },
            beforeSend: function() {
                $(".game-like-count").html("<i class='fas fa-spinner'></i>")
            },
            success: function(e) {
                $(".game-dislike-button").removeClass("active"), $(".game-like-button").addClass("active"), $(".game-like-count").text(e.like_count), $(".game-dislike-count").text(e.dislike_count)
            },
            error: function(e, t, a) {
                console.log("Like " + e), console.log("Like " + t), console.log("Like " + a)
            }
        })
    }), $(".game-dislike-button").click(function(e) {
        e.preventDefault();
        var t = $("#base_url").val(),
            a = $(this).data("game-id");
        $.ajax({
            url: t + "/dislike",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            dataType: "json",
            type: "POST",
            data: {
                game_id: a
            },
            beforeSend: function() {
                $(".game-dislike-count").html("<i class='fas fa-spinner'></i>")
            },
            success: function(e) {
                $(".game-like-button").removeClass("active"), $(".game-dislike-button").addClass("active"), $(".game-like-count").text(e.like_count), $(".game-dislike-count").text(e.dislike_count)
            },
            error: function(e, t, a) {
                console.log("Dislike " + e), console.log("Dislike " + t), console.log("Dislike " + a)
            }
        })
    }), $("#copy-game-btn").click(function() {
        (function e(t) {
            var a = document.createElement("textarea");
            a.value = t, document.body.appendChild(a), a.select();
            try {
                var i = document.execCommand("copy");
                $("#copy-game-btn").text(i ? "Copied!" : "Copying failed."), setTimeout(function() {
                    $("#copy-game-btn").text("Copy")
                }, 3e3)
            } catch (n) {
                console.error("Oops, unable to copy", n)
            }
            document.body.removeChild(a)
        })($("#copy-game-url").val())
    }), $("#FulltheaterButton").click(function(e) {
        if ("off" === $("#FulltheaterButton").attr("data-game-fullscreen")) {
            var t = document.getElementById("game-main");
            t.requestFullscreen ? (t.requestFullscreen(), $(".game-main").show()) : t.webkitRequestFullscreen ? (t.webkitRequestFullscreen(), $(".game-main").show()) : t.msRequestFullscreen && (t.msRequestFullscreen(), $(".game-main").show()), $("#FulltheaterButton").attr("data-game-fullscreen", "on")
        } else document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen ? document.webkitExitFullscreen() : document.msExitFullscreen && document.msExitFullscreen(), $("#FulltheaterButton").attr("data-game-fullscreen", "off")
    }), $(".CommentButton").on("click", function() {
        let t = $("#CommentContainer");
        t.length && $("html, body").animate({
            scrollTop: t.offset().top
        }, 800)
    })
});