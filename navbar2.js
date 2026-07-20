// 🚨 YUNY_ERP 마스터 네비게이션 및 계정 제어 모듈
(function() {
    function initNavbar() {
        var navbarContainer = document.getElementById('global-navbar');
        if (!navbarContainer) return;

        var navHtml = `
        <style>
            .custom-navbar { background-color: #2c3e50; color: white; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; height: 50px; font-family: Arial, sans-serif; font-size: 14px; }
            .custom-navbar a { color: #ecf0f1; text-decoration: none; margin-right: 15px; font-weight: bold; transition: color 0.2s; }
            .custom-navbar a:hover { color: #1abc9c; }
            .navbar-brand { font-size: 16px; font-weight: bold; color: #1abc9c !important; }
            .navbar-user-info { display: flex; align-items: center; gap: 12px; }
            .btn-nav-action { background-color: #34495e; border: 1px solid #7f8c8d; color: white; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; }
            .btn-nav-action:hover { background-color: #415b76; color: #1abc9c; }
            
            /* 계정 관리 모달 정밀 정렬 CSS */
            .account-modal-body { display: flex; flex-direction: column; gap: 15px; }
            .account-input-bar { display: flex; align-items: flex-end; gap: 10px; width: 100%; box-sizing: border-box; background: #f8f9fa; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef; }
            .account-field-box { display: flex; flex-direction: column; flex: 1; min-width: 0; }
            .account-field-box label { font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #495057; text-align: left; }
            .account-field-box input, .account-field-box select { height: 36px; padding: 0 8px; border: 1px solid #ced4da; border-radius: 4px; font-size: 13px; width: 100%; box-sizing: border-box; background: #fff; }
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
                <span id="navbar-user-name">관리자님 접속중</span>
                <button class="btn-nav-action" onclick="window.openAccountManagerModal()">⚙️ 계정 권한 설정</button>
                <button class="btn-nav-action" onclick="window.logoutSystem()">로그아웃</button>
            </div>
        </div>

        <div id="accountModal" class="modal" style="display:none; position:fixed; z-index:100; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.4); align-items:center; justify-content:center;">
            <div class="modal-content" style="background:#fff; padding:25px; border-radius:8px; width:90%; max-width:550px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin:0; color: #2c3e50;">🥷 [통합 계정 관리] 작업자 ID/PW 및 권한 등급 제어</h3>
                    <span style="cursor:pointer; font-size:20px; font-weight:bold; color:#aaa;" onclick="window.closeAccountManagerModal()">&times;</span>
                </div>
                
                <div class="account-modal-body">
                    <form id="accountForm" onsubmit="return false;" autocomplete="off">
                        <div class="account-input-bar">
                            <div class="account-field-box">
                                <label for="accInputId">ID</label>
                                <input type="text" id="accInputId" name="acc_user_id" placeholder="아이디 입력" autocomplete="off">
                            </div>
                            <div class="account-field-box">
                                <label for="accInputPw">비밀번호</label>
                                <input type="password" id="accInputPw" name="acc_user_pw" placeholder="비밀번호" autocomplete="new-password">
                            </div>
                            <div class="account-field-box">
                                <label for="accInputRole">권한 등급</label>
                                <select id="accInputRole">
                                    <option value="worker">worker</option>
                                    <option value="admin">admin</option>
                                </select>
                            </div>
                            <button type="button" class="btn btn-dark-verify" style="height:36px; padding:0 14px; margin-bottom:0; flex-shrink:0; background:#2c3e50; color:#fff; border:none; border-radius:4px; font-weight:bold; cursor:pointer;" onclick="window.saveAccountItem()">저장/등록</button>
                        </div>
                    </form>

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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
})();

window.openAccountManagerModal = function() {
    window.renderAccountTable();
    var modal = document.getElementById('accountModal');
    if (modal) modal.style.display = 'flex';
};

window.closeAccountManagerModal = function() {
    var modal = document.getElementById('accountModal');
    if (modal) modal.style.display = 'none';
};

window.renderAccountTable = function() {
    var tbody = document.getElementById('accountTableBody');
    if (!tbody) return;
    tbody.innerHTML = "";
    
    var currentUsers = typeof window.userList !== "undefined" ? window.userList : [];
    currentUsers.forEach(function(u, idx) {
        var tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight:bold;">${u.id}</td>
            <td>••••</td>
            <td style="color:${u.role === 'admin' ? '#2980b9' : '#27ae60'}; font-weight:bold;">${u.role}</td>
            <td>
                <button class="btn btn-gray" style="height:26px; padding:0 6px; font-size:11px; background:#7f8c8d; color:#fff; border:none; border-radius:3px; cursor:pointer;" onclick="window.resetAccountPw(${idx})">비번초기화</button>
                <button class="btn btn-danger" style="height:26px; padding:0 6px; font-size:11px; background:#e74c3c; color:#fff; border:none; border-radius:3px; cursor:pointer;" onclick="window.deleteAccountItem(${idx})">삭제</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.saveAccountItem = function() {
    var idInput = document.getElementById('accInputId');
    var pwInput = document.getElementById('accInputPw');
    var roleInput = document.getElementById('accInputRole');
    
    var id = idInput ? idInput.value.trim() : "";
    var pw = pwInput ? pwInput.value.trim() : "";
    var role = roleInput ? roleInput.value : "worker";
    
    if (!id || !pw) {
        alert("ID와 비밀번호를 모두 입력해 주세요!");
        return;
    }
    
    if (typeof window.userList === "undefined") window.userList = [];
    var existingIdx = window.userList.findIndex(function(u) { return u.id === id; });
    
    if (existingIdx > -1) {
        window.userList[existingIdx] = { id: id, pw: pw, role: role };
    } else {
        window.userList.push({ id: id, pw: pw, role: role });
    }
    
    if (idInput) idInput.value = "";
    if (pwInput) pwInput.value = "";
    window.renderAccountTable();
    window.syncAccountDataWithGoogle();
};

window.resetAccountPw = function(idx) {
    if (typeof window.userList === "undefined" || !window.userList[idx]) return;
    var newPw = prompt(`[${window.userList[idx].id}] 계정의 새 비밀번호를 입력하세요:`, "1234");
    if (newPw) {
        window.userList[idx].pw = newPw.trim();
        window.renderAccountTable();
        window.syncAccountDataWithGoogle();
    }
};

window.deleteAccountItem = function(idx) {
    if (typeof window.userList === "undefined" || !window.userList[idx]) return;
    if (confirm(`[${window.userList[idx].id}] 계정을 삭제하시겠습니까?`)) {
        window.userList.splice(idx, 1);
        window.renderAccountTable();
        window.syncAccountDataWithGoogle();
    }
};

window.syncAccountDataWithGoogle = function() {
    if (typeof window.GOOGLE_SCRIPT_URL === "undefined") return;
    var payload = { action: "syncUsers", userList: window.userList };
    fetch(window.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
    })
    .then(function(res) { return res.json(); })
    .then(function() {
        alert("계정원장이 성공적으로 동기화되었습니다.");
    });
};

window.logoutSystem = function() {
    localStorage.removeItem('login_user_name');
    localStorage.removeItem('login_user_role');
    alert("로그아웃 되었습니다.");
    window.location.href = "../index.html";
};