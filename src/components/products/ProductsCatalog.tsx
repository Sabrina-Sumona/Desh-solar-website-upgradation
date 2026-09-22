"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductQuickView from "@/components/products/ProductQuickView";
import ProductCompare from "@/components/products/ProductCompare";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  productApplications,
  productCategories,
  products,
  type Product,
} from "@/data/products";

type SortValue =
  | "featured"
  | "price-low"
  | "price-high"
  | "power-high";

type ProductsCatalogProps = {
  catalogMode?: "products" | "packages";
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  priceText: string;
  image: string;
  category: string;
  quoteOnly: boolean;
  qty: number;
};

const CART_KEY = "deshSolarCartV1";

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(CART_KEY) || "[]"
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(
    CART_KEY,
    JSON.stringify(items)
  );

  const count = items.reduce(
    (total, item) =>
      total +
      Math.max(
        1,
        Number(item.qty) || 1
      ),
    0
  );

  const subtotal = items.reduce(
    (total, item) =>
      total +
      (item.quoteOnly
        ? 0
        : Number(item.price || 0) *
          Math.max(
            1,
            Number(item.qty) || 1
          )),
    0
  );

  window.dispatchEvent(
    new CustomEvent(
      "deshsolar:cartchange",
      {
        detail: {
          items,
          count,
          subtotal,
          hasQuote: items.some(
            (item) => item.quoteOnly
          ),
        },
      }
    )
  );
}

const categoryLabels: Record<
  string,
  string
> = {
  panel: "Solar Panel",
  inverter: "Solar Inverter",
  battery: "Lithium Battery",
  portable: "Portable Power",
  system: "Complete System / Pump",
};

const VALID_CATEGORY_VALUES = new Set([
  "panel",
  "inverter",
  "battery",
  "portable",
]);

const PRODUCT_CATEGORY_OPTIONS =
  productCategories.filter(
    (item) => item.value !== "system"
  );

function CatalogQuerySync({
  onQueryChange,
}: {
  onQueryChange: (
    category: string,
    search: string
  ) => void;
}) {
  const searchParams = useSearchParams();

  const requestedCategory =
    searchParams.get("category");

  const requestedSearch =
    searchParams.get("search") || "";

  useEffect(() => {
    const nextCategory =
      requestedCategory &&
      VALID_CATEGORY_VALUES.has(
        requestedCategory
      )
        ? requestedCategory
        : "all";

    onQueryChange(
      nextCategory,
      requestedSearch
    );
  }, [
    requestedCategory,
    requestedSearch,
    onQueryChange,
  ]);

  return null;
}

function numericPower(value: string) {
  const match = value
    .replace(/,/g, "")
    .match(/[0-9]+(?:\.[0-9]+)?/);

  return match
    ? Number(match[0])
    : 0;
}

