import { drawPayCode } from "./paycode/PayCode";
import { ErrorCorrectionLevel, Mode } from "./qrcode/types";
import { QRCode } from "./qrcode/QRCode";

var create_qrcode = function (text: string, typeNumber: number, errorCorrectionLevel: ErrorCorrectionLevel, mode: Mode, mb: string) {
  if (typeNumber == 0) {
    typeNumber = suggestTypeNumber(text);
  }

  const qr = new QRCode(typeNumber || 4, errorCorrectionLevel || 'M');
  qr.addData(text, mode);
  qr.make();

  return qr;
};

var suggestTypeNumber = function (text: string) {
  var length = text.length;
  if (length <= 32) { return 3; }
  else if (length <= 46) { return 4; }
  else if (length <= 60) { return 5; }
  else if (length <= 74) { return 6; }
  else if (length <= 86) { return 7; }
  else if (length <= 108) { return 8; }
  else if (length <= 130) { return 9; }
  else if (length <= 151) { return 10; }
  else if (length <= 177) { return 11; }
  else if (length <= 203) { return 12; }
  else if (length <= 241) { return 13; }
  else if (length <= 258) { return 14; }
  else if (length <= 292) { return 15; }
  else { return 40; }
}

// var encodeImageFileAsURL = function(element: HTMLInputElement): void {
//   var file = element.files?.[0];
//   if (file) {
//     var reader = new FileReader();
//     reader.onloadend = function() {
//       var logo = document.getElementById('logo') as HTMLImageElement;
//       if (logo) {
//         logo.src = reader.result as string;
//       }
//     }
//     reader.readAsDataURL(file);
//   }
// }

interface QRCodeProps {
  text: string;
  typeNumber: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  size: number;
  consumer: boolean;
  imageSrc?: string;
  canvas: HTMLCanvasElement;  // Add canvas parameter
}

export var update_qrcode = function ({ text, typeNumber, errorCorrectionLevel, size, consumer, imageSrc, canvas }: QRCodeProps): void {
  const sanitizedText = text.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
  const mode: Mode = 'Byte';
  const mb = 'UTF-8';
  const qr = create_qrcode(sanitizedText, typeNumber, errorCorrectionLevel, mode, mb);

  const ctx = canvas.getContext('2d');

  // Create a new Image element and set its source
  const logo = new Image();
  if (imageSrc) {
    logo.src = imageSrc;
  }

  if (ctx) {
    canvas.width = size;
    canvas.height = size;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw QR code immediately
    drawPayCode({
      qr,
      canvas,
      size,
      logo,
      consumer
    });

    // If logo is not loaded yet, redraw when it loads
    if (imageSrc && !logo.complete) {
      logo.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPayCode({
          qr,
          canvas,
          size,
          logo,
          consumer
        });
      };
    }
  }
};
