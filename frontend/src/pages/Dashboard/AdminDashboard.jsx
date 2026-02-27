import { Users, GraduationCap, Building2, TrendingUp } from 'lucide-react';

export const AdminDashboard = () => {
    const stats = [];

    return (
        <div className="space-y-6">
            <div className="mb-8 hidden sm:block">
                <h2 className="text-2xl font-bold text-slate-800">Admin Command Center</h2>
                <p className="text-slate-500 text-sm mt-1">High-level overview of university metrics.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden border border-slate-100 border-l-4 border-l-primary">
                        <dt>
                            <div className="absolute bg-primary-50 rounded-md p-3">
                                <stat.icon className="h-6 w-6 text-primary" aria-hidden="true" strokeWidth={1.5} />
                            </div>
                            <p className="ml-16 text-sm font-medium text-slate-500 truncate">{stat.name}</p>
                        </dt>
                        <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                            <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                            <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                {stat.trend}
                            </p>
                        </dd>
                    </div>
                ))}
            </div>

            {/* Chart Mock */}
            <div className="mt-8 bg-white border border-slate-100 rounded-lg shadow-sm p-6 flex items-center justify-center h-64 text-slate-400">
                [ System Analytics Chart Area ]
            </div>
        </div>
    );
};
