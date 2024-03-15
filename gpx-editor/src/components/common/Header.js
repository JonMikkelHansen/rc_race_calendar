// Header.js
import React from 'react';
import styled from 'styled-components';
/* import './Header.css'; // Style your header accordingly */
import { ReactComponent as RCLogo } from '../../assets/graphics/RC_logo.svg';


// Styled header container
const HeaderContainer = styled.div`
  background-color: #232323; // Setting the background color
  display: flex; // Using flexbox for alignment
  align-items: center; // Center items vertically
  padding: 0.5em; // Adding some padding around the header
`;

// Styled logo component or img
const StyledLogo = styled(RCLogo)`
  width: 20em; // Setting the width of the logo
  margin: 0.5em; // Adding margin around the logo
`;

const StyledHeading = styled.h1`
  font-family: 'Libre Franklin', sans-serif; // Setting the font family
  font-size: 2em; // Setting the font size
  color: #fff; // Setting the text color
  margin: 0 1em; // Optionally, remove default margin
`;


const Header = () => {
    return (
        <HeaderContainer>
            <StyledLogo alt="Road Code logo" />
            <StyledHeading>- Race Editor</StyledHeading>
            <div className="burger-menu">
                {/* Implement burger menu */}
            </div>
        </HeaderContainer>
    );
};

export default Header;
