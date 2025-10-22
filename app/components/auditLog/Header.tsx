"use client";

import React from "react";
import Search from "../Search";
import AuditFilter from "./AuditFilter";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "../DateRangeFilter";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";

type AuditLogRow = {
  id: number;
  action: string;
  description: string;
  entityType: string;
  createdAt: string | Date;
  user: { username: string };
};

const Header = () => {
  const handleAuditDownload = async () => {
    try {
      const res = await fetch("/api/audit/export");
      if (!res.ok) throw new Error("Failed to fetch audit logs");

      const data: AuditLogRow[] = await res.json();
      exportAuditLogPDF(data);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const exportAuditLogPDF = (logs: AuditLogRow[]) => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("Audit Log Report", 14, 16);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const columns = [
      "ID",
      "Action",
      "Description",
      "Entity",
      "User",
      "Created At",
    ];
    const rows = logs.map((log) => [
      log.id,
      log.action,
      log.description,
      log.entityType,
      log.user?.username ?? "Unknown",
      new Date(log.createdAt).toLocaleString(),
    ]);

    autoTable(doc, {
      startY: 36,
      head: [columns],
      body: rows,
    });

    doc.save("audit_logs.pdf");
  };

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateChange = (range: { from?: Date; to?: Date }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (range.from) params.set("from", format(range.from, "yyyy-MM-dd"));
    else params.delete("from");
    if (range.to) params.set("to", format(range.to, "yyyy-MM-dd"));
    else params.delete("to");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:justify-between">
      <p className="text-2xl font-semibold">Audit Log</p>
      <div className="w-auto lg:w-[20rem] xl:w-[30rem] border px-6 rounded-full flex items-center gap-2 bg-gray-50">
        <Search placeholder="Search..." />
      </div>

      <div className="flex flex-col gap-4 md:flex-row items-center">
        <DateRangeFilter onChange={handleDateChange} />
        <div className="flex justify-between items-center w-full gap-4">
          <AuditFilter />
          <Button variant="outline" onClick={handleAuditDownload}>
            PDF Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
