'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '../../providers/FamilyProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useFamilyScore } from '../../hooks/useFamilyScore';
import { ForestSvg } from '../../components/ForestSvg';
import { DashboardStats } from '../../components/DashboardStats';
import { 
  Plus, 
  Car, 
  Flame, 
  Lightbulb, 
  Wind, 
  Sparkles, 
  Calendar, 
  History, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { EmissionCategory } from '../../types';

export default function Dashboard() {
  const router = useRouter();
  const { 
    familyProfile, 
    members, 
    vehicles, 
    emissionLogs, 
    addLog, 
    badges 
  } = useFamily();
  
  const { user } = useAuth();
  const { actualReductionPercent } = useFamilyScore();

  // Redirect if no profile exists
  useEffect(() => {
    // Give it a tiny delay to ensure client side hydration is complete
    const timer = setTimeout(() => {
      const stored = localStorage.getItem('zr_profile');
      if (!stored) {
        router.push('/onboarding');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [familyProfile, router]);

  // Logging Form State
  const [activeTab, setActiveTab] = useState<EmissionCategory>('transport');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Transport Form
  const [transportType, setTransportType] = useState('car_petrol');
  const [distanceKm, setDistanceKm] = useState('');
  const [isSchoolRun, setIsSchoolRun] = useState(false);

  // Energy Form
  const [energyType, setEnergyType] = useState('ac');
  const [energyValue, setEnergyValue] = useState('');

  // Set default member on load
  useEffect(() => {
    if (user && !selectedMemberId) {
      const currentMember = members.find(m => m.name === user.displayName);
      if (currentMember) {
        setSelectedMemberId(currentMember.id);
      } else if (members.length > 0) {
        setSelectedMemberId(members[0].id);
      }
    }
  }, [user, members, selectedMemberId]);

  if (!familyProfile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Loading family space...</p>
        </div>
      </div>
    );
  }

  const handleTransportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!distanceKm || parseFloat(distanceKm) <= 0 || !selectedMemberId) return;

    // Build subType: if car, fetch from selection
    addLog({
      memberId: selectedMemberId,
      category: 'transport',
      subType: transportType,
      value: parseFloat(distanceKm),
      unit: 'km',
      date: logDate
    });

    // Reset fields
    setDistanceKm('');
    setIsSchoolRun(false);
  };

  const handleEnergySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!energyValue || parseFloat(energyValue) <= 0 || !selectedMemberId) return;

    let unit = 'hours';
    if (energyType === 'electricity_kwh') unit = 'kWh';
    if (energyType === 'electricity_cost') unit = '₹';
    if (energyType === 'lpg') unit = 'cylinders';

    addLog({
      memberId: selectedMemberId,
      category: 'energy',
      subType: energyType,
      value: parseFloat(energyValue),
      unit,
      date: logDate
    });

    // Reset fields
    setEnergyValue('');
  };

  // Quick log helper - copies the last trip logged by the active member
  const handleQuickLogLastTrip = () => {
    if (!selectedMemberId) return;
    const userLogs = emissionLogs.filter(l => l.memberId === selectedMemberId && l.category === 'transport');
    if (userLogs.length > 0) {
      const lastTrip = userLogs[0];
      addLog({
        memberId: selectedMemberId,
        category: 'transport',
        subType: lastTrip.subType,
        value: lastTrip.value,
        unit: 'km',
        date: new Date().toISOString().split('T')[0]
      });
    } else {
      alert("No previous transport log found for the selected member.");
    }
  };

  const currentMember = members.find(m => m.id === selectedMemberId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border border-emerald-900/50 bg-forest-green rounded-xl p-6 shadow-xs text-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#ebdcb9]">
            Welcome back, {familyProfile.name}!
          </h1>
          <p className="text-sm text-emerald-200/80 mt-1">
            Track and nurture your family forest. Currently simulating as <span className="font-semibold text-[#ebdcb9]">{user?.displayName || 'Guest'}</span>.
          </p>
        </div>
        {actualReductionPercent > 0 && (
          <div className="mt-4 md:mt-0 flex items-center gap-3 bg-emerald-950/50 text-emerald-200 border border-emerald-800/60 px-4 py-3 rounded-lg">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">On Track</p>
              <p className="text-sm font-semibold text-[#ebdcb9]">{actualReductionPercent.toFixed(1)}% below baseline</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Span 2): Forest & History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Forest Display */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-ink-deep">Our Family Forest</h2>
              <span className="text-xs text-slate-500 font-medium">Trees Planted: {1 + badges.length}</span>
            </div>
            <ForestSvg 
              reductionPercent={actualReductionPercent} 
              badges={badges} 
            />
          </div>

          {/* Activity Log History */}
          <div className="notion-card space-y-4">
            <div className="flex items-center gap-2 border-b border-hairline-soft pb-3">
              <History className="w-5 h-5 text-slate" />
              <h2 className="text-base font-bold text-ink-deep">Recent Logs</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-hairline text-slate text-xs font-semibold uppercase">
                    <th className="py-2">Date</th>
                    <th className="py-2">Member</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Type</th>
                    <th className="py-2 text-right">Value</th>
                    <th className="py-2 text-right">CO₂ Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-soft">
                  {emissionLogs.slice(0, 7).map((log) => {
                    const memberName = members.find(m => m.id === log.memberId)?.name || 'Unknown';
                    const icon = log.category === 'transport' ? '🚗' : '🔌';
                    const typeLabel = log.subType.replace('_', ' ').replace('kwh', 'kWh');
                    
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-mono text-xs">{log.date}</td>
                        <td className="py-3 font-medium text-charcoal">{memberName}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.category === 'transport' 
                              ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {icon} {log.category}
                          </span>
                        </td>
                        <td className="py-3 capitalize text-slate">{typeLabel}</td>
                        <td className="py-3 text-right font-medium">{log.value} {log.unit}</td>
                        <td className="py-3 text-right font-semibold text-rose-600">+{log.co2Kg.toFixed(2)} kg</td>
                      </tr>
                    );
                  })}
                  {emissionLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No activity logs submitted yet. Log a trip or utility bill below!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Span 1): Stats & Log Form */}
        <div className="space-y-8">
          {/* Stats & Equivalents */}
          <DashboardStats />

          {/* Activity Logger */}
          <div className="notion-card space-y-4">
            <h3 className="text-base font-bold text-ink-deep flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              <span>Log Household Activity</span>
            </h3>

            {/* Member selector for the log */}
            <div>
              <label htmlFor="member-select" className="block text-xs font-semibold text-slate mb-1">Logging For</label>
              <select
                id="member-select"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="notion-input w-full bg-white text-sm"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>

            {/* Date selector */}
            <div>
              <label htmlFor="log-date" className="block text-xs font-semibold text-slate mb-1">Date</label>
              <input
                id="log-date"
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="notion-input w-full bg-white text-sm"
              />
            </div>

            {/* Category tabs */}
            <div className="flex border-b border-hairline">
              <button
                type="button"
                onClick={() => setActiveTab('transport')}
                className={`flex-1 pb-2 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'transport'
                    ? 'border-primary text-primary-deep'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🚗 Transport
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('energy')}
                className={`flex-1 pb-2 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'energy'
                    ? 'border-primary text-primary-deep'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🔌 Energy
              </button>
            </div>

            {/* Transport Form */}
            {activeTab === 'transport' && (
              <form onSubmit={handleTransportSubmit} className="space-y-4 pt-2">
                <div>
                  <label htmlFor="transport-type" className="block text-xs font-semibold text-slate mb-1">Transport Mode</label>
                  <select
                    id="transport-type"
                    value={transportType}
                    onChange={(e) => setTransportType(e.target.value)}
                    className="notion-input w-full bg-white text-sm"
                  >
                    <option value="car_petrol">Petrol Car</option>
                    <option value="car_diesel">Diesel Car</option>
                    <option value="car_cng">CNG Car</option>
                    <option value="car_ev">Electric Vehicle (EV)</option>
                    <option value="school_bus">School Bus</option>
                    <option value="auto_rickshaw">CNG Auto-rickshaw</option>
                    <option value="metro_train">Metro / Local Train</option>
                    <option value="walk">Walk / Cycle</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="distance-input" className="block text-xs font-semibold text-slate mb-1">Distance (km)</label>
                  <input
                    id="distance-input"
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="Enter distance in km"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="notion-input w-full text-sm"
                    required
                  />
                </div>

                {/* Quick Log button for recurring commute */}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="notion-btn-primary flex-1 text-sm font-semibold"
                  >
                    Log Trip
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickLogLastTrip}
                    title="Logs same distance/vehicle as this member's previous trip"
                    className="notion-btn-secondary text-xs font-semibold flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" /> Quick Log
                  </button>
                </div>
              </form>
            )}

            {/* Energy Form */}
            {activeTab === 'energy' && (
              <form onSubmit={handleEnergySubmit} className="space-y-4 pt-2">
                <div>
                  <label htmlFor="energy-type" className="block text-xs font-semibold text-slate mb-1">Utility Type</label>
                  <select
                    id="energy-type"
                    value={energyType}
                    onChange={(e) => setEnergyType(e.target.value)}
                    className="notion-input w-full bg-white text-sm"
                  >
                    <option value="ac">Air Conditioning (Hours)</option>
                    <option value="electricity_kwh">Electricity Usage (kWh)</option>
                    <option value="electricity_cost">Electricity Bill (₹)</option>
                    <option value="lpg">LPG Cylinder (Refills)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="energy-value" className="block text-xs font-semibold text-slate mb-1">
                    Amount ({energyType === 'ac' ? 'Hours' : energyType === 'electricity_kwh' ? 'kWh' : energyType === 'electricity_cost' ? 'Rupees (₹)' : 'Cylinders'})
                  </label>
                  <input
                    id="energy-value"
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder={`Enter amount`}
                    value={energyValue}
                    onChange={(e) => setEnergyValue(e.target.value)}
                    className="notion-input w-full text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="notion-btn-primary w-full text-sm font-semibold"
                >
                  Log Energy Use
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
