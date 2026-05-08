import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";

export default function QRModal({ url, onClose }) {
  return createPortal(
    <div className="qr-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal__header">
          <span className="qr-modal__title">QR Code</span>
          <button onClick={onClose} className="qr-modal__close">
            &times;
          </button>
        </div>
        <div className="qr-modal__body">
          <QRCodeSVG
            value={url}
            size={180}
            level="M"
            bgColor="transparent"
            fgColor="#1a1a2e"
          />
        </div>
        <p className="qr-modal__url">{url}</p>
      </div>
    </div>,
    document.body,
  );
}
