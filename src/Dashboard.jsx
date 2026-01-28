import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [card, setCard] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      // Get user's card (RLS-protected)
      const { data: cardData, error: cardError } = await supabase
        .from("cards")
        .select("*")
        .maybeSingle();

      if (cardError) {
        console.error(cardError);
      }

      if (cardData) {
        setCard(cardData);

        // Get scan count (RLS handles filtering)
        const { count, error: countError } = await supabase
          .from("scans")
          .select("*", { count: "exact", head: true });

        if (countError) {
          console.error(countError);
        }

        setScanCount(count || 0);

        // Get recent scans with timestamp
        const { data: scansData, error: scansError } = await supabase
          .from("scans")
          .select("scanned_at")
          .order("scanned_at", { ascending: false })
          .limit(5);

        if (!scansError && scansData) {
          setRecentScans(scansData);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const scanDate = new Date(timestamp);
    const diffMs = now - scanDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">📡</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                NFC Dashboard
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 border border-white/20"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Welcome back!</h2>
          <p className="text-purple-300">{user?.email}</p>
        </div>

        {!card ? (
          // No Card Assigned - Upgrade Prompt
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-center shadow-2xl">
              <div className="text-7xl mb-4">🎴</div>
              <h3 className="text-3xl font-bold mb-3">
                Get Your NFC Card Today!
              </h3>
              <p className="text-lg text-purple-100 mb-6 max-w-2xl mx-auto">
                Unlock the power of seamless networking. Share your profile with
                a simple tap. Track every interaction. Build meaningful
                connections.
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
              >
                Get Your Card Now 🚀
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-4xl mb-3">⚡</div>
                <h4 className="text-xl font-semibold mb-2">Instant Sharing</h4>
                <p className="text-gray-300">
                  One tap to share your complete profile. No apps required.
                </p>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-4xl mb-3">📊</div>
                <h4 className="text-xl font-semibold mb-2">
                  Real-Time Analytics
                </h4>
                <p className="text-gray-300">
                  Track every scan, monitor engagement, and measure your reach.
                </p>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-4xl mb-3">🌐</div>
                <h4 className="text-xl font-semibold mb-2">Always Updated</h4>
                <p className="text-gray-300">
                  Update your info once, and everyone with your card sees it
                  instantly.
                </p>
              </div>
            </div>

            {/* Why NFC Cards */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Why Choose NFC Cards?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <p className="text-gray-300">
                    <strong>Eco-Friendly:</strong> Eliminate paper business
                    cards forever
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <p className="text-gray-300">
                    <strong>Professional:</strong> Stand out at networking
                    events
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <p className="text-gray-300">
                    <strong>Trackable:</strong> Know exactly when and where
                    you're making connections
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <p className="text-gray-300">
                    <strong>Future-Proof:</strong> Update your information
                    anytime without reprinting
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Total Scans */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-purple-200">
                    Total Scans
                  </h4>
                  <span className="text-2xl">📊</span>
                </div>
                <div className="text-4xl font-bold mb-1">{scanCount}</div>
                <p className="text-sm text-purple-200">
                  {scanCount === 0
                    ? "Start sharing your card!"
                    : `+${scanCount} all time`}
                </p>
              </div>

              {/* Card Status */}
              <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-green-200">
                    Card Status
                  </h4>
                  <span className="text-2xl">✅</span>
                </div>
                <div className="text-2xl font-bold mb-1">Active</div>
                <p className="text-sm text-green-200">
                  Your card is live and ready
                </p>
              </div>

              {/* Recent Activity */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-blue-200">
                    Last Scan
                  </h4>
                  <span className="text-2xl">⏱️</span>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {recentScans.length > 0
                    ? formatTimeAgo(recentScans[0].scanned_at)
                    : "Never"}
                </div>
                <p className="text-sm text-blue-200">
                  {recentScans.length > 0 ? "Keep sharing!" : "Share your card"}
                </p>
              </div>
            </div>

            {/* Card Info & QR Code */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Your Card */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>🎴</span> Your NFC Card
                </h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
                    <p className="text-sm text-gray-400 mb-1">Card Code</p>
                    <p className="font-mono text-lg font-bold text-purple-300">
                      {card.card_code}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Card URL</p>
                    <div className="bg-white/5 rounded-lg p-3 text-sm break-all text-gray-300 border border-white/10">
                      {window.location.origin}/card/{card.card_code}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/card/${card.card_code}`;
                      navigator.clipboard.writeText(url);
                      alert("Card URL copied to clipboard!");
                    }}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all duration-200 font-semibold shadow-lg"
                  >
                    📋 Copy Card URL
                  </button>
                </div>
              </div>

              {/* Recent Scans */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>📈</span> Recent Activity
                </h3>
                {recentScans.length > 0 ? (
                  <div className="space-y-2">
                    {recentScans.map((scan, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center">
                            <span className="text-sm">📱</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Card Scanned</p>
                            <p className="text-xs text-gray-400">
                              {new Date(scan.scanned_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">
                          {formatTimeAgo(scan.scanned_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-3">🔍</div>
                    <p className="text-gray-400">No scans yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Share your card to see activity here
                    </p>
                  </div>
                )}
                <button
                  onClick={loadUserData}
                  className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 text-sm border border-white/10"
                >
                  🔄 Refresh Data
                </button>
              </div>
            </div>

            {/* How to Use */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>💡</span> How to Use Your NFC Card
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Tap to Share</h4>
                    <p className="text-sm text-gray-400">
                      Simply tap your card on any NFC-enabled phone
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Auto-Tracked</h4>
                    <p className="text-sm text-gray-400">
                      Each scan is automatically logged to your dashboard
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Monitor Growth</h4>
                    <p className="text-sm text-gray-400">
                      Watch your network expand in real-time
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade Prompt */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-6 shadow-xl border-2 border-amber-400/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">⭐</div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      Want More NFC Cards?
                    </h3>
                    <p className="text-amber-100">
                      Get additional cards for your team or different use cases
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-6 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-amber-50 transition-all duration-200 transform hover:scale-105 shadow-lg whitespace-nowrap"
                >
                  Order More Cards
                </button>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🎯</span> Pro Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <span className="text-2xl">📲</span>
                  <div>
                    <h4 className="font-semibold mb-1">Add to Phone Case</h4>
                    <p className="text-sm text-gray-400">
                      Keep your card in your phone case for instant access
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <h4 className="font-semibold mb-1">
                      Customize Your Profile
                    </h4>
                    <p className="text-sm text-gray-400">
                      Update your profile information to keep it fresh
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <h4 className="font-semibold mb-1">Use at Events</h4>
                    <p className="text-sm text-gray-400">
                      Perfect for conferences, meetups, and networking events
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">💼</span>
                  <div>
                    <h4 className="font-semibold mb-1">Business Impact</h4>
                    <p className="text-sm text-gray-400">
                      Track which events drive the most engagement
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-8 max-w-2xl w-full border border-purple-500/30 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎴</div>
              <h2 className="text-3xl font-bold mb-2">Get Your NFC Card</h2>
              <p className="text-purple-200">
                Transform the way you network with smart NFC technology
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Single Card</h4>
                  <span className="text-2xl font-bold text-purple-400">
                    $29
                  </span>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>✓ Premium NFC card</li>
                  <li>✓ Unlimited scans</li>
                  <li>✓ Real-time analytics</li>
                  <li>✓ Free shipping</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl p-4 border-2 border-purple-400">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">Team Pack (5 Cards)</h4>
                    <span className="text-xs text-purple-300">BEST VALUE</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-purple-400">
                      $119
                    </span>
                    <div className="text-xs text-gray-400 line-through">
                      $145
                    </div>
                  </div>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>✓ 5 premium NFC cards</li>
                  <li>✓ Save $26 (18% off)</li>
                  <li>✓ Perfect for teams</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 border border-white/20"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  alert("Contact sales@nfccard.com to order your cards!");
                  setShowUpgradeModal(false);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all duration-200 font-semibold shadow-lg"
              >
                Order Now 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
