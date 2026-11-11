"use client";

import { track } from "@vercel/analytics";
import type { ComponentPropsWithoutRef } from "react";

type AppStoreLinkProps = Omit<ComponentPropsWithoutRef<"a">, "onClick" | "onAuxClick"> & {
  placement: string;
};

export function AppStoreLink({ placement, ...props }: AppStoreLinkProps) {
  function trackClick() {
    track("App Store Click", { app: "rodeo-daily", placement });
  }

  return (
    <a
      {...props}
      onClick={trackClick}
      onAuxClick={(event) => {
        if (event.button === 1) trackClick();
      }}
    />
  );
}
