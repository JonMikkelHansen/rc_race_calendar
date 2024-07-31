import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setMinY, setMaxY, setTolerance, setTension, setShowTrackpoints, setShowWaypoints, setShowAnnotations } from '../../redux/actions/GPXActions';
import styled from 'styled-components';
import { CheckSquare, Square } from 'react-feather';

const Container = styled.div`
  padding: 20px;
  background-color: #333;
  color: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px; /* Add some margin to separate from the chart */
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  input[type='checkbox'] {
    display: none;
  }

  label {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 5px;
  }

  label svg {
    margin-right: 5px;
  }
`;

const InputRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  label {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  input[type='number'] {
    padding: 5px;
    border: none;
    border-radius: 4px;
    width: 60px;
  }
`;

const ToggleSwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ToggleSwitch = styled.div`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #2196F3;
  }

  input:checked + span:before {
    transform: translateX(20px);
  }
`;

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
        <Container>
            <ToggleRow>
                <label>
                    <input
                        type="checkbox"
                        checked={showTrackpoints}
                        onChange={handleCheckboxChange(setShowTrackpoints)}
                    />
                    {showTrackpoints ? <CheckSquare size={18} /> : <Square size={18} />}
                    Show Trackpoints
                </label>
                <ToggleSwitchContainer>
                    <ToggleSwitch>
                        <input
                            type="checkbox"
                            checked={showWaypoints}
                            onChange={handleCheckboxChange(setShowWaypoints)}
                        />
                        <span></span>
                    </ToggleSwitch>
                    <label>Show Waypoints</label>
                </ToggleSwitchContainer>
                <ToggleSwitchContainer>
                    <ToggleSwitch>
                        <input
                            type="checkbox"
                            checked={showAnnotations}
                            onChange={handleCheckboxChange(setShowAnnotations)}
                        />
                        <span></span>
                    </ToggleSwitch>
                    <label>Show Annotations</label>
                </ToggleSwitchContainer>
            </ToggleRow>
            <InputRow>
                <label>
                    Tolerance:
                    <input
                        type="number"
                        value={tolerance}
                        onChange={handleInputChange(setTolerance)}
                    />
                </label>
                <label>
                    Tension:
                    <input
                        type="number"
                        value={tension}
                        onChange={handleInputChange(setTension)}
                        step="0.1"
                        min="0"
                        max="1"
                    />
                </label>
                <label>
                    Min Y:
                    <input
                        type="number"
                        value={minY}
                        onChange={handleInputChange(setMinY)}
                        step="50"
                    />
                </label>
                <label>
                    Max Y:
                    <input
                        type="number"
                        value={maxY}
                        onChange={handleInputChange(setMaxY)}
                        step="50"
                    />
                </label>
            </InputRow>
        </Container>
    );
};

export default GPXChartControls;