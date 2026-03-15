"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area
} from "recharts";
import { Activity, Users, UserX, LineChart as LineChartIcon, RefreshCw, Layers } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // States
  const [analytics, setAnalytics] = useState<any>(null);
  const [features, setFeatures] = useState<any>([]);

  // PRE-FILLED TO LOW RISK 
  const [formData, setFormData] = useState({
    Age: 50,
    Gender: "Female",
    Tenure: 36,
    Usage_Frequency: 3,
    Support_Calls: 2,
    Payment_Delay: 9,
    Subscription_Type: "Standard",
    Contract_Length: "Quarterly",
    Total_Spend: 501.0,
    Last_Interaction: 5
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, featuresRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"}/analytics`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"}/feature_importance`)
        ]);
        setAnalytics(analyticsRes.data);
        setFeatures(featuresRes.data);
      } catch(err) {
        console.error("Failed fetching backend data", err);
      }
    };
    fetchData();
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"}/predict`, formData);
      setPredictionResult(response.data);
    } catch (err: any) {
      alert("Prediction Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 border-box flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200 shadow-sm flex flex-col">
        <div className="p-6 border-b border-neutral-100 flex items-center gap-3">
          <Activity className="text-indigo-600 w-8 h-8" />
          <h1 className="font-bold text-xl tracking-tight">Churn<span className="text-indigo-600 ml-1">Predict</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {["dashboard", "prediction"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === tab ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {tab === "dashboard" && <LineChartIcon className="w-5 h-5"/>}
              {tab === "prediction" && <RefreshCw className="w-5 h-5"/>}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div className="space-y-8 max-w-7xl mx-auto">
            
            <header>
              <h2 className="text-3xl font-bold text-neutral-800 tracking-tight">Analytics & Insights</h2>
              <p className="text-neutral-500 mt-1">Comprehensive view of churn drivers across {analytics ? analytics.total_customers.toLocaleString() : '...'} historical profiles.</p>
            </header>

            {analytics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* KPI 1 */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl"><UserX className="w-8 h-8" /></div>
                    <div>
                      <p className="text-sm text-neutral-500 font-medium">Overall Churn Rate</p>
                      <h3 className="text-3xl font-bold">{(analytics.overall_churn_rate * 100).toFixed(1)}%</h3>
                    </div>
                  </div>

                  {/* KPI 2 */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl"><Users className="w-8 h-8" /></div>
                    <div>
                      <p className="text-sm text-neutral-500 font-medium">Total Active Profiles Analyzed</p>
                      <h3 className="text-3xl font-bold">{analytics.total_customers.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Support Calls vs Churn */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <h3 className="font-semibold text-lg mb-4 text-neutral-800">Support Calls vs Churn Rate</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.support_churn}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="calls" />
                          <YAxis tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                          <Tooltip formatter={(val: any) => `${(val * 100).toFixed(1)}%`} labelFormatter={(val) => `Support Calls: ${val}`} />
                          <Area type="monotone" dataKey="churn_rate" stroke="#4f46e5" fill="#c7d2fe" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2 text-center">Higher support calls exponentially increase historical probability of dropping the service.</p>
                  </div>

                  {/* Payment Delay vs Churn */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <h3 className="font-semibold text-lg mb-4 text-neutral-800">Payment Delay (Days) vs Churn Rate</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.payment_churn}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="delay" />
                          <YAxis tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                          <Tooltip formatter={(val: any) => `${(val * 100).toFixed(1)}%`} labelFormatter={(val) => `Days Delayed: ${val}`} />
                          <Line type="monotone" dataKey="churn_rate" stroke="#ef4444" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2 text-center">Spikes in payment delay continuously associate with 100% account failure.</p>
                  </div>

                  {/* Contract Churn */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <h3 className="font-semibold text-lg mb-4 text-neutral-800">Churn by Contract Type</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.contract_churn}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                          <XAxis dataKey="category" />
                          <YAxis tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                          <Tooltip formatter={(val: any) => `${(val * 100).toFixed(1)}%`} />
                          <Bar dataKey="churn_rate" fill="#10b981" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Feature Importance */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <h3 className="font-semibold text-lg mb-4 text-neutral-800">XGBoost ML Feature Importance</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={features} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} style={{fontSize: '12px'}} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8b5cf6" radius={[0,4,4,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>
        )}

        {/* Prediction Simulator */}
        {activeTab === "prediction" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <header>
              <h2 className="text-3xl font-bold text-neutral-800 tracking-tight">Risk Prediction Engine</h2>
              <p className="text-neutral-500 mt-1">Adjust individual customer attributes to simulate live risk using our ML pipeline.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <form onSubmit={handlePredict} className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 grid grid-cols-2 gap-6">
                
                {/* Inputs block */}
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-sm font-semibold text-neutral-600">Age</label>
                  <input type="number" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg" value={formData.Age} onChange={e => setFormData({...formData, Age: parseInt(e.target.value)})} />
                </div>
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-sm font-semibold text-neutral-600">Tenure (Months - CRITICAL)</label>
                  <input type="number" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg" value={formData.Tenure} onChange={e => setFormData({...formData, Tenure: parseInt(e.target.value)})} />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-sm font-semibold text-neutral-600">Support Calls</label>
                  <input type="number" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg" value={formData.Support_Calls} onChange={e => setFormData({...formData, Support_Calls: parseInt(e.target.value)})} />
                </div>
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-sm font-semibold text-neutral-600">Payment Delay (Days)</label>
                  <input type="number" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg" value={formData.Payment_Delay} onChange={e => setFormData({...formData, Payment_Delay: parseInt(e.target.value)})} />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-sm font-semibold text-neutral-600">Usage Frequency</label>
                  <input type="number" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg" value={formData.Usage_Frequency} onChange={e => setFormData({...formData, Usage_Frequency: parseInt(e.target.value)})} />
                </div>
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-sm font-semibold text-neutral-600">Total Spend ($)</label>
                  <input type="number" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg" value={formData.Total_Spend} onChange={e => setFormData({...formData, Total_Spend: parseFloat(e.target.value)})} />
                </div>
                
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-sm font-semibold text-neutral-600">Gender</label>
                  <select className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg" value={formData.Gender} onChange={e => setFormData({...formData, Gender: e.target.value})}>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-sm font-semibold text-neutral-600">Last Interaction (Days)</label>
                  <input type="number" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg" value={formData.Last_Interaction} onChange={e => setFormData({...formData, Last_Interaction: parseInt(e.target.value)})} />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-sm font-semibold text-neutral-600">Contract Length</label>
                  <select className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg" value={formData.Contract_Length} onChange={e => setFormData({...formData, Contract_Length: e.target.value})}>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-sm font-semibold text-neutral-600">Subscription Type</label>
                  <select className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg" value={formData.Subscription_Type} onChange={e => setFormData({...formData, Subscription_Type: e.target.value})}>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Basic">Basic</option>
                  </select>
                </div>

                <button disabled={isLoading} className="col-span-2 w-full py-4 mt-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 tracking-wide">
                  {isLoading ? "Running Inference..." : "Compute Live AI Prediction"}
                </button>
              </form>

              <div className="bg-neutral-800 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center">
                <h3 className="text-neutral-400 font-medium uppercase tracking-wider text-sm mb-4">Pipeline Result</h3>
                {predictionResult ? (
                  <div className="animate-in fade-in zoom-in duration-300">
                    <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 mb-6 ${
                      predictionResult.churn_probability > 0.6 ? "border-red-500 text-red-500" :
                      predictionResult.churn_probability > 0.3 ? "border-yellow-500 text-yellow-500" : "border-green-500 text-green-500"
                    }`}>
                      <span className="text-3xl font-extrabold">
                        {(predictionResult.churn_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{predictionResult.prediction}</h2>
                    <p className="text-neutral-300">
                      Risk level analyzed as <span className="text-white font-semibold">{predictionResult.risk_level}</span> given the {formData.Contract_Length} contract and {formData.Support_Calls} support calls on record.
                    </p>
                  </div>
                ) : (
                  <div className="text-neutral-500">
                    <RefreshCw className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Awaiting model input...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
