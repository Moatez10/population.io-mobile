(function () {
  'use strict';

  angular.module('populationioApp')
    .directive('storyLine', function ($filter, StoryService) {

      var highlightStoryLine = function (node) {
        var translate = d3.select(node).attr('data-transform');
        node.parentNode.appendChild(node);
        d3.select(node)
          .classed('highlight', true)
          .transition()
          .attr({
            'transform': translate + ' scale(2.0)'
          });
      };

      var removeHighlightStoryLine = function (node) {
        var translate = d3.select(node).attr('data-transform');
        d3.select(node)
          .classed('highlight', false)
          .transition()
          .attr({
            'transform': translate + ' scale(1.0)'
          });
      };

      return {
        restrict: 'E',
        controller: function ($scope) {
          $scope.highlightStoryLine = function (year, highlight) {
            console.log(year)
            var node = d3.select('.dot[data-id="' + year + '"]')[0][0];

            if (highlight) {
              highlightStoryLine(node);
            } else {
              removeHighlightStoryLine(node);
            }

            $scope.$emit('highlightStoryLine', year, highlight);
          };
        },
        link: function ($scope, element) {
          var width = element.parent().width(),
            height = 450,
            yearMax = 100,
            yearMin = 0;

          var data = StoryService.getData();

          for (var i = 0; i < data.length; i += 1) {
            data[i].year = parseInt($filter('date')(data[i].tstamp, 'yyyy'), 0);
          }

          var _getTodayLength = function (data) {
            for (var i = 0; i < data.length; i += 1) {
              if (data[i].now) {
                return scale(_getYear(data[i]));
              }
            }
            return null;
          };

          var _getYear = function (d) {
            var zero = 0;
            for (var i = 0; i < data.length; i += 1) {
              if (data[i].born) {
                zero = data[i].year;
              }
            }
            return d.year - zero;
          };

          var _getEventCount = function (year) {
            var count = 0;
            for (var i = 0; i < data.length; i += 1) {
              if (data[i].year === year) {
                count += 1;
              }
            }
            return count;
          };

          var root = d3.select(element[0])
            .append('svg')
            .attr({width: width, height: height})
            .append('g')
            .attr({transform: 'translate(0,0)'});

          var bezierCurve = [
            'M123,408c0,0,171.107,0,244,0s80.128-80,0-80s-252.637,0-309,0s-61.758-81',
            ',0-81s239.45,0,310,0s71.732-80,0-80s-241.543,0-311,0s-70.812-81,0-81s2',
            '39.121,0,310,0s74.088-80,0-80S122,6,122,6'
          ].join('');

          var path = root.append('path')
            .attr({
              class: 'line',
              d: bezierCurve
            });

          var pathNode = path.node();

          var scale = d3.scale.linear()
            .domain([yearMin, yearMax])
            .range([0, pathNode.getTotalLength()]);

          var pathOverlayLine = d3.svg.line()
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; })
            .interpolate('basis');

          var pathOverlayData = [];
          var todayLength = _getTodayLength(data);

          for (var j = 0; j < todayLength; j += 20) {
            pathOverlayData.push(pathNode.getPointAtLength(j));
          }
          pathOverlayData.push(pathNode.getPointAtLength(todayLength));

          root.append('path')
            .attr({
              class: 'line highlight',
              d: pathOverlayLine(pathOverlayData)
            });
          root.append('path')
            .attr({
              class: 'line small',
              d: pathOverlayLine(pathOverlayData)
            });

          var dot = root
            .selectAll('.dot')
            .data(function () {
              var years = [],
                filteredData = [];

              for (var i = 0; i < data.length; i += 1) {
                if (years.indexOf(data[i].year) === -1) {
                  filteredData.push(data[i]);
                  years.push(data[i].year);
                }
              }

              return filteredData;
            })
            .enter()
            .append('g')
            .attr({
              'data-id': function (d) {
                return d.year;
              },
              class: 'dot',
              transform: function (d) {
                var pos = pathNode.getPointAtLength(scale(_getYear(d)));
                return 'translate(' + [ pos.x, pos.y ] + ')';
              },
              'data-transform': function () {
                return d3.select(this).attr('transform');
              }
            })
            .on('mouseover', function (d) {
              highlightStoryLine(this);
              $scope.$emit('highlightStoryLine', d.year, true);
            })
            .on('mouseout', function (d) {
              removeHighlightStoryLine(this);
              $scope.$emit('highlightStoryLine', d.year, false);
            });

          dot.append('circle')
            .attr({
              r: function (d) {
                return _getEventCount(d.year) > 1 ? 15 : 6;
              }
            });

          dot.append('text')
            .text(function (d) {
              var count = _getEventCount(d.year);
              if (count > 1) {
                return count;
              }
            })
            .attr({
              'text-anchor': 'middle'
            });
        }
      };
    });

}());