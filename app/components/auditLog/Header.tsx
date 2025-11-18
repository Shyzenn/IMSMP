"use client";

import React, { useState } from "react";
import Search from "../Search";
import AuditFilter from "./AuditFilter";
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "../DateRangeFilter";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { MdOutlineFileDownload } from "react-icons/md";
import { generateAuditLogPDF } from "@/lib/reportUtils/auditLogReport";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";

type AuditLogRow = {
  id: number;
  action: string;
  description: string;
  entityType: string;
  entityId: number | null;
  createdAt: string | Date;
  user: { username: string };
};

type AuditReportMeta = {
  dateRange: {
    from: string | null;
    to: string | null;
  };
  searchQuery: string | null;
  actionFilters: string[] | null;
  entityTypeFilters: string[] | null;
  totalLogs: number;
  generatedAt: string;
};

const Header = () => {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDateRange, setReportDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({
    title: "No Data Found",
    description: "There are no data available for this report.",
  });

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);

      // Build query string with selected date range
      const params = new URLSearchParams();
      const search = searchParams.get("search");
      const actions = searchParams.get("actions");
      const entityTypes = searchParams.get("entityTypes");

      if (reportDateRange.from) {
        params.set("from", format(reportDateRange.from, "yyyy-MM-dd"));
      }
      if (reportDateRange.to) {
        params.set("to", format(reportDateRange.to, "yyyy-MM-dd"));
      }
      if (search) params.set("search", search);
      if (actions) params.set("actions", actions);
      if (entityTypes) params.set("entityTypes", entityTypes);

      const res = await fetch(`/api/report/audit?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch audit logs");

      const data: { logs: AuditLogRow[]; meta: AuditReportMeta } =
        await res.json();

      if (data.logs.length === 0) {
        setModalMessage({
          title: "No Data Found",
          description:
            "There are no Audit Log records for the selected criteria.",
        });
        setShowModal(true);
        setShowReportModal(false);
        setReportDateRange({});
        return;
      }

      // Convert string dates to Date objects
      const logsWithDates = data.logs.map((log) => ({
        ...log,
        createdAt: new Date(log.createdAt),
      }));

      const generatedBy = session?.user.role;

      generateAuditLogPDF(logsWithDates, data.meta, generatedBy);

      setShowReportModal(false);
      setReportDateRange({});
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const router = useRouter();

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
    <>
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:justify-between">
        <p className="text-2xl font-semibold">Audit Log</p>
        <div className="w-auto lg:w-[20rem] xl:w-[30rem] border px-6 rounded-full flex items-center gap-2 bg-gray-50">
          <Search placeholder="Search..." />
        </div>

        <div className="flex flex-col gap-4 md:flex-row items-center">
          <DateRangeFilter onChange={handleDateChange} />
          <div className="flex justify-between items-center w-full gap-4">
            <AuditFilter />
            <Button variant="outline" onClick={() => setShowReportModal(true)}>
              PDF Export
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <AlertDialogHeader>
            <DialogTitle>{modalMessage.title}</DialogTitle>
            <DialogDescription>{modalMessage.description}</DialogDescription>
          </AlertDialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowModal(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showReportModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => {
            if (!isGenerating) {
              setShowReportModal(false);
              setReportDateRange({});
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Generate Audit Log Report</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a date range for the audit log report. Leave empty to
              include all records.
            </p>

            <div className="flex gap-4 mt-2 justify-center">
              <DateRangeFilter
                onChange={(range) => setReportDateRange(range)}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReportModal(false);
                  setReportDateRange({});
                }}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-buttonBgColor hover:bg-buttonHover"
              >
                {isGenerating ? "Generating..." : "Generate Report"}
                <MdOutlineFileDownload
                  className={isGenerating ? "animate-bounce" : ""}
                />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
