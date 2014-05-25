// 
// slovastick - web-based DOM manipulator
// manifesto  - http://minifesto.org/
// license    - http://unlicense.org/UNLICENSE
(function($) {
	var s = window.slovastick = {};

	// page

	// s["page *"] 							= ".//*[contains(@class, 'message')][last()]/span[3]"
	s["page music.yandex.ru"] 				= function() {
		// player
		s["console add xpath"]("//*[@class='b-link js-player-title']");
		s["console add xpath"]("//*[@class='b-link js-player-artist']");
		s["console add xpath"]("//*[contains(@class, 'b-jambox__play')]").attr("title", "play song");
		s["console add xpath"]("//*[contains(@class, 'b-jambox__prev')]").attr("title", "previous song");
		s["console add xpath"]("//*[contains(@class, 'b-jambox__next')]").attr("title", "next song");
		// search
		s["console add xpath"]("//*[@id='search-input']").attr("title", "search song");
		// list of music
		s["console add xpath"]("//*[@id='js-content']/div[8]/div/div[3]/div[1]/a");
	}

	// memory

	s["memory audio signal"] 				= undefined;
	s["memory audio speech listened"] 		= 0;
	s["memory audio speech"] 				= undefined;
	s["memory browser audio extension"] 	= undefined;
	s["memory browser name"] 				= undefined;
	s["memory browser version"] 			= undefined;
	s["memory current elements"] 			= undefined;
	s["memory focused page"]				= true;
	s["memory loader history"] 				= [];
	s["memory loader queue"] 				= [];
	s["memory recognition"] 				= webkitSpeechRecognition ? new webkitSpeechRecognition() : undefined;
	s["memory text pieces for speech"] 		= [];

	// option

	s["option program debug mode"] 			= true; //false || true || "all"
	s["option program debug src"] 			= "http://localhost/";
	s["option program description"]			= "Slovastick - web-based DOM manipulator";
	s["option program name"] 				= "Slovastick";
	s["option program src"]					= "";
	s["option sound src"]					= "";
	s["option program status"]				= "off";
	s["option program version"] 			= "0.2";
	s["option user language"]				= "ru";
	s["option user sound volume"]			= 75;

	// library

	// ㊢ selenium IDE, recorder-handlers.js, Recorder.prototype.findClickableElement
	s["library element clickable"] = function(e) {
		e = $(e)[0];

		if (!e.tagName) {
			return null;
		}

		var tagName = e.tagName.toLowerCase();
		var type = e.type;

		if (e.hasAttribute("onclick") || e.hasAttribute("href") || tagName == "button" ||
			(tagName == "input" && (type == "submit" || type == "button" || type == "image" || type == "radio" || type == "checkbox" || type == "reset"))) {
				return e;
		} else {
			if (e.parentNode != null) {
				return s["library element clickable"](e.parentNode);
			} else {
				return null;
			}
		}
	}
	//
	s["library regexp to string"] = function(string) {
		return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}
	//
	s["library audio play signal"] = function(strSignalName) {
		var audio 	= s["memory audio signal"];
		var ext 	= s["memory browser audio extension"];
		var volume 	= s["option user sound volume"];
		var source 	= s["option sound src"]

		if (!audio || !volume || !ext) {
			return;
		}

		audio.volume = volume / 100;
		audio.pause();
		audio.src = source + strSignalName + ext;
		audio.play();
	}
	//
	s["library audio pause speech"] = function() {
		s["memory audio speech"].pause();
	}
	//
	s["library audio stop speech"] = function() {
		s["memory audio speech"].pause();
		s["memory text pieces for speech"] = [];
	}
	//
	s["library audio add and play speech"] = function(text) {
		if (!text || ("string" !== typeof text)) {
			return;
		}

		s["memory text pieces for speech"].push(text);
		s["green"]("add " + text);
		s["library audio play speech"]();
	}
	//
	s["library audio play speech"] = function(text, lang) {
		var audio 	= s["memory audio speech"];
		var ext 	= s["memory browser audio extension"];
		var volume 	= s["option user sound volume"];

		if (!(audio.paused || audio.ended) || (0 > s["memory audio speech listened"])) {
			return;
		}

		if (10 < s["memory audio speech listened"]) {
			s["yellow"]("wait speech...");

			setTimeout(function() {	
				s["green"]("resume speech!");
				s["memory audio speech listened"] = 0;
				s["library audio play speech"]();
			}, 5000);

			s["memory audio speech listened"] = -1;

			return;
		}

		var text 	= (text ? [text] : s["memory text pieces for speech"]).shift();

		if (!volume || !audio || !text) {
			return;
		}

		text = $.trim(text.replace(/\s+/g, " "));

		var lang = (lang || s["option user language"]);
		var textPieces = s["library text pieces"]({
			"text":text
			,"range":90
		});

		s["memory text pieces for speech"] = textPieces.concat(s["memory text pieces for speech"]);
		text = encodeURIComponent(s["memory text pieces for speech"].shift());
		// s["green"]("ok", text, !s["option user sound volume"], !audio, !text, !(audio.paused || audio.ended))

		s["memory audio speech listened"]++;
		// s["green"]("audio play speech", text);
		audio.volume = volume / 100;
		audio.pause();
		// google
		if (".mp3" === ext) {
			audio.src = "http://translate.google.com/translate_tts?ie=UTF-8&q=" + text + "&tl=" + lang;
		}
		// not google
		else if (".ogg" === ext) {
			var local = {
				"ru": "&LOCALE=ru&VOICE=voxforge-ru-nsh",
				"en": "&LOCALE=en_US&VOICE=cmu-slt-hsmm"
			};

			audio.src = "http://mary.dfki.de:59125/process?INPUT_TYPE=TEXT&OUTPUT_TYPE=AUDIO&INPUT_TEXT=" + text + local[lang] + "&AUDIO=WAVE_FILE";
		}
		//
		audio.play();
	}
	//
	s["library audio generate curl for download speech"] = function() {
		var myWindow = window.open("", "_blank", "width=200, height=100");
		myWindow.document.write("<p>hello</p>");

		return;
	}
	//code dependencies loader
	s["library loader"] = function(load) {
		if (load) {
			if ("function" === typeof a) {
				s["memory loader queue"] 	= s["memory loader queue"].concat([a]);
			}
			else {
				load.before 				= (load.before || []);
				load.after 					= (load.after  || []);
				s["memory loader queue"] 	= load.before.concat(s["memory loader queue"]);
				s["memory loader queue"] 	= s["memory loader queue"].concat(load.after);
			}

			if (s["memory loader started"]) {
				return;
			}
		}

		s["memory loader started"] = true;
		
		if (s["memory loader queue"].length) {
			var call = {};

			s["memory loader history"].push(call);
			call.function = s["memory loader queue"].shift();

			try {
				return call.result = call.function();
			}
			catch(e) {
				s["red"](e, "on call last function", call.function.toString(), s["memory loader history"]);
			}
		}

		return s["memory loader started"] = undefined;
	}
	//
	s["library headlight element"] = function(param) {
		param = $.extend(true, {
			"element": $()
			,"color": "rgba(0, 255, 0, 0.5)"
		}, param);

		param["element"].each(function() {
			var oldBgColor = $(this).data("slovastick-oldBgColor");

			if (!oldBgColor) {
				oldBgColor = $(this).css("backgroundColor");
				$(this).data("slovastick-oldBgColor", oldBgColor);
			}

			$(this)
				.stop(true, true)
				.animate({"backgroundColor"	: param["color"]}, 400, "linear")
				.animate({"backgroundColor"	: oldBgColor}, 400, "linear");

			// var offset = $(this).offset();
			// $("<div class='slovastick' title='slovastick temporary block'>")
			// 	.css({
			// 		"position"	: "absolute"
			// 		,"width"	: $(this).css("width")
			// 		,"height"	: $(this).css("height")
			// 		,"left"		: offset.left
			// 		,"top"		: offset.top
			// 		,"z-index"	: "2147483647"
			// 		,"opacity"  : 0.8
			// 		,"background-color": param["color"]
			// 	})
			// 	.prependTo($("body"))
			// 	.delay().animate({"opacity": 0}, 1000, function() {
			// 		$(this).remove();
			// 	});
		});
	};
	//
	s["library speech stop recognition"] = function() {
		if (!s["memory recognition"]) {
			return;
		}
		
		s["memory recognition"].stop();
	}
	//
	s["library speech recognition"] = function() {
		// http://stiltsoft.com/blog/2013/05/google-chrome-how-to-use-the-web-speech-api/

		var interimResult;
		var recognition = s["memory recognition"];

		if (!recognition) {
			return;
		}

		s["green"]("speech recognition");
		s["memory recognition"].stop();

		recognition.lang = s["option user language"];
		recognition.continuous = true;
		recognition.interimResults = true;

		recognition.onerror = function(event) {
			s["red"]("recognition error - " + event.error);
			// recognition.stop();
		};

		recognition.onend = function() {
			s["yellow"]("end speech", interimResult);
		};

		recognition.onresult = function(event) {
			// var pos = s["option console"].getCursorPosition() - interimResult.length;
			// s["option console"].val(s["option console"].val().replace(interimResult, ''));
			interimResult = "";
			// s["option console"].setSelectionRange(pos, pos);
			// s.library.selectRange(s["option console"], interimResult.length)

			for (var i = event.resultIndex; i < event.results.length; ++i) {
				interimResult += event.results[i][0].transcript;

				if (event.results[i].isFinal) {
					s["green"]("speech", interimResult);
					var e = $(s["memory last input element"]);
					e.val(e.val() + " " + interimResult).keyup();
				}
			}
		};

		$(window)
			.one("keydown.slovastick", function(event) {
				// if shift button
				if (16 === event.which) {
					recognition.stop();
				}
				//
			})

		recognition.start();

		return recognition;
	};
	// search element by xpath or cssPath selector
	s["library find"] = function(path_or_element, context) {
		context = ("string" === typeof context) ? s["library find"](context) : $(document);

		// find element by path
		if ("string" === typeof path_or_element) {
			result = $();

			try {
				return $(path_or_element, context);
			}
			catch (e) {}

			// if can't css try xpath
			for (var i = 0; i < context.length; i++) {
				try {
					xpath_result = window.document.evaluate(path_or_element, context[i], null, 0, null);
				}
				catch (e) {
					return $();
				}

				for (var node; xpath_result && (node = xpath_result.iterateNext()); ) {
					result = result.add(node);
				}
			}

			if ("all" === s["option program debug mode"]) {
				var msg = ["search " + path_or_element];

				msg = msg.concat(["from contexts", context]);

				if (result.length)
					msg = msg.concat(["and found", result]);
				else 
					msg.push("and nothing found!")

				s["yellow"].apply(this, msg);
			}

			return result;
		}
		else if ("object" === typeof path_or_element) {
			result = {
				"css"	: ""
				,"xpath": ""
			};

			$(path_or_element).each(function(index, element) {
				var css = "", xpath = "";

				for (element; element && (1 === element.nodeType); element = element.parentNode) {
					if (element.id) {
						css 	= " #" 		 + element.id 		 + css;
						xpath 	= "//*[@id='" + element.id + "']" + xpath;

						break;
					}

					var position = 1;

					for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
						if (10 === sibling.nodeType)
							continue;
						else if (sibling.nodeName == element.nodeName)
							position++;
					}

					if (1 === position) {
						position = 0;

						for (var sibling = element.nextSibling; sibling; sibling = sibling.nextSibling) {
							if (10 === sibling.nodeType)
								continue;
							else if (sibling.nodeName == element.nodeName) {
								position = 1;

								break;
							}
						}
					}

					var tagName = element.nodeName.toLowerCase();

					if (position) {
						css 	= ":eq(" + (position - 1) + ")" + css;
						xpath 	= "[" 	 + position 	  + "]" + xpath;	
					}
					
					css 	= ">" + tagName + css;
					xpath 	= "/" + tagName + xpath;	
				}

				if (!css)
					return;

				result["css"] 	+= "," + css.slice(1);
				result["xpath"] += "|" + xpath;
			})

			result["css"] 	= result["css"].slice(1);
			result["xpath"] = result["xpath"].slice(1);

			return result;
		}

		return null;
	}
	//slice string for parts. It need for service "google translate"
	s["library text self"] = function(element) {
		element 	= s["type element"](element);

		var clone 	= element.clone();
		clone.children().remove();
		
		var result 	= element.text() || clone.val() || element.attr("title");
		clone.remove();

		return result;
	}
	s["library text pieces"] = function(param) {
		param = $.extend(true, {
			text: ""
			,range: 1
		}, param);

		// if("number" !== typeof param.range) {
		// 	return null;
		// }

		var result = [];

		(function loop() {
			if(!param.text.length)
				return;

			var part = param.text.slice(0, param.range);

			if(param.range > part.length)
				return result.push(part);

			var search = /[\.\?\!][^\.\?\!]*$/.exec(part),
				nextStartIndex = param.range;

			if(search) {
				nextStartIndex = param.range - (search[0].length - 1);
			}
			else if(-1 !== part.lastIndexOf(" ")) {
				nextStartIndex = part.lastIndexOf(" ") + 1;
			}

			result.push(param.text.slice(0, nextStartIndex));
			param.text = param.text.slice(nextStartIndex);
	
			loop();
		}())

		return result;
	};
	//
	s["library set text selection range"] = function(element, start, end) {
		element = $(element).get(0);

		if (element.setSelectionRange) {
			element.setSelectionRange(start, end);
		} else if (element.createTextRange) {
			var range = element.createTextRange();
			range.collapse(true);
			range.moveStart('character', start);
			range.moveEnd('character', end);
			range.select();
		}
	};
	//
	//
	// 	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-
	//
	//
	s["off"] = function (ele) {
		$(window).add($("*", "body"))
			.off(".slovastick .slovastick-console .slovastick-move .slovastick-mouseover");
		
		if (s["option panel"])
			s["option panel"].css("display", "none");

		s["option program status"] = "off";
	};
	//
	s["on"] = function (ele) {
		s["off"]();

		s["option panel"] 			= $("#slovastick_panel", 	s["option slovastick"])
			.attr("title", s["option program description"] 
				+ " (version " + s["option program version"] + ") ")
			.css("display", "block");

		if (!s["option panel"]) {
			return null;
		}

		s["option button"] 			= $("[name='button']", 		s["option panel"]);

		s["option button program"] 	= $("[name='program']", 	s["option button"])
			.html("&nbsp;<b>SLOVASTICK</b>&nbsp;" + s["option program version"] + "&nbsp;");

		s["option console"] 		= $("[name='console']", 	s["option panel"])
			.css("width", s["option panel"].width());

		s["option button"].language 	= $("[name='language']", 	s["option button"])
			.on("change.slovastick", function() {
				var language = $(this).find(":selected").val().toLowerCase();

				langCode = {
					"english"	: "en"
					,"russian"	: "ru"
				}

				s["option user language"] = langCode[language];
				s["option button mode"].change();
			});

		s["option button"].sound 		= $("[name='sound']", 		s["option button"])
			.on("change.slovastick", function() {
				s["option user sound volume"] = parseInt($(this).find(":selected").val().slice(6));
			});

		s["option button"].kick 		= $("[name='kick']", 		s["option button"])
			.on("click.slovastick", function() {
				if ("10px" === s["option panel"].css("right")) {
					s["option panel"].css({"left":"10px", "right":"auto"});
				}
				else {
					s["option panel"].css({"left":"auto", "right":"10px"});
				}
			});

		var elements = s["library find"](s["console"]()).each(function() {
			var element = $(this);
			var text = $.trim(s["library text self"](element));

			element.data("slovastick", text);
		});

		// register DOM change
		var x = function () {
			setTimeout(x, 1000);

			var elements = s["library find"](s["console"]());

			s["memory current elements"] = elements;

			if (!elements.length) {
				return;
			}

			var useTabIndex;

			elements.each(function() {
				var element 	= $(this);
				var text 		= $.trim(s["library text self"](element));
				var isChanged 	= (text && (element.data("slovastick") !== text));

				if (isChanged) {
					element.data("slovastick", text);

					if (!s["memory focused page"]) {
						text = document.location.host + " " + text;
					}

					s["library audio add and play speech"](text);
				}

				if (isChanged || !element.attr("tabindex")) {
					if (!useTabIndex) {
						useTabIndex = 1;

						$("*[tabindex]").each(function() {
							if ($(this).data("slovastick")) {
								$(this).removeAttr("tabindex");
							}
							else if (useTabIndex <= parseInt($(this).attr("tabindex"))) {
								useTabIndex = parseInt($(this).attr("tabindex")) + 1;
							}
						})						
					}
					else {
						useTabIndex++;
					}

					element.attr("tabindex", useTabIndex);	
				}
			});
		}

		x();
		// 
		$("*", "body") //.not($("*", "#slovastick"))
			.on("focus.slovastick_memory_element, mouseenter.slovastick_memory_element", function(event) {
				event.preventDefault();
				event.stopPropagation();

				if ($(event.target).data("slovastick")) {
					s["library headlight element"]({
						"element"	: $(event.target)
						,"color"	: "rgba(255, 255, 0, 0.5)"
					});

					var text = $.trim(s["library text self"](this));
					s["library audio play speech"](text);
				}

				s["memory last element"] = event.target;
			});

		$(window)
			.on("resize.slovastick", function() {
				s["option console"].css("max-width", 	($(window).width()  - 40) + "px");
				s["option console"].css("max-height",	($(window).height() - 90) + "px");
			})
			.resize()
			.on("focus", function() {
				s["memory focused page"] = true;
			})
			.on("blur", function() {
				s["memory focused page"] = false;
			})
			.on("keydown.slovastick", function(event) {
				// "enter"		: 13
				// ,"shift" 	: 16
				// ,"control" 	: 17
				// ,"alt" 		: 18
				// ,"left" 		: 37
				// ,"up" 		: 38
				// ,"right" 	: 39
				// ,"down" 		: 40

				s["library audio stop speech"]();
				s["library speech stop recognition"]();


				// if not shift button
				if (16 !== event.which) {
					return;
				}
				//

				$(window)
					.one("keyup.slovastick", function(event) {
						// if not shift button
						if (16 !== event.which) {
							return;
						}
						//
						if ("" + window.getSelection()) {
							s["library audio play speech"]("" + window.getSelection());

							return;
						}

						var element = $(s["memory last element"]);

						if (!$(element).length) {
							return;
						}

						var xpath 	= s["library find"](element)["xpath"];
						var text 	= $.trim(s["library text self"](element));
						// if again shift pressed - start recognition
						if (-1 !== s["console"]().indexOf(xpath)) {
							s["library headlight element"]({
								"element"	: s["memory current elements"]
								,"color"	: "rgba(255, 255, 0, 0.8)"
							});

							if (-1 !== $.inArray(element.get(0).tagName, ["INPUT", "TEXTAREA"])) {
								s["memory last input element"] = element;
								s["library speech recognition"]();
							}

							return;
						}
						//
						s["console add xpath"](xpath);
						s["library headlight element"]({
							"element"	: s["memory current elements"]
							,"color"	: "rgba(255, 255, 0, 0.8)"
						});
						s["library headlight element"]({"element":element});
						s["library audio play speech"](text);
						element.data("slovastick", text);				
					});
			})

		s["option program status"] = "on";

		var xpath = s["page " + document.location.host];

		if (!xpath && s["page *"]) {
			xpath = s["page *"];
		}

		if ("function" === typeof xpath) {
			xpath = xpath();
		}

		s["console"](xpath);
		s["option program status"] = "on";
		s["yellow"]("I there! Hello :>");
	};
	//
	s["green"] = function(result) {
		if (s["option program debug mode"] && window.console && ("function" === typeof window.console.log)) {
			window.console.log("WORDS OK: ", arguments);
		}

		s["library audio play signal"]("green");
	};
	//
	s["yellow"] = function() {
		if (s["option program debug mode"] && window.console && ("function" === typeof window.console.error)) {
			window.console.error("WORDS LOG: ", arguments);
		}

		s["library audio play signal"]("yellow");
	};
	//
	s["red"] = function() {
		if (s["option program debug mode"] && window.console && ("function" === typeof window.console.error)) {
			window.console.error("WORDS ERROR: ", arguments);
		}

		s["library audio play signal"]("red");

		return null;
	};
	//
	s["console"] = function(text) {
		if (!s["option console"]) {
			return;
		}

		if (!text) {
			return s["option console"].val();
		}

		s["option console"].val(text);

		return s;
	}
	//
	s["console add xpath"] = function(xpath) {
		if (!s["option console"] || !xpath) {
			return;
		}

		if (s["console"]()) {
			s["option console"].val(s["console"]() + " | " + xpath);
		}
		else {
			s["option console"].val(xpath);
		}

		return s["library find"](xpath);
	}
	//
	s["plugin"] = function(plugin) {
		plugin = $.extend(true, {
			url: ""
			,prepend: "#slovastick"
			,callback: function() {}
		}, plugin);

		if (!plugin.url) {
			return s["red"]("bad url for plugin", plugin.url);
		}

		s["yellow"](plugin.url)

		$.ajax(plugin.url, {
			dataType: 'text'
			,cache: false
			,timeout: 5000
			,success: function(data) {
				try {
					$($.parseHTML(data, true)).each(function(index, element) {
						if (!element.tagName || "#" === element.nodeName[0]) {
							return;
						}

						s["green"](plugin.prepend, s["library find"](plugin.prepend))

						// .children(element.tagName).remove();
						s["library find"](plugin.prepend).prepend(element);

						// s.run(element);
					});
					s["green"]("I loaded plugin");
					plugin.callback();
				}
				catch (e) {
					s["red"]("I can't find correct plugin for that site", e);
				}
			}
			,error: function() {
				plugin.callback();
			}
		});

		return s;
	}
	//

	s["type element"] = function(path, context) {
		if ("string" === typeof path) {
			path = s["library find"](path, context);
		}

		return $(path);
	}
	s["type xpath"] = function(element) {
		return s["library find"](element)["xpath"];
	}
	s["type css"] = function(element) {
		return s["library find"](element)["css"];
	}
	//
	// 	-	-	-	-	-	-	-	-	-	-	loading	-	-	-	-	-	-	-	-	-	-	-
	//
	s["library loader"]({before: [
		// 
		function() {
			var ua 			= navigator.userAgent.toLowerCase();
			var	browser 	= (/(chrome)[ \/]([\w.]+)/.exec(ua)  // code copied and modified from http://code.jquery.com/jquery-migrate-1.0.0.js 
					|| /(webkit)[ \/]([\w.]+)/.exec(ua)
					|| /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua)
					|| /(msie) ([\w.]+)/.exec(ua)
					|| ((ua.indexOf("compatible") < 0) && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua))
					|| []);
			var audio 		= window.document.createElement("audio");

			if (audio && audio.canPlayType) {
				if (audio.canPlayType("audio/mpeg")) {
					s["memory browser audio extension"] = ".mp3";
				}
				else if (audio.canPlayType("audio/ogg")) {
					s["memory browser audio extension"] = ".ogg";
				}
			}

			s["memory browser name"] 	= (browser[1] || "");
			s["memory browser version"] = (browser[2] || "0");

			if (!($ && $.fn && $.fn.jquery) || ("2.0.2" !== $.fn.jquery)) {
				var scripts = window.document.getElementsByTagName("script");

				for (var i = 0; i < scripts.length; i++) {
					if (!scripts[i].getAttribute) {
						continue;
					}

					var attSrc = scripts[i].getAttribute("src");

					if (!attSrc) {
						continue;
					}
					
					var masScript = attSrc.match(/^(.*)slovastick\.js/);

					if (masScript) {
						if (!s["option program src"]) {
							s["option program src"] = masScript[1];
						}

						var script 		= window.document.createElement("script");

						script.onload 	= function() {
							$ = window.jQuery.noConflict(true);
							s["library loader"]();
						}

						script.src 		= encodeURI(s["option program src"] + "lib/jquery-2.0.2.min.js");

						return window.document.getElementsByTagName('head')[0].appendChild(script);
					}
				}

				return s["red"]("can't load jQuery");
			}

			s["library loader"]();
		}
		//
		,function() {
			s["$"] = $;

			$.fn.reverse = [].reverse;

			/*
			 Color animation 1.6.0
			 http://www.bitstorm.org/jquery/color-animation/
			 Copyright 2011, 2013 Edwin Martin <edwin@bitstorm.org>
			 Released under the MIT and GPL licenses.
			*/
			(function(d){function h(a,b,e){var c="rgb"+(d.support.rgba?"a":"")+"("+parseInt(a[0]+e*(b[0]-a[0]),10)+","+parseInt(a[1]+e*(b[1]-a[1]),10)+","+parseInt(a[2]+e*(b[2]-a[2]),10);d.support.rgba&&(c+=","+(a&&b?parseFloat(a[3]+e*(b[3]-a[3])):1));return c+")"}function f(a){var b;return(b=/#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/.exec(a))?[parseInt(b[1],16),parseInt(b[2],16),parseInt(b[3],16),1]:(b=/#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/.exec(a))?[17*parseInt(b[1],16),17*parseInt(b[2],
			16),17*parseInt(b[3],16),1]:(b=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(a))?[parseInt(b[1]),parseInt(b[2]),parseInt(b[3]),1]:(b=/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9\.]*)\s*\)/.exec(a))?[parseInt(b[1],10),parseInt(b[2],10),parseInt(b[3],10),parseFloat(b[4])]:l[a]}d.extend(!0,d,{support:{rgba:function(){var a=d("script:first"),b=a.css("color"),e=!1;if(/^rgba/.test(b))e=!0;else try{e=b!=a.css("color","rgba(0, 0, 0, 0.5)").css("color"),
			a.css("color",b)}catch(c){}return e}()}});var k="color backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor outlineColor".split(" ");d.each(k,function(a,b){d.Tween.propHooks[b]={get:function(a){return d(a.elem).css(b)},set:function(a){var c=a.elem.style,g=f(d(a.elem).css(b)),m=f(a.end);a.run=function(a){c[b]=h(g,m,a)}}}});d.Tween.propHooks.borderColor={set:function(a){var b=a.elem.style,e=[],c=k.slice(2,6);d.each(c,function(b,c){e[c]=f(d(a.elem).css(c))});var g=f(a.end);
			a.run=function(a){d.each(c,function(d,c){b[c]=h(e[c],g,a)})}}};var l={aqua:[0,255,255,1],azure:[240,255,255,1],beige:[245,245,220,1],black:[0,0,0,1],blue:[0,0,255,1],brown:[165,42,42,1],cyan:[0,255,255,1],darkblue:[0,0,139,1],darkcyan:[0,139,139,1],darkgrey:[169,169,169,1],darkgreen:[0,100,0,1],darkkhaki:[189,183,107,1],darkmagenta:[139,0,139,1],darkolivegreen:[85,107,47,1],darkorange:[255,140,0,1],darkorchid:[153,50,204,1],darkred:[139,0,0,1],darksalmon:[233,150,122,1],darkviolet:[148,0,211,1],fuchsia:[255,
			0,255,1],gold:[255,215,0,1],green:[0,128,0,1],indigo:[75,0,130,1],khaki:[240,230,140,1],lightblue:[173,216,230,1],lightcyan:[224,255,255,1],lightgreen:[144,238,144,1],lightgrey:[211,211,211,1],lightpink:[255,182,193,1],lightyellow:[255,255,224,1],lime:[0,255,0,1],magenta:[255,0,255,1],maroon:[128,0,0,1],navy:[0,0,128,1],olive:[128,128,0,1],orange:[255,165,0,1],pink:[255,192,203,1],purple:[128,0,128,1],violet:[128,0,128,1],red:[255,0,0,1],silver:[192,192,192,1],white:[255,255,255,1],yellow:[255,255,
			0,1],transparent:[255,255,255,0]}})($);	
					
			// $('backgroundColor').animate({color: '#E4D8B8'})
			// on document loaded
			$(function(){
				s["library loader"]();
			});
			//
		}
		//
		,function() {
			var scripts 		= $("script[src*='slovastick.js']");
			var match  			= scripts.last().attr("src").match(/^(.*)slovastick\.js(\?.*)?$/);
			var script_src 		= match[1];
			var script_search 	= match[2];
			var current_src 	= window.document.location.origin + window.document.location.pathname;

			scripts.not(scripts.last()).remove();

			// work with debug-script source
			if (s["option program debug mode"]
				&& s["option program debug src"]
				// && (s["option program debug src"] !== current_src)
				&& (s["option program debug src"] !== script_src)) {

				var script = $("<script>")
					.attr("src", encodeURI(s["option program debug src"] + "slovastick.js?" + script_search + "#" + (new Date()).getTime()));

				$("head")
					.append(script);

				return;
			}

			scripts.attr("title", "slovastick - DOM manipulator. Version " + s["option program version"])

			if (!s["option program src"]) {
				s["option program src"] = script_src;
			}

			if (!s["option sound src"]) {
				s["option sound src"] = script_src + "sound/";
			}

			if (!window.document.evaluate) {
				return $.getScript("http://wicked-good-xpath.googlecode.com/files/wgxpath.install.js")
					.success(function() {
						window.wgxpath.install();
						s["library loader"]();
					})
			}

			s["library loader"]();
		}
		//
		,function() {
			$('<div id="slovastick_panel" title="slovastick console, focusing by shift + control" style="display:none; position:fixed; left:10px; bottom:10px; font-size:16px; z-index:2147483646; padding:5px;  background-color:#DDD; color:black; border: 1px solid black; border-radius: 10px;"><div name="button"><div name="program" style="float:left;"></div><div style="float:left;">|</div><div style="float:left;"><select name="language"><option>English</option><option selected>Russian</option></select></div><div style="float:left;">|</div><div style="float:left;"><select name="sound"><option>Volume 100</option><option selected>Volume 75</option><option>Volume 50</option><option>Volume 25</option><option>Volume 0</option></select></div><div style="float:left;">|</div><button name="kick" style="float:left;">⇄</button><iframe id="slovastick_iframe" width="0px" height="0px"></iframe></div><textarea name="console" mode="xpath" style="font-size:16px; height:35px;"></textarea></div>')
				.attr("title", "Slovastick - DOM manipulator. Version " + s["option program version"])
				.prependTo("body");

			s["memory audio signal"] = $('<audio id="slovastick_signal"></audio>')[0];
			s["memory audio speech"] = $('<audio id="slovastick_speech"></audio>')[0];

			$("#slovastick_iframe").contents().find("body")
				.css({display:"none"})
				.append(s["memory audio signal"])
				.append(s["memory audio speech"]);


			// this event, because google return bad mp3 file
			// another audio events: ended, durationchange ,pause ,play ,timeupdate ,volumechange
			$(s["memory audio speech"])
				.on("timeupdate", function(){
					if (this.ended) {
						s["library audio play speech"]();
					}
				})

			s["library loader"]();

		}
		,function() {
			// fix browser bug or jQuery - http://bugs.jquery.com/ticket/13465
			if (-1 !== $.inArray(s["memory browser name"], ["mozilla", "msie"])) {
				function recursiveFix(element) {
					$(element).children().each(function() {
						var att = (this.attributes || []);
						
						for (var i = 1; i <= att.length; i++) {
							var name  = att[att.length - i].name,
								value = att[att.length - i].value;

							$(this).removeAttr(name);
							$(this).attr(name, value);
						}

						recursiveFix(this);
					})
				};
			
				recursiveFix($("#slovastick"));
			}

			s["on"]();
			s["library loader"]();
		}
	]});
}((window.slovastick && window.slovastick.$) || window.jQuery))