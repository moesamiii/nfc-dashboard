import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [card, setCard] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold">NFC Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl text-gray-400 mb-2">Welcome back!</h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        {!card ? (
          // No Card Assigned
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">No Card Assigned</h3>
            <p className="text-gray-400">
              You need to have a card assigned to see scan statistics.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Ask the admin to assign an NFC card to your account.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Card Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Your Card</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Card Code:</span>
                  <span className="font-mono font-semibold">
                    {card.card_code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Card URL:</span>
                  <span className="text-sm text-gray-500 break-all">
                    {window.location.origin}/card/{card.card_code}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/card/${card.card_code}`;
                  navigator.clipboard.writeText(url);
                  alert("Card URL copied to clipboard!");
                }}
                className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Copy Card URL
              </button>
            </div>

            {/* Scan Count */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-lg p-12 text-center">
              <p className="text-gray-300 text-lg mb-4">Total Scans</p>
              <div className="text-8xl font-bold mb-4">{scanCount}</div>
              <p className="text-gray-400">
                {scanCount === 0
                  ? "Share your card to start tracking scans"
                  : scanCount === 1
                    ? "Your card has been scanned once"
                    : `Your card has been scanned ${scanCount} times`}
              </p>
              <button
                onClick={loadUserData}
                className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">How it works</h3>
              <ol className="space-y-2 text-gray-400 list-decimal list-inside">
                <li>Share your card URL</li>
                <li>Each visit logs a scan</li>
                <li>Dashboard updates in real time</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
