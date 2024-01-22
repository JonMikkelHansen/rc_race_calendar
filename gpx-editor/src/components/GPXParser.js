import { calculateHaversineDistance } from '../Utilities';
import { setMinY, setMaxY, setTrackpoints, setWaypoints } from '../redux/actions/GPXActions';
import store from '../redux/store'; // Adjust this import based on your actual store path

const parseWaypoints = (xmlDoc) => {
    const waypoints = [];
    const wptElements = xmlDoc.getElementsByTagName('wpt');

    for (let i = 0; i < wptElements.length; i++) {
        const wpt = wptElements[i];
        const lat = parseFloat(wpt.getAttribute('lat'));
        const lon = parseFloat(wpt.getAttribute('lon'));
        const name = wpt.getElementsByTagName('name')[0]?.textContent || 'Unnamed Waypoint';
        const desc = wpt.getElementsByTagName('desc')[0]?.textContent;

        if (!isNaN(lat) && !isNaN(lon) && !name.startsWith("KM")) {
            waypoints.push({
                latitude: lat,
                longitude: lon,
                name: name,
                description: desc,
            });
        }
    }

    return waypoints;
};

const calculateAverageElevation = (prevElevation, nextElevation) => {
    if (prevElevation != null && nextElevation != null) {
        return (prevElevation + nextElevation) / 2;
    }
    return null;
};

const isSameLocation = (lat1, lon1, lat2, lon2) => {
    return lat1 === lat2 && lon1 === lon2;
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

                // Additional check for elevation
                if (isNaN(elevation)) {
                    // ... existing elevation handling logic ...
                }

                // Distance calculation
                if (lastLat !== null && lastLon !== null) {
                    segmentDistance += calculateHaversineDistance(lastLat, lastLon, lat, lon);
                }

                const trackpoint = {
                    latitude: lat, 
                    longitude: lon, 
                    elevation: elevation, 
                    distanceFromStart: segmentDistance,
                    isWaypoint: waypoints.some(wp => isSameLocation(lat, lon, wp.latitude, wp.longitude))
                };

                trackpoints.push(trackpoint);
                lastLat = lat;
                lastLon = lon;

                // Elevation min/max calculation
                if (elevation != null) {
                    minY = Math.min(minY, elevation);
                    maxY = Math.max(maxY, elevation);
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

    // Store dispatches
    const allTrackpoints = tracks.flatMap(track => track.segments.flatMap(segment => segment));
    store.dispatch(setTrackpoints(allTrackpoints));
    store.dispatch(setMinY(Math.floor(minY / 100) * 100));
    store.dispatch(setMaxY(Math.ceil(maxY / 100) * 100));

    return tracks;
};

export const parseStandardGPX = (xmlDoc) => {
    const waypoints = parseWaypoints(xmlDoc);
    const tracks = parseTracks(xmlDoc, waypoints);

    store.dispatch(setWaypoints(waypoints));
    return { waypoints, tracks };
};

export const parseCustomGPX = (xmlDoc) => {
    return parseStandardGPX(xmlDoc);
};
