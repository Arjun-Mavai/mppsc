'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';

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

  // New Features States
  const [templateName, setTemplateName] = useState<'mppsc_pyq_promo' | 'zenscroll_alert'>('zenscroll_alert');
  const [imageUrl, setImageUrl] = useState('https://mppsc.zenscroll.in/marketing/mppsc-alert.png');
  
  // Custom Add State
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);

  const [insights, setInsights] = useState<any[]>([]);

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
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await fetch('/api/whatsapp/insights');
      if (res.ok) {
        const data = await res.json();
        setInsights(data.replies || []);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchData();
    fetchInsights();
    const interval = setInterval(() => {
      fetchData();
      fetchInsights();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAddCustomContact = async () => {
    if (!manualPhone.trim()) {
      return toast.error('Please enter a valid phone number');
    }
    setIsAddingContact(true);
    try {
      const res = await fetch('/api/whatsapp/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          students: [{ name: manualName.trim() || 'Guest', phone_number: manualPhone.trim() }] 
        }),
      });

      if (res.ok) {
        toast.success('Contact added successfully! Select them from the directory to send.');
        setManualName('');
        setManualPhone('');
        await fetchData(); // Refresh list immediately
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add contact');
      }
    } catch (e) {
      toast.error('An error occurred');
    } finally {
      setIsAddingContact(false);
    }
  };

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
        toast.success(`Successfully imported ${data.added} students. You can now select them to execute a campaign.`);
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
    if (selectedIds.size === 0) {
      return toast.error('Select at least one contact from the directory');
    }
    setIsSending(true);

    try {
      const res = await fetch('/api/whatsapp/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentIds: Array.from(selectedIds), 
          senderMode,
          templateName,
          imageUrl: templateName === 'zenscroll_alert' ? imageUrl : undefined
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Campaign started for ${data.sentCount} recipients`);
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
            <p className="text-sm text-zinc-500 mt-1">Manage bulk campaigns, dynamic templates, and track real-time active leads.</p>
          </div>
          
          <div className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 p-1 text-zinc-500 shadow-inner">
            <button
              onClick={() => setSenderMode('MAIN')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                senderMode === 'MAIN' ? 'bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200' : 'hover:text-zinc-900'
              }`}
            >
              Main Account
            </button>
            <button
              onClick={() => setSenderMode('TEST')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                senderMode === 'TEST' ? 'bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200' : 'hover:text-zinc-900'
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
            { label: 'Replied / Active', value: stats.REPLIED }
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <h3 className="text-sm font-medium text-zinc-500">{stat.label}</h3>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Config & Add Contacts */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Template Configuration */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-zinc-950">Template Config</h2>
                <p className="text-sm text-zinc-500">Select template to broadcast</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Select Template</label>
                  <select 
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value as any)}
                    className="w-full rounded-md border border-zinc-200 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  >
                    <option value="zenscroll_alert">ZenScroll Alert (Image + Body + Link)</option>
                    <option value="mppsc_pyq_promo">MPPSC PYQ Promo (Text Only)</option>
                  </select>
                </div>

                {templateName === 'zenscroll_alert' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Header Image URL</label>
                    <input 
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full rounded-md border border-zinc-200 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-sm text-zinc-700 whitespace-pre-line leading-relaxed">
                  <span className="mb-3 inline-block rounded border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 shadow-sm">
                    Preview: {templateName}
                  </span>
                  <br />
                  {templateName === 'zenscroll_alert' ? (
                    <>
                      {imageUrl && <img src={imageUrl} alt="Header" className="w-full h-24 object-cover rounded mb-2 border border-zinc-200" />}
                      Hello {"{{user.name}}"}! Welcome to ZenScroll. Your MPPSC preparation journey starts here. 🚀<br/><br/>
                      <span className="text-zinc-400 text-xs italic">Stop updates: Reply STOP</span>
                      <div className="mt-3 flex items-center justify-center py-2 bg-white border border-zinc-200 rounded text-blue-600 font-medium text-xs">
                        ↗ Visit website
                      </div>
                    </>
                  ) : (
                    <>
                      नमस्ते {"{{user.name}}"}! 🎓<br/>
                      Zenscroll MPPSC प्लेटफॉर्म पर आपका स्वागत है। आपकी तैयारी को मजबूत करने के लिए आज का MPPSC PYQ:
                      <br/><br/>
                      📝 *प्रश्न: मध्यप्रदेश का राजकीय पक्षी कौन सा है?*<br/>
                      A) मोर<br/>
                      B) दूधराज (Asian Paradise Flycatcher)<br/>
                      C) तोता<br/>
                      D) कबूतर
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Manual Add Contact */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm border-l-4 border-l-blue-500">
               <div className="mb-4">
                <h2 className="text-base font-semibold text-zinc-950">Add Custom Contact</h2>
                <p className="text-sm text-zinc-500 leading-relaxed">Add a single number to the directory below so you can select and send.</p>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name (e.g. Arjun)"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Phone Number (e.g. 919876543210)"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddCustomContact}
                  disabled={isAddingContact || !manualPhone.trim()}
                  className="w-full inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm transition-colors hover:bg-blue-50 disabled:opacity-50"
                >
                  {isAddingContact ? 'Adding...' : 'Add to Directory'}
                </button>
              </div>
            </div>

            {/* Import Section */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
               <div className="mb-4">
                <h2 className="text-base font-semibold text-zinc-950">Bulk Import Data</h2>
                <p className="text-sm text-zinc-500 leading-relaxed">Paste CSV formatted exactly as <strong>Name, Phone</strong>. Once uploaded, they will appear in the directory on the right where you can select them.</p>
              </div>
              <textarea
                className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                rows={3}
                placeholder="Arjun, 919876543210&#10;Rahul, 918765432109"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
              ></textarea>
              <div className="mt-3">
                <button
                  onClick={handleImportCSV}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-50"
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
                  <span className="font-medium text-zinc-900">{selectedIds.size}</span> selected out of <span className="font-medium text-zinc-900">{validFilteredStudents.length}</span> total contacts
                </p>
              </div>
              <button
                onClick={handleSendCampaign}
                disabled={isSending || selectedIds.size === 0}
                className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-zinc-800 disabled:opacity-50"
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Executing...
                  </span>
                ) : (
                  `Execute Campaign (${selectedIds.size})`
                )}
              </button>
            </div>

            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Filter by name, phone, or origin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-transparent py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full sm:w-48 rounded-md border border-zinc-200 bg-transparent py-2 px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="ALL">All Origins</option>
                {uniqueSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            {selectedIds.size > 0 && (
              <div className="mb-4 flex flex-wrap gap-2 max-h-24 overflow-y-auto p-3 bg-zinc-50/80 rounded-md border border-zinc-100">
                {students.filter(s => selectedIds.has(s.id)).map(s => (
                  <span key={`chip-${s.id}`} className="inline-flex items-center px-2 py-1 rounded bg-white border border-zinc-200 text-zinc-700 text-xs font-medium shadow-sm">
                    {s.name}
                    <button onClick={() => toggleSelect(s.id, !!s.mobile)} className="ml-1.5 text-zinc-400 hover:text-zinc-900">
                       <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

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
                            className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
                            checked={selectedIds.has(student.id)}
                            onChange={() => toggleSelect(student.id, hasMobile)}
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-zinc-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {hasMobile ? student.mobile : 'Unavailable'}
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
                      <td colSpan={4} className="px-6 py-16 text-center text-zinc-500 text-sm">
                        No recipients matched your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Insights / Active Leads Section */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm mt-8 overflow-hidden">
          <div className="p-6 border-b border-zinc-200 bg-zinc-50/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  Active Leads & Replies
                </h2>
                <p className="text-sm text-zinc-500 mt-1">Users who replied to your campaigns. 24-hour Service Window is OPEN (Free Replies)!</p>
              </div>
              <Link 
                href="/admin/support-inbox" 
                className="inline-flex items-center justify-center rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm transition-colors hover:bg-blue-100 border border-blue-200"
              >
                Open Support Inbox &rarr;
              </Link>
            </div>
          </div>
          
          <div className="p-6 max-h-[500px] overflow-y-auto">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {insights.map((insight: any) => (
                <div key={insight.id} className="p-4 rounded-lg border border-zinc-200 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-sm text-zinc-900">{insight.userName || 'Student'}</div>
                        <div className="font-mono text-xs text-zinc-500 mt-0.5">{insight.userPhone}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
                          {insight.createdAt ? format(new Date(insight.createdAt), 'EEEE') : ''}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
                          {insight.createdAt ? format(new Date(insight.createdAt), 'hh:mm a') : ''}
                        </div>
                      </div>
                    </div>
                    <div className="bg-zinc-50 rounded p-3 border border-zinc-100">
                      <p className="text-sm text-zinc-800 line-clamp-4 leading-relaxed font-medium">"{insight.message}"</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                      Window Open
                    </span>
                    <Link 
                      href={`/admin/support-inbox?phone=${insight.userPhone?.replace('+', '')}`} 
                      className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Reply Now &rarr;
                    </Link>
                  </div>
                </div>
              ))}
              {insights.length === 0 && (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 mb-4">
                    <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-zinc-900 text-sm font-medium">No active replies yet</h3>
                  <p className="text-zinc-500 text-xs mt-1 max-w-sm mx-auto">Execute a campaign to start receiving messages. Replies will appear here automatically.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
