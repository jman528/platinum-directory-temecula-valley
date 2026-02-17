import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Messages</h1>
      <div className="mt-8 glass-card p-12 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-600" />
        <p className="mt-4 text-lg text-gray-400">Messaging coming soon</p>
        <p className="mt-2 text-sm text-gray-500">Customer messages and inquiries will appear here.</p>
      </div>
    </div>
  );
}
