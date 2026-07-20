// 🚨 YUNY_ERP 전역 네비게이션바 모듈 (웹버전 캐시 및 CSS 우선순위 무력화 최상단 강제 고정판)
(function() {
    function initNavbar() {
        var navbarContainer = document.getElementById('global-navbar');
        if (!navbarContainer) return;

        var currentPath = window.location.pathname;

        var isDashboard = currentPath.indexOf('dashboard') > -1;
        var isAds = currentPath.indexOf('ads') > -1;
        var isCost = currentPath.indexOf('cost') > -1;
        var isSales = currentPath.indexOf('sales') > -1;
        var isMargin = currentPath.indexOf('margin') > -1;
        var isTotal = currentPath.indexOf('admin-total') > -1;
        var isStock = currentPath.indexOf('admin-stock') > -1;

        var navHtml = `
        <style>
            /* 📌 웹버전 강제 최상단 fixed 고정 */
            .custom-navbar { 
                position: fixed !important; 
                top: 0 !important; 
                left: 0 !important;
                right: 0 !important;
                width: 100% !important;
                z-index: 999999 !important; 
                background-color: #2c3e50 !important; 
                color: white !important; 
                display: flex !important; 
                justify-content: space-between !important; 
                align-items: center !important; 
                padding: 0 15px !important; 
                height: 50px !important; 
                font-family: Arial, sans-serif !important; 
                font-size: 13px !important; 
                box-sizing: border-box !important; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.25) !important;
            }
            
            /* 📌 fixed 고정 시 본문 내용이 네비바 뒤로 파묻히지 않도록 높이 공간 확보 */
            .navbar-spacer {
                height: 50px !important;
                width: 100% !important;
                display: block !important;
                clear: both !important;
            }

            .custom-navbar-left { display: flex; align-items: center; gap: 6px; flex-wrap: nowrap; overflow-x: auto; }
            .custom-navbar a { color: #ecf0f1; text-decoration: none; padding: 6px 10px; border-radius: 4px; font-weight: bold; white-space: nowrap; transition: background 0.2s, color 0.2s; display: inline-flex; align-items: center; gap: 4px; }
            .custom-navbar a:hover { background-color: #34495e; color: #1abc9c; }
            .navbar-brand { font-size: 16px; font-weight: bold; color: #1abc9c !important; margin-right: 8px; }
            .custom-navbar a.active-menu { background-color: #1abc9c !important; color: #ffffff !important; }
            
            .navbar-user-info { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
            .navbar-user-name-text { font-size: 13px; font-weight: bold; color: #ffffff; margin-right: 4px; }
            .btn-nav-action { background-color: #34495e; border: 1px solid #7f8c8d; color: white; padding: 5px 9px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; white-space: nowrap; transition: background 0.2s; }
            .btn-nav-action:hover { background-color: #415b76; color: #1abc9c; }
            .btn-nav-orange { background-color: #e67e22; border: none; }
            .btn-nav-orange:hover { background-color: #d35400; color: white; }
            .btn-nav-red { background-color: #e74c3c; border: none; }
            .btn-nav-red:hover { background-color: #c0392b; color: white; }

            .account-modal-overlay { display: none; position: fixed; z-index: 1000000; left: 0; top: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.55); align-items: center; justify-content: center; }
            .account-modal-card { background-color: #ffffff; padding: 25px; border-radius: 10px; width: 90%; max-width: 580px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); box-sizing: border-box; }
            .account-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #2c3e50; }
            .account-modal-header h3 { margin: 0; font-size: 17px; color: #2c3e50; font-weight: bold; }
            .account-modal-close { cursor: pointer; font-size: 22px; font-weight: bold; color: #888; transition: color 0.2s; }
            .account-modal-close:hover { color: #e74c3c; }

            .account-input-bar { display: flex; align-items: flex-end; gap: 10px; width: 100%; box-sizing: border-box; background: #f8f9fa; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef; margin-bottom: 15px; }
            .account-field-box { display: flex; flex-direction: column; flex: 1; min-width: 0; }
            .account-field-box label { font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #495057; text-align: left; }
            .account-field-box input, .account-field-box select { height: 36px; padding: 0 8px; border: 1px solid #ced4da; border-radius: 4px; font-size: 13px; width: 100%; box-sizing: border-box; background: #fff; }
            .account-table { width: 100%; border-collapse: collapse; font-size: 13px; }
            .account-table th, .account-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            .account-table th { background-color: #f8f9fa; font-weight: bold; }
        </style>
        
        <div class="custom-navbar">
            <div class="custom-navbar-left">
                <a href="../dashboard/dashboard.html" class="navbar-brand">YUNY_ERP</a>
                <a href="../dashboard/dashboard.html" class="${isDashboard ? 'active-menu' : ''}">📊 대시보드</a>
                <a href="../ads/ads.html" class="${isAds ? 'active-menu' : ''}">📢 광고관리</a>
                <a href="../cost/cost.html" class="${isCost ? 'active-menu' : ''}">📉 원가관리</a>
                <a href="../sales/sales.html" class="${isSales ? 'active-menu' : ''}">💰 매출관리</a>
                <a href="../margin/margin.html" class="${isMargin ? 'active-menu' : ''}">📝 마진관리</a>
                <a href="../uni-work/admin-total.html" class="${isTotal ? 'active-menu' : ''}">🛠️ 유니워크(정산표)</a>
                <a href="../uni-work/admin-stock.html" class="${isStock ? 'active-menu' : ''}">📦 유니워크(재고표)</a>
            </div>
            <div class="navbar-user-info">
                <span class="navbar-user-name-text" id="navbar-user-name">관리자님 접속중</span>
                <button class="btn-nav-action" onclick="window.openAccountManagerModal()">⚙️ 계정 권한 설정</button>
                <button class="btn-nav-action btn-nav-orange" onclick="window.resetMyPassword()">🔑 비번 변경</button>
                <button class="btn-nav-action btn-nav-red" onclick="window.logoutSystem()">로그아웃</button>
            </div>
        </div>
        <div class="navbar-spacer"></div>

        <div id="accountModal" class="account-modal-overlay">
            <div class="account-modal-card">
                <div class="account-modal-header">
                    <h3>🥷 [통합 계정 관리] 작업자 ID/PW 및 권한 등급 제어</h3>
                    <span class="account-modal-close" onclick="window.closeAccountManagerModal()">&times;</span>
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
                            <button type="button" class="btn-nav-action" style="height:36px; padding:0 14px; margin-bottom:0; flex-shrink:0; background:#2c3e50; color:#fff;" onclick="window.saveAccountItem()">저장/등록</button>
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
        window.updateNavbarUserDisplay();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
})();

window.updateNavbarUserDisplay = function() {
    var nameEl = document.getElementById('navbar-user-name');
    if (!nameEl) return;
    var activeName = localStorage.getItem('login_user_name') || localStorage.getItem('last_worker_name') || "관리자";
    nameEl.innerText = activeName + "님 접속중";
};

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
    
    var currentUsers = window.userList || (typeof userList !== "undefined" ? userList : []);
    
    if (!currentUsers || currentUsers.length === 0) {
        currentUsers = [
            { id: "admin", pw: "1234", role: "admin" },
            { id: "이재호", pw: "1234", role: "worker" }
        ];
        window.userList = currentUsers;
    }

    currentUsers.forEach(function(u, idx) {
        var tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight:bold;">${u.id}</td>
            <td>••••</td>
            <td style="color:${u.role === 'admin' ? '#2980b9' : '#27ae60'}; font-weight:bold;">${u.role}</td>
            <td>
                <button class="btn-nav-action" style="height:26px; padding:0 6px; font-size:11px; background:#7f8c8d;" onclick="window.resetAccountPw(${idx})">비번초기화</button>
                <button class="btn-nav-action btn-nav-red" style="height:26px; padding:0 6px; font-size:11px;" onclick="window.deleteAccountItem(${idx})">삭제</button>
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
    
    if (!window.userList) window.userList = [];
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
    var targetList = window.userList || userList;
    if (!targetList || !targetList[idx]) return;
    var newPw = prompt(`[${targetList[idx].id}] 계정의 새 비밀번호를 입력하세요:`, "1234");
    if (newPw) {
        targetList[idx].pw = newPw.trim();
        window.renderAccountTable();
        window.syncAccountDataWithGoogle();
    }
};

window.deleteAccountItem = function(idx) {
    var targetList = window.userList || userList;
    if (!targetList || !targetList[idx]) return;
    if (confirm(`[${targetList[idx].id}] 계정을 삭제하시겠습니까?`)) {
        targetList.splice(idx, 1);
        window.renderAccountTable();
        window.syncAccountDataWithGoogle();
    }
};

window.syncAccountDataWithGoogle = function() {
    var scriptUrl = window.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbyPWv070zApltQFMeq6HUxFAnnBcZfpAXHz5n_vwnmX34kCXqadFumI1BfmJRWu0OZE/exec";
    var targetList = window.userList || userList || [];
    var payload = { action: "syncUsers", userList: targetList };
    fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
    })
    .then(function(res) { return res.json(); })
    .then(function() {
        alert("계정원장이 성공적으로 동기화되었습니다.");
    });
};

window.resetMyPassword = function() {
    var activeName = localStorage.getItem('login_user_name') || "admin";
    var newPw = prompt(`[${activeName}] 계정의 변경할 새 비밀번호를 입력하세요:`);
    if (newPw) {
        if (!window.userList) window.userList = [];
        var found = window.userList.find(function(u) { return u.id === activeName; });
        if (found) {
            found.pw = newPw.trim();
        } else {
            window.userList.push({ id: activeName, pw: newPw.trim(), role: "admin" });
        }
        window.syncAccountDataWithGoogle();
    }
};

window.logoutSystem = function() {
    localStorage.removeItem('login_user_name');
    localStorage.removeItem('login_user_role');
    alert("로그아웃 되었습니다.");
    window.location.href = "../index.html";
};