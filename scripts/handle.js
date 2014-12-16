// the handle directive only displays a handle
// and directs events to the dataService for action
// no data model logic should be performed inside this directive
angular.module('cssHandles').directive('handle', function($document, DataService, $rootScope){
  return {
    restrict: 'E',
    templateUrl: 'handle.html',
    scope: {
    	prop: '@',
    	fn: '@',
    	dir: '@',
    	unit: '@',
    	posx: '@',
    	posy: '@',
    	onMove: '@',
    	scopeFn: '=',
    	allownegative: '=',
    	percentdenom: '=',
    	emdenom: '=',
    	snapValue: '=',
    },
    link: function($scope, element, attr, ctrl) {
		// track drag-n-drop
		var startX = 0, startY = 0, x = 0, y = 0, 
			lastX = 0, lastY = 0, startSnap = 0, zoomAmt = 1,
			prop = $scope.prop,
			fn = $scope.fn,
			valWrapper;
		
		element.on('mouseover', function(event) {
			// call hover event for property
			if ($scope.scopeFn == undefined) {
				DataService.handleMouseOver(prop);
			}
			
		});
		
		element.on('mouseout', function(event) {
			// call hover event for property
			if ($scope.scopeFn == undefined) {
				DataService.handleMouseOut(prop, fn);
			}
		});
		
		element.on('mousedown', function(event) {
			// Prevent default dragging of selected content
			event.preventDefault();
			startX = event.pageX;
			startY = event.pageY;
			lastX = event.pageX;
			lastY = event.pageY;
			zoomAmt = $rootScope.zoomAmount;
			startSnap = $scope.snapValue * zoomAmt;
			$document.on('mousemove', mousemove);
			$document.on('mouseup', mouseup);
			element.toggleClass('dragging');
			
			if ($scope.scopeFn == undefined) {
				DataService.handleStartDrag(prop, fn, $scope.unit);
			}
			$rootScope.$broadcast('handleStartDrag', prop);
		});
		
		function mousemove(event) {
			moveX = event.pageX - lastX;
			y = event.pageY - startY;
			x = event.pageX - startX;
			var gridLineHeight = $rootScope.gridLineHeight * zoomAmt;
			//console.log(gridLineHeight);
			var snapThreshold = gridLineHeight / 3;
			if (snapThreshold > 10) {
				snapThreshold = 10;
			}
			var globalY = startSnap + y;
			//console.log(globalY);
			var denom = globalY % gridLineHeight;
			//console.log(denom);
			if (denom <= snapThreshold) {
				y -= denom;
			
			} else if (denom >= gridLineHeight-snapThreshold) {
				y += gridLineHeight - denom;
			}
			
			var dir = $scope.dir;
			if (dir.indexOf('horiz') != -1) {
				val = x;
			} else if (dir == 'diagL' || dir == 'diagR') {
				val = y;
			} else if (dir == 'both') {
				
			} else {
				val = y;
			}
			if (dir.charAt(0) == '-') {
				val = -val;
			}
			lastX = event.pageX;
			lastY = event.pageY;
			
			if ($scope.scopeFn == undefined) {
				var change = DataService.proposePixelMove(prop, fn, val, $scope.allownegative, $scope.percentdenom, $scope.emdenom, valWrapper, $scope.unit);
			
			} else {
				$scope.scopeFn(prop, moveX);
			}
		}
		
		function mouseup() {
			$document.unbind('mousemove', mousemove);
			$document.unbind('mouseup', mouseup);
			element.toggleClass('dragging');
			
			if ($scope.scopeFn == undefined) {
				DataService.finalizePixelMove(prop, fn);
			}
			$rootScope.$broadcast('handleStopDrag', prop);
		}
    },
  };
});