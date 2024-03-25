import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSelector } from 'react-redux';

mapboxgl.accessToken = 'pk.eyJ1Ijoiam9uaGFuc2VuIiwiYSI6ImNrdXF0cTBsazA2emkyb3A1YTQ4YmlyaXQifQ.FErbZ3mNRznm2BEDfpla_A';

const GPXMap = () => {
    const mapContainerRef = useRef(null);
    const trackpoints = useSelector((state) => state.trackpoints);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/jonhansen/clu14zcjr00o701qw9sxd44ty', // Ensure this is a style that supports 3D terrain
            center: [0, 0],
            zoom: 2,
            pitch: 70, // Set the initial pitch
            bearing: 0, // Set the initial bearing to face north
        });

        const resizeMap = () => map.resize();

        map.on('load', () => {
            resizeMap();

            // Enable 3D terrain
            map.setTerrain({ 'source': 'mapbox.mapbox-terrain-dem-v1', 'exaggeration': 1.5 });

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

            // Check if trackpoints are available
            if (trackpoints.length > 0) {
                const geojsonData = {
                    type: "FeatureCollection",
                    features: [{
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: trackpoints.map(tp => [tp.longitude, tp.latitude]),
                        },
                    }],
                };

                // Process for shadow layer
                const offsetShadow = geojsonData.features.map(feature => ({
                    ...feature,
                    geometry: {
                        ...feature.geometry,
                        coordinates: feature.geometry.coordinates.map(([lng, lat]) => [lng + 0.005, lat - 0.005]),
                    }
                }));

                // Adding shadow as a layer
                map.addSource('track-shadow', { type: 'geojson', data: { ...geojsonData, features: offsetShadow } });
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

                // Adding the main track layer
                map.addSource('track', { type: 'geojson', data: geojsonData });
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

                // Calculate and fit map bounds to trackpoints
                const bounds = new mapboxgl.LngLatBounds();
                trackpoints.forEach(tp => bounds.extend(new mapboxgl.LngLat(tp.longitude, tp.latitude)));
                map.fitBounds(bounds, { padding: 20, pitch: 70, duration: 0 });

                // Adjust pitch and bearing after fitBounds completes
                map.once('moveend', () => {
                    map.easeTo({ pitch: 70, bearing: 0 });
                });
            }
        });

        // Setup ResizeObserver for map container resizing
        const resizeObserver = new ResizeObserver(() => resizeMap());
        resizeObserver.observe(mapContainerRef.current);

        // Cleanup on unmount
        return () => {
            if (map) map.remove();
            resizeObserver.unobserve(mapContainerRef.current);
        };
    }, [trackpoints]);

    return <div ref={mapContainerRef} style={{ width: '100%', height: '0', paddingBottom: '56.25%', position: 'relative' }} />;
};

export default GPXMap;
