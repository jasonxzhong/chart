var App = angular.module('chartApp', []);

App.controller('chartSampleController', function($scope, $timeout){
	console.log("in controller");
    
    var daftPoints = [[0, 4]],
	    punkPoints = [[1, 20]];
    
		$scope.options = {
			  xaxis: {
				show: true, 
				mode: "time",
				timezone: "browser",
				timeformat: "%H:%M:%S",
				tickSize: [5, "second"]	// tickSize controls density of the ticks
				
				/*
				tickFormatter: function (val, axis) {
					return new Date(val).toLocaleTimeString();
					}, */
				},
			  //yaxis: {show: true, min:0, max:100},
			  yaxes: [ { show: true, min:0, max:100}, {show: true, min:0, max:100, position: "right", min: 0 } ],
			  selection: { mode: "x", color: "yellow" },
                series: {
					lines: { show: true, fill: false, lineWidth: 6, shadowSize:6 },
					points: { show: true }
				},
				
			grid: {
                  labelMargin: 10,
                  //backgroundColor: '#e2e6e9',
                  color: '#000000',
                  borderColor: null,
				  clickable: true,
				  hoverable: true
                },
			//selection: { mode: "x" }
             };

	$scope.showCPU = true;
	$scope.showMemory = true;
	
	$scope.changeSeries = function () {
		console.log("in changeSeries");
		$scope.data[0].lines.show = $scope.showCPU;
		$scope.data[0].points.show = $scope.showCPU;
		
		$scope.data[1].lines.show = $scope.showMemory;
		$scope.data[1].points.show = $scope.showMemory;
	};
 
    $scope.data = [ 
		{ label: "CPU", color: '#ff6800', lines: {show:$scope.showCPU}, points: {show: $scope.showCPU},
			clickable: true, hoverable: true,
		data: [ ] },
		{ label: "MEMORY", color: '#a0a700', lines: {show:$scope.showMemory }, points: {show: $scope.showMemory},
		yaxis: 2, clickable: true, hoverable: true,
		data: [ ]}
	];
	
	$scope.delay = function() {
		$timeout(function(){
			//console.log('2 second delay');
			$scope.updateData($scope.data);
			$scope.delay();
			}, 2000);		
		}
	
	$scope.sampleSize = 100;
	$scope.sampleInterval = 2; // seconds
	$scope.numberOfSamples = 2;
	$scope.min=0;
	$scope.max=110;
	
	$scope.initData = function(data) {
		$scope.sampleTime = (new Date()).getTime() - 1000 * $scope.sampleInterval * $scope.sampleSize;
		for (var s = 0; s < $scope.numberOfSamples; s++) {
			data[s].data = [];
		}
		for (var t =0; t < $scope.sampleSize;  t++) {
			for (var s = 0; s < $scope.numberOfSamples; s++) {
				var sData = data[s].data;
				sData.push([new Date($scope.sampleTime), null]);
				$scope.sampleTime += 1000 * $scope.sampleInterval;
			}
			
		}

	};
	// initialize hover data
	$scope.hoverdata={};
	
	$scope.initData($scope.data);
		
	$scope.updateData = function(data) {
		var newTime = new Date();
		for (var s = 0; s < $scope.numberOfSamples; s++) {
			var sData = data[s].data;
			var newSample = Math.round(Math.random()*80) + 20;
			if (sData.length < $scope.sampleSize) 
				sData.push([newTime, newSample]);
			else {
				sData.shift();
				sData.push([newTime, newSample]);				
			}			
		}
		//$scope.sampleTime++;
		//$scope.$apply();
		
	}
	$scope.delay();
	
	
	$scope.hover = function(event, pos, item) {
		//console.log("Hover");
		var msg = "You hovered at " + pos.x + ", " + pos.y;
		if (item) {
			//highlight(item.series, item.datapoint);
			msg += ", Nearby datapoint = (" + item.datapoint + "), data series = " + item.seriesIndex;
			console.log(msg);
		}
	}
	
	$scope.plotclick = function(event, pos, item) {
		if (item != null)
			console.log("clicked datapoint = (" + new Date(item.datapoint[0]).toLocaleTimeString() + "," + item.datapoint[1] +"), data series = " + item.seriesIndex);
		
	}
    
   
})
