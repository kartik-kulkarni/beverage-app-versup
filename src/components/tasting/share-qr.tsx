"use client";

import { QRCodeDisplay } from "./qr-code-display";

interface ShareQRProps {
  path: string;
  label?: string;
}

export function ShareQR({ path, label }: ShareQRProps) {
  const url = `${window.location.origin}${path}`;
  return <QRCodeDisplay url={url} label={label} />;
}
