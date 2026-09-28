// Vercel Serverless Function 환경에서 동작하는 백엔드 API 라우트입니다.
// 브라우저(클라이언트)가 직접 구글 서버와 통신하지 못하게 하고, 이 서버를 거치도록 하여 API 키를 숨깁니다.

export default async function handler(req, res) {
    // 1. POST 요청만 허용
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    try {
        const { payload } = req.body;
        
        // 2. Vercel 환경 변수에서 안전하게 API 키 불러오기
        // (Vercel 대시보드에서 GEMINI_API_KEY 이름으로 등록한 값)
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("서버에 API 키가 설정되지 않았습니다.");
            return res.status(500).json({ error: "서버 설정 오류: API 키가 등록되지 않았습니다." });
        }

        // 3. 구글 Gemini API로 요청 전달 (프록시 역할)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // 4. 구글 API 오류 처리
        if (!response.ok) {
            const errorData = await response.json();
            
            if (response.status === 429) {
                return res.status(429).json({ error: "서버 API 요청 한도 초과", details: errorData });
            }
            if (response.status === 403) {
                return res.status(403).json({ error: "API 키 권한 오류", details: errorData });
            }
            return res.status(response.status).json({ error: "구글 API 응답 오류", details: errorData });
        }

        // 5. 성공적인 결과를 프론트엔드(HTML)로 그대로 반환
        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("백엔드 서버 내부 오류:", error);
        return res.status(500).json({ error: "백엔드 서버 내부 오류", details: error.message });
    }
}