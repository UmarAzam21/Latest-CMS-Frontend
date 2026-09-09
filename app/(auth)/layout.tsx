import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
      <div className="w-full min-h-screen bg-primary flex flex-col md:flex-row" style={{ borderTopRightRadius: '2rem', borderBottomRightRadius: '2rem' }}>
        <div className="hidden md:flex md:w-3/5 lg:w-2/3 relative items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.9)_0%,_rgba(255,255,255,0.4)_40%,_rgba(255,255,255,0)_80%)]" >
        
          <Image
            src="/auth.png"
            alt="Filernow tax & finance illustration"
            width={600}
            height={600}
            className="object-contain animate-float"
            // style={{ width: "auto", height: "auto" }}
            priority
          />
        </div>

        <div className="w-full md:w-2/5 lg:w-1/2 bg-white flex flex-col justify-center px-6 md:px-10 lg:px-16 py-10 relative">
          <div className="mx-auto w-full max-w-lg">{children}</div>

          <p className="absolute mt-10 bottom-6 font-inter left-0 right-0 text-center text-xs text-gray-400">
            Powered by <span className="font-bold">Filernow ©</span> {new Date().getFullYear()}
          </p>
        </div>
      </div>
  );
}