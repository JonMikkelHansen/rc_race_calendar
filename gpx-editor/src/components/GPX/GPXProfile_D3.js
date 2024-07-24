import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { calculateHaversineDistance } from '../../Utilities.js';
import GPXChartControls from './GPXChartControls.js';

const GPXProfile_D3 = () => {
  const svgRef = useRef();
  const trackpointGeoJSON = useSelector(state => state.trackpointGeoJSON);
  const minY = useSelector(state => state.minY);
  const maxY = useSelector(state => state.maxY);

  useEffect(() => {
    if (!trackpointGeoJSON || !trackpointGeoJSON.features.length) {
      console.log('No trackpointGeoJSON data available');
      return;
    }

    const coordinates = trackpointGeoJSON.features[0].geometry.coordinates;
    let cumulativeDistance = 0;
    const features = coordinates.map(([lon, lat, elevation], index) => {
      if (index > 0) {
        const [lon1, lat1] = coordinates[index - 1];
        cumulativeDistance += calculateHaversineDistance(lat1, lon1, lat, lon) / 1000; // Convert meters to kilometers
      }
      return {
        distanceFromStart: cumulativeDistance,
        elevation
      };
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 50, bottom: 30, left: 40 };

    const x = d3.scaleLinear()
      .domain([0, d3.max(features, d => d.distanceFromStart)])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([minY, maxY])
      .range([height - margin.bottom, margin.top]);

    const area = d3.area()
      .x(d => x(d.distanceFromStart))
      .y0(height - margin.bottom)
      .y1(d => y(d.elevation))
      .curve(d3.curveMonotoneX);

    const stretchedArea = d3.area()
      .x(d => x(d.distanceFromStart * 1.02))  // Apply a slight stretch by multiplying distance
      .y0(height - margin.bottom)
      .y1(d => y(d.elevation))
      .curve(d3.curveMonotoneX);

    // Define clipping path to restrict elements to the axis area
    svg.append("defs").append("clipPath")
      .attr("id", "chart-area")
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom);

    // Background rectangle
    svg.append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom)
      .attr('fill', '#050111');

    // Depth effect shadow
    svg.append('path')
      .datum(features)
      .attr('fill', '#898D8F')
      .attr('clip-path', 'url(#chart-area)')
      .attr('d', stretchedArea)
      .attr('transform', 'translate(-5, -5)');

    // Main graph fill
    svg.append('path')
      .datum(features)
      .attr('fill', '#6E7375')
      .attr('clip-path', 'url(#chart-area)')
      .attr('d', area);

    // Main graph line
    svg.append('path')
      .datum(features)
      .attr('fill', 'none')
      .attr('stroke', '#6E7375')
      .attr('stroke-width', 1.5)
      .attr('clip-path', 'url(#chart-area)')
      .attr('d', area.lineY1());

    // Axes
    const maxDistance = d3.max(features, d => d.distanceFromStart);
    const tickValues = x.ticks().concat(maxDistance);
    
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x)
        .tickValues(tickValues)
        .tickFormat(d => `${d.toFixed(2)} km`)
        .tickSizeOuter(0));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

  }, [trackpointGeoJSON, minY, maxY]);

  return (
    <div>
      <svg ref={svgRef} width={800} height={400}></svg>
      <GPXChartControls />
    </div>
  );
};

export default GPXProfile_D3;
