'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

type Guest = {
  id: string;
  name: string;
  mobile: string;
  leadSource?: string;
};

type Stats = {
  SENT: number;
  DELIVERED: number;
  READ: number;
  REPLIED: number;
};

export default function WhatsAppDashboard() {
  const [stats, setStats] = useState<Stats>({ SENT: 0, DELIVERED: 0, READ: 0, REPLIED: 0 });
  const [students, setStudents] = useState<Guest[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [csvData, setCsvData] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [senderMode, setSenderMode] = useState<'MAIN' | 'TEST'>('MAIN');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/whatsapp/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setStats(data.stats || { SENT: 0, DELIVERED: 0, READ: 0, REPLIED: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleImportCSV = async () => {
    if (!csvData.trim()) return toast.error('Please enter CSV data');
    setIsLoading(true);

    try {
      const lines = csvData.split('\n').filter((l) => l.trim().length > 0);
      const parsedStudents = lines.map((line) => {
        const [name, phone] = line.split(',').map((s) => s.trim());
        return { name, phone_number: phone };
      }).filter((s) => s.name && s.phone_number);

      if (parsedStudents.length === 0) {
        setIsLoading(false);
        return toast.error('No valid data found. Format: Name, Phone');
      }

      const res = await fetch('/api/whatsapp/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedStudents }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Successfully imported ${data.added} students`);
        setCsvData('');
        fetchData();
      } else {
        toast.error(data.error || 'Failed to import students');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during import');
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueSources = Array.from(new Set(students.map(s => s.leadSource || 'Guest'))).sort();

  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mobile?.includes(searchQuery) ||
      s.leadSource?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const sourceLabel = s.leadSource || 'Guest';
    const matchesSource = sourceFilter === 'ALL' || sourceLabel === sourceFilter;

    return matchesSearch && matchesSource;
  });

  const validFilteredStudents = filteredStudents.filter(s => s.mobile);

  const toggleSelectAll = () => {
    if (selectedIds.size === validFilteredStudents.length && validFilteredStudents.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(validFilteredStudents.map((s) => s.id)));
    }
  };

  const toggleSelect = (id: string, hasMobile: boolean) => {
    if (!hasMobile) {
      toast.error('Cannot select student without a mobile number');
      return;
    }

    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSendCampaign = async () => {
    if (selectedIds.size === 0) return toast.error('Please select at least one student');
    setIsSending(true);

    try {
      const res = await fetch('/api/whatsapp/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: Array.from(selectedIds), senderMode }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Campaign started for ${data.sentCount} students`);
        setSelectedIds(new Set());
        fetchData();
      } else {
        toast.error(data.error || 'Failed to send campaign');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while sending the campaign');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 p-6 sm:p-10 text-zinc-950 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-4 border-b border-zinc-200">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">WhatsApp Marketing</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage bulk messaging campaigns and track real-time delivery.</p>
          </div>
          
          {/* Shadcn-style Tabs */}
          <div className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 p-1 text-zinc-500 shadow-inner">
            <button
              onClick={() => setSenderMode('MAIN')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                senderMode === 'MAIN' 
                ? 'bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200' 
                : 'hover:text-zinc-900'
              }`}
            >
              Main Account
            </button>
            <button
              onClick={() => setSenderMode('TEST')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                senderMode === 'TEST' 
                ? 'bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200' 
                : 'hover:text-zinc-900'
              }`}
            >
              Test Account
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Sent Messages', value: stats.SENT },
            { label: 'Delivered', value: stats.DELIVERED },
            { label: 'Read', value: stats.READ },
            { label: 'Replied', value: stats.REPLIED }
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <h3 className="text-sm font-medium text-zinc-500">{stat.label}</h3>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Import & Preview */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Message Preview Section */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-zinc-950">Message Preview</h2>
                <p className="text-sm text-zinc-500">Live preview of the outgoing template</p>
              </div>
              
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm text-zinc-700 whitespace-pre-line leading-relaxed">
                  <span className="mb-3 inline-block rounded border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 shadow-sm">
                    {senderMode === 'MAIN' ? 'Template: hello_world' : 'Template: hello_world'}
                  </span>
                  <br />
                  Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API...
                </p>
                <div className="mt-4 border-t border-zinc-200 pt-3">
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    * Sending from your {senderMode === 'MAIN' ? 'Main' : 'Public Test'} Account using the default `hello_world` template.
                  </p>
                </div>
              </div>
            </div>

            {/* Import Section */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
               <div className="mb-4">
                <h2 className="text-base font-semibold text-zinc-950">Import Data</h2>
                <p className="text-sm text-zinc-500">Paste CSV formatted as Name, Phone</p>
              </div>
              <textarea
                className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                rows={4}
                placeholder="Arjun, 919876543210&#10;Rahul, 918765432109"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
              ></textarea>
              <div className="mt-4">
                <button
                  onClick={handleImportCSV}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isLoading ? 'Importing...' : 'Upload Data'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Student Table */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2 flex flex-col h-[850px]">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950">Recipient Directory</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  <span className="font-medium text-zinc-900">{selectedIds.size}</span> selected of <span className="font-medium text-zinc-900">{validFilteredStudents.length}</span> eligible
                </p>
              </div>
              <button
                onClick={handleSendCampaign}
                disabled={isSending || selectedIds.size === 0}
                className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50"
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Sending...
                  </span>
                ) : (
                  `Execute Campaign (${selectedIds.size})`
                )}
              </button>
            </div>

            {/* Search and Filters */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Filter by name, phone, or origin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-transparent py-2 pl-9 pr-4 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                />
              </div>

              {/* Source Dropdown Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full sm:w-48 rounded-md border border-zinc-200 bg-transparent py-2 px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              >
                <option value="ALL">All Origins</option>
                {uniqueSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            {/* Selected Chips View */}
            {selectedIds.size > 0 && (
              <div className="mb-4 flex flex-wrap gap-2 max-h-24 overflow-y-auto p-3 bg-zinc-50/80 rounded-md border border-zinc-100">
                {students.filter(s => selectedIds.has(s.id)).map(s => (
                  <span key={`chip-${s.id}`} className="inline-flex items-center px-2 py-1 rounded bg-white border border-zinc-200 text-zinc-700 text-xs font-medium shadow-sm">
                    {s.name}
                    <button onClick={() => toggleSelect(s.id, !!s.mobile)} className="ml-1.5 text-zinc-400 hover:text-zinc-900 transition-colors">
                       <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Table Container */}
            <div className="flex-1 overflow-y-auto rounded-md border border-zinc-200">
              <table className="w-full text-left text-sm text-zinc-600 relative">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 sticky top-0 z-10 border-b border-zinc-200">
                  <tr>
                    <th scope="col" className="p-4 w-12 font-medium">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 disabled:opacity-50 accent-zinc-900"
                        disabled={validFilteredStudents.length === 0}
                        checked={validFilteredStudents.length > 0 && selectedIds.size === validFilteredStudents.length}
                        onChange={toggleSelectAll}
                        title="Select all eligible students"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3.5 font-medium">Recipient</th>
                    <th scope="col" className="px-6 py-3.5 font-medium">Contact</th>
                    <th scope="col" className="px-6 py-3.5 font-medium">Origin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {filteredStudents.map((student) => {
                    const hasMobile = !!student.mobile;
                    return (
                      <tr key={student.id} className={`transition-colors ${hasMobile ? 'hover:bg-zinc-50' : 'bg-zinc-50/50 opacity-60'}`}>
                        <td className="w-4 p-4">
                          <input
                            type="checkbox"
                            disabled={!hasMobile}
                            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed accent-zinc-900"
                            checked={selectedIds.has(student.id)}
                            onChange={() => toggleSelect(student.id, hasMobile)}
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-zinc-900">
                          {student.name}
                          {!hasMobile && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] bg-red-50 text-red-600 font-bold uppercase tracking-widest border border-red-100">No Data</span>}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {hasMobile ? student.mobile : <span className="text-zinc-400 font-sans italic">Unavailable</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-600 border border-zinc-200">
                            {student.leadSource || 'Organic'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <p className="text-zinc-500 text-sm">No recipients matched your filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
