import React, { useState, useRef } from 'react';
import { Type } from '@google/genai';
import { UploadCloud, Loader2, FileJson, ScanLine } from 'lucide-react';

const getAiInstance = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const { GoogleGenAI } = require('@google/genai');
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `คุณคือ API สำหรับดึงข้อมูล (Data Extraction API) หน้าที่ของคุณคือวิเคราะห์รูปภาพสลิปโอนเงินที่แนบมา และส่งออกข้อมูล (Output) เป็นรูปแบบ JSON เท่านั้น ห้ามมีข้อความอธิบายใดๆ ทั้งสิ้น หากอ่านข้อมูลฟิลด์ไหนไม่ออก ให้ใส่ค่า null.
นอกจากนี้ ให้ตรวจสอบความผิดปกติบนสลิปเพื่อค้นหาว่าเป็นสลิปปลอมหรือไม่ (เช่น ตัวอักษรเบี้ยว ฟอนต์ไม่ตรง ขนาดตัวเลขยอดเงินไม่สม่ำเสมอ รอยแก้ไขภาพ วันที่และเวลาขัดแย้งกัน หรือไม่มีเลขที่อ้างอิง) และเพิ่มผลลัพธ์การตรวจสอบการปลอมแปลงลงไปใน JSON

โครงสร้าง JSON ที่ต้องการ:
{
  "bank_sender": "ชื่อธนาคารต้นทาง",
  "sender_name": "ชื่อผู้โอน",
  "bank_receiver": "ชื่อธนาคารปลายทาง",
  "receiver_name": "ชื่อผู้รับโอน",
  "amount": "ตัวเลขยอดเงิน (ไม่ต้องมีลูกน้ำ)",
  "transfer_date": "YYYY-MM-DD",
  "transfer_time": "HH:MM",
  "reference_no": "เลขที่อ้างอิงการโอน",
  "is_suspicious": boolean (true ถ้าสงสัยว่าเป็นสลิปปลอม, false ถ้าดูปกติ),
  "suspicious_reason": "เหตุผลที่ระบุว่าทำไมถึงสงสัยว่าเป็นสลิปปลอม (ถ้า is_suspicious เป็น false ให้ใส่ null)"
}`;

export default function SlipScanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [aiEngine, setAiEngine] = useState<'gemini' | 'ollama'>('gemini');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setLoading(true);
    setResult('');

    try {
      const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result?.toString();
          if (result) {
            resolve(result.split(',')[1]);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = await base64EncodedDataPromise;

      if (aiEngine === 'gemini') {
        const aiInstance = getAiInstance();
        if (!aiInstance) {
           setResult('// Error: Gemini API Key is missing. Please set GEMINI_API_KEY.');
           return;
        }

        console.log('Sending image to Gemini...');
        const response = await aiInstance.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            { inlineData: { data: base64Data, mimeType: file.type } },
            { text: "Extract data from this image." }
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.0,
            responseMimeType: "application/json"
          }
        });

        console.log('Response received', response);
        setResult(response.text || '');
      } else {
        // ใช้โหมด Local AI (Ollama Local API)
        const ollamaUrl = `http://${window.location.hostname}:11434/api/chat`;
        console.log(`Sending image to Local Ollama API (${ollamaUrl})...`);
        const response = await fetch(ollamaUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "llama3.2-vision",
            stream: false,
            messages: [{
                role: 'user',
                content: SYSTEM_INSTRUCTION + "\n\nAnalyze this slip and return the valid JSON containing the specified format.",
                images: [base64Data]
            }]
          })
        });

        if (!response.ok) {
           const errorText = await response.text();
           console.error("Ollama Response Error:", errorText);
           throw new Error(`Ollama Server Error: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Local Ollama Response received', data);
        setResult(data.message?.content || '');
      }

    } catch (err: any) {
      console.error("OCR Error:", err);
      if (aiEngine === 'ollama') {
        setResult(`// Failed to connect to Local Ollama.\n// Ensure Docker 'ollama-service' is running and model 'llama3.2-vision' is downloaded.\n// Error details: ${err.message}`);
      } else if (err?.status === 403 || err?.message?.includes('403') || err?.message?.includes('permission')) {
        setResult('// Error 403 Permission Denied\n// Your current API Key does not have permission to use this model.\n// Please check the Secrets panel and ensure you have a valid Gemini API Key.');
      } else {
        setResult(JSON.stringify({ 
          error: 'Failed to extract data. See console.', 
          details: err?.message || err?.toString() || 'Unknown error' 
        }, null, 2));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Payment Slip OCR</h2>
        <p className="text-gray-500">Upload a payment slip to automatically extract its details into structured JSON data.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200">
            <span className="text-sm font-medium text-gray-700 min-w-max">AI Engine :</span>
            <div className="flex gap-2 w-full">
              <button 
                type="button"
                onClick={() => setAiEngine('gemini')}
                className={`flex-1 py-1.5 px-3 text-sm rounded-md transition-colors ${aiEngine === 'gemini' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                ☁️ Gemini (Cloud)
              </button>
              <button 
                type="button"
                onClick={() => setAiEngine('ollama')}
                className={`flex-1 py-1.5 px-3 text-sm rounded-md transition-colors ${aiEngine === 'ollama' ? 'bg-green-100 text-green-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                💻 Ollama (Local GPU)
              </button>
            </div>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 cursor-pointer h-[300px] transition-colors"
          >
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-full max-w-full rounded shadow-sm object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex flex-col items-center text-gray-500 space-y-3">
                <UploadCloud className="w-12 h-12 stroke-1" />
                <p>Click to upload or drag and drop</p>
                <p className="text-sm text-gray-400">SVG, PNG, JPG or GIF</p>
              </div>
            )}
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex items-start gap-3">
            <ScanLine className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-900">
              <p className="font-semibold mb-1">Slip Verification API Playground</p>
              <p>Upload a slip to see real-time extraction and fraud detection in action. Toggle between our Cloud (Gemini) or your Local (Ollama) GPU OCR engines.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 h-[400px] lg:h-auto border rounded-xl overflow-hidden shadow-sm bg-[#1e1e1e]">
          <div className="px-4 py-3 border-b border-gray-700 bg-[#2d2d2d] text-gray-200 font-medium flex items-center justify-between">
            <span className="flex items-center gap-2"><FileJson className="w-4 h-4" /> Extracted JSON Output</span>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </div>
          <div className="p-4 flex-1 overflow-auto text-green-400 font-mono text-sm leading-relaxed whitespace-pre align-top">
            {result ? result : (
              loading ? "// Analyzing image..." : "// Waiting for upload..."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
