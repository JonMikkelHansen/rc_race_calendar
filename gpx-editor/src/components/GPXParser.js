import { v4 as uuidv4 } from 'uuid';
import { calculateHaversineDistance, interpolateTrackpointData } from '../Utilities'; // Ensure interpolateTrackpointData is implemented correctly
import { setMinY, setMaxY, setTrackpoints, setWaypoints, setStageTitle } from '../redux/actions/GPXActions';
import store from '../redux/store';

const calculateAverageElevation = (prevElevation, nextElevation) => {
    if (prevElevation != null && nextElevation != null) {
        return (prevElevation + nextElevation) / 2;
    }
    return null;
};

const parseWaypoints = (xmlDoc, allTrackpoints) => { // Added allTrackpoints as parameter for dependency
    const waypoints = [];
    const wptElements = xmlDoc.getElementsByTagName('wpt');
    for (let i = 0; i < wptElements.length; i++) {
        const wpt = wptElements[i];
        const lat = parseFloat(wpt.getAttribute('lat'));
        const lon = parseFloat(wpt.getAttribute('lon'));
        const name = wpt.getElementsByTagName('name')[0]?.textContent || 'Unnamed Waypoint';
        const desc = wpt.getElementsByTagName('desc')[0]?.textContent;

        // Additional attributes like 'distanceFromStart' and 'elevation' are parsed here if provided

        waypoints.push({
            id: uuidv4(),
            latitude: lat,
            longitude: lon,
            name,
            description: desc,
            elevation: undefined, // To be interpolated or updated
            distanceFromStart: undefined // To be calculated or updated
        });
    }
    return waypoints;
};

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
                    
                    const distanceFromStart = +(segmentDistance / 1000).toFixed(3);

                    allTrackpoints.push({
                        id: `trackpoint-${trackpointIdCounter++}`,
                        latitude: lat,
                        longitude: lon,
                        elevation,
                        distanceFromStart,
                        isWaypoint: false, // Initialize all trackpoints with isWaypoint set to false
                        waypointID: null // Initialize waypointID as null
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
    waypoints.forEach(waypoint => {
        trackpoints.forEach(trackpoint => {
            const distance = calculateHaversineDistance(waypoint.latitude, waypoint.longitude, trackpoint.latitude, trackpoint.longitude);
            // Consider a very small distance to account for GPS inaccuracies
            if (distance < 0.05) { // Adjust this threshold based on your accuracy requirements
                trackpoint.isWaypoint = true;
                trackpoint.waypointID = waypoint.id;
                // Update waypoint with trackpoint information
                waypoint.distanceFromStart = trackpoint.distanceFromStart;
                waypoint.elevation = trackpoint.elevation;
            }
        });
    });
};

const ensureWaypointTrackpointPairs = (waypoints, allTrackpoints) => {
    waypoints.forEach(waypoint => {
        // Find an existing trackpoint with the same distanceFromStart.
        const trackpointIndex = allTrackpoints.findIndex(tp => tp.distanceFromStart === waypoint.distanceFromStart);
        
        if (trackpointIndex !== -1) {
            // If found, update the existing trackpoint with waypoint's data.
            allTrackpoints[trackpointIndex] = {
                ...allTrackpoints[trackpointIndex],
                latitude: waypoint.latitude,
                longitude: waypoint.longitude,
                elevation: waypoint.elevation,
                isWaypoint: true,
                waypointID: waypoint.id,
            };
        } else {
            // If not found, create and add a new trackpoint for this waypoint.
            allTrackpoints.push({
                id: uuidv4(),
                latitude: waypoint.latitude,
                longitude: waypoint.longitude,
                elevation: waypoint.elevation,
                distanceFromStart: waypoint.distanceFromStart,
                isWaypoint: true,
                waypointID: waypoint.id,
            });
        }
    });

    // Sort the allTrackpoints array by distanceFromStart after modification.
    allTrackpoints.sort((a, b) => a.distanceFromStart - b.distanceFromStart);
};


export const parseStandardGPX = (xmlDoc) => {
    const { allTrackpoints, minY, maxY } = parseTracks(xmlDoc);
    const waypoints = parseWaypoints(xmlDoc, allTrackpoints);

    assignDistanceToWaypoints(waypoints, allTrackpoints);
    ensureWaypointTrackpointPairs(waypoints, allTrackpoints);

    const trkElements = xmlDoc.getElementsByTagName('trk');
    let stageTitle = 'Unknown';
    if (trkElements.length > 0 && trkElements[0].getElementsByTagName('name')[0]) {
        stageTitle = trkElements[0].getElementsByTagName('name')[0].textContent;
    }

    store.dispatch(setStageTitle(stageTitle));
    store.dispatch(setMinY(Math.floor(minY / 100) * 100));
    store.dispatch(setMaxY(Math.ceil(maxY / 100) * 100));
    store.dispatch(setTrackpoints(allTrackpoints));
    store.dispatch(setWaypoints(waypoints));

    return { waypoints, allTrackpoints, minY, maxY };
};

export const parseCustomGPX = (xmlDoc) => {
    return parseStandardGPX(xmlDoc);
};