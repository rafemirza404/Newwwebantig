"use client";

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { ArrowUpRight } from 'lucide-react';

const mockChartData = [
    { name: 'Jan', value: 2 },
    { name: 'Feb', value: 3 },
    { name: 'Mar', value: 5 },
    { name: 'Apr', value: 12 }, // The peak
    { name: 'May', value: 8 },
    { name: 'Jun', value: 4 },
    { name: 'Jul', value: 15 },
    { name: 'Aug', value: 10 },
    { name: 'Sep', value: 18 },
];

export function AgencyGrowthChart() {
    const [view, setView] = useState<'line' | 'bar'>('bar');

    return (
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6 h-full flex flex-col transition-colors relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4 w-full relative z-10">
                <div>
                    <p className="text-foreground text-[15px] tracking-wide font-medium">Active Clients</p>
                    <p className="text-foreground text-3xl font-bold mt-1.5 tracking-tight">18</p>

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setView('line')}
                            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${view === 'line' ? 'bg-secondary text-foreground' : 'text-muted-foreground border border-border/50 hover:bg-secondary/20'}`}
                        >
                            Line view
                        </button>
                        <button
                            onClick={() => setView('bar')}
                            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${view === 'bar' ? 'bg-secondary text-foreground' : 'text-muted-foreground border border-border/50 hover:bg-secondary/20'}`}
                        >
                            Bar view
                        </button>
                    </div>
                </div>

                {/* Actions removed */}
            </div>

            <div className="flex-1 w-full min-h-[200px] mt-6 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    {view === 'bar' ? (
                        <BarChart data={mockChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888888' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888888' }} tickFormatter={(val) => `${val}`} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
                                {mockChartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.value >= 15 ? '#4D88FF' : '#4D88FF40'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    ) : (
                        <AreaChart data={mockChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4D88FF" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#4D88FF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888888' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888888' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                            <Area type="monotone" dataKey="value" stroke="#4D88FF" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-border mt-auto w-full relative z-10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                    Vs Last month
                </span>
            </div>
        </div>
    );
}
