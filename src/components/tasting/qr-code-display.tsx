"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface QRCodeDisplayProps {
  url: string;
  label?: string;
}

export function QRCodeDisplay({ url, label }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="inline-block">
      <CardContent className="flex flex-col items-center gap-4 pt-6">
        {label && (
          <p className="text-sm text-muted-foreground">{label}</p>
        )}
        <div className="rounded-lg bg-white p-4">
          <QRCodeSVG value={url} size={200} />
        </div>
        <div className="flex w-full items-center gap-2">
          <Input value={url} readOnly className="text-xs" />
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
