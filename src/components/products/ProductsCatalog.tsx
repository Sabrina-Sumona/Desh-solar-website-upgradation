"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

type SortValue = "featured" | "price-low" | "price-high" | "power-high";

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
const PRODUCTS_PER_PAGE = 24;

type PaginationItem = number | "ellipsis";

function buildPaginationItems(
  currentPage: number,
  totalPages: number
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([
    1,
    totalPages,
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ]);

  const orderedPages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const items: PaginationItem[] = [];

  orderedPages.forEach((page, index) => {
    const previousPage = orderedPages[index - 1];

    if (index > 0 && previousPage && page - previousPage > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  });

  return items;
}

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
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));

  const count = items.reduce(
    (total, item) =>
      total + Math.max(1, Number(item.qty) || 1),
    0
  );

  const subtotal = items.reduce(
    (total, item) =>
      total +
      (item.quoteOnly
        ? 0
        : Number(item.price || 0) *
          Math.max(1, Number(item.qty) || 1)),
    0
  );

  window.dispatchEvent(
    new CustomEvent("deshsolar:cartchange", {
      detail: {
        items,
        count,
        subtotal,
        hasQuote: items.some((item) => item.quoteOnly),
      },
    })
  );
}

const categoryLabels: Record<string, string> = {
  panel: "Solar Panel",
  inverter: "Solar Inverter",
  battery: "Battery",
  ips: "IPS / UPS",
  portable: "Portable Power",
  component: "Components & Protection",
  system: "Complete System / Pump",
};

const VALID_CATEGORY_VALUES = new Set([
  "panel",
  "inverter",
  "battery",
  "ips",
  "portable",
  "component",
]);

const PRODUCT_CATEGORY_OPTIONS =
  productCategories.filter(
    (item) => item.value !== "system"
  );

const VALID_SORT_VALUES = new Set<SortValue>([
  "featured",
  "price-low",
  "price-high",
  "power-high",
]);

const VALID_APPLICATION_VALUES = new Set(
  productApplications.map((item) => item.value)
);

function CatalogQuerySync({
  onQueryChange,
}: {
  onQueryChange: (
    category: string,
    search: string,
    page: number,
    brand: string,
    application: string,
    sort: SortValue
  ) => void;
}) {
  const searchParams = useSearchParams();
  const requestedCategory =
    searchParams.get("category");
  const requestedSearch =
    searchParams.get("search") || "";
  const requestedPage = Number(
    searchParams.get("page") || "1"
  );
  const requestedBrand =
    searchParams.get("brand") || "all";
  const requestedApplication =
    searchParams.get("application") || "all";
  const requestedSort =
    searchParams.get("sort") || "featured";

  useEffect(() => {
    const nextCategory =
      requestedCategory &&
      VALID_CATEGORY_VALUES.has(
        requestedCategory
      )
        ? requestedCategory
        : "all";

    const nextPage =
      Number.isInteger(requestedPage) &&
      requestedPage > 0
        ? requestedPage
        : 1;

    const nextApplication =
      requestedApplication === "all" ||
      VALID_APPLICATION_VALUES.has(
        requestedApplication
      )
        ? requestedApplication
        : "all";

    const nextSort =
      VALID_SORT_VALUES.has(
        requestedSort as SortValue
      )
        ? (requestedSort as SortValue)
        : "featured";

    onQueryChange(
      nextCategory,
      requestedSearch,
      nextPage,
      requestedBrand,
      nextApplication,
      nextSort
    );
  }, [
    requestedCategory,
    requestedSearch,
    requestedPage,
    requestedBrand,
    requestedApplication,
    requestedSort,
    onQueryChange,
  ]);

  return null;
}

function numericPower(value: string) {
  const match = value.replace(/,/g, "").match(/[0-9]+(?:\.[0-9]+)?/);
  return match ? Number(match[0]) : 0;
}

