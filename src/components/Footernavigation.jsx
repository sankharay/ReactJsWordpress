import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home, AddIcCall, Build, ExitToApp,HealthAndSafety } from '@mui/icons-material';

const BottomMenu = () => {
    const [value, setValue] = useState(0);

    return (
        <BottomNavigation
            value={value}
            onChange={(event, newValue) => setValue(newValue)}
            showLabels
            style={{
                position: 'fixed',
                bottom: 0,
                width: '100%',
                backgroundColor: '#fff',
                boxShadow: '0px -1px 5px rgba(0, 0, 0, 0.2)',
            }}
        >
            <BottomNavigationAction label="Home" icon={<Home />} />
            <BottomNavigationAction label="Find Help" icon={<AddIcCall />} />
            <BottomNavigationAction label="Risk Tool" icon={<Build />} />
            <BottomNavigationAction label="Stay Safe" icon={<HealthAndSafety />} />
            <BottomNavigationAction label="Exit" icon={<ExitToApp />} />
        </BottomNavigation>
    );
};

export default BottomMenu;