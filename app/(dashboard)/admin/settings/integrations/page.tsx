"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function IntegrationsSettingsPage() {
  const [ghl, setGhl] = useState({
    api_key: "",
    location_id: "",
    pipeline_id: "",
    sync_direction: "bidirectional",
    auto_sync: false,
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-pd-purple/40 focus:outline-none text-sm";

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      // Test by calling GHL API with the provided key
      const res = await fetch("https://rest.gohighlevel.com/v1/contacts/?limit=1", {
        headers: { Authorization: `Bearer ${ghl.api_key}` },
      });
      if (res.ok) {
        setTestResult("success");
      } else {
        setTestResult("failed");
      }
    } catch {
      setTestResult("failed");
    }
    setTesting(false);
  }

  async function syncNow() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/ghl/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_all" }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncResult(`Synced ${data.synced} contacts`);
      } else {
        setSyncResult(data.error || "Sync failed");
      }
    } catch {
      setSyncResult("Sync failed");
    }
    setSyncing(false);
  }

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-white">Integrations</h2>
      <p className="mt-1 text-gray-400">Connect external services</p>

      <div className="mt-6 glass-card p-6">
        <h3 className="font-heading text-lg font-bold text-white">GoHighLevel CRM</h3>
        <p className="mt-1 text-sm text-gray-400">Bidirectional sync between PD and GHL contacts</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">API Key</label>
            <input
              type="password"
              value={ghl.api_key}
              onChange={e => setGhl({ ...ghl, api_key: e.target.value })}
              placeholder="eyJhbGciOi..."
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Location ID</label>
              <input
                type="text"
                value={ghl.location_id}
                onChange={e => setGhl({ ...ghl, location_id: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Pipeline ID</label>
              <input
                type="text"
                value={ghl.pipeline_id}
                onChange={e => setGhl({ ...ghl, pipeline_id: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Sync Direction</label>
            <select
              value={ghl.sync_direction}
              onChange={e => setGhl({ ...ghl, sync_direction: e.target.value })}
              className={inputClass}
            >
              <option value="pd_to_ghl" className="bg-pd-dark">PD → GHL</option>
              <option value="ghl_to_pd" className="bg-pd-dark">GHL → PD</option>
              <option value="bidirectional" className="bg-pd-dark">Bidirectional</option>
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ghl.auto_sync}
              onChange={e => setGhl({ ...ghl, auto_sync: e.target.checked })}
              className="h-4 w-4 rounded border-gray-600 bg-pd-dark text-pd-blue"
            />
            <span className="text-sm text-gray-300">Enable auto-sync</span>
          </label>

          <div className="flex gap-3 border-t border-white/10 pt-4">
            <button
              onClick={testConnection}
              disabled={testing || !ghl.api_key}
              className="flex items-center gap-2 rounded-lg border border-pd-purple/30 px-4 py-2 text-sm text-pd-purple-light hover:bg-pd-purple/10 disabled:opacity-50"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : testResult === "success" ? <CheckCircle className="h-4 w-4 text-green-400" /> : testResult === "failed" ? <AlertCircle className="h-4 w-4 text-red-400" /> : null}
              Test Connection
            </button>
            <button
              onClick={syncNow}
              disabled={syncing}
              className="flex items-center gap-2 rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark disabled:opacity-50"
            >
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sync Now
            </button>
          </div>
          {syncResult && <p className="text-sm text-gray-400">{syncResult}</p>}
        </div>
      </div>
    </div>
  );
}
