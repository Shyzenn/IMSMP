import React, { useEffect, useState } from "react";
import { CiSquareCheck } from "react-icons/ci";

const PasswordSuccessModal = ({ onRedirect }: { onRedirect: () => void }) => {
  const [count, setCount] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => setCount((c) => c - 1), 1000);

    if (count === 0) {
      clearInterval(timer);
      onRedirect();
    }

    return () => clearInterval(timer);
  }, [count, onRedirect]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-[350px] text-center">
        <CiSquareCheck className="text-[100px] text-green-500 mx-auto" />
        <h2 className="text-lg font-semibold mt-4">
          Password Updated Successfully
        </h2>
        <p className="mt-4 text-gray-500 font-semibold">
          You’ll be redirected to login page in <strong>{count}</strong>{" "}
          seconds.
        </p>
      </div>
    </div>
  );
};

export default PasswordSuccessModal;
