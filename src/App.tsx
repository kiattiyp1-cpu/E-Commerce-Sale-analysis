/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Upload, 
  Filter, 
  LayoutDashboard, 
  TrendingUp, 
  Package, 
  Users, 
  Store,
  Calendar,
  ChevronDown,
  Download,
  AlertCircle,
  FileText,
  RefreshCw,
  FileDown,
  Target,
  Search,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parse, isValid, startOfDay, endOfDay, isWithinInterval, subDays, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility Functions ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const BRANCH_MAPPING: Record<string, { name: string, state: string }> = {
  'MM-001': { name: 'Head Office', state: 'Yangon' },
  'MM-101': { name: 'Lanthit', state: 'Yangon' },
  'MM-102': { name: 'Theik Pan', state: 'Mandalay' },
  'MM-103': { name: 'Satsan', state: 'Yangon' },
  'MM-104': { name: 'East Dagon', state: 'Yangon' },
  'MM-105': { name: 'Mawlamyine', state: 'Mon' },
  'MM-106': { name: 'Tampawady', state: 'Mandalay' },
  'MM-107': { name: 'Hlaing Tharyar', state: 'Yangon' },
  'MM-108': { name: 'Aye Tharyar', state: 'Shan' },
  'MM-110': { name: 'Bago', state: 'Bago' },
  'MM-112': { name: 'PRO 1 PLUS (Terminal M)', state: 'Yangon' },
  'MM-113': { name: 'South Dagon', state: 'Yangon' },
  'MM-114': { name: 'Da Nyin Gone', state: 'Yangon' },
  'MM-115': { name: 'Nay Pyi Taw', state: 'Nay Pyi Taw' },
  'MM-201': { name: 'Project Sales', state: 'Yangon' },
  'MM-202': { name: 'Shop.com Online Sales', state: 'Yangon' },
  'MM-203': { name: 'Outlet Store', state: 'Yangon' },
  'MM-204': { name: 'PRO 1 Online Store', state: 'Yangon' },
  'MM-205': { name: 'Clearance Sale', state: 'Yangon' },
  'MM-501': { name: 'WH-142', state: 'Yangon' },
  'MM-504': { name: 'WH-Myo Houng', state: 'Yangon' },
  'MM-505': { name: 'WH-Mingalardon', state: 'Yangon' },
  'MM-506': { name: 'MyawaddyDC-Yangon', state: 'Kayin' },
  'MM-507': { name: 'MyawaddyDC-Mandalay', state: 'Mandalay' },
  'MM-508': { name: 'MyawaddyDC-Mawlamyine', state: 'Mon' },
  'MM-509': { name: 'DC-Myawaddy', state: 'Kayin' },
  'MM-510': { name: 'DC-Mingalardon2', state: 'Yangon' },
  'MM-109': { name: 'Mingaladon', state: 'Yangon' }
};

// --- Types ---
interface SalesData {
  Branch: string;
  'Branch Name'?: string;
  'State/Region'?: string;
  'Member_by': string;
  'Doc Type': string;
  Year: number;
  Month: number;
  Day: number;
  'Sale Order No.': string;
  'Online Type': string;
  'Doc No.': string;
  'Sale Date': Date;
  'Member Date': string;
  'Member ID': string;
  'Member Type': string;
  'Customer Code': string;
  'Customer Name': string;
  'Main Category': string;
  'Product Category': string;
  'Product Sub Category': string;
  'Product Class': string;
  'Product Sub Class': string;
  Brand: string;
  Status: string;
  'Product Code': string;
  Barcode: string;
  'Good Name': string;
  'Sale Unit': string;
  Qty: number;
  Price: number;
  Discount: number;
  'Net Amount': number;
  'Discount Type': string;
  'Vat Type': string;
}

// --- Components ---

