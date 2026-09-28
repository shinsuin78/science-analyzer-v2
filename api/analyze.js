export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }
    try {
        const { payload } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API 키 없음" });

        // 구글이 직접 안내한 최신 정식 모델명 (gemini-3.8-flash) 적용
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: "구글 API 거부", details: data });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "백엔드 서버 내부 오류", details: error.message });
    }
}
