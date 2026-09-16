"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type FormEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CartQuickDrawer from "@/components/cart/CartQuickDrawer";
import { products } from "@/data/products";

const PRODUCT_LINKS = [
  {
    label: "Solar Panels",
    href: "/products?category=panel",
    icon: "☀",
  },
  {
    label: "Inverters",
    href: "/products?category=inverter",
    icon: "↯",
  },
  {
    label: "Batteries",
    href: "/products?category=battery",
    icon: "▣",
  },
  {
    label: "Portable Power",
    href: "/products?category=portable",
    icon: "⚡",
  },
];

const MAIN_NAV_LINKS = [
  {
    label: "Packages",
    href: "/packages",
  },
  {
    label: "Projects",
    href: "/projects",
  },
  {
    label: "Tools & Technology",
    href: "/tools-and-technology",
  },
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

const FEATURE_LINKS = [
  {
    label: "Engineering Lab",
    href: "/engineering-lab",
    icon: "⌁",
    className: "navFeatureEngineering",
    mobileClassName: "mobileFeatureEngineering",
  },
  {
    label: "Customer Support",
    href: "/customer-support",
    icon: "◉",
    className: "navFeatureSupport",
    mobileClassName: "mobileFeatureSupport",
  },
  {
    label: "Build Your System",
    href: "/build-your-system",
    icon: "✦",
    className: "navFeatureBuilder",
    mobileClassName: "mobileFeatureBuilder",
  },
];

const CART_KEY = "deshSolarCartV1";

type HeaderCartItem = {
  id: string;
  name: string;
  qty: number;
};

function getStoredCartItems(): HeaderCartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(CART_KEY) || "[]"
    );

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.id !== "undefined"
      )
      .map((item) => ({
        id: String(item.id),
        name:
          typeof item.name === "string" &&
          item.name.trim()
            ? item.name
            : "Product",
        qty: Math.max(
          1,
          Number(item.qty) || 1
        ),
      }));
  } catch {
    return [];
  }
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="20" r="1.25" />
      <circle cx="18" cy="20" r="1.25" />
      <path d="M3 4h2.2l2.1 10.1a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 1.9-1.4L21 8H6.1" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] =
    useState(false);
  const [productsMenuOpen, setProductsMenuOpen] =
    useState(false);
  const [cartToast, setCartToast] = useState<{
    type: "added" | "removed";
    productName: string;
  } | null>(null);

  const previousCartItemsRef =
    useRef<HeaderCartItem[]>([]);
  const cartToastTimerRef =
    useRef<number | null>(null);
  const desktopSearchInputRef =
    useRef<HTMLInputElement | null>(null);
  const mobileSearchInputRef =
    useRef<HTMLInputElement | null>(null);

  const matchingProducts = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return [];
    }

    return products
      .filter(
        (product) =>
          product.category !== "system"
      )
      .filter((product) => {
        const searchableText = [
          product.name,
          product.brandLabel,
          product.categoryLabel,
          product.power,
          product.search,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .slice(0, 5);
  }, [searchQuery]);

  useEffect(() => {
    const showCartToast = (
      type: "added" | "removed",
      productName: string
    ) => {
      setCartToast({
        type,
        productName,
      });

      if (cartToastTimerRef.current !== null) {
        window.clearTimeout(
          cartToastTimerRef.current
        );
      }

      cartToastTimerRef.current =
        window.setTimeout(() => {
          setCartToast(null);
          cartToastTimerRef.current = null;
        }, 2400);
    };

    const syncCart = (
      showToast = false
    ) => {
      const currentItems =
        getStoredCartItems();
      const previousItems =
        previousCartItemsRef.current;

      setCartCount(
        currentItems.reduce(
          (total, item) =>
            total + item.qty,
          0
        )
      );

      if (showToast) {
        const previousIds = new Set(
          previousItems.map(
            (item) => item.id
          )
        );
        const currentIds = new Set(
          currentItems.map(
            (item) => item.id
          )
        );

        const addedItem =
          currentItems.find(
            (item) =>
              !previousIds.has(item.id)
          );

        const removedItem =
          previousItems.find(
            (item) =>
              !currentIds.has(item.id)
          );

        if (addedItem) {
          showCartToast(
            "added",
            addedItem.name
          );
        } else if (removedItem) {
          showCartToast(
            "removed",
            removedItem.name
          );
        }
      }

      previousCartItemsRef.current =
        currentItems;
    };

    const initialCartFrame =
      window.requestAnimationFrame(() => {
        syncCart(false);
      });

    const handleCartChange = () =>
      syncCart(true);
    const handleStorage = () =>
      syncCart(true);
    const handlePassiveSync = () =>
      syncCart(false);

    window.addEventListener(
      "deshsolar:cartchange",
      handleCartChange
    );
    window.addEventListener(
      "storage",
      handleStorage
    );
    window.addEventListener(
      "focus",
      handlePassiveSync
    );
    window.addEventListener(
      "pageshow",
      handlePassiveSync
    );

    return () => {
      window.cancelAnimationFrame(initialCartFrame);
      window.removeEventListener(
        "deshsolar:cartchange",
        handleCartChange
      );
      window.removeEventListener(
        "storage",
        handleStorage
      );
      window.removeEventListener(
        "focus",
        handlePassiveSync
      );
      window.removeEventListener(
        "pageshow",
        handlePassiveSync
      );

      if (cartToastTimerRef.current !== null) {
        window.clearTimeout(
          cartToastTimerRef.current
        );
      }
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const openCart = useCallback(() => {
    setMobileOpen(false);
    setProductsMenuOpen(false);
    setCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setCartOpen(false);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchSuggestionsOpen(false);
  }, []);

  const openSearch = useCallback(
    (
      inputRef: RefObject<HTMLInputElement | null>
    ) => {
      setMobileOpen(false);
      setProductsMenuOpen(false);
      setCartOpen(false);
      setSearchOpen(true);

      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    []
  );

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        closeSearch();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    const syncSearchFromUrl = () => {
      const urlSearchQuery =
        new URLSearchParams(
          window.location.search
        ).get("search") || "";

      const hasSearchResult =
        pathname === "/products" &&
        urlSearchQuery.trim().length > 0;

      if (hasSearchResult) {
        setSearchQuery(urlSearchQuery);
        setSearchOpen(true);
        setSearchSuggestionsOpen(false);
        return;
      }

      setSearchOpen(false);
      setSearchSuggestionsOpen(false);
    };

    const initialSearchFrame =
      window.requestAnimationFrame(() => {
        setProductsMenuOpen(false);
        syncSearchFromUrl();
      });

    window.addEventListener(
      "popstate",
      syncSearchFromUrl
    );

    return () => {
      window.cancelAnimationFrame(initialSearchFrame);
      window.removeEventListener(
        "popstate",
        syncSearchFromUrl
      );
    };
  }, [pathname]);

  useEffect(() => {
    const closeProductsMenuOnScroll = () => {
      setProductsMenuOpen(false);
    };

    window.addEventListener(
      "scroll",
      closeProductsMenuOnScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        closeProductsMenuOnScroll
      );
    };
  }, []);

  const performSearch = useCallback(() => {
    const query = searchQuery.trim();

    if (!query) {
      const input =
        window.innerWidth <= 1280
          ? mobileSearchInputRef.current
          : desktopSearchInputRef.current;

      input?.focus();
      return;
    }

    setSearchOpen(true);
    setSearchSuggestionsOpen(false);

    router.push(
      `/products?search=${encodeURIComponent(
        query
      )}`
    );
  }, [
    searchQuery,
    router,
  ]);

  const submitSearch = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    performSearch();
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <header className="siteHeader">
      <nav
        className="nav"
        aria-label="Primary navigation"
      >
        {/* =================================================
            BRAND
            ================================================= */}

        <Link
          href="/"
          className="brand"
          aria-label="Desh Solar Home"
          onClick={closeMobileMenu}
        >
          <Image
            src="/assets/desh-solar-logo.png"
            alt="Desh Solar"
            width={220}
            height={54}
            priority
            className="brandLogoImage"
          />
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
            ================================================= */}

        <div className="navLinks">
          {/* =================================================
              PRODUCT SEARCH
              ================================================= */}

          <form
            className={`navSearchDock ${
              searchOpen
                ? "isOpen"
                : ""
            }`}
            role="search"
            onSubmit={submitSearch}
          >
            <div
              id="desktopProductSearchExtension"
              className="navSearchExtension"
              aria-hidden={!searchOpen}
            >
              <input
                ref={desktopSearchInputRef}
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setSearchQuery(value);
                  setSearchSuggestionsOpen(
                    value.trim().length > 0
                  );
                }}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setSearchSuggestionsOpen(true);
                  }
                }}
                placeholder="Search products..."
                autoComplete="off"
                aria-label="Search products"
                tabIndex={searchOpen ? 0 : -1}
              />

              <button
                type="button"
                className="navSearchExtensionClose"
                aria-label={
                  searchQuery
                    ? "Clear product search"
                    : "Close product search"
                }
                tabIndex={searchOpen ? 0 : -1}
                onClick={() => {
                  if (searchQuery) {
                    setSearchQuery("");
                    setSearchSuggestionsOpen(false);

                    window.requestAnimationFrame(() => {
                      desktopSearchInputRef.current?.focus();
                    });

                    return;
                  }

                  closeSearch();
                }}
              >
                ×
              </button>
            </div>

            <button
              type="button"
              className="navSearchDockToggle"
              aria-label={
                searchOpen
                  ? "Search products"
                  : "Open product search"
              }
              aria-expanded={searchOpen}
              aria-controls="desktopProductSearchExtension"
              onClick={() => {
                if (!searchOpen) {
                  openSearch(
                    desktopSearchInputRef
                  );
                  return;
                }

                performSearch();
              }}
            >
              <SearchIcon />
            </button>

            {searchOpen &&
              searchSuggestionsOpen &&
              searchQuery.trim() && (
                <div
                  className="navSearchSuggestions navSearchSuggestionsDesktop"
                  role="listbox"
                  aria-label="Matching products"
                >
                  {matchingProducts.length > 0 ? (
                    <>
                      <div className="navSearchSuggestionList">
                        {matchingProducts.map(
                          (product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              className="navSearchSuggestionItem"
                              onClick={() =>
                                setSearchSuggestionsOpen(
                                  false
                                )
                              }
                            >
                              <span className="navSearchSuggestionImage">
                                <Image
                                  src={product.image}
                                  alt=""
                                  width={56}
                                  height={48}
                                />
                              </span>

                              <span className="navSearchSuggestionInfo">
                                <small>
                                  {product.brandLabel}
                                  {" · "}
                                  {product.categoryLabel}
                                </small>

                                <strong>
                                  {product.name}
                                </strong>

                                <span>
                                  {product.priceText}
                                  {product.power
                                    ? ` · ${product.power}`
                                    : ""}
                                </span>
                              </span>

                              <b aria-hidden="true">
                                →
                              </b>
                            </Link>
                          )
                        )}
                      </div>

                      <button
                        type="button"
                        className="navSearchViewAll"
                        onClick={performSearch}
                      >
                        <span>
                          View all matching products
                        </span>

                        <b aria-hidden="true">
                          →
                        </b>
                      </button>
                    </>
                  ) : (
                    <div className="navSearchNoResults">
                      <strong>
                        No matching products
                      </strong>

                      <span>
                        Try a product name, brand,
                        category or capacity.
                      </span>
                    </div>
                  )}
                </div>
              )}
          </form>

          {/* PRODUCTS */}

          <div
            className="navMegaWrap"
            onMouseEnter={() =>
              setProductsMenuOpen(true)
            }
            onMouseLeave={() =>
              setProductsMenuOpen(false)
            }
          >
            <Link
              href="/products"
              aria-current={
                isActive("/products")
                  ? "page"
                  : undefined
              }
              className={`navItem navInteractiveItem ${
                isActive("/products")
                  ? "navItemActive"
                  : ""
              }`}
              onClick={() =>
                setProductsMenuOpen(false)
              }
            >
              <span className="navItemGlow" />

              <span className="navItemText">
                Products
              </span>
            </Link>

            <div
              className={`navMegaPanel ${
                productsMenuOpen
                  ? "isOpen"
                  : ""
              }`}
            >
              <div className="megaAmbientGlow" />

              <div className="megaGrid">
                <div className="megaGroup">
                  <div className="megaLabel">
                    Solar Products
                  </div>

                  <div className="megaLinks">
                    {PRODUCT_LINKS.map((item) => (
                      <Link
                        href={item.href}
                        key={item.label}
                        onClick={() =>
                          setProductsMenuOpen(false)
                        }
                      >
                        <i>
                          {item.icon}
                        </i>

                        <span>
                          {item.label}
                        </span>

                        <b>→</b>
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/build-your-system"
                    className="megaBuildLink"
                    onClick={() =>
                      setProductsMenuOpen(false)
                    }
                  >
                    <span>
                      Build Your System
                    </span>

                    <b>→</b>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* STANDARD NAVIGATION */}

          {MAIN_NAV_LINKS.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                className={`navItem navInteractiveItem ${
                  active
                    ? "navItemActive"
                    : ""
                }`}
              >
                <span className="navItemGlow" />

                <span className="navItemText">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* =================================================
              UPGRADED FEATURES
              ================================================= */}

          <div
            className="navFeatureBlock"
            aria-label="Desh Solar upgraded features"
          >
            <span
              className="navFeatureAmbient"
              aria-hidden="true"
            />

            <span
              className="navFeatureSweep"
              aria-hidden="true"
            />

            {FEATURE_LINKS.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  href={item.href}
                  key={item.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`navFeatureItem ${
                    item.className
                  } ${
                    active
                      ? "navFeatureActive"
                      : ""
                  }`}
                >
                  <span
                    className="navFeatureIcon"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  <span className="navFeatureText">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* =================================================
              CART
              ================================================= */}

          <button
            type="button"
            aria-current={
              isActive("/cart")
                ? "page"
                : undefined
            }
            aria-expanded={cartOpen}
            aria-controls="cartQuickDrawer"
            className={`navCart ${
              isActive("/cart")
                ? "navCartActive"
                : ""
            }`}
            aria-label={`Open shopping cart. ${cartCount} ${
              cartCount === 1 ? "item" : "items"
            } in cart`}
            onClick={openCart}
          >
            <span
              className="navCartGlow"
              aria-hidden="true"
            />

            <span className="navCartIcon">
              <CartIcon />
            </span>

            <span className="navCartLabel">
              Cart
            </span>

            <span
              className="cartCount"
              aria-hidden="true"
            >
              {cartCount}
            </span>
          </button>
        </div>

        {/* =================================================
            MOBILE / TABLET INDEPENDENT TOOLS
            Search remains outside the hamburger menu.
            ================================================= */}

        <div className="navMobileTools">
          <form
            className={`navMobileInlineSearch ${
              searchOpen
                ? "isOpen"
                : ""
            }`}
            role="search"
            onSubmit={submitSearch}
          >
            <button
              type="button"
              className="navMobileInlineSearchToggle"
              aria-label={
                searchOpen
                  ? "Search products"
                  : "Open product search"
              }
              aria-expanded={searchOpen}
              onClick={() => {
                if (!searchOpen) {
                  openSearch(
                    mobileSearchInputRef
                  );
                  return;
                }

                performSearch();
              }}
            >
              <SearchIcon />
            </button>

            <input
              ref={mobileSearchInputRef}
              type="search"
              value={searchQuery}
              onChange={(event) => {
                const value =
                  event.target.value;

                setSearchQuery(value);
                setSearchSuggestionsOpen(
                  value.trim().length > 0
                );
              }}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setSearchSuggestionsOpen(true);
                }
              }}
              placeholder="Search products..."
              autoComplete="off"
              aria-label="Search products"
              tabIndex={searchOpen ? 0 : -1}
            />

            {searchOpen && (
              <button
                type="button"
                className="navMobileInlineSearchClose"
                aria-label={
                  searchQuery
                    ? "Clear product search"
                    : "Close product search"
                }
                onClick={() => {
                  if (searchQuery) {
                    setSearchQuery("");
                    setSearchSuggestionsOpen(false);

                    window.requestAnimationFrame(() => {
                      mobileSearchInputRef.current?.focus();
                    });

                    return;
                  }

                  closeSearch();
                }}
              >
                ×
              </button>
            )}

            {searchOpen &&
              searchSuggestionsOpen &&
              searchQuery.trim() && (
                <div
                  className="navSearchSuggestions navSearchSuggestionsMobile"
                  role="listbox"
                  aria-label="Matching products"
                >
                  {matchingProducts.length > 0 ? (
                    <>
                      <div className="navSearchSuggestionList">
                        {matchingProducts.map(
                          (product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              className="navSearchSuggestionItem"
                              onClick={() =>
                                setSearchSuggestionsOpen(
                                  false
                                )
                              }
                            >
                              <span className="navSearchSuggestionImage">
                                <Image
                                  src={product.image}
                                  alt=""
                                  width={56}
                                  height={48}
                                />
                              </span>

                              <span className="navSearchSuggestionInfo">
                                <small>
                                  {product.brandLabel}
                                  {" · "}
                                  {product.categoryLabel}
                                </small>

                                <strong>
                                  {product.name}
                                </strong>

                                <span>
                                  {product.priceText}
                                  {product.power
                                    ? ` · ${product.power}`
                                    : ""}
                                </span>
                              </span>

                              <b aria-hidden="true">
                                →
                              </b>
                            </Link>
                          )
                        )}
                      </div>

                      <button
                        type="button"
                        className="navSearchViewAll"
                        onClick={performSearch}
                      >
                        <span>
                          View all matching products
                        </span>

                        <b aria-hidden="true">
                          →
                        </b>
                      </button>
                    </>
                  ) : (
                    <div className="navSearchNoResults">
                      <strong>
                        No matching products
                      </strong>

                      <span>
                        Try a product name, brand,
                        category or capacity.
                      </span>
                    </div>
                  )}
                </div>
              )}
          </form>

          <button
            type="button"
            className={`navToggle ${
              mobileOpen
                ? "active"
                : ""
            }`}
            aria-label={
              mobileOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            aria-controls="mobileMenu"
            onClick={() => {
              setSearchOpen(false);
              setProductsMenuOpen(false);
              setMobileOpen(
                (open) => !open
              );
            }}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {searchOpen && (
        <div
          className="mobileSearchLayoutSpacer"
          aria-hidden="true"
        />
      )}

      {/* ===================================================
          MOBILE MENU
          =================================================== */}

      <div
        id="mobileMenu"
        className={`mobileMenu ${
          mobileOpen
            ? "open"
            : ""
        }`}
      >
        <span
          className="mobileMenuAmbient mobileMenuAmbientOne"
          aria-hidden="true"
        />

        <span
          className="mobileMenuAmbient mobileMenuAmbientTwo"
          aria-hidden="true"
        />

        <div className="mobileMenuInner">
          {/* ===============================================
              STANDARD MOBILE MENU
              =============================================== */}

          <div className="mobilePrimaryLinks">
            <Link
              href="/products"
              onClick={closeMobileMenu}
              aria-current={
                isActive("/products")
                  ? "page"
                  : undefined
              }
              className={`mobilePrimaryLink ${
                isActive("/products")
                  ? "mobilePrimaryActive"
                  : ""
              }`}
            >
              <span className="mobilePrimaryGlow" />

              <span className="mobilePrimaryText">
                Products
              </span>

              <b>→</b>
            </Link>

            {MAIN_NAV_LINKS.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`mobilePrimaryLink ${
                    active
                      ? "mobilePrimaryActive"
                      : ""
                  }`}
                >
                  <span className="mobilePrimaryGlow" />

                  <span className="mobilePrimaryText">
                    {item.label}
                  </span>

                  <b>→</b>
                </Link>
              );
            })}
          </div>

          {/* ===============================================
              UPGRADED FEATURES
              =============================================== */}

          <div className="mobileFeatureGroup">
            <span
              className="mobileFeatureAmbient"
              aria-hidden="true"
            />

            <span
              className="mobileFeatureSweep"
              aria-hidden="true"
            />

            <div className="mobileFeatureLabel">
              Upgraded Solar Features
            </div>

            {FEATURE_LINKS.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobileFeatureLink ${
                    item.mobileClassName
                  } ${
                    active
                      ? "mobileFeatureActive"
                      : ""
                  }`}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  onClick={closeMobileMenu}
                >
                  <span className="mobileFeatureLinkGlow" />

                  <span>
                    <i>
                      {item.icon}
                    </i>

                    <span className="mobileFeatureText">
                      {item.label}
                    </span>
                  </span>

                  <b>→</b>
                </Link>
              );
            })}
          </div>

          {/* ===============================================
              MOBILE CART
              =============================================== */}

          <button
            type="button"
            onClick={openCart}
            aria-current={
              isActive("/cart")
                ? "page"
                : undefined
            }
            aria-expanded={cartOpen}
            aria-controls="cartQuickDrawer"
            className={`mobileCart ${
              isActive("/cart")
                ? "mobileCartActive"
                : ""
            }`}
            aria-label={`Open shopping cart. ${cartCount} ${
              cartCount === 1 ? "item" : "items"
            } in cart`}
          >
            <span className="mobileCartGlow" />

            <span className="mobileCartLabel">
              <span className="mobileCartIcon">
                <CartIcon />
              </span>

              Cart
            </span>

            <span
              className="mobileCartCount"
              aria-hidden="true"
            >
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {cartToast && (
        <div
          className={`headerCartToast ${
            cartToast.type === "added"
              ? "headerCartToastAdded"
              : "headerCartToastRemoved"
          }`}
          role="status"
          aria-live="polite"
        >
          <span
            className="headerCartToastPointer"
            aria-hidden="true"
          />

          <small>CART</small>

          <strong>
            {cartToast.type === "added"
              ? "Added to Cart"
              : "Removed from Cart"}
          </strong>

          <span className="headerCartToastProduct">
            {cartToast.productName}
          </span>
        </div>
      )}

      <CartQuickDrawer
        open={cartOpen}
        onClose={closeCart}
      />
    </header>
  );
}