import Image from "next/image";
import React from "react";

const EmptyTable = ({ content }: { content: string }) => {
  return (
    <div className="flex justify-center items-center p-20 flex-col gap-7">
      {content}
      <Image src="/emptyCart.png" alt="empty" width={150} height={150} />
    </div>
  );
};

export default EmptyTable;
