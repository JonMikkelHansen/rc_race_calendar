import { calculateHaversineDistance } from '../Utilities';
import { setMinY, setMaxY, setTrackpoints, setWaypoints } from '../redux/actions/GPXActions';
import store from '../redux/store'; 

const parseWaypoints = (xmlDoc) => {
    const waypoints = [];
    const wptElements = xmlDoc.getElementsByTagName('wpt');

    for (let i = 0; i < wptElements.length; i++) {
        const wpt = wptElements[i];
        const lat = parseFloat(wpt.getAttribute('lat'));
        const lon = parseFloat(wpt.getAttribute('lon'));
        const name = wpt.getElementsByTagName('name')[0]?.textContent || 'Unnamed Waypoint';
        const desc = wpt.getElementsByTagName('desc')[0]?.textContent;

        let waypoint = {
            latitude: lat,
            longitude: lon,
            name: name,
            description: desc,
            elevation: undefined,
            distanceFromStart: undefined
        };

        waypoints.push(waypoint);
    }

    return waypoints;
};

const calculateAverageElevation = (prevElevation, nextElevation) => {
    if (prevElevation != null && nextElevation != null) {
        return (prevElevation + nextElevation) / 2;
    }
    return null;
};

const parseTracks = (xmlDoc, waypoints) => {
    const tracks = [];
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    const trkElements = xmlDoc.getElementsByTagName('trk');

    for (let i = 0; i < trkElements.length; i++) {
        const trk = trkElements[i];
        const trksegs = trk.getElementsByTagName('trkseg');
        const segments = [];

        for (let j = 0; j < trksegs.length; j++) {
            const trkseg = trksegs[j];
            const trkpts = trkseg.getElementsByTagName('trkpt');
            const trackpoints = [];
            let segmentDistance = 0;
            let lastLat = null;
            let lastLon = null;

            for (let k = 0; k < trkpts.length; k++) {
                const trkpt = trkpts[k];
                const lat = parseFloat(trkpt.getAttribute('lat'));
                const lon = parseFloat(trkpt.getAttribute('lon'));
                let elevation = parseFloat(trkpt.getElementsByTagName('ele')[0]?.textContent);

                if (!isNaN(lat) && !isNaN(lon)) {
                    if (isNaN(elevation)) {
                        let prevElevation = k > 0 ? trackpoints[k - 1].elevation : null;
                        let nextElevation = null;
                        if (k + 1 < trkpts.length) {
                            nextElevation = parseFloat(trkpts[k + 1].getElementsByTagName('ele')[0]?.textContent);
                            if (isNaN(nextElevation)) {
                                nextElevation = null;
                            }
                        }
                        elevation = calculateAverageElevation(prevElevation, nextElevation);
                    }

                    if (lastLat !== null && lastLon !== null) {
                        segmentDistance += calculateHaversineDistance(lastLat, lastLon, lat, lon);
                    }

                    trackpoints.push({ 
                        latitude: lat, 
                        longitude: lon, 
                        elevation: elevation, 
                        distanceFromStart: segmentDistance,
                        isWaypoint: waypoints.some(wp => wp.latitude === lat && wp.longitude === lon)
                    });

                    lastLat = lat;
                    lastLon = lon;

                    if (elevation != null) {
                        minY = Math.min(minY, elevation);
                        maxY = Math.max(maxY, elevation);
                    }
                }
            }

            if (trackpoints.length > 0) {
                segments.push(trackpoints);
            }
        }

        if (segments.length > 0) {
            const name = trk.getElementsByTagName('name')[0]?.textContent || 'Unnamed Track';
            tracks.push({ name, segments });
        }
    }

    const allTrackpoints = tracks.flatMap(track => track.segments.flatMap(segment => segment));
    store.dispatch(setTrackpoints(allTrackpoints));
    store.dispatch(setMinY(Math.floor(minY / 100) * 100));
    store.dispatch(setMaxY(Math.ceil(maxY / 100) * 100));

    return { tracks, allTrackpoints };
};

export const parseStandardGPX = (xmlDoc) => {
    const waypoints = parseWaypoints(xmlDoc);
    const { tracks, allTrackpoints } = parseTracks(xmlDoc, waypoints);

    // Update waypoints with elevation and distance from trackpoints
    waypoints.forEach(wp => {
        const matchingTrackpoint = allTrackpoints.find(tp => tp.latitude === wp.latitude && tp.longitude === wp.longitude);
        if (matchingTrackpoint) {
            wp.elevation = matchingTrackpoint.elevation;
            wp.distanceFromStart = matchingTrackpoint.distanceFromStart;
        }
    });

    store.dispatch(setWaypoints(waypoints));
    return { waypoints, tracks };
};

export const parseCustomGPX = (xmlDoc) => {
    return parseStandardGPX(xmlDoc);
};
