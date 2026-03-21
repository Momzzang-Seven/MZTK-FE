/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
    naver: any;
  }
  namespace naver {
    namespace maps {
      type Map = any;
      const Service: any;
      const LatLng: any;
      const Point: any;
      const Marker: any;
    }
  }
}
