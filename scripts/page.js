angular.module('cssHandles').directive('page', ['$document', 'DataService', '$rootScope', function($document, DataService, $rootScope){
	return {
		restrict: 'E',
		templateUrl: 'frame.html',
		scope: {
			source: '@',
			//onSelect: '=',
			onLoad: '=',
			onScroll: '=',
			pannable: '=',
			html: '=',
			css: '=',
		},
		link: function($scope, element, attr, ctrl) {
			this.$page = element.find('#page');
			var page = this.$page[0];
			this.window = page.contentWindow;
			this.doc = page.contentWindow.document;
			DataService.doc(this.doc);
			this.$doc = $(doc);
			this.sheetsDict = {};
			var that = this;
			
			$scope.$on('cssChange', function(event, sheet, change) {
				var $el = that.$doc.find('#'+sheet.sheet.elementId);
				$el.text(sheet.editor.getValue());
				$scope.$emit('cssChangeAfter', sheet, change);
			});
			
			$scope.$watch('html', function(newHtml, oldHtml) {
				var doc = that.doc;
				doc.open();
				doc.write(newHtml);
				doc.close();
				that.$doc.find('body').click(function(event) {
					//$scope.onSelect(event.target);
					DataService.select(event.target);
					
				}).mouseover(function(event) {
					$(event.target).css('outline', 'dashed 1px rgba(0, 173, 239, 0.5)');
					
				}).mouseout(function(event) {
					$(event.target).css('outline', '');
				});
			});
			
			// called at first page load and whenever html is changed
			this.$page.load(function() {
				angular.forEach($scope.sheets, function(sheet) {
					that.sheetsDict[sheet.href] = sheet;
				});
				
				that.replaceStyleSheets();
				
				that.$page[0].contentWindow.onscroll = function(event) {
					$scope.onScroll(event);
				};
				
				$(page.contentWindow).resize(function(evt) {
					$rootScope.$broadcast('pageResize', that.doc);
				});
				
				$rootScope.$broadcast('pageLoaded', that.doc);
			});
			
			this.replaceStyleSheets = function() {
				var sheetNum = that.doc.styleSheets.length;
				var sheetsLoaded = 0;
				that.sheets = [];
				angular.forEach(doc.styleSheets, function(styleSheet, index) {
					var href = styleSheet.href;
					var sheet = that.sheetsDict[href];
					var styleId = 'styleSheet' + index;
					if (sheet != undefined) {
						sheet.elementId = styleId;
						that.sheets.push(sheet);
						that.replaceStyleNode(styleSheet.ownerNode, styleId, sheet.text);
						sheetsLoaded++;
						
						if (sheetsLoaded == sheetNum) {
							$scope.onLoad(that.sheets);
						}
						
					} else {
						$.get(href, function(data) {
							that.replaceStyleNode(styleSheet.ownerNode, styleId, data);
							var hrefParts = href.split('/');
							var sheet = {
								filename: hrefParts[hrefParts.length-1],
								href: href,
								text: data,
								elementId: styleId
							};
							that.sheets.push(sheet);
							that.sheetsDict[href] = sheet;
							sheetsLoaded++;
							
							if (sheetsLoaded == sheetNum) {
								$scope.onLoad(that.sheets);
							}
						});
					}
				});
			};
			
			this.replaceStyleNode = function(sheetElement, styleId, data) {
				var element = $('<style type="text/css" id="'+styleId+'">'+data+'</style>');
				$(sheetElement).after(element).remove();
			};
		},
	};
}])