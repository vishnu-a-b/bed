import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Award,
  Clock,
  Users,
} from "lucide-react";
import { Axios } from "@/utils/api/apiAuth";

interface PaymentStats {
  total: { amount: number; count: number; avgAmount: number };
  today: { amount: number; count: number };
  week: { amount: number; count: number };
  month: { amount: number; count: number };
  dateRanges: {
    today: { start: string; end: string };
    week: { start: string; end: string };
    month: { start: string; end: string };
  };
}

interface PaymentStatsComponentProps {
  onStatsLoad?: (stats: PaymentStats) => void;
}

const PaymentStatsComponent: React.FC<PaymentStatsComponentProps> = ({
  onStatsLoad,
}) => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock API call - replace with your actual API call
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await Axios.get("/generous-payments-ind/stats");
      const mockData = response.data.data;
    //   const mockData: PaymentStats = {
    //     total: { amount: 125480.5, count: 342, avgAmount: 366.9 },
    //     today: { amount: 2450.0, count: 8 },
    //     week: { amount: 12750.0, count: 35 },
    //     month: { amount: 38900.0, count: 124 },
    //     dateRanges: {
    //       today: {
    //         start: new Date().toISOString(),
    //         end: new Date().toISOString(),
    //       },
    //       week: {
    //         start: new Date().toISOString(),
    //         end: new Date().toISOString(),
    //       },
    //       month: {
    //         start: new Date().toISOString(),
    //         end: new Date().toISOString(),
    //       },
    //     },
    //   };
        console.log(response)
      setStats(mockData);
      onStatsLoad?.(mockData);
    } catch (err) {
      setError("Failed to load payment statistics");
      console.error("Error fetching payment stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({
    title,
    amount,
    count,
    icon: Icon,
    gradient,
    textColor = "text-white",
    subtitle = "",
  }: {
    title: string;
    amount: number;
    count: number;
    icon: any;
    gradient: string;
    textColor?: string;
    subtitle?: string;
  }) => (
    <div
      className={`${gradient} rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300 relative overflow-hidden`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 rounded-full bg-white/10"></div>
      <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-16 h-16 rounded-full bg-white/5"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-white/20 backdrop-blur-sm`}>
            <Icon className={`w-6 h-6 ${textColor}`} />
          </div>
          <div className="text-right">
            <p className={`text-sm ${textColor}/80 font-medium`}>{title}</p>
            {subtitle && (
              <p className={`text-xs ${textColor}/60`}>{subtitle}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className={`text-3xl font-bold ${textColor}`}>
            {formatCurrency(amount)}
          </h3>
          <div className="flex items-center space-x-2">
            <Users className={`w-4 h-4 ${textColor}/70`} />
            <p className={`text-sm ${textColor}/80`}>
              {count} payment{count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gray-200 animate-pulse rounded-xl h-40"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800">
              Error Loading Statistics
            </h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="mb-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Statistics
        </h2>
        <p className="text-gray-600">Overview of completed payments</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today"
          amount={stats.today.amount}
          count={stats.today.count}
          icon={Clock}
          gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700"
          subtitle={new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        />

        <StatCard
          title="This Week"
          amount={stats.week.amount}
          count={stats.week.count}
          icon={Calendar}
          gradient="bg-gradient-to-br from-green-500 via-green-600 to-green-700"
          subtitle="Last 7 days"
        />

        <StatCard
          title="This Month"
          amount={stats.month.amount}
          count={stats.month.count}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700"
          subtitle={new Date().toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        />

        <StatCard
          title="All Time"
          amount={stats.total.amount}
          count={stats.total.count}
          icon={Award}
          gradient="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700"
          subtitle={`Avg: ${formatCurrency(stats.total.avgAmount)}`}
        />
      </div>

      {/* Summary Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Payment Summary
              </h3>
              <p className="text-gray-600">
                {stats.total.count} total completed payments
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">Average Payment Amount</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.total.avgAmount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatsComponent;
