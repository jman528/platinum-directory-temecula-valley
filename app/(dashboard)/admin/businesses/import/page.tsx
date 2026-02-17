import { Upload, FileText, Database } from "lucide-react";

export default function ImportPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Import Businesses</h1>
      <p className="mt-1 text-gray-400">Import businesses from CSV files or external sources.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-pd-blue" />
            <div>
              <h3 className="font-heading text-lg font-bold text-white">CSV Upload</h3>
              <p className="text-sm text-gray-400">Upload from GHL export or master list</p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border-2 border-dashed border-pd-purple/30 p-8 text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-500" />
            <p className="mt-2 text-sm text-gray-400">Drag and drop CSV file here</p>
            <p className="mt-1 text-xs text-gray-500">Supports: FRANK_05_MASTER_LIST, ghl-contacts.csv</p>
            <button className="mt-4 rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark">
              Browse Files
            </button>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-pd-purple" />
            <div>
              <h3 className="font-heading text-lg font-bold text-white">Google Places Enrichment</h3>
              <p className="text-sm text-gray-400">Enrich existing listings with Google data</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-gray-400">
            <p>Enriches businesses with:</p>
            <ul className="space-y-1 pl-4">
              <li>&bull; Google rating &amp; review count</li>
              <li>&bull; Lat/lng coordinates for map</li>
              <li>&bull; Website &amp; business hours</li>
              <li>&bull; Category mapping</li>
            </ul>
            <p className="text-xs text-gray-500">Requires GOOGLE_PLACES_API_KEY</p>
            <button disabled className="rounded-lg bg-pd-purple/20 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
