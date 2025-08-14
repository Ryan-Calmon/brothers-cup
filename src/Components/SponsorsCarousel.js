import React from 'react';
import '../styles/SponsorsCarousel.css';

const SponsorsCarousel = () => {
  const sponsors = [
    {
      name: 'Patrocinador Ouro',
      logo: '/images/JAPA-NIGHT.png',
      category: 'master'
    },
    {
      name: 'Patrocinador Ouro',
      logo: '/images/logo-flying-horse-branco.webp',
      category: 'gold'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/logo-alma-de-cor.png',
      category: 'silver'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/logo-fm-distribuidora-2.png',
      category: 'silver'
    },
    {
      name: 'Patrocinador Ouro',
      logo: '/images/JAPA-NIGHT.png',
      category: 'master'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/logo-acai.jpg',
      category: 'silver'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/logo -playfitness.png',
      category: 'silver'
    },
    {
      name: 'Patrocinador Ouro',
      logo: '/images/logo-flying-horse-branco.webp',
      category: 'gold'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/PokerdOBetão.png',
      category: 'silver'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/Rangel-Tatoo.png',
      category: 'silver'
    },
    {
      name: 'Patrocinador Ouro',
      logo: '/images/JAPA-NIGHT.png',
      category: 'master'
    },
       {
      name: 'Patrocinador Ouro',
      logo: '/images/logo-flying-horse-branco.webp',
      category: 'gold'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/casadocelular.png',
      category: 'silver'
    },
    {
      name: 'Patrocinador Prata',
      logo: '/images/PokerdOBetão.png',
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

