"use client";

import React, { useState } from "react";
import Search from "../ui/Search";
import { usePatients } from "@/app/hooks/usePatients";
import { Patient } from "@/lib/interfaces";
import { RecentRequestOrderSkeleton } from "../ui/Skeleton";
import { IoIosArrowForward } from "react-icons/io";
import { getInitials, stringToDarkColor } from "@/lib/utils";
import PatientOrderModal from "./PatientOrderModal";

export const PatientsOrderList = () => {
  const { data, isLoading } = usePatients();
  const [showPatientOrders, setShowPatientOrders] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  if (isLoading) return <RecentRequestOrderSkeleton />;

  return (
    <>
      <div className="px-6 py-4">
        <div className="flex items-center gap-8 mb-4">
          <p className="text-lg font-semibold w-[15rem]">Patient Order List</p>
          <div className="w-full border px-6 rounded-full flex items-center gap-2 bg-gray-50">
            <Search placeholder="Search patient name..." />
          </div>
        </div>

        {data && data.length > 0 ? (
          data.map((patient: Patient) => (
            <ul key={patient.id}>
              <button
                className="border-b flex justify-between py-4 items-center w-full hover:bg-slate-50"
                onClick={() => {
                  setShowPatientOrders(true);
                  setSelectedPatient(patient);
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-full flex justify-center items-center text-sm font-semibold"
                    style={{
                      backgroundColor: stringToDarkColor(patient.patientName),
                      color: "#fff",
                    }}
                  >
                    {getInitials(patient.patientName)}
                  </div>

                  <div className="flex flex-col">
                    <p className="font-semibold text-sm text-start">
                      {patient.patientName}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {patient.unpaidOrders} Unpaid Order
                      {patient.unpaidOrders === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <p className="text-green-500 font-semibold text-sm flex flex-col text-end">
                    ₱{Number(patient.totalBalance).toFixed(2)}
                    <span className="text-gray-500 font-normal text-xs">
                      Total Balance
                    </span>
                  </p>
                  <IoIosArrowForward className="text-gray-500" />
                </div>
              </button>
            </ul>
          ))
        ) : (
          <p className="text-center mt-8 text-gray-500">
            No patient order for now.
          </p>
        )}
      </div>

      {showPatientOrders && (
        <PatientOrderModal
          isOpen={showPatientOrders}
          onClose={() => setShowPatientOrders(false)}
          patient={selectedPatient}
        />
      )}
    </>
  );
};
