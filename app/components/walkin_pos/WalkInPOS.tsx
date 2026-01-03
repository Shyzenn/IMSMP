"use client";

import ProductList from "@/app/components/walkin_pos/ProductList";
import React, { useState } from "react";
import CartDetails from "./CartDetails";
import Payment from "./Payment";

export interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  stock: number;
  genericName: string;
  strength: string;
  dosageForm: string;
}

const WalkInPOS = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.productId === product.productId);

      if (existing) {
        return prev.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (productId: number, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const removeItem = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const deleteAllItem = () => {
    setCartItems([]);
  };

  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <div className="grid grid-cols-[2fr_2.5fr_1.5fr] h-full">
      <div className="overflow-hidden h-full">
        <ProductList onAddtoCart={addToCart} />
      </div>

      <div>
        <CartDetails
          items={cartItems}
          onUpdateQty={updateQty}
          onRemoveItem={removeItem}
          onDeleteAllItem={deleteAllItem}
        />
      </div>

      <div className="shadow-xl bg-white h-full py-6 border-l overflow-auto">
        <Payment
          subTotal={subTotal}
          cartItems={cartItems}
          setCartItems={setCartItems}
        />
      </div>
    </div>
  );
};

export default WalkInPOS;