function ProductCard({
  product,
  onQuickView,
  isCompared,
  onCompare,
  catalogMode,
}: {
  product: Product;
  onQuickView: (product: Product) => void;
  isCompared: boolean;
  onCompare: (product: Product) => void;
  catalogMode: "products" | "packages";
}) {
  const [cartQuantity, setCartQuantity] = useState(0);

  const syncCartQuantity = () => {
    const item = readCart().find(
      (cartItem) => String(cartItem.id) === product.id
    );

    setCartQuantity(
      item ? Math.max(1, Number(item.qty) || 1) : 0
    );
  };

  useEffect(() => {
    syncCartQuantity();

    const handleCartChange = () => syncCartQuantity();
    const handleStorage = () => syncCartQuantity();

    window.addEventListener(
      "deshsolar:cartchange",
      handleCartChange
    );
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "deshsolar:cartchange",
        handleCartChange
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, [product.id]);

  const updateCartQuantity = (nextQuantity: number) => {
    const items = readCart();
    const existingIndex = items.findIndex(
      (item) => String(item.id) === product.id
    );

    if (nextQuantity <= 0) {
      const nextItems =
        existingIndex >= 0
          ? items.filter((_, index) => index !== existingIndex)
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
          product.priceText || "Contact for price",
        image: product.image,
        category:
          product.categoryLabel ||
          categoryLabels[product.category] ||
          "Product",
        quoteOnly: product.price === null,
        qty: nextQuantity,
      });
    }

    writeCart(items);
    setCartQuantity(nextQuantity);
  };

  const addToCart = () => {
    const existing = readCart().find(
      (item) => String(item.id) === product.id
    );

    const currentQuantity = existing
      ? Math.max(1, Number(existing.qty) || 1)
      : 0;

    updateCartQuantity(currentQuantity + 1);
  };

  const incrementCart = () => {
    updateCartQuantity(cartQuantity + 1);
  };

  const decrementCart = () => {
    if (cartQuantity <= 1) {
      return;
    }

    updateCartQuantity(cartQuantity - 1);
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
          {product.categoryLabel || categoryLabels[product.category]}
        </span>
      </Link>

      <div className="realProductBody">
        <div className="plProductHeader">
          <div>
            <span>{product.categoryLabel || categoryLabels[product.category]}</span>
            <b>{product.brandLabel}</b>
          </div>

          <span className="plRating" aria-label="Desh Solar catalogue product">
            DESH SOLAR
          </span>
        </div>

        <h3>
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        <div className="realProductPrice">
          <div>
            <span className="plPriceLabel">CURRENT PRICE</span>
            <strong>{product.priceText}</strong>
            {product.oldPriceText && <del>{product.oldPriceText}</del>}
          </div>
        </div>

        <div className="piCardActionGrid">
          <button
            type="button"
            className="piCardQuickBtn"
            onClick={() => onQuickView(product)}
            aria-label={`Quick view ${product.name}`}
          >
            Quick View
          </button>
          <button
            type="button"
            className={`piCardCompareBtn${isCompared ? " isSelected" : ""}`}
            onClick={() => onCompare(product)}
            aria-pressed={isCompared}
          >
            {isCompared ? "Selected ✓" : "Compare"}
          </button>
        </div>

        <Link className="piDetailsPrimary" href={`/products/${product.id}`}>
          {catalogMode === "packages"
            ? "View Package Details →"
            : "View Product Details →"}
        </Link>

        {cartQuantity > 0 ? (
          <div className="piCartAddedControls">
            <div className="piCartQuantityRow">
              <button
                type="button"
                className="piCartQtyButton"
                onClick={decrementCart}
                disabled={cartQuantity <= 1}
                aria-label={`Decrease quantity of ${product.name}`}
              >
                −
              </button>

              <div className="piCartQtyStatus">
                <strong>{cartQuantity}</strong>
                <span>
                  {product.price === null
                    ? "selected for quote"
                    : "in cart"}
                </span>
              </div>

              <button
                type="button"
                className="piCartQtyButton"
                onClick={incrementCart}
                aria-label={`Increase quantity of ${product.name}`}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="piCartRemoveAction"
              onClick={removeFromCart}
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
            {product.price === null
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
  const router = useRouter();
  const pathname = usePathname();
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [application, setApplication] = useState("all");
  const [sort, setSort] = useState<SortValue>("featured");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareNotice, setCompareNotice] = useState("");
  const [quickCategoriesFixed, setQuickCategoriesFixed] =
    useState(false);

  const quickCategoriesSlotRef =
    useRef<HTMLDivElement | null>(null);
  const catalogSectionRef =
    useRef<HTMLElement | null>(null);

  const updateCatalogUrl = useCallback(
    ({
      nextCategory,
      nextSearch,
      nextBrand,
      nextApplication,
      nextSort,
      nextPage,
      mode = "replace",
    }: {
      nextCategory: string;
      nextSearch: string;
      nextBrand: string;
      nextApplication: string;
      nextSort: SortValue;
      nextPage: number;
      mode?: "replace" | "push";
    }) => {
      const params = new URLSearchParams(
        typeof window !== "undefined"
          ? window.location.search
          : ""
      );

      if (nextCategory === "all") {
        params.delete("category");
      } else {
        params.set(
          "category",
          nextCategory
        );
      }

      if (nextSearch.trim()) {
        params.set(
          "search",
          nextSearch.trim()
        );
      } else {
        params.delete("search");
      }

      if (nextBrand === "all") {
        params.delete("brand");
      } else {
        params.set("brand", nextBrand);
      }

      if (nextApplication === "all") {
        params.delete("application");
      } else {
        params.set(
          "application",
          nextApplication
        );
      }

      if (nextSort === "featured") {
        params.delete("sort");
      } else {
        params.set("sort", nextSort);
      }

      if (nextPage <= 1) {
        params.delete("page");
      } else {
        params.set(
          "page",
          String(nextPage)
        );
      }

      const query = params.toString();
      const target = query
        ? `${pathname}?${query}`
        : pathname;

      if (mode === "push") {
        router.push(target, {
          scroll: false,
        });
      } else {
        router.replace(target, {
          scroll: false,
        });
      }
    },
    [pathname, router]
  );

  const applyQueryFromUrl = useCallback(
    (
      nextCategory: string,
      nextSearch: string,
      nextPage: number,
      nextBrand: string,
      nextApplication: string,
      nextSort: SortValue
    ) => {
      setCategory(
        isPackageCatalog
          ? "all"
          : nextCategory
      );
      setSearch(nextSearch);
      setBrand(nextBrand);
      setApplication(nextApplication);
      setSort(nextSort);
      setCurrentPage(
        isPackageCatalog
          ? 1
          : nextPage
      );
    },
    [isPackageCatalog]
  );

  const resetToFirstPage = useCallback(
    ({
      nextCategory = category,
      nextSearch = search,
      nextBrand = brand,
      nextApplication = application,
      nextSort = sort,
    }: {
      nextCategory?: string;
      nextSearch?: string;
      nextBrand?: string;
      nextApplication?: string;
      nextSort?: SortValue;
    } = {}) => {
      setCurrentPage(1);

      if (isPackageCatalog) {
        return;
      }

      updateCatalogUrl({
        nextCategory,
        nextSearch,
        nextBrand,
        nextApplication,
        nextSort,
        nextPage: 1,
      });
    },
    [
      application,
      brand,
      category,
      isPackageCatalog,
      search,
      sort,
      updateCatalogUrl,
    ]
  );

  useEffect(() => {
    if (isPackageCatalog) {
      setQuickCategoriesFixed(false);
      return;
    }

    const updateQuickCategoryDock = () => {
      const slot =
        quickCategoriesSlotRef.current;
      const catalog =
        catalogSectionRef.current;

      if (!slot || !catalog) {
        setQuickCategoriesFixed(false);
        return;
      }

      const slotRect =
        slot.getBoundingClientRect();
      const catalogRect =
        catalog.getBoundingClientRect();

      const triggerTop =
        window.innerWidth <= 720
          ? 78
          : 86;

      const keepVisibleUntil =
        triggerTop + 72;

      setQuickCategoriesFixed(
        slotRect.top <= triggerTop &&
          catalogRect.bottom >
            keepVisibleUntil
      );
    };

    updateQuickCategoryDock();

    window.addEventListener(
      "scroll",
      updateQuickCategoryDock,
      { passive: true }
    );
    window.addEventListener(
      "resize",
      updateQuickCategoryDock
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateQuickCategoryDock
      );
      window.removeEventListener(
        "resize",
        updateQuickCategoryDock
      );
    };
  }, [isPackageCatalog]);

  const catalogProducts = useMemo(
    () =>
      products.filter((product) =>
        isPackageCatalog
          ? product.category === "system"
          : product.category !== "system"
      ),
    [isPackageCatalog]
  );

  const brands = useMemo(() => {
    const map = new Map<string, string>();

    catalogProducts.forEach((product) => {
      map.set(product.brand, product.brandLabel);
    });

    return [...map.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }));
  }, [catalogProducts]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = catalogProducts.filter((product) => {
      const categoryMatch =
        category === "all" || product.category === category;
      const brandMatch = brand === "all" || product.brand === brand;
      const applicationMatch =
        application === "all" || product.apps.includes(application);
      const searchMatch =
        !query ||
        product.search.toLowerCase().includes(query) ||
        product.name.toLowerCase().includes(query) ||
        product.brandLabel.toLowerCase().includes(query) ||
        product.power.toLowerCase().includes(query);

      return categoryMatch && brandMatch && applicationMatch && searchMatch;
    });

    if (sort === "price-low") {
      return [...filtered].sort(
        (a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER)
      );
    }

    if (sort === "price-high") {
      return [...filtered].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    }

    if (sort === "power-high") {
      return [...filtered].sort(
        (a, b) => numericPower(b.power) - numericPower(a.power)
      );
    }

    return [...filtered].sort(
      (a, b) => a.featuredOrder - b.featuredOrder
    );
  }, [
    application,
    brand,
    catalogProducts,
    category,
    search,
    sort,
  ]);

  const totalPages = isPackageCatalog
    ? 1
    : Math.max(
        1,
        Math.ceil(
          visibleProducts.length /
            PRODUCTS_PER_PAGE
        )
      );

  const safeCurrentPage = isPackageCatalog
    ? 1
    : Math.min(
        Math.max(currentPage, 1),
        totalPages
      );

  const paginatedProducts = useMemo(() => {
    if (isPackageCatalog) {
      return visibleProducts;
    }

    const start =
      (safeCurrentPage - 1) *
      PRODUCTS_PER_PAGE;

    return visibleProducts.slice(
      start,
      start + PRODUCTS_PER_PAGE
    );
  }, [
    isPackageCatalog,
    safeCurrentPage,
    visibleProducts,
  ]);

  const paginationItems = useMemo(
    () =>
      buildPaginationItems(
        safeCurrentPage,
        totalPages
      ),
    [safeCurrentPage, totalPages]
  );

  const rangeStart =
    visibleProducts.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          PRODUCTS_PER_PAGE +
        1;

  const rangeEnd = isPackageCatalog
    ? visibleProducts.length
    : Math.min(
        safeCurrentPage *
          PRODUCTS_PER_PAGE,
        visibleProducts.length
      );

  useEffect(() => {
    if (
      !isPackageCatalog &&
      currentPage !== safeCurrentPage
    ) {
      setCurrentPage(safeCurrentPage);
    }
  }, [
    currentPage,
    isPackageCatalog,
    safeCurrentPage,
  ]);

  const goToPage = useCallback(
    (page: number) => {
      if (isPackageCatalog) {
        return;
      }

      const nextPage = Math.min(
        Math.max(page, 1),
        totalPages
      );

      if (nextPage === safeCurrentPage) {
        return;
      }

      setCurrentPage(nextPage);

      updateCatalogUrl({
        nextCategory: category,
        nextSearch: search,
        nextBrand: brand,
        nextApplication: application,
        nextSort: sort,
        nextPage,
        mode: "push",
      });

      window.requestAnimationFrame(() => {
        const catalog =
          catalogSectionRef.current;

        if (!catalog) {
          return;
        }

        const top =
          catalog.getBoundingClientRect()
            .top +
          window.scrollY -
          96;

        window.scrollTo({
          top: Math.max(0, top),
          behavior: "smooth",
        });
      });
    },
    [
      application,
      brand,
      category,
      isPackageCatalog,
      safeCurrentPage,
      search,
      sort,
      totalPages,
      updateCatalogUrl,
    ]
  );

  const toggleCompare = (product: Product) => {
    setCompareProducts((current) => {
      const alreadySelected = current.some((item) => item.id === product.id);

      if (alreadySelected) {
        return current.filter((item) => item.id !== product.id);
      }

      if (current.length > 0 && current[0].category !== product.category) {
        setCompareNotice(
          `Compare works best within one category. Started a new ${product.categoryLabel} comparison.`
        );

        window.setTimeout(() => setCompareNotice(""), 2400);
        return [product];
      }

      if (current.length >= 4) {
        setCompareNotice("You can compare up to 4 products at a time.");
        window.setTimeout(() => setCompareNotice(""), 2400);
        return current;
      }

      return [...current, product];
    });
  };

  const removeCompareProduct = (productId: string) => {
    setCompareProducts((current) =>
      current.filter((item) => item.id !== productId)
    );
  };

  const selectQuickCategory = (value: string) => {
    setCategory(value);
    setBrand("all");
    setApplication("all");
    resetToFirstPage({
      nextCategory: value,
      nextBrand: "all",
      nextApplication: "all",
    });
  };

  return (
    <>
      <Suspense fallback={null}>
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
              : "Panels, inverters, batteries, IPS / UPS, portable power, controllers, cables and protection devices — browse individual solar products below."}
          </p>
        </div>

        {!isPackageCatalog && (
          <div
            ref={quickCategoriesSlotRef}
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
                    key={item.value}
                    type="button"
                    className={
                      category === item.value
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      selectQuickCategory(
                        item.value
                      )
                    }
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </section>

      <section
        ref={catalogSectionRef}
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
          onClick={() => setFiltersOpen(true)}
        >
          Filters
        </button>

        {filtersOpen && (
          <button
            type="button"
            className="productsFilterBackdrop"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
        )}

        <div
          className={`catalogToolbar${
            isPackageCatalog
              ? " packageToolbar"
              : ""
          }${filtersOpen ? " isOpen" : ""}`}
        >
          <div className="piMobileFilterHead">
            <b>
              {isPackageCatalog
                ? "Package Filters"
                : "Product Filters"}
            </b>
            <button type="button" onClick={() => setFiltersOpen(false)}>
              ×
            </button>
          </div>

          <input
            className="catalogInput"
            type="search"
            value={search}
            onChange={(event) => {
              const value = event.target.value;
              setSearch(value);
              resetToFirstPage({
                nextSearch: value,
              });
            }}
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
              value={category}
              onChange={(event) => {
                const value = event.target.value;
                setCategory(value);
                resetToFirstPage({
                  nextCategory: value,
                });
              }}
              aria-label="Product category"
            >
              {PRODUCT_CATEGORY_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          )}

          <select
            className="catalogSelect"
            value={brand}
            onChange={(event) => {
              const value = event.target.value;
              setBrand(value);
              resetToFirstPage({
                nextBrand: value,
              });
            }}
            aria-label="Product brand"
          >
            <option value="all">All brands</option>
            {brands.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            className="catalogSelect piExtraFilter"
            value={application}
            onChange={(event) => {
              const value = event.target.value;
              setApplication(value);
              resetToFirstPage({
                nextApplication: value,
              });
            }}
            aria-label="Product application"
          >
            {productApplications.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            className="catalogSelect piExtraFilter"
            value={sort}
            onChange={(event) => {
              const value =
                event.target.value as SortValue;
              setSort(value);
              resetToFirstPage({
                nextSort: value,
              });
            }}
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="power-high">Capacity / power high first</option>
          </select>

          <div className="catalogCount">
            {isPackageCatalog
              ? `${visibleProducts.length} shown`
              : `Showing ${rangeStart}–${rangeEnd} of ${visibleProducts.length} products`}
          </div>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="realProductGrid">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
                isCompared={compareProducts.some(
                  (item) => item.id === product.id
                )}
                onCompare={toggleCompare}
                catalogMode={catalogMode}
              />
            ))}
          </div>
        ) : (
          <div className="productsEmptyState">
            <span>NO MATCH</span>
            <h3>
              {isPackageCatalog
                ? "No packages match these filters."
                : "No products match these filters."}
            </h3>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setBrand("all");
                setApplication("all");
                setSort("featured");
                resetToFirstPage({
                  nextCategory: "all",
                  nextSearch: "",
                  nextBrand: "all",
                  nextApplication: "all",
                  nextSort: "featured",
                });
              }}
            >
              Reset filters
            </button>
          </div>
        )}

        {!isPackageCatalog &&
          visibleProducts.length > 0 &&
          totalPages > 1 && (
            <nav
              className="productsPagination"
              aria-label="Product catalogue pages"
            >
              <div className="productsPaginationSummary">
                Showing {rangeStart}–{rangeEnd} of{" "}
                {visibleProducts.length} products
              </div>

              <div className="productsPaginationControls">
                <button
                  type="button"
                  className="productsPaginationNav"
                  onClick={() =>
                    goToPage(
                      safeCurrentPage - 1
                    )
                  }
                  disabled={
                    safeCurrentPage === 1
                  }
                >
                  <span aria-hidden="true">
                    ←
                  </span>
                  <span>Previous</span>
                </button>

                <div
                  className="productsPaginationPages"
                  aria-label={`Page ${safeCurrentPage} of ${totalPages}`}
                >
                  {paginationItems.map(
                    (item, index) =>
                      item === "ellipsis" ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="productsPaginationEllipsis"
                          aria-hidden="true"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          className={`productsPaginationPage${
                            item ===
                            safeCurrentPage
                              ? " isActive"
                              : ""
                          }`}
                          aria-label={`Go to page ${item}`}
                          aria-current={
                            item ===
                            safeCurrentPage
                              ? "page"
                              : undefined
                          }
                          onClick={() =>
                            goToPage(item)
                          }
                        >
                          {item}
                        </button>
                      )
                  )}
                </div>

                <button
                  type="button"
                  className="productsPaginationNav"
                  onClick={() =>
                    goToPage(
                      safeCurrentPage + 1
                    )
                  }
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                >
                  <span>Next</span>
                  <span aria-hidden="true">
                    →
                  </span>
                </button>
              </div>
            </nav>
          )}
      </section>

      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <ProductCompare
        products={compareProducts}
        isOpen={compareOpen}
        onOpen={() => setCompareOpen(true)}
        onClose={() => setCompareOpen(false)}
        onRemove={removeCompareProduct}
        onClear={() => {
          setCompareProducts([]);
          setCompareOpen(false);
        }}
      />

      {compareNotice && (
        <div className="pcNotice" role="status">
          {compareNotice}
        </div>
      )}

      <style jsx>{`
        .productsPagination {
          margin-top: 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .productsPaginationSummary {
          font-size: 13px;
          line-height: 1.5;
          color: rgba(15, 23, 42, 0.62);
          text-align: center;
        }

        .productsPaginationControls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
        }

        .productsPaginationPages {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .productsPaginationPage,
        .productsPaginationNav {
          min-height: 42px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: #ffffff;
          color: #0f172a;
          border-radius: 12px;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition:
            border-color 160ms ease,
            background-color 160ms ease,
            color 160ms ease,
            transform 160ms ease;
        }

        .productsPaginationPage {
          min-width: 42px;
          padding: 0 12px;
        }

        .productsPaginationNav {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 16px;
          white-space: nowrap;
        }

        .productsPaginationPage:hover:not(:disabled),
        .productsPaginationNav:hover:not(:disabled) {
          border-color: rgba(15, 23, 42, 0.38);
          transform: translateY(-1px);
        }

        .productsPaginationPage.isActive {
          border-color: #0f172a;
          background: #0f172a;
          color: #ffffff;
          cursor: default;
        }

        .productsPaginationNav:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }

        .productsPaginationEllipsis {
          min-width: 24px;
          text-align: center;
          color: rgba(15, 23, 42, 0.5);
          font-weight: 700;
        }

        @media (max-width: 720px) {
          .productsPagination {
            margin-top: 28px;
            gap: 12px;
          }

          .productsPaginationControls {
            gap: 7px;
            flex-wrap: wrap;
          }

          .productsPaginationPages {
            order: 3;
            flex-basis: 100%;
            gap: 5px;
          }

          .productsPaginationPage {
            min-width: 38px;
            min-height: 38px;
            padding: 0 10px;
            border-radius: 10px;
          }

          .productsPaginationNav {
            min-height: 40px;
            flex: 1 1 0;
            max-width: 150px;
            padding: 0 13px;
            border-radius: 10px;
          }
        }
      `}</style>
    </>
  );
}
