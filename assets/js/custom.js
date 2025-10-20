"use strict";
$(window).on("load", (function() {
    $("#loader-main").fadeOut(500)
}));
var wow = new WOW({
    boxClass: "wow",
    animateClass: "animated",
    offset: 100,
    mobile: !1,
    live: !0,
    callback: function(a) {},
    scrollContainer: null
});
wow.init(), $(window).scroll((function() {
    $(this).scrollTop() > 0 ? $(".header-main").addClass("sticky") : $(".header-main").removeClass("sticky")
})), $(".navbar-toggler").click((function() {
    $("body").hasClass("header-open") ? (console.log("remove 2"), $("body").removeClass("header-open")) : (console.log("add"), $("body").addClass("header-open"))
})), $(window).width() < 992 && ($(".nav-item.has-dropdown .nav-link").click((function() {
    $(this).parent().hasClass("open") ? ($(this).parent().removeClass("open"), $(this).parent().find(".dropdown-div").slideUp()) : ($(this).parent().addClass("open"), $(this).parent().find(".dropdown-div").slideDown())
})), $(".navbar-inner .close").click((function(a) {
    $("body").hasClass("header-open") && $("body").removeClass("header-open"), a.stopPropagation()
})), $(".navbar-inner").click((function(a) {
    a.stopPropagation()
})), $(".navbar-collapse").click((function() {
    $("body").hasClass("header-open") && $("body").removeClass("header-open")
}))), $((function() {
    $("#fav-game-link").click((function(a) {
        $(this).parent().hasClass("show") ? ($("#fav-game-box").hide(), $(this).parent().removeClass("show"), $("body").removeClass("fav-popup-open")) : ($("#fav-game-box").show(), $(this).parent().addClass("show"), $("body").addClass("fav-popup-open")), a.stopPropagation()
    })), $("#fav-game-box").click((function(a) {
        a.stopPropagation()
    })), $(document).click((function() {
        $("#fav-game-link").parent().hasClass("show") && ($("#fav-game-box").hide(), $("#fav-game-link").parent().removeClass("show"), $("body").removeClass("fav-popup-open"))
    })), $("#fav-game-close, #last-play-game-link").click((function() {
        $("#fav-game-link").parent().hasClass("show") && ($("#fav-game-box").hide(), $("#fav-game-link").parent().removeClass("show"), $("body").removeClass("fav-popup-open"))
    })), $(document).on("keydown", (function(a) {
        27 === a.keyCode && $("#fav-game-link").parent().hasClass("show") && ($("#fav-game-box").hide(), $("#fav-game-link").parent().removeClass("show"), $("body").removeClass("fav-popup-open"))
    }))
})), $((function() {
    $("#last-play-game-link").click((function(a) {
        $(this).parent().hasClass("show") ? ($("#last-play-game-box").hide(), $(this).parent().removeClass("show"), $("body").removeClass("last-play-popup-open")) : ($("#last-play-game-box").show(), $(this).parent().addClass("show"), $("body").addClass("last-play-popup-open")), a.stopPropagation()
    })), $("#last-play-game-box").click((function(a) {
        a.stopPropagation()
    })), $(document).click((function() {
        $("#last-play-game-link").parent().hasClass("show") && ($("#last-play-game-box").hide(), $("#last-play-game-link").parent().removeClass("show"), $("body").removeClass("last-play-popup-open"))
    })), $("#last-play-game-close, #fav-game-link").click((function() {
        $("#last-play-game-link").parent().hasClass("show") && ($("#last-play-game-box").hide(), $("#last-play-game-link").parent().removeClass("show"), $("body").removeClass("last-play-popup-open"))
    })), $(document).on("keydown", (function(a) {
        27 === a.keyCode && $("#last-play-game-link").parent().hasClass("show") && ($("#last-play-game-box").hide(), $("#last-play-game-link").parent().removeClass("show"), $("body").removeClass("last-play-popup-open"))
    }))
}));
// var owlBannerSliderMain=1,owlContactClassName="#bnr-slider",owlContactLoop=!1,owlContactItemLength=$(owlContactClassName+" .owl-carousel .item").length,owlContactBanner=$(owlContactClassName+" .owl-carousel");owlContactItemLength<owlBannerSliderMain&&$(owlContactClassName).find(".owl-controls").css("display","none"),owlContactLoop=owlContactItemLength>owlBannerSliderMain,owlContactBanner.owlCarousel({loop:owlContactLoop,mouseDrag:!0,touchDrag:!0,pullDrag:!1,margin:10,autoplay:!0,autoplayHoverPause:!1,autoplayTimeout:1e4,smartSpeed:500,navText:["<i class='fa fa-chevron-left' title='Previous'></i>","<i class='fa fa-chevron-right' title='Next'></i>"],responsive:{0:{items:1,dots:!0,nav:!1}}});var owlMostPlaySliderMain=1,owlMostPlayClassName="#bnr-most-play-slider",owlMostPlayLoop=!1,owlMostPlayItemLength=$(owlMostPlayClassName+" .owl-carousel .item").length,owlMostPlayBanner=$(owlMostPlayClassName+" .owl-carousel");owlMostPlayItemLength<owlMostPlaySliderMain&&$(owlMostPlayClassName).find(".owl-controls").css("display","none"),owlMostPlayLoop=owlMostPlayItemLength>owlMostPlaySliderMain,owlMostPlayBanner.owlCarousel({loop:owlMostPlayLoop,mouseDrag:!0,touchDrag:!0,pullDrag:!1,margin:10,autoplay:!0,autoplayHoverPause:!1,autoplayTimeout:3e3,smartSpeed:500,autoHeight:!1,navText:["<i class='fa fa-chevron-left' title='Previous'></i>","<i class='fa fa-chevron-right' title='Next'></i>"],responsive:{1250:{items:4,dots:!1,nav:!0},992:{items:3,dots:!1,nav:!0},768:{items:2,dots:!1,nav:!0},576:{items:2,dots:!1,nav:!0},0:{items:1,dots:!1,nav:!0}}});
// var owlRandomPlaySliderMain=1,owlRandomClassName=".random-play-sc",owlRandomLoop=!1,owlRandomItemLength=$(owlRandomClassName+" .owl-carousel .item").length,owlRandomBanner=$(owlRandomClassName+" .owl-carousel");owlRandomItemLength<owlRandomPlaySliderMain&&$(owlRandomClassName).find(".owl-controls").css("display","none"),owlRandomLoop=owlRandomItemLength>owlRandomPlaySliderMain,owlRandomBanner.owlCarousel({animateOut:"slideOutDown",animateIn:"flipInX",loop:owlRandomLoop,mouseDrag:!0,touchDrag:!0,pullDrag:!1,margin:0,autoplay:!0,autoplayHoverPause:!1,autoplayTimeout:3e3,smartSpeed:500,autoHeight:!0,navText:["<i class='fa fa-chevron-left' title='Previous'></i>","<i class='fa fa-chevron-right' title='Next'></i>"],responsive:{1200:{items:8,dots:!1,nav:!0},992:{items:6,dots:!1,nav:!0},768:{items:4,dots:!1,nav:!0},576:{items:4,dots:!1,nav:!0},0:{items:2,dots:!1,nav:!0}}}),
$(".fullscreen-link").click((function() {
    console.log("Click"), $("#game-main").hasClass("fullscreen") ? ($("#game-main").removeClass("fullscreen"), $("body").removeClass("overflow-hidden"), console.log("has class")) : ($("#game-main").addClass("fullscreen"), $("body").addClass("overflow-hidden"), console.log("no class"))
})), $("#close-game").click((function() {
    $("#game-main").hasClass("fullscreen") && ($("#game-main").removeClass("fullscreen"), $("body").removeClass("overflow-hidden"))
}));