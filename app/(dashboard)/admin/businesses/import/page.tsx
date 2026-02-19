"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  ArrowRight,
} from "lucide-react";

const DB_FIELDS = [
  { value: "", label: "— Skip —" },
  { value: "name", label: "Business Name *" },
  { value: "address", label: "Address" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "zip_code", label: "ZIP Code" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "description", label: "Description" },
  { value: "category", label: "Category" },
];

type ImportStep = "upload" | "mapping" | "preview" | "importing" | "results";

export default function ImportPage() {
  const [step, setStep] = useState<ImportStep>("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function parseCSV(text: string) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      setError("CSV file must have a header row and at least one data row.");
      return;
    }

    // Parse header
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    setCsvHeaders(headers);

    // Auto-map columns
    const autoMap: Record<string, string> = {};
    const lowerMap: Record<string, string> = {
      name: "name",
      "business name": "name",
      business_name: "name",
      address: "address",
      street: "address",
      city: "city",
      state: "state",
      zip: "zip_code",
      zip_code: "zip_code",
      zipcode: "zip_code",
      postal: "zip_code",
      phone: "phone",
      telephone: "phone",
      email: "email",
      website: "website",
      url: "website",
      description: "description",
      category: "category",
      hours_mon_fri: "hours_mon_fri",
      hours_sat: "hours_sat",
      hours_sun: "hours_sun",
    };
    headers.forEach((h) => {
      const lower = h.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
      if (lowerMap[lower]) {
        autoMap[h] = lowerMap[lower];
      } else {
        // Fuzzy match
        for (const [key, val] of Object.entries(lowerMap)) {
          if (lower.includes(key)) {
            autoMap[h] = val;
            break;
          }
        }
      }
    });
    setColumnMapping(autoMap);

    // Parse rows
    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length && rows.length < 1000; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });
      rows.push(row);
    }
    setCsvRows(rows);
    setStep("mapping");
    setError("");
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      parseCSV(event.target?.result as string);
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith(".csv")) {
      setError("Please upload a CSV file.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      parseCSV(event.target?.result as string);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    // Validate name column is mapped
    const nameCol = Object.entries(columnMapping).find(
      ([, dbCol]) => dbCol === "name"
    );
    if (!nameCol) {
      setError("You must map a column to 'Business Name'.");
      return;
    }

    setImporting(true);
    setStep("importing");
    setError("");

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: csvRows,
          columnMapping,
          force: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed.");
        setStep("preview");
        setImporting(false);
        return;
      }

      setResults(data);
      setStep("results");
    } catch {
      setError("Network error. Please try again.");
      setStep("preview");
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setStep("upload");
    setCsvHeaders([]);
    setCsvRows([]);
    setColumnMapping({});
    setResults(null);
    setError("");
    setFileName("");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">
            Import Businesses
          </h2>
          <p className="mt-1 text-gray-400">
            Upload a CSV file to bulk-import businesses.
          </p>
        </div>
        <a
          href="/business-import-template.csv"
          download
          className="flex items-center gap-2 rounded-lg border border-pd-purple/20 px-4 py-2 text-sm text-gray-400 hover:bg-pd-purple/10 hover:text-white"
        >
          <Download className="h-4 w-4" /> Download Template
        </a>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-red-400">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="mt-6 glass-card p-8"
        >
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-pd-purple/30 p-12 text-center">
            <Upload className="h-12 w-12 text-gray-500" />
            <p className="mt-4 text-lg text-gray-300">
              Drag and drop a CSV file here
            </p>
            <p className="mt-1 text-sm text-gray-500">or click to browse</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-4 rounded-lg bg-pd-blue px-6 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark"
            >
              Browse Files
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === "mapping" && (
        <div className="mt-6 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-white">
                  Map Columns
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  <FileText className="mr-1 inline h-4 w-4" />
                  {fileName} — {csvRows.length} rows found
                </p>
              </div>
              <button onClick={reset} className="text-sm text-gray-400 hover:text-white">
                Upload Different File
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {csvHeaders.map((header) => (
                <div
                  key={header}
                  className="flex items-center gap-4 rounded-lg border border-pd-purple/10 p-3"
                >
                  <span className="w-40 flex-shrink-0 truncate text-sm text-white">
                    {header}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-500" />
                  <select
                    value={columnMapping[header] || ""}
                    onChange={(e) =>
                      setColumnMapping((prev) => ({
                        ...prev,
                        [header]: e.target.value,
                      }))
                    }
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    {DB_FIELDS.map((f) => (
                      <option key={f.value} value={f.value} className="bg-pd-dark">
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep("preview")}
              className="mt-6 rounded-lg bg-pd-blue px-6 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark"
            >
              Preview Import
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && (
        <div className="mt-6 space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-heading text-lg font-bold text-white">
              Preview ({Math.min(10, csvRows.length)} of {csvRows.length} rows)
            </h3>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pd-purple/20 text-left">
                    {Object.entries(columnMapping)
                      .filter(([, dbCol]) => dbCol)
                      .map(([csvCol, dbCol]) => (
                        <th key={csvCol} className="pb-2 pr-4 text-gray-400">
                          {dbCol}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-pd-purple/10">
                      {Object.entries(columnMapping)
                        .filter(([, dbCol]) => dbCol)
                        .map(([csvCol]) => (
                          <td
                            key={csvCol}
                            className="max-w-[200px] truncate py-2 pr-4 text-gray-300"
                          >
                            {row[csvCol] || "\u2014"}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep("mapping")}
                className="rounded-lg border border-pd-purple/20 px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Back to Mapping
              </button>
              <button
                onClick={handleImport}
                className="flex items-center gap-2 rounded-lg bg-pd-gold px-6 py-2 text-sm font-semibold text-pd-dark hover:bg-pd-gold-light"
              >
                <Upload className="h-4 w-4" /> Import {csvRows.length}{" "}
                Businesses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Importing */}
      {step === "importing" && (
        <div className="mt-6 glass-card p-12 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-pd-purple" />
          <p className="mt-4 text-lg text-white">
            Importing {csvRows.length} businesses...
          </p>
          <p className="mt-1 text-sm text-gray-400">
            This may take a moment.
          </p>
        </div>
      )}

      {/* Step 5: Results */}
      {step === "results" && results && (
        <div className="mt-6 glass-card p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <div>
              <h3 className="font-heading text-xl font-bold text-white">
                Import Complete
              </h3>
              <p className="text-sm text-gray-400">
                Processed {results.total} rows
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-green-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {results.imported}
              </p>
              <p className="text-xs text-gray-400">Imported</p>
            </div>
            <div className="rounded-lg bg-yellow-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {results.skipped}
              </p>
              <p className="text-xs text-gray-400">Skipped (duplicates)</p>
            </div>
            <div className="rounded-lg bg-red-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-red-400">
                {results.errors?.length || 0}
              </p>
              <p className="text-xs text-gray-400">Errors</p>
            </div>
          </div>

          {results.errors?.length > 0 && (
            <div className="mt-4 max-h-40 overflow-y-auto rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300">
              {results.errors.map((err: string, i: number) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={reset}
              className="rounded-lg border border-pd-purple/20 px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Import More
            </button>
            <Link
              href="/admin/businesses"
              className="rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark"
            >
              View Businesses
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
