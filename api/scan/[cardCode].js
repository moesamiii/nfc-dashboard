import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

export default async function handler(req, res) {
  const {
    query: { cardCode },
  } = req;

  if (!cardCode) {
    return res.status(400).json({ error: "Missing card code" });
  }

  try {
    // Get card
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("id")
      .eq("card_code", cardCode)
      .single();

    if (cardError || !card) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Insert scan
    await supabase.from("scans").insert({
      card_id: card.id,
      scanned_at: new Date().toISOString(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
