// ==UserScript==
// @name slovastick
// @description web-based DOM manipulator
// @author Alexander Umberg
// @source https://github.com/aumberg/slovastick
// @license http://unlicense.org/UNLICENSE
// @include http://*
// @include https://*
// @require res/slovastick.js
// ==/UserScript==

if (slovastick["option program debug mode"]) {
	slovastick.$(slovastick["off"]);
	slovastick.$.getScript(slovastick["option program debug script src"]);
}