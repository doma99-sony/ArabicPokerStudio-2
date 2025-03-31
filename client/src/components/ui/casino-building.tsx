import React from 'react';
import { Link } from 'wouter';

const CasinoBuilding: React.FC = () => {
  // فتح في صفحة جديدة عند النقر
  const handleClick = () => {
    window.open('https://example.com', '_blank');
  };

  return (
    <div 
      className="casino-building-container"
      onClick={handleClick}
    >
      <div className="casino-building-image">
        <img 
          src="/assets/casino-building.jpg" 
          alt="كازينو بوكر بويا المصريين" 
          className="casino-image"
        />
        <div className="casino-text-overlay">
          <h2>بوكر بويا المصريين</h2>
          <div className="join-button">انضم الآن</div>
        </div>
      </div>
    </div>
  );
};

export default CasinoBuilding;