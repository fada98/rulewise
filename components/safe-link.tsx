import type { AnchorHTMLAttributes, ReactNode } from "react";

type SafeLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children?: ReactNode;
};

/**
 * Vinext's client-side Link runtime currently crashes on deployed Sites builds.
 * A regular anchor keeps navigation accessible and lets the browser perform a
 * reliable full-page transition until the upstream router issue is resolved.
 */
export default function SafeLink({ href, children, ...props }: SafeLinkProps) {
  return <a href={href} {...props}>{children}</a>;
}
