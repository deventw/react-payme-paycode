import { useEffect, useRef } from 'react';
import { update_qrcode } from './generate';
import { PayCodeProps } from './types';


export const PayCode = (props: PayCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    value,
    typeNumber = 0,
    errorCorrectionLevel = "M",
    size = 344,
    consumer = false,
    logoSrc
  } = props;

  useEffect(() => {
    if (canvasRef.current) {
      update_qrcode({ 
        text: value, 
        typeNumber, 
        errorCorrectionLevel, 
        size, 
        consumer,
        imageSrc: logoSrc,
        canvas: canvasRef.current 
      });
    }
  }, [value, typeNumber, errorCorrectionLevel, size, consumer]);

  return (
    <canvas ref={canvasRef} width={size} height={size}></canvas>
  );
};

