import emailjs from '@emailjs/browser';

// 모의 피싱 시나리오 목록 (한국어)
export const simulationScenarios = [
  {
    id: 'tax_refund',
    title: '국세청 환급금 안내',
    sender_name: '국세청(NTS)',
    sender_email: 'admin@nts-go-kr.com', // 틀린 도메인 (정상은 nts.go.kr)
    subject: '[공지] 귀하의 미수령 환급금이 발생했습니다. 즉시 확인 바랍니다.',
    body: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: #003366;">미수령 환급금 지급 안내</h2>
        <p>안녕하세요, 국세청입니다.</p>
        <p>귀하에게 지급되지 않은 <b>환급금 458,200원</b>이 발견되었습니다.</p>
        <p>아래 링크를 통해 본인 인증 후 환급 신청을 완료해 주시기 바랍니다.</p>
        <p style="margin: 30px 0;">
          <a href="{{link}}" style="background: #003366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">환급금 신청하기</a>
        </p>
        <p style="color: #ff0000; font-size: 0.9em;">* 오늘 자정까지 신청하지 않을 경우 국고로 환수됩니다.</p>
      </div>
    `,
    explanation: '발신 주소가 공식 도메인(nts.go.kr)이 아니며, "오늘 자정까지"라는 문구로 긴급성을 조성하여 판단을 흐리게 합니다.'
  },
  {
    id: 'account_security',
    title: '네이버 계정 보안 경고',
    sender_name: '네어버 보안팀', // 오타 (네어버 vs 네이버)
    sender_email: 'security@navver.com', // 오타 (navver vs naver)
    subject: '[경고] 새로운 기기에서 로그인이 감지되었습니다.',
    body: `
      <div style="font-family: sans-serif; padding: 20px;">
        <img src="https://ssl.pstatic.net/static/pwe/address/img_main_logo.png" width="100" alt="NAVER">
        <h3 style="margin-top: 20px;">비정상적인 로그인이 감지되었습니다.</h3>
        <p>최근 귀하의 계정에 새로운 기기(Windows 10, 서울)에서 접속이 시도되었습니다.</p>
        <p>본인의 시도가 아니라면 아래 버튼을 눌러 계정을 즉시 보호하세요.</p>
        <div style="margin: 25px 0;">
          <a href="{{link}}" style="background: #19ce60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px;">계정 보호하기</a>
        </div>
        <p style="font-size: 0.8em; color: #888;">본 메일은 시스템 발신용 메일입니다.</p>
      </div>
    `,
    explanation: '발신자 이름과 도메인에 미세한 오타가 있습니다. 실제 네이버는 로그인 알림 시 정확한 정보를 제공하며, 링크 주소를 꼼꼼히 확인해야 합니다.'
  },
  {
    id: 'prize_win',
    title: '스타벅스 이벤트 당첨',
    sender_name: '스타벅스 코리아',
    sender_email: 'event@star-bucks.kr', // 틀린 도메인
    subject: '[축하] 스타벅스 럭키박스 당첨자로 선정되셨습니다!',
    body: `
      <div style="font-family: sans-serif; padding: 20px; background-color: #f7f7f7;">
        <div style="background: white; border: 1px solid #ddd; padding: 30px;">
          <h2 style="color: #006241;">Congratulations!</h2>
          <p>스타벅스 개점 기념 이벤트에 당첨되신 것을 진심으로 축하드립니다!</p>
          <p><b>경품: 5만원 상당의 럭키박스 (무료배송)</b></p>
          <p>아래 신청 양식을 작성하여 경품을 수령하세요.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="{{link}}" style="background: #006241; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-size: 1.1em;">경품 수령 주소 입력</a>
          </p>
          <p style="font-size: 0.9em;">* 이벤트 기간 내 미입력 시 당첨이 자동 취소됩니다.</p>
        </div>
      </div>
    `,
    explanation: '공식 이벤트가 아님에도 개인정보(주소, 전화번호 등)를 수집하기 위해 당첨을 빌미로 유혹합니다. 공식 앱이나 홈페이지에서 이벤트를 반드시 확인해야 합니다.'
  }
];

/**
 * EmailJS를 사용하여 실제 훈련 메일을 발송합니다
 */
export async function sendPhishingEmail(targetEmail, scenarioId) {
  const scenario = simulationScenarios.find(s => s.id === scenarioId);
  if (!scenario) throw new Error('시나리오를 찾을 수 없습니다.');

  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  if (!publicKey || !serviceId || !templateId) {
    throw new Error('EmailJS 설정이 완료되지 않았습니다. (.env 파일을 확인해주세요)');
  }

  // "Gotcha" 페이지로 연결되는 링크 생성
  const trainingLink = `${window.location.origin}/?id=${scenarioId}`;

  const templateParams = {
    to_email: targetEmail,
    subject: scenario.subject,
    message: scenario.body.replace('{{link}}', trainingLink)
  };

  try {
    const result = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    return { success: true, result };
  } catch (error) {
    console.error('EmailJS Error:', error);
    throw error;
  }
}
