// the handle directive only displays a handle
// and directs events to the dataService for action
// no data model logic should be performed inside this directive
angular.module('handle', []).directive('handle', function($document){
  return {
    restrict: 'E',
    templateUrl: 'handle.html',
    //transclude: true,
    scope: {
    	prop: '@',
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
			prop = $scope.prop, valWrapper;
			
		if (prop.indexOf(':') != -1) {
			var parts = prop.split(':');
			prop = parts[0];
			valWrapper = parts[1];
		}
		
		/*$scope.getRuleIndex = function() {
			return dataService.getRuleIndex(prop);
		}*/
		
		element.on('mouseover', function(event) {
			// call hover event for property
			$scope.$emit('handleMouseOver', $scope.prop);
		});
		
		element.on('mouseout', function(event) {
			// call hover event for property
			$scope.$emit('handleMouseOut', $scope.prop);
		});
		
		element.on('mousedown', function(event) {
			// Prevent default dragging of selected content
			event.preventDefault();
			startX = event.pageX;
			startY = event.pageY;
			$document.on('mousemove', mousemove);
			$document.on('mouseup', mouseup);
			element.toggleClass('dragging');
			//$scope.$emit('handleStartDrag', $scope.prop);
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
			//var change = dataService.proposePixelMove(prop, val, $scope.unit, $scope.allownegative, $scope.percentdenom, $scope.emdenom, valWrapper);
			//console.log(change);
			
			//$scope.$emit('styleModified', $scope.prop);
			
			// call received proposeValue function here
		}
		
		function mouseup() {
			$document.unbind('mousemove', mousemove);
			$document.unbind('mouseup', mouseup);
			element.toggleClass('dragging');
			//dataService.finalizePixelMove(prop);
			//$scope.$emit('handleStopDrag', $scope.prop);
			
			// call received finalizeValue function here
		}
    },
  };
});