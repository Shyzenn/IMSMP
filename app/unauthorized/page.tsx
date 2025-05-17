"use client";

import React from "react";

const Unauthorized = () => {
  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold">403 - Unauthorized</h1>
      <p>You do not have access to this page.</p>
      <button
        onClick={() => window.history.back()}
        className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Go Back
      </button>
    </div>
  );
};

export default Unauthorized;
