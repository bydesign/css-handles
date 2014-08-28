angular.module('cssHandles').directive('page', ['$document', 'DataService', function($document, DataService){
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
			this.doc = this.$page[0].contentWindow.document;
			this.$doc = $(doc);
			this.sheetsDict = {};
			var that = this;
			
			$scope.$watch('html', function(newHtml, oldHtml) {
				var doc = that.doc;
				doc.open();
				doc.write(newHtml);
				doc.close();
				that.$doc.find('body').click(function(event) {
					//$scope.onSelect(event.target);
					DataService.select(event.target);
				});
			});
			
			/*$scope.$watch('css', function(newSheets, oldSheets) {
				console.log(newSheets);
				console.log(oldSheets);
				angular.forEach(newSheets, function(sheet, index) {
					if (sheet != oldSheets[index]) {
						that.$doc.find('#'+sheet.elementId).html(sheet.text);
					}
				});
			});*/
			
			this.$page.load(function() {
				angular.forEach($scope.sheets, function(sheet) {
					that.sheetsDict[sheet.href] = sheet;
				});
				that.replaceStyleSheets();
				
				that.$page[0].contentWindow.onscroll = function(event) {
					$scope.onScroll(event);
				};
			});
			
			this.replaceStyleSheets = function() {
				var sheetNum = that.doc.styleSheets.length;
				var sheetsLoaded = 0;
				that.sheets = [];
				angular.forEach(doc.styleSheets, function(styleSheet) {
					var href = styleSheet.href;
					var sheet = that.sheetsDict[href];
					var styleId = 'styleSheet' + sheetsLoaded;
					if (sheet != undefined) {
						sheet.elementId = styleId;
						that.sheets.push(sheet);
						that.replaceStyleNode(styleSheet.ownerNode, styleId, sheet.text);
						sheetsLoaded++;
						
						if (sheetsLoaded == sheetNum) {
							$scope.onLoad(that.sheets);
							//$rootScope.$emit('loaded', ds.sheets);
							//DataService.loaded(that.sheets);
						}
						
					} else {
						$.get(href, function(data) {
							var hrefParts = href.split('/');
							var sheet = {
								filename: hrefParts[hrefParts.length-1],
								href: href,
								text: data,
								elementId: styleId
							};
							that.sheets.push(sheet);
							that.sheetsDict[href] = sheet;
							that.replaceStyleNode(styleSheet.ownerNode, styleId, data);
							sheetsLoaded++;
							
							if (sheetsLoaded == sheetNum) {
								$scope.onLoad(that.sheets);
								//DataService.loaded(that.sheets);
							}
						});
					}
				});
			};
			
			this.replaceStyleNode = function(sheetElement, styleId, data) {
				var element = $('<style type="text/css" id="'+styleId+'">'+data+'</style>');
				$(sheetElement).after(element).remove();
			};
			
			// track drag-n-drop
			/*var startX = 0, startY = 0, x = 0, y = 0, panX = 0, panY = 0;
			
			element.on('mousedown', function(event) {
				// Prevent default dragging of selected content
				event.preventDefault();
				panX = $scope.panX;
				panY = $scope.panY;
				startX = event.pageX;
				startY = event.pageY;
				$document.on('mousemove', mousemove);
				$document.on('mouseup', mouseup);
			});
			
			function mousemove(event) {
				y = event.pageY - startY;
				x = event.pageX - startX;
				$scope.panX = panX + x;
				$scope.panY = panY + y;
			}
			
			function mouseup() {
				$document.unbind('mousemove', mousemove);
				$document.unbind('mouseup', mouseup);
			}*/
		},
	};
}])