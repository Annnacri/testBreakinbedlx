import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, Download, Copy, Check, Printer, Share2, X, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandLogoUrl?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  brandLogoUrl,
}) => {
  const defaultDomain = 'https://breakfasinbedlx.com';
  const [targetUrl, setTargetUrl] = useState<string>(defaultDomain);
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    // Find canvas in ref or generate a high-res image canvas with branding frame
    const qrCanvas = qrContainerRef.current?.querySelector('canvas');
    if (!qrCanvas) return;

    // Create higher-res canvas for print-ready download (e.g. 1000x1200)
    const exportCanvas = document.createElement('canvas');
    const width = 1000;
    const height = 1200;
    exportCanvas.width = width;
    exportCanvas.height = height;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    ctx.fillStyle = '#FAF8F5'; // Warm bege background
    ctx.fillRect(0, 0, width, height);

    // Decorative inner card box
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;
    ctx.roundRect ? ctx.roundRect(60, 60, width - 120, height - 120, 32) : ctx.fillRect(60, 60, width - 120, height - 120);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Gold Top Accent Bar
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(60, 60, width - 120, 16);

    // Title Text
    ctx.fillStyle = '#2C1D11'; // Espresso color
    ctx.font = 'bold 44px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('BRUNCH BREAKFAST WELCOME', width / 2, 160);

    // Subtitle
    ctx.fillStyle = '#8C6239';
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Café da Manhã na Cama • Lisboa', width / 2, 205);

    // Draw the QR Code
    const qrSize = 520;
    const qrX = (width - qrSize) / 2;
    const qrY = 260;

    // QR Border frame
    ctx.strokeStyle = '#E8E1D7';
    ctx.lineWidth = 4;
    ctx.roundRect ? ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 24) : ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
    ctx.stroke();

    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    // Instructions below QR Code
    ctx.fillStyle = '#2C1D11';
    ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Digitalize para Fazer o Seu Pedido', width / 2, qrY + qrSize + 80);

    // Website Domain pill
    ctx.fillStyle = '#FAF4EA';
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    const pillWidth = 560;
    const pillHeight = 60;
    const pillX = (width - pillWidth) / 2;
    const pillY = qrY + qrSize + 120;
    
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 30) : ctx.fillRect(pillX, pillY, pillWidth, pillHeight);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2C1D11';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(targetUrl.replace(/^https?:\/\//, ''), width / 2, pillY + 40);

    // Download file trigger
    const imageURI = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QRCode_BreakfasInBedLX_${Date.now()}.png`;
    link.href = imageURI;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrCanvas = qrContainerRef.current?.querySelector('canvas');
    const qrDataUrl = qrCanvas ? qrCanvas.toDataURL('image/png') : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - BRUNCH BREAKFAST WELCOME</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background-color: #ffffff;
              color: #2C1D11;
              text-align: center;
              padding: 20px;
            }
            .card {
              border: 2px solid #D4AF37;
              border-radius: 24px;
              padding: 40px;
              max-width: 450px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            }
            h1 {
              font-family: Georgia, serif;
              font-size: 26px;
              margin: 0 0 6px 0;
              color: #2C1D11;
            }
            p.sub {
              font-size: 14px;
              color: #8C6239;
              margin: 0 0 24px 0;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .qr-img {
              width: 280px;
              height: 280px;
              margin: 0 auto;
              border-radius: 16px;
              padding: 12px;
              border: 1px solid #E8E1D7;
              background: white;
            }
            .cta {
              font-size: 18px;
              font-weight: bold;
              margin-top: 24px;
              color: #2C1D11;
            }
            .domain {
              background: #FAF4EA;
              border: 1px solid #D4AF37;
              color: #2C1D11;
              padding: 10px 20px;
              border-radius: 30px;
              font-family: monospace;
              font-size: 16px;
              font-weight: bold;
              display: inline-block;
              margin-top: 12px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>BRUNCH BREAKFAST WELCOME</h1>
            <p class="sub">Café da Manhã na Cama • Lisboa</p>
            <img src="${qrDataUrl}" class="qr-img" alt="QR Code" />
            <div class="cta">Aponte a câmera do telemóvel para fazer o seu pedido</div>
            <div class="domain">${targetUrl.replace(/^https?:\/\//, '')}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BRUNCH BREAKFAST WELCOME - Café da manhã na cama LX',
          text: 'Encomende o seu pequeno-almoço gourmet ao domicílio em Lisboa!',
          url: targetUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-stone-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gold-200/60 text-stone-900"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            {/* Header Badge & Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-100/80 px-3 py-1 text-xs font-bold text-gold-900 border border-gold-300/50">
                <QrCode size={14} className="text-gold-700" />
                <span>QR CODE OFICIAL</span>
              </div>
              
              <h3 className="font-serif text-2xl font-bold text-espresso">
                Aceder ao Site por QR Code
              </h3>
              
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Partilhe ou imprima este QR Code para que os seus clientes acedam diretamente ao menu e façam os seus pedidos.
              </p>
            </div>

            {/* QR Code Canvas Frame */}
            <div className="mt-6 flex flex-col items-center justify-center">
              <div
                ref={qrContainerRef}
                className="relative flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-amber-50/50 to-stone-50 p-6 border border-gold-200 shadow-inner group"
              >
                <QRCodeCanvas
                  value={targetUrl}
                  size={220}
                  bgColor="#FFFFFF"
                  fgColor="#2C1D11"
                  level="H"
                  marginSize={2}
                  imageSettings={
                    brandLogoUrl
                      ? {
                          src: brandLogoUrl,
                          x: undefined,
                          y: undefined,
                          height: 48,
                          width: 48,
                          excavate: true,
                        }
                      : undefined
                  }
                />

                {/* Subtitle inside card */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-gold-800">
                  <Sparkles size={12} className="text-gold-600" />
                  <span>breakfasinbedlx.com</span>
                </div>
              </div>
            </div>

            {/* Editable Domain / Custom Link Bar */}
            <div className="mt-5 space-y-1.5">
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                Link do QR Code:
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs">
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full bg-transparent font-mono text-stone-800 focus:outline-none"
                  placeholder="https://..."
                />
                <button
                  onClick={handleCopyLink}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-sm border border-stone-200 hover:bg-stone-100 transition-colors"
                  title="Copiar Link"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} className="text-stone-500" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button
                onClick={handleDownloadPNG}
                className="flex items-center justify-center gap-2 rounded-xl bg-espresso px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-stone-800 transition-all"
              >
                <Download size={15} className="text-gold-400" />
                <span>Baixar Imagem PNG</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-3 text-xs font-bold text-stone-800 shadow-sm hover:bg-stone-50 transition-all"
              >
                <Printer size={15} className="text-stone-600" />
                <span>Imprimir QR Code</span>
              </button>
            </div>

            {/* Direct Visit / Share button */}
            <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t border-stone-100">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-espresso transition-colors"
              >
                <Share2 size={14} className="text-stone-500" />
                <span>Partilhar Link</span>
              </button>

              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-gold-700 hover:text-gold-900 transition-colors"
              >
                <span>Abrir Site</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QRCodeModal;
