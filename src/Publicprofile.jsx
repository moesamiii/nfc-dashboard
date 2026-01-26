import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./supabase";

export default function PublicProfile() {
  const { cardId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    logScanAndLoadProfile();
  }, [cardId]);

  const logScanAndLoadProfile = async () => {
    if (!cardId) {
      setError("Invalid card ID");
      setLoading(false);
      return;
    }

    try {
      const { data: cardData, error: cardError } = await supabase
        .from("cards")
        .select("id, user_id")
        .eq("card_code", cardId)
        .single();

      if (cardError) throw new Error("Card not found");

      const { error: scanError } = await supabase.from("scans").insert({
        card_id: cardData.id,
        scanned_at: new Date().toISOString(),
      });

      if (scanError) {
        console.error("Failed to log scan:", scanError);
      } else {
        console.log("Scan logged for card:", cardId);
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", cardData.user_id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">
            Card Not Found
          </h2>
          <p className="text-gray-400">{error || "This card does not exist"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Scan Successful</h1>
        <p className="text-gray-400 mb-6">Card: {cardId}</p>

        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            {profile.full_name || "User"}
          </h2>
          <p className="text-gray-400">{profile.email}</p>
        </div>

        <p className="text-sm text-gray-500">This scan has been logged</p>
      </div>
    </div>
  );
}