const StatCard = ({ title, value, icon: Icon, subValue, index = 0 }: { title: string, value: string, icon: any, subValue?: string, index?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      {subValue && <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{subValue}</span>}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </motion.div>
);

const ChartContainer = ({ title, children, className, index }: { title: string, children: React.ReactNode, className?: string, index?: number }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: (index || 0) * 0.1 + 0.3 }}
    className={cn("bg-white p-6 rounded-2xl border border-slate-100 shadow-sm", className)}
  >
    <h3 className="text-slate-800 font-semibold mb-6 flex items-center gap-2">
      <div className="w-1 h-4 bg-blue-500 rounded-full" />
      {title}
    </h3>
    <div className="h-[350px] w-full">
      {children}
    </div>
  </motion.div>
);

export default function App() {
  const [data, setData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(100000);
  const [productSearch, setProductSearch] = useState('');
  const [selectedDataPoint, setSelectedDataPoint] = useState<{title: string, data: any} | null>(null);

  // Filters
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedState, setSelectedState] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedOnlineType, setSelectedOnlineType] = useState('All');
  const [selectedMemberType, setSelectedMemberType] = useState('All');

  const handleDataPointClick = (data: any, title: string) => {
    setSelectedDataPoint({ title, data });
  };

  const handlePredefinedDate = (range: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (range) {
      case '7days':
        start = subDays(today, 7);
        break;
      case 'lastMonth':
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        break;
      case 'thisYear':
        start = startOfYear(today);
        end = endOfYear(today);
        break;
      case 'allTime':
        updateInitialDateRange(data);
        return;
    }
    
    setDateRange({
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    });
  };

  const processFile = (file: File) => {
    setIsLoading(true);
    setError(null);

    const isCsv = file.name.toLowerCase().endsWith('.csv');

    if (isCsv) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        beforeFirstChunk: (chunk) => {
          // Skip 4 lines
          const lines = chunk.split(/\r\n|\r|\n/);
          return lines.slice(4).join('\n');
        },
        complete: (results) => {
          try {
            const processedData = processRawData(results.data);
            setData(processedData);
            updateInitialDateRange(processedData);
          } catch (err) {
            setError('Failed to process CSV data.');
          } finally {
            setIsLoading(false);
          }
        },
        error: (err) => {
          setError('Error reading CSV file.');
          setIsLoading(false);
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
          const wsname = workbook.SheetNames[0];
          const ws = workbook.Sheets[wsname];
          
          // Skip 4 rows, header on row 5 (index 4)
          const jsonData = XLSX.utils.sheet_to_json(ws, { range: 4 }) as any[];
          const processedData = processRawData(jsonData);
          setData(processedData);
          updateInitialDateRange(processedData);
        } catch (err) {
          setError('Failed to parse Excel file.');
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFile(file);
    processFile(file);
  };

  const handleRefresh = () => {
    if (uploadedFile) {
      processFile(uploadedFile);
    }
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    
    setIsLoading(true);
    
    // Use setTimeout to allow UI to show loading spinner before heavy processing
    setTimeout(() => {
      try {
        // Format dates for CSV export
        const exportData = filteredData.map(row => ({
          ...row,
          'Sale Date': format(row['Sale Date'], 'yyyy-MM-dd HH:mm:ss')
        }));
        
        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sales_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Failed to export CSV", err);
        setError("Failed to export CSV");
      } finally {
        setIsLoading(false);
      }
    }, 10);
  };

  const processRawData = (rawData: any[]): SalesData[] => {
    return rawData
      .filter((row: any) => {
        // Skip summary rows at the end based on Column I ('Doc No.') and Column E ('Month')
        const docNo = row['Doc No.'];
        const month = row['Month'];
        
        if (docNo === undefined || docNo === null || String(docNo).trim() === '') return false;
        if (month === undefined || month === null || String(month).trim() === '') return false;
        
        const docNoStr = String(docNo).toLowerCase();
        const monthStr = String(month).toLowerCase();
        
        if (docNoStr.includes('total') || docNoStr.includes('summary')) return false;
        if (monthStr.includes('total') || monthStr.includes('summary')) return false;
        
        return true;
      })
      .map((row: any) => {
        let saleDate = row['Sale Date'];
        if (!(saleDate instanceof Date)) {
          const parsed = new Date(saleDate);
          saleDate = isValid(parsed) ? parsed : new Date();
        }

        const branchCode = row['Branch'];
        const branchInfo = BRANCH_MAPPING[branchCode] || { name: branchCode, state: 'Unknown' };

        return {
          ...row,
          'Branch Name': branchInfo.name,
          'State/Region': branchInfo.state,
          'Sale Date': saleDate,
          Qty: Number(row['Qty']) || 0,
          Price: Number(row['Price']) || 0,
          Discount: Number(row['Discount']) || 0,
          'Net Amount': Number(row['Net Amount']) || 0,
          Year: Number(row['Year']),
          Month: Number(row['Month']),
          Day: Number(row['Day']),
        };
      });
  };

  const updateInitialDateRange = (processedData: SalesData[]) => {
    if (processedData.length > 0) {
      const dates = processedData.map(d => d['Sale Date'].getTime());
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      setDateRange({
        start: format(minDate, 'yyyy-MM-dd'),
        end: format(maxDate, 'yyyy-MM-dd')
      });
    }
  };

  // Filtered Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const date = item['Sale Date'];
      const inDateRange = (!dateRange.start || !dateRange.end) || 
        isWithinInterval(date, { 
          start: startOfDay(new Date(dateRange.start)), 
          end: endOfDay(new Date(dateRange.end)) 
        });
      
      const stateMatch = selectedState === 'All' || item['State/Region'] === selectedState;
      const branchMatch = selectedBranch === 'All' || item['Branch'] === selectedBranch;
      const onlineTypeMatch = selectedOnlineType === 'All' || item['Online Type'] === selectedOnlineType;
      const memberTypeMatch = selectedMemberType === 'All' || item['Member Type'] === selectedMemberType;

      return inDateRange && stateMatch && branchMatch && onlineTypeMatch && memberTypeMatch;
    });
  }, [data, dateRange, selectedState, selectedBranch, selectedOnlineType, selectedMemberType]);

  // Filter Options
  const filterOptions = useMemo(() => {
    return {
      states: ['All', ...Array.from(new Set(data.map(d => d['State/Region'])))].filter(Boolean),
      branches: ['All', ...Array.from(new Set(data.map(d => d['Branch'])))].filter(Boolean),
      onlineTypes: ['All', ...Array.from(new Set(data.map(d => d['Online Type'])))].filter(Boolean),
      memberTypes: ['All', ...Array.from(new Set(data.map(d => d['Member Type'])))].filter(Boolean),
    };
  }, [data]);

  // --- Calculations ---
  const kpis = useMemo(() => {
    const totalSales = filteredData.reduce((acc, curr) => acc + curr['Net Amount'], 0);
    const totalQty = filteredData.reduce((acc, curr) => acc + curr['Qty'], 0);
    const uniqueOrders = new Set(filteredData.map(d => d['Sale Order No.'])).size;
    const aov = uniqueOrders > 0 ? totalSales / uniqueOrders : 0;

    return { totalSales, totalQty, uniqueOrders, aov };
  }, [filteredData]);

  const timeSeriesData = useMemo(() => {
    const grouped = filteredData.reduce((acc: any, curr) => {
      const dateStr = format(curr['Sale Date'], 'yyyy-MM-dd');
      if (!acc[dateStr]) acc[dateStr] = { date: dateStr, sales: 0, qty: 0 };
      acc[dateStr].sales += curr['Net Amount'];
      acc[dateStr].qty += curr['Qty'];
      return acc;
    }, {});

    return Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [filteredData]);

  const categoryData = useMemo(() => {
    const mainCat = filteredData.reduce((acc: any, curr) => {
      const cat = curr['Main Category'] || 'Unknown';
      acc[cat] = (acc[cat] || 0) + curr['Net Amount'];
      return acc;
    }, {});

    return Object.entries(mainCat)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 8);
  }, [filteredData]);

  const topProducts = useMemo(() => {
    const products = filteredData.reduce((acc: any, curr) => {
      const name = curr['Good Name'] || curr['Product Code'] || 'Unknown';
      
      if (productSearch) {
        const searchLower = productSearch.toLowerCase();
        const codeLower = String(curr['Product Code'] || '').toLowerCase();
        const nameLower = String(curr['Good Name'] || '').toLowerCase();
        if (!nameLower.includes(searchLower) && !codeLower.includes(searchLower)) {
          return acc;
        }
      }

      if (!acc[name]) acc[name] = { name, sales: 0, qty: 0 };
      acc[name].sales += curr['Net Amount'];
      acc[name].qty += curr['Qty'];
      return acc;
    }, {});

    return Object.values(products)
      .sort((a: any, b: any) => b.sales - a.sales)
      .slice(0, 10);
  }, [filteredData, productSearch]);

  const brandData = useMemo(() => {
    const brands = filteredData.reduce((acc: any, curr) => {
      const brand = curr['Brand'] || 'Unknown';
      acc[brand] = (acc[brand] || 0) + curr['Net Amount'];
      return acc;
    }, {});

    return Object.entries(brands)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10);
  }, [filteredData]);

  const memberBreakdown = useMemo(() => {
    const members = filteredData.reduce((acc: any, curr) => {
      const type = curr['Member Type'] || 'Non Member';
      acc[type] = (acc[type] || 0) + curr['Net Amount'];
      return acc;
    }, {});

    return Object.entries(members).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const topCustomers = useMemo(() => {
    const customers = filteredData.reduce((acc: any, curr) => {
      const name = curr['Customer Name'] || 'Unknown';
      acc[name] = (acc[name] || 0) + curr['Net Amount'];
      return acc;
    }, {});

    return Object.entries(customers)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10);
  }, [filteredData]);

  const branchSales = useMemo(() => {
    const branches = filteredData.reduce((acc: any, curr) => {
      const branchCode = curr['Branch'] || 'Unknown';
      const branchName = curr['Branch Name'] || branchCode;
      const label = branchCode === 'Unknown' ? 'Unknown' : `${branchCode} - ${branchName}`;
      acc[label] = (acc[label] || 0) + curr['Net Amount'];
      return acc;
    }, {});

    return Object.entries(branches)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value);
  }, [filteredData]);

  const channelSales = useMemo(() => {
    const channels = filteredData.reduce((acc: any, curr) => {
      const channel = curr['Online Type'] || 'Offline';
      acc[channel] = (acc[channel] || 0) + curr['Net Amount'];
      return acc;
    }, {});

    return Object.entries(channels)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value);
  }, [filteredData]);

  // --- Render Helpers ---
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const formatNumber = (val: number) => 
    new Intl.NumberFormat('en-US').format(val);

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-slate-100">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Upload className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Sales Dashboard</h1>
          <p className="text-slate-500 mb-8">Upload your e-commerce sales data (CSV or XLSX) to start analyzing.</p>
          
          <label className="block">
            <span className="sr-only">Choose file</span>
            <input 
              type="file" 
              accept=".csv,.xlsx" 
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-3 file:px-6
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
            />
          </label>

          {isLoading && (
            <div className="mt-6 flex items-center justify-center gap-2 text-blue-600 font-medium">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Processing data...
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-slate-100 text-left">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Required Format</h4>
            <ul className="text-xs text-slate-500 space-y-2">
              <li>• Header starts at row 5 (A5:AG5)</li>
              <li>• Columns: Branch, Sale Date, Net Amount, Qty, etc.</li>
              <li>• Supported: .xlsx, .csv</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isLoading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 border border-slate-100">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 font-medium">Processing data...</p>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-bold text-slate-900 tracking-tight">Sales Analytics</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Date Range</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <button onClick={() => handlePredefinedDate('7days')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors">Last 7 Days</button>
                <button onClick={() => handlePredefinedDate('lastMonth')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors">Last Month</button>
                <button onClick={() => handlePredefinedDate('thisYear')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors">This Year</button>
                <button onClick={() => handlePredefinedDate('allTime')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors">All Time</button>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">State/Region</label>
              <select 
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                {filterOptions.states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Branch</label>
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                {filterOptions.branches.map(b => (
                  <option key={b} value={b}>
                    {b === 'All' ? 'All' : `${b} - ${BRANCH_MAPPING[b]?.name || 'Unknown'}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Online Type</label>
              <select 
                value={selectedOnlineType}
                onChange={(e) => setSelectedOnlineType(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                {filterOptions.onlineTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Member Type</label>
              <select 
                value={selectedMemberType}
                onChange={(e) => setSelectedMemberType(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                {filterOptions.memberTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 space-y-3">
          <button 
            onClick={handleExportCSV}
            disabled={isLoading || filteredData.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 font-semibold rounded-xl transition-colors text-sm disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={handleRefresh}
            disabled={isLoading || !uploadedFile}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition-colors text-sm disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh Data
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            New Upload
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Dashboard Overview</h2>
            <p className="text-slate-500">Real-time insights from your sales data.</p>
          </div>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'trend', label: 'Trends', icon: TrendingUp },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'channels', label: 'Channels', icon: Store },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  activeTab === tab.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard index={0} title="Total Revenue" value={formatCurrency(kpis.totalSales)} icon={TrendingUp} subValue="Net Amount" />
                  <StatCard index={1} title="Total Quantity" value={formatNumber(kpis.totalQty)} icon={Package} subValue="Units Sold" />
                  <StatCard index={2} title="Total Orders" value={formatNumber(kpis.uniqueOrders)} icon={LayoutDashboard} subValue="Unique IDs" />
                  <StatCard index={3} title="Avg Order Value" value={formatCurrency(kpis.aov)} icon={Users} subValue="AOV" />
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-800 font-semibold flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      Monthly Goal Progress
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Goal:</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                        <input 
                          type="number" 
                          value={monthlyGoal}
                          onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                          className="w-32 pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-700">{formatCurrency(kpis.totalSales)}</span>
                      <span className="text-slate-500">{Math.min(100, Math.round((kpis.totalSales / monthlyGoal) * 100))}%</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (kpis.totalSales / monthlyGoal) * 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          (kpis.totalSales / monthlyGoal) >= 1 ? "bg-green-500" : "bg-blue-500"
                        )}
                      />
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ChartContainer index={0} title="Revenue Trend (Daily)">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData} onClick={(data: any) => {
                        if (data && data.activePayload && data.activePayload.length > 0) {
                          handleDataPointClick(data.activePayload[0].payload, 'Daily Revenue Details');
                        }
                      }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#94a3b8" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(val) => `$${val/1000}k`}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(val: number) => [formatCurrency(val), 'Revenue']}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <ChartContainer index={1} title="Top Categories by Revenue">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} layout="vertical" onClick={(data: any) => {
                        if (data && data.activePayload && data.activePayload.length > 0) {
                          handleDataPointClick(data.activePayload[0].payload, 'Category Details');
                        }
                      }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          stroke="#64748b" 
                          fontSize={12} 
                          width={120}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(val: number) => [formatCurrency(val), 'Revenue']}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </motion.div>
            )}

            {activeTab === 'trend' && (
              <motion.div
                key="trend"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="space-y-8">
                  <ChartContainer index={0} title="Daily Sales Volume (Quantity)">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeSeriesData} onClick={(data: any) => {
                        if (data && data.activePayload && data.activePayload.length > 0) {
                          handleDataPointClick(data.activePayload[0].payload, 'Daily Volume Details');
                        }
                      }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#94a3b8" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                        />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="qty" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <ChartContainer index={1} title="Cumulative Revenue Trend">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeSeriesData} onClick={(data: any) => {
                        if (data && data.activePayload && data.activePayload.length > 0) {
                          handleDataPointClick(data.activePayload[0].payload, 'Cumulative Revenue Details');
                        }
                      }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#94a3b8" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                        />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Line type="stepAfter" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </motion.div>
            )}

            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search products by name or code..." 
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    {productSearch && (
                      <button 
                        onClick={() => setProductSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ChartContainer index={0} title="Top 10 Products by Revenue">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProducts} layout="vertical" onClick={(data: any) => {
                        if (data && data.activePayload && data.activePayload.length > 0) {
                          handleDataPointClick(data.activePayload[0].payload, 'Product Details');
                        }
                      }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          stroke="#64748b" 
                          fontSize={11} 
                          width={150}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(val: number) => [formatCurrency(val), 'Revenue']}
                        />
                        <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <ChartContainer index={1} title="Sales by Brand (Top 10)">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart onClick={(data: any) => {
                        if (data && data.activePayload && data.activePayload.length > 0) {
                          handleDataPointClick(data.activePayload[0].payload, 'Brand Details');
                        }
                      }}>
                        <Pie
                          data={brandData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {brandData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </motion.div>
            )}

            {activeTab === 'customers' && (
              <motion.div
                key="customers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ChartContainer index={0} title="Member vs Non-Member Sales">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart onClick={(data: any) => {
                        if (data && data.activePayload && data.activePayload.length > 0) {
                          handleDataPointClick(data.activePayload[0].payload, 'Member Type Details');
                        }
                      }}>
                        <Pie
                          data={memberBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {memberBreakdown.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#94a3b8'} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <ChartContainer index={1} title="Top 10 Customers by Revenue">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topCustomers} layout="vertical" onClick={(data: any) => {
                        if (data && data.activePayload && data.activePayload.length > 0) {
                          handleDataPointClick(data.activePayload[0].payload, 'Customer Details');
                        }
                      }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          stroke="#64748b" 
                          fontSize={11} 
                          width={150}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(val: number) => [formatCurrency(val), 'Revenue']}
                        />
                        <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </motion.div>
            )}

            {activeTab === 'channels' && (
              <motion.div
                key="channels"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ChartContainer index={0} title="Sales by Branch">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={branchSales} onClick={(data: any) => {
                        if (data && data.activePayload && data.activePayload.length > 0) {
                          handleDataPointClick(data.activePayload[0].payload, 'Branch Details');
                        }
                      }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <ChartContainer index={1} title="Sales by Online Type">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={channelSales} onClick={(data: any) => {
                        if (data && data.activePayload && data.activePayload.length > 0) {
                          handleDataPointClick(data.activePayload[0].payload, 'Online Type Details');
                        }
                      }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Data Point Details Modal */}
      <AnimatePresence>
        {selectedDataPoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDataPoint(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">{selectedDataPoint.title}</h3>
                <button 
                  onClick={() => setSelectedDataPoint(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 bg-slate-50">
                <div className="space-y-3">
                  {Object.entries(selectedDataPoint.data).map(([key, value]) => {
                    // Skip internal recharts properties or complex objects
                    if (key.startsWith('__') || typeof value === 'object') return null;
                    
                    let displayValue = String(value);
                    if (typeof value === 'number') {
                      if (key.toLowerCase().includes('sales') || key.toLowerCase().includes('value') || key.toLowerCase().includes('amount')) {
                        displayValue = formatCurrency(value);
                      } else {
                        displayValue = formatNumber(value);
                      }
                    }

                    return (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                        <span className="text-sm font-medium text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm font-bold text-slate-900">{displayValue}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
