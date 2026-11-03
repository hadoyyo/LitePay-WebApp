import { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FiZoomIn, FiZoomOut } from 'react-icons/fi';
import Modal from './Modal';
import Button from './Button';

const CropWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const Instructions = styled.p`
  margin: 0;
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

const ViewportContainer = styled.div`
  position: relative;
  width: 280px;
  height: 280px;
  background-color: #1a1a1a;
  border-radius: 16px;
  overflow: hidden;
  cursor: ${({ $isDragging }) => ($isDragging ? 'grabbing' : 'grab')};
  user-select: none;
  touch-action: none;
`;

const CroppedImage = styled.img`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(calc(-50% + ${({ $x }) => $x}px), calc(-50% + ${({ $y }) => $y}px)) scale(${({ $zoom }) => $zoom});
  transform-origin: center center;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
`;

const MaskOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 220px;
  height: 220px;
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.65);
  border: 2px dashed rgba(255, 255, 255, 0.85);
  pointer-events: none;
`;

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 280px;
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    font-size: 1.8rem;
    flex-shrink: 0;
    cursor: pointer;
    transition: color 0.15s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const ZoomSlider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.border};
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    border: none;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  width: 100%;
  margin-top: 1rem;
`;

export default function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchPinchDist, setTouchPinchDist] = useState(null);
  const [touchPinchZoom, setTouchPinchZoom] = useState(1);
  const [baseSize, setBaseSize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const imageRef = useRef(null);

  const containerSize = 280;
  const circleDiameter = 220;
  const circleRadius = circleDiameter / 2;

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      setIsSaving(false);
      setTouchPinchDist(null);
    }
  }, [isOpen, imageSrc]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });

    let bWidth, bHeight;
    if (naturalWidth > naturalHeight) {
      bHeight = circleDiameter;
      bWidth = (naturalWidth / naturalHeight) * circleDiameter;
    } else {
      bWidth = circleDiameter;
      bHeight = (naturalHeight / naturalWidth) * circleDiameter;
    }
    setBaseSize({ width: bWidth, height: bHeight });
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const clampPosition = useCallback((x, y, currentZoom) => {
    if (!baseSize.width || !baseSize.height) return { x, y };
    const renderedWidth = baseSize.width * currentZoom;
    const renderedHeight = baseSize.height * currentZoom;
    const maxX = Math.max(0, (renderedWidth / 2) - circleRadius);
    const maxY = Math.max(0, (renderedHeight / 2) - circleRadius);
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y))
    };
  }, [baseSize, circleRadius]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition(clampPosition(newX, newY, zoom));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchPinchDist(dist);
      setTouchPinchZoom(zoom);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      setPosition(clampPosition(newX, newY, zoom));
    } else if (e.touches.length === 2 && touchPinchDist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchPinchDist;
      const newZoom = Math.min(3, Math.max(1, Number((touchPinchZoom * scale).toFixed(2))));
      setZoom(newZoom);
      setPosition(prev => clampPosition(prev.x, prev.y, newZoom));
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      setTouchPinchDist(null);
    } else if (e.touches.length === 1) {
      setTouchPinchDist(null);
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomStep = 0.05;
    const delta = e.deltaY < 0 ? zoomStep : -zoomStep;
    const newZoom = Math.min(3, Math.max(1, Number((zoom + delta).toFixed(2))));
    setZoom(newZoom);
    setPosition(prev => clampPosition(prev.x, prev.y, newZoom));
  };

  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
    setPosition(prev => clampPosition(prev.x, prev.y, newZoom));
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(3, Number((zoom + 0.1).toFixed(2)));
    setZoom(newZoom);
    setPosition(prev => clampPosition(prev.x, prev.y, newZoom));
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(1, Number((zoom - 0.1).toFixed(2)));
    setZoom(newZoom);
    setPosition(prev => clampPosition(prev.x, prev.y, newZoom));
  };

  const handleSave = async () => {
    if (!imageRef.current || !naturalSize.width || !naturalSize.height) return;
    setIsSaving(true);

    try {
      const scale = naturalSize.width / baseSize.width;
      const naturalCropSize = (circleDiameter / zoom) * scale;
      const naturalCenterX = (naturalSize.width / 2) - (position.x / zoom) * scale;
      const naturalCenterY = (naturalSize.height / 2) - (position.y / zoom) * scale;
      const sourceX = naturalCenterX - naturalCropSize / 2;
      const sourceY = naturalCenterY - naturalCropSize / 2;

      const clampedSourceX = Math.max(0, Math.min(naturalSize.width - naturalCropSize, sourceX));
      const clampedSourceY = Math.max(0, Math.min(naturalSize.height - naturalCropSize, sourceY));

      const targetSize = Math.min(400, Math.max(1, Math.round(naturalCropSize)));

      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        imageRef.current,
        clampedSourceX,
        clampedSourceY,
        naturalCropSize,
        naturalCropSize,
        0,
        0,
        targetSize,
        targetSize
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          setIsSaving(false);
          return;
        }
        const file = new File([blob], 'avatar.png', { type: 'image/png' });
        onCropComplete(file);
      }, 'image/png');
    } catch (err) {
      console.error('Crop error:', err);
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={isSaving ? undefined : onClose} title="Dostosuj zdjęcie">
      <CropWrapper>
        <Instructions>
          Przeciągnij zdjęcie i dostosuj powiększenie, aby dopasować awatar.
        </Instructions>

        <ViewportContainer
          $isDragging={isDragging}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {imageSrc && (
            <CroppedImage
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              $x={position.x}
              $y={position.y}
              $zoom={zoom}
              style={{
                width: baseSize.width ? `${baseSize.width}px` : 'auto',
                height: baseSize.height ? `${baseSize.height}px` : 'auto'
              }}
              onLoad={handleImageLoad}
            />
          )}
          <MaskOverlay />
        </ViewportContainer>

        <ZoomControls>
          <FiZoomOut onClick={handleZoomOut} />
          <ZoomSlider
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={handleZoomChange}
            disabled={isSaving || !baseSize.width}
          />
          <FiZoomIn onClick={handleZoomIn} />
        </ZoomControls>

        <ActionButtons>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Anuluj
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving || !baseSize.width}>
            {isSaving ? 'Zapisywanie...' : 'Zapisz zdjęcie'}
          </Button>
        </ActionButtons>
      </CropWrapper>
    </Modal>
  );
}