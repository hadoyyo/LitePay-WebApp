import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOutZoom = keyframes`
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.9); }
`;

const FeatureCardContainer = styled.div`
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin: 1rem;
  width: 85%;
  max-width: 600px;
  margin-bottom: 2.2rem;
  overflow: visible;
  text-align: center;
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  filter: drop-shadow(0px 8px 6px rgba(0, 0, 0, 0.2));
  transition: all 0.5s ease;
  opacity: 0;
  animation: ${props => props.isleaving ? fadeOutZoom : fadeIn} 0.5s ease forwards;
  position: absolute;
  top: ${props => props.position?.top || '20px'};
  left: ${props => props.position?.left || 'auto'};
  right: ${props => props.position?.right || 'auto'};
  bottom: ${props => props.position?.bottom || 'auto'};
  transform: ${props => props.position?.transform || 'none'};
`;

const FeatureTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0;
  animation: ${props => props.isleaving ? fadeOutZoom : fadeIn} 0.5s ease forwards;
  animation-delay: ${props => props.isleaving ? '0s' : '0.2s'};
  padding-left: 0.5rem;
  padding-right: 0.5rem;
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  font-size: 1.4rem;
  opacity: 0;
  animation: ${props => props.isleaving ? fadeOutZoom : fadeIn} 0.5s ease forwards;
  animation-delay: ${props => props.isleaving ? '0s' : '0.4s'};
  padding-left: 1rem;
  padding-right: 1rem;
`;

export default function AnimatedFeatureCard({ features, interval = 3000 }) {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsLeaving(true);
      
      setTimeout(() => {
        setCurrentFeatureIndex((prevIndex) => 
          prevIndex === features.length - 1 ? 0 : prevIndex + 1
        );
        setIsLeaving(false);
      }, 500);
    }, interval);

    return () => clearInterval(timer);
  }, [features.length, interval]);

  const currentFeature = features[currentFeatureIndex];

  return (
    <FeatureCardContainer>
      {/* Renderowanie wielu ikon */}
      {currentFeature.isDouble ? (
        <>
          <FeatureIcon 
            style={{ backgroundImage: `url(${currentFeature.icons[0]})` }} 
            key={`icon1-${currentFeatureIndex}`}
            position={currentFeature.positions[0]}
            isleaving={isLeaving}
          />
          <FeatureIcon 
            style={{ backgroundImage: `url(${currentFeature.icons[1]})` }} 
            key={`icon2-${currentFeatureIndex}`}
            position={currentFeature.positions[1]}
            isleaving={isLeaving}
          />
        </>
      ) : (
        // Pojedyncza ikona
        <FeatureIcon 
          style={{ backgroundImage: `url(${currentFeature.icon})` }} 
          key={`icon-${currentFeatureIndex}`}
          position={currentFeature.position}
          isleaving={isLeaving}
        />
      )}
      
      <FeatureTitle 
        key={`title-${currentFeatureIndex}`}
        isleaving={isLeaving}
      >
        {currentFeature.title}
      </FeatureTitle>
      <FeatureDescription 
        key={`desc-${currentFeatureIndex}`}
        isleaving={isLeaving}
      >
        {currentFeature.description}
      </FeatureDescription>
    </FeatureCardContainer>
  );
}