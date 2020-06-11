$(function () {
    $("#navbar").load("/navbar.html",
    function () {
        var current = getValueByName("current");
        $("#nav-" + current).addClass("active")
        } );  
});
 
function getValueByName(name) {
    var url = document.getElementById('nav-bar').getAttribute('src');
    console.log("url: " + url)
    var param = new Array();
    if (url.indexOf("?") != -1) {
        var source = url.split("?")[1];
        items = source.split("&");
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var parameters = item.split("=");
            if (parameters[0] == "current") {
                return parameters[1];
            }
        }
    }
}