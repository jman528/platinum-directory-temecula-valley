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
  Globe,
  PenLine,
  Search,
  Plus,
} from "lucide-react";
import { CITIES } from "@/lib/constants";

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

const TIER_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "verified_platinum", label: "Verified ($99/mo)" },
  { value: "platinum_partner", label: "Partner ($799/mo)" },
  { value: "platinum_elite", label: "Elite ($3,500/mo)" },
];

type ImportStep = "upload" | "mapping" | "preview" | "importing" | "results";
type ImportTab = "csv" | "google" | "manual";

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<ImportTab>("csv");

  // CSV state
  const [step, setStep] = useState<ImportStep>("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Google search state
  const [googleQuery, setGoogleQuery] = useState("");
  const [googleResults, setGoogleResults] = useState<any[]>([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [selectedGoogle, setSelectedGoogle] = useState<Set<string>>(new Set());

  // Manual entry state
  const [manualForm, setManualForm] = useState({
    name: "",
    address: "",
    city: "Temecula",
    state: "CA",
    zip_code: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    category: "",
    tier: "free",
    is_active: true,
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);

  function parseCSV(text: string) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      setError("CSV file must have a header row and at least one data row.");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    setCsvHeaders(headers);

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
    };
    headers.forEach((h) => {
      const lower = h.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
      if (lowerMap[lower]) {
        autoMap[h] = lowerMap[lower];
      } else {
        for (const [key, val] of Object.entries(lowerMap)) {
          if (lower.includes(key)) {
            autoMap[h] = val;
            break;
          }
        }
      }
    });
    setColumnMapping(autoMap);

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

  async function handleGoogleSearch() {
    if (!googleQuery.trim()) return;
    setGoogleLoading(true);
    try {
      const res = await fetch(`/api/admin/import/google?q=${encodeURIComponent(googleQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setGoogleResults(data.results || []);
      } else {
        setError("Google search failed. Check your GOOGLE_PLACES_API_KEY.");
      }
    } catch {
      setError("Failed to search Google Maps.");
    } finally {
      setGoogleLoading(false);
    }
  }

  function toggleGoogleSelect(placeId: string) {
    setSelectedGoogle((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualForm.name.trim()) {
      setError("Business name is required.");
      return;
    }
    setManualSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: [manualForm],
          columnMapping: Object.fromEntries(Object.keys(manualForm).map((k) => [k, k])),
          force: false,
        }),
      });
      if (res.ok) {
        setManualSuccess(true);
        setManualForm({
          name: "",
          address: "",
          city: "Temecula",
          state: "CA",
          zip_code: "",
          phone: "",
          email: "",
          website: "",
          description: "",
          category: "",
          tier: "free",
          is_active: true,
        });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add business.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setManualSubmitting(false);
    }
  }

  const tabItems = [
    { key: "csv" as const, label: "CSV Upload", icon: Upload },
    { key: "google" as const, label: "Google Business API", icon: Globe },
    { key: "manual" as const, label: "Manual Entry", icon: PenLine },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">
            Import Businesses
          </h2>
          <p className="mt-1 text-gray-400">
            Add businesses via CSV, Google Maps, or manual entry.
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

      {/* Import Method Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg border border-pd-purple/20 bg-pd-dark/50 p-1">
        {tabItems.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setError(""); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm transition-colors ${
              activeTab === tab.key
                ? "bg-pd-purple/20 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CSV Upload Tab */}
      {activeTab === "csv" && (
        <>
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
                <p className="mt-1 text-sm text-gray-500">Supports .csv files up to 1,000 rows</p>
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
                        <th className="pb-2 text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvRows.slice(0, 10).map((row, i) => {
                        const nameCol = Object.entries(columnMapping).find(([, v]) => v === "name");
                        const hasName = nameCol ? !!row[nameCol[0]]?.trim() : false;
                        return (
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
                            <td className="py-2">
                              {hasName ? (
                                <span className="text-xs text-green-400">Valid</span>
                              ) : (
                                <span className="text-xs text-red-400">Missing name</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 rounded-lg bg-white/5 p-3 text-sm text-gray-400">
                  <p>
                    <span className="font-semibold text-green-400">
                      {csvRows.filter((row) => {
                        const nameCol = Object.entries(columnMapping).find(([, v]) => v === "name");
                        return nameCol ? !!row[nameCol[0]]?.trim() : false;
                      }).length}
                    </span>{" "}
                    valid rows &middot;{" "}
                    <span className="font-semibold text-red-400">
                      {csvRows.filter((row) => {
                        const nameCol = Object.entries(columnMapping).find(([, v]) => v === "name");
                        return nameCol ? !row[nameCol[0]]?.trim() : true;
                      }).length}
                    </span>{" "}
                    errors
                  </p>
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
                    <Upload className="h-4 w-4" /> Import {csvRows.length} Businesses
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
        </>
      )}

      {/* Google Business API Tab */}
      {activeTab === "google" && (
        <div className="mt-6 glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">
            Search Google Maps
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Search for businesses on Google Maps and import them directly.
          </p>

          <div className="mt-4 flex gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={googleQuery}
                onChange={(e) => setGoogleQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGoogleSearch()}
                placeholder="e.g., wineries in Temecula"
                className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleGoogleSearch}
              disabled={googleLoading}
              className="flex items-center gap-2 rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark disabled:opacity-50"
            >
              {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Requires GOOGLE_PLACES_API_KEY in environment variables.
          </p>

          {googleResults.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">{googleResults.length} results found</p>
                <button
                  disabled={selectedGoogle.size === 0}
                  className="flex items-center gap-2 rounded-lg bg-pd-gold px-4 py-2 text-sm font-semibold text-pd-dark hover:bg-pd-gold-light disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" /> Import Selected ({selectedGoogle.size})
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {googleResults.map((place: any) => (
                  <label
                    key={place.place_id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/5 p-3 hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGoogle.has(place.place_id)}
                      onChange={() => toggleGoogleSelect(place.place_id)}
                      className="h-4 w-4 rounded accent-pd-gold"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{place.name}</p>
                      <p className="text-xs text-gray-500">{place.formatted_address}</p>
                    </div>
                    {place.rating && (
                      <span className="text-xs text-gray-400">{place.rating} stars</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {googleResults.length === 0 && !googleLoading && googleQuery && (
            <div className="mt-6 py-8 text-center text-gray-500">
              No results found. Try a different search query.
            </div>
          )}
        </div>
      )}

      {/* Manual Entry Tab */}
      {activeTab === "manual" && (
        <div className="mt-6 glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">
            Add Business Manually
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Fill in the details to add a single business to the directory.
          </p>

          {manualSuccess && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <p className="text-sm text-green-300">Business added successfully!</p>
              <button onClick={() => setManualSuccess(false)} className="ml-auto text-green-400">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Business Name *</label>
                <input
                  type="text"
                  required
                  value={manualForm.name}
                  onChange={(e) => setManualForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pd-purple"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Category</label>
                <input
                  type="text"
                  value={manualForm.category}
                  onChange={(e) => setManualForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="e.g., Wineries, Restaurants"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pd-purple"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Address</label>
                <input
                  type="text"
                  value={manualForm.address}
                  onChange={(e) => setManualForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pd-purple"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">City</label>
                  <select
                    value={manualForm.city}
                    onChange={(e) => setManualForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    {CITIES.map((c) => (
                      <option key={c.name} value={c.name} className="bg-pd-dark">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">State</label>
                  <input
                    type="text"
                    value={manualForm.state}
                    onChange={(e) => setManualForm((f) => ({ ...f, state: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">ZIP</label>
                  <input
                    type="text"
                    value={manualForm.zip_code}
                    onChange={(e) => setManualForm((f) => ({ ...f, zip_code: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Phone</label>
                <input
                  type="tel"
                  value={manualForm.phone}
                  onChange={(e) => setManualForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pd-purple"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Email</label>
                <input
                  type="email"
                  value={manualForm.email}
                  onChange={(e) => setManualForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pd-purple"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Website</label>
                <input
                  type="url"
                  value={manualForm.website}
                  onChange={(e) => setManualForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pd-purple"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Tier</label>
                <select
                  value={manualForm.tier}
                  onChange={(e) => setManualForm((f) => ({ ...f, tier: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                >
                  {TIER_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value} className="bg-pd-dark">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Description</label>
              <textarea
                value={manualForm.description}
                onChange={(e) => setManualForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pd-purple"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={manualForm.is_active}
                  onChange={(e) => setManualForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded accent-pd-gold"
                />
                Set as active immediately (skip verification)
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={manualSubmitting}
                className="flex items-center gap-2 rounded-lg bg-pd-gold px-6 py-2 text-sm font-semibold text-pd-dark hover:bg-pd-gold-light disabled:opacity-50"
              >
                {manualSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Business
              </button>
              <Link
                href="/admin/businesses"
                className="rounded-lg border border-pd-purple/20 px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                View All Businesses
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
