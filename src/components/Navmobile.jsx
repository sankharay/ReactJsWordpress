import React from 'react';
import { slide as Menu } from 'react-burger-menu';
import '../assets/css/Navmobile.css';

const Sidebar = () => {
  return (
    <div className='mobile-nav-container'>
        <Menu width={ '100%' }>
        <a id="home" className="menu-item" href="/">Home</a>
        <a id="about" className="menu-item" href="/about">About</a>
        <a id="contact" className="menu-item" href="/contact">Contact</a>
        </Menu>
    </div>
  );
};

export default Sidebar;