import type { Metadata } from "next";

import CartPageClient from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Your Cart | Desh Solar",
  description:
    "Review your selected Desh Solar products, adjust quantities and continue to checkout.",
};

export default function CartPage() {
  return <CartPageClient />;
}
