// the handle directive only displays a handle
// and directs events to the dataService for action
// no data model logic should be performed inside this directive
angular.module('cssHandles').directive('handle', function($document, DataService){
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
    	allownegative: '=',
    	percentdenom: '=',
    	emdenom: '=',
    },
    link: function($scope, element, attr, ctrl) {
		// track drag-n-drop
		var startX = 0, startY = 0, x = 0, y = 0,
			prop = $scope.prop,
			fn = $scope.fn,
			valWrapper;
		
		element.on('mouseover', function(event) {
			// call hover event for property
			DataService.handleMouseOver(prop);
		});
		
		element.on('mouseout', function(event) {
			// call hover event for property
			DataService.handleMouseOut(prop, fn);
		});
		
		element.on('mousedown', function(event) {
			// Prevent default dragging of selected content
			event.preventDefault();
			startX = event.pageX;
			startY = event.pageY;
			$document.on('mousemove', mousemove);
			$document.on('mouseup', mouseup);
			element.toggleClass('dragging');
			DataService.handleStartDrag(prop, fn);
		});
		
		function mousemove(event) {
			y = event.pageY - startY;
			x = event.pageX - startX;
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
			
			var change = DataService.proposePixelMove(prop, val, $scope.unit, $scope.allownegative, $scope.percentdenom, $scope.emdenom, valWrapper);
		}
		
		function mouseup() {
			$document.unbind('mousemove', mousemove);
			$document.unbind('mouseup', mouseup);
			element.toggleClass('dragging');
			DataService.finalizePixelMove(prop);
		}
    },
  };
});