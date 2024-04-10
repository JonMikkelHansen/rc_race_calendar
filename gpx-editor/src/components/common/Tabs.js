// Assuming Tabs.js is located under ./components/common/Tabs
import React from 'react';
import styled from 'styled-components';

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1em;
`;

const Tab = styled.button`
  padding: 10px;
  margin-right: 5px;
  border: none;
  background-color: ${props => props.isActive ? '#fff' : '#ccc'};
  color: ${props => props.isActive ? '#000' : '#666'};
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &:last-child {
    margin-right: 0;
  }
`;

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <TabsContainer>
      <Tab isActive={activeTab === 'Race'} onClick={() => setActiveTab('Race')}>Race</Tab>
      <Tab isActive={activeTab === 'Stage'} onClick={() => setActiveTab('Stage')}>Stage</Tab>
      <Tab isActive={activeTab === 'GPX'} onClick={() => setActiveTab('GPX')}>GPX</Tab>
      <Tab isActive={activeTab === 'Meta'} onClick={() => setActiveTab('Meta')}>Meta</Tab>
      <Tab isActive={activeTab === 'Other'} onClick={() => setActiveTab('Other')}>Other</Tab>
      <Tab isActive={activeTab === 'Save'} onClick={() => setActiveTab('Save')}>Save</Tab>
    </TabsContainer>
  );
};

export default Tabs;





