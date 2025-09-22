import Image from "next/image";
import React from "react";

const EmptyTable = ({ content }: { content: string }) => {
  return (
    <div className="flex justify-center items-center p-20 flex-col gap-7">
      <Image src="/noDataImage.png" alt="empty" width={300} height={300} />
      <p className="text-xl text-gray-400">{content}</p>
    </div>
  );
};

export default EmptyTable;
