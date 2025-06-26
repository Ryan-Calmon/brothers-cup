import React from 'react';
import '../styles/SponsorsCarousel.css';

const SponsorsCarousel = () => {
  const sponsors = [
    {
      name: 'Patrocinador Master',
      logo: '/images/vaga-preenchida.png',
      category: 'master'
    },
    {
      name: 'Patrocinador Ouro',
      logo: '/images/vaga-preenchida.png',
      category: 'gold'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/vaga-preenchida.png',
      category: 'silver'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/vaga-preenchida.png',
      category: 'silver'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/vaga-preenchida.png',
      category: 'silver'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/VAGA-DISPONIVEL.png',
      category: 'silver'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/VAGA-DISPONIVEL.png',
      category: 'silver'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/VAGA-DISPONIVEL.png',
      category: 'silver'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/VAGA-DISPONIVEL.png',
      category: 'silver'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/VAGA-DISPONIVEL.png',
      category: 'silver'
    }
  ];

  // Triplicar a lista para garantir continuidade perfeita
  const multipliedSponsors = [...sponsors, ...sponsors, ...sponsors];

  return (
    <div className="sponsors-section">
      <div className="sponsors-container">
        <div className="sponsors-track">
          {multipliedSponsors.map((sponsor, index) => (
            <div 
              key={`sponsor-${index}`} 
              className={`sponsor-item sponsor-${sponsor.category}`}
            >
              <img 
                src={sponsor.logo} 
                alt={sponsor.name}
                className="sponsor-logo"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SponsorsCarousel;

