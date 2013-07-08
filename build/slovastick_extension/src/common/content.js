// ==UserScript==
// @name slovastick
// @include http://*
// @include https://*
// @require res/lib/jquery-2.0.2.min.js
// ==/UserScript==

// var $ = window.$.noConflict(true); // Required for Opera and IE

$(function() {
	if ($("script[src*='slovastick.js']").length)
		return;

	$("<script>")
		.attr("src", kango.io.getResourceUrl("res/slovastick.js") + "#" + (new Date()).getTime())
		.appendTo($("head"))
})

