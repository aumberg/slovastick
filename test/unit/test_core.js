test("slovastick.lib.key", function() {
	slovastick.log(slovastick)
	var ele = slovastick.lib.ele({});
	deepEqual(ele, 		ele.key("first", "val"));
	deepEqual(ele, 		ele.key({"key": "second", "value": "val2", "and some": "thatsup"}));
	deepEqual(ele, 		ele.key("third", "val3"));
	strictEqual(3, 		ele.key().length);
	strictEqual("val", 	ele.key("first").value);
	strictEqual(0, 		ele.key("first").index);
	deepEqual(ele, 		ele.key("first", "val2"));
	strictEqual("val2", ele.key("first").value);
	strictEqual(2, 		ele.key("first").index);
	deepEqual(ele, 		ele.key("third", null));
	strictEqual(2, 		ele.key().length);
	deepEqual({}, 		ele.key("four"));
	deepEqual(ele, 		ele.key(null));
	strictEqual(0, 		ele.key().length);
	throws(function(){
		ele.key(function(){});
	});
	throws(function(){
		ele.key({});
	});
});

test("slovastick.lib.masEle", function() {
	var masEle = slovastick.lib.masEle([$("<div>"), $("<p>")]);
	deepEqual(masEle, 		masEle.key([
		{"key": "first", "value": "val", "and some": "thatsup"}, 
		{"key": "second", "value": "e"}])
	);
	strictEqual("thatsup", 	masEle[0].key("first")["and some"]);
	deepEqual(masEle, 		masEle.key("first", "val2"));
	strictEqual("val2", 	masEle[0].key("first").value);
	strictEqual(1, 			masEle[1].key("first").index);
	strictEqual("e", 		masEle[1].key("second").value);
	throws(function() {
		masEle.key([{"key": "second", "value": "val2"}, "test"]);
	});
});

test("slovastick.run", function() {
	var m = slovastick.lib.masEle([$("<div s-url='http://vk.com'>"), $("<p>")]) //.run();
	ok(true);
});