"use strict"; /* Back to Top Scroll S */
$(window).scroll(function() {
    if ($(this).scrollTop() > 80) {
        $('#back_top').show();
    } else {
        $('#back_top').hide();
    }
});
$('#back_top').click(function() {
    $('body,html').animate({
        scrollTop: 0
    }, 600);
    return false;
}); /* Back to Top Scroll E */