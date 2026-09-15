import type { Metadata } from "next";

import ProductsCatalog from "@/components/products/ProductsCatalog";

import "@/styles/products.css";

export const metadata: Metadata = {
  title: "Solar Packages | Desh Solar",
  description:
    "Browse Desh Solar complete solar system packages and solar pump packages for different energy requirements.",
};

export default function PackagesPage() {
  return (
    <main className="productsPage">
      <ProductsCatalog catalogMode="packages" />
    </main>
  );
}
