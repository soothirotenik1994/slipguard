/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import SlipScanner from './components/SlipScanner';
import ApiDocs from './components/ApiDocs';
import { ScanLine, Code2, ShieldCheck, Key, Settings } from 'lucide-react';
import { cn } from './lib/utils';

type Tab = 'demo' | 'docs' | 'keys';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('demo');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col shadow-sm relative z-10">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 leading-tight">SlipGuard</h1>
            <p className="text-xs text-indigo-600 font-medium">B2B API Service</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-x-auto md:overflow-visible flex md:flex-col min-w-max md:min-w-0 border-b md:border-b-0">
          <div className="px-3 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:block">
            Playground
          </div>
          <button
            onClick={() => setActiveTab('demo')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full",
              activeTab === 'demo' 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <ScanLine className="w-5 h-5" />
            <span>Live Demo</span>
          </button>

          <div className="px-3 pt-6 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:block">
            Developers
          </div>
          <button
            onClick={() => setActiveTab('docs')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full",
              activeTab === 'docs' 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Code2 className="w-5 h-5" />
            <span>API Documentation</span>
          </button>
          
          <button
            onClick={() => setActiveTab('keys')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full",
              activeTab === 'keys' 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Key className="w-5 h-5" />
            <span>API Keys</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-gray-500 hover:text-gray-900 cursor-pointer transition-colors mt-auto">
          <div className="flex items-center gap-3 text-sm font-medium">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold w-full text-center">AD</span>
            </div>
            Admin
          </div>
          <Settings className="w-4 h-4" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-h-[100dvh] overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)]">
            {activeTab === 'demo' && <SlipScanner />}
            {activeTab === 'docs' && <ApiDocs />}
            {activeTab === 'keys' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">API Keys</h2>
                  <p className="text-gray-500">Manage your secrets to securely connect to the SlipGuard API.</p>
                </div>
                <div className="border border-red-200 bg-red-50 text-red-900 p-4 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800">Do not share your API keys</h3>
                    <p className="text-sm mt-1">If your API key is compromised, anyone can use your slip verification quota. Always keep it secure.</p>
                  </div>
                </div>
                <div className="border rounded-xl p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Production Key</p>
                    <p className="text-sm font-mono text-gray-500">sk_live_***********</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Reveal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
