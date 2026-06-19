"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileX2, Home } from "lucide-react";
import lottie from "lottie-web";
import notFoundAnimation from "../public/assets/LottieFile/404 error page with cat.json";

export default function NotFound() {
  const animationRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!animationRef.current) return;

    const animation = lottie.loadAnimation({
      container: animationRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: notFoundAnimation,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
      },
    });

    return () => animation.destroy();
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <main className="fixed inset-0 z-50 overflow-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-10 size-[28rem] rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute right-0 top-1/4 size-[26rem] rounded-full bg-teal/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 size-[22rem] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <section className="relative z-10 flex min-h-full items-center justify-center px-4 py-4 sm:px-6 sm:py-6">
        <div className="w-full max-w-4xl">
          <div className="mb-4 flex justify-center sm:mb-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-foreground/80 shadow-xl shadow-primary/5 backdrop-blur-xl sm:text-sm sm:tracking-[0.24em]">
              <FileX2 className="size-4 text-primary" />
              <span>ERROR 404</span>
            </div>
          </div>

          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="relative mb-4 flex h-[13rem] w-[13rem] items-center justify-center sm:mb-5 sm:h-[16rem] sm:w-[16rem] lg:h-[18rem] lg:w-[18rem]">
              <div
                aria-hidden
                className="absolute inset-0 rounded-[2.5rem] bg-primary/12 blur-3xl"
              />
              <div className="absolute left-1/2 top-1/2 select-none -translate-x-[54%] -translate-y-[56%] text-[clamp(5.5rem,11vw,9rem)] font-black leading-none tracking-[-0.08em] text-foreground/12 sm:text-[clamp(6.5rem,12vw,10rem)]">
                404
              </div>
              <div ref={animationRef} aria-hidden className="relative z-10 h-full w-full drop-shadow-2xl" />
            </div>

            <h1 className="max-w-3xl text-[clamp(2rem,4.7vw,3.8rem)] font-black leading-[0.95] tracking-[-0.04em] text-heading sm:text-[clamp(2.4rem,5vw,4.6rem)]">
              Lost in the Network
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-paragraph sm:mt-5 sm:text-base sm:leading-7">
              The requested resource could not be located. It may have been relocated, deleted,
              or you might not have the correct permissions.
            </p>

            <div className="mt-6 flex w-full flex-col justify-center gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card/70 px-6 text-sm font-semibold text-foreground shadow-lg shadow-foreground/5 backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card/90 sm:h-14 sm:px-8 sm:text-base"
              >
                <ArrowLeft className="size-5" />
                Go Back
              </button>

              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-transform duration-200 hover:-translate-y-0.5 sm:h-14 sm:px-8 sm:text-base"
              >
                <Home className="size-5" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
