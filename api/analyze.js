export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }
    try {
        const { payload } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API 키 없음 (Vercel 환경 변수를 확인해주세요)" });

        // 가장 안정적인 정식 모델명 적용
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();

        // 구글 API 자체가 에러를 반환한 경우 상세 내용 전달
        if (!response.ok) {
            return res.status(response.status).json({ error: "구글 API 거부", details: data });
        }

        // 응답 구조 안전 검증 (candidates가 없으면 구글 응답 원본 전체를 전달)
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            return res.status(500).json({ error: "구글 AI가 올바른 답장을 주지 않았습니다.", rawResponse: data });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "백엔드 서버 내부 오류", details: error.message });
    }
}
