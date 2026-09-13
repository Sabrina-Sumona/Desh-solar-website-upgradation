"use client";

import Image from "next/image";
import Link from "next/link";
import ProductQuickView from "@/components/products/ProductQuickView";
import ProductCompare from "@/components/products/ProductCompare";
import { useMemo, useState } from "react";
import {
  productApplications,
  productCategories,
  products,
  type Product,
} from "@/data/products";

type SortValue = "featured" | "price-low" | "price-high" | "power-high";

const categoryLabels: Record<string, string> = {
  panel: "Solar Panel",
  inverter: "Solar Inverter",
  battery: "Lithium Battery",
  portable: "Portable Power",
  system: "Complete System / Pump",
};

function numericPower(value: string) {
  const match = value.replace(/,/g, "").match(/[0-9]+(?:\.[0-9]+)?/);
  return match ? Number(match[0]) : 0;
}

function ProductCard({
  product,
  onQuickView,
  isCompared,
  onCompare,
}: {
  product: Product;
  onQuickView: (product: Product) => void;
  isCompared: boolean;
  onCompare: (product: Product) => void;
}) {
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
          View Product Details →
        </Link>

        <button type="button" className="piAddCartAction">
          Add to Cart +
        </button>
      </div>
    </article>
  );
}

export default function ProductsCatalog() {
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [application, setApplication] = useState("all");
  const [sort, setSort] = useState<SortValue>("featured");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareNotice, setCompareNotice] = useState("");

  const brands = useMemo(() => {
    const map = new Map<string, string>();

    products.forEach((product) => {
      map.set(product.brand, product.brandLabel);
    });

    return [...map.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }));
  }, []);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = products.filter((product) => {
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
  }, [application, brand, category, search, sort]);

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
  };

  return (
    <>
      <section className="plCompactHero">
        <div className="plCompactHeroCopy">
          <div className="demoEyebrow">Desh Solar Products</div>
          <h1>Solar products &amp; complete systems.</h1>
          <p>
            Panels, inverters, batteries, portable power and complete solar
            systems — browse the catalogue immediately below.
          </p>
        </div>

        <div
          className="plQuickCategories"
          aria-label="Product category shortcuts"
        >
          {productCategories.map((item) => (
            <button
              key={item.value}
              type="button"
              className={category === item.value ? "active" : ""}
              onClick={() => selectQuickCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="productsCatalogSection" id="catalog">
        <div className="demoSectionHead">
          <div>
            <div className="demoEyebrow">Product Catalogue</div>
            <h2>Browse products.</h2>
          </div>

          <p className="demoSectionLead">
            Browse quickly. Open a product for full specifications and system
            details.
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

        <div className={`catalogToolbar${filtersOpen ? " isOpen" : ""}`}>
          <div className="piMobileFilterHead">
            <b>Product Filters</b>
            <button type="button" onClick={() => setFiltersOpen(false)}>
              ×
            </button>
          </div>

          <input
            className="catalogInput"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products, brands or capacity…"
            aria-label="Search products"
          />

          <select
            className="catalogSelect"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Product category"
          >
            <option value="all">All categories</option>
            <option value="panel">Solar Panel</option>
            <option value="portable">Portable Power</option>
            <option value="battery">Lithium Battery</option>
            <option value="inverter">Solar Inverter</option>
            <option value="system">Complete System / Pump</option>
          </select>

          <select
            className="catalogSelect"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
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
            onChange={(event) => setApplication(event.target.value)}
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
            onChange={(event) => setSort(event.target.value as SortValue)}
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="power-high">Capacity / power high first</option>
          </select>

          <div className="catalogCount">{visibleProducts.length} shown</div>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="realProductGrid">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
                isCompared={compareProducts.some(
                  (item) => item.id === product.id
                )}
                onCompare={toggleCompare}
              />
            ))}
          </div>
        ) : (
          <div className="productsEmptyState">
            <span>NO MATCH</span>
            <h3>No products match these filters.</h3>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setBrand("all");
                setApplication("all");
                setSort("featured");
              }}
            >
              Reset filters
            </button>
          </div>
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
    </>
  );
}
