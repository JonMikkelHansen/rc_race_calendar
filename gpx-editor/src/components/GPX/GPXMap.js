import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSelector } from 'react-redux';

mapboxgl.accessToken = 'pk.eyJ1Ijoiam9uaGFuc2VuIiwiYSI6ImNrdXF0cTBsazA2emkyb3A1YTQ4YmlyaXQifQ.FErbZ3mNRznm2BEDfpla_A';

const GPXMap = () => {
    const mapContainerRef = useRef(null);
    const trackpointGeoJSON = useSelector((state) => state.trackpointGeoJSON);
    const waypointGeoJSON = useSelector((state) => state.waypointGeoJSON);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/jonhansen/clu14zcjr00o701qw9sxd44ty', // Ensure this is a style that supports 3D terrain
            center: [0, 0],
            zoom: 2,
            pitch: 40, // Set the initial pitch
            bearing: 0, // Set the initial bearing to face north
        });

        map.on('load', () => {
            // Enable 3D terrain
            map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

            // Add a sky layer to enhance the 3D effect
            map.addLayer({
                'id': 'sky',
                'type': 'sky',
                'paint': {
                    'sky-type': 'atmosphere',
                    'sky-atmosphere-sun': [0.0, 0.0],
                    'sky-atmosphere-sun-intensity': 15
                }
            });

            if (trackpointGeoJSON && trackpointGeoJSON.features && trackpointGeoJSON.features.length > 0) {
                // Shadow layer
                const shadowGeoJSON = JSON.parse(JSON.stringify(trackpointGeoJSON)); // Deep clone to avoid mutating the original
                shadowGeoJSON.features = shadowGeoJSON.features.map(feature => ({
                    ...feature,
                    geometry: {
                        ...feature.geometry,
                        coordinates: feature.geometry.coordinates.map(([lng, lat]) => [lng + 0.005, lat - 0.005])
                    }
                }));

                // Adding the shadow layer
                map.addSource('track-shadow', { type: 'geojson', data: shadowGeoJSON });
                map.addLayer({
                    id: 'track-shadow',
                    type: 'line',
                    source: 'track-shadow',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': '#000000',
                        'line-width': 4,
                        'line-opacity': 0.5,
                    },
                });

                // Main track layer
                map.addSource('track', { type: 'geojson', data: trackpointGeoJSON });
                map.addLayer({
                    id: 'track',
                    type: 'line',
                    source: 'track',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': '#FFFFFF',
                        'line-width': 4,
                    },
                });

                // Fit map to track bounds
                const bounds = new mapboxgl.LngLatBounds();
                trackpointGeoJSON.features.forEach(feature => {
                    feature.geometry.coordinates.forEach(coord => {
                        bounds.extend(coord);
                    });
                });
                map.fitBounds(bounds, { padding: 20, duration: 0 });
                map.setPitch(40); // Ensure the pitch is set after fitting bounds
            }

            // Waypoints layer
            if (waypointGeoJSON && waypointGeoJSON.features && waypointGeoJSON.features.length > 0) {
                map.addSource('waypoints', { type: 'geojson', data: waypointGeoJSON });

                map.addLayer({
                    id: 'waypoints',
                    type: 'circle',
                    source: 'waypoints',
                    paint: {
                        'circle-radius': 5,
                        'circle-color': '#FFFFFF'
                    }
                });

                map.addLayer({
                    id: 'waypoint-labels',
                    type: 'symbol',
                    source: 'waypoints',
                    layout: {
                        'text-field': ['get', 'name'],
                        'text-size': 16,
                        'text-font': ['Arial Unicode MS Bold'],
                        'text-anchor': 'top',
                        'text-offset': [0, 1.5],
                        'symbol-placement': 'point'
                    },
                    paint: {
                        'text-color': '#FFFFFF',
                        'text-halo-color': 'rgba(0, 0, 0, 0)' // Remove the dark outline
                    }
                });
            }
        });

        // ResizeObserver for dynamic resizing
        const resizeObserver = new ResizeObserver(() => map.resize());
        resizeObserver.observe(mapContainerRef.current);

        // Cleanup
        return () => {
            map.remove();
            resizeObserver.disconnect();
        };
    }, [trackpointGeoJSON, waypointGeoJSON]);

    return <div ref={mapContainerRef} style={{ width: '100%', height: '0', paddingBottom: '56.25%', position: 'relative' }} />;
};

export default GPXMap;