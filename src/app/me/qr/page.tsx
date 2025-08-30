'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { QrCode, Copy, ArrowLeft, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

export default function QRPage() {
  const { user } = useAuth();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [unlockUrl, setUnlockUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const generateQR = async () => {
      const url = `${window.location.origin}/unlock/${user.uid}`;
      setUnlockUrl(url);

      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [user]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(unlockUrl);
      toast({
        title: "Link copied!",
        description: "The unlock link has been copied to your clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Unlock my ESN Profile',
          text: 'Scan this QR code or use the link to unlock my profile!',
          url: unlockUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <a href="/me">
            <ArrowLeft className="h-4 w-4" />
          </a>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Your QR Code</h1>
          <p className="text-muted-foreground text-sm">
            Share this with Erasmus participants
          </p>
        </div>
      </div>

      {/* QR Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Profile Unlock Code
          </CardTitle>
          <CardDescription>
            Participants can scan this QR code or use the link to unlock your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {qrDataUrl && (
            <div className="bg-white p-6 rounded-lg flex justify-center">
              <img
                src={qrDataUrl}
                alt="Profile unlock QR code"
                className="w-64 h-64"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="unlock-link">Unlock Link</Label>
            <div className="flex gap-2">
              <Input
                id="unlock-link"
                value={unlockUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Button
              onClick={shareLink}
              className="w-full"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Link
            </Button>

            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <a href="/me">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
              1
            </div>
            <p>Share your QR code or link with Erasmus participants</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
              2
            </div>
            <p>They scan the code or visit the link</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
              3
            </div>
            <p>Your profile gets unlocked for them to view</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
