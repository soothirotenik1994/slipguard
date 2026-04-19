import React from 'react';
import { Terminal, Copy, CheckCircle2 } from 'lucide-react';

export default function ApiDocs() {
  const [copied, setCopied] = React.useState(false);

  const curlExample = `curl -X POST "https://api.yourdomain.com/v1/verify" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_base64": "iVBORw0KGgoAAAANSUhEUgAAA...",
    "mime_type": "image/jpeg"
  }'`;

  const responseExample = `{
  "status": "success",
  "data": {
    "bank_sender": "KASIKORNBANK",
    "sender_name": "SOMCHAI J.",
    "bank_receiver": "SCB",
    "receiver_name": "YOUR COMPANY CO., LTD",
    "amount": 1500.00,
    "transfer_date": "2023-10-25",
    "transfer_time": "14:30",
    "reference_no": "0123456789ABCDEF",
    "is_suspicious": false,
    "suspicious_reason": null
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">API Documentation</h2>
        <p className="text-gray-500">Integrate our Slip Verification engine into your application, POS, or LINE Bot seamlessly.</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Endpoint: Verify Slip</h3>
        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold">POST</span>
          <span className="text-gray-700 bg-gray-100 px-3 py-1 rounded w-full">/v1/verify</span>
        </div>
        <p className="text-gray-600 text-sm">Validates a payment slip image and extracts transaction details along with fraud detection signals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Request Headers</h4>
          <div className="bg-white border rounded-lg p-4 text-sm text-gray-600 space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="font-mono text-gray-900">Authorization</span>
              <span>Bearer access_token</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-mono text-gray-900">Content-Type</span>
              <span>application/json</span>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 pt-4">Request Body (JSON)</h4>
          <div className="bg-white border rounded-lg p-4 text-sm text-gray-600 space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="font-mono text-gray-900">image_base64 <span className="text-red-500">*</span></span>
              <span>string</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-mono text-gray-900">mime_type</span>
              <span>string (e.g., image/png)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">cURL Example</h4>
            <button onClick={handleCopy} className="text-xs flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors">
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto text-green-400 font-mono text-xs leading-relaxed">
            <pre>{curlExample}</pre>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-semibold text-gray-900">Response Object</h4>
        <div className="bg-[#1e1e1e] p-4 rounded-xl overflow-x-auto text-yellow-300 font-mono text-xs leading-relaxed">
          <pre>{responseExample}</pre>
        </div>
      </div>
    </div>
  );
}
