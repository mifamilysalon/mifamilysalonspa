"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import {
  SITE_HEADER_PRIMARY_NAV,
  SITE_HEADER_SERVICE_GROUPS,
} from "@/lib/service-categories";

const DESKTOP_MQ = "(min-width: 960px)";
const CLOSE_DELAY_MS = 150;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isServicesActive(pathname: string): boolean {
  return SITE_HEADER_SERVICE_GROUPS.some((group) =>
    group.links.some((link) => isActivePath(pathname, link.href)),
  );
}

function DesktopNavLink({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active = isActivePath(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`site-nav-link${active ? " is-active" : ""}`}
    >
      {label}
    </Link>
  );
}

export function SiteHeader({
  phone,
  salonName,
  address,
  hours,
}: {
  phone: string;
  salonName: string;
  address: string;
  hours: string;
}) {
  const pathname = usePathname() || "/";
  const telHref = `tel:${phone.replace(/\D/g, "")}`;
  const servicesMenuId = useId();
  const mobileNavId = useId();
  const servicesPanelId = useId();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(73);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const servicesWrapRef = useRef<HTMLDivElement | null>(null);
  const servicesPanelRef = useRef<HTMLDivElement | null>(null);
  const servicesButtonRef = useRef<HTMLButtonElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openServices = useCallback(() => {
    clearCloseTimer();
    setServicesOpen(true);
  }, [clearCloseTimer]);

  const scheduleCloseServices = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setServicesOpen(false);
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const closeServices = useCallback(() => {
    clearCloseTimer();
    setServicesOpen(false);
  }, [clearCloseTimer]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => setHeaderHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mobileOpen, servicesOpen]);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const sync = () => {
      if (mq.matches) {
        setMobileOpen(false);
        setMobileServicesOpen(false);
      } else {
        setServicesOpen(false);
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    closeServices();
    closeMobile();
  }, [pathname, closeServices, closeMobile]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (servicesOpen) {
        event.preventDefault();
        closeServices();
        servicesButtonRef.current?.focus();
      } else if (mobileOpen) {
        event.preventDefault();
        closeMobile();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [servicesOpen, mobileOpen, closeServices, closeMobile]);

  useEffect(() => {
    if (!servicesOpen) return;

    let attached = false;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (servicesWrapRef.current?.contains(target)) return;
      if (servicesPanelRef.current?.contains(target)) return;
      closeServices();
    };

    // Defer so the opening click does not immediately count as an outside click.
    const timer = window.setTimeout(() => {
      attached = true;
      document.addEventListener("mousedown", onPointerDown);
      document.addEventListener("touchstart", onPointerDown);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      if (attached) {
        document.removeEventListener("mousedown", onPointerDown);
        document.removeEventListener("touchstart", onPointerDown);
      }
    };
  }, [servicesOpen, closeServices]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const servicesActive = isServicesActive(pathname);
  const secondaryLinks = SITE_HEADER_PRIMARY_NAV.filter((item) => item.href !== "/");
  const shortAddress = address.replace(/,\s*MI\s*\d+.*/i, "");

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-salon-border bg-salon-bg/95 backdrop-blur-sm"
    >
      {/* Top row — logo, phone, Book / Walk in unchanged */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-6">
        <Link
          href="/"
          className="min-w-0 font-serif text-lg text-salon-heading sm:text-xl md:text-2xl"
        >
          {salonName}
        </Link>

        <div className="hidden items-center gap-6 min-[960px]:flex">
          <a
            href={telHref}
            className="text-sm text-salon-body hover:text-salon-primary"
          >
            {phone}
          </a>
          <Link
            href="/appointments"
            className="bg-salon-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-salon-hover"
          >
            Book / Walk in
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 min-[960px]:hidden">
          <Link
            href="/appointments"
            className="inline-flex min-h-11 items-center justify-center bg-salon-primary px-3 text-sm font-medium text-white"
          >
            Book
          </Link>
          <a
            href={telHref}
            className="inline-flex min-h-11 items-center justify-center border border-salon-border px-3 text-sm font-medium text-salon-heading"
          >
            Call
          </a>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center border border-salon-border"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls={mobileNavId}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <div className="flex w-5 flex-col gap-1.5" aria-hidden="true">
              <span className="block h-px bg-salon-heading" />
              <span className="block h-px bg-salon-heading" />
              <span className="block h-px bg-salon-heading" />
            </div>
          </button>
        </div>
      </div>

      {/* Desktop nav row */}
      <nav
        className="relative mx-auto hidden max-w-6xl justify-center px-4 pb-3 min-[960px]:flex md:px-6"
        aria-label="Primary"
      >
        <div className="flex flex-wrap items-center justify-center">
          <DesktopNavLink href="/" label="Home" pathname={pathname} />

          <div
            ref={servicesWrapRef}
            className="relative"
            onMouseEnter={openServices}
            onMouseLeave={scheduleCloseServices}
          >
            <button
              ref={servicesButtonRef}
              type="button"
              id={servicesMenuId}
              className={`site-nav-link inline-flex items-center gap-1.5${
                servicesActive || servicesOpen ? " is-active" : ""
              }`}
              aria-expanded={servicesOpen}
              aria-controls={servicesPanelId}
              aria-haspopup="true"
              onClick={() => {
                clearCloseTimer();
                setServicesOpen((open) => !open);
              }}
            >
              Services
              <svg
                className={`h-3.5 w-3.5 shrink-0 motion-reduce:transition-none motion-safe:transition-transform motion-safe:duration-200 ${
                  servicesOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 12 12"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M2.5 4.5 6 8l3.5-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {secondaryLinks.map((item) => (
            <DesktopNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              pathname={pathname}
            />
          ))}
        </div>

        {servicesOpen ? (
          <div
            id={servicesPanelId}
            ref={servicesPanelRef}
            role="region"
            aria-labelledby={servicesMenuId}
            className="site-services-panel absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2"
            onMouseEnter={openServices}
            onMouseLeave={scheduleCloseServices}
          >
            <div className="grid gap-8 px-6 py-7 sm:grid-cols-2 lg:grid-cols-4">
              {SITE_HEADER_SERVICE_GROUPS.map((group) => (
                <div key={group.heading}>
                  <p className="font-serif text-lg text-white">{group.heading}</p>
                  <ul className="mt-3 space-y-2">
                    {group.links.map((link) => {
                      const active = isActivePath(pathname, link.href);
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            aria-current={active ? "page" : undefined}
                            className={`block text-[15px] transition-colors hover:text-[var(--salon-accent,#d946a8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--salon-accent,#d946a8)] motion-reduce:transition-none ${
                              active
                                ? "text-[var(--salon-accent,#d946a8)]"
                                : "text-[#f7f0f4]"
                            }`}
                            onClick={closeServices}
                          >
                            {link.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-4 text-sm text-[#d9c8d4]">
              <p>Walk-ins welcome for most services. {hours}.</p>
              <Link
                href="/appointments"
                className="font-medium text-[var(--salon-accent,#d946a8)] underline underline-offset-4 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--salon-accent,#d946a8)]"
                onClick={closeServices}
              >
                Book online
              </Link>
            </div>
          </div>
        ) : null}
      </nav>

      {/* Mobile full-height drawer below header */}
      {mobileOpen && (
        <div
          id={mobileNavId}
          className="absolute inset-x-0 top-full z-40 overflow-y-auto border-t border-salon-border bg-salon-bg min-[960px]:hidden"
          style={
            {
              height: `calc(100dvh - ${headerHeight}px)`,
            } as CSSProperties
          }
        >
          <nav className="mx-auto flex min-h-full max-w-6xl flex-col px-4 py-5 pb-28">
            <div className="grid grid-cols-2 gap-3">
              <a
                href={telHref}
                className="inline-flex min-h-14 items-center justify-center border border-salon-border bg-salon-panel text-base font-medium text-salon-heading"
                onClick={closeMobile}
              >
                Call
              </a>
              <Link
                href="/appointments"
                className="inline-flex min-h-14 items-center justify-center bg-salon-primary text-base font-medium text-white"
                onClick={closeMobile}
              >
                Book
              </Link>
            </div>

            <div className="mt-6 border-y border-salon-border">
              <button
                type="button"
                className="flex min-h-12 w-full items-center justify-between py-3 text-left text-base font-medium text-salon-heading"
                aria-expanded={mobileServicesOpen}
                aria-controls={`${mobileNavId}-services`}
                onClick={() => setMobileServicesOpen((v) => !v)}
              >
                Services
                <svg
                  className={`h-4 w-4 motion-reduce:transition-none motion-safe:transition-transform motion-safe:duration-200 ${
                    mobileServicesOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                >
                  <path
                    d="M2.5 4.5 6 8l3.5-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {mobileServicesOpen && (
                <div id={`${mobileNavId}-services`} className="pb-4">
                  {SITE_HEADER_SERVICE_GROUPS.map((group) => (
                    <div key={group.heading} className="mt-4">
                      <p className="font-serif text-lg text-salon-heading">
                        {group.heading}
                      </p>
                      <ul className="mt-2">
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              aria-current={
                                isActivePath(pathname, link.href)
                                  ? "page"
                                  : undefined
                              }
                              className="block min-h-11 py-2.5 text-salon-body hover:text-salon-primary"
                              onClick={closeMobile}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              {secondaryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    isActivePath(pathname, item.href) ? "page" : undefined
                  }
                  className="min-h-12 border-b border-salon-border py-3 text-base text-salon-heading"
                  onClick={closeMobile}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-auto border-t border-salon-border pt-6 text-sm text-salon-body">
              <p>{shortAddress}.</p>
              <p className="mt-2">{hours}.</p>
              <p className="mt-2">Walk-ins welcome.</p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
