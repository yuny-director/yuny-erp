// 🚨 사장님의 구글 웹 앱 URL 주소를 여기에 딱 한 번만 적어주세요!
var GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbygfaWtG8ZaeibT2_4f6NtevfYJaSDb3H7jdOagWyFUVeseN--OdtqEtgfmFOfop-py/exec";

// 🔐 [최종 보정] 작업자와 관리자가 주소를 이동할 때 서로 간섭하지 않도록 경로 검증 조건 완화
function checkPageAuth(requiredRole) {
    var role = sessionStorage.getItem('erp_role');
    var username = sessionStorage.getItem('erp_username');
    
    // 1. 아예 로그인을 안 하고 주소창으로 몰래 들어온 경우 최상위 로그인창으로 강제 퇴출
    if (!role || !username) {
        alert("로그인이 필요한 페이지입니다. 로그인 화면으로 이동합니다.");
        location.href = location.pathname.indexOf('uni-work') > -1 ? "../index.html" : "./index.html";
        return null;
    }
    
    // 2. 권한 등급이 맞지 않는 경우에만 강제 주소 교정 수행
    if (requiredRole && role !== requiredRole) {
        alert(`[보안 안내] ${username}님은 ${role === 'admin' ? '관리자' : '작업자'} 전용 화면으로 자동 이동합니다.`);
        
        if (role === 'admin') {
            location.href = location.pathname.indexOf('uni-work') > -1 ? "./admin-total.html" : "uni-work/admin-total.html";
        } else {
            location.href = location.pathname.indexOf('uni-work') > -1 ? "./worker-input.html" : "uni-work/worker-input.html";
        }
        return null;
    }
    
    return { role: role, username: username };
}
