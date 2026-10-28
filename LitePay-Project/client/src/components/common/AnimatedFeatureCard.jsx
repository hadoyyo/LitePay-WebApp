import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const iconEntrance = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(0, 10px, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const iconExit = keyframes`
  0% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate3d(0, -6px, 0) scale(0.92);
  }
`;

const textEntrance = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(0, 8px, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const textExit = keyframes`
  0% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
  100% {
    opacity: 0;
    transform: translate3d(0, -6px, 0);
  }
`;

const FeatureCardContainer = styled.div`
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.md};
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 1rem;
  width: 85%;
  max-width: 600px;
  margin-bottom: 2.2rem;
  overflow: visible;
  text-align: center;
`;

const IconPositioner = styled.div`
  position: absolute;
  top: ${props => props.position?.top || '20px'};
  left: ${props => props.position?.left || 'auto'};
  right: ${props => props.position?.right || 'auto'};
  bottom: ${props => props.position?.bottom || 'auto'};
  transform: ${props => props.position?.transform || 'none'};
  pointer-events: none;
  z-index: 2;
`;

const IconImage = styled.div`
  width: ${props => props.size || '80px'};
  height: ${props => props.size || '80px'};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  filter: drop-shadow(0px 8px 6px rgba(0, 0, 0, 0.2));
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  animation: ${props => props.isleaving ? iconExit : iconEntrance} 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
`;

const FeatureTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0;
  will-change: transform, opacity;
  animation: ${props => props.isleaving ? textExit : textEntrance} 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: ${props => props.isleaving ? '0s' : '0.15s'};
  padding-left: 0.5rem;
  padding-right: 0.5rem;
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  font-size: 1.4rem;
  opacity: 0;
  will-change: transform, opacity;
  animation: ${props => props.isleaving ? textExit : textEntrance} 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: ${props => props.isleaving ? '0s' : '0.3s'};
  padding-left: 1rem;
  padding-right: 1rem;
`;

export default function AnimatedFeatureCard({ features, interval = 3000 }) {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    features?.forEach(feature => {
      if (feature.isDouble && feature.icons) {
        feature.icons.forEach(src => {
          const img = new Image();
          img.src = src;
        });
      } else if (feature.icon) {
        const img = new Image();
        img.src = feature.icon;
      }
    });
  }, [features]);

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
      {currentFeature.isDouble ? (
        <>
          <IconPositioner 
            key={`pos1-${currentFeatureIndex}`} 
            position={currentFeature.positions[0]}
          >
            <IconImage
              style={{ backgroundImage: `url(${currentFeature.icons[0]})` }}
              size={currentFeature.sizes?.[0] || currentFeature.size}
              isleaving={isLeaving}
            />
          </IconPositioner>
          <IconPositioner 
            key={`pos2-${currentFeatureIndex}`} 
            position={currentFeature.positions[1]}
          >
            <IconImage
              style={{ backgroundImage: `url(${currentFeature.icons[1]})` }}
              size={currentFeature.sizes?.[1] || currentFeature.size}
              isleaving={isLeaving}
            />
          </IconPositioner>
        </>
      ) : (
        <IconPositioner 
          key={`pos-${currentFeatureIndex}`} 
          position={currentFeature.position}
        >
          <IconImage
            style={{ backgroundImage: `url(${currentFeature.icon})` }}
            size={currentFeature.size}
            isleaving={isLeaving}
          />
        </IconPositioner>
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
