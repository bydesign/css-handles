// found at stackoverflow here:
// http://stackoverflow.com/questions/2044642/finding-out-what-line-number-an-element-in-the-dom-occurs-on-in-javascript
// file at this location:
// http://rvandam.com/line_numbers/jquery.line_numbers.js

(function($) {

    // private variables
    var raw_source;
    var clean_lines;

    // strip out text that could cause false matches
    function get_clean_lines() {
        var lines = raw_source.split(/\r?\n/);

        // now sanitize the raw html so you don't get false hits in code or comments
        var inside = false;
        var tag = '';
        var closing = {
            xmp: '<\\/\\s*xmp\\s*>',
            script: '<\\/\\s*script\\s*>',
            '!--': '-->'
        };
        clean_lines = $.map(lines, function(line) {
            if (inside && line.match(closing[tag])) {
                var re = new RegExp('.*(' + closing[tag] + ')', 'i');
                line = line.replace(re, "$1");
                inside = false;
            } else if (inside) {
                line = '';
            }

            if (line.match(/<(script|!--)/)) {
                tag = RegExp.$1;
                line = line.replace(/<(script|xmp|!--)[^>]*.*(<(\/(script|xmp)|--)?>)/i, "<$1>$2");
                var re = new RegExp(closing[tag], 'i');
                inside = ! (re).test(line);
            }

            // remove quoted strings, because they might have false positive tag matches (like '<span>')
            line = line.replace(/(["'])(?:[^\\\1]|\\.)*\1/, '$1unsafe_string$1');

            return line;
        });
    }

    // although this is worst case M nodes x N lines of source code (since it walks the source for each node)
    // it has better average case performance because it can short circuit quickly
    // once each node is found
    function line_numbers(nodes) {
        return $.map(nodes, line_number);
    }

    // walks the source code to find the desired node
    // does this by finding where the desired node is in sequence with all other nodes of the same tag
    // then (somewhat naively) counts such tags until it finds that many instances of the tag
    // require source to be scrubbed of potential false positives (see clean_lines())

    // FIXME: will fail if any tags of the same type have been added to the page, probably need to make a copy in an iframe and compare that instead
    function line_number(node) {
        var tag = $(node).attr('tagName');
        var all_tags = $(tag);
        var index = all_tags.index(node) + 1;

        var num_tags_found = 0;
        for (var row = 0; row < clean_lines.length; row++) {
            var re = new RegExp('<' + tag, 'gi');
            var matches = clean_lines[row].match(re);
            if (matches && matches.length) {
                num_tags_found += matches.length;
                if (num_tags_found >= index) {
                    return row;
                }
            }
        }
    }

    // finally, the actual public method
    // uses a callback if given, otherwise returns immediately
    // (which requires a synchronous ajax call on the first usage)
    $.fn.line_numbers = function(callback) {
        var use_callback = typeof callback != 'undefined';
        if (raw_source) {
            var nums = line_numbers(this);
            if (use_callback)
                callback(nums);
            else
                return nums;
        } else {
            var nodes = this;
            $.ajax({
                async: use_callback,
                url: location.href,
                type: 'get',
                dataType: 'text',
                success: function(data) {
                    raw_source = data;
                    get_clean_lines();
                    if (use_callback) callback(line_numbers(nodes));
                }
            });
            if (! use_callback) return line_numbers(nodes);
        }
    };

    // public getter for the fetched source code
    $.source = function(callback) {
        var use_callback = typeof callback != 'undefined';

        // abuses the fact that calling $.fn.line_numbers without setting 'this' will just set source
        if (use_callback) {
            $.fn.line_numbers(function() { callback(raw_source); });
        } else {
            $.fn.line_numbers;
            return raw_source;
        }
    }

})(jQuery);
