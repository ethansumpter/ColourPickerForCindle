interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropper {
  open(): Promise<EyeDropperResult>;
}

declare global {
  interface Window {
    EyeDropper: {
      new(): EyeDropper;
    };
  }
}

export {}; 