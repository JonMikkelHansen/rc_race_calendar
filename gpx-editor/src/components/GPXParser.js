import { calculateHaversineDistance } from '../Utilities';
import { setMinY, setMaxY, setTrackpoints, setWaypoints } from '../redux/actions/GPXActions';
import store from '../redux/store';

const calculateAverageElevation = (prevElevation, nextElevation) => {
    if (prevElevation != null && nextElevation != null) {
        return (prevElevation + nextElevation) / 2;
    }
    return null;
};

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
                id: `waypoint-${Date.now()}-${i}`, // Unique ID
                latitude: lat,
                longitude: lon,
                name: name,
                description: desc,
                elevation: undefined, // To be updated
                distanceFromStart: undefined // To be updated
            });
        }
    }

    return waypoints;
};

// Corrected: Removed the 'waypoints' parameter as it was not used within this function.
const parseTracks = (xmlDoc) => {
    const tracks = [];
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    const trkElements = xmlDoc.getElementsByTagName('trk');
    let trackpointIdCounter = 0;
    const allTrackpoints = [];

    for (let i = 0; i < trkElements.length; i++) {
        const trk = trkElements[i];
        const trksegs = trk.getElementsByTagName('trkseg');

        for (let j = 0; j < trksegs.length; j++) {
            const trkseg = trksegs[j];
            const trkpts = trkseg.getElementsByTagName('trkpt');
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
                        elevation = calculateAverageElevation(
                            k > 0 ? parseFloat(trkpts[k - 1].getElementsByTagName('ele')[0]?.textContent) : null,
                            k + 1 < trkpts.length ? parseFloat(trkpts[k + 1].getElementsByTagName('ele')[0]?.textContent) : null
                        );
                    }

                    if (lastLat !== null && lastLon !== null) {
                        segmentDistance += calculateHaversineDistance(lastLat, lastLon, lat, lon);
                    }

                    allTrackpoints.push({
                        id: `trackpoint-${trackpointIdCounter++}`,
                        latitude: lat,
                        longitude: lon,
                        elevation,
                        distanceFromStart: segmentDistance,
                    });

                    lastLat = lat;
                    lastLon = lon;

                    minY = Math.min(minY, elevation ?? minY);
                    maxY = Math.max(maxY, elevation ?? maxY);
                }
            }
        }
    }

    store.dispatch(setTrackpoints(allTrackpoints));
    store.dispatch(setMinY(Math.floor(minY / 100) * 100));
    store.dispatch(setMaxY(Math.ceil(maxY / 100) * 100));

    return { tracks, allTrackpoints, minY, maxY };
};

const assignDistanceToWaypoints = (waypoints, trackpoints) => {
    // Sort waypoints by their order in the track
    waypoints.sort((a, b) => a.order - b.order);

    // Split trackpoints into segments at each waypoint
    const segments = [];
    let segmentStartIndex = 0;
    waypoints.forEach((waypoint, i) => {
        const segmentEndIndex = trackpoints.findIndex((trackpoint, j) => 
            j > segmentStartIndex && 
            trackpoint.latitude === waypoint.latitude && 
            trackpoint.longitude === waypoint.longitude
        );
        if (segmentEndIndex !== -1) {
            segments.push(trackpoints.slice(segmentStartIndex, segmentEndIndex + 1));
            segmentStartIndex = segmentEndIndex;
        }
    });
    segments.push(trackpoints.slice(segmentStartIndex));

    // Assign distance from start to each waypoint
    waypoints.forEach((waypoint, i) => {
        const segment = segments[i];
        const closestTrackpoint = segment.reduce((closest, trackpoint) => {
            const distance = calculateHaversineDistance(waypoint.latitude, waypoint.longitude, trackpoint.latitude, trackpoint.longitude);
            return distance < closest.distance ? { trackpoint, distance } : closest;
        }, { trackpoint: null, distance: Infinity });
        if (closestTrackpoint.trackpoint) {
            waypoint.distanceFromStart = closestTrackpoint.trackpoint.distanceFromStart;
            waypoint.elevation = closestTrackpoint.trackpoint.elevation;
        }
    });
};

export const parseStandardGPX = (xmlDoc) => {
    const waypoints = parseWaypoints(xmlDoc);
    // Corrected to directly parse tracks without needing waypoints as input.
    const { tracks, allTrackpoints, minY, maxY } = parseTracks(xmlDoc);

    // Now assigning distances to waypoints after both waypoints and trackpoints are parsed.
    assignDistanceToWaypoints(waypoints, allTrackpoints);

    store.dispatch(setWaypoints(waypoints));

    return { waypoints, tracks, allTrackpoints, minY, maxY };
};

export const parseCustomGPX = (xmlDoc) => {
    return parseStandardGPX(xmlDoc);
};
