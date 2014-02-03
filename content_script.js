$('body').prepend('<div class="handles-root" id="handles-root">custom content {{"angular running"}}</div>');


angular.module('handles', []);
var rootElement = $('#handles-root')[0];
angular.bootstrap(rootElement, ['handles']);

chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
	console.log(response.farewell);
	$('body').prepend(response.farewell)
});

$('body').click(function(evt) {
	evt.preventDefault();
	var el = evt.target;
	var rules = document.defaultView.getMatchedCSSRules(el, '');
	chrome.runtime.sendMessage({greeting: "hi"}, function(response) {
		console.log(el);
		console.log(rules);
		$('body').prepend(response.farewell)
	});
});


//        this method gets the browser's list of matched rules
//        and returns corresponding internal rules
//        it also selects a rule if the selected rule
//        doesn't apply to the selected element
var getElementRules = function(el) {
        //var matchRules = el.ownerDocument.defaultView.getMatchedCSSRules(el, '');
        var matchRules = document.defaultView.getMatchedCSSRules(el, '');
        if (matchRules == null) return [];
        var rules = [];
        //var hasSelected = false;
        for (var i=0, len=matchRules.length; i<len; i++) {
                var rule = this.getRuleBySelector(matchRules[i].selectorText);
                rules.push(rule);
                //if (rule.id == this.selectedRule) hasSelected = true;
        }
        //if (!hasSelected) this.selectRule(rules[rules.length-1].id);
        return rules;
};

//angular.element(document).ready(function() {});