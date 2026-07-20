// 🚨 [YUNY_ERP 마스터 보안 개정판] 전역 네비게이션 바 및 상단 제어 엔진
(function() {
    var navbarContainer = document.getElementById('global-navbar');
    if (!navbarContainer) return;

    var navHtml = `
    <style>
        .custom-navbar { background-color: #2c3e50; color: white; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; height: 50px; font-family: Arial, sans-serif; font-size: 14px; }
        .custom-navbar a { color: #ecf0f1; text-decoration: none; margin-right: 15px; font-weight: bold; transition: color 0.2s; }
        .custom-navbar a:hover { color: #1abc9c; }
        .navbar-brand { font-size: 16px; font-weight: bold; color: #1abc9c !important; }
        .navbar-user-info { display: flex; align-items: center; gap: 15px; }
        .btn-nav-action { background-color: #34495e; border: 1px solid #7f8c8d; color: white; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; }
        .btn-nav-action:hover { background-color: #415b76; color: #1abc9c; }
        
        /* 🔒 [통합 계정 관리 팝업 레이아웃 1:1 세로선 정렬 박스] */
        .account-modal-body { display: flex; flex-direction: column; gap: 15px; }
        .account-form-row { display: flex; align-items: flex-end; gap: 10px; width: 100%; box-sizing: border-box; }
        .account-field-item { display: flex; flex-direction: column; flex: 1; }
        .account-field-item label { font-size: 13px; font-weight: bold; margin-bottom: 6px; color: #333; text-align: left; }
        .account-field-item input, .account-field-item select { height: 36px; padding: 0 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; width: 100%; box-sizing: border-box; }
        .account-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .account-table th, .account-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        .account-table th { background-color: #f8f9fa; font-weight: bold; }
    </style>
    
    <div class="custom-navbar">
        <div>
            <a href="../uni-work/admin-total.html" class="navbar-brand">YUNY_ERP</a>
            <a href="../uni-work/admin-total.html">📊 정산 마스터 원장</a>
            <a href="../uni-work/admin-stock.html">📦 재고관리 원장</a>
            <a href="../worker-input.html">👷 작업자 전용 입력</a>
        </div>
        <div class="navbar-user-info">
            <span id="navbar-user-name">로그인 확인 중...</span>
            <button class="btn-nav-action" onclick="openAccountManagerModal()">⚙️ 통합 계정 관리</button>
            <button class="btn-nav-action" onclick="logoutSystem()">로그아웃</button>
        </div>
    </div>

    <!-- 🔒 통합 계정 관리 정밀 정렬 모달 팝업 -->
    <div id="accountModal" class="modal">
        <div class="modal-content" style="max-width: 550px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin:0; color: #2c3e50;">🥷 [통합 계정 관리] 작업자 ID/PW 및 권한 제어</h3>
                <span style="cursor:pointer; font-size:20px; font-weight:bold; color:#aaa;" onclick="closeAccountManagerModal()">&times;</span>
            </div>
            
            <div class="account-modal-body">
                <div class="account-form-row">
                    <div class="account-field-item">
                        <label>ID (사용자명)</label>
                        <input type="text" id="accInputId" placeholder="예: 이재호">
                    </div>
                    <div class="account-field-item">
                        <label>비밀번호</label>
                        <input type="text" id="accInputPw" placeholder="1234">
                    </div>
                    <div class="account-field-item">
                        <label>권한 등급</label>
                        <select id="accInputRole">
                            <option value="worker">worker (작업자)</option>
                            <option value="admin">admin (관리자)</option>
                        </select>
                    </div>
                    <button class="btn btn-dark-verify" style="height:36px; padding:0 12px; margin-bottom:0;" onclick="saveAccountItem()">저장/등록</button>
                </div>

                <div style="max-height: 250px; overflow-y: auto;">
                    <table class="account-table">
                        <thead>
                            <tr>
                                <th>등록된 ID</th>
                                <th>비밀번호</th>
                                <th>권한 등급</th>
                                <th>관리 기능</th>
                            </tr>
                        </thead>
                        <tbody id="accountTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    `;

    navbarContainer.innerHTML = navHtml;
})();

function openAccountManagerModal() {
    renderAccountTable();
    document.getElementById('accountModal').style.display = 'flex';
}

function closeAccountManagerModal() {
    document.getElementById('accountModal').style.display = 'none';
}

function renderAccountTable() {
    var tbody = document.getElementById('accountTableBody');
    if (!tbody) return;
    tbody.innerHTML = "";
    
    var currentUsers = typeof userList !== "undefined" ? userList : [];
    currentUsers.forEach(function(u, idx) {
        var tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight:bold;">${u.id}</td>
            <td>••••</td>
            <td style="color:${u.role === 'admin' ? '#2980b9' : '#27ae60'}; font-weight:bold;">${u.role}</td>
            <td>
                <button class="btn btn-gray" style="height:26px; padding:0 6px; font-size:11px;" onclick="resetAccountPw(${idx})">비번초기화</button>
                <button class="btn btn-danger" style="height:26px; padding:0 6px; font-size:11px;" onclick="deleteAccountItem(${idx})">삭제</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function saveAccountItem() {
    var idInput = document.getElementById('accInputId');
    var pwInput = document.getElementById('accInputPw');
    var roleInput = document.getElementById('accInputRole');
    
    var id = idInput.value.trim();
    var pw = pwInput.value.trim();
    var role = roleInput.value;
    
    if (!id || !pw) {
        alert("ID와 비밀번호를 모두 입력해 주세요!");
        return;
    }
    
    if (typeof userList === "undefined") userList = [];
    var existingIdx = userList.findIndex(function(u) { return u.id === id; });
    
    if (existingIdx > -1) {
        userList[existingIdx] = { id: id, pw: pw, role: role };
    } else {
        userList.push({ id: id, pw: pw, role: role });
    }
    
    idInput.value = "";
    pwInput.value = "";
    renderAccountTable();
    syncAccountDataWithGoogle();
}

function resetAccountPw(idx) {
    if (typeof userList === "undefined" || !userList[idx]) return;
    var newPw = prompt(`[${userList[idx].id}] 계정의 새 비밀번호를 입력하세요:`, "1234");
    if (newPw) {
        userList[idx].pw = newPw.trim();
        renderAccountTable();
        syncAccountDataWithGoogle();
    }
}

function deleteAccountItem(idx) {
    if (typeof userList === "undefined" || !userList[idx]) return;
    if (confirm(`[${userList[idx].id}] 계정을 정품 삭제하시겠습니까?`)) {
        userList.splice(idx, 1);
        renderAccountTable();
        syncAccountDataWithGoogle();
    }
}

function syncAccountDataWithGoogle() {
    if (typeof GOOGLE_SCRIPT_URL === "undefined") return;
    var payload = { action: "syncUsers", userList: userList };
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(() => {
        alert("계정원장이 구글 서버에 성공적으로 반영되었습니다.");
    });
}

function logoutSystem() {
    localStorage.removeItem('login_user_name');
    localStorage.removeItem('login_user_role');
    alert("로그아웃 되었습니다.");
    window.location.href = "../index.html";
}