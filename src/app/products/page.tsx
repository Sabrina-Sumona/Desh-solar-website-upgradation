import type { Metadata } from "next";
import ProductsCatalog from "@/components/products/ProductsCatalog";

import "@/styles/products.css";

export const metadata: Metadata = {
  title: "Solar Products & Complete Systems | Desh Solar",
  description:
    "Explore Desh Solar panels, inverters, lithium batteries, portable power and complete solar systems.",
};

export default function ProductsPage() {
  return (
    <main className="productsPage">
      <ProductsCatalog />
    </main>
  );
}
