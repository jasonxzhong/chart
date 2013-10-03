App.directive('chart', function(){
    return{
        restrict: 'EA',
		// note: have to use the '=' operator to get any parameters passed back to parent function
		scope: {data:"=", chartname:"@", showOverview:"@", options:"=", min:"=", max:"=", hoverdata:"=", clickfunc:'=', hoverfunc:'='},
		template: 
		"<div>" + 
			"<div chart-type='main' class='chart'></div>" + 
			"<div  ng-show='showOverview' style='float:left;margin-left:20px'>" + 
				"<div chart-type='overview' style='width:800px;height:100px'></div>" + 			 
				"<p id='overviewLegend' style='margin-left:10px'></p>"+
			"</div>" +
		"</div>",
		replace: true,
        link: function(scope, elem, attrs){
            var chartElem = elem.children("[chart-type='main']");
			var chartOverview = elem.find("[chart-type='overview']");
            var chart = null;
			var overview = null;
			  
             
			var data = scope[data];
			
			var options = scope.options;
			
			chartElem.bind("plotclick", scope.clickfunc);
			chartElem.bind("plothover", scope.hoverfunc);
			
			//construct the overview window
			
			var overviewId = elem.id + "-overview";
			/*
			elem.html = "<div style='float:left;margin-left:20px'><div id='" + overviewId 
			+ " style='width:800px;height:100px'></div><p id='" + overviewId + "-overviewLegend' style='margin-left:10px'></p></div>";
			*/
				
			chartElem.bind("plotselected", function (event, ranges) {
				console.log("Selection:" + new Date(ranges.xaxis.from).toLocaleTimeString() + "," + new Date(ranges.xaxis.to).toLocaleTimeString());
								selectFrom = ranges.xaxis.from;
				selectTo = ranges.xaxis.to;
				// adjust chart axis min/max to relect selection
				chart.getOptions().xaxes[0].min = ranges.xaxis.from;
				chart.getOptions().xaxes[0].max = ranges.xaxis.to;
				
                chart.draw();
				chart.clearSelection();
				displayAlert(chart, true);				
				
			});
			
			var selectFrom = new Date();
			var selectTo = new Date();
			
			// link the selection in overview to the main chart
			chartOverview.bind("plotselected", function (event, ranges) {
				//chart.setSelection(ranges);
				//console.log("3: ranges.from= "+ new Date(ranges.xaxis.from).toLocaleTimeString() + ", selectFrom= " + new Date(selectFrom).toLocaleTimeString());
				selectFrom = ranges.xaxis.from;
				selectTo = ranges.xaxis.to;
				// adjust chart axis min/max to relect selection
				chart.getOptions().xaxes[0].min = ranges.xaxis.from;
				chart.getOptions().xaxes[0].max = ranges.xaxis.to;
				

				//chart.setData(v);
                //chart.setupGrid();
                chart.draw();
				displayAlert(chart, true);				

			});
            
            // If the data changes somehow, update it in the chart
			// set the 3rd parameter of watch to true to check for object equality (not reference)
            scope.$watch('data', function(v){
				//console.log("Draw");
                 if(!chart){
                    chart = $.plot(chartElem, v , options);
                    chartElem.show();
                }else{
					//console.log("min=" + scope.min + ", max =" + scope.max);
					//chart.getOptions().xaxes[0].min = scope.min;
					// set the time axis max so the current data is displayed at the right border
					
					//chart.getOptions().xaxes[0].max = new Date();
                    chart.setData(v);
                    chart.setupGrid();
                    chart.draw();
					displayAlert(chart, true);
                }
				
				
				 // setup overview
				 if (!overview) {
					overview = $.plot(chartOverview, v, {
						legend: { show: true, container: $("#overviewLegend") },
						series: {
							lines: { show: true, lineWidth: 1 },
							//points: {show: false},
							shadowSize: 0
						},
						xaxis: { mode: "time",
								timezone: "browser",
								timeformat: "%H:%M:%S",
								tickSize: [30, "second"]
								/*
								tickFormatter: function (val, axis) {
									return new Date(val).toLocaleTimeString();
								}*/
						},
						yaxes: [ { ticks: 3, min:0, max:100}, 
						{ticks: 3, min:0, max:100, position: "right", min: 0 } ],
						grid: { color: "#999" },
						selection: { mode: "x", color: "yellow" }
					});
					} else {
						overview.getOptions().xaxes[0].max = new Date();
						var opoint = [];
						opoint[0] = v[0].points.show;
						opoint[1] = v[1].points.show;
						v[0].points.show = false;
						v[1].points.show = false;
						overview.setData(v);
						overview.setupGrid();
						// by default the selection is sticky - auto-adjusted to the same
						// absolute position regardless if the time-axis has changed
						// move the selection as the time-axis moves
						var selection = overview.getSelection();
						if (selection != null) {
							//console.log("1: ranges.from= " + new Date(selection.xaxis.from).toLocaleTimeString() + ", selectFrom= " + new Date(selectFrom).toLocaleTimeString()  );
							// prevent select starting point to fall off the date range
							if (selectFrom < v[0].data[0][0]) {
							//console.log("3: " + new Date(selectFrom).toLocaleTimeString() + " < " + new Date(v[0].data[0][0]).toLocaleTimeString());
								selectFrom = v[0].data[0][0]
								}
							//console.log("4: ranges.from= " + new Date(selection.xaxis.from).toLocaleTimeString() + ", selectFrom= " + new Date(selectFrom).toLocaleTimeString());
							selection.xaxis.from = selectFrom;
							
							selection.xaxis.to = selectTo;
							overview.setSelection(selection);						
						}
						
						overview.draw();
						// restore the show settings so the main chart is drawn correctly 
						v[0].points.show = opoint[0];
						v[1].points.show = opoint[1];
						displayAlert(overview, false);
						
					}
            }, true);
			
			// simulate alerts
			var alerts = [];
			//var alertIndex = 0;
			var alertSize = 20;
			var nextAlertInterval = 3;
			var waitCount = 0;
			
			function displayAlert(plot, displayLabel) {
				// first determine the alerts
				waitCount ++;
				if (waitCount >= nextAlertInterval) {
					if (alerts.length >= alertSize) 
						alerts.shift();
					alerts.push(new Date()); // offset time so the alert won't fall off chart initially
					
					nextAlertInterval = Math.round(Math.random()*40) + 5; // schedule the next alert
					waitCount = 0;
				}
				
				for (var i = 0; i < alerts.length; i++ ) {
					var o = plot.pointOffset({ x: alerts[i], y: 90});
				
					drawOnCanvas(plot, o.left, o.top, displayLabel);
				}
			}
			
			
			function drawOnCanvas(chart, x, y, displayLabel) {
			
				// draw a little arrow on top of the last label to demonstrate
				// canvas drawing
				var ctx = chart.getCanvas().getContext("2d");
				ctx.fillStyle="#FF0000";
				ctx.fillRect(x,8,2, chart.height());
				
				// add text
				//elem.append('<div style="position:absolute;left:' + (x + 4) + 'px;top:' + y + 'px;color:#666;font-size:smaller">Warming up</div>');
				if (displayLabel) {
					ctx.font="14px Arial";
					ctx.fillText(" Alert",x,y);
					}

			}
        }
    };
});

