import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setMinY, setMaxY, setTolerance, setTension, setShowTrackpoints, setShowWaypoints, setShowAnnotations } from '../../redux/actions/GPXActions';

const GPXChartControls = () => {
    const dispatch = useDispatch();
    const tolerance = useSelector(state => state.tolerance);
    const tension = useSelector(state => state.tension);
    const minY = useSelector(state => state.minY);
    const maxY = useSelector(state => state.maxY);
    const showTrackpoints = useSelector(state => state.showTrackpoints);
    const showWaypoints = useSelector(state => state.showWaypoints);
    const showAnnotations = useSelector(state => state.showAnnotations);

    const handleInputChange = (action) => (e) => {
        dispatch(action(parseFloat(e.target.value)));
    };
    
    const handleCheckboxChange = (action) => (e) => {
        dispatch(action(e.target.checked));
    };

    return (
        <div>
            <div>
                <input
                    type="checkbox"
                    checked={showTrackpoints}
                    onChange={handleCheckboxChange(setShowTrackpoints)}
                /> Show Trackpoints
                <input
                    type="checkbox"
                    checked={showWaypoints}
                    onChange={handleCheckboxChange(setShowWaypoints)}
                    style={{ marginLeft: '10px' }}
                /> Show Waypoints
                <input
                    type="checkbox"
                    checked={showAnnotations}
                    onChange={handleCheckboxChange(setShowAnnotations)}
                    style={{ marginLeft: '10px' }}
                /> Show Annotations
            </div>
            <div style={{ marginTop: '10px' }}>
                Tolerance: 
                <input
                    type="number"
                    value={tolerance}
                    onChange={handleInputChange(setTolerance)}
                    style={{ marginLeft: '5px' }}
                />
                Tension: 
                <input
                    type="number"
                    value={tension}
                    onChange={handleInputChange(setTension)}
                    step="0.1"
                    min="0"
                    max="1"
                    style={{ marginLeft: '10px' }}
                />
                Min Y: 
                <input
                    type="number"
                    value={minY}
                    onChange={handleInputChange(setMinY)}
                    step="50"
                    style={{ marginLeft: '10px' }}
                />
                Max Y: <input
                    type="number"
                    value={maxY}
                    onChange={handleInputChange(setMaxY)}
                    step="50"
                    style={{ marginLeft: '10px' }}
                />
            </div>
        </div>
    );
};

export default GPXChartControls;
