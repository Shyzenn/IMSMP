import { getProductById } from "@/lib/action/get";
import React from "react";

const page = async ({ params }: { params: { id: number } }) => {
  const { id } = params;
  const { product } = await getProductById(id);

  return <div>page</div>;
};

export default page;