function ProductCard({
  product,
  onQuickView,
  isCompared,
  onCompare,
  catalogMode,
}: {
  product: Product;
  onQuickView: (
    product: Product
  ) => void;
  isCompared: boolean;
  onCompare: (
    product: Product
  ) => void;
  catalogMode:
    | "products"
    | "packages";
}) {
  const [
    cartQuantity,
    setCartQuantity,
  ] = useState(0);

  const syncCartQuantity =
    useCallback(() => {
      const item = readCart().find(
        (cartItem) =>
          String(cartItem.id) ===
          product.id
      );

      setCartQuantity(
        item
          ? Math.max(
              1,
              Number(item.qty) || 1
            )
          : 0
      );
    }, [product.id]);

  useEffect(() => {
    /*
     * Delay the initial state synchronization until after
     * the effect body. This avoids synchronous setState
     * inside the effect while preserving cart hydration.
     */
    const frameId =
      window.requestAnimationFrame(
        syncCartQuantity
      );

    const handleCartChange = () =>
      syncCartQuantity();

    const handleStorage = () =>
      syncCartQuantity();

    window.addEventListener(
      "deshsolar:cartchange",
      handleCartChange
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.cancelAnimationFrame(
        frameId
      );

      window.removeEventListener(
        "deshsolar:cartchange",
        handleCartChange
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [syncCartQuantity]);

  const updateCartQuantity = (
    nextQuantity: number
  ) => {
    const items = readCart();

    const existingIndex =
      items.findIndex(
        (item) =>
          String(item.id) ===
          product.id
      );

    if (nextQuantity <= 0) {
      const nextItems =
        existingIndex >= 0
          ? items.filter(
              (_, index) =>
                index !== existingIndex
            )
          : items;

      writeCart(nextItems);
      setCartQuantity(0);

      return;
    }

    if (existingIndex >= 0) {
      items[existingIndex] = {
        ...items[existingIndex],
        qty: nextQuantity,
      };
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price ?? 0,
        priceText:
          product.priceText ||
          "Contact for price",
        image: product.image,
        category:
          product.categoryLabel ||
          categoryLabels[
            product.category
          ] ||
          "Product",
        quoteOnly:
          product.price === null,
        qty: nextQuantity,
      });
    }

    writeCart(items);

    setCartQuantity(
      nextQuantity
    );
  };

  const addToCart = () => {
    const existing =
      readCart().find(
        (item) =>
          String(item.id) ===
          product.id
      );

    const currentQuantity =
      existing
        ? Math.max(
            1,
            Number(existing.qty) || 1
          )
        : 0;

    updateCartQuantity(
      currentQuantity + 1
    );
  };

  const incrementCart = () => {
    updateCartQuantity(
      cartQuantity + 1
    );
  };

  const decrementCart = () => {
    if (cartQuantity <= 1) {
      return;
    }

    updateCartQuantity(
      cartQuantity - 1
    );
  };

  const removeFromCart = () => {
    updateCartQuantity(0);
  };

  return (
    <article className="realProduct">
      <Link
        href={`/products/${product.id}`}
        className="realProductMedia"
        aria-label={`View ${product.name}`}
      >
        <Image
          src={product.image}
          alt={product.name}
          width={700}
          height={520}
          sizes="(max-width: 639px) 145px, (max-width: 899px) 50vw, (max-width: 1279px) 33vw, 25vw"
        />

        <span className="realProductBadge">
          {product.categoryLabel ||
            categoryLabels[
              product.category
            ]}
        </span>
      </Link>

      <div className="realProductBody">
        <div className="plProductHeader">
          <div>
            <span>
              {product.categoryLabel ||
                categoryLabels[
                  product.category
                ]}
            </span>

            <b>
              {product.brandLabel}
            </b>
          </div>

          <span
            className="plRating"
            aria-label="Desh Solar catalogue product"
          >
            DESH SOLAR
          </span>
        </div>

        <h3>
          <Link
            href={`/products/${product.id}`}
          >
            {product.name}
          </Link>
        </h3>

        <div className="realProductPrice">
          <div className="realProductPriceMain">
            <span className="plPriceLabel">
              CURRENT PRICE
            </span>

            <div className="realProductPriceValue">
              <strong>
                {product.priceText}
              </strong>

              {product.oldPriceText && (
                <del>
                  {
                    product.oldPriceText
                  }
                </del>
              )}

              {catalogMode === "products" && (
                <div
                  className="piProductStock piProductStock--inline"
                  aria-label="Availability: In Stock"
                >
                  <span aria-hidden="true" />
                  <strong>In Stock</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="piCardActionGrid">
          <button
            type="button"
            className="piCardQuickBtn"
            onClick={() =>
              onQuickView(product)
            }
            aria-label={`Quick view ${product.name}`}
          >
            Quick View
          </button>

          <button
            type="button"
            className={`piCardCompareBtn${
              isCompared
                ? " isSelected"
                : ""
            }`}
            onClick={() =>
              onCompare(product)
            }
            aria-pressed={
              isCompared
            }
          >
            {isCompared
              ? "Selected ✓"
              : "Compare"}
          </button>
        </div>

        <Link
          className="piDetailsPrimary"
          href={`/products/${product.id}`}
        >
          {catalogMode ===
          "packages"
            ? "View Package Details →"
            : "View Product Details →"}
        </Link>

        {cartQuantity > 0 ? (
          <div className="piCartAddedControls">
            <div className="piCartQuantityRow">
              <button
                type="button"
                className="piCartQtyButton"
                onClick={
                  decrementCart
                }
                disabled={
                  cartQuantity <= 1
                }
                aria-label={`Decrease quantity of ${product.name}`}
              >
                −
              </button>

              <div className="piCartQtyStatus">
                <strong>
                  {cartQuantity}
                </strong>

                <span>
                  {product.price ===
                  null
                    ? "selected for quote"
                    : "in cart"}
                </span>
              </div>

              <button
                type="button"
                className="piCartQtyButton"
                onClick={
                  incrementCart
                }
                aria-label={`Increase quantity of ${product.name}`}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="piCartRemoveAction"
              onClick={
                removeFromCart
              }
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="piAddCartAction"
            onClick={addToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            {product.price ===
            null
              ? "Add for Quote +"
              : "Add to Cart +"}
          </button>
        )}
      </div>
    </article>
  );
}

export default function ProductsCatalog({
  catalogMode = "products",
}: ProductsCatalogProps) {
  const isPackageCatalog =
    catalogMode === "packages";

  const [
    category,
    setCategory,
  ] = useState("all");

  const [
    brand,
    setBrand,
  ] = useState("all");

  const [
    application,
    setApplication,
  ] = useState("all");

  const [
    sort,
    setSort,
  ] = useState<SortValue>(
    "featured"
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(false);

  const [
    quickViewProduct,
    setQuickViewProduct,
  ] = useState<Product | null>(
    null
  );

  const [
    compareProducts,
    setCompareProducts,
  ] = useState<Product[]>([]);

  const [
    compareOpen,
    setCompareOpen,
  ] = useState(false);

  const [
    compareNotice,
    setCompareNotice,
  ] = useState("");

  const [
    quickCategoriesFixed,
    setQuickCategoriesFixed,
  ] = useState(false);

  const quickCategoriesSlotRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const catalogSectionRef =
    useRef<HTMLElement | null>(
      null
    );

  const applyQueryFromUrl =
    useCallback(
      (
        nextCategory: string,
        nextSearch: string
      ) => {
        setCategory(
          isPackageCatalog
            ? "all"
            : nextCategory
        );

        setSearch(
          nextSearch
        );

        setBrand(
          "all"
        );

        setApplication(
          "all"
        );
      },
      [
        isPackageCatalog,
      ]
    );

  useEffect(() => {
    const updateQuickCategoryDock =
      () => {
        if (
          isPackageCatalog
        ) {
          setQuickCategoriesFixed(
            false
          );

          return;
        }

        const slot =
          quickCategoriesSlotRef.current;

        const catalog =
          catalogSectionRef.current;

        if (
          !slot ||
          !catalog
        ) {
          setQuickCategoriesFixed(
            false
          );

          return;
        }

        const slotRect =
          slot.getBoundingClientRect();

        const catalogRect =
          catalog.getBoundingClientRect();

        const triggerTop =
          window.innerWidth <=
          720
            ? 78
            : 86;

        const keepVisibleUntil =
          triggerTop + 72;

        setQuickCategoriesFixed(
          slotRect.top <=
            triggerTop &&
            catalogRect.bottom >
              keepVisibleUntil
        );
      };

    /*
     * Defer the first state synchronization until after
     * the effect body to satisfy React's effect rules.
     */
    const frameId =
      window.requestAnimationFrame(
        updateQuickCategoryDock
      );

    if (
      !isPackageCatalog
    ) {
      window.addEventListener(
        "scroll",
        updateQuickCategoryDock,
        {
          passive: true,
        }
      );

      window.addEventListener(
        "resize",
        updateQuickCategoryDock
      );
    }

    return () => {
      window.cancelAnimationFrame(
        frameId
      );

      window.removeEventListener(
        "scroll",
        updateQuickCategoryDock
      );

      window.removeEventListener(
        "resize",
        updateQuickCategoryDock
      );
    };
  }, [
    isPackageCatalog,
  ]);

  const catalogProducts =
    useMemo(
      () =>
        products.filter(
          (product) =>
            isPackageCatalog
              ? product.category ===
                "system"
              : product.category !==
                "system"
        ),
      [
        isPackageCatalog,
      ]
    );

  const brands =
    useMemo(() => {
      const map =
        new Map<
          string,
          string
        >();

      catalogProducts.forEach(
        (product) => {
          map.set(
            product.brand,
            product.brandLabel
          );
        }
      );

      return [
        ...map.entries(),
      ]
        .sort(
          (a, b) =>
            a[1].localeCompare(
              b[1]
            )
        )
        .map(
          ([
            value,
            label,
          ]) => ({
            value,
            label,
          })
        );
    }, [
      catalogProducts,
    ]);

  const visibleProducts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      const filtered =
        catalogProducts.filter(
          (product) => {
            const categoryMatch =
              category ===
                "all" ||
              product.category ===
                category;

            const brandMatch =
              brand ===
                "all" ||
              product.brand ===
                brand;

            const applicationMatch =
              application ===
                "all" ||
              product.apps.includes(
                application
              );

            const searchMatch =
              !query ||
              product.search
                .toLowerCase()
                .includes(
                  query
                ) ||
              product.name
                .toLowerCase()
                .includes(
                  query
                ) ||
              product.brandLabel
                .toLowerCase()
                .includes(
                  query
                ) ||
              product.power
                .toLowerCase()
                .includes(
                  query
                );

            return (
              categoryMatch &&
              brandMatch &&
              applicationMatch &&
              searchMatch
            );
          }
        );

      if (
        sort ===
        "price-low"
      ) {
        return [
          ...filtered,
        ].sort(
          (a, b) =>
            (a.price ??
              Number.MAX_SAFE_INTEGER) -
            (b.price ??
              Number.MAX_SAFE_INTEGER)
        );
      }

      if (
        sort ===
        "price-high"
      ) {
        return [
          ...filtered,
        ].sort(
          (a, b) =>
            (b.price ??
              -1) -
            (a.price ??
              -1)
        );
      }

      if (
        sort ===
        "power-high"
      ) {
        return [
          ...filtered,
        ].sort(
          (a, b) =>
            numericPower(
              b.power
            ) -
            numericPower(
              a.power
            )
        );
      }

      return [
        ...filtered,
      ].sort(
        (a, b) =>
          a.featuredOrder -
          b.featuredOrder
      );
    }, [
      application,
      brand,
      catalogProducts,
      category,
      search,
      sort,
    ]);

  const toggleCompare = (
    product: Product
  ) => {
    setCompareProducts(
      (current) => {
        const alreadySelected =
          current.some(
            (item) =>
              item.id ===
              product.id
          );

        if (
          alreadySelected
        ) {
          return current.filter(
            (item) =>
              item.id !==
              product.id
          );
        }

        if (
          current.length >
            0 &&
          current[0]
            .category !==
            product.category
        ) {
          setCompareNotice(
            `Compare works best within one category. Started a new ${product.categoryLabel} comparison.`
          );

          window.setTimeout(
            () =>
              setCompareNotice(
                ""
              ),
            2400
          );

          return [
            product,
          ];
        }

        if (
          current.length >=
          4
        ) {
          setCompareNotice(
            "You can compare up to 4 products at a time."
          );

          window.setTimeout(
            () =>
              setCompareNotice(
                ""
              ),
            2400
          );

          return current;
        }

        return [
          ...current,
          product,
        ];
      }
    );
  };

  const removeCompareProduct =
    (
      productId: string
    ) => {
      setCompareProducts(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              productId
          )
      );
    };

  /*
   * After a filter is applied, return the visitor
   * to the top of the current catalogue page.
   *
   * Smooth scrolling makes the transition clear
   * without performing a page reload.
   */
  const scrollToPageTop =
    useCallback(() => {
      window.requestAnimationFrame(
        () => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior:
              "smooth",
          });
        }
      );
    }, []);

  const selectQuickCategory =
    (
      value: string
    ) => {
      setCategory(
        value
      );

      setBrand(
        "all"
      );

      setApplication(
        "all"
      );

      scrollToPageTop();
    };

  return (
    <>
      <Suspense
        fallback={null}
      >
        <CatalogQuerySync
          onQueryChange={
            applyQueryFromUrl
          }
        />
      </Suspense>

      <section
        className={`plCompactHero${
          isPackageCatalog
            ? " packageHero"
            : ""
        }`}
      >
        <div className="plCompactHeroCopy">
          <div className="demoEyebrow">
            {isPackageCatalog
              ? "Desh Solar Packages"
              : "Desh Solar Products"}
          </div>

          <h1>
            {isPackageCatalog
              ? "Complete solar packages."
              : "Solar products."}
          </h1>

          <p>
            {isPackageCatalog
              ? "Complete solar systems and solar pump packages — browse ready-made configurations for different energy requirements."
              : "Panels, inverters, batteries and portable power — browse individual solar products below."}
          </p>
        </div>

        {!isPackageCatalog && (
          <div
            ref={
              quickCategoriesSlotRef
            }
            className="plQuickCategoriesSlot"
          >
            <div
              className={`plQuickCategories${
                quickCategoriesFixed
                  ? " isFixed"
                  : ""
              }`}
              aria-label="Product category shortcuts"
            >
              {PRODUCT_CATEGORY_OPTIONS.map(
                (item) => (
                  <button
                    key={
                      item.value
                    }
                    type="button"
                    className={
                      category ===
                      item.value
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      selectQuickCategory(
                        item.value
                      )
                    }
                  >
                    {
                      item.label
                    }
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </section>

      <section
        ref={
          catalogSectionRef
        }
        className={`productsCatalogSection${
          quickCategoriesFixed
            ? " quickCategoriesDocked"
            : ""
        }`}
        id="catalog"
      >
        <div className="demoSectionHead">
          <div>
            <div className="demoEyebrow">
              {isPackageCatalog
                ? "Package Catalogue"
                : "Product Catalogue"}
            </div>

            <h2>
              {isPackageCatalog
                ? "Browse packages."
                : "Browse products."}
            </h2>
          </div>

          <p className="demoSectionLead">
            {isPackageCatalog
              ? "Browse complete configurations. Open a package for its system details."
              : "Browse quickly. Open a product for full specifications and system details."}
          </p>
        </div>

        <button
          type="button"
          className="piMobileFiltersButton"
          onClick={() =>
            setFiltersOpen(
              true
            )
          }
        >
          Filters
        </button>

        {filtersOpen && (
          <button
            type="button"
            className="productsFilterBackdrop"
            aria-label="Close filters"
            onClick={() =>
              setFiltersOpen(
                false
              )
            }
          />
        )}

        <div
          className={`catalogToolbar${
            isPackageCatalog
              ? " packageToolbar"
              : ""
          }${
            filtersOpen
              ? " isOpen"
              : ""
          }`}
        >
          <div className="piMobileFilterHead">
            <b>
              {isPackageCatalog
                ? "Package Filters"
                : "Product Filters"}
            </b>

            <button
              type="button"
              onClick={() =>
                setFiltersOpen(
                  false
                )
              }
            >
              ×
            </button>
          </div>

          <input
            className="catalogInput"
            type="search"
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder={
              isPackageCatalog
                ? "Search packages, system size or application…"
                : "Search products, brands or capacity…"
            }
            aria-label={
              isPackageCatalog
                ? "Search packages"
                : "Search products"
            }
          />

          {!isPackageCatalog && (
            <select
              className="catalogSelect"
              value={
                category
              }
              onChange={(
                event
              ) => {
                setCategory(
                  event.target
                    .value
                );

                scrollToPageTop();
              }}
              aria-label="Product category"
            >
              <option value="all">
                All categories
              </option>

              <option value="panel">
                Solar Panel
              </option>

              <option value="portable">
                Portable Power
              </option>

              <option value="battery">
                Lithium Battery
              </option>

              <option value="inverter">
                Solar Inverter
              </option>
            </select>
          )}

          <select
            className="catalogSelect"
            value={brand}
            onChange={(
              event
            ) => {
              setBrand(
                event.target
                  .value
              );

              scrollToPageTop();
            }}
            aria-label="Product brand"
          >
            <option value="all">
              All brands
            </option>

            {brands.map(
              (item) => (
                <option
                  key={
                    item.value
                  }
                  value={
                    item.value
                  }
                >
                  {
                    item.label
                  }
                </option>
              )
            )}
          </select>

          <select
            className="catalogSelect piExtraFilter"
            value={
              application
            }
            onChange={(
              event
            ) => {
              setApplication(
                event.target
                  .value
              );

              scrollToPageTop();
            }}
            aria-label="Product application"
          >
            {productApplications.map(
              (item) => (
                <option
                  key={
                    item.value
                  }
                  value={
                    item.value
                  }
                >
                  {
                    item.label
                  }
                </option>
              )
            )}
          </select>

          <select
            className="catalogSelect piExtraFilter"
            value={sort}
            onChange={(
              event
            ) => {
              setSort(
                event.target
                  .value as SortValue
              );

              scrollToPageTop();
            }}
            aria-label="Sort products"
          >
            <option value="featured">
              Featured
            </option>

            <option value="price-low">
              Price: low to high
            </option>

            <option value="price-high">
              Price: high to low
            </option>

            <option value="power-high">
              Capacity / power
              high first
            </option>
          </select>

          <div className="catalogCount">
            {
              visibleProducts.length
            }{" "}
            shown
          </div>
        </div>

        {visibleProducts.length >
        0 ? (
          <div className="realProductGrid">
            {visibleProducts.map(
              (product) => (
                <ProductCard
                  key={
                    product.id
                  }
                  product={
                    product
                  }
                  onQuickView={
                    setQuickViewProduct
                  }
                  isCompared={compareProducts.some(
                    (item) =>
                      item.id ===
                      product.id
                  )}
                  onCompare={
                    toggleCompare
                  }
                  catalogMode={
                    catalogMode
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="productsEmptyState">
            <span>
              NO MATCH
            </span>

            <h3>
              {isPackageCatalog
                ? "No packages match these filters."
                : "No products match these filters."}
            </h3>

            <button
              type="button"
              onClick={() => {
                setSearch(
                  ""
                );

                setCategory(
                  "all"
                );

                setBrand(
                  "all"
                );

                setApplication(
                  "all"
                );

                setSort(
                  "featured"
                );

                scrollToPageTop();
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      <ProductQuickView
        product={
          quickViewProduct
        }
        onClose={() =>
          setQuickViewProduct(
            null
          )
        }
      />

      <ProductCompare
        products={
          compareProducts
        }
        isOpen={
          compareOpen
        }
        onOpen={() =>
          setCompareOpen(
            true
          )
        }
        onClose={() =>
          setCompareOpen(
            false
          )
        }
        onRemove={
          removeCompareProduct
        }
        onClear={() => {
          setCompareProducts(
            []
          );

          setCompareOpen(
            false
          );
        }}
      />

      {compareNotice && (
        <div
          className="pcNotice"
          role="status"
        >
          {
            compareNotice
          }
        </div>
      )}
    </>
  );
}